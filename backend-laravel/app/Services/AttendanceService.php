<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    public const STATUSES = [
        'Present' => ['present' => 1],
        'Absent' => ['absent' => 1],
        'Half-day' => ['half_day' => 1],
        'Tardy' => ['present' => 1, 'tardy' => 1],
        'Late' => ['present' => 1, 'late' => 1],
    ];

    public function __construct(private readonly StudentAccess $studentAccess) {}

    public function getFor(User $user): array
    {
        $query = DB::table('attendance as a')
            ->select(
                'a.student_id',
                'a.present',
                'a.absent',
                'a.half_day',
                'a.tardy',
                'a.late',
                'a.total'
            );

        if ($user->role !== 'admin') {
            $query->whereIn('a.student_id', $this->studentAccess->queryFor($user)->select('id'));
        }

        $out = [];
        foreach ($query->get() as $row) {
            $out[$row->student_id] = [
                'present' => (int) $row->present,
                'absent' => (int) $row->absent,
                'half_day' => (int) $row->half_day,
                'tardy' => (int) $row->tardy,
                'late' => (int) $row->late,
                'total' => (int) $row->total,
                'days' => [],
            ];
        }

        if ($out === []) {
            return $out;
        }

        $records = DB::table('attendance_records')
            ->whereIn('student_id', array_keys($out))
            ->get(['student_id', 'attendance_date', 'status']);

        foreach ($records as $record) {
            $out[$record->student_id]['days'][$record->attendance_date] = $record->status;
        }

        return $out;
    }

    public function mark(User $user, string $date, array $records): void
    {
        DB::transaction(function () use ($user, $date, $records): void {
            foreach ($records as $studentId => $status) {
                abort_unless(
                    $this->studentAccess->canAccess($user, (string) $studentId),
                    403,
                    'Not allowed to mark attendance for this student.'
                );

                $existing = DB::table('attendance_records')
                    ->where('student_id', $studentId)
                    ->where('attendance_date', $date)
                    ->value('status');

                $delta = array_fill_keys(['present', 'absent', 'half_day', 'tardy', 'late'], 0);
                foreach (self::STATUSES[$existing] ?? [] as $field => $amount) {
                    $delta[$field] -= $amount;
                }
                foreach (self::STATUSES[$status] as $field => $amount) {
                    $delta[$field] += $amount;
                }

                DB::table('attendance_records')->updateOrInsert(
                    ['student_id' => $studentId, 'attendance_date' => $date],
                    ['status' => $status]
                );

                $summary = DB::table('attendance')
                    ->where('student_id', $studentId)
                    ->lockForUpdate()
                    ->first();

                if (! $summary) {
                    DB::table('attendance')->insert(['student_id' => $studentId]);
                    $summary = DB::table('attendance')
                        ->where('student_id', $studentId)
                        ->lockForUpdate()
                        ->first();
                }

                $totals = [];
                foreach ($delta as $field => $amount) {
                    $totals[$field] = max(0, (int) $summary->{$field} + $amount);
                }
                $totals['total'] = (int) $summary->total + ($existing === null ? 1 : 0);

                DB::table('attendance')
                    ->where('student_id', $studentId)
                    ->update($totals);
            }
        });
    }
}
