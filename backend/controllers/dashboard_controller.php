<?php
/**
 * GET /api/dashboard — aggregate counts used by the dashboard cards.
 * Scoped by role: teacher sees own class only, admin sees the whole school.
 */

function handle_dashboard() {
    $user = require_auth();
    $pdo = get_db();

    if ($user['role'] === 'teacher') {
        $stmt = $pdo->prepare("SELECT COUNT(*) c FROM students WHERE teacher_id = ? AND status='active'");
        $stmt->execute([$user['linked_id']]);
        $studentCount = (int) $stmt->fetch()['c'];

        $stmt = $pdo->prepare('SELECT AVG((q1+q2+q3+q4)/4) avg_score FROM grades g JOIN students s ON s.id=g.student_id WHERE s.teacher_id = ?');
        $stmt->execute([$user['linked_id']]);
        $classAvg = round((float) ($stmt->fetch()['avg_score'] ?? 0));

        $stmt = $pdo->prepare('SELECT SUM(present) p, SUM(total) t FROM attendance a JOIN students s ON s.id=a.student_id WHERE s.teacher_id = ?');
        $stmt->execute([$user['linked_id']]);
        $att = $stmt->fetch();
        $attRate = $att['t'] > 0 ? round($att['p'] / $att['t'] * 100) : 0;

        $stmt = $pdo->prepare('SELECT COUNT(*) c FROM messages WHERE to_id = ? AND is_read = 0');
        $stmt->execute([$user['id']]);
        $unread = (int) $stmt->fetch()['c'];

        json_response([
            'students' => $studentCount, 'classAverage' => $classAvg,
            'attendanceRate' => $attRate, 'unreadMessages' => $unread,
        ]);
    }

    // admin / school-wide
    $totalStudents  = (int) $pdo->query("SELECT COUNT(*) c FROM students WHERE status='active'")->fetch()['c'];
    $totalTeachers  = (int) $pdo->query('SELECT COUNT(*) c FROM teachers')->fetch()['c'];
    $schoolAvg      = round((float) ($pdo->query('SELECT AVG((q1+q2+q3+q4)/4) a FROM grades')->fetch()['a'] ?? 0));
    $outstanding    = (int) $pdo->query('SELECT COUNT(*) c FROM (SELECT student_id, AVG((q1+q2+q3+q4)/4) a FROM grades GROUP BY student_id HAVING a >= 90) t')->fetch()['c'];

    json_response([
        'totalStudents' => $totalStudents, 'totalTeachers' => $totalTeachers,
        'schoolAverage' => $schoolAvg, 'outstanding' => $outstanding,
    ]);
}
