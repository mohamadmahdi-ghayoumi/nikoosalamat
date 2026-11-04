from app import database


def test_solution_pages_are_seeded_without_overwriting_admin_edits(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DATA_DIR", tmp_path)
    monkeypatch.setattr(database, "DB_PATH", tmp_path / "solutions.db")
    database.init_database()
    with database.connect() as connection:
        for slug in ("foot-and-mouth", "digital-dermatitis", "wounds-injuries", "hoof-care", "udder-health"):
            page = connection.execute("SELECT * FROM content_pages WHERE slug = ?", (slug,)).fetchone()
            assert page is not None
            assert page["published"] == 1
            assert page["body"].strip()
        connection.execute("UPDATE content_pages SET body = ? WHERE slug = ?", ("ویرایش اختصاصی ادمین", "digital-dermatitis"))
    database.init_database()
    with database.connect() as connection:
        page = connection.execute("SELECT body FROM content_pages WHERE slug = ?", ("digital-dermatitis",)).fetchone()
        assert page["body"] == "ویرایش اختصاصی ادمین"
