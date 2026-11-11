<?php
declare(strict_types=1);

function initFaqs(PDO $db): void
{
    $db->exec(file_get_contents(__DIR__ . '/faq-schema.sql'));
    $db->exec('BEGIN IMMEDIATE');
    try {
        if (!(int)$db->query('SELECT seeded FROM faq_state WHERE id=1')->fetchColumn()) {
            $seed = json_decode(file_get_contents(__DIR__ . '/faq-seed.json'), true, 512, JSON_THROW_ON_ERROR);
            $stmt = $db->prepare('INSERT INTO faqs(question,answer,sort_order) VALUES (?,?,?)');
            foreach ($seed as $index => [$question, $answer]) $stmt->execute([$question, $answer, $index]);
            $db->exec('UPDATE faq_state SET seeded=1 WHERE id=1');
        }
        $db->exec('COMMIT');
    } catch (Throwable $error) {
        $db->exec('ROLLBACK');
        throw $error;
    }
}

function faqRow(array $row): array
{
    $row['id'] = (int)$row['id'];
    $row['sort_order'] = (int)$row['sort_order'];
    $row['published'] = (bool)$row['published'];
    return $row;
}

function faqData(): array
{
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) fail('درخواست بیش از حد بزرگ است', 413);
    $data = body();
    $question = is_string($data['question'] ?? null) ? trim($data['question']) : '';
    $answer = is_string($data['answer'] ?? null) ? trim($data['answer']) : '';
    $sort = $data['sort_order'] ?? 0;
    $published = $data['published'] ?? true;
    if (stringLength($question) < 2 || stringLength($question) > 300
        || stringLength($answer) < 2 || stringLength($answer) > 6000
        || !is_int($sort) || $sort < 0 || $sort > 10000 || !is_bool($published)) {
        fail('سؤال، پاسخ و ترتیب نمایش را به‌درستی وارد کنید', 422);
    }
    return [$question, $answer, $sort, (int)$published];
}

function faqRoutes(PDO $db, string $path, string $method): void
{
    if ($path !== '/api/faqs' && !preg_match('#^/api/admin/faqs(?:/\d+)?$#', $path)) return;
    $admin = $path !== '/api/faqs';
    if ($admin) requireAdmin($db);
    initFaqs($db);
    if ($method === 'GET' && in_array($path, ['/api/faqs', '/api/admin/faqs'], true)) {
        $sql = 'SELECT * FROM faqs' . ($admin ? '' : ' WHERE published=1') . ' ORDER BY sort_order,id';
        respond(array_map('faqRow', $db->query($sql)->fetchAll()));
    }
    if ($admin && $method === 'POST' && $path === '/api/admin/faqs') {
        $db->prepare('INSERT INTO faqs(question,answer,sort_order,published) VALUES (?,?,?,?)')->execute(faqData());
        $id = (int)$db->lastInsertId();
        $stmt = $db->prepare('SELECT * FROM faqs WHERE id=?');
        $stmt->execute([$id]);
        respond(faqRow($stmt->fetch()), 201);
    }
    if ($admin && preg_match('#^/api/admin/faqs/(\d+)$#', $path, $match)) {
        $id = (int)$match[1];
        $stmt = $db->prepare('SELECT * FROM faqs WHERE id=?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) fail('سؤال پیدا نشد', 404);
        if ($method === 'PUT') {
            $data = faqData();
            $data[] = $id;
            $db->prepare('UPDATE faqs SET question=?,answer=?,sort_order=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute($data);
            $stmt->execute([$id]);
            respond(faqRow($stmt->fetch()));
        }
        if ($method === 'DELETE') {
            $db->prepare('DELETE FROM faqs WHERE id=?')->execute([$id]);
            respond(['ok' => true]);
        }
    }
    fail('روش درخواست مجاز نیست', 405);
}
