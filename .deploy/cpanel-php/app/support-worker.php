<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/support.php';
$config = require dirname(__DIR__) . '/config.php';
$db = new PDO('sqlite:' . __DIR__ . '/data/sovara.db', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
$db->exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
supportInit($db);
// Remove only expired support records, never site content or accounts.
supportQuery($db, 'DELETE FROM support_conversations WHERE expires_at<=?', [time()]);
supportQuery($db, 'DELETE FROM support_limits WHERE expires_at<?', [time()]);
supportQuery($db, 'DELETE FROM support_updates WHERE created_at<?', [time() - 30 * 86400]);
echo 'Delivered: ' . supportDrain($db, supportConfig($config), 10) . PHP_EOL;
