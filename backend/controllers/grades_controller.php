<?php
/**
 * GET /api/grades                       → { S001: { math:[q1,q2,q3,q4], ... }, ... }
 * PUT /api/grades/{studentId}/{subject} { q1, q2, q3, q4 }
 * PUT /api/grades/bulk                  { S001: { math:[..], ... }, ... }
 */

function notify_parent_of_failing_grade($pdo, $studentId, $subject, $quarter, $score, $teacherName) {
    if ($score <= 0 || $score >= 75) return;

    $stmt = $pdo->prepare('SELECT s.name, s.parent_id, p.name AS parent_name
        FROM students s LEFT JOIN parents p ON p.id = s.parent_id WHERE s.id = ?');
    $stmt->execute([$studentId]);
    $student = $stmt->fetch();
    if (!$student || !$student['parent_id']) return;

    $subjectLabel = ucfirst($subject);
    $messageSubject = "Academic Alert: {$student['name']} - {$subjectLabel} ({$quarter})";
    $exists = $pdo->prepare('SELECT id FROM messages WHERE to_role = "parent" AND to_id = ? AND student_id = ? AND subject = ? LIMIT 1');
    $exists->execute([$student['parent_id'], $studentId, $messageSubject]);
    if ($exists->fetch()) return;

    $body = "This is an automated notification from TrackEd.\n\n"
        . "{$student['name']} received a score of {$score} in {$subjectLabel} for {$quarter}, "
        . "which is below the passing mark of 75.\n\n"
        . "Please coordinate with {$teacherName} to discuss how to support the student's progress.";

    $stmt = $pdo->prepare('INSERT INTO messages
        (from_role,from_id,from_name,to_role,to_id,subject,body,date,time,is_read,student_id,thread_id)
        VALUES ("system","system","TrackEd Alert","parent",?,?,?,?,?,0,?,NULL)');
    $stmt->execute([$student['parent_id'], $messageSubject, $body, date('Y-m-d'), date('h:i A'), $studentId]);
}

function handle_grades($method, $id, $sub) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET') {
        if ($user['role'] === 'teacher') {
            $stmt = $pdo->prepare('SELECT g.* FROM grades g JOIN students s ON s.id = g.student_id WHERE s.teacher_id = ?');
            $stmt->execute([$user['linked_id']]);
        } elseif ($user['role'] === 'parent') {
            $stmt = $pdo->prepare('SELECT g.* FROM grades g
                JOIN students s ON s.id = g.student_id
                WHERE s.parent_id = ?');
            $stmt->execute([$user['linked_id']]);
        } else {
            $stmt = $pdo->query('SELECT * FROM grades');
        }
        $out = [];
        foreach ($stmt->fetchAll() as $row) {
            $out[$row['student_id']][$row['subject']] = [(int)$row['q1'], (int)$row['q2'], (int)$row['q3'], (int)$row['q4']];
        }
        json_response($out);
    }

    if ($method === 'PUT' && $id === 'bulk') {
        if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') json_error('Not allowed.', 403);
        $body = get_json_body();
        $stmt = $pdo->prepare('INSERT INTO grades (student_id,subject,q1,q2,q3,q4) VALUES (?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE q1=VALUES(q1), q2=VALUES(q2), q3=VALUES(q3), q4=VALUES(q4)');
        foreach ($body as $studentId => $subjects) {
            if (!can_access_student($user, $studentId)) json_error('Not allowed.', 403);
            foreach ($subjects as $subject => $scores) {
                $scores = array_pad(array_values($scores), 4, 0);
                $stmt->execute([$studentId, $subject, $scores[0], $scores[1], $scores[2], $scores[3]]);
                foreach ($scores as $quarterIndex => $score) {
                    notify_parent_of_failing_grade($pdo, $studentId, $subject, 'Q' . ($quarterIndex + 1), (int)$score, $user['name']);
                }
            }
        }
        json_response(['message' => 'Grades saved.']);
    }

    if ($method === 'PUT' && $id && $sub) {
        if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') json_error('Not allowed.', 403);
        if (!can_access_student($user, $id)) json_error('Not allowed.', 403);
        $b = get_json_body();
        $q = [ (int)($b['q1'] ?? 0), (int)($b['q2'] ?? 0), (int)($b['q3'] ?? 0), (int)($b['q4'] ?? 0) ];
        $stmt = $pdo->prepare('INSERT INTO grades (student_id,subject,q1,q2,q3,q4) VALUES (?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE q1=VALUES(q1), q2=VALUES(q2), q3=VALUES(q3), q4=VALUES(q4)');
        $stmt->execute([$id, $sub, $q[0], $q[1], $q[2], $q[3]]);
        foreach ($q as $quarterIndex => $score) {
            notify_parent_of_failing_grade($pdo, $id, $sub, 'Q' . ($quarterIndex + 1), $score, $user['name']);
        }
        json_response(['message' => 'Grade updated.', 'student_id' => $id, 'subject' => $sub, 'scores' => $q]);
    }

    json_error('Method not allowed.', 405);
}
