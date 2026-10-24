<?php
$localConfigPath = __DIR__ . '/telegram.local.php';
$localConfig = is_file($localConfigPath) ? require $localConfigPath : [];

return [
    'bot_token' => getenv('TRACKED_TELEGRAM_BOT_TOKEN') ?: ($localConfig['bot_token'] ?? ''),
    'bot_username' => ltrim(getenv('TRACKED_TELEGRAM_BOT_USERNAME') ?: ($localConfig['bot_username'] ?? ''), '@'),
    'webhook_secret' => getenv('TRACKED_TELEGRAM_WEBHOOK_SECRET') ?: ($localConfig['webhook_secret'] ?? ''),
];