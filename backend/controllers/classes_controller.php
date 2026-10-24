<?php
/**
 * GET    /api/classes
 * POST   /api/classes        { grade, section, teacherId?, year }  (admin only)
 * PUT    /api/classes/{id}
 * DELETE /api/classes/{id}   (admin only)
 */

function handle_classes($method, $id) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET' && !$id) {
        json_response($pdo->query('SELECT * FROM classes ORDER BY grade, section')->fetchAll());
    }

    if ($method === 'POST') {
        if ($user['role'] !== 'admin') json_error('Not allowed.', 403);
        $b = get_json_body();
        if (empty($b['grade']) || empty($b['section'])) json_error('Grade and section are required.');

        $last = $pdo->query('SELECT id FROM classes ORDER BY id DESC LIMIT 1')->fetch();
        $nextNum = $last ? ((int) substr($last['id'], 1)) + 1 : 1;
        $newId = 'C' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $pdo->prepare('INSERT INTO classes (id,grade,section,teacher_id,year) VALUES (?,?,?,?,?)')
            ->execute([$newId, $b['grade'], $b['section'], $b['teacherId'] ?? null, $b['year'] ?? '2024-2025']);

        $stmt = $pdo->prepare('SELECT * FROM classes WHERE id = ?');
        $stmt->execute([$newId]);
        json_response($stmt->fetch(), 201);
    }

    if ($method === 'PUT') {
        if ($user['role'] !== 'admin') json_error('Not allowed.', 403);
        if (!$id) json_error('Class id is required.');
        $b = get_json_body();
        $fields = []; $params = [];
        if (array_key_exists('teacherId', $b)) { $fields[] = 'teacher_id = ?'; $params[] = $b['teacherId']; }
        if (array_key_exists('year', $b))      { $fields[] = 'year = ?';       $params[] = $b['year']; }
        if (empty($fields)) json_error('Nothing to update.');
        $params[] = $id;
        $pdo->prepare('UPDATE classes SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM classes WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Class not found.', 404);
        json_response($row);
    }

    if ($method === 'DELETE') {
        if ($user['role'] !== 'admin') json_error('Not allowed.', 403);
        if (!$id) json_error('Class id is required.');
        $pdo->prepare('DELETE FROM classes WHERE id = ?')->execute([$id]);
        json_response(['message' => 'Class deleted.']);
    }

    json_error('Method not allowed.', 405);
}
