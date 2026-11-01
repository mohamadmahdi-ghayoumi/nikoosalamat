from __future__ import annotations

import sqlite3
import hashlib
import hmac
import os
import secrets
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "sovara.db"


def hash_password(password: str, encoded: str | None = None) -> str:
    """Hash a password with PBKDF2, or recreate the hash using an encoded salt."""
    if encoded:
        _, iterations_text, salt_hex, _ = encoded.split("$", 3)
        iterations = int(iterations_text)
        salt = bytes.fromhex(salt_hex)
    else:
        iterations = 600_000
        salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        return hmac.compare_digest(hash_password(password, encoded), encoded)
    except (ValueError, TypeError):
        return False


CATEGORIES = [
    ("hoof-care", "مراقبت از سُم", "پیشگیری و مراقبت برای حرکت سالم دام", "hoof", "gold", 1),
    ("udder-health", "سلامت پستان", "مراقبت روزانه و حمایت از سلامت گله", "heart", "rose", 2),
    ("farm-disinfection", "ضدعفونی دامداری", "بهداشت محیط، تجهیزات و جایگاه دام", "shield", "green", 3),
    ("animal-hygiene", "بهداشت دام و اسب", "محصولات کاربردی برای مراقبت حرفه‌ای", "spray", "blue", 4),
]

PRODUCTS = [
    ("arnica-hoof-oil", "هوف ژل فارمیکو", "مراقبت از سُم", 385_000, "amber", "tin", "پرفروش", 1, "/images/hoof-gel.jpg"),
    ("mane-shine-spray", "پماد پستان فارمیکو", "سلامت پستان", 460_000, "wine", "jar", "پیشنهادی", 1, "/images/udder-ointment.jpg"),
    ("herbal-shampoo", "محلول ویروگاردیا", "ضدعفونی دامداری", 325_000, "olive", "bottle", None, 1, "/images/virucardia-solution.jpg"),
    ("muscle-relief-balm", "اسپری سُم فارمیکو", "مراقبت از سُم", 515_000, "cream", "spray", None, 1, "/images/hoof-spray.jpg"),
    ("daily-coat-brush", "محلول بهداشت جایگاه دام", "بهداشت دامداری", 275_000, "olive", "bottle", None, 0, "/images/barn-hygiene.jpg"),
    ("hoof-cleaner", "پاک‌کننده سُم فارمیکو", "مراقبت از سُم", 410_000, "amber", "bottle", None, 0, "/images/hoof-cleaner.jpg"),
]

CONTENT_PAGES = [
    ("hoof-care", "مراقبت تخصصی", "مراقبت از سُم", "راهکارهای پیشگیری و مراقبت برای حرکت سالم دام", "در این صفحه می‌توانید معرفی محصولات، نکات مراقبتی و محتوای مرتبط با سلامت سُم را منتشر کنید.", None, 1),
    ("udder-health", "سلامت گله", "سلامت پستان", "مراقبت روزانه و حمایت از سلامت پستان دام", "این صفحه برای معرفی راهکارها، محصولات و مطالب آموزشی مرتبط با سلامت پستان در نظر گرفته شده است.", None, 1),
    ("farm-disinfection", "بهداشت دامداری", "ضدعفونی دامداری", "بهداشت محیط، تجهیزات و جایگاه دام", "در این بخش می‌توانید روش‌ها و محصولات مرتبط با ضدعفونی و مدیریت بهداشت جایگاه را معرفی کنید.", None, 1),
    ("animal-hygiene", "مراقبت حرفه‌ای", "بهداشت دام و اسب", "محصولات و مطالب کاربردی برای مراقبت حرفه‌ای", "این صفحه محل انتشار راهکارهای بهداشتی و مراقبتی ویژه دام و اسب است.", None, 1),
]


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_database() -> None:
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price INTEGER NOT NULL CHECK(price >= 0),
                tone TEXT NOT NULL,
                shape TEXT NOT NULL,
                badge TEXT,
                featured INTEGER NOT NULL DEFAULT 0,
                image_url TEXT
            );

            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS admin_sessions (
                token_hash TEXT PRIMARY KEY,
                admin_id INTEGER NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS newsletter_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mobile TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                mobile TEXT NOT NULL,
                email TEXT,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS content_pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                eyebrow TEXT NOT NULL,
                title TEXT NOT NULL,
                summary TEXT NOT NULL,
                body TEXT NOT NULL,
                image_url TEXT,
                published INTEGER NOT NULL DEFAULT 1,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                excerpt TEXT NOT NULL,
                body TEXT NOT NULL,
                image_url TEXT,
                published INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )

        columns = {row[1] for row in connection.execute("PRAGMA table_info(products)")}
        if "image_url" not in columns:
            connection.execute("ALTER TABLE products ADD COLUMN image_url TEXT")

        category_count = connection.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        if category_count == 0:
            connection.executemany(
                """
                INSERT INTO categories (slug, name, description, icon, color, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                CATEGORIES,
            )

        product_count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        if product_count == 0:
            connection.executemany(
                """
                INSERT INTO products (slug, name, category, price, tone, shape, badge, featured, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                PRODUCTS,
            )

        connection.executemany(
            """
            INSERT OR IGNORE INTO content_pages
                (slug, eyebrow, title, summary, body, image_url, published)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            CONTENT_PAGES,
        )

        admin_email = os.getenv("SOVARA_ADMIN_USERNAME", "admin").strip().lower()
        admin_password = os.getenv("SOVARA_ADMIN_PASSWORD", "1234")
        current_admin = connection.execute("SELECT * FROM admins ORDER BY id LIMIT 1").fetchone()
        if current_admin is None:
            connection.execute(
                "INSERT INTO admins (email, password_hash) VALUES (?, ?)",
                (admin_email, hash_password(admin_password)),
            )
        elif current_admin["email"] != admin_email or not verify_password(admin_password, current_admin["password_hash"]):
            connection.execute(
                "UPDATE admins SET email = ?, password_hash = ? WHERE id = ?",
                (admin_email, hash_password(admin_password), current_admin["id"]),
            )
            connection.execute("DELETE FROM admin_sessions WHERE admin_id = ?", (current_admin["id"],))


def fetch_all(query: str, parameters: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    with connect() as connection:
        rows = connection.execute(query, parameters).fetchall()
        return [dict(row) for row in rows]


def fetch_one(query: str, parameters: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    with connect() as connection:
        row = connection.execute(query, parameters).fetchone()
        return dict(row) if row else None


def execute(query: str, parameters: tuple[Any, ...] = ()) -> int:
    with connect() as connection:
        cursor = connection.execute(query, parameters)
        connection.commit()
        return cursor.lastrowid
