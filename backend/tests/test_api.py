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
