<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$config = require __DIR__ . '/config.php';
$dataDir = __DIR__ . '/app/data';
$uploadDir = __DIR__ . '/uploads';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0750, true);
}
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

function respond(mixed $payload = null, int $status = 200): never
{
    http_response_code($status);
    if ($status !== 204) {
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
    exit;
}

function fail(string $message, int $status = 400): never
{
    respond(['detail' => $message], $status);
}

function body(): array
{
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw ?: '{}', true);
    if (!is_array($payload)) {
        fail('بدنه درخواست معتبر نیست', 422);
    }
    return $payload;
}

function stringLength(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

function authToken(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        return null;
    }
    return trim($matches[1]);
}

function verifyLegacyPassword(string $password, string $encoded): bool
{
    $parts = explode('$', $encoded);
    if (count($parts) !== 4 || $parts[0] !== 'pbkdf2_sha256') {
        return false;
    }
    [$algorithm, $iterations, $saltHex, $expectedHex] = $parts;
    if (!ctype_digit($iterations) || !ctype_xdigit($saltHex) || !ctype_xdigit($expectedHex)) {
        return false;
    }
    $digest = hash_pbkdf2('sha256', $password, hex2bin($saltHex), (int) $iterations, 0, true);
    return hash_equals(strtolower($expectedHex), bin2hex($digest));
}

function verifyStoredPassword(string $password, string $hash): bool
{
    return str_starts_with($hash, 'pbkdf2_sha256$')
        ? verifyLegacyPassword($password, $hash)
        : password_verify($password, $hash);
}

function requireAdmin(PDO $db): array
{
    $token = authToken();
    if (!$token) {
        fail('ابتدا وارد حساب ادمین شوید', 401);
    }
    $statement = $db->prepare(
        'SELECT admins.id, admins.email, admin_sessions.expires_at
         FROM admin_sessions JOIN admins ON admins.id = admin_sessions.admin_id
         WHERE admin_sessions.token_hash = ?'
    );
    $statement->execute([hash('sha256', $token)]);
    $admin = $statement->fetch();
    if (!$admin || strtotime($admin['expires_at']) <= time()) {
        fail('نشست شما معتبر نیست', 401);
    }
    return $admin;
}

function productRow(array $row): array
{
    $row['id'] = (int) $row['id'];
    $row['price'] = (int) $row['price'];
    $row['featured'] = (bool) $row['featured'];
    $row['catalog'] = json_decode($row['catalog'] ?? '{}', true) ?: new stdClass();
    return $row;
}

function contentRow(array $row): array
{
    $row['id'] = (int) $row['id'];
    $row['published'] = (bool) $row['published'];
    return $row;
}

function saveImage(?string $imageData, string $uploadDir): ?string
{
    if (!$imageData) {
        return null;
    }
    if (!preg_match('#^data:image/(jpeg|png|webp);base64,(.+)$#s', $imageData, $matches)) {
        fail('فرمت تصویر باید JPG، PNG یا WebP باشد', 422);
    }
    $binary = base64_decode($matches[2], true);
    if ($binary === false || strlen($binary) > 3 * 1024 * 1024) {
        fail('تصویر نامعتبر یا بزرگ‌تر از ۳ مگابایت است', 422);
    }
    $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
    $filename = bin2hex(random_bytes(16)) . '.' . $extension;
    if (file_put_contents($uploadDir . '/' . $filename, $binary, LOCK_EX) === false) {
        fail('ذخیره تصویر انجام نشد', 500);
    }
    return '/uploads/' . $filename;
}

function removeUploadedImage(?string $imageUrl, string $uploadDir): void
{
    if ($imageUrl && str_starts_with($imageUrl, '/uploads/')) {
        @unlink($uploadDir . '/' . basename($imageUrl));
    }
}

try {
    $db = new PDO('sqlite:' . $dataDir . '/sovara.db', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $db->exec('PRAGMA foreign_keys = ON');
    $db->exec('PRAGMA busy_timeout = 5000');
} catch (Throwable $error) {
    fail('دیتابیس در دسترس نیست؛ افزونه PDO_SQLite هاست را فعال کنید', 503);
}

$productColumns = $db->query('PRAGMA table_info(products)')->fetchAll(PDO::FETCH_COLUMN, 1);
if (!in_array('catalog', $productColumns, true)) {
    try {
        $db->exec("ALTER TABLE products ADD COLUMN catalog TEXT NOT NULL DEFAULT '{}'");
    } catch (PDOException $error) {
        // Another request may have completed this one-time migration already.
        $productColumns = $db->query('PRAGMA table_info(products)')->fetchAll(PDO::FETCH_COLUMN, 1);
        if (!in_array('catalog', $productColumns, true)) { throw $error; }
    }
}

$db->exec(
    'CREATE TABLE IF NOT EXISTS content_pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        eyebrow TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        body TEXT NOT NULL,
        image_url TEXT,
        published INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )'
);
$db->exec(
    'CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        body TEXT NOT NULL,
        image_url TEXT,
        published INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )'
);

$seedPages = [
    ['hoof-care', 'مراقبت تخصصی', 'مراقبت از سُم', 'راهکارهای پیشگیری و مراقبت برای حرکت سالم دام', 'در این صفحه می‌توانید معرفی محصولات، نکات مراقبتی و محتوای مرتبط با سلامت سُم را منتشر کنید.'],
    ['udder-health', 'سلامت گله', 'سلامت پستان', 'مراقبت روزانه و حمایت از سلامت پستان دام', 'این صفحه برای معرفی راهکارها، محصولات و مطالب آموزشی مرتبط با سلامت پستان در نظر گرفته شده است.'],
    ['farm-disinfection', 'بهداشت دامداری', 'ضدعفونی دامداری', 'بهداشت محیط، تجهیزات و جایگاه دام', 'در این بخش می‌توانید روش‌ها و محصولات مرتبط با ضدعفونی و مدیریت بهداشت جایگاه را معرفی کنید.'],
    ['animal-hygiene', 'مراقبت حرفه‌ای', 'بهداشت دام و اسب', 'محصولات و مطالب کاربردی برای مراقبت حرفه‌ای', 'این صفحه محل انتشار راهکارهای بهداشتی و مراقبتی ویژه دام و اسب است.'],
];
$seedStatement = $db->prepare(
    'INSERT OR IGNORE INTO content_pages (slug, eyebrow, title, summary, body, published) VALUES (?, ?, ?, ?, ?, 1)'
);
foreach ($seedPages as $seedPage) {
    $seedStatement->execute($seedPage);
}

$adminPasswordReady = ($config['admin_password'] ?? '') !== 'CHANGE_ME_BEFORE_UPLOAD'
    && strlen((string) $config['admin_password']) >= 10;

if ($adminPasswordReady) {
    $configuredUsername = strtolower(trim((string) $config['admin_username']));
    $configuredPassword = (string) $config['admin_password'];
    $currentAdmin = $db->query('SELECT * FROM admins ORDER BY id LIMIT 1')->fetch();
    if (!$currentAdmin) {
        $statement = $db->prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)');
        $statement->execute([$configuredUsername, password_hash($configuredPassword, PASSWORD_DEFAULT)]);
    } elseif ($currentAdmin['email'] !== $configuredUsername
        || !verifyStoredPassword($configuredPassword, $currentAdmin['password_hash'])) {
        $statement = $db->prepare('UPDATE admins SET email = ?, password_hash = ? WHERE id = ?');
        $statement->execute([
            $configuredUsername,
            password_hash($configuredPassword, PASSWORD_DEFAULT),
            $currentAdmin['id'],
        ]);
        $db->prepare('DELETE FROM admin_sessions WHERE admin_id = ?')->execute([$currentAdmin['id']]);
    }
}

// Apply this content refresh once, preserving future edits made from the admin panel.
$db->exec('CREATE TABLE IF NOT EXISTS app_meta (meta_key TEXT PRIMARY KEY, meta_value TEXT NOT NULL)');
$contentVersion = $db->query("SELECT meta_value FROM app_meta WHERE meta_key = 'content_version'")->fetchColumn();
if ($contentVersion !== 'nikoosalamat-2026-02') {
    $productUpdates = [
        ['هوف ژل فارمیکِر', 'مراقبت از سُم', 'tin', 'پرفروش', '/images/hoof-gel.jpg', 'arnica-hoof-oil'],
        ['پماد پستان فارمیکِر', 'سلامت پستان', 'jar', 'پیشنهادی', '/images/udder-ointment.jpg', 'mane-shine-spray'],
        ['محلول ویروگاردیا', 'ضدعفونی دامداری', 'bottle', null, '/images/virucardia-solution.jpg', 'herbal-shampoo'],
        ['اسپری سُم فارمیکِر', 'مراقبت از سُم', 'spray', null, '/images/hoof-spray.jpg', 'muscle-relief-balm'],
        ['محلول بهداشت جایگاه دام', 'بهداشت دامداری', 'bottle', null, '/images/barn-hygiene.jpg', 'daily-coat-brush'],
        ['پاک‌کننده سُم فارمیکِر', 'مراقبت از سُم', 'bottle', null, '/images/hoof-cleaner.jpg', 'hoof-cleaner'],
    ];
    $db->beginTransaction();
    $statement = $db->prepare(
        'UPDATE products SET name = ?, category = ?, shape = ?, badge = ?, image_url = ? WHERE slug = ?'
    );
    foreach ($productUpdates as $productUpdate) {
        $statement->execute($productUpdate);
    }
    $categoryUpdates = [
        ['مراقبت از سُم', 'پیشگیری و مراقبت برای حرکت سالم دام', 'hoof', 'gold', 1, 'coat-care'],
        ['سلامت پستان', 'مراقبت روزانه و حمایت از سلامت گله', 'heart', 'rose', 2, 'hoof-care'],
        ['ضدعفونی دامداری', 'بهداشت محیط، تجهیزات و جایگاه دام', 'shield', 'green', 3, 'protection'],
        ['بهداشت دام و اسب', 'محصولات کاربردی برای مراقبت حرفه‌ای', 'spray', 'blue', 4, 'grooming'],
    ];
    $statement = $db->prepare(
        'UPDATE categories SET name = ?, description = ?, icon = ?, color = ?, sort_order = ? WHERE slug = ?'
    );
    foreach ($categoryUpdates as $categoryUpdate) {
        $statement->execute($categoryUpdate);
    }
    $statement = $db->prepare(
        "INSERT OR REPLACE INTO app_meta (meta_key, meta_value) VALUES ('content_version', ?)"
    );
    $statement->execute(['nikoosalamat-2026-02']);
    $db->commit();
}

// Correct only brand spelling in existing content; keep admin edits and media intact.
if ($db->query("SELECT meta_value FROM app_meta WHERE meta_key = 'brand_spelling_v1'")->fetchColumn() !== 'done') {
    $db->beginTransaction();
    $brandFields = [
        'products' => ['name', 'catalog'],
        'categories' => ['name', 'description'],
        'content_pages' => ['eyebrow', 'title', 'summary', 'body'],
        'articles' => ['title', 'excerpt', 'body'],
    ];
    foreach ($brandFields as $table => $fields) {
        foreach ($fields as $field) {
            $statement = $db->prepare("UPDATE $table SET $field = replace($field, ?, ?) WHERE instr($field, ?) > 0");
            foreach (['فارمیکور', 'فارمیکو', 'فارمیوکر', 'فارمیکر'] as $oldSpelling) {
                $statement->execute([$oldSpelling, 'فارمیکِر', $oldSpelling]);
            }
        }
    }
    $db->exec("INSERT OR REPLACE INTO app_meta (meta_key, meta_value) VALUES ('brand_spelling_v1', 'done')");
    $db->commit();
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET' && $path === '/api/health') {
    respond(['status' => 'ok']);
}

if ($method === 'GET' && $path === '/api/categories') {
    $rows = $db->query('SELECT * FROM categories ORDER BY sort_order, id')->fetchAll();
    foreach ($rows as &$row) {
        $row['id'] = (int) $row['id'];
        $row['sort_order'] = (int) $row['sort_order'];
    }
    respond($rows);
}

if ($method === 'GET' && $path === '/api/products') {
    if (array_key_exists('featured', $_GET)) {
        $featured = filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $statement = $db->prepare('SELECT * FROM products WHERE featured = ? ORDER BY id');
        $statement->execute([$featured]);
        $rows = $statement->fetchAll();
    } else {
        $rows = $db->query('SELECT * FROM products ORDER BY id')->fetchAll();
    }
    respond(array_map('productRow', $rows));
}

if ($method === 'GET' && preg_match('#^/api/products/(\d+)$#', $path, $matches)) {
    $statement = $db->prepare('SELECT * FROM products WHERE id = ?');
    $statement->execute([(int) $matches[1]]);
    $product = $statement->fetch();
    if (!$product) {
        fail('محصول پیدا نشد', 404);
    }
    respond(productRow($product));
}

if ($method === 'GET' && preg_match('#^/api/pages/([a-z0-9-]+)$#', $path, $matches)) {
    $statement = $db->prepare('SELECT * FROM content_pages WHERE slug = ? AND published = 1');
    $statement->execute([$matches[1]]);
    $page = $statement->fetch();
    if (!$page) {
        fail('صفحه پیدا نشد', 404);
    }
    respond(contentRow($page));
}

if ($method === 'GET' && $path === '/api/articles') {
    $rows = $db->query('SELECT * FROM articles WHERE published = 1 ORDER BY created_at DESC, id DESC')->fetchAll();
    respond(array_map('contentRow', $rows));
}

if ($method === 'GET' && preg_match('#^/api/articles/([a-z0-9-]+)$#', $path, $matches)) {
    $statement = $db->prepare('SELECT * FROM articles WHERE slug = ? AND published = 1');
    $statement->execute([$matches[1]]);
    $article = $statement->fetch();
    if (!$article) {
        fail('مقاله پیدا نشد', 404);
    }
    respond(contentRow($article));
}

if ($method === 'GET' && $path === '/api/home') {
    $categories = $db->query('SELECT * FROM categories ORDER BY sort_order, id')->fetchAll();
    foreach ($categories as &$category) {
        $category['id'] = (int) $category['id'];
        $category['sort_order'] = (int) $category['sort_order'];
    }
    $products = array_map(
        'productRow',
        $db->query('SELECT * FROM products WHERE featured = 1 ORDER BY id LIMIT 4')->fetchAll()
    );
    respond([
        'hero' => [
            'eyebrow' => 'دانش دامپزشکی، مراقبت مطمئن',
            'title' => 'سلامت دام،',
            'highlighted_title' => 'سرمایه‌ی هر روز شماست.',
            'description' => 'نیکو سلامت؛ همراه دامداران، اسب‌داران و فعالان کشاورزی با محصولات تخصصی مراقبت، بهداشت و پیشگیری متناسب با نیازهای دامداری ایران.',
            'primary_action' => 'مشاهده محصولات',
            'secondary_action' => 'بیشتر درباره ما',
        ],
        'benefits' => [
            ['title' => 'تنوع محصول، تعهد به کیفیت', 'description' => 'محصولات تخصصی برای انواع نیازها', 'icon' => 'badge-check'],
            ['title' => 'از علم تا نوآوری سبز', 'description' => 'تلفیق دانش، تجربه و شیمی سبز', 'icon' => 'flask-conical'],
            ['title' => 'مشاوره تخصصی', 'description' => 'همراه شما برای انتخاب درست', 'icon' => 'sprout'],
            ['title' => 'ارسال به سراسر ایران', 'description' => 'تحویل سریع و مطمئن', 'icon' => 'truck'],
        ],
        'categories' => $categories,
        'featured_products' => $products,
        'story' => [
            'eyebrow' => 'درباره نیکو سلامت',
            'title' => 'سلامت پایدار دام، از انتخاب درست آغاز می‌شود',
            'description' => 'نیکو سلامت با تمرکز بر نیاز واقعی دامداری‌ها و مراکز پرورش اسب، محصولات تخصصی مراقبت از سُم، سلامت پستان، ضدعفونی و بهداشت جایگاه را با رویکردی علمی و مسئولانه عرضه می‌کند.',
        ],
    ]);
}

if ($method === 'POST' && $path === '/api/admin/login') {
    if (!$adminPasswordReady) {
        fail('رمز مدیریت هنوز در config.php تنظیم نشده است', 503);
    }
    $payload = body();
    $username = strtolower(trim((string) ($payload['username'] ?? '')));
    $password = (string) ($payload['password'] ?? '');
    $statement = $db->prepare('SELECT * FROM admins WHERE email = ?');
    $statement->execute([$username]);
    $admin = $statement->fetch();
    if (!$admin || !verifyStoredPassword($password, $admin['password_hash'])) {
        fail('نام کاربری یا رمز عبور نادرست است', 401);
    }
    $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    $expires = gmdate('c', time() + ((int) ($config['session_hours'] ?? 8) * 3600));
    $db->prepare('DELETE FROM admin_sessions WHERE expires_at <= ?')->execute([gmdate('c')]);
    $db->prepare('INSERT INTO admin_sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)')
        ->execute([hash('sha256', $token), $admin['id'], $expires]);
    respond(['token' => $token, 'username' => $admin['email'], 'expires_at' => $expires]);
}

if ($method === 'GET' && $path === '/api/admin/me') {
    $admin = requireAdmin($db);
    respond(['username' => $admin['email']]);
}

if ($method === 'POST' && $path === '/api/admin/logout') {
    $token = authToken();
    if ($token) {
        $db->prepare('DELETE FROM admin_sessions WHERE token_hash = ?')->execute([hash('sha256', $token)]);
    }
    respond(null, 204);
}

if ($method === 'POST' && $path === '/api/admin/products') {
    requireAdmin($db);
    $payload = body();
    $slug = trim((string) ($payload['slug'] ?? ''));
    $name = trim((string) ($payload['name'] ?? ''));
    $category = trim((string) ($payload['category'] ?? ''));
    $price = filter_var($payload['price'] ?? null, FILTER_VALIDATE_INT);
    $tone = (string) ($payload['tone'] ?? 'olive');
    $shape = (string) ($payload['shape'] ?? 'bottle');
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)
        || stringLength($name) < 2 || stringLength($name) > 120
        || stringLength($category) < 2 || $price === false || $price < 0
        || !in_array($tone, ['amber', 'wine', 'olive', 'cream'], true)
        || !in_array($shape, ['tin', 'spray', 'bottle', 'jar'], true)) {
        fail('اطلاعات محصول معتبر نیست', 422);
    }

    $imageUrl = saveImage(isset($payload['image_data']) ? (string) $payload['image_data'] : null, $uploadDir);

    try {
        $statement = $db->prepare(
            'INSERT INTO products (slug, name, category, price, tone, shape, badge, featured, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $slug,
            $name,
            $category,
            $price,
            $tone,
            $shape,
            trim((string) ($payload['badge'] ?? '')) ?: null,
            !empty($payload['featured']) ? 1 : 0,
            $imageUrl,
        ]);
    } catch (PDOException $error) {
        if ($imageUrl) {
            @unlink($uploadDir . '/' . basename($imageUrl));
        }
        fail('این شناسه محصول قبلاً استفاده شده است', 409);
    }
    $statement = $db->prepare('SELECT * FROM products WHERE id = ?');
    $statement->execute([(int) $db->lastInsertId()]);
    respond(productRow($statement->fetch()), 201);
}

if ($method === 'PUT' && preg_match('#^/api/admin/products/(\d+)/catalog$#', $path, $matches)) {
    requireAdmin($db);
    $statement = $db->prepare('SELECT * FROM products WHERE id = ?');
    $statement->execute([(int) $matches[1]]);
    $product = $statement->fetch();
    if (!$product) { fail('محصول پیدا نشد', 404); }
    $payload = body();
    $previous = json_decode($product['catalog'] ?? '{}', true) ?: [];
    $oldGallery = $previous['gallery'] ?? [];
    $gallery = $payload['gallery'] ?? [];
    $imageData = $payload['gallery_data'] ?? [];
    $features = $payload['features'] ?? [];
    if (!is_array($gallery) || !is_array($imageData) || !is_array($features)
        || !array_is_list($gallery) || !array_is_list($imageData) || !array_is_list($features)
        || count($gallery) + count($imageData) > 5 || count($features) > 20) {
        fail('حداکثر ۵ تصویر و ۲۰ ویژگی قابل ثبت است', 422);
    }
    foreach ($gallery as $url) {
        if (!is_string($url) || !in_array($url, $oldGallery, true)) { fail('تصویر گالری معتبر نیست', 422); }
    }
    foreach ($features as $feature) {
        if (!is_string($feature) || stringLength($feature) > 1000) { fail('ویژگی محصول معتبر نیست', 422); }
    }
    $catalog = ['gallery' => $gallery, 'features' => array_values($features)];
    foreach (['summary' => 350, 'description' => 15000, 'usage' => 10000] as $key => $limit) {
        if (isset($payload[$key]) && !is_string($payload[$key])) { fail('اطلاعات محصول معتبر نیست', 422); }
        $catalog[$key] = trim($payload[$key] ?? '');
        if (stringLength($catalog[$key]) > $limit) { fail('متن محصول بیش از حد طولانی است', 422); }
    }
    $totalImageBytes = 0;
    foreach ($imageData as $data) {
        if (!is_string($data) || !preg_match('#^data:image/(jpeg|png|webp);base64,(.+)$#s', $data, $imageMatch)) { fail('تصویر معتبر نیست', 422); }
        $binary = base64_decode($imageMatch[2], true);
        if ($binary === false || strlen($binary) > 3 * 1024 * 1024) { fail('تصویر نامعتبر یا بزرگ‌تر از ۳ مگابایت است', 422); }
        $totalImageBytes += strlen($binary);
        if ($totalImageBytes > 5 * 1024 * 1024) { fail('حجم مجموع تصاویر جدید حداکثر ۵ مگابایت باشد', 422); }
    }
    foreach ($imageData as $data) {
        $catalog['gallery'][] = saveImage($data, $uploadDir);
    }
    $statement = $db->prepare('UPDATE products SET catalog = ? WHERE id = ?');
    $statement->execute([json_encode($catalog, JSON_UNESCAPED_UNICODE), $product['id']]);
    foreach ($oldGallery as $url) {
        if (!in_array($url, $catalog['gallery'], true)) { removeUploadedImage($url, $uploadDir); }
    }
    $product['catalog'] = json_encode($catalog, JSON_UNESCAPED_UNICODE);
    respond(productRow($product));
}

if ($method === 'GET' && $path === '/api/admin/pages') {
    requireAdmin($db);
    respond(array_map('contentRow', $db->query('SELECT * FROM content_pages ORDER BY id')->fetchAll()));
}

if ($method === 'PUT' && preg_match('#^/api/admin/pages/(\d+)$#', $path, $matches)) {
    requireAdmin($db);
    $pageId = (int) $matches[1];
    $statement = $db->prepare('SELECT * FROM content_pages WHERE id = ?');
    $statement->execute([$pageId]);
    $current = $statement->fetch();
    if (!$current) {
        fail('صفحه پیدا نشد', 404);
    }
    $payload = body();
    $eyebrow = trim((string) ($payload['eyebrow'] ?? ''));
    $title = trim((string) ($payload['title'] ?? ''));
    $summary = trim((string) ($payload['summary'] ?? ''));
    $pageBody = trim((string) ($payload['body'] ?? ''));
    if (stringLength($eyebrow) < 2 || stringLength($eyebrow) > 80
        || stringLength($title) < 2 || stringLength($title) > 160
        || stringLength($summary) < 2 || stringLength($summary) > 500
        || stringLength($pageBody) < 2 || stringLength($pageBody) > 20000) {
        fail('اطلاعات صفحه معتبر نیست', 422);
    }
    $newImage = saveImage(isset($payload['image_data']) ? (string) $payload['image_data'] : null, $uploadDir);
    $imageUrl = $newImage ?: (!empty($payload['remove_image']) ? null : $current['image_url']);
    $statement = $db->prepare(
        'UPDATE content_pages SET eyebrow = ?, title = ?, summary = ?, body = ?, image_url = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    $statement->execute([$eyebrow, $title, $summary, $pageBody, $imageUrl, !empty($payload['published']) ? 1 : 0, $pageId]);
    if (($newImage || !empty($payload['remove_image'])) && $current['image_url'] !== $imageUrl) {
        removeUploadedImage($current['image_url'], $uploadDir);
    }
    $statement = $db->prepare('SELECT * FROM content_pages WHERE id = ?');
    $statement->execute([$pageId]);
    respond(contentRow($statement->fetch()));
}

if ($method === 'GET' && $path === '/api/admin/articles') {
    requireAdmin($db);
    respond(array_map('contentRow', $db->query('SELECT * FROM articles ORDER BY created_at DESC, id DESC')->fetchAll()));
}

if ($method === 'POST' && $path === '/api/admin/articles') {
    requireAdmin($db);
    $payload = body();
    $slug = trim((string) ($payload['slug'] ?? ''));
    $title = trim((string) ($payload['title'] ?? ''));
    $excerpt = trim((string) ($payload['excerpt'] ?? ''));
    $articleBody = trim((string) ($payload['body'] ?? ''));
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)
        || stringLength($title) < 2 || stringLength($title) > 180
        || stringLength($excerpt) < 2 || stringLength($excerpt) > 500
        || stringLength($articleBody) < 2 || stringLength($articleBody) > 30000) {
        fail('اطلاعات مقاله معتبر نیست', 422);
    }
    $imageUrl = saveImage(isset($payload['image_data']) ? (string) $payload['image_data'] : null, $uploadDir);
    try {
        $statement = $db->prepare('INSERT INTO articles (slug, title, excerpt, body, image_url, published) VALUES (?, ?, ?, ?, ?, ?)');
        $statement->execute([$slug, $title, $excerpt, $articleBody, $imageUrl, !empty($payload['published']) ? 1 : 0]);
    } catch (PDOException $error) {
        removeUploadedImage($imageUrl, $uploadDir);
        fail('این شناسه مقاله قبلاً استفاده شده است', 409);
    }
    $statement = $db->prepare('SELECT * FROM articles WHERE id = ?');
    $statement->execute([(int) $db->lastInsertId()]);
    respond(contentRow($statement->fetch()), 201);
}

if ($method === 'PUT' && preg_match('#^/api/admin/articles/(\d+)$#', $path, $matches)) {
    requireAdmin($db);
    $articleId = (int) $matches[1];
    $statement = $db->prepare('SELECT * FROM articles WHERE id = ?');
    $statement->execute([$articleId]);
    $current = $statement->fetch();
    if (!$current) {
        fail('مقاله پیدا نشد', 404);
    }
    $payload = body();
    $slug = trim((string) ($payload['slug'] ?? ''));
    $title = trim((string) ($payload['title'] ?? ''));
    $excerpt = trim((string) ($payload['excerpt'] ?? ''));
    $articleBody = trim((string) ($payload['body'] ?? ''));
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)
        || stringLength($title) < 2 || stringLength($title) > 180
        || stringLength($excerpt) < 2 || stringLength($excerpt) > 500
        || stringLength($articleBody) < 2 || stringLength($articleBody) > 30000) {
        fail('اطلاعات مقاله معتبر نیست', 422);
    }
    $newImage = saveImage(isset($payload['image_data']) ? (string) $payload['image_data'] : null, $uploadDir);
    $imageUrl = $newImage ?: (!empty($payload['remove_image']) ? null : $current['image_url']);
    try {
        $statement = $db->prepare(
            'UPDATE articles SET slug = ?, title = ?, excerpt = ?, body = ?, image_url = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        $statement->execute([$slug, $title, $excerpt, $articleBody, $imageUrl, !empty($payload['published']) ? 1 : 0, $articleId]);
    } catch (PDOException $error) {
        removeUploadedImage($newImage, $uploadDir);
        fail('این شناسه مقاله قبلاً استفاده شده است', 409);
    }
    if (($newImage || !empty($payload['remove_image'])) && $current['image_url'] !== $imageUrl) {
        removeUploadedImage($current['image_url'], $uploadDir);
    }
    $statement = $db->prepare('SELECT * FROM articles WHERE id = ?');
    $statement->execute([$articleId]);
    respond(contentRow($statement->fetch()));
}

if ($method === 'DELETE' && preg_match('#^/api/admin/articles/(\d+)$#', $path, $matches)) {
    requireAdmin($db);
    $statement = $db->prepare('SELECT image_url FROM articles WHERE id = ?');
    $statement->execute([(int) $matches[1]]);
    $article = $statement->fetch();
    if (!$article) {
        fail('مقاله پیدا نشد', 404);
    }
    $db->prepare('DELETE FROM articles WHERE id = ?')->execute([(int) $matches[1]]);
    removeUploadedImage($article['image_url'], $uploadDir);
    respond(null, 204);
}

if ($method === 'DELETE' && preg_match('#^/api/admin/products/(\d+)$#', $path, $matches)) {
    requireAdmin($db);
    $statement = $db->prepare('SELECT image_url, catalog FROM products WHERE id = ?');
    $statement->execute([(int) $matches[1]]);
    $product = $statement->fetch();
    if (!$product) {
        fail('محصول پیدا نشد', 404);
    }
    $db->prepare('DELETE FROM products WHERE id = ?')->execute([(int) $matches[1]]);
    removeUploadedImage($product['image_url'], $uploadDir);
    $catalog = json_decode($product['catalog'] ?? '{}', true) ?: [];
    foreach ($catalog['gallery'] ?? [] as $url) { removeUploadedImage($url, $uploadDir); }
    respond(null, 204);
}

if ($method === 'POST' && $path === '/api/newsletter') {
    $payload = body();
    $mobile = preg_replace('/\s+/', '', (string) ($payload['mobile'] ?? ''));
    if (!preg_match('/^(?:\+98|0098|98|0)?9\d{9}$/', $mobile)) {
        fail('شماره موبایل معتبر نیست', 422);
    }
    $mobile = preg_replace('/^(?:\+98|0098|98)/', '0', $mobile);
    $statement = $db->prepare('SELECT id FROM newsletter_members WHERE mobile = ?');
    $statement->execute([$mobile]);
    if ($statement->fetch()) {
        respond(['message' => 'این شماره قبلاً عضو باشگاه شده است', 'created' => false], 201);
    }
    $db->prepare('INSERT INTO newsletter_members (mobile) VALUES (?)')->execute([$mobile]);
    respond(['message' => 'عضویت شما با موفقیت ثبت شد', 'created' => true], 201);
}

if ($method === 'POST' && $path === '/api/cart/quote') {
    $payload = body();
    $lines = [];
    $subtotal = 0;
    foreach (($payload['items'] ?? []) as $item) {
        $productId = filter_var($item['product_id'] ?? null, FILTER_VALIDATE_INT);
        $quantity = filter_var($item['quantity'] ?? 1, FILTER_VALIDATE_INT);
        if (!$productId || !$quantity || $quantity < 1 || $quantity > 20) {
            fail('سبد خرید معتبر نیست', 422);
        }
        $statement = $db->prepare('SELECT id, name, price FROM products WHERE id = ?');
        $statement->execute([$productId]);
        $product = $statement->fetch();
        if (!$product) {
            fail("محصول {$productId} پیدا نشد", 404);
        }
        $lineTotal = (int) $product['price'] * $quantity;
        $subtotal += $lineTotal;
        $lines[] = [
            'product_id' => (int) $product['id'],
            'name' => $product['name'],
            'quantity' => $quantity,
            'unit_price' => (int) $product['price'],
            'line_total' => $lineTotal,
        ];
    }
    $shipping = ($subtotal === 0 || $subtotal >= 1500000) ? 0 : 85000;
    respond(['lines' => $lines, 'subtotal' => $subtotal, 'shipping' => $shipping, 'total' => $subtotal + $shipping]);
}

if ($method === 'POST' && $path === '/api/contact') {
    $payload = body();
    $name = trim((string) ($payload['name'] ?? ''));
    $mobile = trim((string) ($payload['mobile'] ?? ''));
    $email = trim((string) ($payload['email'] ?? '')) ?: null;
    $message = trim((string) ($payload['message'] ?? ''));
    if (stringLength($name) < 2 || stringLength($name) > 80
        || !preg_match('/^(?:\+98|0098|98|0)?9\d{9}$/', $mobile)
        || ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL))
        || stringLength($message) < 10 || stringLength($message) > 2000) {
        fail('اطلاعات پیام معتبر نیست', 422);
    }
    $statement = $db->prepare(
        'INSERT INTO contact_messages (name, mobile, email, message) VALUES (?, ?, ?, ?)'
    );
    $statement->execute([$name, $mobile, $email, $message]);
    respond(['message' => 'پیام شما ثبت شد؛ به‌زودی با شما تماس می‌گیریم'], 201);
}

fail('مسیر موردنظر پیدا نشد', 404);
