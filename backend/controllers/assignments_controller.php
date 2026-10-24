<?php
/**
 * GET  /api/assignments
 * POST /api/assignments { title, subject, description, assignmentDate, dueDate? } (teacher only)
 */

function handle_assignments($method, $id) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET' && !$id) {
        if ($user['role'] === 'teacher') {
            $stmt = $pdo->prepare('SELECT a.*, u.name AS author FROM assignments a
                JOIN users u ON u.linked_id = a.teacher_id AND u.role = \'teacher\'
                WHERE a.teacher_id = ? ORDER BY a.assignment_date DESC, a.id DESC');
            $stmt->execute([$user['linked_id']]);
        } elseif ($user['role'] === 'parent') {
            $stmt = $pdo->prepare('SELECT DISTINCT a.*, t.name AS author FROM assignments a
                JOIN students s ON s.parent_id = ? AND s.grade = a.grade AND s.section = a.section
                JOIN teachers t ON t.id = a.teacher_id
                ORDER BY a.assignment_date DESC, a.id DESC');
            $stmt->execute([$user['linked_id']]);
        } else {
            json_error('Assignments are available to teachers and parents only.', 403);
        }
        json_response($stmt->fetchAll());
    }

    if ($method === 'POST') {
        if ($user['role'] !== 'teacher') json_error('Only teachers can post assignments.', 403);
        $body = get_json_body();
        foreach (['title', 'subject', 'description', 'assignmentDate'] as $field) {
            if (!isset($body[$field]) || trim((string) $body[$field]) === '') {
                json_error('Title, subject, instructions, and assignment date are required.');
            }
        }

        $assignmentDate = (string) $body['assignmentDate'];
        $dueDate = isset($body['dueDate']) && $body['dueDate'] !== '' ? (string) $body['dueDate'] : null;
        if (!valid_assignment_date($assignmentDate) || ($dueDate !== null && !valid_assignment_date($dueDate))) {
            json_error('Assignment and due dates must be valid dates.');
        }
        if ($dueDate !== null && $dueDate < $assignmentDate) {
            json_error('The due date cannot be before the assignment date.');
        }

        $stmt = $pdo->prepare('SELECT grade, section FROM teachers WHERE id = ?');
        $stmt->execute([$user['linked_id']]);
        $teacher = $stmt->fetch();
        if (!$teacher || !$teacher['grade'] || !$teacher['section']) {
            json_error('Your account does not have a class assigned.', 403);
        }

        $stmt = $pdo->prepare('INSERT INTO assignments
            (teacher_id, grade, section, title, subject, description, assignment_date, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $user['linked_id'], $teacher['grade'], $teacher['section'],
            trim((string) $body['title']), trim((string) $body['subject']),
            trim((string) $body['description']), $assignmentDate, $dueDate,
        ]);

        $stmt = $pdo->prepare('SELECT a.*, u.name AS author FROM assignments a
            JOIN users u ON u.linked_id = a.teacher_id AND u.role = \'teacher\'
            WHERE a.id = ?');
        $stmt->execute([$pdo->lastInsertId()]);
        json_response($stmt->fetch(), 201);
    }

    json_error('Method not allowed.', 405);
}

function valid_assignment_date($date) {
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $parts)) return false;
    return checkdate((int) $parts[2], (int) $parts[3], (int) $parts[1]);
}