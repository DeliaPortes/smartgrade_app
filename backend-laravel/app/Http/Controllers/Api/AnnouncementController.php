<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $announcements = DB::table('announcements')
            ->where(function ($query) use ($request): void {
                $query->whereIn('audience', ['all', $request->user()->role])
                    ->orWhere('created_by_user_id', $request->user()->id);
            })
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return response()->json($announcements->map(
            fn (object $announcement): array => $this->present($announcement, $request->user()->id)
        ));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'audience' => ['sometimes', Rule::in(['all', 'admin', 'teacher', 'parent'])],
            'priority' => ['sometimes', Rule::in(['normal', 'high', 'urgent'])],
            'category' => ['sometimes', Rule::in(['general', 'academic', 'event', 'holiday'])],
            'pinned' => ['sometimes', 'boolean'],
        ]);
        $id = DB::table('announcements')->insertGetId([
            'title' => $data['title'],
            'body' => $data['body'],
            'date' => now()->toDateString(),
            'audience' => $data['audience'] ?? 'all',
            'author' => $request->user()->name,
            'author_role' => $request->user()->role,
            'priority' => $data['priority'] ?? 'normal',
            'category' => $data['category'] ?? 'general',
            'pinned' => $data['pinned'] ?? false,
            'created_by_user_id' => $request->user()->id,
        ]);

        return response()->json(
            $this->present(DB::table('announcements')->where('id', $id)->first(), $request->user()->id),
            201
        );
    }

    public function update(Request $request, string $announcement): JsonResponse
    {
        $record = $this->managedAnnouncement($request, $announcement);
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'body' => ['sometimes', 'required', 'string'],
            'audience' => ['sometimes', Rule::in(['all', 'admin', 'teacher', 'parent'])],
            'priority' => ['sometimes', Rule::in(['normal', 'high', 'urgent'])],
            'category' => ['sometimes', Rule::in(['general', 'academic', 'event', 'holiday'])],
            'pinned' => ['sometimes', 'boolean'],
        ]);
        abort_if($data === [], 422, 'Nothing to update.');

        DB::table('announcements')->where('id', $announcement)->update($data);

        return response()->json($this->present(
            DB::table('announcements')->where('id', $announcement)->first(),
            $request->user()->id
        ));
    }

    public function destroy(Request $request, string $announcement): JsonResponse
    {
        $this->managedAnnouncement($request, $announcement);
        DB::table('announcements')->where('id', $announcement)->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }

    private function managedAnnouncement(Request $request, string $announcement): object
    {
        $record = DB::table('announcements')->where('id', $announcement)->first();
        abort_if(! $record, 404, 'Announcement not found.');

        abort_unless(
            $request->user()->role === 'admin'
                || ($request->user()->role === 'teacher'
                    && (int) $record->created_by_user_id === (int) $request->user()->id),
            403,
            'Not allowed.'
        );

        return $record;
    }

    private function present(object $announcement, int $userId): array
    {
        $record = (array) $announcement;
        $record['pinned'] = (bool) ($record['pinned'] ?? false);
        $record['can_manage'] = (int) ($record['created_by_user_id'] ?? 0) === $userId;
        unset($record['created_by_user_id']);

        return $record;
    }
}
