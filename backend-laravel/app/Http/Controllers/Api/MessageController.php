<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendPushNotification;
use App\Services\StudentAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'after' => ['sometimes', 'integer', 'min:0'],
        ]);
        $query = DB::table('messages')
            ->where(function ($query) use ($user): void {
                $query->where(function ($sent) use ($user): void {
                    $sent->where('from_role', $user->role)->where('from_id', $user->linked_id);
                })->orWhere(function ($received) use ($user): void {
                    $received->where('to_role', $user->role)->where('to_id', $user->linked_id);
                });
            });
        if (isset($validated['after'])) {
            $query->where('id', '>', $validated['after']);
        }
        $messages = $query->orderBy('id')->get();

        return response()->json($messages->map(function (object $message): array {
            $record = (array) $message;
            $record['read'] = (bool) $record['is_read'];
            unset($record['is_read']);

            return $record;
        }));
    }

    public function store(Request $request, StudentAccess $students): JsonResponse
    {
        $data = $request->validate([
            'toRole' => ['required', Rule::in(['teacher', 'parent', 'admin'])],
            'toId' => ['required', 'string', 'max:20'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'studentId' => ['sometimes', 'nullable', 'string', 'exists:students,id'],
            'thread' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);
        $recipient = DB::table('users')
            ->where('role', $data['toRole'])
            ->where('linked_id', $data['toId'])
            ->first(['id']);
        abort_if(! $recipient, 404, 'Recipient not found.');

        $user = $request->user();
        if (! empty($data['studentId'])) {
            abort_unless($students->canAccess($user, $data['studentId']), 403, 'Not allowed.');
        }
        if ($user->role === 'teacher' && $data['toRole'] === 'parent') {
            $parentStudents = DB::table('students')
                ->where('parent_id', $data['toId'])
                ->where('teacher_id', $user->linked_id);
            abort_unless($parentStudents->exists(), 403, 'You can only message parents of your students.');
            if (! empty($data['studentId'])) {
                abort_unless(
                    $parentStudents->where('id', $data['studentId'])->exists(),
                    403,
                    'The selected student is not linked to this parent.'
                );
            }
        }
        if ($user->role === 'parent' && $data['toRole'] === 'teacher') {
            $teacherStudents = DB::table('students')
                ->where('parent_id', $user->linked_id)
                ->where('teacher_id', $data['toId']);
            abort_unless($teacherStudents->exists(), 403, 'You can only message your child’s teacher.');
            if (! empty($data['studentId'])) {
                abort_unless(
                    $teacherStudents->where('id', $data['studentId'])->exists(),
                    403,
                    'The selected student is not assigned to this teacher.'
                );
            }
        }

        $id = DB::table('messages')->insertGetId([
            'from_role' => $user->role,
            'from_id' => $user->linked_id,
            'from_name' => $user->name,
            'to_role' => $data['toRole'],
            'to_id' => $data['toId'],
            'subject' => $data['subject'],
            'body' => $data['body'],
            'date' => now()->toDateString(),
            'time' => now()->format('h:i A'),
            'is_read' => false,
            'student_id' => $data['studentId'] ?? null,
            'thread_id' => $data['thread'] ?? null,
        ]);

        DB::table('device_tokens')
            ->where('user_id', $recipient->id)
            ->pluck('id')
            ->each(fn ($deviceId) => SendPushNotification::dispatch(
                (int) $deviceId,
                $user->name,
                mb_strimwidth($data['body'], 0, 180, '…')
            )->afterCommit());

        return response()->json([
            'id' => $id,
            'message' => 'Message sent.',
            'delivery' => 'in_app',
        ], 201);
    }

    public function markRead(Request $request, string $message): JsonResponse
    {
        $user = $request->user();
        $record = DB::table('messages')
            ->where('id', $message)
            ->where(function ($query) use ($user): void {
                $query->where(function ($sent) use ($user): void {
                    $sent->where('from_role', $user->role)->where('from_id', $user->linked_id);
                })->orWhere(function ($received) use ($user): void {
                    $received->where('to_role', $user->role)->where('to_id', $user->linked_id);
                });
            })
            ->exists();
        abort_if(! $record && ! DB::table('messages')->where('id', $message)->exists(), 404, 'Message not found.');
        abort_if(! $record, 403, 'Not allowed.');

        DB::table('messages')->where('id', $message)->update(['is_read' => true]);

        return response()->json(['message' => 'Marked as read.']);
    }
}
