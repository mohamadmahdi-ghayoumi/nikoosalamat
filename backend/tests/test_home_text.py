import pytest

from test_product_edit import editor
from test_support_php import php_site


@pytest.mark.parametrize('adapter', ['editor', 'php_site'])
def test_home_text_auth_persistence_validation_and_conflicts(request, adapter):
    client, admin, _ = request.getfixturevalue(adapter)
    public = '/api/home-text'
    endpoint = '/api/admin/home-text/categories.title'
    response = client.get(public)
    assert response.status_code == 200, response.text
    assert response.json() == {}
    assert response.headers['cache-control'] == 'no-store'
    payload = {'text': ' راهکارهای تخصصی جدید ', 'revision': 0}
    assert client.put(endpoint, json=payload).status_code == 401
    assert client.put(endpoint, headers={'Authorization': 'Bearer invalid'}, json=payload).status_code == 401
    saved = client.put(endpoint, headers=admin, json=payload)
    assert saved.status_code == 200, saved.text
    assert saved.json() == {'text': payload['text'].strip(), 'revision': 1}
    assert client.get(public).json() == {'categories.title': saved.json()}
    # The stale tab must not overwrite a newer edit, even when it has no row yet.
    assert client.put(endpoint, headers=admin, json=payload).status_code == 409
    assert client.get(public).json()['categories.title'] == saved.json()
    safe_text = '<img src=x onerror=alert(1)> فقط متن\nخط دوم'
    updated = client.put(endpoint, headers=admin, json={'text': safe_text, 'revision': 1})
    assert updated.status_code == 200, updated.text
    assert updated.json() == {'text': safe_text, 'revision': 2}
    # Fields are saved independently: concurrent edits in another section survive.
    second = client.put('/api/admin/home-text/benefits.0.title', headers=admin, json={'text': 'مزیت تازه', 'revision': 0})
    assert second.status_code == 200, second.text
    assert len(client.get(public).json()) == 2
    assert client.get(public).json()['categories.title'] == updated.json()
    assert client.put('/api/admin/home-text/unknown.title', headers=admin, json=payload).status_code == 404
    for invalid in [
        {'text': '   ', 'revision': 2}, {'text': 'a' * 251, 'revision': 2},
        {'text': 'عنوان', 'revision': -1}, {'text': 'عنوان', 'revision': '2'},
        {'text': 'عنوان', 'revision': True}, {'text': 'عنوان'},
        {'text': None, 'revision': 2}, {'text': 'عنوان', 'revision': 2, 'extra': 'no'},
    ]:
        result = client.put(endpoint, headers=admin, json=invalid)
        assert result.status_code == 422, result.text
    assert client.get(public).json()['categories.title'] == updated.json()
