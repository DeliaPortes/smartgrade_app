<?php

namespace Tests\Feature;

use App\Jobs\SendPushNotification;
use App\Mail\AcademicAlertMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ApiAcademicRecordsTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_and_parent_only_receive_linked_students_and_grades(): void
    {
        $this->seedClassroom();
        $this->makeStudent('S001', 'T001', 'P001', 'Child One');
        $this->makeStudent('S002', 'T002', 'P002', 'Child Two');
        DB::table('grades')->insert([
            ['student_id' => 'S001', 'subject' => 'math', 'q1' => 80, 'q2' => 81, 'q3' => 82, 'q4' => 83],
            ['student_id' => 'S002', 'subject' => 'math', 'q1' => 60, 'q2' => 61, 'q3' => 62, 'q4' => 63],
        ]);

        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $this->getJson('/api/students', $this->auth($teacher))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', 'S001');
        Auth::forgetGuards();
        $this->getJson('/api/grades', $this->auth($teacher))
            ->assertOk()
            ->assertExactJson(['S001' => ['math' => [80, 81, 82, 83]]]);
        Auth::forgetGuards();

        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');
        $this->getJson('/api/students', $this->auth($parent))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', 'S001');
        Auth::forgetGuards();
        $this->getJson('/api/grades', $this->auth($parent))
            ->assertOk()
            ->assertExactJson(['S001' => ['math' => [80, 81, 82, 83]]]);
    }

    public function test_teacher_cannot_read_or_change_another_teachers_student(): void
    {
        $this->seedClassroom();
        $this->makeStudent('S002', 'T002', 'P002', 'Child Two');
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $headers = $this->auth($teacher);

        $this->getJson('/api/students/S002', $headers)
            ->assertForbidden()
            ->assertExactJson(['error' => 'Not allowed.']);
        Auth::forgetGuards();
        $this->putJson('/api/grades/S002/math', ['q1' => 50, 'q2' => 0, 'q3' => 0, 'q4' => 0], $headers)
            ->assertForbidden();

        $this->assertDatabaseMissing('grades', ['student_id' => 'S002']);
    }

    public function test_parent_can_only_read_linked_child_records_and_cannot_write_academic_data(): void
    {
        $this->seedClassroom();
        $this->makeStudent('S001', 'T001', 'P001', 'Child One');
        $this->makeStudent('S002', 'T002', 'P002', 'Child Two');
        DB::table('grades')->insert([
            ['student_id' => 'S001', 'subject' => 'math', 'q1' => 80, 'q2' => 81, 'q3' => 82, 'q4' => 83],
            ['student_id' => 'S002', 'subject' => 'math', 'q1' => 60, 'q2' => 61, 'q3' => 62, 'q4' => 63],
        ]);
        DB::table('attendance_records')->insert([
            ['student_id' => 'S001', 'attendance_date' => '2026-10-27', 'status' => 'Present'],
            ['student_id' => 'S002', 'attendance_date' => '2026-10-27', 'status' => 'Absent'],
        ]);

        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');
        $headers = $this->auth($parent);

        $this->getJson('/api/students', $headers)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', 'S001');
        Auth::forgetGuards();
        $this->getJson('/api/students/S002', $headers)->assertForbidden();
        Auth::forgetGuards();
        $this->getJson('/api/grades', $headers)
            ->assertOk()
            ->assertExactJson(['S001' => ['math' => [80, 81, 82, 83]]]);
        Auth::forgetGuards();
        $this->getJson('/api/attendance', $headers)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonMissingPath('S002');
        Auth::forgetGuards();

        $this->putJson('/api/grades/S002/math', [
            'q1' => 1, 'q2' => 1, 'q3' => 1, 'q4' => 1,
        ], $headers)->assertForbidden();
        Auth::forgetGuards();
        $this->putJson('/api/grades/bulk', [
            'S001' => ['math' => [90, 90, 90, 90]],
        ], $headers)->assertForbidden();
        Auth::forgetGuards();
        $this->postJson('/api/attendance/mark', [
            'date' => '2026-10-28',
            'records' => ['S001' => 'Absent'],
        ], $headers)->assertForbidden();

        $this->assertDatabaseHas('grades', [
            'student_id' => 'S001',
            'subject' => 'math',
            'q1' => 80,
        ]);
        $this->assertDatabaseHas('grades', [
            'student_id' => 'S002',
            'subject' => 'math',
            'q1' => 60,
        ]);
        $this->assertDatabaseMissing('attendance_records', [
            'student_id' => 'S001',
            'attendance_date' => '2026-10-28',
        ]);
    }

    public function test_unrecognized_role_is_denied_student_scope_by_default(): void
    {
        $this->seedClassroom();
        $this->makeStudent('S001', 'T001', 'P001', 'Child One');
        $user = $this->makeUser('observer', 'X001', 'observer@example.test');

        $this->getJson('/api/students', $this->auth($user))
            ->assertOk()
            ->assertExactJson([]);
        Auth::forgetGuards();
        $this->getJson('/api/students/S001', $this->auth($user))
            ->assertForbidden();
    }

    public function test_teacher_can_add_student_only_to_assigned_class(): void
    {
        $this->seedClassroom();
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $headers = $this->auth($teacher);

        $this->postJson('/api/students', [
            'name' => 'New Student',
            'grade' => 'Grade 1',
            'section' => 'Sampaguita',
            'gender' => 'F',
            'contact' => '09170000000',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('teacher_id', 'T001');

        $this->assertDatabaseHas('attendance', [
            'student_id' => $this->latestStudentId(),
            'total' => 0,
        ]);
        $this->assertDatabaseHas('grades', [
            'student_id' => $this->latestStudentId(),
            'subject' => 'math',
        ]);

        Auth::forgetGuards();
        $this->postJson('/api/students', [
            'name' => 'Out of Class',
            'grade' => 'Grade 2',
            'section' => 'Rosal',
            'gender' => 'M',
            'contact' => '09170000001',
        ], $headers)
            ->assertForbidden();
    }

    public function test_teacher_grade_entry_creates_one_parent_alert_for_a_failing_score(): void
    {
        $this->seedClassroom();
        $this->makeStudent('S001', 'T001', 'P001', 'Child One');
        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');
        $device = $parent->deviceTokens()->create([
            'token' => 'parent-device-token',
            'token_hash' => hash('sha256', 'parent-device-token'),
            'platform' => 'android',
        ]);
        Queue::fake();
        Mail::fake();
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $payload = ['q1' => 60, 'q2' => 80, 'q3' => 80, 'q4' => 80];

        $this->putJson('/api/grades/S001/math', $payload, $this->auth($teacher))
            ->assertOk()
            ->assertJsonPath('scores.0', 60);
        Queue::assertPushed(SendPushNotification::class, fn (SendPushNotification $job): bool => $job->deviceId === $device->id
            && $job->title === 'Academic Alert: S001 - Math (Q1)');
        Mail::assertQueued(AcademicAlertMail::class, fn (AcademicAlertMail $mail): bool => $mail->hasTo('parent@example.test')
            && $mail->alertTitle === 'Academic Alert: S001 - Math (Q1)'
            && str_contains($mail->alertBody, 'score of 60')
            && str_contains($mail->render(), 'score of 60'));
        $this->assertDatabaseHas('messages', [
            'to_role' => 'parent',
            'to_id' => 'P001',
            'student_id' => 'S001',
        ]);

        Auth::forgetGuards();
        $this->putJson('/api/grades/S001/math', $payload, $this->auth($teacher))->assertOk();
        $this->assertDatabaseCount('messages', 1);
        Queue::assertPushed(SendPushNotification::class, 1);
        Mail::assertQueued(AcademicAlertMail::class, 1);
    }

    public function test_bulk_grade_validation_and_student_scope_are_enforced(): void
    {
        $this->seedClassroom();
        $this->makeStudent('S001', 'T001', 'P001', 'Child One');
        $this->makeStudent('S002', 'T002', 'P002', 'Child Two');
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');

        $this->putJson('/api/grades/bulk', [
            'S001' => ['math' => [80, 81, 82, 83]],
            'S002' => ['math' => [60, 61, 62, 63]],
        ], $this->auth($teacher))
            ->assertForbidden();

        $this->assertDatabaseMissing('grades', ['student_id' => 'S001', 'subject' => 'math']);

        Auth::forgetGuards();
        $this->putJson('/api/grades/bulk', [
            'S001' => ['math' => [80, 101, 82, 83]],
        ], $this->auth($teacher))
            ->assertUnprocessable();
    }

    public function test_attendance_is_scoped_and_replacements_keep_correct_totals(): void
    {
        $this->seedClassroom();
        $this->makeStudent('S001', 'T001', 'P001', 'Child One');
        $this->makeStudent('S002', 'T002', 'P002', 'Child Two');
        DB::table('attendance_records')->insert([
            'student_id' => 'S001',
            'attendance_date' => '2026-10-27',
            'status' => 'Absent',
        ]);
        DB::table('attendance')->where('student_id', 'S001')->update(['absent' => 1, 'total' => 1]);
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $headers = $this->auth($teacher);

        $this->postJson('/api/attendance/mark', [
            'date' => '2026-10-27',
            'records' => ['S001' => 'Present'],
        ], $headers)->assertOk();
        $this->assertDatabaseHas('attendance', [
            'student_id' => 'S001',
            'present' => 1,
            'absent' => 0,
            'total' => 1,
        ]);

        Auth::forgetGuards();
        $this->postJson('/api/attendance/mark', [
            'date' => '2026-10-27',
            'records' => ['S002' => 'Absent'],
        ], $headers)->assertForbidden();

        Auth::forgetGuards();
        $this->getJson('/api/attendance', $headers)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('S001.days.2026-10-27', 'Present')
            ->assertJsonMissingPath('S002');
    }

    public function test_attendance_rejects_invalid_status_and_dates(): void
    {
        $this->seedClassroom();
        $this->makeStudent('S001', 'T001', 'P001', 'Child One');
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');

        $this->postJson('/api/attendance/mark', [
            'date' => 'not-a-date',
            'records' => ['S001' => 'Excused'],
        ], $this->auth($teacher))
            ->assertUnprocessable()
            ->assertJsonStructure(['error', 'errors']);

        $this->assertDatabaseCount('attendance_records', 0);
    }

    public function test_public_teacher_registration_and_admin_approval(): void
    {
        $this->seedClassroom();
        $this->postJson('/api/pending-teachers', [
            'name' => 'New Teacher',
            'email' => 'NewTeacher@Example.Test',
            'password' => 'teacher-password',
            'grade' => 'Grade 2',
            'section' => 'Rosal',
        ])
            ->assertCreated()
            ->assertJsonStructure(['message']);

        $pending = DB::table('pending_teachers')->first();
        $this->assertSame('newteacher@example.test', $pending->email);
        $this->assertTrue(password_verify('teacher-password', $pending->password));

        $admin = $this->makeUser('admin', 'A001', 'admin@example.test');
        $this->getJson('/api/pending-teachers', $this->auth($admin))
            ->assertOk()
            ->assertJsonMissingPath('0.password');
        Auth::forgetGuards();

        $this->postJson('/api/pending-teachers/'.$pending->id.'/approve', [], $this->auth($admin))
            ->assertOk()
            ->assertJsonStructure(['message']);
        $this->assertDatabaseHas('teachers', ['email' => 'newteacher@example.test']);
        $this->assertDatabaseHas('users', [
            'email' => 'newteacher@example.test',
            'role' => 'teacher',
        ]);
        $this->assertDatabaseHas('pending_teachers', [
            'id' => $pending->id,
            'status' => 'approved',
        ]);

        Auth::forgetGuards();
        $this->postJson('/api/pending-teachers/'.$pending->id.'/approve', [], $this->auth($admin))
            ->assertNotFound();
        $this->assertDatabaseCount('teachers', 3);
        $this->assertDatabaseCount('users', 2);
    }

    private function seedClassroom(): void
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

    private function makeStudent(string $id, string $teacherId, string $parentId, string $name): void
    {
        DB::table('students')->insert([
            'id' => $id,
            'name' => $name,
            'grade' => $teacherId === 'T001' ? 'Grade 1' : 'Grade 2',
            'section' => $teacherId === 'T001' ? 'Sampaguita' : 'Rosal',
            'gender' => 'F',
            'parent_id' => $parentId,
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

    private function latestStudentId(): string
    {
        return (string) DB::table('students')->orderByDesc('id')->value('id');
    }
}
