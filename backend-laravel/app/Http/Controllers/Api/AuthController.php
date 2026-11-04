<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PasswordResetCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email', 'max:150'],
            'password' => ['required', 'string', 'max:255'],
            'remember' => ['sometimes', 'boolean'],
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

        $expiresAt = ($credentials['remember'] ?? false) ? now()->addDays(7) : null;
        $newToken = $user->createToken('tracked-app', ['*'], $expiresAt);

        return response()->json([
            'token' => $newToken->plainTextToken,
            'expires_at' => $expiresAt?->toIso8601String(),
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

        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            return response()->json([
                'error' => 'Email verification is not configured. Please contact the school administrator.',
            ], 503);
        }

        DB::table('password_reset_verification_codes')->where('expires_at', '<=', now())->delete();

        $email = mb_strtolower(trim($validated['email']));
        $user = User::query()->where('email', $email)->first();
        if (! $user) {
            return response()->json([
                'message' => 'If an account matches that email, a verification code will be sent.',
            ]);
        }

        $code = (string) random_int(100000, 999999);
        DB::table('password_reset_verification_codes')->updateOrInsert(
            ['user_id' => $user->id],
            [
                'email' => $email,
                'code_hash' => Hash::make($code),
                'reset_token_hash' => null,
                'verified_at' => null,
                'attempts' => 0,
                'expires_at' => now()->addMinutes(10),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        try {
            Notification::route('mail', $email)
                ->notify(new PasswordResetCodeNotification($code));
        } catch (TransportExceptionInterface $exception) {
            DB::table('password_reset_verification_codes')->where('user_id', $user->id)->delete();
            Log::error('TrackEd password reset email delivery failed.', [
                'exception' => $exception,
            ]);

            return response()->json([
                'error' => 'Could not send the verification code. Please try again later.',
            ], 503);
        }

        return response()->json([
            'message' => 'If an account matches that email, a verification code will be sent.',
        ]);
    }

    public function verifyResetCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:150'],
            'code' => ['required', 'digits:6'],
        ]);

        $email = mb_strtolower(trim($validated['email']));
        $user = User::query()->where('email', $email)->first();
        if (! $user) {
            return response()->json([
                'error' => 'The verification code is invalid or expired. Request a new code and try again.',
            ], 422);
        }

        $resetToken = Str::random(64);
        $verified = DB::transaction(function () use ($user, $email, $validated, $resetToken): bool {
            $challenge = DB::table('password_reset_verification_codes')
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (! $challenge
                || $challenge->email !== $email
                || now()->greaterThan($challenge->expires_at)
                || $challenge->attempts >= 5
                || $challenge->verified_at !== null) {
                return false;
            }

            if (! Hash::check($validated['code'], $challenge->code_hash)) {
                DB::table('password_reset_verification_codes')->where('user_id', $user->id)
                    ->increment('attempts');

                return false;
            }

            DB::table('password_reset_verification_codes')->where('user_id', $user->id)->update([
                'verified_at' => now(),
                'reset_token_hash' => hash('sha256', $resetToken),
                'updated_at' => now(),
            ]);

            return true;
        });

        if (! $verified) {
            return response()->json([
                'error' => 'The verification code is invalid or expired. Request a new code and try again.',
            ], 422);
        }

        return response()->json([
            'reset_token' => $resetToken,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        if ($request->has(['email', 'token'])) {
            return $this->resetPasswordByEmail($request);
        }

        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:150'],
            'reset_token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = mb_strtolower(trim($validated['email']));
        $user = User::query()->where('email', $email)->first();
        if (! $user) {
            return response()->json([
                'error' => 'The password reset verification has expired. Request a new code and try again.',
            ], 422);
        }

        $reset = DB::transaction(function () use ($user, $email, $validated): bool {
            $challenge = DB::table('password_reset_verification_codes')
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (! $challenge
                || $challenge->email !== $email
                || $challenge->verified_at === null
                || now()->greaterThan($challenge->expires_at)
                || ! is_string($challenge->reset_token_hash)
                || ! hash_equals($challenge->reset_token_hash, hash('sha256', $validated['reset_token']))) {
                return false;
            }

            $user->forceFill([
                'password' => $validated['password'],
                'remember_token' => Str::random(60),
            ])->save();
            $user->tokens()->delete();
            DB::table('password_reset_verification_codes')->where('user_id', $user->id)->delete();

            return true;
        });

        if (! $reset) {
            return response()->json([
                'error' => 'The password reset verification has expired. Request a new code and try again.',
            ], 422);
        }

        return response()->json([
            'message' => 'Your password has been changed. You can now sign in with your new password.',
        ]);
    }

    private function resetPasswordByEmail(Request $request): JsonResponse
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
