<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = DB::table('notifications')
            ->whereIn('role', ['all', $request->user()->role])
            ->orderByDesc('id')
            ->get();

        return response()->json($notifications->map(function (object $notification): array {
            $record = (array) $notification;
            $record['read'] = (bool) $record['is_read'];
            unset($record['is_read']);

            return $record;
        }));
    }

    public function markRead(Request $request): JsonResponse
    {
        DB::table('notifications')
            ->whereIn('role', ['all', $request->user()->role])
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
