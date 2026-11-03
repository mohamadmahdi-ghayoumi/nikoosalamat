import json

from app import database


def test_brand_spelling_migration_preserves_content(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DATA_DIR", tmp_path)
    monkeypatch.setattr(database, "DB_PATH", tmp_path / "brand-test.db")
    database.init_database()
    with database.connect() as connection:
        connection.execute("DELETE FROM app_meta WHERE meta_key = 'brand_spelling_v1'")
        connection.execute(
            "UPDATE products SET name = ?, catalog = ? WHERE id = 1",
            ("هوف ژل فارمیکور ویژه", json.dumps({"summary": "معرفی فارمیکو", "gallery": ["/uploads/keep.png"]}, ensure_ascii=False)),
        )
        connection.execute(
            "UPDATE content_pages SET body = ? WHERE slug = 'hoof-care'",
            ("متن اختصاصی فارمیوکر و فارمیکر",),
        )
    database.init_database()
    with database.connect() as connection:
        product = connection.execute("SELECT * FROM products WHERE id = 1").fetchone()
        assert product["name"] == "هوف ژل فارمیکِر ویژه"
        assert product["price"] == 385_000
        assert json.loads(product["catalog"]) == {"summary": "معرفی فارمیکِر", "gallery": ["/uploads/keep.png"]}
        page = connection.execute("SELECT body FROM content_pages WHERE slug = 'hoof-care'").fetchone()
        assert page["body"] == "متن اختصاصی فارمیکِر و فارمیکِر"
    database.init_database()
    with database.connect() as connection:
        assert connection.execute("SELECT name FROM products WHERE id = 1").fetchone()[0] == "هوف ژل فارمیکِر ویژه"
