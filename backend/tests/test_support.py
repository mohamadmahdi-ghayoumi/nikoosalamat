import hashlib
import secrets
import time

import pytest
from fastapi.testclient import TestClient

from app import database, main, support


@pytest.fixture
def chat(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DATA_DIR", tmp_path)
    monkeypatch.setattr(database, "DB_PATH", tmp_path / "support-test.db")
    monkeypatch.setattr(main, "UPLOAD_DIR", tmp_path / "uploads")
    monkeypatch.setenv("SOVARA_ADMIN_USERNAME", "support-test")
    monkeypatch.setenv("SOVARA_ADMIN_PASSWORD", "local-only-test-password")
    monkeypatch.setenv("SUPPORT_TELEGRAM_BOT_TOKEN", "123456:test_bot_token")
    monkeypatch.setenv("SUPPORT_TELEGRAM_CHAT_ID", "-1001234")
    monkeypatch.setenv("SUPPORT_TELEGRAM_STAFF_IDS", "456,789")
    monkeypatch.setenv("SUPPORT_TELEGRAM_WEBHOOK_SECRET", "local_test_secret_" + "a" * 32)
    with TestClient(main.app) as client:
        login = client.post("/api/admin/login", json={"username": "support-test", "password": "local-only-test-password"})
        headers = {"Authorization": "Bearer " + login.json()["token"]}
        yield client, headers, monkeypatch


def activate(client, admin):
    assert client.put("/api/admin/support/status", headers=admin, json={"enabled": True}).status_code == 200


def create(client):
    result = client.post("/api/support/conversations", json={})
    assert result.status_code == 201
    session = result.json()
    return "/api/support/conversations/" + session["id"], {"X-Support-Token": session["token"]}, session


def send(client, url, headers, text="پیام آزمایشی", client_id=None):
    return client.post(url + "/messages", headers=headers, json={"text": text, "client_id": client_id or secrets.token_hex(16)})


def test_disabled_by_default_and_requires_admin(chat):
    client, admin, _ = chat
    assert client.get("/api/support/status").json() == {"enabled": False}
    assert client.post("/api/support/conversations", json={}).status_code == 503
    assert client.get("/api/admin/support/status").status_code == 401
    assert client.put("/api/admin/support/status", json={"enabled": True}).status_code == 401
    assert client.get("/api/admin/support/status", headers=admin).json()["telegram_configured"] is True
    assert client.put("/api/admin/support/status", headers=admin, json={"enabled": "false"}).status_code == 422


def test_guest_isolation_roundtrip_persistence_and_idempotency(chat):
    client, admin, _ = chat
    activate(client, admin)
    first, guest, session = create(client)
    second, other, _ = create(client)
    key = secrets.token_hex(16)
    sent = send(client, first, guest, "سلام <script>alert(1)</script>", key)
    assert sent.status_code == 201
    assert send(client, first, guest, "سلام <script>alert(1)</script>", key).json() == sent.json()
    assert send(client, first, guest, "متن متفاوت", key).status_code == 409
    assert client.get(first + "/messages", headers=other).status_code == 404
    assert client.get(first + "/messages").status_code == 404
    assert client.get(first + "/messages?token=" + session["token"]).status_code == 404
    row = database.fetch_one("SELECT token_hash FROM support_conversations WHERE id=?", (session["id"],))
    assert row["token_hash"] == hashlib.sha256(session["token"].encode()).hexdigest()
    assert row["token_hash"] != session["token"]
    reply = send(client, first.replace("/api/support/", "/api/admin/support/"), admin, "پاسخ از پنل")
    assert reply.status_code == 201
    assert reply.json()["role"] == "staff"
    database.init_database()
    history = client.get(first + "/messages", headers=guest).json()["messages"]
    assert [item["role"] for item in history] == ["visitor", "staff"]
    assert client.get(second + "/messages", headers=other).json()["messages"] == []
    assert len(client.get(first + f"/messages?after={sent.json()['id']}", headers=guest).json()["messages"]) == 1
    assert "token" not in str(client.get("/api/admin/support/conversations", headers=admin).json())


def test_validation_rate_limits_and_closed_conversation(chat):
    client, admin, _ = chat
    activate(client, admin)
    url, guest, session = create(client)
    assert send(client, url, guest, " " * 10).status_code == 422
    assert send(client, url, guest, "x" * 2001).status_code == 422
    assert send(client, url, guest, "x", "telegram_10").status_code == 422
    assert client.post(url + "/messages", headers=guest, content='{"text":"' + "x" * 66000 + '"}').status_code == 413
    for _ in range(12):
        assert send(client, url, guest).status_code == 201
    assert send(client, url, guest).status_code == 429
    assert client.post(url + "/close", headers=guest, json={}).status_code == 404
    assert client.post(url.replace("/api/support/", "/api/admin/support/") + "/close", headers=admin, json={}).status_code == 200
    assert send(client, url, guest).status_code == 409
    assert client.get(url + "/messages", headers=guest).json()["closed"] is True
    for _ in range(3):
        create(client)
    assert client.post("/api/support/conversations", json={}).status_code == 429


def test_telegram_secret_staff_allowlist_mapping_and_deduplication(chat):
    client, admin, monkeypatch = chat
    activate(client, admin)
    url, guest, session = create(client)
    send(client, url, guest)
    calls = []
    def fake_telegram(cfg, method, payload):
        calls.append((method, payload))
        return {"ok": True, "result": {"message_id": 101}}
    monkeypatch.setattr(support, "telegram", fake_telegram)
    assert client.post("/api/admin/support/retry", headers=admin, json={}).json()["sent"] == 1
    assert calls[0][1]["chat_id"] == "-1001234"
    assert "parse_mode" not in calls[0][1]
    payload = {"update_id": 900, "message": {"chat": {"id": -1001234}, "from": {"id": 456, "is_bot": False}, "reply_to_message": {"message_id": 101}, "text": "پاسخ تلگرام"}}
    endpoint = "/api/support/telegram/webhook"
    assert client.post(endpoint, json=payload).status_code == 403
    webhook_headers = {"X-Telegram-Bot-Api-Secret-Token": support.config()["webhook_secret"]}
    for field, invalid in [("from", {"id": 999}), ("chat", {"id": -999}), ("reply_to_message", {"message_id": 999})]:
        wrong = {**payload, "message": {**payload["message"], field: invalid}}
        assert client.post(endpoint, headers=webhook_headers, json=wrong).status_code == 200
        assert len(client.get(url + "/messages", headers=guest).json()["messages"]) == 1
    assert client.post(endpoint, headers=webhook_headers, json=payload).status_code == 200
    assert client.post(endpoint, headers=webhook_headers, json=payload).status_code == 200
    messages = client.get(url + "/messages", headers=guest).json()["messages"]
    assert [item["text"] for item in messages] == ["پیام آزمایشی", "پاسخ تلگرام"]


def test_outage_keeps_durable_queue_and_retries(chat):
    client, admin, monkeypatch = chat
    activate(client, admin)
    url, guest, session = create(client)
    saved = send(client, url, guest).json()
    monkeypatch.setattr(support, "telegram", lambda *args: {"ok": False, "parameters": {"retry_after": 120}})
    assert client.post("/api/admin/support/retry", headers=admin, json={}).json()["sent"] == 0
    row = database.fetch_one("SELECT * FROM support_messages WHERE id=?", (saved["id"],))
    assert row["telegram_id"] is None and row["attempts"] == 1
    assert row["next_attempt"] >= int(time.time()) + 118
    assert client.get(url + "/messages", headers=guest).json()["messages"][0]["text"] == "پیام آزمایشی"
    database.execute("UPDATE support_messages SET next_attempt=0")
    monkeypatch.setattr(support, "telegram", lambda *args: {"ok": True, "result": {"message_id": 102}})
    with database.connect() as db:
        assert support.drain(db, support.config(), 1) == 1
    assert database.fetch_one("SELECT telegram_id FROM support_messages WHERE id=?", (saved["id"],))["telegram_id"] == 102


def test_existing_webhook_not_replaced_and_expiry(chat):
    client, admin, monkeypatch = chat
    activate(client, admin)
    url, guest, session = create(client)
    calls = []
    def existing(cfg, method, payload):
        calls.append(method)
        return {"ok": True, "result": {"url": "https://other.example/bot"}}
    monkeypatch.setattr(support, "telegram", existing)
    assert client.post("/api/admin/support/telegram/connect", headers=admin, json={}).status_code == 409
    assert calls == ["getWebhookInfo"]
    database.execute("UPDATE support_conversations SET expires_at=0 WHERE id=?", (session["id"],))
    assert client.get(url + "/messages", headers=guest).status_code == 404
