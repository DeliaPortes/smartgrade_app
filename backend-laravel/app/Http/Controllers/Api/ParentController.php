<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StudentAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ParentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = DB::table('parents as p');

        if ($user->role === 'teacher') {
            $query->join('students as s', 's.parent_id', '=', 'p.id')
                ->where('s.teacher_id', $user->linked_id)
                ->select('p.*')
                ->distinct();
        } elseif ($user->role === 'parent') {
            $query->where('p.id', $user->linked_id);
        } elseif ($user->role !== 'admin') {
            abort(403, 'Not allowed.');
        }

        $parents = $query->orderBy('p.name')->get();
        $teacherId = $user->role === 'teacher' ? $user->linked_id : null;

        return response()->json($parents->map(
            fn (object $parent): array => $this->enrich($parent, $teacherId)
        ));
    }

    public function show(Request $request, string $parent): JsonResponse
    {
        abort_unless($this->canManage($request->user(), $parent), 403, 'Not allowed.');
        $record = DB::table('parents')->where('id', $parent)->first();
        abort_if(! $record, 404, 'Parent not found.');

        return response()->json($this->enrich(
            $record,
            $request->user()->role === 'teacher' ? $request->user()->linked_id : null
        ));
    }

    public function store(Request $request, StudentAccess $students): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['admin', 'teacher'], true), 403, 'Not allowed.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', Rule::unique('parents'), Rule::unique('users')],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'childId' => ['sometimes', 'nullable', 'string', 'exists:students,id'],
        ]);
        $user = $request->user();
        $childId = $data['childId'] ?? null;
        if ($childId !== null) {
            abort_unless($students->canAccess($user, $childId), 403, 'Not allowed.');
        }
        $parentId = $this->nextParentId();

        $parent = DB::transaction(function () use ($data, $parentId, $childId): object {
            DB::table('parents')->insert([
                'id' => $parentId,
                'name' => $data['name'],
                'email' => mb_strtolower($data['email']),
                'phone' => $data['phone'] ?? '',
            ]);

            if ($childId !== null) {
                DB::table('students')->where('id', $childId)->update([
                    'parent_id' => $parentId,
                    'parent_name' => $data['name'],
                    'parent_email' => mb_strtolower($data['email']),
                ]);
            }

            User::query()->create([
                'role' => 'parent',
                'linked_id' => $parentId,
                'email' => mb_strtolower($data['email']),
                'password' => Hash::make($data['password']),
                'name' => $data['name'],
                'phone' => $data['phone'] ?? '',
            ]);

            return DB::table('parents')->where('id', $parentId)->first();
        });

        return response()->json($this->enrich($parent), 201);
    }

    public function update(Request $request, string $parent): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->canManage($user, $parent), 403, 'Not allowed.');
        abort_if(! DB::table('parents')->where('id', $parent)->exists(), 404, 'Parent not found.');

        $account = User::query()->where('role', 'parent')->where('linked_id', $parent)->first();
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('parents', 'email')->ignore($parent, 'id'),
                Rule::unique('users', 'email')->ignore($account?->id),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'password' => ['sometimes', 'required', 'string', 'min:8', 'max:255'],
        ]);
        abort_if($data === [], 422, 'At least one parent field must be provided.');

        DB::transaction(function () use ($data, $parent, $account, $user): void {
            $parentData = array_intersect_key($data, array_flip(['name', 'email', 'phone']));
            DB::table('parents')->where('id', $parent)->update($parentData);

            $accountData = $parentData;
            if (isset($data['password'])) {
                $accountData['password'] = Hash::make($data['password']);
            }
            if ($accountData !== [] && $account) {
                $account->fill($accountData)->save();
            }

            $studentData = [];
            if (array_key_exists('name', $data)) {
                $studentData['parent_name'] = $data['name'];
            }
            if (array_key_exists('email', $data)) {
                $studentData['parent_email'] = mb_strtolower($data['email']);
            }
            if ($studentData !== []) {
                DB::table('students')
                    ->where('parent_id', $parent)
                    ->when(
                        $user->role === 'teacher',
                        fn ($query) => $query->where('teacher_id', $user->linked_id)
                    )
                    ->update($studentData);
            }
        });

        return response()->json($this->enrich(
            DB::table('parents')->where('id', $parent)->first(),
            $user->role === 'teacher' ? $user->linked_id : null
        ));
    }

    public function destroy(Request $request, string $parent): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->canManage($user, $parent), 403, 'Not allowed.');
        abort_if(! DB::table('parents')->where('id', $parent)->exists(), 404, 'Parent not found.');

        $deleted = DB::transaction(function () use ($user, $parent): bool {
            if ($user->role === 'teacher') {
                DB::table('students')
                    ->where('parent_id', $parent)
                    ->where('teacher_id', $user->linked_id)
                    ->update(['parent_id' => null, 'parent_name' => null, 'parent_email' => null]);

                if (DB::table('students')->where('parent_id', $parent)->exists()) {
                    return false;
                }
            } else {
                DB::table('students')->where('parent_id', $parent)
                    ->update(['parent_id' => null, 'parent_name' => null, 'parent_email' => null]);
            }

            $account = User::query()->where('role', 'parent')->where('linked_id', $parent)->first();
            if ($account) {
                $account->tokens()->delete();
                $account->delete();
            }
            DB::table('parents')->where('id', $parent)->delete();

            return true;
        });

        if (! $deleted) {
            return response()->json([
                'message' => 'Parent unlinked from your class.',
                'deleted' => false,
            ]);
        }

        return response()->json(['message' => 'Parent deleted.', 'deleted' => true]);
    }

    private function canManage(User $user, string $parent): bool
    {
        return match ($user->role) {
            'admin', 'parent' => $user->role === 'admin' || $user->linked_id === $parent,
            'teacher' => DB::table('students')
                ->where('parent_id', $parent)
                ->where('teacher_id', $user->linked_id)
                ->exists(),
            default => false,
        };
    }

    private function enrich(object $parent, ?string $teacherId = null): array
    {
        $children = DB::table('students')
            ->where('parent_id', $parent->id)
            ->when($teacherId !== null, fn ($query) => $query->where('teacher_id', $teacherId))
            ->orderBy('id')
            ->pluck('id')
            ->all();

        return [
            ...(array) $parent,
            'children' => $children,
            'has_account' => User::query()
                ->where('role', 'parent')
                ->where('linked_id', $parent->id)
                ->exists(),
        ];
    }

    private function nextParentId(): string
    {
        do {
            $id = 'P'.str_pad((string) random_int(1, 999), 3, '0', STR_PAD_LEFT);
        } while (DB::table('parents')->where('id', $id)->exists());

        return $id;
    }
}
