import json
from pathlib import Path

import pytest

from test_product_edit import editor
from test_support_php import php_site


@pytest.mark.parametrize('adapter', ['editor', 'php_site'])
def test_faq_management_auth_persistence_order_and_seed_once(request, adapter):
    client, admin, _ = request.getfixturevalue(adapter)
    seed = json.loads((Path(__file__).parents[1] / 'app/faq_seed.json').read_text(encoding='utf-8'))
    response = client.get('/api/faqs')
    assert response.status_code == 200, response.text
    initial = response.json()
    assert [(row['question'], row['answer']) for row in initial] == [tuple(pair) for pair in seed]
    assert response.headers['cache-control'] == 'no-store'
    draft = {'question': 'سؤال آزمایشی', 'answer': 'پاسخ آزمایشی\nخط دوم <script>متن ساده</script>', 'sort_order': 9999, 'published': False}
    assert client.get('/api/admin/faqs').status_code == 401
    assert client.post('/api/admin/faqs', json=draft).status_code == 401
    result = client.post('/api/admin/faqs', headers=admin, json=draft)
    assert result.status_code == 201, result.text
    row = result.json()
    endpoint = f"/api/admin/faqs/{row['id']}"
    assert all(item['id'] != row['id'] for item in client.get('/api/faqs').json())
    assert client.put(endpoint, json=draft).status_code == 401
    assert client.delete(endpoint).status_code == 401
    assert client.put(endpoint, headers=admin, json={**draft, 'published': True, 'sort_order': 0}).status_code == 200
    original = initial[0]
    edited = {**original, 'answer': 'پاسخ ویرایش‌شده', 'sort_order': 10000}
    result = client.put(f"/api/admin/faqs/{original['id']}", headers=admin, json=edited)
    assert result.status_code == 200, result.text
    public = client.get('/api/faqs').json()
    assert public[-1]['id'] == original['id']
    assert public[-1]['answer'] == edited['answer']
    assert any(item['answer'] == draft['answer'] for item in public)
    assert [item['sort_order'] for item in public] == sorted(item['sort_order'] for item in public)
    for invalid in [{'question': '  '}, {'answer': 'a' * 6001}, {'sort_order': -1}, {'sort_order': 1.5}, {'published': 'yes'}]:
        assert client.post('/api/admin/faqs', headers=admin, json={**draft, **invalid}).status_code == 422
    assert client.put('/api/admin/faqs/999999', headers=admin, json=draft).status_code == 404
    assert client.delete('/api/admin/faqs/999999', headers=admin).status_code == 404
    # Delete only records from this disposable test database; reloading must not
    # restore the old hard-coded questions, even when the entire list is empty.
    for item in client.get('/api/admin/faqs', headers=admin).json():
        assert client.delete(f"/api/admin/faqs/{item['id']}", headers=admin).status_code == 200
    assert client.get('/api/faqs').json() == []
    assert client.get('/api/admin/faqs', headers=admin).json() == []
