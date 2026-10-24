<?php
/**
 * GET  /api/pending-teachers                registration queue (admin only)
 * POST /api/pending-teachers                { name, email, phone, grade, section, password } — public (Sign Up)
 * POST /api/pending-teachers/{id}/approve   (admin only)
 * POST /api/pending-teachers/{id}/reject    (admin only)
 */

function handle_pending_teachers($method, $id, $sub = null) {
    $pdo = get_db();

    // Signing up is the one action that happens before login exists.
    if ($method === 'POST' && !$id) {
        $b = get_json_body();
        foreach (['name', 'email', 'password', 'grade', 'section'] as $req) {
            if (empty($b[$req])) json_error("Field '$req' is required.");
        }
        $exists = $pdo->prepare('SELECT id FROM users WHERE email = ? UNION SELECT id FROM pending_teachers WHERE email = ?');
        $exists->execute([$b['email'], $b['email']]);
        if ($exists->fetch()) json_error('This email is already registered or pending approval.', 409);

        $last = $pdo->query('SELECT id FROM pending_teachers ORDER BY id DESC LIMIT 1')->fetch();
        $nextNum = $last ? ((int) substr($last['id'], 2)) + 1 : 1;
        $newId = 'PT' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $pdo->prepare('INSERT INTO pending_teachers (id,name,email,phone,grade,section,password,applied_date,status)
            VALUES (?,?,?,?,?,?,?,CURDATE(),"pending")')
            ->execute([$newId, $b['name'], $b['email'], $b['phone'] ?? '', $b['grade'], $b['section'],
                       password_hash($b['password'], PASSWORD_BCRYPT)]);

        json_response(['message' => "Registration submitted! Please wait for the admin's approval."], 201);
    }

    // Everything else requires an admin.
    $user = require_auth();
    if ($user['role'] !== 'admin') json_error('Not allowed.', 403);

    if ($method === 'GET') {
        json_response($pdo->query('SELECT id,name,email,phone,grade,section,applied_date,status FROM pending_teachers ORDER BY applied_date DESC')->fetchAll());
    }

    if ($method === 'POST' && $id) {
        $stmt = $pdo->prepare('SELECT * FROM pending_teachers WHERE id = ?');
        $stmt->execute([$id]);
        $pending = $stmt->fetch();
        if (!$pending) json_error('Registration not found.', 404);

        // route[2] is "approve" or "reject", already passed in as $sub.
        $action = $sub;

        if ($action === 'approve') {
            $last = $pdo->query('SELECT id FROM teachers ORDER BY id DESC LIMIT 1')->fetch();
            $nextNum = $last ? ((int) substr($last['id'], 1)) + 1 : 1;
            $teacherId = 'T' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

            $pdo->prepare('INSERT INTO teachers (id,name,email,phone,grade,section,subjects,status,joined)
                VALUES (?,?,?,?,?,?,"All Subjects","active",CURDATE())')
                ->execute([$teacherId, $pending['name'], $pending['email'], $pending['phone'], $pending['grade'], $pending['section']]);

            $pdo->prepare('INSERT INTO users (role,linked_id,email,password,name,phone) VALUES ("teacher",?,?,?,?,?)')
                ->execute([$teacherId, $pending['email'], $pending['password'], $pending['name'], $pending['phone']]);

            $pdo->prepare('UPDATE pending_teachers SET status = "approved" WHERE id = ?')->execute([$id]);
            json_response(['message' => $pending['name'] . ' approved and can now log in!']);
        }

        if ($action === 'reject') {
            $pdo->prepare('UPDATE pending_teachers SET status = "rejected" WHERE id = ?')->execute([$id]);
            json_response(['message' => $pending['name'] . '\'s application rejected.']);
        }

        json_error('Unknown action. Use /pending-teachers/{id}/approve or /reject.', 400);
    }

    json_error('Method not allowed.', 405);
}
