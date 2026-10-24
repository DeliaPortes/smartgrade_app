<?php
/**
 * POST /api/auth/login          { email, password }
 * POST /api/auth/forgot-password { email }
 */

function handle_login() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed.', 405);

    $body = get_json_body();
    $email = trim($body['email'] ?? '');
    $password = trim($body['password'] ?? '');
    if (!$email || !$password) json_error('Email and password are required.');

    $pdo = get_db();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        json_error('Invalid email or password.', 401);
    }
    if ($user['role'] === 'parent' && !parent_has_linked_student($pdo, $user['linked_id'])) {
        json_error('Parent account is not linked to a student. Please contact the school.', 403);
    }

    $token = generate_token($user['id']);
    $user = enrich_user($user);

    json_response(['token' => $token, 'user' => $user]);
}

function handle_forgot_password() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed.', 405);

    $body = get_json_body();
    $email = trim($body['email'] ?? '');
    if (!$email) json_error('Email is required.');

    // This endpoint does not send mail yet. Keep the response generic so it
    // cannot be used to enumerate registered accounts.
    json_response(['message' => 'If an account matches that address, reset instructions will be sent.']);
}
