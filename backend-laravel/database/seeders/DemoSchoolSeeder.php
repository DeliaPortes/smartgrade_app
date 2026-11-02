<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoSchoolSeeder extends Seeder
{
    public function run(): void
    {
        if (
            config('app.env') !== 'local' ||
            ! filter_var(config('tracked.demo_seed_enabled'), FILTER_VALIDATE_BOOL)
        ) {
            $this->command?->warn(
                'Demo data was not seeded. Set APP_ENV=local and TRACKED_SEED_DEMO_DATA=true to enable it.'
            );

            return;
        }

        $password = (string) config('tracked.demo_password');
        if ($password === '') {
            throw new \RuntimeException('TRACKED_DEMO_PASSWORD must not be empty.');
        }

        DB::transaction(function () use ($password): void {
            $teachers = [
                ['id' => 'T001', 'name' => 'Ms. Maria Santos', 'email' => 'teacher@tracked.edu', 'phone' => '09171111111', 'grade' => 'Grade 1', 'section' => 'Sampaguita', 'subjects' => 'All Subjects', 'status' => 'active', 'joined' => '2020-06-01'],
                ['id' => 'T002', 'name' => 'Mr. Pedro Reyes', 'email' => 'preyes@tracked.edu', 'phone' => '09182222222', 'grade' => 'Grade 2', 'section' => 'Rosal', 'subjects' => 'All Subjects', 'status' => 'active', 'joined' => '2019-06-01'],
                ['id' => 'T003', 'name' => 'Ms. Carmen Lim', 'email' => 'clim@tracked.edu', 'phone' => '09193333333', 'grade' => 'Grade 3', 'section' => 'Gumamela', 'subjects' => 'All Subjects', 'status' => 'active', 'joined' => '2021-06-01'],
            ];
            $parents = [
                ['id' => 'P001', 'name' => 'Mrs. Liza Reyes', 'email' => 'lreyes@gmail.com', 'phone' => '09171234567'],
                ['id' => 'P002', 'name' => 'Mr. Carlos Gomez', 'email' => 'cgomez@gmail.com', 'phone' => '09182345678'],
                ['id' => 'P003', 'name' => 'Mr. Juan Dela Cruz', 'email' => 'parent@gmail.com', 'phone' => '09193456789'],
            ];
            $students = [
                ['id' => 'S001', 'lrn' => '100200300001', 'name' => 'Maria Reyes', 'grade' => 'Grade 1', 'section' => 'Sampaguita', 'gender' => 'F', 'parent_name' => 'Mrs. Liza Reyes', 'parent_email' => 'lreyes@gmail.com', 'parent_id' => 'P001', 'teacher_id' => 'T001', 'contact' => '09171234567', 'status' => 'active', 'enrolled' => '2024-06-01'],
                ['id' => 'S002', 'lrn' => '100200300002', 'name' => 'Juan Gomez', 'grade' => 'Grade 2', 'section' => 'Rosal', 'gender' => 'M', 'parent_name' => 'Mr. Carlos Gomez', 'parent_email' => 'cgomez@gmail.com', 'parent_id' => 'P002', 'teacher_id' => 'T002', 'contact' => '09182345678', 'status' => 'active', 'enrolled' => '2024-06-01'],
                ['id' => 'S003', 'lrn' => '100200300003', 'name' => 'Jose Dela Cruz Jr.', 'grade' => 'Grade 3', 'section' => 'Gumamela', 'gender' => 'M', 'parent_name' => 'Mr. Juan Dela Cruz', 'parent_email' => 'parent@gmail.com', 'parent_id' => 'P003', 'teacher_id' => 'T003', 'contact' => '09193456789', 'status' => 'active', 'enrolled' => '2024-06-01'],
            ];

            foreach ($teachers as $teacher) {
                DB::table('teachers')->updateOrInsert(['id' => $teacher['id']], $teacher);
                User::query()->updateOrCreate(
                    ['email' => $teacher['email']],
                    [
                        'role' => 'teacher',
                        'linked_id' => $teacher['id'],
                        'name' => $teacher['name'],
                        'phone' => $teacher['phone'],
                        'password' => $password,
                    ]
                );
            }

            foreach ($parents as $parent) {
                DB::table('parents')->updateOrInsert(['id' => $parent['id']], $parent);
                User::query()->updateOrCreate(
                    ['email' => $parent['email']],
                    [
                        'role' => 'parent',
                        'linked_id' => $parent['id'],
                        'name' => $parent['name'],
                        'phone' => $parent['phone'],
                        'password' => $password,
                    ]
                );
            }

            User::query()->updateOrCreate(
                ['email' => 'admin@tracked.edu'],
                [
                    'role' => 'admin',
                    'linked_id' => 'admin',
                    'name' => 'Principal Roberto Cruz',
                    'phone' => null,
                    'school' => 'Polangui South Central School',
                    'password' => $password,
                ]
            );

            foreach ($students as $student) {
                DB::table('students')->updateOrInsert(['id' => $student['id']], $student);
                DB::table('attendance')->updateOrInsert(
                    ['student_id' => $student['id']],
                    ['present' => 42, 'absent' => 2, 'half_day' => 0, 'tardy' => 1, 'late' => 0, 'total' => 45]
                );

                foreach (['math' => [88, 90, 87, 91], 'english' => [85, 88, 90, 89], 'filipino' => [86, 87, 89, 90]] as $subject => $scores) {
                    DB::table('grades')->updateOrInsert(
                        ['student_id' => $student['id'], 'subject' => $subject],
                        ['q1' => $scores[0], 'q2' => $scores[1], 'q3' => $scores[2], 'q4' => $scores[3]]
                    );
                }
            }

            foreach ($teachers as $index => $teacher) {
                $number = $index + 1;
                DB::table('classes')->updateOrInsert(
                    ['id' => 'C00'.$number],
                    [
                        'grade' => $teacher['grade'],
                        'section' => $teacher['section'],
                        'teacher_id' => $teacher['id'],
                        'year' => '2026-2027',
                    ]
                );
            }
        });

        $this->command?->info(
            'Seeded three teachers, three parents, one principal, and linked Grade 1–3 sample records.'
        );
    }
}
