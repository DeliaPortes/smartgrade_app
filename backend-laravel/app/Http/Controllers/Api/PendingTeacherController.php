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

class PendingTeacherController extends Controller
{
    public function store(Request $request, StudentAccess $ids): JsonResponse
    {
        $email = $request->input('email');
        if (is_string($email)) {
            $request->merge(['email' => mb_strtolower(trim($email))]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email'),
                Rule::unique('pending_teachers', 'email'),
            ],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'grade' => ['required', 'string', 'max:20'],
            'section' => ['required', 'string', 'max:50'],
        ]);

        $id = $ids->nextId('pending_teachers', 'PT');
        DB::table('pending_teachers')->insert([
            'id' => $id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? '',
            'grade' => $data['grade'],
            'section' => $data['section'],
            'password' => Hash::make($data['password']),
            'applied_date' => now()->toDateString(),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => "Registration submitted! Please wait for the admin's approval.",
        ], 201);
    }

    public function index(): JsonResponse
    {
        return response()->json(DB::table('pending_teachers')
            ->where('status', 'pending')
            ->orderByDesc('applied_date')
            ->get([
                'id',
                'name',
                'email',
                'phone',
                'grade',
                'section',
                'applied_date',
                'status',
            ]));
    }

    public function approve(string $pending, StudentAccess $ids): JsonResponse
    {
        $teacherId = DB::transaction(function () use ($pending, $ids): string {
            $application = DB::table('pending_teachers')
                ->where('id', $pending)
                ->lockForUpdate()
                ->first();
            abort_if(! $application || $application->status !== 'pending', 404, 'Registration not found.');

            abort_if(
                DB::table('users')->where('email', $application->email)->exists(),
                409,
                'This email is already registered.'
            );

            $teacherId = $ids->nextId('teachers', 'T');
            DB::table('teachers')->insert([
                'id' => $teacherId,
                'name' => $application->name,
                'email' => $application->email,
                'phone' => $application->phone,
                'grade' => $application->grade,
                'section' => $application->section,
                'subjects' => 'All Subjects',
                'status' => 'active',
                'joined' => now()->toDateString(),
            ]);

            User::query()->create([
                'role' => 'teacher',
                'linked_id' => $teacherId,
                'email' => $application->email,
                'password' => $application->password,
                'name' => $application->name,
                'phone' => $application->phone,
            ]);

            DB::table('pending_teachers')->where('id', $pending)->update(['status' => 'approved']);

            return $teacherId;
        });

        return response()->json(['message' => 'Teacher approved and can now log in.']);
    }

    public function reject(string $pending): JsonResponse
    {
        $updated = DB::table('pending_teachers')
            ->where('id', $pending)
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);
        abort_if(! $updated, 404, 'Registration not found.');

        return response()->json(['message' => 'Teacher application rejected.']);
    }
}
