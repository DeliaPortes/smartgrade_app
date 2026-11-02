<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\InitialAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class InitialAdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_initial_admin_is_created_with_a_hashed_password(): void
    {
        config([
            'tracked.initial_admin_name' => 'School Admin',
            'tracked.initial_admin_email' => 'ADMIN@TRACKED.EDU',
            'tracked.initial_admin_password' => 'a-strong-password',
        ]);

        $this->seed(InitialAdminSeeder::class);

        $admin = User::query()->where('email', 'admin@tracked.edu')->firstOrFail();
        $this->assertSame('admin', $admin->role);
        $this->assertSame('admin', $admin->linked_id);
        $this->assertTrue(Hash::check('a-strong-password', $admin->password));
    }

    public function test_initial_admin_seeder_does_nothing_without_configuration(): void
    {
        config([
            'tracked.initial_admin_name' => null,
            'tracked.initial_admin_email' => null,
            'tracked.initial_admin_password' => null,
        ]);

        $this->seed(InitialAdminSeeder::class);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_initial_admin_seeder_does_not_overwrite_an_existing_admin(): void
    {
        $existingAdmin = User::factory()->create([
            'role' => 'admin',
            'linked_id' => 'admin',
            'email' => 'existing@tracked.edu',
            'password' => 'existing-password',
        ]);
        config([
            'tracked.initial_admin_name' => 'New Admin',
            'tracked.initial_admin_email' => 'new@tracked.edu',
            'tracked.initial_admin_password' => 'a-strong-password',
        ]);

        $this->seed(InitialAdminSeeder::class);

        $this->assertDatabaseCount('users', 1);
        $this->assertSame(
            $existingAdmin->password,
            $existingAdmin->fresh()->password,
        );
    }

    public function test_initial_admin_seeder_refuses_to_change_an_existing_non_admin_account(): void
    {
        $teacher = User::factory()->create([
            'role' => 'teacher',
            'email' => 'teacher@tracked.edu',
        ]);
        config([
            'tracked.initial_admin_name' => 'School Admin',
            'tracked.initial_admin_email' => 'teacher@tracked.edu',
            'tracked.initial_admin_password' => 'a-strong-password',
        ]);

        try {
            $this->seed(InitialAdminSeeder::class);
            $this->fail('The seeder should refuse to change a non-admin account.');
        } catch (RuntimeException $error) {
            $this->assertStringContainsString('already belongs to an account', $error->getMessage());
        }

        $this->assertSame('teacher', $teacher->fresh()->role);
        $this->assertDatabaseCount('users', 1);
    }
}
