<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DeviceController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:4096'],
            'platform' => ['required', Rule::in(['android', 'ios'])],
        ]);
        $hash = hash('sha256', $data['token']);
        $user = $request->user();

        $device = DB::transaction(function () use ($data, $hash, $user): DeviceToken {
            $device = DeviceToken::query()->where('token_hash', $hash)->lockForUpdate()->first();
            if ($device) {
                $device->user_id = $user->id;
                $device->token = $data['token'];
                $device->platform = $data['platform'];
                $device->save();

                return $device;
            }

            return $user->deviceTokens()->create([
                'token' => $data['token'],
                'token_hash' => $hash,
                'platform' => $data['platform'],
            ]);
        });

        return response()->json([
            'id' => $device->id,
            'registered' => true,
        ], 201);
    }

    public function destroy(Request $request, DeviceToken $device): JsonResponse
    {
        abort_unless($device->user_id === $request->user()->id, 403, 'Not allowed.');
        $device->delete();

        return response()->json(['message' => 'Device unregistered.']);
    }
}
