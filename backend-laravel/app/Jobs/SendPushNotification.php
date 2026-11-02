<?php

namespace App\Jobs;

use App\Models\DeviceToken;
use App\Services\FirebaseMessagingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public int $deviceId,
        public string $title,
        public string $body,
    ) {}

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 60];
    }

    public function handle(FirebaseMessagingService $firebase): void
    {
        $device = DeviceToken::query()->find($this->deviceId);
        if (! $device) {
            return;
        }

        try {
            $firebase->sendToToken($device->token, $this->title, $this->body);
        } catch (Throwable $exception) {
            Log::warning('TrackEd push notification delivery failed.', [
                'device_id' => $device->id,
                'exception' => $exception,
            ]);

            throw $exception;
        }
    }
}
