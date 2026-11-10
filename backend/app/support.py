"""Human support inbox and Telegram bridge. No AI API or paid subscription.

The PHP production adapter uses the same schema and HTTP contract. Secrets are
server-only; visitor credentials are hashed and never accepted in query strings.
"""
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import time
from urllib.request import Request as UrlRequest, urlopen
from urllib.error import HTTPError, URLError

from fastapi import HTTPException, Request

from . import database


def init(db):
    db.executescript(Path(__file__).with_name("support_schema.sql").read_text(encoding="utf-8"))


def config():
    return {
        "bot_token": os.getenv("SUPPORT_TELEGRAM_BOT_TOKEN", ""),
        "chat_id": os.getenv("SUPPORT_TELEGRAM_CHAT_ID", ""),
        "staff_ids": [part.strip() for part in os.getenv("SUPPORT_TELEGRAM_STAFF_IDS", "").split(",") if part.strip()],
        "webhook_secret": os.getenv("SUPPORT_TELEGRAM_WEBHOOK_SECRET", ""),
        "site_url": os.getenv("SUPPORT_SITE_URL", "https://nikoosalamat.ir"),
    }


def ready(cfg):
    return bool(re.fullmatch(r"\d+:[A-Za-z0-9_-]+", cfg["bot_token"])
                and re.fullmatch(r"-?\d+", cfg["chat_id"])
                and any(re.fullmatch(r"\d+", str(value)) for value in cfg["staff_ids"])
                and re.fullmatch(r"[A-Za-z0-9_-]{32,256}", cfg["webhook_secret"]))


def fail(message, code=400):
    raise HTTPException(code, message)


def state(db, cfg, admin=False):
    result = {"enabled": bool(db.execute("SELECT enabled FROM support_settings WHERE id=1").fetchone()[0])}
    if admin:
        result.update(telegram_configured=ready(cfg), pending=db.execute(
            "SELECT COUNT(*) FROM support_messages WHERE role='visitor' AND telegram_id IS NULL").fetchone()[0])
    return result


def limit(db, bucket, maximum, window):
    now = int(time.time())
    key = hashlib.sha256(bucket.encode()).hexdigest() + ":" + str(now // window)
    db.execute("INSERT INTO support_limits VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=hits+1", (key, now + window))
    db.commit()  # Denied attempts must still count.
    if db.execute("SELECT hits FROM support_limits WHERE bucket=?", (key,)).fetchone()[0] > maximum:
        fail("تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید", 429)


def conversation(db, conversation_id, token, admin):
    row = db.execute("SELECT * FROM support_conversations WHERE id=? AND expires_at>?", (conversation_id, int(time.time()))).fetchone()
    if not row or (not admin and not hmac.compare_digest(row["token_hash"], hashlib.sha256(token.encode()).hexdigest())):
        fail("گفت‌وگو در دسترس نیست؛ گفت‌وگوی تازه‌ای شروع کنید", 404)
    return dict(row)


def save_message(db, conv, data, role):
    text = data.get("text", "")
    client_id = data.get("client_id", "")
    if not isinstance(text, str) or not 1 <= len(text.strip()) <= 2000 or not isinstance(client_id, str) or not re.fullmatch(r"[a-f0-9]{32}", client_id):
        fail("متن پیام باید بین ۱ تا ۲۰۰۰ نویسه باشد", 422)
    text = text.strip()
    query = "SELECT id,role,text,created_at FROM support_messages WHERE conversation_id=? AND client_id=?"
    params = (conv["id"], client_id)
    existing = db.execute(query, params).fetchone()
    if existing:
        if existing["role"] != role or existing["text"] != text:
            fail("شناسه پیام تکراری است", 409)
        return dict(existing)
    if conv["closed"]:
        fail("این گفت‌وگو بسته شده؛ گفت‌وگوی تازه‌ای شروع کنید", 409)
    limit(db, "message:" + conv["id"], 12, 60)
    now = int(time.time())
    with db:
        db.execute("INSERT INTO support_messages(conversation_id,role,text,created_at,client_id) VALUES (?,?,?,?,?) ON CONFLICT(conversation_id,client_id) DO NOTHING", (conv["id"], role, text, now, client_id))
        db.execute("UPDATE support_conversations SET updated_at=? WHERE id=?", (now, conv["id"]))
    return dict(db.execute(query, params).fetchone())


def telegram(cfg, method, payload):
    req = UrlRequest(f"https://api.telegram.org/bot{cfg['bot_token']}/{method}",
                     data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=6) as response:
            return json.loads(response.read(262144))
    except HTTPError as error:
        try:
            return json.loads(error.read(262144))
        except (ValueError, OSError):
            return {"ok": False}
    except (URLError, OSError, ValueError):
        return {"ok": False}  # Never log a URL containing the bot token.


def drain(db, cfg, maximum=3):
    if not ready(cfg):
        return 0
    sent = 0
    for index in range(maximum):
        now = int(time.time())
        db.execute("BEGIN IMMEDIATE")
        row = db.execute("SELECT m.* FROM support_messages m JOIN support_conversations c ON c.id=m.conversation_id WHERE m.role='visitor' AND m.telegram_id IS NULL AND m.next_attempt<=? AND m.lease_until<=? AND c.expires_at>? ORDER BY m.id LIMIT 1", (now, now, now)).fetchone()
        if not row:
            db.commit()
            break
        db.execute("UPDATE support_messages SET lease_until=?,attempts=attempts+1 WHERE id=?", (now + 60, row["id"]))
        db.commit()
        result = telegram(cfg, "sendMessage", {"chat_id": cfg["chat_id"], "text": "پیام سایت · " + row["conversation_id"][:8] + "\nبرای پاسخ، روی همین پیام Reply بزنید.\n\n" + row["text"], "link_preview_options": {"is_disabled": True}})
        if result.get("ok") and result.get("result", {}).get("message_id"):
            db.execute("UPDATE support_messages SET telegram_chat=?,telegram_id=?,lease_until=0 WHERE id=?", (str(cfg["chat_id"]), result["result"]["message_id"], row["id"]))
            sent += 1
        else:
            delay = max(60, min(3600, 30 * 2 ** min(7, row["attempts"])), int(result.get("parameters", {}).get("retry_after", 0)))
            db.execute("UPDATE support_messages SET next_attempt=?,lease_until=0 WHERE id=?", (int(time.time()) + delay, row["id"]))
            db.commit()
            break
        db.commit()
        if index + 1 < maximum:
            time.sleep(3)
    return sent


def webhook(db, cfg, data):
    message = data.get("message") or {}
    if (str(message.get("chat", {}).get("id", "")) != str(cfg["chat_id"])
            or str(message.get("from", {}).get("id", "")) not in list(map(str, cfg["staff_ids"]))
            or message.get("from", {}).get("is_bot") or type(data.get("update_id")) is not int):
        return
    original = db.execute("SELECT c.* FROM support_messages m JOIN support_conversations c ON c.id=m.conversation_id WHERE m.telegram_chat=? AND m.telegram_id=? AND c.expires_at>?", (str(cfg["chat_id"]), message.get("reply_to_message", {}).get("message_id", 0), int(time.time()))).fetchone()
    text = message.get("text", "")
    if not original or original["closed"] or not isinstance(text, str) or not 1 <= len(text.strip()) <= 2000:
        return
    now = int(time.time())
    with db:
        inserted = db.execute("INSERT OR IGNORE INTO support_updates VALUES (?,?)", (data["update_id"], now))
        if inserted.rowcount:
            db.execute("INSERT INTO support_messages(conversation_id,role,text,created_at,client_id) VALUES (?,'staff',?,?,?)", (original["id"], text.strip(), now, "telegram_" + str(data["update_id"])))
            db.execute("UPDATE support_conversations SET updated_at=? WHERE id=?", (now, original["id"]))


def install(app, require_admin):
    # Register before the SPA catch-all; use a sync worker for SQLite/network I/O.
    @app.api_route("/api/support/{route:path}", methods=["GET", "POST", "PUT"])
    @app.api_route("/api/admin/support/{route:path}", methods=["GET", "POST", "PUT"])
    async def support_route(request: Request, route: str):
        from starlette.concurrency import run_in_threadpool
        raw = bytearray()
        async for chunk in request.stream():
            raw.extend(chunk)
            if len(raw) > 65536:
                fail("درخواست بیش از حد بزرگ است", 413)
        try:
            data = json.loads(raw or b"{}")
        except (ValueError, UnicodeDecodeError):
            fail("درخواست معتبر نیست", 422)
        if not isinstance(data, dict):
            fail("درخواست معتبر نیست", 422)
        from fastapi.responses import JSONResponse
        result = await run_in_threadpool(handle, request, route, data, require_admin)
        response = result if isinstance(result, JSONResponse) else JSONResponse(result)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response


def handle(request, route, data, require_admin):
    admin = request.url.path.startswith("/api/admin/support/")
    if admin:
        require_admin(request.headers.get("authorization"))
    method, cfg = request.method, config()
    with database.connect() as db:
        init(db)
        if route == "telegram/webhook" and not admin and method == "POST":
            if not ready(cfg) or not hmac.compare_digest(cfg["webhook_secret"], request.headers.get("x-telegram-bot-api-secret-token", "")):
                fail("دسترسی مجاز نیست", 403)
            webhook(db, cfg, data)
            return {"ok": True}
        if route == "status":
            if admin and method == "PUT":
                if type(data.get("enabled")) is not bool:
                    fail("وضعیت معتبر نیست", 422)
                db.execute("UPDATE support_settings SET enabled=? WHERE id=1", (int(data["enabled"]),))
                db.commit()
            elif method != "GET":
                fail("روش مجاز نیست", 405)
            return state(db, cfg, admin)
        if admin and route == "telegram/connect" and method == "POST":
            if not ready(cfg):
                fail("ابتدا تنظیمات خصوصی ربات را روی هاست تکمیل کنید", 409)
            site = cfg["site_url"].rstrip("/")
            if not re.fullmatch(r"https://[^/?#]+", site):
                fail("نشانی HTTPS سایت معتبر نیست", 422)
            url = site + "/api/support/telegram/webhook"
            current = telegram(cfg, "getWebhookInfo", {})
            if not current.get("ok"):
                fail("ارتباط با تلگرام برقرار نشد؛ تنظیمات و اتصال هاست را بررسی کنید", 502)
            previous = current.get("result", {}).get("url", "")
            if previous and previous != url and data.get("replace_existing") is not True:
                fail("این ربات به جای دیگری متصل است؛ از ربات اختصاصی پشتیبانی استفاده کنید", 409)
            result = telegram(cfg, "setWebhook", {"url": url, "secret_token": cfg["webhook_secret"], "allowed_updates": ["message"], "drop_pending_updates": False})
            if not result.get("ok"):
                fail("ثبت اتصال تلگرام موفق نبود", 502)
            return {"ok": True}
        if admin and route == "retry" and method == "POST":
            limit(db, "drain", 1, 15)
            return {"sent": drain(db, cfg, 1)}
        if route == "conversations":
            if admin and method == "GET":
                return [dict(row) for row in db.execute("SELECT c.id,c.created_at,c.updated_at,c.closed,(SELECT text FROM support_messages WHERE conversation_id=c.id ORDER BY id DESC LIMIT 1) AS preview,(SELECT role FROM support_messages WHERE conversation_id=c.id ORDER BY id DESC LIMIT 1) AS last_role FROM support_conversations c WHERE c.expires_at>? ORDER BY c.updated_at DESC LIMIT 100", (int(time.time()),))]
            if not admin and method == "POST":
                if not state(db, cfg)["enabled"]:
                    fail("دریافت پیام تازه موقتاً غیرفعال است", 503)
                limit(db, "create:" + (request.client.host if request.client else "unknown"), 4, 600)
                conversation_id, token, now = secrets.token_hex(16), secrets.token_hex(32), int(time.time())
                db.execute("INSERT INTO support_conversations(id,token_hash,created_at,updated_at,expires_at) VALUES (?,?,?,?,?)", (conversation_id, hashlib.sha256(token.encode()).hexdigest(), now, now, now + 30 * 86400))
                db.commit()
                from fastapi.responses import JSONResponse
                return JSONResponse({"id": conversation_id, "token": token}, status_code=201)
        match = re.fullmatch(r"conversations/([a-f0-9]{32})/(messages|close)", route)
        if match:
            conv = conversation(db, match[1], request.headers.get("x-support-token", ""), admin)
            if match[2] == "messages" and method == "GET":
                try:
                    after = max(0, int(request.query_params.get("after", "0")))
                except ValueError:
                    after = 0
                rows = [dict(row) for row in db.execute("SELECT id,role,text,created_at FROM support_messages WHERE conversation_id=? AND id>? ORDER BY id LIMIT 100", (conv["id"], after))]
                return {"messages": rows, "closed": bool(conv["closed"]), "has_more": len(rows) == 100}
            if match[2] == "messages" and method == "POST":
                if not admin and not state(db, cfg)["enabled"]:
                    fail("دریافت پیام تازه موقتاً غیرفعال است", 503)
                from fastapi.responses import JSONResponse
                return JSONResponse(save_message(db, conv, data, "staff" if admin else "visitor"), status_code=201)
            if match[2] == "close" and admin and method == "POST":
                db.execute("UPDATE support_conversations SET closed=1 WHERE id=?", (conv["id"],))
                db.commit()
                return {"ok": True}
        fail("مسیر پیدا نشد", 404)


if __name__ == "__main__":
    with database.connect() as connection:
        init(connection)
        now = int(time.time())
        connection.execute("DELETE FROM support_conversations WHERE expires_at<=?", (now,))
        connection.execute("DELETE FROM support_limits WHERE expires_at<?", (now,))
        connection.execute("DELETE FROM support_updates WHERE created_at<?", (now - 30 * 86400,))
        connection.commit()
        print("Delivered:", drain(connection, config(), 10))
