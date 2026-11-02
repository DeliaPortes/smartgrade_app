<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email', 'max:150'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::query()
            ->where('email', mb_strtolower(trim($credentials['email'])))
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['error' => 'Invalid email or password.'], 401);
        }

        if (! in_array($user->role, User::ROLES, true)) {
            return response()->json(['error' => 'This account has an invalid role.'], 403);
        }

        if ($user->role === 'parent' && ! DB::table('students')
            ->where('parent_id', $user->linked_id)
            ->exists()) {
            return response()->json([
                'error' => 'Parent account is not linked to a student. Please contact the school.',
            ], 403);
        }

        $token = $user->createToken('tracked-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:150'],
        ]);

        $status = Password::sendResetLink($validated);

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'error' => 'Please wait before requesting another password reset link.',
            ], 429);
        }

        return response()->json([
            'message' => 'If an account matches that address, a password reset link will be sent.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'max:150'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'error' => 'This password reset link is invalid or has expired. Request a new one and try again.',
            ], 422);
        }

        return response()->json([
            'message' => 'Your password has been reset. You can now sign in with your new password.',
        ]);
    }

    public function userPayload(User $user): array
    {
        $payload = [
            'id' => $user->linked_id,
            'linked_id' => $user->linked_id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'school' => $user->school,
        ];

        if ($user->role === 'teacher') {
            $teacher = DB::table('teachers')
                ->where('id', $user->linked_id)
                ->first(['grade', 'section']);

            $payload['grade'] = $teacher?->grade;
            $payload['section'] = $teacher?->section;
            $payload['teacher_id'] = $user->linked_id;
        }

        if ($user->role === 'parent') {
            $payload['child_id'] = DB::table('students')
                ->where('parent_id', $user->linked_id)
                ->orderBy('id')
                ->value('id');
        }

        return $payload;
    }
}
