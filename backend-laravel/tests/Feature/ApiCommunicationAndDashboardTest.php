<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ApiCommunicationAndDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_messages_are_limited_to_participants_and_student_scope(): void
    {
        $this->seedSchool();
        $this->seedStudent('S001', 'T001', 'P001', 'Grade 1', 'Sampaguita');
        $this->seedStudent('S002', 'T002', 'P002', 'Grade 2', 'Rosal');
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $this->makeUser('teacher', 'T002', 'otherteacher@example.test');
        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');
        $otherParent = $this->makeUser('parent', 'P002', 'otherparent@example.test');
        DB::table('messages')->insert([
            [
                'from_role' => 'teacher', 'from_id' => 'T001', 'from_name' => 'Teacher One',
                'to_role' => 'parent', 'to_id' => 'P001', 'subject' => 'Visible',
                'body' => 'Visible message', 'date' => '2026-10-28', 'time' => '09:00 AM',
                'is_read' => false, 'student_id' => 'S001',
            ],
            [
                'from_role' => 'teacher', 'from_id' => 'T002', 'from_name' => 'Teacher Two',
                'to_role' => 'parent', 'to_id' => 'P002', 'subject' => 'Private',
                'body' => 'Private message', 'date' => '2026-10-28', 'time' => '10:00 AM',
                'is_read' => false, 'student_id' => 'S002',
            ],
        ]);

        $this->getJson('/api/messages', $this->auth($parent))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.subject', 'Visible')
            ->assertJsonPath('0.read', false)
            ->assertJsonMissingPath('0.is_read');
        Auth::forgetGuards();

        $messageId = DB::table('messages')->where('subject', 'Visible')->value('id');
        $this->patchJson('/api/messages/'.$messageId.'/read', [], $this->auth($parent))
            ->assertOk()
            ->assertExactJson(['message' => 'Marked as read.']);
        Auth::forgetGuards();
        $this->patchJson('/api/messages/'.$messageId.'/read', [], $this->auth($parent))
            ->assertOk()
            ->assertExactJson(['message' => 'Marked as read.']);
        Auth::forgetGuards();

        $this->postJson('/api/messages', [
            'toRole' => 'parent',
            'toId' => 'P002',
            'subject' => 'Out of scope',
            'body' => 'Should not send',
            'studentId' => 'S002',
        ], $this->auth($teacher))->assertForbidden();
        Auth::forgetGuards();
        $this->postJson('/api/messages', [
            'toRole' => 'parent',
            'toId' => 'P002',
            'subject' => 'Unlinked parent',
            'body' => 'Should not send without a student.',
        ], $this->auth($teacher))->assertForbidden();
        Auth::forgetGuards();

        $sent = $this->postJson('/api/messages', [
            'toRole' => 'parent',
            'toId' => 'P001',
            'subject' => 'New message',
            'body' => 'Hello',
            'studentId' => 'S001',
        ], $this->auth($teacher))
            ->assertCreated()
            ->assertJsonPath('message', 'Message sent.')
            ->assertJsonPath('delivery', 'in_app');
        $this->assertDatabaseHas('messages', [
            'id' => $sent->json('id'),
            'from_role' => 'teacher',
            'from_id' => 'T001',
            'to_id' => 'P001',
            'student_id' => 'S001',
        ]);
        Auth::forgetGuards();

        $this->getJson('/api/messages?after='.($sent->json('id') - 1), $this->auth($parent))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.body', 'Hello');
        Auth::forgetGuards();

        $this->postJson('/api/messages', [
            'toRole' => 'teacher',
            'toId' => 'T002',
            'subject' => 'Unlinked teacher',
            'body' => 'Should not send to an unrelated teacher.',
        ], $this->auth($parent))->assertForbidden();
        Auth::forgetGuards();
        $this->postJson('/api/messages', [
            'toRole' => 'teacher',
            'toId' => 'T001',
            'subject' => 'Parent reply',
            'body' => 'Thank you for the update.',
            'studentId' => 'S001',
        ], $this->auth($parent))
            ->assertCreated()
            ->assertJsonPath('message', 'Message sent.');
        Auth::forgetGuards();
        $this->getJson('/api/messages', $this->auth($teacher))
            ->assertOk()
            ->assertJsonFragment(['body' => 'Thank you for the update.']);
        Auth::forgetGuards();

        $principal = $this->makeUser('admin', 'admin', 'principal@example.test');
        $this->postJson('/api/messages', [
            'toRole' => 'admin',
            'toId' => 'admin',
            'subject' => 'Principal update',
            'body' => 'Hello, Principal.',
        ], $this->auth($teacher))
            ->assertCreated()
            ->assertJsonPath('message', 'Message sent.');
        Auth::forgetGuards();

        $this->getJson('/api/messages', $this->auth($principal))
            ->assertOk()
            ->assertJsonFragment(['body' => 'Hello, Principal.']);
        Auth::forgetGuards();

        $this->patchJson('/api/messages/'.$messageId.'/read', [], $this->auth($otherParent))
            ->assertForbidden();
    }

    public function test_announcements_are_audience_scoped_and_teacher_managed_by_author(): void
    {
        $this->seedSchool();
        DB::table('announcements')->insert([
            ['title' => 'Everyone', 'body' => 'All roles', 'date' => '2026-10-27', 'audience' => 'all'],
            ['title' => 'Teachers', 'body' => 'Teachers only', 'date' => '2026-10-28', 'audience' => 'teacher'],
        ]);
        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');

        $this->getJson('/api/announcements', $this->auth($parent))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.title', 'Everyone');
        Auth::forgetGuards();

        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $this->getJson('/api/announcements', $this->auth($teacher))
            ->assertOk()
            ->assertJsonCount(2);
        Auth::forgetGuards();
        $teacherHeaders = $this->auth($teacher);
        $teacherCreated = $this->postJson('/api/announcements', [
            'title' => 'Class project',
            'body' => 'Prepare a short presentation.',
            'audience' => 'parent',
            'priority' => 'high',
            'category' => 'academic',
            'pinned' => true,
        ], $teacherHeaders)
            ->assertCreated()
            ->assertJsonPath('author_role', 'teacher')
            ->assertJsonPath('category', 'academic')
            ->assertJsonPath('pinned', true)
            ->assertJsonPath('can_manage', true);
        Auth::forgetGuards();

        $teacherAnnouncementId = $teacherCreated->json('id');
        $this->putJson('/api/announcements/'.$teacherAnnouncementId, [
            'title' => 'Updated class project',
        ], $teacherHeaders)->assertOk()->assertJsonPath('title', 'Updated class project');
        Auth::forgetGuards();

        $otherTeacher = $this->makeUser('teacher', 'T002', 'otherteacher@example.test');
        $otherAnnouncement = $this->postJson('/api/announcements', [
            'title' => 'Other class update',
            'body' => 'Owned by another teacher.',
        ], $this->auth($otherTeacher))->assertCreated();
        Auth::forgetGuards();
        $this->deleteJson('/api/announcements/'.$otherAnnouncement->json('id'), [], $teacherHeaders)
            ->assertForbidden();
        Auth::forgetGuards();

        $admin = $this->makeUser('admin', 'A001', 'admin@example.test');
        $headers = $this->auth($admin);
        $this->putJson('/api/announcements/'.$teacherAnnouncementId, [
            'title' => 'Changed by admin',
        ], $headers)->assertOk();
        Auth::forgetGuards();

        $created = $this->postJson('/api/announcements', [
            'title' => 'School update',
            'body' => 'Important update',
            'audience' => 'parent',
            'priority' => 'high',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('author_role', 'admin')
            ->assertJsonPath('priority', 'high');
        Auth::forgetGuards();

        $id = $created->json('id');
        $this->putJson('/api/announcements/'.$id, ['title' => 'Updated'], $headers)
            ->assertOk()
            ->assertJsonPath('title', 'Updated');
        Auth::forgetGuards();
        $this->deleteJson('/api/announcements/'.$id, [], $headers)
            ->assertOk()
            ->assertExactJson(['message' => 'Announcement deleted.']);

        $this->deleteJson('/api/announcements/'.$teacherAnnouncementId, [], $teacherHeaders)
            ->assertOk()
            ->assertExactJson(['message' => 'Announcement deleted.']);
    }

    public function test_assignments_are_class_scoped_and_teacher_dates_are_validated(): void
    {
        $this->seedSchool();
        $this->seedStudent('S001', 'T001', 'P001', 'Grade 1', 'Sampaguita');
        $this->seedStudent('S002', 'T002', 'P002', 'Grade 2', 'Rosal');
        DB::table('assignments')->insert([
            [
                'teacher_id' => 'T001', 'grade' => 'Grade 1', 'section' => 'Sampaguita',
                'title' => 'Reading', 'subject' => 'English', 'description' => 'Read a story',
                'assignment_date' => '2026-10-27', 'due_date' => null,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'teacher_id' => 'T002', 'grade' => 'Grade 2', 'section' => 'Rosal',
                'title' => 'Math', 'subject' => 'Math', 'description' => 'Solve problems',
                'assignment_date' => '2026-10-28', 'due_date' => null,
                'created_at' => now(), 'updated_at' => now(),
            ],
        ]);
        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');

        $this->getJson('/api/assignments', $this->auth($parent))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.title', 'Reading')
            ->assertJsonPath('0.author', 'Teacher One');
        Auth::forgetGuards();

        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $headers = $this->auth($teacher);
        $this->getJson('/api/assignments', $headers)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.title', 'Reading');
        Auth::forgetGuards();

        $this->postJson('/api/assignments', [
            'title' => 'Bad date',
            'subject' => 'English',
            'description' => 'Content',
            'assignmentDate' => '2026-10-30',
            'dueDate' => '2026-10-29',
        ], $headers)->assertUnprocessable();
        Auth::forgetGuards();

        $created = $this->postJson('/api/assignments', [
            'title' => 'Writing',
            'subject' => 'English',
            'description' => 'Write a paragraph',
            'workType' => 'project',
            'assignmentDate' => '2026-10-30',
            'dueDate' => '2026-11-02',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('author', 'Teacher One')
            ->assertJsonPath('grade', 'Grade 1')
            ->assertJsonPath('section', 'Sampaguita')
            ->assertJsonPath('work_type', 'project');
        $this->assertDatabaseHas('assignments', [
            'id' => $created->json('id'),
            'teacher_id' => 'T001',
        ]);
        Auth::forgetGuards();

        $this->putJson('/api/assignments/'.$created->json('id'), [
            'title' => 'Updated writing project',
            'subject' => 'English',
            'description' => 'Write a revised paragraph.',
            'workType' => 'assignment',
            'assignmentDate' => '2026-10-31',
            'dueDate' => '2026-11-03',
        ], $headers)
            ->assertOk()
            ->assertJsonPath('title', 'Updated writing project')
            ->assertJsonPath('work_type', 'assignment');
        $this->assertDatabaseHas('assignments', [
            'id' => $created->json('id'),
            'title' => 'Updated writing project',
            'description' => 'Write a revised paragraph.',
        ]);
        Auth::forgetGuards();

        $otherTeacher = $this->makeUser('teacher', 'T002', 'otherteacher@example.test');
        $this->putJson('/api/assignments/'.$created->json('id'), [
            'title' => 'Unauthorized update',
            'subject' => 'English',
            'description' => 'Should not change.',
            'workType' => 'project',
            'assignmentDate' => '2026-10-31',
        ], $this->auth($otherTeacher))->assertForbidden();
        Auth::forgetGuards();
        $this->deleteJson('/api/assignments/'.$created->json('id'), [], $this->auth($otherTeacher))
            ->assertForbidden();
        Auth::forgetGuards();
        $this->deleteJson('/api/assignments/'.$created->json('id'), [], $headers)
            ->assertOk()
            ->assertExactJson(['message' => 'Assignment deleted.']);
        Auth::forgetGuards();

        $admin = $this->makeUser('admin', 'A001', 'admin@example.test');
        $this->getJson('/api/assignments', $this->auth($admin))->assertForbidden();
    }

    public function test_grade_descriptions_are_saved_by_quarter_and_scoped_to_students(): void
    {
        $this->seedSchool();
        $this->seedStudent('S001', 'T001', 'P001', 'Grade 1', 'Sampaguita');
        $this->seedStudent('S002', 'T002', 'P002', 'Grade 2', 'Rosal');
        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $teacherHeaders = $this->auth($teacher);

        $this->putJson('/api/grade-descriptions', [
            'quarter' => 'Q2',
            'descriptions' => [
                'S001' => 'Participates actively in class.',
            ],
        ], $teacherHeaders)
            ->assertOk()
            ->assertExactJson(['message' => 'Grade descriptions saved.']);
        Auth::forgetGuards();

        $this->getJson('/api/grade-descriptions', $teacherHeaders)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.student_id', 'S001')
            ->assertJsonPath('0.quarter', 'Q2')
            ->assertJsonPath('0.description', 'Participates actively in class.');
        Auth::forgetGuards();

        $this->putJson('/api/grade-descriptions', [
            'quarter' => 'Q3',
            'descriptions' => ['S002' => 'Other class observation.'],
        ], $teacherHeaders)->assertForbidden();
        Auth::forgetGuards();

        $this->putJson('/api/grade-descriptions', [
            'quarter' => 'Q4',
            'descriptions' => ['S001' => 'Out of range quarter.'],
        ], $teacherHeaders)->assertUnprocessable();
        Auth::forgetGuards();

        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');
        $this->getJson('/api/grade-descriptions', $this->auth($parent))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.description', 'Participates actively in class.');
    }

    public function test_notifications_filter_by_role_and_mark_role_visible_records_read(): void
    {
        DB::table('notifications')->insert([
            ['title' => 'All', 'body' => 'Everyone', 'type' => 'normal', 'is_read' => false, 'role' => 'all'],
            ['title' => 'Parents', 'body' => 'Parents', 'type' => 'normal', 'is_read' => false, 'role' => 'parent'],
            ['title' => 'Teachers', 'body' => 'Teachers', 'type' => 'normal', 'is_read' => false, 'role' => 'teacher'],
        ]);
        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');

        $this->getJson('/api/notifications', $this->auth($parent))
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.read', false)
            ->assertJsonMissingPath('0.is_read');
        Auth::forgetGuards();

        $this->postJson('/api/notifications/mark-read', [], $this->auth($parent))
            ->assertOk()
            ->assertExactJson(['message' => 'All notifications marked as read.']);
        $this->assertDatabaseHas('notifications', ['title' => 'All', 'is_read' => true]);
        $this->assertDatabaseHas('notifications', ['title' => 'Parents', 'is_read' => true]);
        $this->assertDatabaseHas('notifications', ['title' => 'Teachers', 'is_read' => false]);
    }

    public function test_dashboard_aggregates_are_scoped_for_admin_teacher_and_parent(): void
    {
        $this->seedSchool();
        $this->seedStudent('S001', 'T001', 'P001', 'Grade 1', 'Sampaguita');
        $this->seedStudent('S002', 'T002', 'P002', 'Grade 2', 'Rosal');
        DB::table('grades')->insert([
            ['student_id' => 'S001', 'subject' => 'math', 'q1' => 80, 'q2' => 80, 'q3' => 80, 'q4' => 80],
            ['student_id' => 'S002', 'subject' => 'math', 'q1' => 100, 'q2' => 100, 'q3' => 100, 'q4' => 100],
        ]);
        DB::table('attendance')->where('student_id', 'S001')->update([
            'present' => 3, 'absent' => 1, 'total' => 4,
        ]);
        DB::table('messages')->insert([
            'from_role' => 'teacher', 'from_id' => 'T001', 'from_name' => 'Teacher One',
            'to_role' => 'parent', 'to_id' => 'P001', 'subject' => 'Unread',
            'body' => 'Unread message', 'date' => '2026-10-29', 'time' => '09:00 AM',
            'is_read' => false, 'student_id' => 'S001',
        ]);

        $teacher = $this->makeUser('teacher', 'T001', 'teacher@example.test');
        $this->getJson('/api/dashboard', $this->auth($teacher))
            ->assertOk()
            ->assertExactJson([
                'students' => 1,
                'classAverage' => 80,
                'attendanceRate' => 75,
                'unreadMessages' => 0,
            ]);
        Auth::forgetGuards();

        $admin = $this->makeUser('admin', 'A001', 'admin@example.test');
        $this->getJson('/api/dashboard', $this->auth($admin))
            ->assertOk()
            ->assertExactJson([
                'totalStudents' => 2,
                'totalTeachers' => 2,
                'schoolAverage' => 90,
                'outstanding' => 1,
            ]);
        Auth::forgetGuards();

        $parent = $this->makeUser('parent', 'P001', 'parent@example.test');
        $this->getJson('/api/dashboard', $this->auth($parent))
            ->assertOk()
            ->assertJsonPath('unreadMessages', 1)
            ->assertJsonCount(1, 'children')
            ->assertJsonPath('children.0.id', 'S001')
            ->assertJsonPath('children.0.grades.math', [80, 80, 80, 80])
            ->assertJsonPath('children.0.attendance.rate', 75);
    }

    private function seedSchool(): void
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

    private function seedStudent(string $id, string $teacherId, string $parentId, string $grade, string $section): void
    {
        DB::table('students')->insert([
            'id' => $id,
            'name' => 'Student '.$id,
            'grade' => $grade,
            'section' => $section,
            'gender' => 'F',
            'parent_id' => $parentId,
            'parent_name' => $parentId === 'P001' ? 'Parent One' : 'Parent Two',
            'parent_email' => $parentId === 'P001' ? 'parent1@example.test' : 'parent2@example.test',
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
