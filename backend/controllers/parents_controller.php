<?php
/**
 * GET    /api/parents          (admin: all; teacher: parents of own students)
 * POST   /api/parents          { name, email, phone, childId, password? }
 * PUT    /api/parents/{id}
 * DELETE /api/parents/{id}
 */

function attach_children($pdo, $parent, $teacherId = null) {
    if ($teacherId !== null) {
        $stmt = $pdo->prepare('SELECT id FROM students WHERE parent_id = ? AND teacher_id = ?');
        $stmt->execute([$parent['id'], $teacherId]);
    } else {
        $stmt = $pdo->prepare('SELECT id FROM students WHERE parent_id = ?');
        $stmt->execute([$parent['id']]);
    }
    $parent['children'] = array_column($stmt->fetchAll(), 'id');
    $account = $pdo->prepare('SELECT 1 FROM users WHERE role = ? AND linked_id = ? LIMIT 1');
    $account->execute(['parent', $parent['id']]);
    $parent['has_account'] = (bool) $account->fetchColumn();
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
        $teacherId = $user['role'] === 'teacher' ? $user['linked_id'] : null;
        $rows = array_map(fn($p) => attach_children($pdo, $p, $teacherId), $stmt->fetchAll());
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
        $stmt = $pdo->prepare('SELECT id FROM parents WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) json_error('Parent not found.', 404);

        if (isset($b['email'])) {
            $duplicateParent = $pdo->prepare('SELECT 1 FROM parents WHERE email = ? AND id <> ? LIMIT 1');
            $duplicateParent->execute([$b['email'], $id]);
            $duplicateUser = $pdo->prepare("SELECT 1 FROM users WHERE email = ? AND NOT (role = 'parent' AND linked_id = ?) LIMIT 1");
            $duplicateUser->execute([$b['email'], $id]);
            if ($duplicateParent->fetchColumn() || $duplicateUser->fetchColumn()) {
                json_error('This email is already in use.', 409);
            }
        }

        $fields = []; $params = [];
        foreach (['name','email','phone'] as $col) {
            if (array_key_exists($col, $b)) { $fields[] = "$col = ?"; $params[] = $b[$col]; }
        }
        if (!empty($fields)) {
            $params[] = $id;
            $pdo->prepare('UPDATE parents SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
            $userFields = []; $userParams = [];
            foreach (['name','email','phone'] as $col) {
                if (array_key_exists($col, $b)) { $userFields[] = "$col = ?"; $userParams[] = $b[$col]; }
            }
            if ($userFields) {
                $userParams[] = $id;
                $pdo->prepare("UPDATE users SET " . implode(', ', $userFields) . " WHERE role = 'parent' AND linked_id = ?")->execute($userParams);
            }
            $studentFields = []; $studentParams = [];
            if (array_key_exists('name', $b)) { $studentFields[] = 'parent_name = ?'; $studentParams[] = $b['name']; }
            if (array_key_exists('email', $b)) { $studentFields[] = 'parent_email = ?'; $studentParams[] = $b['email']; }
            if ($studentFields) {
                $studentParams[] = $id;
                $pdo->prepare('UPDATE students SET ' . implode(', ', $studentFields) . ' WHERE parent_id = ?')->execute($studentParams);
            }
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
        if ($user['role'] === 'teacher') {
            $pdo->prepare('UPDATE students SET parent_id = NULL, parent_name = NULL, parent_email = NULL WHERE parent_id = ? AND teacher_id = ?')
                ->execute([$id, $user['linked_id']]);
            $remaining = $pdo->prepare('SELECT 1 FROM students WHERE parent_id = ? LIMIT 1');
            $remaining->execute([$id]);
            if ($remaining->fetchColumn()) {
                json_response(['message' => 'Parent unlinked from your class.', 'deleted' => false]);
            }
        } else {
            $pdo->prepare('UPDATE students SET parent_id = NULL, parent_name = NULL, parent_email = NULL WHERE parent_id = ?')->execute([$id]);
        }
        $pdo->prepare('DELETE FROM users WHERE role = ? AND linked_id = ?')->execute(['parent', $id]);
        $pdo->prepare('DELETE FROM parents WHERE id = ?')->execute([$id]);
        json_response(['message' => 'Parent deleted.', 'deleted' => true]);
    }

    json_error('Method not allowed.', 405);
}
