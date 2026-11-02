<?php

namespace Tests\Feature;

use App\Jobs\SendPushNotification;
use App\Models\User;
use App\Services\FirebaseMessagingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class ApiDeviceTest extends TestCase
{
    use RefreshDatabase;

    public function test_push_job_uses_the_server_stored_device_token(): void
    {
        $user = $this->makeUser('parent', 'P001', 'parent@example.test');
        $device = $user->deviceTokens()->create([
            'token' => 'server-stored-token',
            'token_hash' => hash('sha256', 'server-stored-token'),
            'platform' => 'android',
        ]);

        $this->mock(FirebaseMessagingService::class)
            ->shouldReceive('sendToToken')
            ->once()
            ->with('server-stored-token', 'Academic alert', 'Please review the grade.');

        (new SendPushNotification($device->id, 'Academic alert', 'Please review the grade.'))
            ->handle(app(FirebaseMessagingService::class));
    }

    public function test_authenticated_user_can_register_and_refresh_device_token(): void
    {
        $user = $this->makeUser('parent', 'P001', 'parent@example.test');
        $headers = $this->auth($user);

        $first = $this->postJson('/api/devices', [
            'token' => 'device-token-one',
            'platform' => 'android',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('registered', true)
            ->assertJsonMissingPath('token');

        $id = $first->json('id');
        $this->assertDatabaseHas('device_tokens', [
            'id' => $id,
            'user_id' => $user->id,
            'token_hash' => hash('sha256', 'device-token-one'),
            'platform' => 'android',
        ]);

        Auth::forgetGuards();
        $this->postJson('/api/devices', [
            'token' => 'device-token-one',
            'platform' => 'ios',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('id', $id);

        $this->assertDatabaseCount('device_tokens', 1);
        $this->assertDatabaseHas('device_tokens', [
            'id' => $id,
            'user_id' => $user->id,
            'platform' => 'ios',
        ]);
    }

    public function test_registering_existing_device_moves_it_to_current_user(): void
    {
        $firstUser = $this->makeUser('parent', 'P001', 'parent@example.test');
        $device = $firstUser->deviceTokens()->create([
            'token' => 'shared-device-token',
            'token_hash' => hash('sha256', 'shared-device-token'),
            'platform' => 'android',
        ]);
        $secondUser = $this->makeUser('teacher', 'T001', 'teacher@example.test');

        $response = $this->postJson('/api/devices', [
            'token' => 'shared-device-token',
            'platform' => 'android',
        ], $this->auth($secondUser))
            ->assertCreated()
            ->assertJsonPath('id', $device->id);

        $this->assertDatabaseCount('device_tokens', 1);
        $this->assertDatabaseHas('device_tokens', [
            'id' => $response->json('id'),
            'user_id' => $secondUser->id,
        ]);
    }

    public function test_user_can_delete_only_their_own_device_token(): void
    {
        $owner = $this->makeUser('parent', 'P001', 'parent@example.test');
        $other = $this->makeUser('parent', 'P002', 'otherparent@example.test');
        $device = $owner->deviceTokens()->create([
            'token' => 'private-device-token',
            'token_hash' => hash('sha256', 'private-device-token'),
            'platform' => 'android',
        ]);

        $this->deleteJson('/api/devices/'.$device->id, [], $this->auth($other))
            ->assertForbidden();
        $this->assertDatabaseHas('device_tokens', ['id' => $device->id]);
        Auth::forgetGuards();

        $this->deleteJson('/api/devices/'.$device->id, [], $this->auth($owner))
            ->assertOk()
            ->assertExactJson(['message' => 'Device unregistered.']);
        $this->assertDatabaseMissing('device_tokens', ['id' => $device->id]);
    }

    public function test_device_registration_requires_supported_platform_and_token(): void
    {
        $user = $this->makeUser('parent', 'P001', 'parent@example.test');

        $this->postJson('/api/devices', [
            'token' => 'device-token',
            'platform' => 'desktop',
        ], $this->auth($user))
            ->assertUnprocessable()
            ->assertJsonStructure(['error', 'errors' => ['platform']]);
        Auth::forgetGuards();

        $this->postJson('/api/devices', ['platform' => 'android'], $this->auth($user))
            ->assertUnprocessable()
            ->assertJsonStructure(['error', 'errors' => ['token']]);

        $this->assertDatabaseCount('device_tokens', 0);
    }

    private function makeUser(string $role, string $linkedId, string $email): User
    {
        return User::factory()->create([
            'role' => $role,
            'linked_id' => $linkedId,
            'email' => $email,
            'password' => 'password123',
        ]);
    }

    private function auth(User $user): array
    {
        return ['Authorization' => 'Bearer '.$user->createToken('test')->plainTextToken];
    }
}
