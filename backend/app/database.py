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
    ("coat-care", "مراقبت از پوست و مو", "درخشش طبیعی و سلامت ماندگار", "sparkle", "rose", 1),
    ("hoof-care", "مراقبت از سُم", "استحکام و انعطاف در هر قدم", "hoof", "gold", 2),
    ("protection", "محافظت و آرامش", "برای تمرین و استراحت بهتر", "shield", "green", 3),
    ("grooming", "لوازم نظافت", "همراه همیشگی اصطبل", "spray", "blue", 4),
]

PRODUCTS = [
    ("arnica-hoof-oil", "روغن تقویت سُم آرنیکا", "مراقبت از سُم", 385_000, "amber", "tin", "پرفروش", 1),
    ("mane-shine-spray", "اسپری درخشان‌کننده یال", "پوست و مو", 460_000, "wine", "spray", "جدید", 1),
    ("herbal-shampoo", "شامپو گیاهی ملایم", "شست‌وشو", 325_000, "olive", "bottle", None, 1),
    ("muscle-relief-balm", "بالم آرامش عضلات", "ریکاوری", 515_000, "cream", "jar", None, 1),
    ("daily-coat-brush", "برس روزانه پوشش", "لوازم نظافت", 275_000, "olive", "tin", None, 0),
    ("hoof-cleaner", "پاک‌کننده تخصصی سُم", "مراقبت از سُم", 410_000, "amber", "bottle", None, 0),
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
                INSERT INTO products (slug, name, category, price, tone, shape, badge, featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                PRODUCTS,
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
