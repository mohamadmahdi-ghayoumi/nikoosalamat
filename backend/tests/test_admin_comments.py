"""Admin document follow-up checks; all writes use disposable local fixtures."""
from test_product_edit import editor
from test_support_php import php_site


def check_product_sections(client, admin):
    product = client.get('/api/products').json()[0]
    endpoint = f"/api/admin/products/{product['id']}/catalog"
    catalog = {
        'summary': 'خلاصه محصول', 'description': 'متن معرفی بدون تغییر',
        'usage': 'راهنمای مصرف', 'features': ['ویژگی اول'], 'gallery': [],
        'introduction_title': 'آشنایی با محصول',
        'features_title': 'مزایای محصول', 'usage_title': 'راهنمای استفاده',
    }
    assert client.put(endpoint, json=catalog).status_code == 401
    saved = client.put(endpoint, headers=admin, json=catalog)
    assert saved.status_code == 200, saved.text
    public = client.get(f"/api/products/{product['id']}").json()['catalog']
    for key, value in catalog.items():
        assert saved.json()['catalog'][key] == value
        assert public[key] == value
    for field in ('introduction_title', 'features_title', 'usage_title'):
        assert client.put(endpoint, headers=admin, json={**catalog, field: 'x' * 101}).status_code == 422
    assert client.get(f"/api/products/{product['id']}").json()['catalog']['description'] == catalog['description']
    legacy = {key: value for key, value in catalog.items() if not key.endswith('_title')}
    result = client.put(endpoint, headers=admin, json=legacy)
    assert result.status_code == 200
    assert result.json()['catalog']['features_title'] == catalog['features_title']
    # Explicitly clearing a title restores the default label.
    result = client.put(endpoint, headers=admin, json={**legacy, 'features_title': ''})
    assert result.json()['catalog']['features_title'] == ''


def check_solution_formatting(client, admin):
    page = client.get('/api/admin/pages', headers=admin).json()[0]
    body = '<h2>عنوان راهکار</h2><p>متن <strong>مهم</strong></p><ul><li>مورد اول</li></ul><img src="/images/hns-logo.png" alt="نشان" width="400px" data-align="center"><p>ادامه متن</p>'
    payload = {key: page[key] for key in ('eyebrow', 'title', 'summary', 'published')}
    payload['body'] = body
    endpoint = f"/api/admin/pages/{page['id']}"
    assert client.put(endpoint, json=payload).status_code == 401
    saved = client.put(endpoint, headers=admin, json=payload)
    assert saved.status_code == 200, saved.text
    assert saved.json()['body'] == body
    assert client.get(f"/api/pages/{page['slug']}").json()['body'] == body
    # Formatting overhead is allowed up to 30,000 characters, in both adapters.
    large = '<p>' + 'متن ' * 6000 + '</p>'
    assert client.put(endpoint, headers=admin, json={**payload, 'body': large}).status_code == 200
    assert client.put(endpoint, headers=admin, json={**payload, 'body': 'x' * 30001}).status_code == 422
    assert client.get(f"/api/pages/{page['slug']}").json()['body'] == large


def test_python_product_section_titles(editor):
    check_product_sections(*editor[:2])


def test_python_solution_rich_body(editor):
    check_solution_formatting(*editor[:2])


def test_php_product_section_titles(php_site):
    check_product_sections(*php_site[:2])


def test_php_solution_rich_body(php_site):
    check_solution_formatting(*php_site[:2])
