<?php
declare(strict_types=1);

function homeTextRoutes(PDO $db, string $path, string $method): void
{
    $public = $path === '/api/home-text' && $method === 'GET';
    $editing = preg_match('~^/api/admin/home-text/([^/]+)$~D', $path, $match) === 1;
    if (!$public && !$editing) { return; }
    if ($editing) {
        requireAdmin($db);
        if ($method !== 'PUT') { fail('روش درخواست مجاز نیست', 405); }
    }
    $fields = json_decode(file_get_contents(__DIR__ . '/home-text-fields.json'), true, 512, JSON_THROW_ON_ERROR);
    $db->exec(file_get_contents(__DIR__ . '/home-text-schema.sql'));
    if ($public) {
        $result = [];
        foreach ($db->query('SELECT * FROM home_text') as $row) {
            if (isset($fields[$row['field']])) {
                $result[$row['field']] = ['text' => $row['text'], 'revision' => (int)$row['revision']];
            }
        }
        respond((object)$result);
    }
    $field = $match[1];
    if (!isset($fields[$field])) { fail('این متن قابل ویرایش نیست', 404); }
    $payload = body();
    if (array_diff(array_keys($payload), ['text', 'revision']) || !is_string($payload['text'] ?? null)
        || !is_int($payload['revision'] ?? null) || $payload['revision'] < 0) {
        fail('متن و نسخه معتبر را وارد کنید', 422);
    }
    $text = trim($payload['text']);
    if ($text === '' || stringLength($text) > $fields[$field]) { fail('متن خالی یا بیش از اندازه طولانی است', 422); }
    $db->exec('BEGIN IMMEDIATE');
    try {
        $query = $db->prepare('SELECT revision FROM home_text WHERE field=?');
        $query->execute([$field]);
        $row = $query->fetch();
        $revision = $row ? (int)$row['revision'] : 0;
        if ($payload['revision'] !== $revision) {
            $db->exec('ROLLBACK');
            fail('این متن در جای دیگری تغییر کرده؛ نسخه تازه را دریافت کنید', 409);
        }
        $revision++;
        $query = $db->prepare('INSERT INTO home_text(field,text,revision) VALUES(?,?,?) ON CONFLICT(field) DO UPDATE SET text=excluded.text,revision=excluded.revision,updated_at=CURRENT_TIMESTAMP');
        $query->execute([$field, $text, $revision]);
        $db->exec('COMMIT');
        respond(['text' => $text, 'revision' => $revision]);
    } catch (Throwable $error) {
        $db->exec('ROLLBACK');
        throw $error;
    }
}
