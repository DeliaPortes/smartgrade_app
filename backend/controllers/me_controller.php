<?php
/**
 * GET   /api/me
 * PATCH /api/me   { name?, email?, phone?, avatar?, school? }
 */

function handle_me($method) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET') {
        json_response($user);
    }

    if ($method === 'PATCH') {
        $body = get_json_body();
        $fields = [];
        $params = [];
        foreach (['name', 'email', 'phone', 'avatar', 'school'] as $f) {
            if (array_key_exists($f, $body)) {
                $fields[] = "$f = ?";
                $params[] = $body[$f];
            }
        }
        if (!empty($body['password'])) {
            $fields[] = 'password = ?';
            $params[] = password_hash($body['password'], PASSWORD_BCRYPT);
        }
        if (empty($fields)) json_error('Nothing to update.');

        $stmt = $pdo->prepare('SELECT id FROM users WHERE linked_id = ? AND role = ?');
        $stmt->execute([$user['linked_id'], $user['role']]);
        $row = $stmt->fetch();
        if (!$row) json_error('User not found.', 404);

        $params[] = $row['id'];
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $pdo->prepare($sql)->execute($params);

        // Keep teachers/parents "name" columns in sync so other views stay consistent.
        if (isset($body['name'])) {
            if ($user['role'] === 'teacher') {
                $pdo->prepare('UPDATE teachers SET name = ? WHERE id = ?')->execute([$body['name'], $user['linked_id']]);
            } elseif ($user['role'] === 'parent') {
                $pdo->prepare('UPDATE parents SET name = ? WHERE id = ?')->execute([$body['name'], $user['linked_id']]);
            }
        }

        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$row['id']]);
        json_response(enrich_user($stmt->fetch()));
    }

    json_error('Method not allowed.', 405);
}
