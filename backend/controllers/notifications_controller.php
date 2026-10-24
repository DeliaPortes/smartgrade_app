<?php
/**
 * GET  /api/notifications
 * POST /api/notifications/mark-read
 */

function handle_notifications($method, $id) {
    $user = require_auth();
    $pdo = get_db();

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE role = ? OR role = 'all' ORDER BY id DESC");
        $stmt->execute([$user['role']]);
        json_response(array_map(function ($n) {
            $n['read'] = (bool)$n['is_read'];
            unset($n['is_read']);
            return $n;
        }, $stmt->fetchAll()));
    }

    if ($method === 'POST' && $id === 'mark-read') {
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE role = ? OR role = 'all'");
        $stmt->execute([$user['role']]);
        json_response(['message' => 'All notifications marked as read.']);
    }

    json_error('Method not allowed.', 405);
}
