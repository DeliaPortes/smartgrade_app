<?php
/**
 * GET    /api/parents          (admin: all; teacher: parents of own students)
 * POST   /api/parents          { name, email, phone, childId, password? }
 * PUT    /api/parents/{id}
 * DELETE /api/parents/{id}
 */

function attach_children($pdo, $parent) {
    $stmt = $pdo->prepare('SELECT id FROM students WHERE parent_id = ?');
    $stmt->execute([$parent['id']]);
    $parent['children'] = array_column($stmt->fetchAll(), 'id');
    return $parent;
}

function handle_parents($method, $id) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET' && !$id) {
        if ($user['role'] === 'teacher') {
            $stmt = $pdo->prepare('SELECT DISTINCT p.* FROM parents p JOIN students s ON s.parent_id = p.id WHERE s.teacher_id = ? ORDER BY p.name');
            $stmt->execute([$user['linked_id']]);
        } else {
            $stmt = $pdo->query('SELECT * FROM parents ORDER BY name');
        }
        $rows = array_map(fn($p) => attach_children($pdo, $p), $stmt->fetchAll());
        json_response($rows);
    }

    if ($method === 'POST') {
        if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') json_error('Not allowed.', 403);
        $b = get_json_body();
        if (empty($b['name']) || empty($b['email'])) json_error('Name and email are required.');
        if (empty($b['password'])) json_error('A password for the parent is required.');

        $exists = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $exists->execute([$b['email']]);
        if ($exists->fetch()) json_error('This email already has an account.', 409);

        $last = $pdo->query('SELECT id FROM parents ORDER BY id DESC LIMIT 1')->fetch();
        $nextNum = $last ? ((int) substr($last['id'], 1)) + 1 : 1;
        $newId = 'P' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $pdo->prepare('INSERT INTO parents (id,name,email,phone) VALUES (?,?,?,?)')
            ->execute([$newId, $b['name'], $b['email'], $b['phone'] ?? '']);

        if (!empty($b['childId'])) {
            if (!can_access_student($user, $b['childId'])) json_error('Not allowed.', 403);
            $pdo->prepare('UPDATE students SET parent_id = ?, parent_name = ?, parent_email = ? WHERE id = ?')
                ->execute([$newId, $b['name'], $b['email'], $b['childId']]);
        }

        $pdo->prepare('INSERT INTO users (role,linked_id,email,password,name,phone) VALUES (?,?,?,?,?,?)')
            ->execute(['parent', $newId, $b['email'], password_hash($b['password'], PASSWORD_BCRYPT), $b['name'], $b['phone'] ?? '']);

        $stmt = $pdo->prepare('SELECT * FROM parents WHERE id = ?');
        $stmt->execute([$newId]);
        json_response(attach_children($pdo, $stmt->fetch()), 201);
    }

    if ($method === 'PUT') {
        if (!can_access_parent($user, $id)) json_error('Not allowed.', 403);
        if (!$id) json_error('Parent id is required.');
        $b = get_json_body();
        $fields = []; $params = [];
        foreach (['name','email','phone'] as $col) {
            if (array_key_exists($col, $b)) { $fields[] = "$col = ?"; $params[] = $b[$col]; }
        }
        if (!empty($fields)) {
            $params[] = $id;
            $pdo->prepare('UPDATE parents SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        }
        if (!empty($b['password'])) {
            $pdo->prepare('UPDATE users SET password = ? WHERE role = ? AND linked_id = ?')
                ->execute([password_hash($b['password'], PASSWORD_BCRYPT), 'parent', $id]);
        }
        $stmt = $pdo->prepare('SELECT * FROM parents WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Parent not found.', 404);
        json_response(attach_children($pdo, $row));
    }

    if ($method === 'DELETE') {
        if (!can_access_parent($user, $id)) json_error('Not allowed.', 403);
        if (!$id) json_error('Parent id is required.');
        $pdo->prepare('UPDATE students SET parent_id = NULL WHERE parent_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM users WHERE role = ? AND linked_id = ?')->execute(['parent', $id]);
        $pdo->prepare('DELETE FROM parents WHERE id = ?')->execute([$id]);
        json_response(['message' => 'Parent deleted.']);
    }

    json_error('Method not allowed.', 405);
}
