<?php
/**
 * TrackEd backend — response helpers
 */

function send_cors_headers() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = [
        'null',
        'http://localhost',
        'http://127.0.0.1',
        'https://tracked.infinityfree.io',
    ];
    $isLocalDevelopmentOrigin = (bool) preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin);
    if (in_array($origin, $allowedOrigins, true) || $isLocalDevelopmentOrigin) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function json_response($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error($message, $code = 400) {
    json_response(['error' => $message], $code);
}

function get_json_body() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
