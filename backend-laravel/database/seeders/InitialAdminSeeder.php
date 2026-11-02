<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InitialAdminSeeder extends Seeder
{
    public function run(): void
    {
        $name = trim((string) config('tracked.initial_admin_name'));
        $email = mb_strtolower(trim((string) config('tracked.initial_admin_email')));
        $password = (string) config('tracked.initial_admin_password');

        if ($name === '' && $email === '' && $password === '') {
            return;
        }

        if (
            $name === '' ||
            mb_strlen($name) > 150 ||
            filter_var($email, FILTER_VALIDATE_EMAIL) === false ||
            mb_strlen($email) > 150 ||
            mb_strlen($password) < 12 ||
            mb_strlen($password) > 255
        ) {
            throw new \RuntimeException(
                'Initial admin bootstrap requires a name, valid email, and password between 12 and 255 characters.'
            );
        }

        DB::transaction(function () use ($name, $email, $password): void {
            if (User::query()->where('role', 'admin')->exists()) {
                return;
            }

            if (User::query()->where('email', $email)->exists()) {
                throw new \RuntimeException(
                    'Initial admin email already belongs to an account; no account was changed.'
                );
            }

            User::query()->create([
                'role' => 'admin',
                'linked_id' => 'admin',
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);
        });
    }
}
