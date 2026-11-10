<?php
declare(strict_types=1);

// Loaded by the API front controller or the CLI worker. The entire app/ directory
// is denied by Apache; no bot credentials are ever returned to the browser.
function supportInit(PDO $db): void
{
    $db->exec(file_get_contents(__DIR__ . '/support-schema.sql'));
}

function supportConfig(array $config): array
{
    return array_replace([
        'bot_token' => '', 'chat_id' => '', 'staff_ids' => [], 'webhook_secret' => '',
        'site_url' => 'https://nikoosalamat.ir',
    ], $config['support'] ?? []);
}

function supportReady(array $cfg): bool
{
    return preg_match('/^[0-9]+:[A-Za-z0-9_-]+$/', (string)$cfg['bot_token']) === 1
        && preg_match('/^-?[0-9]+$/', (string)$cfg['chat_id']) === 1
        && count(array_filter((array)$cfg['staff_ids'], fn($id) => preg_match('/^[0-9]+$/', (string)$id))) > 0
        && preg_match('/^[A-Za-z0-9_-]{32,256}$/', (string)$cfg['webhook_secret']) === 1;
}

function supportQuery(PDO $db, string $sql, array $params = []): PDOStatement
{
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}

function supportStatus(PDO $db, array $cfg, bool $admin = false): array
{
    $result = ['enabled' => (bool)$db->query('SELECT enabled FROM support_settings WHERE id=1')->fetchColumn()];
    if ($admin) {
        $result['telegram_configured'] = supportReady($cfg);
        $result['pending'] = (int)$db->query("SELECT COUNT(*) FROM support_messages WHERE role='visitor' AND telegram_id IS NULL")->fetchColumn();
    }
    return $result;
}

function supportBody(): array
{
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 65536) fail('درخواست بیش از حد بزرگ است', 413);
    $raw = file_get_contents('php://input', false, null, 0, 65537);
    if (strlen($raw) > 65536) fail('درخواست بیش از حد بزرگ است', 413);
    $data = json_decode($raw ?: '{}', true);
    if (!is_array($data)) fail('درخواست معتبر نیست', 422);
    return $data;
}

function supportLimit(PDO $db, string $bucket, int $max, int $window): void
{
    $now = time();
    $key = hash('sha256', $bucket) . ':' . intdiv($now, $window);
    supportQuery($db, 'INSERT INTO support_limits VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=hits+1', [$key, $now + $window]);
    if ((int)supportQuery($db, 'SELECT hits FROM support_limits WHERE bucket=?', [$key])->fetchColumn() > $max) {
        fail('تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید', 429);
    }
}

function supportConversation(PDO $db, string $id, bool $admin): array
{
    $row = supportQuery($db, 'SELECT * FROM support_conversations WHERE id=? AND expires_at>?', [$id, time()])->fetch();
    $token = (string)($_SERVER['HTTP_X_SUPPORT_TOKEN'] ?? '');
    if (!$row || (!$admin && !hash_equals($row['token_hash'], hash('sha256', $token)))) {
        fail('گفت‌وگو در دسترس نیست؛ گفت‌وگوی تازه‌ای شروع کنید', 404);
    }
    return $row;
}

function supportHistory(PDO $db, array $conversation): array
{
    $after = max(0, (int)($_GET['after'] ?? 0));
    $rows = supportQuery($db, 'SELECT id,role,text,created_at FROM support_messages WHERE conversation_id=? AND id>? ORDER BY id LIMIT 100', [$conversation['id'], $after])->fetchAll();
    return ['messages' => $rows, 'closed' => (bool)$conversation['closed'], 'has_more' => count($rows) === 100];
}

function supportMessage(PDO $db, array $conversation, array $data, string $role): array
{
    $text = is_string($data['text'] ?? null) ? trim($data['text']) : '';
    $clientId = is_string($data['client_id'] ?? null) ? $data['client_id'] : '';
    if ($text === '' || stringLength($text) > 2000 || !preg_match('/^[a-f0-9]{32}$/', $clientId)) {
        fail('متن پیام باید بین ۱ تا ۲۰۰۰ نویسه باشد', 422);
    }
    $existing = supportQuery($db, 'SELECT id,role,text,created_at FROM support_messages WHERE conversation_id=? AND client_id=?', [$conversation['id'], $clientId])->fetch();
    if ($existing) {
        if ($existing['role'] !== $role || $existing['text'] !== $text) fail('شناسه پیام تکراری است', 409);
        return $existing;
    }
    if ($conversation['closed']) fail('این گفت‌وگو بسته شده؛ گفت‌وگوی تازه‌ای شروع کنید', 409);
    supportLimit($db, 'message:' . $conversation['id'], 12, 60);
    $now = time();
    $db->beginTransaction();
    try {
        supportQuery($db, 'INSERT INTO support_messages(conversation_id,role,text,created_at,client_id) VALUES (?,?,?,?,?) ON CONFLICT(conversation_id,client_id) DO NOTHING', [$conversation['id'], $role, $text, $now, $clientId]);
        supportQuery($db, 'UPDATE support_conversations SET updated_at=? WHERE id=?', [$now, $conversation['id']]);
        $db->commit();
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        throw $e;
    }
    return supportQuery($db, 'SELECT id,role,text,created_at FROM support_messages WHERE conversation_id=? AND client_id=?', [$conversation['id'], $clientId])->fetch();
}

function supportTelegram(array $cfg, string $method, array $payload): array
{
    if (!function_exists('curl_init')) return ['ok' => false];
    $ch = curl_init('https://api.telegram.org/bot' . $cfg['bot_token'] . '/' . $method);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($payload ?: new stdClass()),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => 6, CURLOPT_FOLLOWLOCATION => false]);
    $raw = curl_exec($ch);
    curl_close($ch);
    // Never log curl errors or the request URL: they can contain the bot token.
    return is_string($raw) ? (json_decode($raw, true) ?: ['ok' => false]) : ['ok' => false];
}

function supportDrain(PDO $db, array $cfg, int $limit = 3): int
{
    if (!supportReady($cfg)) return 0;
    $sent = 0;
    for ($i = 0; $i < $limit; $i++) {
        $now = time();
        $db->exec('BEGIN IMMEDIATE');
        $row = supportQuery($db, "SELECT m.* FROM support_messages m JOIN support_conversations c ON c.id=m.conversation_id WHERE m.role='visitor' AND m.telegram_id IS NULL AND m.next_attempt<=? AND m.lease_until<=? AND c.expires_at>? ORDER BY m.id LIMIT 1", [$now, $now, $now])->fetch();
        if (!$row) { $db->exec('COMMIT'); break; }
        supportQuery($db, 'UPDATE support_messages SET lease_until=?,attempts=attempts+1 WHERE id=?', [$now + 60, $row['id']]);
        $db->exec('COMMIT');
        $reply = supportTelegram($cfg, 'sendMessage', [
            'chat_id' => (string)$cfg['chat_id'],
            'text' => 'پیام سایت · ' . substr($row['conversation_id'], 0, 8) . "\nبرای پاسخ، روی همین پیام Reply بزنید.\n\n" . $row['text'],
            'link_preview_options' => ['is_disabled' => true],
        ]);
        if (($reply['ok'] ?? false) && isset($reply['result']['message_id'])) {
            supportQuery($db, 'UPDATE support_messages SET telegram_chat=?,telegram_id=?,lease_until=0 WHERE id=?', [(string)$cfg['chat_id'], $reply['result']['message_id'], $row['id']]);
            $sent++;
        } else {
            $delay = max(60, min(3600, 30 * (2 ** min(7, (int)$row['attempts']))), (int)($reply['parameters']['retry_after'] ?? 0));
            supportQuery($db, 'UPDATE support_messages SET next_attempt=?,lease_until=0 WHERE id=?', [time() + $delay, $row['id']]);
            break;
        }
        // Keep well below Telegram's group/chat limits, even across cron invocations.
        if ($i + 1 < $limit) sleep(3);
    }
    return $sent;
}

function supportWebhook(PDO $db, array $cfg, array $data): void
{
    $message = $data['message'] ?? [];
    $from = (string)($message['from']['id'] ?? '');
    if ((string)($message['chat']['id'] ?? '') !== (string)$cfg['chat_id']
        || !in_array($from, array_map('strval', (array)$cfg['staff_ids']), true)
        || ($message['from']['is_bot'] ?? false) || !is_int($data['update_id'] ?? null)) return;
    $original = supportQuery($db, 'SELECT c.* FROM support_messages m JOIN support_conversations c ON c.id=m.conversation_id WHERE m.telegram_chat=? AND m.telegram_id=? AND c.expires_at>?', [(string)$cfg['chat_id'], (int)($message['reply_to_message']['message_id'] ?? 0), time()])->fetch();
    $text = is_string($message['text'] ?? null) ? trim($message['text']) : '';
    if (!$original || $original['closed'] || $text === '' || stringLength($text) > 2000) return;
    $db->beginTransaction();
    try {
        $insert = supportQuery($db, 'INSERT OR IGNORE INTO support_updates VALUES (?,?)', [$data['update_id'], time()]);
        if ($insert->rowCount()) {
            supportQuery($db, 'INSERT INTO support_messages(conversation_id,role,text,created_at,client_id) VALUES (?,\'staff\',?,?,?)', [$original['id'], $text, time(), 'telegram_' . $data['update_id']]);
            supportQuery($db, 'UPDATE support_conversations SET updated_at=? WHERE id=?', [time(), $original['id']]);
        }
        $db->commit();
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        throw $e;
    }
}

function supportRoutes(PDO $db, array $config, string $path, string $method): void
{
    if (!str_starts_with($path, '/api/support/') && !str_starts_with($path, '/api/admin/support')) return;
    supportInit($db);
    $cfg = supportConfig($config);
    $admin = str_starts_with($path, '/api/admin/support');
    if ($admin) requireAdmin($db);
    if ($path === '/api/support/telegram/webhook' && $method === 'POST') {
        if (!supportReady($cfg) || !hash_equals((string)$cfg['webhook_secret'], (string)($_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? ''))) fail('دسترسی مجاز نیست', 403);
        supportWebhook($db, $cfg, supportBody());
        respond(['ok' => true]);
    }
    if (in_array($path, ['/api/support/status', '/api/admin/support/status'], true)) {
        if ($admin && $method === 'PUT') {
            $payload = supportBody();
            if (!is_bool($payload['enabled'] ?? null)) fail('وضعیت معتبر نیست', 422);
            supportQuery($db, 'UPDATE support_settings SET enabled=? WHERE id=1', [(int)$payload['enabled']]);
        } elseif ($method !== 'GET') fail('روش مجاز نیست', 405);
        respond(supportStatus($db, $cfg, $admin));
    }
    if ($admin && $path === '/api/admin/support/telegram/connect' && $method === 'POST') {
        if (!supportReady($cfg)) fail('ابتدا تنظیمات خصوصی ربات را روی هاست تکمیل کنید', 409);
        $payload = supportBody();
        $url = rtrim($cfg['site_url'], '/') . '/api/support/telegram/webhook';
        if (!preg_match('#^https://[^/?\#]+$#', rtrim($cfg['site_url'], '/'))) fail('نشانی HTTPS سایت معتبر نیست', 422);
        $current = supportTelegram($cfg, 'getWebhookInfo', []);
        if (!($current['ok'] ?? false)) fail('ارتباط با تلگرام برقرار نشد؛ تنظیمات و اتصال هاست را بررسی کنید', 502);
        if (($current['result']['url'] ?? '') !== '' && $current['result']['url'] !== $url && ($payload['replace_existing'] ?? false) !== true) fail('این ربات به جای دیگری متصل است؛ از ربات اختصاصی پشتیبانی استفاده کنید', 409);
        $result = supportTelegram($cfg, 'setWebhook', ['url' => $url, 'secret_token' => $cfg['webhook_secret'], 'allowed_updates' => ['message'], 'drop_pending_updates' => false]);
        if (!($result['ok'] ?? false)) fail('ثبت اتصال تلگرام موفق نبود', 502);
        respond(['ok' => true]);
    }
    if ($admin && $path === '/api/admin/support/retry' && $method === 'POST') {
        supportLimit($db, 'drain', 1, 15);
        respond(['sent' => supportDrain($db, $cfg, 1)]);
    }
    if ($admin && $path === '/api/admin/support/conversations' && $method === 'GET') {
        respond(supportQuery($db, "SELECT c.id,c.created_at,c.updated_at,c.closed,(SELECT text FROM support_messages WHERE conversation_id=c.id ORDER BY id DESC LIMIT 1) AS preview,(SELECT role FROM support_messages WHERE conversation_id=c.id ORDER BY id DESC LIMIT 1) AS last_role FROM support_conversations c WHERE c.expires_at>? ORDER BY c.updated_at DESC LIMIT 100", [time()])->fetchAll());
    }
    if (!$admin && $path === '/api/support/conversations' && $method === 'POST') {
        if (!supportStatus($db, $cfg)['enabled']) fail('دریافت پیام تازه موقتاً غیرفعال است', 503);
        supportLimit($db, 'create:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 4, 600);
        $id = bin2hex(random_bytes(16));
        $token = bin2hex(random_bytes(32));
        $now = time();
        supportQuery($db, 'INSERT INTO support_conversations(id,token_hash,created_at,updated_at,expires_at) VALUES (?,?,?,?,?)', [$id, hash('sha256', $token), $now, $now, $now + 30 * 86400]);
        respond(['id' => $id, 'token' => $token], 201);
    }
    if (preg_match('#^/api/(?:admin/)?support/conversations/([a-f0-9]{32})(/messages|/close)?$#', $path, $matches)) {
        $conversation = supportConversation($db, $matches[1], $admin);
        $action = $matches[2] ?? '';
        if ($method === 'GET' && $action === '/messages') respond(supportHistory($db, $conversation));
        if ($method === 'POST' && $action === '/messages') {
            if (!$admin && !supportStatus($db, $cfg)['enabled']) fail('دریافت پیام تازه موقتاً غیرفعال است', 503);
            respond(supportMessage($db, $conversation, supportBody(), $admin ? 'staff' : 'visitor'), 201);
        }
        if ($admin && $method === 'POST' && $action === '/close') {
            supportQuery($db, 'UPDATE support_conversations SET closed=1 WHERE id=?', [$conversation['id']]);
            respond(['ok' => true]);
        }
    }
    fail('مسیر پیدا نشد', 404);
}
