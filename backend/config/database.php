<?php
/**
 * TrackEd backend — database connection
 * InfinityFree database connection.
 * Set DB_PASS to your InfinityFree control-panel password on the server.
 */

define('DB_HOST', 'sql302.infinityfree.com');
define('DB_NAME', 'if0_42839595_tracked_db');
define('DB_USER', 'if0_42839595');
define('DB_PASS', '');

function get_db() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database connection failed.']);
            exit;
        }
    }
    return $pdo;
}
