<?php

namespace App\Services;

use App\Jobs\SendPushNotification;
use App\Mail\AcademicAlertMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class GradeService
{
    public function __construct(private readonly StudentAccess $studentAccess) {}

    public function getFor(User $user): array
    {
        $query = DB::table('grades as g')
            ->join('students as s', 's.id', '=', 'g.student_id')
            ->select('g.student_id', 'g.subject', 'g.q1', 'g.q2', 'g.q3', 'g.q4');

        if ($user->role !== 'admin') {
            $query->whereIn('s.id', $this->studentAccess->queryFor($user)->select('id'));
        }

        $grades = [];
        foreach ($query->get() as $row) {
            $grades[$row->student_id][$row->subject] = [
                (int) $row->q1,
                (int) $row->q2,
                (int) $row->q3,
                (int) $row->q4,
            ];
        }

        return $grades;
    }

    public function save(User $user, array $grades): void
    {
        DB::transaction(function () use ($user, $grades): void {
            foreach ($grades as $studentId => $subjects) {
                abort_unless(
                    $this->studentAccess->canAccess($user, (string) $studentId),
                    403,
                    'Not allowed.'
                );

                foreach ($subjects as $subject => $scores) {
                    $scoreData = array_combine(['q1', 'q2', 'q3', 'q4'], array_values($scores));
                    $existing = DB::table('grades')
                        ->where('student_id', $studentId)
                        ->where('subject', $subject)
                        ->first();

                    DB::table('grades')->updateOrInsert(
                        ['student_id' => $studentId, 'subject' => $subject],
                        $scoreData
                    );

                    foreach ($scoreData as $quarter => $score) {
                        if ((int) $score >= 75 || (int) $score <= 0) {
                            continue;
                        }

                        $quarterLabel = strtoupper($quarter);
                        $messageSubject = "Academic Alert: {$studentId} - ".ucfirst($subject)." ({$quarterLabel})";
                        $alreadySent = DB::table('messages')
                            ->where('to_role', 'parent')
                            ->where('student_id', $studentId)
                            ->where('subject', $messageSubject)
                            ->exists();
                        if ($alreadySent) {
                            continue;
                        }

                        $student = DB::table('students as s')
                            ->leftJoin('parents as p', 'p.id', '=', 's.parent_id')
                            ->where('s.id', $studentId)
                            ->first(['s.name', 's.parent_id']);
                        if (! $student?->parent_id) {
                            continue;
                        }

                        $messageBody = "{$student->name} received a score of {$score} in ".ucfirst($subject)." for {$quarterLabel}, which is below the passing mark of 75.";

                        DB::table('messages')->insert([
                            'from_role' => 'system',
                            'from_id' => 'system',
                            'from_name' => 'TrackEd Alert',
                            'to_role' => 'parent',
                            'to_id' => $student->parent_id,
                            'subject' => $messageSubject,
                            'body' => $messageBody,
                            'date' => now()->toDateString(),
                            'time' => now()->format('h:i A'),
                            'is_read' => false,
                            'student_id' => $studentId,
                        ]);

                        $parentUser = DB::table('users')
                            ->where('role', 'parent')
                            ->where('linked_id', $student->parent_id)
                            ->first(['id', 'email']);

                        if ($parentUser) {
                            if (is_string($parentUser->email) && $parentUser->email !== '') {
                                Mail::to($parentUser->email)->queue(
                                    (new AcademicAlertMail($messageSubject, $messageBody))->afterCommit()
                                );
                            }

                            $deviceIds = DB::table('device_tokens')
                                ->where('user_id', $parentUser->id)
                                ->pluck('id');

                            foreach ($deviceIds as $deviceId) {
                                SendPushNotification::dispatch(
                                    (int) $deviceId,
                                    $messageSubject,
                                    $messageBody,
                                )->afterCommit();
                            }
                        }
                    }
                }
            }
        });
    }
}
