<?php
/**
 * TrackEd backend — simple bearer-token auth
 * (Not JWT — just a random token stored in auth_tokens, good enough for a
 * school project running behind XAMPP. Tokens last 7 days.)
 */

require_once __DIR__ . '/response.php';

function generate_token($userId) {
    $pdo = get_db();
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+7 days'));
    $stmt = $pdo->prepare('INSERT INTO auth_tokens (token, user_id, expires_at) VALUES (?, ?, ?)');
    $stmt->execute([$token, $userId, $expires]);
    return $token;
}

function get_bearer_token() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    if (preg_match('/Bearer\s+(\S+)/i', $auth, $m)) {
        return $m[1];
    }
    return null;
}

/**
 * Validates the bearer token and returns the full user row (joined with
 * role-specific info) or sends a 401 and exits if invalid/missing.
 */
function require_auth() {
    $token = get_bearer_token();
    if (!$token) json_error('Missing authorization token.', 401);

    $pdo = get_db();
    $stmt = $pdo->prepare('SELECT u.* FROM auth_tokens t JOIN users u ON u.id = t.user_id WHERE t.token = ? AND t.expires_at > NOW()');
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    if (!$user) json_error('Invalid or expired token.', 401);

    return enrich_user($user);
}

/**
 * Adds role-specific fields (grade/section for teachers, child_id for
 * parents) so the frontend gets the same shape it expects from STATE.users.
 */
function enrich_user($user) {
    $pdo = get_db();
    unset($user['password']);
    if ($user['role'] === 'teacher') {
        $stmt = $pdo->prepare('SELECT grade, section FROM teachers WHERE id = ?');
        $stmt->execute([$user['linked_id']]);
        $t = $stmt->fetch();
        $user['grade']      = $t['grade'] ?? null;
        $user['section']    = $t['section'] ?? null;
        $user['teacher_id'] = $user['linked_id'];
    } elseif ($user['role'] === 'parent') {
        $stmt = $pdo->prepare('SELECT id FROM students WHERE parent_id = ? LIMIT 1');
        $stmt->execute([$user['linked_id']]);
        $s = $stmt->fetch();
        $user['child_id'] = $s['id'] ?? null;
    }
    $user['id'] = $user['linked_id'];
    return $user;
}

function can_access_student($user, $studentId) {
    if ($user['role'] === 'admin') return true;

    $pdo = get_db();
    if ($user['role'] === 'teacher') {
        $stmt = $pdo->prepare('SELECT 1 FROM students WHERE id = ? AND teacher_id = ?');
        $stmt->execute([$studentId, $user['linked_id']]);
        return (bool) $stmt->fetchColumn();
    }

    if ($user['role'] === 'parent') {
        $stmt = $pdo->prepare('SELECT 1 FROM students WHERE id = ? AND parent_id = ?');
        $stmt->execute([$studentId, $user['linked_id']]);
        return (bool) $stmt->fetchColumn();
    }

    return false;
}

function can_access_parent($user, $parentId) {
    if ($user['role'] === 'admin') return true;
    if ($user['role'] === 'parent') return $user['linked_id'] === $parentId;
    if ($user['role'] !== 'teacher') return false;

    $pdo = get_db();
    $stmt = $pdo->prepare('SELECT 1 FROM students WHERE parent_id = ? AND teacher_id = ? LIMIT 1');
    $stmt->execute([$parentId, $user['linked_id']]);
    return (bool) $stmt->fetchColumn();
}
