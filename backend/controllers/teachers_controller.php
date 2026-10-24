<?php
/**
 * GET    /api/teachers
 * POST   /api/teachers        { name, email, phone, grade, section }  (admin only)
 * PUT    /api/teachers/{id}
 * DELETE /api/teachers/{id}   (admin only)
 */

function handle_teachers($method, $id) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET' && !$id) {
        json_response($pdo->query('SELECT * FROM teachers ORDER BY name')->fetchAll());
    }

    if ($method === 'GET' && $id) {
        $stmt = $pdo->prepare('SELECT * FROM teachers WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Teacher not found.', 404);
        json_response($row);
    }

    if ($method === 'POST') {
        if ($user['role'] !== 'admin') json_error('Not allowed.', 403);
        $b = get_json_body();
        foreach (['name', 'email', 'grade', 'section'] as $req) {
            if (empty($b[$req])) json_error("Field '$req' is required.");
        }

        $last = $pdo->query('SELECT id FROM teachers ORDER BY id DESC LIMIT 1')->fetch();
        $nextNum = $last ? ((int) substr($last['id'], 1)) + 1 : 1;
        $newId = 'T' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $pdo->prepare('INSERT INTO teachers (id,name,email,phone,grade,section,subjects,status,joined)
            VALUES (?,?,?,?,?,?,?,?,CURDATE())')
            ->execute([$newId, $b['name'], $b['email'], $b['phone'] ?? '', $b['grade'], $b['section'],
                       $b['subjects'] ?? 'All Subjects', $b['status'] ?? 'active']);

        // Create a login account too, so the new teacher can actually sign in.
        if (!empty($b['password'])) {
            $pdo->prepare('INSERT INTO users (role,linked_id,email,password,name,phone) VALUES (?,?,?,?,?,?)')
                ->execute(['teacher', $newId, $b['email'], password_hash($b['password'], PASSWORD_BCRYPT), $b['name'], $b['phone'] ?? '']);
        }

        $stmt = $pdo->prepare('SELECT * FROM teachers WHERE id = ?');
        $stmt->execute([$newId]);
        json_response($stmt->fetch(), 201);
    }

    if ($method === 'PUT') {
        if ($user['role'] !== 'admin') json_error('Not allowed.', 403);
        if (!$id) json_error('Teacher id is required.');
        $b = get_json_body();
        $fields = []; $params = [];
        foreach (['name','email','phone','grade','section','status'] as $col) {
            if (array_key_exists($col, $b)) { $fields[] = "$col = ?"; $params[] = $b[$col]; }
        }
        if (empty($fields)) json_error('Nothing to update.');
        $params[] = $id;
        $pdo->prepare('UPDATE teachers SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM teachers WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Teacher not found.', 404);
        json_response($row);
    }

    if ($method === 'DELETE') {
        if ($user['role'] !== 'admin') json_error('Not allowed.', 403);
        if (!$id) json_error('Teacher id is required.');
        $pdo->prepare('DELETE FROM users WHERE role = ? AND linked_id = ?')->execute(['teacher', $id]);
        $pdo->prepare('DELETE FROM teachers WHERE id = ?')->execute([$id]);
        json_response(['message' => 'Teacher deleted.']);
    }

    json_error('Method not allowed.', 405);
}
