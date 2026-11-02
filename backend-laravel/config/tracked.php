<?php

return [
    'demo_seed_enabled' => env('TRACKED_SEED_DEMO_DATA', false),
    'demo_password' => env('TRACKED_DEMO_PASSWORD', 'password123'),
    'initial_admin_name' => env('TRACKED_INITIAL_ADMIN_NAME'),
    'initial_admin_email' => env('TRACKED_INITIAL_ADMIN_EMAIL'),
    'initial_admin_password' => env('TRACKED_INITIAL_ADMIN_PASSWORD'),
];
