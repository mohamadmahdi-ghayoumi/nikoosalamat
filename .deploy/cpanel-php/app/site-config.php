<?php
declare(strict_types=1);

function siteConfigUrl(string $value, bool $image): bool {
    if ($value === '' || preg_match('~[\s\\\\\x00-\x1f\x7f]~u', $value)) return false;
    if (str_starts_with($value, '/') && !str_starts_with($value, '//')) return true;
    if (preg_match('~^https?://[^/?#]+(?:[/?#]|$)~iD', $value)) return true;
    return !$image && preg_match('~^(?:#[^\s]+|tel:\+?[0-9()-]+|mailto:[^\s@]+@[^\s@]+)$~D', $value) === 1;
}

function siteConfigValidate(mixed $value, array $schema, string $kind='config', int $depth=0): mixed {
    $spec = $schema[$kind]; $type = $spec['type']; $ok = $depth <= 16;
    if ($type === 'object' || $type === 'map') {
        $ok = $ok && is_object($value);
        $data = $ok ? (array)$value : [];
        if ($ok && $type === 'object') {
            $ok = !array_diff(array_keys($data), array_keys($spec['fields'])) && !array_diff($spec['required'] ?? [], array_keys($data));
            if ($ok) foreach ($data as $key => $child) $data[$key] = siteConfigValidate($child, $schema, $spec['fields'][$key], $depth+1);
        } elseif ($ok) {
            $ok = count($data) <= $spec['max'];
            if ($ok) foreach ($data as $key => $child) {
                if (!preg_match('~'.$spec['keyPattern'].'~D', (string)$key)) { $ok=false; break; }
                $data[$key] = siteConfigValidate($child, $schema, $spec['item'], $depth+1);
            }
        }
        $value = (object)$data;
    } elseif ($type === 'array') {
        $ok = $ok && is_array($value) && array_is_list($value) && count($value) <= $spec['max'];
        if ($ok) {
            foreach ($value as $key => $child) $value[$key] = siteConfigValidate($child, $schema, $spec['item'], $depth+1);
            if ($kind === 'navigation' || $kind === 'slides') {
                $ids = array_map(fn($item) => $item->{$kind === 'navigation' ? 'label' : 'id'}, $value);
                $ok = count(array_unique($ids)) === count($ids);
            }
            if ($kind === 'sections') $ok = count(array_unique($value)) === count($value);
        }
    } elseif ($type === 'string') {
        $ok = $ok && is_string($value) && stringLength($value) >= ($spec['min'] ?? 0) && stringLength($value) <= ($spec['max'] ?? 12000);
        if ($ok && isset($spec['pattern'])) $ok = preg_match('~'.$spec['pattern'].'~D', $value) === 1;
        if ($ok && isset($spec['choices'])) $ok = in_array($value, $spec['choices'], true);
        if ($ok && isset($spec['format'])) $ok = siteConfigUrl($value, $spec['format'] === 'imageUrl');
    } elseif ($type === 'integer') {
        $ok = $ok && is_int($value) && $value >= $spec['min'] && $value <= $spec['max'];
    } elseif ($type === 'boolean') { $ok = $ok && is_bool($value); }
    if (!$ok) fail('تنظیمات نامعتبر است؛ اندازه‌ها، لینک‌ها یا موارد تکراری را بررسی کنید', 422);
    return $value;
}

function siteConfigState(PDO $db): array {
    $row = $db->query('SELECT * FROM site_config WHERE id=1')->fetch();
    $row['revision'] = (int)$row['revision']; $row['published_revision'] = (int)$row['published_revision'];
    $row['draft'] = json_decode($row['draft']); $row['published'] = json_decode($row['published']);
    $row['history'] = $db->query('SELECT id,created_at FROM site_config_history ORDER BY id DESC LIMIT 20')->fetchAll();
    $row['media'] = $db->query('SELECT * FROM site_media ORDER BY id DESC LIMIT 100')->fetchAll();
    foreach ($row['history'] as &$item) $item['id'] = (int)$item['id']; unset($item);
    foreach ($row['media'] as &$item) $item['id'] = (int)$item['id']; unset($item);
    return $row;
}

function siteConfigRevision(array $row, mixed $revision, bool $published=false): void {
    if (!is_int($revision) || $revision < 0) fail('شماره نسخه معتبر نیست', 422);
    if ($row[$published ? 'published_revision' : 'revision'] !== $revision) fail('نسخه تازه‌تری ذخیره شده است؛ ابتدا نوشته‌های خود را نگه دارید و آخرین نسخه را دریافت کنید', 409);
}

function siteConfigPublish(PDO $db, object $config): void {
    $encoded = json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $query = $db->prepare('UPDATE site_config SET published=?,published_revision=published_revision+1 WHERE id=1'); $query->execute([$encoded]);
    $query = $db->prepare('INSERT INTO site_config_history(config) VALUES(?)'); $query->execute([$encoded]);
    $db->exec('DELETE FROM site_config_history WHERE id NOT IN (SELECT id FROM site_config_history ORDER BY id DESC LIMIT 20)');
}

function siteConfigRoutes(PDO $db, string $path, string $method, string $uploadDir): void {
    $public = $path === '/api/site-config' && $method === 'GET';
    if (!$public && !preg_match('~^/api/admin/site-config(?:/|$)~', $path)) return;
    if (!$public) requireAdmin($db);
    $db->exec(file_get_contents(__DIR__.'/site-config-schema.sql'));
    if ($public) {
        $row = $db->query('SELECT published,published_revision FROM site_config WHERE id=1')->fetch();
        respond(['config'=>json_decode($row['published']), 'revision'=>(int)$row['published_revision']]);
    }
    if ($path === '/api/admin/site-config' && $method === 'GET') respond(siteConfigState($db));
    $schema = json_decode(file_get_contents(__DIR__.'/site-config-schema.json'), true, 512, JSON_THROW_ON_ERROR);
    if ($path === '/api/admin/site-config/media' && $method === 'POST') {
        $payload = body();
        if (array_diff(array_keys($payload), ['image_data','name']) || !is_string($payload['name'] ?? '') || stringLength($payload['name'] ?? '') > 200 || !is_string($payload['image_data'] ?? null) || strlen($payload['image_data']) > 4194400) fail('تصویر معتبر نیست', 422);
        $valid = preg_match('~^data:image/(png|jpeg|webp);base64,(.+)$~sD', $payload['image_data'], $match);
        $raw = $valid ? base64_decode($match[2], true) : false;
        $valid = $raw !== false && $valid && (($match[1]==='png' && str_starts_with($raw,"\x89PNG\r\n\x1a\n")) || ($match[1]==='jpeg' && str_starts_with($raw,"\xff\xd8\xff")) || ($match[1]==='webp' && str_starts_with($raw,'RIFF') && substr($raw,8,4)==='WEBP'));
        if (!$valid) fail('فقط فایل واقعی PNG، JPG یا WebP مجاز است', 422);
        $url = saveImage($payload['image_data'], $uploadDir);
        $query = $db->prepare('INSERT INTO site_media(url,name) VALUES(?,?)'); $query->execute([$url,$payload['name'] ?? 'تصویر']);
        $query = $db->prepare('SELECT * FROM site_media WHERE id=?'); $query->execute([$db->lastInsertId()]); $row=$query->fetch(); $row['id']=(int)$row['id']; respond($row,201);
    }
    $payload = body();
    $inline = preg_match('~^/api/admin/site-config/text/([a-zA-Z0-9_.-]{1,120})$~D', $path, $field) === 1;
    $allowed = $inline ? ['revision','text'] : ($path === '/api/admin/site-config' ? ['revision','config'] : ($path === '/api/admin/site-config/restore' ? ['revision','history_id'] : ['revision']));
    if (array_diff(array_keys($payload), $allowed) || !is_int($payload['revision'] ?? null) || $payload['revision'] < 0) fail('درخواست معتبر نیست',422);
    if ($path === '/api/admin/site-config' && $method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'));
        if (!isset($input->config) || !is_object($input->config) || strlen(json_encode($input->config,JSON_UNESCAPED_UNICODE)) > 1000000) fail('تنظیمات معتبر نیست',422);
        $config = siteConfigValidate($input->config, $schema);
    } elseif ($inline && $method === 'PUT') {
        if (!is_string($payload['text'] ?? null) || stringLength($payload['text']) > 12000) fail('متن معتبر نیست',422);
    } elseif ($path === '/api/admin/site-config/restore' && $method === 'POST') {
        if (!is_int($payload['history_id'] ?? null) || $payload['history_id'] < 1) fail('نسخه معتبر نیست',422);
        $query=$db->prepare('SELECT config FROM site_config_history WHERE id=?'); $query->execute([$payload['history_id']]); $snapshot=$query->fetchColumn();
        if ($snapshot === false) fail('نسخه پیدا نشد',404);
    } elseif (!($path === '/api/admin/site-config/publish' && $method === 'POST')) { fail('مسیر پیدا نشد',404); }
    $db->exec('BEGIN IMMEDIATE');
    try {
        $row=siteConfigState($db); siteConfigRevision($row,$payload['revision'],$inline);
        if ($inline) {
            $config=$row['published']; $draft=$row['draft']; $key=$field[1];
            $old=$config->texts->{$key}->text ?? null;
            $draftOld=$draft->texts->{$key}->text ?? null;
            $config->texts ??= new stdClass(); $config->texts->{$key} ??= new stdClass(); $config->texts->{$key}->text=$payload['text'];
            if ($old === $draftOld) { $draft->texts ??= new stdClass(); $draft->texts->{$key} ??= new stdClass(); $draft->texts->{$key}->text=$payload['text']; }
            siteConfigPublish($db,$config); $encoded=json_encode($draft,JSON_UNESCAPED_UNICODE);
        } elseif ($path === '/api/admin/site-config/publish') {
            $config=siteConfigValidate($row['draft'],$schema); siteConfigPublish($db,$config); $encoded=json_encode($config,JSON_UNESCAPED_UNICODE);
        } else { $encoded=isset($snapshot) ? $snapshot : json_encode($config,JSON_UNESCAPED_UNICODE); }
        $query=$db->prepare('UPDATE site_config SET draft=?,revision=revision+1 WHERE id=1'); $query->execute([$encoded]);
        $result=$inline ? ['config'=>$config,'revision'=>$row['published_revision']+1] : siteConfigState($db);
        $db->exec('COMMIT'); respond($result);
    } catch(Throwable $error) { $db->exec('ROLLBACK'); throw $error; }
}
