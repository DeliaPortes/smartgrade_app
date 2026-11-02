<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StudentAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index(Request $request, StudentAccess $access): JsonResponse
    {
        $students = $access->queryFor($request->user())
            ->orderBy('name')
            ->get();

        return response()->json($students);
    }

    public function show(Request $request, string $student, StudentAccess $access): JsonResponse
    {
        abort_unless($access->canAccess($request->user(), $student), 403, 'Not allowed.');

        $record = DB::table('students')->where('id', $student)->first();
        abort_if(! $record, 404, 'Student not found.');

        return response()->json($record);
    }

    public function store(Request $request, StudentAccess $access): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'teacher', 403, 'Only teachers can add students.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'grade' => ['required', 'string', 'max:20'],
            'section' => ['required', 'string', 'max:50'],
            'gender' => ['required', Rule::in(['M', 'F'])],
            'contact' => ['required', 'string', 'max:20'],
            'lrn' => ['nullable', 'string', 'max:20'],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'dropout'])],
            'parent' => ['nullable', 'string', 'max:150'],
            'parentEmail' => ['nullable', 'email', 'max:150'],
            'parentId' => ['nullable', 'string', 'exists:parents,id'],
            'teacherId' => $user->role === 'teacher'
                ? ['prohibited']
                : ['nullable', 'string', 'exists:teachers,id'],
        ]);

        if ($user->role === 'teacher') {
            $teacher = DB::table('teachers')->where('id', $user->linked_id)->first();
            abort_if(! $teacher, 403, 'Teacher account is not linked.');
            abort_unless(
                $data['grade'] === $teacher->grade && $data['section'] === $teacher->section,
                403,
                'Students can only be added to your assigned class.'
            );
            $teacherId = $user->linked_id;
        } else {
            $teacherId = $data['teacherId'] ?? null;
        }

        $studentId = $access->nextId('students', 'S');

        DB::transaction(function () use ($data, $studentId, $teacherId): void {
            DB::table('students')->insert([
                'id' => $studentId,
                'lrn' => $data['lrn'] ?? null,
                'name' => $data['name'],
                'grade' => $data['grade'],
                'section' => $data['section'],
                'gender' => $data['gender'],
                'parent_name' => $data['parent'] ?? null,
                'parent_email' => $data['parentEmail'] ?? null,
                'parent_id' => $data['parentId'] ?? null,
                'teacher_id' => $teacherId,
                'contact' => $data['contact'],
                'status' => $data['status'] ?? 'active',
                'enrolled' => now()->toDateString(),
            ]);

            DB::table('attendance')->insert(['student_id' => $studentId]);

            foreach ($this->subjectsForGrade($data['grade']) as $subject) {
                DB::table('grades')->insert([
                    'student_id' => $studentId,
                    'subject' => $subject,
                ]);
            }
        });

        return response()->json(DB::table('students')->where('id', $studentId)->first(), 201);
    }

    public function update(Request $request, string $student, StudentAccess $access): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'teacher', 403, 'Only teachers can edit students.');
        abort_unless($access->canAccess($user, $student), 403, 'Not allowed.');

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'grade' => ['sometimes', 'required', 'string', 'max:20'],
            'section' => ['sometimes', 'required', 'string', 'max:50'],
            'gender' => ['sometimes', 'required', Rule::in(['M', 'F'])],
            'parent' => ['sometimes', 'nullable', 'string', 'max:150'],
            'parentEmail' => ['sometimes', 'nullable', 'email', 'max:150'],
            'parentId' => ['sometimes', 'nullable', 'string', 'exists:parents,id'],
            'contact' => ['sometimes', 'required', 'string', 'max:20'],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'dropout'])],
            'lrn' => ['sometimes', 'nullable', 'string', 'max:20'],
            'teacherId' => ['prohibited'],
        ]);

        if ($user->role === 'teacher' && (isset($data['grade']) || isset($data['section']))) {
            $teacher = DB::table('teachers')->where('id', $user->linked_id)->first();
            abort_if(
                ! $teacher
                    || (isset($data['grade']) && $data['grade'] !== $teacher->grade)
                    || (isset($data['section']) && $data['section'] !== $teacher->section),
                403,
                'Students can only be moved within your assigned class.'
            );
        }

        $columns = [
            'name' => 'name',
            'grade' => 'grade',
            'section' => 'section',
            'gender' => 'gender',
            'parent' => 'parent_name',
            'parentEmail' => 'parent_email',
            'parentId' => 'parent_id',
            'contact' => 'contact',
            'status' => 'status',
            'lrn' => 'lrn',
        ];
        $changes = [];
        foreach ($columns as $field => $column) {
            if (array_key_exists($field, $data)) {
                $changes[$column] = $data[$field];
            }
        }

        abort_if($changes === [], 422, 'At least one student field must be provided.');
        DB::table('students')->where('id', $student)->update($changes);

        return response()->json(DB::table('students')->where('id', $student)->first());
    }

    public function destroy(Request $request, string $student, StudentAccess $access): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'teacher', 403, 'Only teachers can delete students.');
        abort_unless($access->canAccess($user, $student), 403, 'Not allowed.');

        DB::table('students')->where('id', $student)->delete();

        return response()->json(['message' => 'Student deleted.']);
    }

    private function subjectsForGrade(string $grade): array
    {
        return match ($grade) {
            'Grade 1' => ['makabansa', 'math', 'gmrc', 'reading_literacy', 'language'],
            'Grade 2' => ['science', 'math', 'english', 'filipino', 'gmrc', 'ap', 'writing'],
            'Grade 3' => ['science', 'math', 'english', 'filipino', 'gmrc', 'ap', 'mapeh'],
            default => ['math'],
        };
    }
}
