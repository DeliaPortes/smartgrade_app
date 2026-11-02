<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StudentAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class GradeDescriptionController extends Controller
{
    public function index(Request $request, StudentAccess $students): JsonResponse
    {
        $studentIds = $students->queryFor($request->user())->select('id');

        return response()->json(DB::table('grade_descriptions')
            ->whereIn('student_id', $studentIds)
            ->orderBy('student_id')
            ->orderBy('quarter')
            ->get());
    }

    public function bulkUpdate(Request $request, StudentAccess $students): JsonResponse
    {
        $data = $request->validate([
            'quarter' => ['required', Rule::in(['Q1', 'Q2', 'Q3'])],
            'descriptions' => ['required', 'array', 'min:1'],
            'descriptions.*' => ['present', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($data, $request, $students): void {
            foreach ($data['descriptions'] as $studentId => $description) {
                abort_unless(
                    $students->canAccess($request->user(), (string) $studentId),
                    403,
                    'Not allowed.'
                );

                $query = DB::table('grade_descriptions')
                    ->where('student_id', $studentId)
                    ->where('quarter', $data['quarter']);

                if (trim($description) === '') {
                    $query->delete();

                    continue;
                }

                DB::table('grade_descriptions')->upsert(
                    [[
                        'student_id' => $studentId,
                        'quarter' => $data['quarter'],
                        'description' => trim($description),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]],
                    ['student_id', 'quarter'],
                    ['description', 'updated_at']
                );
            }
        });

        return response()->json(['message' => 'Grade descriptions saved.']);
    }
}
