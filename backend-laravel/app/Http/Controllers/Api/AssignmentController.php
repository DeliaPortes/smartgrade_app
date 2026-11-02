<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = DB::table('assignments as a')
            ->join('teachers as t', 't.id', '=', 'a.teacher_id')
            ->select('a.*', 't.name as author');

        if ($user->role === 'teacher') {
            $query->where('a.teacher_id', $user->linked_id);
        } elseif ($user->role === 'parent') {
            $query->join('students as s', function ($join): void {
                $join->on('s.grade', '=', 'a.grade')
                    ->on('s.section', '=', 'a.section');
            })->where('s.parent_id', $user->linked_id)
                ->distinct();
        } else {
            abort(403, 'Assignments are available to teachers and parents only.');
        }

        return response()->json($query
            ->orderByDesc('a.assignment_date')
            ->orderByDesc('a.id')
            ->get());
    }

    public function store(Request $request): JsonResponse
    {
        $teacher = DB::table('teachers')->where('id', $request->user()->linked_id)->first();
        abort_if(
            ! $teacher || ! $teacher->grade || ! $teacher->section,
            403,
            'Your account does not have a class assigned.'
        );

        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'subject' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'workType' => ['sometimes', 'required', 'string', 'in:assignment,project'],
            'assignmentDate' => ['required', 'date_format:Y-m-d'],
            'dueDate' => ['sometimes', 'nullable', 'date_format:Y-m-d', 'after_or_equal:assignmentDate'],
        ]);
        $id = DB::table('assignments')->insertGetId([
            'teacher_id' => $request->user()->linked_id,
            'grade' => $teacher->grade,
            'section' => $teacher->section,
            'title' => trim($data['title']),
            'subject' => trim($data['subject']),
            'work_type' => $data['workType'] ?? 'assignment',
            'description' => trim($data['description']),
            'assignment_date' => $data['assignmentDate'],
            'due_date' => $data['dueDate'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(DB::table('assignments as a')
            ->join('teachers as t', 't.id', '=', 'a.teacher_id')
            ->where('a.id', $id)
            ->select('a.*', 't.name as author')
            ->first(), 201);
    }

    public function update(Request $request, string $assignment): JsonResponse
    {
        $record = DB::table('assignments')->where('id', $assignment)->first();
        abort_if(! $record, 404, 'Assignment not found.');
        abort_unless(
            $request->user()->role === 'teacher'
                && $record->teacher_id === $request->user()->linked_id,
            403,
            'Not allowed.'
        );

        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'subject' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'workType' => ['required', 'string', 'in:assignment,project'],
            'assignmentDate' => ['required', 'date_format:Y-m-d'],
            'dueDate' => ['sometimes', 'nullable', 'date_format:Y-m-d', 'after_or_equal:assignmentDate'],
        ]);

        DB::table('assignments')->where('id', $assignment)->update([
            'title' => trim($data['title']),
            'subject' => trim($data['subject']),
            'description' => trim($data['description']),
            'work_type' => $data['workType'],
            'assignment_date' => $data['assignmentDate'],
            'due_date' => $data['dueDate'] ?? null,
            'updated_at' => now(),
        ]);

        return response()->json(DB::table('assignments as a')
            ->join('teachers as t', 't.id', '=', 'a.teacher_id')
            ->where('a.id', $assignment)
            ->select('a.*', 't.name as author')
            ->first());
    }

    public function destroy(Request $request, string $assignment): JsonResponse
    {
        $record = DB::table('assignments')->where('id', $assignment)->first();
        abort_if(! $record, 404, 'Assignment not found.');
        abort_unless(
            $request->user()->role === 'teacher'
                && $record->teacher_id === $request->user()->linked_id,
            403,
            'Not allowed.'
        );

        DB::table('assignments')->where('id', $assignment)->delete();

        return response()->json(['message' => 'Assignment deleted.']);
    }
}
