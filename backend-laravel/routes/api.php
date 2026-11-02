<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\GradeDescriptionController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ParentController;
use App\Http\Controllers\Api\PendingTeacherController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'TrackEd API is running.']);
});

Route::get('/health', function () {
    try {
        DB::select('SELECT 1');
    } catch (QueryException $exception) {
        $sslCaPath = array_values(config('database.connections.mysql.options', []))[0] ?? null;

        Log::error('TrackEd database readiness check failed.', [
            'exception' => $exception,
            'pdo_mysql_loaded' => extension_loaded('pdo_mysql'),
            'openssl_loaded' => extension_loaded('openssl'),
            'ssl_ca_path_configured' => is_string($sslCaPath) && $sslCaPath !== '',
            'ssl_ca_file_readable' => is_string($sslCaPath)
                && $sslCaPath !== ''
                && is_readable($sslCaPath),
        ]);

        return response()->json([
            'status' => 'degraded',
            'database' => 'unavailable',
        ], 503);
    }

    return response()->json([
        'status' => 'ok',
        'database' => 'connected',
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:api-login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:api-login');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:api-login');
});

Route::post('/pending-teachers', [PendingTeacherController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [MeController::class, 'show']);
    Route::patch('/me', [MeController::class, 'update']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/pending-teachers', [PendingTeacherController::class, 'index']);
        Route::post('/pending-teachers/{pending}/approve', [PendingTeacherController::class, 'approve']);
        Route::post('/pending-teachers/{pending}/reject', [PendingTeacherController::class, 'reject']);
    });

    Route::apiResource('students', StudentController::class)->only(['index', 'show']);
    Route::apiResource('students', StudentController::class)->except(['index', 'show'])
        ->middleware('role:teacher');

    Route::apiResource('teachers', TeacherController::class)
        ->only(['index', 'show']);
    Route::apiResource('teachers', TeacherController::class)
        ->except(['index', 'show'])
        ->middleware('role:admin');

    Route::apiResource('parents', ParentController::class)
        ->only(['index', 'show']);
    Route::apiResource('parents', ParentController::class)
        ->except(['index', 'show']);

    Route::apiResource('classes', ClassController::class)
        ->only(['index']);
    Route::apiResource('classes', ClassController::class)
        ->only(['store', 'update', 'destroy'])
        ->middleware('role:admin');

    Route::apiResource('announcements', AnnouncementController::class)
        ->only(['index']);
    Route::apiResource('announcements', AnnouncementController::class)
        ->only(['store', 'update', 'destroy'])
        ->middleware('role:admin,teacher');

    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::post('/assignments', [AssignmentController::class, 'store'])
        ->middleware('role:teacher');
    Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])
        ->middleware('role:teacher')
        ->whereNumber('assignment');
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])
        ->middleware('role:teacher')
        ->whereNumber('assignment');

    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::patch('/messages/{message}/read', [MessageController::class, 'markRead']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markRead']);

    Route::get('/dashboard', [DashboardController::class, 'show']);

    Route::post('/devices', [DeviceController::class, 'store']);
    Route::delete('/devices/{device}', [DeviceController::class, 'destroy'])
        ->whereNumber('device');

    Route::get('/grades', [GradeController::class, 'index']);
    Route::get('/grade-descriptions', [GradeDescriptionController::class, 'index']);
    Route::put('/grade-descriptions', [GradeDescriptionController::class, 'bulkUpdate'])
        ->middleware('role:teacher');
    Route::put('/grades/bulk', [GradeController::class, 'bulkUpdate'])
        ->middleware('role:admin,teacher');
    Route::put('/grades/{student}/{subject}', [GradeController::class, 'update'])
        ->middleware('role:admin,teacher');

    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/mark', [AttendanceController::class, 'mark'])
        ->middleware('role:teacher');
});
