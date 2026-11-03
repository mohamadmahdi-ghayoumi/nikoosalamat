from fastapi.testclient import TestClient
import os

from app.database import connect
from app.main import app


def test_home_returns_seeded_content():
    with TestClient(app) as client:
        response = client.get("/api/home")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["categories"]) == 4
    assert len(payload["featured_products"]) == 4
    assert payload["hero"]["title"] == "سلامت دام،"


def test_product_catalog_is_protected_persisted_and_validated():
    slug = "catalog-regression-test"
    with connect() as connection:
        connection.execute("DELETE FROM products WHERE slug = ?", (slug,))
    with TestClient(app) as client:
        session = client.post("/api/admin/login", json={
            "username": os.getenv("SOVARA_ADMIN_USERNAME", "admin"),
            "password": os.getenv("SOVARA_ADMIN_PASSWORD", "1234"),
        }).json()
        headers = {"Authorization": f"Bearer {session['token']}"}
        product = client.post("/api/admin/products", headers=headers, json={
            "slug": slug, "name": "محصول آزمایشی کاتالوگ", "category": "تست", "price": 1000,
        }).json()
        endpoint = f"/api/admin/products/{product['id']}/catalog"
        payload = {"summary": "خلاصه آزمایشی", "description": "معرفی محصول", "features": ["ویژگی آزمایشی"], "usage": "مطابق برچسب محصول", "gallery_data": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5l8AAAAASUVORK5CYII="]}
        try:
            assert client.put(endpoint, json=payload).status_code == 401
            response = client.put(endpoint, headers=headers, json=payload)
            assert response.status_code == 200
            catalog = response.json()["catalog"]
            assert len(catalog["gallery"]) == 1
            assert client.get(f"/api/products/{product['id']}").json()["catalog"] == catalog
            assert client.get(catalog["gallery"][0]).status_code == 200
            assert client.put(endpoint, headers=headers, json={"gallery": ["https://example.com/injected.png"]}).status_code == 422
            assert client.put(endpoint, headers=headers, json={"gallery_data": [""]}).status_code == 422
            assert client.put(endpoint, headers=headers, json={"gallery_data": payload["gallery_data"] * 6}).status_code == 422
            assert client.get(f"/api/products/{product['id']}").json()["catalog"] == catalog
            assert client.put(endpoint, headers=headers, json={"summary": "ویرایش آزمایشی", "gallery": catalog["gallery"]}).status_code == 200
            assert client.put(endpoint, headers=headers, json={"gallery": []}).status_code == 200
            assert client.get(catalog["gallery"][0]).status_code == 404
        finally:
            client.delete(f"/api/admin/products/{product['id']}", headers=headers)
            client.post("/api/admin/logout", headers=headers)


def test_cart_quote_calculates_shipping():
    with TestClient(app) as client:
        response = client.post(
            "/api/cart/quote",
            json={"items": [{"product_id": 1, "quantity": 2}]},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["subtotal"] == 770_000
    assert payload["shipping"] == 85_000
    assert payload["total"] == 855_000


def test_contact_message_is_saved():
    mobile = "09120000001"
    with connect() as connection:
        connection.execute("DELETE FROM contact_messages WHERE mobile = ?", (mobile,))

    with TestClient(app) as client:
        response = client.post(
            "/api/contact",
            json={
                "name": "کاربر تست",
                "mobile": mobile,
                "email": "test@example.com",
                "message": "این پیام برای بررسی فرم تماس ثبت شده است.",
            },
        )

    assert response.status_code == 201
    with connect() as connection:
        saved = connection.execute("SELECT id FROM contact_messages WHERE mobile = ?", (mobile,)).fetchone()
        connection.execute("DELETE FROM contact_messages WHERE mobile = ?", (mobile,))
    assert saved is not None


def test_local_vite_ports_are_allowed_by_cors():
    with TestClient(app) as client:
        response = client.get("/api/products", headers={"Origin": "http://localhost:5199"})

    assert response.headers["access-control-allow-origin"] == "http://localhost:5199"


def test_admin_auth_protects_product_management():
    slug = "admin-api-test-product"
    with connect() as connection:
        connection.execute("DELETE FROM products WHERE slug = ?", (slug,))

    with TestClient(app) as client:
        denied = client.post(
            "/api/admin/products",
            json={"slug": slug, "name": "محصول تست", "category": "تست", "price": 1000},
        )
        assert denied.status_code == 401

        login = client.post(
            "/api/admin/login",
            json={
                "username": os.getenv("SOVARA_ADMIN_USERNAME", "admin"),
                "password": os.getenv("SOVARA_ADMIN_PASSWORD", "1234"),
            },
        )
        assert login.status_code == 200
        token = login.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        created = client.post(
            "/api/admin/products",
            headers=headers,
            json={"slug": slug, "name": "محصول تست", "category": "تست", "price": 1000},
        )
        assert created.status_code == 201
        product_id = created.json()["id"]

        removed = client.delete(f"/api/admin/products/{product_id}", headers=headers)
        assert removed.status_code == 204

        client.post("/api/admin/logout", headers=headers)
        assert client.get("/api/admin/me", headers=headers).status_code == 401


def test_admin_can_edit_pages_and_publish_articles():
    article_slug = "cms-api-test-article"
    with connect() as connection:
        connection.execute("DELETE FROM articles WHERE slug = ?", (article_slug,))

    with TestClient(app) as client:
        login = client.post(
            "/api/admin/login",
            json={
                "username": os.getenv("SOVARA_ADMIN_USERNAME", "admin"),
                "password": os.getenv("SOVARA_ADMIN_PASSWORD", "1234"),
            },
        )
        headers = {"Authorization": f"Bearer {login.json()['token']}"}

        pages = client.get("/api/admin/pages", headers=headers)
        assert pages.status_code == 200
        page = pages.json()[0]
        updated = client.put(
            f"/api/admin/pages/{page['id']}",
            headers=headers,
            json={
                "eyebrow": page["eyebrow"],
                "title": page["title"],
                "summary": page["summary"],
                "body": page["body"] + "\n\nمتن آزمایشی",
                "published": True,
            },
        )
        assert updated.status_code == 200
        assert client.get(f"/api/pages/{page['slug']}").status_code == 200

        created = client.post(
            "/api/admin/articles",
            headers=headers,
            json={
                "slug": article_slug,
                "title": "مقاله آزمایشی",
                "excerpt": "خلاصه مقاله آزمایشی",
                "body": "متن کامل مقاله آزمایشی برای بررسی سامانه مدیریت محتوا.",
                "published": True,
            },
        )
        assert created.status_code == 201
        article_id = created.json()["id"]
        assert client.get(f"/api/articles/{article_slug}").status_code == 200
        assert client.delete(f"/api/admin/articles/{article_id}", headers=headers).status_code == 204

        client.put(
            f"/api/admin/pages/{page['id']}",
            headers=headers,
            json={
                "eyebrow": page["eyebrow"],
                "title": page["title"],
                "summary": page["summary"],
                "body": page["body"],
                "published": page["published"],
            },
        )
