<?php
/**
 * GET    /api/announcements
 * POST   /api/announcements    { title, body, audience, priority }  (admin only)
 * PUT    /api/announcements/{id}
 * DELETE /api/announcements/{id}
 */

function handle_announcements($method, $id) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET' && !$id) {
        $stmt = $pdo->prepare("SELECT * FROM announcements WHERE audience IN ('all', ?) ORDER BY date DESC, id DESC");
        $stmt->execute([$user['role']]);
        json_response($stmt->fetchAll());
    }

    if ($method === 'POST') {
        if ($user['role'] !== 'admin') json_error('Only administrators can manage announcements.', 403);
        $b = get_json_body();
        if (empty($b['title']) || empty($b['body'])) json_error('Title and message are required.');
        $stmt = $pdo->prepare('INSERT INTO announcements (title,body,date,audience,author,author_role,priority)
            VALUES (?,?,CURDATE(),?,?,?,?)');
        $stmt->execute([$b['title'], $b['body'], $b['audience'] ?? 'all', $user['name'], $user['role'], $b['priority'] ?? 'normal']);

        $stmt = $pdo->prepare('SELECT * FROM announcements WHERE id = ?');
        $stmt->execute([$pdo->lastInsertId()]);
        json_response($stmt->fetch(), 201);
    }

    if ($method === 'PUT') {
        if ($user['role'] !== 'admin') json_error('Only administrators can manage announcements.', 403);
        if (!$id) json_error('Announcement id is required.');
        $b = get_json_body();
        $fields = []; $params = [];
        foreach (['title','body','audience','priority'] as $col) {
            if (array_key_exists($col, $b)) { $fields[] = "$col = ?"; $params[] = $b[$col]; }
        }
        if (empty($fields)) json_error('Nothing to update.');
        $params[] = $id;
        $pdo->prepare('UPDATE announcements SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM announcements WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Announcement not found.', 404);
        json_response($row);
    }

    if ($method === 'DELETE') {
        if ($user['role'] !== 'admin') json_error('Only administrators can manage announcements.', 403);
        if (!$id) json_error('Announcement id is required.');
        $pdo->prepare('DELETE FROM announcements WHERE id = ?')->execute([$id]);
        json_response(['message' => 'Announcement deleted.']);
    }

    json_error('Method not allowed.', 405);
}
