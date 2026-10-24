<?php
/**
 * TrackEd backend — database connection.
 */

function get_db() {
    static $pdo = null;
    if ($pdo === null) {
        $host = getenv('DB_HOST');
        $port = getenv('DB_PORT') ?: '3306';
        $name = getenv('DB_NAME');
        $user = getenv('DB_USER');
        $pass = getenv('DB_PASS');

        foreach ([
            'DB_HOST' => $host,
            'DB_NAME' => $name,
            'DB_USER' => $user,
            'DB_PASS' => $pass,
        ] as $key => $value) {
            if ($value === false || $value === '') {
                error_log("TrackEd database configuration is missing {$key}.");
                json_error('Database configuration is incomplete.', 500);
            }
        }

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $caPath = null;
        $caPem = getenv('DB_SSL_CA');

        if ($caPem !== false && $caPem !== '') {
            if (strpos($caPem, '-----BEGIN CERTIFICATE-----') === false) {
                error_log('TrackEd DB_SSL_CA must contain a PEM certificate.');
                json_error('Database TLS configuration is invalid.', 500);
            }

            $caPath = tempnam(sys_get_temp_dir(), 'tracked-db-ca-');
            if ($caPath === false || file_put_contents($caPath, $caPem) === false) {
                error_log('TrackEd could not prepare the database TLS certificate.');
                json_error('Database TLS configuration is unavailable.', 500);
            }
            chmod($caPath, 0600);
            $options[PDO::MYSQL_ATTR_SSL_CA] = $caPath;
            if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
                $options[constant('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')] = true;
            }
        }

        try {
            $pdo = new PDO(
                "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
                $user,
                $pass,
                $options
            );
        } catch (PDOException $e) {
            error_log('TrackEd database connection failed: ' . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => 'Database connection failed.']);
            exit;
        } finally {
            if ($caPath !== null && is_file($caPath)) {
                unlink($caPath);
            }
        }
    }
    return $pdo;
}
