import pytest
from fastapi.testclient import TestClient

from app import database
from app.main import app
from app.text import normalize_mobile, normalize_search


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DATA_DIR", tmp_path)
    monkeypatch.setattr(database, "DB_PATH", tmp_path / "usability.db")
    with TestClient(app) as client:
        yield client


def test_search_normalizes_persian_and_only_returns_public_content(client):
    with database.connect() as connection:
        connection.execute("UPDATE products SET name = ? WHERE id = 1", ("ژل کیفیت فارمیوکِر",))
        connection.execute("INSERT INTO articles (slug,title,excerpt,body,published) VALUES (?,?,?,?,?)", ("public-care", "آموزش مراقبت از سُم", "خلاصه آموزشی", "نکته ویژه مقاله", 1))
        connection.execute("INSERT INTO articles (slug,title,excerpt,body,published) VALUES (?,?,?,?,?)", ("private-draft", "محرمانهپیش‌نویس", "محرمانهپیش‌نویس", "محرمانهپیش‌نویس", 0))
        connection.execute("UPDATE content_pages SET published = 0, body = ? WHERE slug = 'wounds-injuries'", ("محرمانهپیش‌نویس",))
        connection.execute("INSERT INTO contact_messages (name,mobile,message) VALUES (?,?,?)", ("محرمانهپیش‌نویس", "09123456789", "محرمانهپیش‌نویس"))
    response = client.get("/api/search", params={"q": "كِيفيت فارميكر"})
    assert response.status_code == 200
    assert response.json()["results"][0]["path"] == "/products/1"
    assert set(response.json()["results"][0]) == {"kind", "title", "excerpt", "path"}
    assert "/articles/public-care" in {row["path"] for row in client.get("/api/search", params={"q": "مراقبت سم"}).json()["results"]}
    assert client.get("/api/search", params={"q": "نکته ویژه"}).json()["results"][0]["path"] == "/articles/public-care"
    assert client.get("/api/search", params={"q": "محرمانهپیش‌نویس"}).json()["total"] == 0
    assert client.get("/api/search", params={"q": "admin"}).json()["total"] == 0
    assert client.get("/api/search", params={"q": "تماس"}).json()["results"]
    assert client.get("/api/search", params={"q": " ' OR 1=1 -- "}).json()["total"] == 0
    assert client.get("/api/search", params={"q": "   "}).json()["results"] == []
    assert client.get("/api/search", params={"q": "ا" * 121}).status_code == 422


@pytest.mark.parametrize("mobile", ["09123456789", "۰۹۱۲۳۴۵۶۷۸۹", "٠٩١٢٣٤٥٦٧٨٩", "+۹۸۹۱۲۳۴۵۶۷۸۹", "0098 912 345 6789", "(0912)345-6789"])
def test_contact_accepts_digit_styles_and_stores_normalized_mobile(client, mobile):
    response = client.post("/api/contact", json={"name": "نام آزمایشی", "mobile": mobile, "message": "متن پیام آزمایشی برای بررسی فرم تماس"})
    assert response.status_code == 201
    with database.connect() as connection:
        assert connection.execute("SELECT mobile FROM contact_messages").fetchone()[0] == "09123456789"


def test_phone_and_search_normalization():
    assert normalize_mobile("شماره نامعتبر") == "شمارهنامعتبر"
    assert normalize_search("  كِيفيت سُم  ") == "کیفیت سم"
