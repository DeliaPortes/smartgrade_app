<?php
/**
 * GET  /api/attendance                → per-student totals and date-keyed statuses
 * POST /api/attendance/mark  { date, records: { S001:'Present'|'Absent'|'Half-day'|'Tardy'|'Late', ... } }
 */

function handle_attendance($method, $id) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET') {
        if ($user['role'] === 'teacher') {
            $stmt = $pdo->prepare('SELECT a.* FROM attendance a JOIN students s ON s.id = a.student_id WHERE s.teacher_id = ?');
            $stmt->execute([$user['linked_id']]);
        } elseif ($user['role'] === 'parent') {
            $stmt = $pdo->prepare('SELECT a.* FROM attendance a
                JOIN students s ON s.id = a.student_id
                WHERE s.parent_id = ?');
            $stmt->execute([$user['linked_id']]);
        } else {
            $stmt = $pdo->query('SELECT * FROM attendance');
        }
        $out = [];
        foreach ($stmt->fetchAll() as $row) {
            $out[$row['student_id']] = [
                'present' => (int)$row['present'], 'absent' => (int)$row['absent'],
                'half_day' => (int)$row['half_day'], 'tardy' => (int)$row['tardy'],
                'late' => (int)$row['late'], 'total' => (int)$row['total'], 'days' => [],
            ];
        }
        if ($out) {
            $studentIds = array_keys($out);
            $placeholders = implode(',', array_fill(0, count($studentIds), '?'));
            $records = $pdo->prepare("SELECT student_id, attendance_date, status FROM attendance_records WHERE student_id IN ($placeholders)");
            $records->execute($studentIds);
            foreach ($records->fetchAll() as $record) {
                $out[$record['student_id']]['days'][$record['attendance_date']] = $record['status'];
            }
        }
        json_response($out);
    }

    if ($method === 'POST' && $id === 'mark') {
        if ($user['role'] !== 'teacher') json_error('Only teachers can mark attendance.', 403);
        $b = get_json_body();
        $records = $b['records'] ?? [];
        if (empty($records)) json_error('No attendance records provided.');
        $date = $b['date'] ?? date('Y-m-d');
        $parsedDate = DateTime::createFromFormat('!Y-m-d', $date);
        if (!$parsedDate || $parsedDate->format('Y-m-d') !== $date) json_error('A valid attendance date is required.');

        $allowedStatuses = ['Present', 'Absent', 'Half-day', 'Tardy', 'Late'];
        $owner = $pdo->prepare('SELECT id FROM students WHERE id = ? AND teacher_id = ?');
        $existing = $pdo->prepare('SELECT status FROM attendance_records WHERE student_id = ? AND attendance_date = ?');
        $save = $pdo->prepare('INSERT INTO attendance_records (student_id, attendance_date, status) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status)');
        $summary = $pdo->prepare('UPDATE attendance SET
            present = GREATEST(0, present + ?), absent = GREATEST(0, absent + ?),
            half_day = GREATEST(0, half_day + ?), tardy = GREATEST(0, tardy + ?),
            late = GREATEST(0, late + ?), total = GREATEST(0, total + ?)
            WHERE student_id = ?');
        $deltas = [
            'Present' => ['present' => 1],
            'Absent' => ['absent' => 1],
            'Half-day' => ['half_day' => 1],
            'Tardy' => ['present' => 1, 'tardy' => 1],
            'Late' => ['present' => 1, 'late' => 1],
        ];

        $pdo->beginTransaction();
        foreach ($records as $studentId => $status) {
            if (!in_array($status, $allowedStatuses, true)) json_error('Invalid attendance status.');
            $owner->execute([$studentId, $user['linked_id']]);
            if (!$owner->fetch()) json_error('Not allowed to mark attendance for this student.', 403);

            $existing->execute([$studentId, $date]);
            $oldStatus = $existing->fetchColumn();
            $delta = array_fill_keys(['present', 'absent', 'half_day', 'tardy', 'late'], 0);
            if ($oldStatus) {
                foreach ($deltas[$oldStatus] as $key => $amount) $delta[$key] -= $amount;
            }
            foreach ($deltas[$status] as $key => $amount) $delta[$key] += $amount;
            $delta['total'] = $oldStatus ? 0 : 1;

            $save->execute([$studentId, $date, $status]);
            $summary->execute([
                $delta['present'], $delta['absent'], $delta['half_day'],
                $delta['tardy'], $delta['late'], $delta['total'], $studentId,
            ]);
        }
        $pdo->commit();
        json_response(['message' => 'Attendance saved for ' . ($b['date'] ?? date('Y-m-d')) . '.']);
    }

    json_error('Method not allowed.', 405);
}
