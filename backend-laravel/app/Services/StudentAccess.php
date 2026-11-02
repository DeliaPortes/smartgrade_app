<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class StudentAccess
{
    public function queryFor(User $user): Builder
    {
        $query = DB::table('students');

        return match ($user->role) {
            'admin' => $query,
            'teacher' => $query->where('teacher_id', $user->linked_id),
            'parent' => $query->where('parent_id', $user->linked_id),
            default => $query->whereRaw('1 = 0'),
        };
    }

    public function canAccess(User $user, string $studentId): bool
    {
        return $user->role === 'admin'
            || $this->queryFor($user)->where('id', $studentId)->exists();
    }

    public function nextId(string $table, string $prefix, int $digits = 3): string
    {
        do {
            $id = $prefix.str_pad((string) random_int(1, (10 ** $digits) - 1), $digits, '0', STR_PAD_LEFT);
        } while (DB::table($table)->where('id', $id)->exists());

        return $id;
    }
}
