<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MeController extends Controller
{
    public function show(Request $request, AuthController $auth): JsonResponse
    {
        return response()->json($auth->userPayload($request->user()));
    }

    public function update(Request $request, AuthController $auth): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:100000'],
            'school' => ['sometimes', 'nullable', 'string', 'max:150'],
            'password' => ['sometimes', 'required', 'string', 'min:8', 'max:255'],
        ]);

        if ($data === []) {
            throw ValidationException::withMessages([
                'body' => ['At least one profile field must be provided.'],
            ]);
        }

        if (array_key_exists('password', $data)) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->fill($data)->save();

        if (array_key_exists('name', $data)) {
            if ($user->role === 'teacher') {
                DB::table('teachers')->where('id', $user->linked_id)->update(['name' => $data['name']]);
            } elseif ($user->role === 'parent') {
                DB::table('parents')->where('id', $user->linked_id)->update(['name' => $data['name']]);
            }
        }

        return response()->json($auth->userPayload($user->refresh()));
    }
}
