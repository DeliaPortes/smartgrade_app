<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ApiDirectoryManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_teacher_account(): void
    {
        $admin = $this->makeUser('admin', 'A001', 'admin@example.test');
        $headers = $this->auth($admin);

        $created = $this->postJson('/api/teachers', [
            'name' => 'Teacher One',
            'email' => 'teacher@example.test',
            'grade' => 'Grade 1',
            'section' => 'Sampaguita',
            'password' => 'teacher-password',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('name', 'Teacher One')
            ->assertJsonPath('status', 'active');
        Auth::forgetGuards();

        $teacherId = $created->json('id');
        $this->assertDatabaseHas('users', [
            'role' => 'teacher',
            'linked_id' => $teacherId,
            'email' => 'teacher@example.test',
        ]);
        $this->assertTrue(password_verify(
            'teacher-password',
            DB::table('users')->where('linked_id', $teacherId)->value('password')
        ));

        $this->putJson('/api/teachers/'.$teacherId, [
            'name' => 'Updated Teacher',
            'grade' => 'Grade 2',
        ], $headers)
            ->assertOk()
            ->assertJsonPath('name', 'Updated Teacher')
            ->assertJsonPath('grade', 'Grade 2');
        Auth::forgetGuards();

        $this->deleteJson('/api/teachers/'.$teacherId, [], $headers)
            ->assertOk()
            ->assertExactJson(['message' => 'Teacher deleted.']);
        $this->assertDatabaseMissing('teachers', ['id' => $teacherId]);
        $this->assertDatabaseMissing('users', ['role' => 'teacher', 'linked_id' => $teacherId]);
    }

    public function test_teacher_cannot_manage_teacher_directory(): void
    {
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $headers = $this->auth($teacher);

        $this->postJson('/api/teachers', [
            'name' => 'Other Teacher',
            'email' => 'other@example.test',
            'grade' => 'Grade 1',
            'section' => 'Sampaguita',
        ], $headers)->assertForbidden();
    }

    public function test_admin_can_manage_classes_and_teacher_cannot_write_them(): void
    {
        $this->seedTeacherAndParent();
        $admin = $this->makeUser('admin', 'A001', 'admin@example.test');
        $headers = $this->auth($admin);

        $created = $this->postJson('/api/classes', [
            'grade' => 'Grade 1',
            'section' => 'Sampaguita',
            'teacherId' => 'T001',
            'year' => '2026-2027',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('teacher_id', 'T001')
            ->assertJsonPath('year', '2026-2027');
        Auth::forgetGuards();

        $classId = $created->json('id');
        $this->putJson('/api/classes/'.$classId, ['year' => '2027-2028'], $headers)
            ->assertOk()
            ->assertJsonPath('year', '2027-2028');
        Auth::forgetGuards();

        $this->deleteJson('/api/classes/'.$classId, [], $headers)
            ->assertOk()
            ->assertExactJson(['message' => 'Class deleted.']);
        $this->assertDatabaseMissing('classes', ['id' => $classId]);

        Auth::forgetGuards();
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $this->postJson('/api/classes', [
            'grade' => 'Grade 1',
            'section' => 'Sampaguita',
        ], $this->auth($teacher))->assertForbidden();
    }

    public function test_parent_directory_is_scoped_and_parent_creation_checks_student_access(): void
    {
        $this->seedTeacherAndParent();
        $this->seedStudent('S001', 'T001', 'P001');
        $this->seedStudent('S002', 'T002', 'P002');
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $headers = $this->auth($teacher);

        $this->getJson('/api/parents', $headers)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', 'P001')
            ->assertJsonPath('0.children.0', 'S001')
            ->assertJsonPath('0.has_account', false);
        Auth::forgetGuards();

        $this->postJson('/api/parents', [
            'name' => 'New Parent',
            'email' => 'newparent@example.test',
            'password' => 'parent-password',
            'childId' => 'S002',
        ], $headers)->assertForbidden();
        Auth::forgetGuards();

        $created = $this->postJson('/api/parents', [
            'name' => 'New Parent',
            'email' => 'newparent@example.test',
            'password' => 'parent-password',
            'childId' => 'S001',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('name', 'New Parent')
            ->assertJsonPath('children.0', 'S001')
            ->assertJsonPath('has_account', true);
        Auth::forgetGuards();

        $this->assertDatabaseHas('students', [
            'id' => 'S001',
            'parent_id' => $created->json('id'),
        ]);
        $this->assertDatabaseHas('users', [
            'role' => 'parent',
            'linked_id' => $created->json('id'),
        ]);
    }

    public function test_teacher_parent_update_and_delete_only_affect_their_students(): void
    {
        $this->seedTeacherAndParent();
        $this->seedStudent('S001', 'T001', 'P001');
        $this->seedStudent('S002', 'T002', 'P001');
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $headers = $this->auth($teacher);

        $this->putJson('/api/parents/P001', ['name' => 'Updated Parent'], $headers)
            ->assertOk()
            ->assertJsonPath('name', 'Updated Parent');
        Auth::forgetGuards();
        $this->assertDatabaseHas('students', ['id' => 'S001', 'parent_name' => 'Updated Parent']);
        $this->assertDatabaseHas('students', ['id' => 'S002', 'parent_name' => 'Parent One']);

        $this->deleteJson('/api/parents/P001', [], $headers)
            ->assertOk()
            ->assertExactJson([
                'message' => 'Parent unlinked from your class.',
                'deleted' => false,
            ]);
        $this->assertDatabaseHas('parents', ['id' => 'P001']);
        $this->assertDatabaseHas('students', ['id' => 'S001', 'parent_id' => null]);
        $this->assertDatabaseHas('students', ['id' => 'S002', 'parent_id' => 'P001']);
    }

    public function test_parent_can_only_view_and_update_their_own_directory_record(): void
    {
        $this->seedTeacherAndParent();
        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');
        $headers = $this->auth($parent);

        $this->getJson('/api/parents', $headers)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', 'P001');
        Auth::forgetGuards();

        $this->getJson('/api/parents/P002', $headers)->assertForbidden();
        Auth::forgetGuards();

        $this->putJson('/api/parents/P001', ['name' => 'Self Updated'], $headers)
            ->assertOk()
            ->assertJsonPath('name', 'Self Updated');
        Auth::forgetGuards();

        $this->putJson('/api/parents/P002', ['name' => 'Not Yours'], $headers)
            ->assertForbidden();
    }

    private function seedTeacherAndParent(): void
    {
        DB::table('teachers')->insert([
            ['id' => 'T001', 'name' => 'Teacher One', 'email' => 'teacher1@example.test', 'grade' => 'Grade 1', 'section' => 'Sampaguita'],
            ['id' => 'T002', 'name' => 'Teacher Two', 'email' => 'teacher2@example.test', 'grade' => 'Grade 2', 'section' => 'Rosal'],
        ]);
        DB::table('parents')->insert([
            ['id' => 'P001', 'name' => 'Parent One', 'email' => 'parent1@example.test'],
            ['id' => 'P002', 'name' => 'Parent Two', 'email' => 'parent2@example.test'],
        ]);
    }

    private function seedStudent(string $id, string $teacherId, string $parentId): void
    {
        DB::table('students')->insert([
            'id' => $id,
            'name' => 'Student '.$id,
            'grade' => $teacherId === 'T001' ? 'Grade 1' : 'Grade 2',
            'section' => $teacherId === 'T001' ? 'Sampaguita' : 'Rosal',
            'gender' => 'F',
            'parent_id' => $parentId,
            'parent_name' => 'Parent One',
            'parent_email' => 'parent1@example.test',
            'teacher_id' => $teacherId,
            'contact' => '09170000000',
            'status' => 'active',
        ]);
        DB::table('attendance')->insert(['student_id' => $id]);
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
