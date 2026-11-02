<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DemoSchoolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DemoSchoolSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_seeder_is_disabled_without_explicit_local_opt_in(): void
    {
        config([
            'app.env' => 'local',
            'tracked.demo_seed_enabled' => false,
        ]);

        $this->seed(DemoSchoolSeeder::class);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_demo_seeder_creates_seven_role_accounts_and_linked_grade_records(): void
    {
        config([
            'app.env' => 'local',
            'tracked.demo_seed_enabled' => true,
            'tracked.demo_password' => 'password123',
        ]);

        $this->seed(DemoSchoolSeeder::class);

        $this->assertDatabaseCount('users', 7);
        $this->assertDatabaseCount('teachers', 3);
        $this->assertDatabaseCount('parents', 3);
        $this->assertDatabaseCount('students', 3);
        $this->assertDatabaseCount('classes', 3);
        $this->assertDatabaseCount('grades', 9);
        $this->assertDatabaseCount('attendance', 3);

        $this->assertDatabaseHas('users', [
            'email' => 'teacher@tracked.edu',
            'role' => 'teacher',
            'linked_id' => 'T001',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'parent@gmail.com',
            'role' => 'parent',
            'linked_id' => 'P003',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'admin@tracked.edu',
            'role' => 'admin',
            'linked_id' => 'admin',
        ]);
        $this->assertDatabaseHas('students', [
            'id' => 'S003',
            'teacher_id' => 'T003',
            'parent_id' => 'P003',
        ]);

        $this->assertTrue(Hash::check('password123', User::query()->where('email', 'admin@tracked.edu')->value('password')));

        $this->seed(DemoSchoolSeeder::class);
        $this->assertDatabaseCount('users', 7);
        $this->assertDatabaseCount('students', 3);
    }
}
