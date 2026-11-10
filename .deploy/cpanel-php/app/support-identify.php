<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/support.php';
$cfg = supportConfig(require dirname(__DIR__) . '/config.php');
if (!preg_match('/^[0-9]+:[A-Za-z0-9_-]+$/', (string)$cfg['bot_token'])) {
    fwrite(STDERR, "Configure the dedicated bot token in config.php first.\n"); exit(1);
}
$webhook = supportTelegram($cfg, 'getWebhookInfo', []);
if (!($webhook['ok'] ?? false) || ($webhook['result']['url'] ?? '') !== '') {
    fwrite(STDERR, "Cannot identify: check connectivity and use a NEW bot without a webhook. No existing webhook was changed.\n"); exit(1);
}
$updates = supportTelegram($cfg, 'getUpdates', ['timeout' => 0, 'limit' => 100, 'allowed_updates' => ['message']]);
if (!($updates['ok'] ?? false)) { fwrite(STDERR, "Telegram connection failed.\n"); exit(1); }
$seen = [];
foreach ($updates['result'] ?? [] as $update) {
    $message = $update['message'] ?? [];
    if (!isset($message['chat']['id'], $message['from']['id'])) continue;
    $key = $message['chat']['id'] . ':' . $message['from']['id'];
    if (isset($seen[$key])) continue;
    $seen[$key] = true;
    echo 'Chat: ' . $message['chat']['id'] . ' | Staff user: ' . $message['from']['id'] . PHP_EOL;
}
if (!$seen) echo "No messages: send /start to the bot, or /start@YourBotName in the private support group, then retry.\n";
echo 'New webhook secret: ' . bin2hex(random_bytes(32)) . PHP_EOL;
