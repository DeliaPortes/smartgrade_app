<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\PasswordResetCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware(['auth:sanctum', 'role:admin'])
            ->get('/api/testing/admin', fn () => response()->json(['authorized' => true]));
    }

    public function test_login_returns_a_bearer_token_and_legacy_user_shape(): void
    {
        $user = $this->makeUser();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', 'A001')
            ->assertJsonPath('user.linked_id', 'A001')
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonMissingPath('user.password');

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'tracked-app',
            'expires_at' => null,
        ]);
    }

    public function test_remember_me_creates_a_token_that_expires_after_seven_days(): void
    {
        $user = $this->makeUser();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
            'remember' => true,
        ])->assertOk()->assertJsonPath('expires_at', now()->addDays(7)->toIso8601String());

        $token = DB::table('personal_access_tokens')
            ->where('tokenable_id', $user->id)
            ->first();
        $this->assertNotNull($token?->expires_at);
        $this->assertEqualsWithDelta(
            now()->addDays(7)->timestamp,
            strtotime($token->expires_at),
            2
        );
    }

    public function test_invalid_credentials_return_401_without_creating_a_token(): void
    {
        $user = $this->makeUser();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'incorrect',
        ])
            ->assertUnauthorized()
            ->assertExactJson(['error' => 'Invalid email or password.']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_validation_uses_the_api_error_shape(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'not-an-email'])
            ->assertUnprocessable()
            ->assertJsonStructure(['error', 'errors' => ['email']]);
    }

    public function test_email_password_reset_requires_code_and_revokes_existing_tokens(): void
    {
        Notification::fake();
        config(['mail.default' => 'smtp']);
        $user = $this->makeUser();
        $sentCode = null;
        $user->createToken('existing-device');

        $this->postJson('/api/auth/forgot-password', ['email' => strtoupper($user->email)])
            ->assertOk()
            ->assertExactJson([
                'message' => 'If an account matches that email, a verification code will be sent.',
            ]);

        Notification::assertSentOnDemand(
            PasswordResetCodeNotification::class,
            function (PasswordResetCodeNotification $notification, array $channels, object $notifiable) use (&$sentCode, $user): bool {
                $sentCode = $notification->code;

                return $channels === ['mail']
                    && $notifiable->routes['mail'] === $user->email;
            }
        );
        $challenge = DB::table('password_reset_verification_codes')->where('user_id', $user->id)->first();
        $this->assertNotNull($sentCode);
        $this->assertTrue(Hash::check($sentCode, $challenge->code_hash));

        $this->postJson('/api/auth/verify-reset-code', [
            'email' => $user->email,
            'code' => $sentCode === '999999' ? '000000' : '999999',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('error', 'The verification code is invalid or expired. Request a new code and try again.');
        $this->assertDatabaseHas('password_reset_verification_codes', [
            'user_id' => $user->id,
            'attempts' => 1,
        ]);

        $verified = $this->postJson('/api/auth/verify-reset-code', [
            'email' => $user->email,
            'code' => $sentCode,
        ])->assertOk()->json('reset_token');

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'reset_token' => $verified,
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Your password has been changed. You can now sign in with your new password.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertDatabaseCount('password_reset_verification_codes', 0);
        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'new-secure-password',
        ])->assertOk();
    }

    public function test_email_password_reset_does_not_send_codes_to_unknown_addresses(): void
    {
        Notification::fake();
        config(['mail.default' => 'smtp']);

        $this->postJson('/api/auth/forgot-password', ['email' => 'missing@example.test'])
            ->assertOk()
            ->assertExactJson([
                'message' => 'If an account matches that email, a verification code will be sent.',
            ]);

        Notification::assertNothingSent();
        $this->assertDatabaseCount('password_reset_verification_codes', 0);
    }

    public function test_email_password_reset_fails_when_mail_is_only_logged_locally(): void
    {
        config(['mail.default' => 'log']);

        $this->postJson('/api/auth/forgot-password', ['email' => 'admin@example.test'])
            ->assertServiceUnavailable()
            ->assertExactJson([
                'error' => 'Email verification is not configured. Please contact the school administrator.',
            ]);
    }

    public function test_reset_password_page_contains_the_email_and_token(): void
    {
        $this->get('/reset-password/test-token?email=admin%40example.test')
            ->assertOk()
            ->assertSee('Reset your password')
            ->assertSee('admin@example.test')
            ->assertSee('test-token');
    }

    public function test_reset_password_updates_the_password_and_revokes_existing_tokens(): void
    {
        $user = $this->makeUser();
        $user->createToken('existing-device');
        $resetToken = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $resetToken,
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Your password has been reset. You can now sign in with your new password.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'new-secure-password',
        ])->assertOk();
        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertUnauthorized();
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_reset_password_rejects_invalid_tokens_and_unconfirmed_passwords(): void
    {
        $user = $this->makeUser();

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => 'invalid-token',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('error', 'This password reset link is invalid or has expired. Request a new one and try again.');

        $token = Password::createToken($user);
        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'new-secure-password',
            'password_confirmation' => 'different-password',
        ])
            ->assertUnprocessable()
            ->assertJsonStructure(['error', 'errors' => ['password']]);
    }

    public function test_protected_profile_requires_a_valid_bearer_token(): void
    {
        $this->getJson('/api/me')
            ->assertUnauthorized()
            ->assertExactJson(['error' => 'Unauthenticated.']);

        $this->getJson('/api/me', ['Authorization' => 'Bearer invalid-token'])
            ->assertUnauthorized();
    }

    public function test_profile_returns_the_authenticated_users_role_data(): void
    {
        $user = $this->makeUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->getJson('/api/me', ['Authorization' => 'Bearer '.$token])
            ->assertOk()
            ->assertJsonPath('id', 'A001')
            ->assertJsonPath('role', 'admin')
            ->assertJsonMissingPath('password');
    }

    public function test_logout_revokes_the_current_access_token(): void
    {
        $user = $this->makeUser();
        $token = $user->createToken('test')->plainTextToken;
        $headers = ['Authorization' => 'Bearer '.$token];

        $this->postJson('/api/auth/logout', [], $headers)
            ->assertOk()
            ->assertExactJson(['message' => 'Logged out.']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
        Auth::forgetGuards();
        $this->getJson('/api/me', $headers)->assertUnauthorized();
    }

    public function test_expired_bearer_token_is_rejected(): void
    {
        config(['sanctum.expiration' => 1]);
        $user = $this->makeUser();
        $token = $user->createToken('test')->plainTextToken;
        DB::table('personal_access_tokens')->update([
            'created_at' => now()->subMinutes(2),
        ]);

        $this->getJson('/api/me', ['Authorization' => 'Bearer '.$token])
            ->assertUnauthorized()
            ->assertExactJson(['error' => 'Unauthenticated.']);
    }

    public function test_profile_update_validates_fields_and_hashes_new_password(): void
    {
        $user = $this->makeUser();
        $headers = ['Authorization' => 'Bearer '.$user->createToken('test')->plainTextToken];

        $this->patchJson('/api/me', [], $headers)
            ->assertUnprocessable()
            ->assertJsonStructure(['error', 'errors']);

        $this->patchJson('/api/me', [
            'name' => 'Updated Admin',
            'password' => 'new-secure-password',
        ], $headers)
            ->assertOk()
            ->assertJsonPath('name', 'Updated Admin')
            ->assertJsonMissingPath('password');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Admin']);
        $this->assertTrue(password_verify(
            'new-secure-password',
            DB::table('users')->where('id', $user->id)->value('password')
        ));
    }

    public function test_parent_without_a_linked_student_cannot_sign_in(): void
    {
        $user = $this->makeUser([
            'role' => 'parent',
            'linked_id' => 'P001',
            'email' => 'parent@example.test',
        ]);
        DB::table('parents')->insert([
            'id' => 'P001',
            'name' => 'Parent One',
            'email' => 'parent@example.test',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertExactJson([
                'error' => 'Parent account is not linked to a student. Please contact the school.',
            ]);
    }

    public function test_role_middleware_allows_admin_and_rejects_teacher(): void
    {
        $admin = $this->makeUser();
        $adminToken = $admin->createToken('admin-test')->plainTextToken;

        $this->getJson('/api/testing/admin', [
            'Authorization' => 'Bearer '.$adminToken,
        ])
            ->assertOk()
            ->assertExactJson(['authorized' => true]);
        Auth::forgetGuards();

        $teacher = $this->makeUser([
            'role' => 'teacher',
            'linked_id' => 'T001',
            'email' => 'teacher@example.test',
        ]);
        $teacherToken = $teacher->createToken('teacher-test')->plainTextToken;

        $this->getJson('/api/testing/admin', [
            'Authorization' => 'Bearer '.$teacherToken,
        ])
            ->assertForbidden()
            ->assertExactJson(['error' => 'Not allowed.']);
    }

    public function test_parent_is_rejected_by_admin_only_routes(): void
    {
        $parent = $this->makeUser([
            'role' => 'parent',
            'linked_id' => 'P001',
            'email' => 'parent@example.test',
        ]);
        $token = $parent->createToken('parent-test')->plainTextToken;

        $this->getJson('/api/testing/admin', [
            'Authorization' => 'Bearer '.$token,
        ])
            ->assertForbidden()
            ->assertExactJson(['error' => 'Not allowed.']);
    }

    public function test_login_is_rate_limited_by_email_and_ip(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/auth/login', [
                'email' => 'missing@example.test',
                'password' => 'wrong-password',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/auth/login', [
            'email' => 'missing@example.test',
            'password' => 'wrong-password',
        ])
            ->assertTooManyRequests()
            ->assertExactJson(['error' => 'Too many requests.']);
    }

    private function makeUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'admin',
            'linked_id' => 'A001',
            'email' => 'admin@example.test',
            'password' => 'password123',
        ], $attributes));
    }
}
