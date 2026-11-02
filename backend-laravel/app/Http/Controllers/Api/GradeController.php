<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GradeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GradeController extends Controller
{
    public function index(Request $request, GradeService $grades): JsonResponse
    {
        return response()->json($grades->getFor($request->user()));
    }

    public function update(Request $request, string $student, string $subject, GradeService $grades): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['teacher', 'admin'], true), 403, 'Not allowed.');
        Validator::make(
            ['subject' => $subject],
            ['subject' => ['required', 'string', 'max:100']]
        )->validate();

        $data = $request->validate([
            'q1' => ['required', 'integer', 'between:0,100'],
            'q2' => ['required', 'integer', 'between:0,100'],
            'q3' => ['required', 'integer', 'between:0,100'],
            'q4' => ['required', 'integer', 'between:0,100'],
        ]);

        $grades->save($request->user(), [
            $student => [$subject => array_values($data)],
        ]);

        return response()->json([
            'message' => 'Grade updated.',
            'student_id' => $student,
            'subject' => $subject,
            'scores' => array_values($data),
        ]);
    }

    public function bulkUpdate(Request $request, GradeService $grades): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['teacher', 'admin'], true), 403, 'Not allowed.');
        $data = $request->validate([
            '*' => ['required', 'array'],
            '*.*' => ['required', 'array', 'size:4'],
            '*.*.*' => ['required', 'integer', 'between:0,100'],
        ]);

        foreach ($data as $subjects) {
            foreach ($subjects as $subject => $_scores) {
                Validator::make(
                    ['subject' => $subject],
                    ['subject' => ['required', 'string', 'max:100']]
                )->validate();
            }
        }

        $grades->save($request->user(), $data);

        return response()->json(['message' => 'Grades saved.']);
    }
}
