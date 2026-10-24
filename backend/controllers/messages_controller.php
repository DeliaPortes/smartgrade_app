<?php
/**
 * GET   /api/messages                 (all messages involving the current user)
 * POST  /api/messages                 { toRole, toId, subject, body, studentId?, thread? }
 * PATCH /api/messages/{id}/read
 * POST  /api/messages/telegram-link
 * POST  /api/messages/telegram-webhook (Telegram only; secret-header protected)
 */

function telegram_api_call($method, $payload) {
    $config = require __DIR__ . '/../config/telegram.php';
    if (empty($config['bot_token'])) return null;

    $url = 'https://api.telegram.org/bot' . $config['bot_token'] . '/' . $method;
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 8,
        ]);
        $response = curl_exec($curl);
        curl_close($curl);
        return $response === false ? null : json_decode($response, true);
    }
    if (!ini_get('allow_url_fopen')) return null;

    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $json,
        'timeout' => 8,
        'ignore_errors' => true,
    ]]);
    $response = @file_get_contents(
        $url,
        false,
        $context
    );
    return $response === false ? null : json_decode($response, true);
}

function handle_telegram_webhook() {
    $config = require __DIR__ . '/../config/telegram.php';
    $providedSecret = $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '';
    if (empty($config['webhook_secret']) || !$providedSecret || !hash_equals($config['webhook_secret'], $providedSecret)) {
        json_error('Unauthorized webhook.', 403);
    }

    $update = json_decode(file_get_contents('php://input'), true) ?: [];
    $message = $update['message'] ?? [];
    $text = $message['text'] ?? '';
    $chat = $message['chat'] ?? [];
    $chatId = (string)($chat['id'] ?? '');
    if (($chat['type'] ?? '') !== 'private' || !preg_match('/^-?\d{1,64}$/', $chatId)) {
        json_response(['ok' => true]);
    }

    if (preg_match('/^\/start(?:@[A-Za-z0-9_]+)?\s+link_([a-f0-9]{48})$/', trim($text), $matches)) {
        $pdo = get_db();
        $stmt = $pdo->prepare('UPDATE users SET telegram_chat_id = ?, telegram_link_code_hash = NULL, telegram_link_expires_at = NULL
            WHERE telegram_link_code_hash = ? AND telegram_link_expires_at > NOW() AND role = "parent"');
        $stmt->execute([$chatId, hash('sha256', $matches[1])]);
        $reply = $stmt->rowCount() === 1
            ? 'Your TrackEd account is now connected. School messages can be delivered here.'
            : 'This TrackEd link is expired or already used. Request a new one in the app.';
        telegram_api_call('sendMessage', ['chat_id' => $chatId, 'text' => $reply]);
    }

    json_response(['ok' => true]);
}

function handle_messages($method, $id, $sub) {
    if ($method === 'POST' && $id === 'telegram-webhook') handle_telegram_webhook();

    $user = require_auth();
    $pdo = get_db();

    if ($method === 'POST' && $id === 'telegram-link') {
        if ($user['role'] !== 'parent') json_error('Only parents can link Telegram delivery.', 403);
        $config = require __DIR__ . '/../config/telegram.php';
        if (empty($config['bot_token']) || empty($config['webhook_secret']) || !preg_match('/^[A-Za-z0-9_]{5,32}$/', $config['bot_username'])) {
            json_error('Telegram delivery is not configured on the server.', 503);
        }
        $account = $pdo->prepare('SELECT id, telegram_chat_id FROM users WHERE role = ? AND linked_id = ?');
        $account->execute([$user['role'], $user['linked_id']]);
        $row = $account->fetch();
        if (!$row) json_error('Parent account not found.', 404);
        if (!empty($row['telegram_chat_id'])) json_response(['linked' => true]);

        $code = bin2hex(random_bytes(24));
        $save = $pdo->prepare('UPDATE users SET telegram_link_code_hash = ?, telegram_link_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?');
        $save->execute([hash('sha256', $code), $row['id']]);
        json_response([
            'linked' => false,
            'linkUrl' => 'https://t.me/' . rawurlencode($config['bot_username']) . '?start=link_' . $code,
            'expiresInMinutes' => 10,
        ]);
    }

    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM messages WHERE to_id = ? OR from_id = ? ORDER BY date DESC, time DESC');
        $stmt->execute([$user['id'], $user['id']]);
        json_response(array_map(function ($m) {
            $m['read'] = (bool)$m['is_read'];
            unset($m['is_read']);
            return $m;
        }, $stmt->fetchAll()));
    }

    if ($method === 'POST') {
        $b = get_json_body();
        foreach (['toRole', 'toId', 'subject', 'body'] as $req) {
            if (empty($b[$req])) json_error("Field '$req' is required.");
        }
        if (!in_array($b['toRole'], ['teacher', 'parent', 'admin'], true)) {
            json_error('Invalid recipient role.');
        }
        $recipient = $pdo->prepare('SELECT id, telegram_chat_id FROM users WHERE role = ? AND linked_id = ?');
        $recipient->execute([$b['toRole'], $b['toId']]);
        $recipientRow = $recipient->fetch();
        if (!$recipientRow) json_error('Recipient not found.', 404);
        if (!empty($b['studentId']) && !can_access_student($user, $b['studentId'])) {
            json_error('Not allowed.', 403);
        }
        $stmt = $pdo->prepare('INSERT INTO messages (from_role,from_id,from_name,to_role,to_id,subject,body,date,time,is_read,student_id,thread_id)
            VALUES (?,?,?,?,?,?,?,CURDATE(),?,0,?,?)');
        $stmt->execute([
            $user['role'], $user['id'], $user['name'],
            $b['toRole'], $b['toId'], $b['subject'], $b['body'],
            date('h:i A'), $b['studentId'] ?? null, $b['thread'] ?? null,
        ]);
        $delivery = 'in_app';
        $config = require __DIR__ . '/../config/telegram.php';
        $telegramChatId = $recipientRow['telegram_chat_id'] ?? null;
        if ($b['toRole'] === 'parent' && $telegramChatId && !empty($config['bot_token'])) {
            $telegramResult = telegram_api_call('sendMessage', [
                'chat_id' => $telegramChatId,
                'text' => 'You have a new message in TrackEd. Sign in to read it.',
                'protect_content' => true,
                'link_preview_options' => ['is_disabled' => true],
            ]);
            $delivery = !empty($telegramResult['ok']) ? 'telegram_sent' : 'telegram_failed';
        } elseif ($b['toRole'] === 'parent' && !empty($config['bot_token'])) {
            $delivery = 'telegram_unlinked';
        }

        json_response(['id' => $pdo->lastInsertId(), 'message' => 'Message sent.', 'delivery' => $delivery], 201);
    }

    if ($method === 'PATCH' && $sub === 'read') {
        if (!$id) json_error('Message id is required.');
        $stmt = $pdo->prepare('UPDATE messages SET is_read = 1 WHERE id = ? AND (to_id = ? OR from_id = ?)');
        $stmt->execute([$id, $user['id'], $user['id']]);
        json_response(['message' => 'Marked as read.']);
    }

    json_error('Method not allowed.', 405);
}
