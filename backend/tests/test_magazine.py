from xml.etree import ElementTree

from app import database, main
from test_product_edit import editor
from test_support_php import php_site


CATEGORIES = ['hoof-trimming', 'diseases', 'scientific', 'sheep-goats', 'agriculture', 'horses', 'human']


def test_magazine_categories_persist_and_legacy_clients_preserve_category(editor):
    client, admin, _ = editor
    payload = {'slug': 'magazine-test', 'title': 'مقاله مجله', 'excerpt': 'خلاصه مقاله', 'body': '<h2>تیتر</h2><p><strong>متن بولد</strong></p>', 'published': True}
    assert client.post('/api/admin/articles', json=payload).status_code == 401
    created = client.post('/api/admin/articles', headers=admin, json=payload)
    assert created.status_code == 201 and created.json()['category'] == 'general'
    endpoint = f"/api/admin/articles/{created.json()['id']}"
    for category in CATEGORIES:
        updated = client.put(endpoint, headers=admin, json={**payload, 'category': category})
        assert updated.status_code == 200 and updated.json()['category'] == category
        assert client.get('/api/articles/magazine-test').json()['category'] == category
        database.init_database()
        assert client.get('/api/admin/articles', headers=admin).json()[0]['category'] == category
    assert client.put(endpoint, headers=admin, json=payload).json()['category'] == 'human'
    assert client.put(endpoint, headers=admin, json={**payload, 'category': 'latest'}).status_code == 422
    assert client.post('/api/admin/articles', headers=admin, json={**payload, 'slug': 'invalid-category', 'category': 'bad'}).status_code == 422
    assert client.get('/api/articles/magazine-test').json()['body'] == payload['body']
    client.put(endpoint, headers=admin, json={**payload, 'published': False})
    assert client.get('/api/articles/magazine-test').status_code == 404
    assert all(item['slug'] != 'magazine-test' for item in client.get('/api/articles').json())


def test_magazine_url_and_sitemap(editor, tmp_path, monkeypatch):
    client, _, _ = editor
    (tmp_path / 'index.html').write_text('<!doctype html><title>Magazine route fixture</title>', encoding='utf-8')
    monkeypatch.setattr(main, 'FRONTEND_DIST', tmp_path)
    assert client.get('/articles', follow_redirects=False).headers['location'] == '/mag/'
    assert client.get('/articles/', follow_redirects=False).status_code == 301
    assert client.get('/mag/').status_code == 200
    root = ElementTree.fromstring(client.get('/sitemap.xml').content)
    urls = [node.text for node in root.findall('{*}url/{*}loc')]
    assert 'https://nikoosalamat.ir/mag/' in urls
    assert 'https://nikoosalamat.ir/articles' not in urls


def test_magazine_migration_keeps_existing_content(tmp_path, monkeypatch):
    monkeypatch.setattr(database, 'DATA_DIR', tmp_path)
    monkeypatch.setattr(database, 'DB_PATH', tmp_path / 'old-magazine.db')
    with database.connect() as db:
        db.execute('CREATE TABLE articles(id INTEGER PRIMARY KEY,slug TEXT UNIQUE,title TEXT,excerpt TEXT,body TEXT,image_url TEXT,published INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        db.execute("INSERT INTO articles(id,slug,title,excerpt,body) VALUES (1,'old-article','عنوان قدیمی','خلاصه قدیمی','<p><b>متن قدیمی</b></p>')")
    database.init_database()
    result = database.fetch_one('SELECT * FROM articles WHERE id=1')
    assert result['category'] == 'general'
    assert result['body'] == '<p><b>متن قدیمی</b></p>'
    database.execute("UPDATE articles SET category='horses' WHERE id=1")
    database.init_database()
    assert database.fetch_one('SELECT category FROM articles WHERE id=1')['category'] == 'horses'


def test_php_magazine_category_validation_and_persistence(php_site):
    client, admin, _ = php_site
    payload = {'slug': 'php-magazine', 'title': 'مقاله مجله', 'excerpt': 'خلاصه مجله', 'body': '<p><b>متن بولد</b></p>', 'category': 'scientific', 'published': True}
    result = client.post('/api/admin/articles', headers=admin, json=payload)
    assert result.status_code == 201, result.text
    article_id = result.json()['id']
    endpoint = f'/api/admin/articles/{article_id}'
    assert result.json()['category'] == 'scientific'
    assert client.get('/api/articles/php-magazine').json()['category'] == 'scientific'
    assert client.put(endpoint, headers=admin, json={**payload, 'category': 'horses'}).json()['category'] == 'horses'
    legacy = {key: value for key, value in payload.items() if key != 'category'}
    assert client.put(endpoint, headers=admin, json=legacy).json()['category'] == 'horses'
    assert client.put(endpoint, headers=admin, json={**payload, 'category': 'bad'}).status_code == 422
    assert client.get('/api/articles/php-magazine').json()['body'] == payload['body']
    assert 'https://nikoosalamat.ir/mag/' in client.get('/sitemap.xml').text
