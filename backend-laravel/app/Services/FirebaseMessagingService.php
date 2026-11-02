<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use RuntimeException;

class FirebaseMessagingService
{
    public function sendToToken(string $token, string $title, string $body): void
    {
        $credentialsPath = config('services.firebase.credentials');
        if (! is_string($credentialsPath) || trim($credentialsPath) === '') {
            throw new RuntimeException('FIREBASE_CREDENTIALS is not configured.');
        }

        if (! is_file($credentialsPath) || ! is_readable($credentialsPath)) {
            throw new RuntimeException('The Firebase credentials file is unavailable.');
        }

        $messaging = (new Factory)
            ->withServiceAccount($credentialsPath)
            ->createMessaging();

        $messaging->send(
            CloudMessage::new()
                ->withToken($token)
                ->withNotification([
                    'title' => $title,
                    'body' => $body,
                ])
        );
    }
}
