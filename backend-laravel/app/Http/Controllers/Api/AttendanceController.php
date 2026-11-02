<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    public function index(Request $request, AttendanceService $attendance): JsonResponse
    {
        return response()->json($attendance->getFor($request->user()));
    }

    public function mark(Request $request, AttendanceService $attendance): JsonResponse
    {
        abort_unless($request->user()->role === 'teacher', 403, 'Only teachers can mark attendance.');

        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'records' => ['required', 'array', 'min:1'],
            'records.*' => ['required', Rule::in(array_keys(AttendanceService::STATUSES))],
        ]);

        $attendance->mark($request->user(), $data['date'], $data['records']);

        return response()->json(['message' => 'Attendance saved for '.$data['date'].'.']);
    }
}
