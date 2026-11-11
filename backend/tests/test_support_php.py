"""Integration checks against the real cPanel PHP adapter, with disposable data.

Set SUPPORT_TEST_PHP to a PHP 8.1+ executable; optional PHP extension directory
can be set using SUPPORT_TEST_PHP_EXT. No production config/data is read.
"""
import json
import os
from pathlib import Path
import secrets
import shutil
import socket
import subprocess
import time

import httpx
import pytest

from app import database


@pytest.fixture
def php_site(tmp_path, monkeypatch):
    php = os.getenv("SUPPORT_TEST_PHP") or shutil.which("php")
    if not php:
        pytest.skip("PHP runtime not configured")
    root = Path(__file__).resolve().parents[2]
    site = tmp_path / "site"
    app_dir = site / "app"
    data_dir = app_dir / "data"
    data_dir.mkdir(parents=True)
    monkeypatch.setattr(database, "DATA_DIR", data_dir)
    monkeypatch.setattr(database, "DB_PATH", data_dir / "sovara.db")
    monkeypatch.setenv("SOVARA_ADMIN_USERNAME", "support-php-test")
    monkeypatch.setenv("SOVARA_ADMIN_PASSWORD", "local-php-only-password")
    database.init_database()
    # Fast hash only in this disposable fixture; production hashing is unchanged.
    # The PHP API verifies the configured password on every non-chat request.
    fixture_hash = subprocess.check_output([
        php, '-n', '-r', "echo password_hash('local-php-only-password', PASSWORD_BCRYPT, ['cost'=>4]);",
    ], text=True, timeout=45).strip()
    database.execute('UPDATE admins SET password_hash=?', (fixture_hash,))
    shutil.copyfile(root / ".deploy/cpanel-php/api.php", site / "api.php")
    shutil.copyfile(root / ".deploy/cpanel-php/app/support.php", app_dir / "support.php")
    shutil.copyfile(root / '.deploy/cpanel-php/app/faqs.php', app_dir / 'faqs.php')
    shutil.copyfile(root / 'backend/app/faq_schema.sql', app_dir / 'faq-schema.sql')
    shutil.copyfile(root / 'backend/app/faq_seed.json', app_dir / 'faq-seed.json')
    shutil.copyfile(root / "backend/app/support_schema.sql", app_dir / "support-schema.sql")
    secret = "local_php_webhook_secret_" + "a" * 32
    # Test-generated fixture, never copied from private server config.
    (site / "config.php").write_text("<?php return ['admin_username'=>'support-php-test','admin_password'=>'local-php-only-password','support'=>['bot_token'=>'123456:local_test_bot_token','chat_id'=>'-1001234','staff_ids'=>['456'],'webhook_secret'=>'" + secret + "']];", encoding="utf-8")
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    args = [php, "-n"]
    if os.getenv("SUPPORT_TEST_PHP_EXT"):
        args += ["-d", "extension_dir=" + os.environ["SUPPORT_TEST_PHP_EXT"]]
    args += ["-d", "extension=pdo_sqlite", "-d", "extension=mbstring", "-S", f"127.0.0.1:{port}", "-t", str(site), str(site / "api.php")]
    log_path = tmp_path / 'php-test.log'
    log = log_path.open('wb')
    process = subprocess.Popen(args, stdout=log, stderr=subprocess.STDOUT)
    client = httpx.Client(base_url=f"http://127.0.0.1:{port}", timeout=45)
    try:
        for _ in range(50):
            if process.poll() is not None:
                pytest.fail(log_path.read_text(errors="replace"))
            try:
                if client.get("/api/support/status").status_code == 200:
                    break
            except httpx.ConnectError:
                time.sleep(.1)
        else:
            pytest.fail("PHP server did not start")
        result = client.post("/api/admin/login", json={"username": "support-php-test", "password": "local-php-only-password"})
        assert result.status_code == 200, result.text
        admin = {"Authorization": "Bearer " + result.json()["token"]}
        yield client, admin, secret
    finally:
        client.close()
        process.terminate()
        process.wait(timeout=10)
        log.close()


def test_php_guest_admin_webhook_and_delivery_failure(php_site):
    client, admin, secret = php_site
    assert client.get("/api/support/status").json() == {"enabled": False}
    assert client.get("/api/admin/support/conversations").status_code == 401
    assert client.post("/api/support/conversations", json={}).status_code == 503
    assert client.put("/api/admin/support/status", headers=admin, json={"enabled": True}).status_code == 200
    session = client.post("/api/support/conversations", json={}).json()
    guest = {"X-Support-Token": session["token"]}
    url = "/api/support/conversations/" + session["id"]
    payload = {"text": "سلام <b>متن ساده</b>", "client_id": secrets.token_hex(16)}
    saved = client.post(url + "/messages", headers=guest, json=payload)
    assert saved.status_code == 201, saved.text
    assert client.post(url + "/messages", headers=guest, json=payload).json() == saved.json()
    assert client.post(url + "/messages", headers=guest, json={**payload, "text": "دیگر"}).status_code == 409
    assert client.get(url + "/messages").status_code == 404
    assert client.get(url + "/messages?token=" + session["token"]).status_code == 404
    assert client.get(url + "/messages", headers={"X-Support-Token": "wrong"}).status_code == 404
    assert client.post(url + "/messages", headers=guest, json={"text": "x", "client_id": "telegram_100"}).status_code == 422
    # cURL intentionally absent in this runtime: worker must retain queued data.
    assert client.post("/api/admin/support/retry", headers=admin, json={}).json() == {"sent": 0}
    row = database.fetch_one("SELECT * FROM support_messages WHERE id=?", (saved.json()["id"],))
    assert row["attempts"] == 1 and row["next_attempt"] > int(time.time())
    assert client.get(url + "/messages", headers=guest).json()["messages"][0]["text"] == payload["text"]
    database.execute("UPDATE support_messages SET telegram_chat='-1001234',telegram_id=101 WHERE id=?", (saved.json()["id"],))
    webhook = {"update_id": 500, "message": {"chat": {"id": -1001234}, "from": {"id": 456}, "reply_to_message": {"message_id": 101}, "text": "پاسخ تلگرام"}}
    endpoint = "/api/support/telegram/webhook"
    assert client.post(endpoint, json=webhook).status_code == 403
    hook_headers = {"X-Telegram-Bot-Api-Secret-Token": secret}
    wrong = {**webhook, "message": {**webhook["message"], "from": {"id": 999}}}
    assert client.post(endpoint, headers=hook_headers, json=wrong).status_code == 200
    assert len(client.get(url + "/messages", headers=guest).json()["messages"]) == 1
    assert client.post(endpoint, headers=hook_headers, json=webhook).status_code == 200
    assert client.post(endpoint, headers=hook_headers, json=webhook).status_code == 200
    history = client.get(url + "/messages", headers=guest).json()["messages"]
    assert [row["role"] for row in history] == ["visitor", "staff"]
    assert client.post(url.replace("/api/support/", "/api/admin/support/") + "/messages", headers=admin, json={"text": "پاسخ از پنل", "client_id": secrets.token_hex(16)}).status_code == 201
    assert len(client.get(url + "/messages", headers=guest).json()["messages"]) == 3
    assert client.post(url.replace("/api/support/", "/api/admin/support/") + "/close", headers=admin, json={}).status_code == 200
    assert client.post(url + "/messages", headers=guest, json={"text": "پس از بستن", "client_id": secrets.token_hex(16)}).status_code == 409
    assert client.get(url + "/messages", headers=guest).json()["closed"] is True
