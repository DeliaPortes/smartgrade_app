<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'teacher') {
            $studentIds = DB::table('students')
                ->where('teacher_id', $user->linked_id)
                ->pluck('id');
            $attendance = DB::table('attendance')->whereIn('student_id', $studentIds)
                ->selectRaw('COALESCE(SUM(present), 0) as present, COALESCE(SUM(total), 0) as total')
                ->first();

            return response()->json([
                'students' => DB::table('students')
                    ->where('teacher_id', $user->linked_id)
                    ->where('status', 'active')
                    ->count(),
                'classAverage' => (int) round((float) (DB::table('grades as g')
                    ->join('students as s', 's.id', '=', 'g.student_id')
                    ->where('s.teacher_id', $user->linked_id)
                    ->selectRaw('AVG((g.q1 + g.q2 + g.q3 + g.q4) / 4) as average')
                    ->value('average') ?? 0)),
                'attendanceRate' => (int) ($attendance->total > 0
                    ? round($attendance->present / $attendance->total * 100)
                    : 0),
                'unreadMessages' => $this->unreadMessages($user),
            ]);
        }

        if ($user->role === 'admin') {
            return response()->json([
                'totalStudents' => DB::table('students')->where('status', 'active')->count(),
                'totalTeachers' => DB::table('teachers')->count(),
                'schoolAverage' => (int) round((float) (DB::table('grades')
                    ->selectRaw('AVG((q1 + q2 + q3 + q4) / 4) as average')
                    ->value('average') ?? 0)),
                'outstanding' => DB::query()
                    ->fromSub(
                        DB::table('grades')
                            ->select('student_id')
                            ->groupBy('student_id')
                            ->havingRaw('AVG((q1 + q2 + q3 + q4) / 4) >= 90'),
                        'outstanding_students'
                    )
                    ->count(),
            ]);
        }

        abort_unless($user->role === 'parent', 403, 'Not allowed.');
        $children = DB::table('students')->where('parent_id', $user->linked_id)
            ->orderBy('id')
            ->get();

        return response()->json([
            'children' => $children->map(function (object $child): array {
                $grades = [];
                foreach (DB::table('grades')->where('student_id', $child->id)->get() as $grade) {
                    $grades[$grade->subject] = [
                        (int) $grade->q1,
                        (int) $grade->q2,
                        (int) $grade->q3,
                        (int) $grade->q4,
                    ];
                }

                $attendance = DB::table('attendance')->where('student_id', $child->id)->first();
                $present = (int) ($attendance->present ?? 0);
                $total = (int) ($attendance->total ?? 0);

                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'grade' => $child->grade,
                    'section' => $child->section,
                    'grades' => $grades,
                    'attendance' => [
                        'present' => $present,
                        'absent' => (int) ($attendance->absent ?? 0),
                        'half_day' => (int) ($attendance->half_day ?? 0),
                        'tardy' => (int) ($attendance->tardy ?? 0),
                        'late' => (int) ($attendance->late ?? 0),
                        'total' => $total,
                        'rate' => $total > 0 ? round($present / $total * 100) : 0,
                    ],
                ];
            })->all(),
            'unreadMessages' => $this->unreadMessages($user),
        ]);
    }

    private function unreadMessages(User $user): int
    {
        return DB::table('messages')
            ->where('to_role', $user->role)
            ->where('to_id', $user->linked_id)
            ->where('is_read', false)
            ->count();
    }
}
