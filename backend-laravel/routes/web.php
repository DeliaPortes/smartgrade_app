<?php

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/health', function () {
    try {
        DB::select('SELECT 1');
    } catch (QueryException $exception) {
        Log::error('TrackEd database readiness check failed.', [
            'exception' => $exception,
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

Route::get('/reset-password/{token}', function (string $token) {
    return view('auth.reset-password', [
        'token' => $token,
        'email' => request()->query('email', ''),
    ]);
})->middleware('throttle:10,1')->name('password.reset');
