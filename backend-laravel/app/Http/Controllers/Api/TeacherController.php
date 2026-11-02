<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StudentAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DB::table('teachers')->orderBy('name')->get());
    }

    public function show(string $teacher): JsonResponse
    {
        $record = DB::table('teachers')->where('id', $teacher)->first();
        abort_if(! $record, 404, 'Teacher not found.');

        return response()->json($record);
    }

    public function store(Request $request, StudentAccess $ids): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', Rule::unique('teachers'), Rule::unique('users')],
            'phone' => ['nullable', 'string', 'max:20'],
            'grade' => ['required', 'string', 'max:20'],
            'section' => ['required', 'string', 'max:50'],
            'subjects' => ['sometimes', 'string', 'max:100'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
            'password' => ['sometimes', 'required', 'string', 'min:8', 'max:255'],
        ]);
        $teacherId = $ids->nextId('teachers', 'T');

        $record = DB::transaction(function () use ($data, $teacherId): object {
            DB::table('teachers')->insert([
                'id' => $teacherId,
                'name' => $data['name'],
                'email' => mb_strtolower($data['email']),
                'phone' => $data['phone'] ?? '',
                'grade' => $data['grade'],
                'section' => $data['section'],
                'subjects' => $data['subjects'] ?? 'All Subjects',
                'status' => $data['status'] ?? 'active',
                'joined' => now()->toDateString(),
            ]);

            if (isset($data['password'])) {
                User::query()->create([
                    'role' => 'teacher',
                    'linked_id' => $teacherId,
                    'email' => mb_strtolower($data['email']),
                    'password' => Hash::make($data['password']),
                    'name' => $data['name'],
                    'phone' => $data['phone'] ?? '',
                ]);
            }

            return DB::table('teachers')->where('id', $teacherId)->first();
        });

        return response()->json($record, 201);
    }

    public function update(Request $request, string $teacher): JsonResponse
    {
        $record = DB::table('teachers')->where('id', $teacher)->first();
        abort_if(! $record, 404, 'Teacher not found.');

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('teachers')->ignore($teacher, 'id'),
                Rule::unique('users', 'email')->ignore(
                    User::query()->where('role', 'teacher')->where('linked_id', $teacher)->value('id')
                ),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'grade' => ['sometimes', 'required', 'string', 'max:20'],
            'section' => ['sometimes', 'required', 'string', 'max:50'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);
        abort_if($data === [], 422, 'At least one teacher field must be provided.');

        DB::transaction(function () use ($data, $teacher): void {
            DB::table('teachers')->where('id', $teacher)->update($data);
            $userData = array_intersect_key($data, array_flip(['name', 'email', 'phone']));
            if ($userData !== []) {
                User::query()
                    ->where('role', 'teacher')
                    ->where('linked_id', $teacher)
                    ->update($userData);
            }
        });

        return response()->json(DB::table('teachers')->where('id', $teacher)->first());
    }

    public function destroy(string $teacher): JsonResponse
    {
        DB::transaction(function () use ($teacher): void {
            $user = User::query()->where('role', 'teacher')->where('linked_id', $teacher)->first();
            if ($user) {
                $user->tokens()->delete();
                $user->delete();
            }
            DB::table('teachers')->where('id', $teacher)->delete();
        });

        return response()->json(['message' => 'Teacher deleted.']);
    }
}
