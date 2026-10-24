<?php
/**
 * TrackEd backend — front controller
 * Every request under this folder (see .htaccess) lands here. We figure
 * out the route by looking for the "api" segment in the URL and treating
 * everything after it as the route — this way it doesn't matter whether
 * this project lives at http://localhost/tracked-backend/ or any other
 * folder name inside htdocs.
 */

require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/auth.php';
require_once __DIR__ . '/config/database.php';

send_cors_headers();

$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$segments = array_values(array_filter(explode('/', $uri)));

$apiIndex = array_search('api', $segments);
if ($apiIndex === false) {
    json_error('Not found. Expected a URL containing /api/...', 404);
}
$route  = array_slice($segments, $apiIndex + 1);
$method = $_SERVER['REQUEST_METHOD'];

if (empty($route)) {
    json_response(['message' => 'TrackEd API is running.']);
}

$resource = $route[0];
$id       = $route[1] ?? null;
$sub      = $route[2] ?? null;

switch ($resource) {

    case 'auth':
        require __DIR__ . '/controllers/auth_controller.php';
        if ($id === 'login')            handle_login();
        elseif ($id === 'forgot-password') handle_forgot_password();
        else json_error('Unknown auth route.', 404);
        break;

    case 'me':
        require __DIR__ . '/controllers/me_controller.php';
        handle_me($method);
        break;

    case 'students':
        require __DIR__ . '/controllers/students_controller.php';
        handle_students($method, $id);
        break;

    case 'teachers':
        require __DIR__ . '/controllers/teachers_controller.php';
        handle_teachers($method, $id);
        break;

    case 'parents':
        require __DIR__ . '/controllers/parents_controller.php';
        handle_parents($method, $id);
        break;

    case 'classes':
        require __DIR__ . '/controllers/classes_controller.php';
        handle_classes($method, $id);
        break;

    case 'grades':
        require __DIR__ . '/controllers/grades_controller.php';
        handle_grades($method, $id, $sub);
        break;

    case 'attendance':
        require __DIR__ . '/controllers/attendance_controller.php';
        handle_attendance($method, $id);
        break;

    case 'messages':
        require __DIR__ . '/controllers/messages_controller.php';
        handle_messages($method, $id, $sub);
        break;

    case 'announcements':
        require __DIR__ . '/controllers/announcements_controller.php';
        handle_announcements($method, $id);
        break;

    case 'assignments':
        require __DIR__ . '/controllers/assignments_controller.php';
        handle_assignments($method, $id);
        break;

    case 'notifications':
        require __DIR__ . '/controllers/notifications_controller.php';
        handle_notifications($method, $id);
        break;

    case 'dashboard':
        require __DIR__ . '/controllers/dashboard_controller.php';
        handle_dashboard();
        break;

    case 'pending-teachers':
        require __DIR__ . '/controllers/pending_teachers_controller.php';
        handle_pending_teachers($method, $id, $sub);
        break;

    default:
        json_error('Not found.', 404);
}
