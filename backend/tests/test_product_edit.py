from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import database, main

IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5l8AAAAASUVORK5CYII="


@pytest.fixture
def editor(tmp_path, monkeypatch):
    # Never run editing tests against the developer's or production database.
    monkeypatch.setattr(database, "DATA_DIR", tmp_path)
    monkeypatch.setattr(database, "DB_PATH", tmp_path / "test.db")
    monkeypatch.setattr(main, "UPLOAD_DIR", tmp_path / "uploads")
    monkeypatch.setenv("SOVARA_ADMIN_USERNAME", "editor-test")
    monkeypatch.setenv("SOVARA_ADMIN_PASSWORD", "local-test-only-password")
    with TestClient(main.app) as client:
        login = client.post("/api/admin/login", json={
            "username": "editor-test", "password": "local-test-only-password",
        })
        assert login.status_code == 200
        headers = {"Authorization": f"Bearer {login.json()['token']}"}
        yield client, headers, tmp_path / "uploads"


def test_product_edit_is_protected_persistent_and_preserves_catalog(editor):
    client, headers, uploads = editor
    database.execute("UPDATE products SET featured = 0")
    initial = {"slug": "edit-test", "name": "محصول اولیه", "category": "مراقبت از سم", "price": 1000, "image_data": IMAGE}
    created = client.post("/api/admin/products", headers=headers, json=initial)
    assert created.status_code == 201
    product = created.json()
    endpoint = f"/api/admin/products/{product['id']}"
    original_image = product["image_url"]
    catalog_response = client.put(endpoint + "/catalog", headers=headers, json={
        "summary": "توضیحات قبلی", "description": "متن کامل", "gallery_data": [IMAGE], "features": ["ویژگی اول"],
    })
    assert catalog_response.status_code == 200
    catalog = catalog_response.json()["catalog"]
    edited = {**initial, "slug": "edited-product", "name": "محصول ویرایش‌شده", "category": "محلول تب برفکی", "price": 2500,
              "tone": "cream", "shape": "jar", "badge": "جدید", "featured": True, "image_data": None}
    assert client.put(endpoint, json=edited).status_code == 401
    assert client.put(endpoint, headers={"Authorization": "Bearer invalid"}, json=edited).status_code == 401
    response = client.put(endpoint, headers=headers, json=edited)
    assert response.status_code == 200
    result = response.json()
    for field in ["slug", "name", "category", "price", "tone", "shape", "badge", "featured"]:
        assert result[field] == edited[field]
    assert result["image_url"] == original_image
    assert result["catalog"] == catalog
    assert (uploads / Path(original_image).name).is_file()
    assert client.get(f"/api/products/{product['id']}").json() == result
    assert any(item["id"] == product["id"] for item in client.get("/api/home").json()["featured_products"])
    response = client.put(endpoint, headers=headers, json={**edited, "image_data": IMAGE})
    assert response.status_code == 200
    new_image = response.json()["image_url"]
    assert new_image != original_image
    assert not (uploads / Path(original_image).name).exists()
    assert (uploads / Path(new_image).name).is_file()
    assert response.json()["catalog"] == catalog
    removed = client.put(endpoint, headers=headers, json={**edited, "remove_image": True})
    assert removed.status_code == 200
    assert removed.json()["image_url"] is None
    assert not (uploads / Path(new_image).name).exists()
    assert (uploads / Path(catalog["gallery"][0]).name).is_file()


def test_product_edit_conflicts_and_invalid_updates_do_not_change_data(editor):
    client, headers, uploads = editor
    payload = {"slug": "first-product", "name": "محصول اول", "category": "سلامت پستان", "price": 1000, "image_data": IMAGE}
    original = client.post("/api/admin/products", headers=headers, json=payload).json()
    assert client.post("/api/admin/products", headers=headers, json={**payload, "slug": "second-product"}).status_code == 201
    endpoint = f"/api/admin/products/{original['id']}"
    files_before = set(uploads.iterdir())
    assert client.put(endpoint, headers=headers, json={**payload, "slug": "second-product"}).status_code == 409
    assert set(uploads.iterdir()) == files_before
    for change in [{"price": -1}, {"slug": "not valid"}, {"name": ""}, {"name": "   "}, {"category": "   "}, {"tone": "invalid"}, {"image_data": "bad-data"}]:
        assert client.put(endpoint, headers=headers, json={**payload, **change}).status_code == 422
    assert client.put("/api/admin/products/999999", headers=headers, json=payload).status_code == 404
    assert client.get(f"/api/products/{original['id']}").json() == original


def test_solution_edits_survive_reload_and_protect_unpublished_pages(editor):
    client, headers, uploads = editor
    page = client.get("/api/admin/pages", headers=headers).json()[0]
    endpoint = f"/api/admin/pages/{page['id']}"
    payload = {"eyebrow": "راهکار تخصصی", "title": "عنوان ویرایش‌شده", "summary": "خلاصه جدید راهکار",
               "body": "متن جدید راهکار", "published": True, "image_data": IMAGE}
    assert client.put(endpoint, json=payload).status_code == 401
    updated = client.put(endpoint, headers=headers, json=payload)
    assert updated.status_code == 200
    image = updated.json()["image_url"]
    assert client.get(f"/api/pages/{page['slug']}").json()["title"] == payload["title"]
    database.init_database()
    assert client.get(f"/api/pages/{page['slug']}").json()["body"] == payload["body"]
    hidden = client.put(endpoint, headers=headers, json={**payload, "image_data": None, "published": False})
    assert hidden.status_code == 200
    assert hidden.json()["image_url"] == image
    assert client.get(f"/api/pages/{page['slug']}").status_code == 404
    cleared = client.put(endpoint, headers=headers, json={**payload, "image_data": None, "remove_image": True})
    assert cleared.status_code == 200
    assert cleared.json()["image_url"] is None
    assert not (uploads / Path(image).name).exists()


def test_article_rich_text_roundtrip_keeps_markup_and_cover(editor):
    client, headers, _ = editor
    markup = '<h2>تیتر مقاله</h2><p>متن <strong>بولد</strong> و <em>کج</em></p><ul><li>مورد اول</li><li>مورد دوم</li></ul><ol start="3"><li>شماره‌دار</li></ol>'
    payload = {"slug": "rich-text-test", "title": "مقاله قالب‌دار", "excerpt": "خلاصه مقاله", "body": markup, "published": True, "image_data": IMAGE}
    created = client.post("/api/admin/articles", headers=headers, json=payload)
    assert created.status_code == 201
    article = created.json()
    assert article["body"] == markup
    assert client.get("/api/articles/rich-text-test").json()["body"] == markup
    changed = markup + '<blockquote><p>نقل‌قول تازه</p></blockquote>'
    endpoint = f"/api/admin/articles/{article['id']}"
    assert client.put(endpoint, json={**payload, "body": changed}).status_code == 401
    saved = client.put(endpoint, headers=headers, json={**payload, "body": changed, "image_data": None})
    assert saved.status_code == 200
    assert saved.json()["image_url"] == article["image_url"]
    database.init_database()
    assert client.get("/api/articles/rich-text-test").json()["body"] == changed
