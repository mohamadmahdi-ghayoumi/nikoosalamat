from contextlib import asynccontextmanager
import base64
from datetime import datetime, timedelta, timezone
import hashlib
from pathlib import Path
import re
import secrets
import sqlite3

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .content import BENEFITS, HERO, STORY
from .database import execute, fetch_all, fetch_one, init_database, verify_password
from .schemas import (
    CartLine,
    CartQuoteIn,
    CartQuoteOut,
    Category,
    ContactIn,
    HomeResponse,
    NewsletterIn,
    NewsletterOut,
    Product,
    ProductCreateIn,
    AdminLoginIn,
    AdminMeOut,
    AdminSessionOut,
)


UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
SESSION_HOURS = 8


@asynccontextmanager
async def lifespan(_: FastAPI):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    init_database()
    yield


app = FastAPI(
    title="Sovara API",
    version="0.1.0",
    description="API فروشگاه ایرانی محصولات مراقبت از اسب",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR, check_dir=False), name="uploads")


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def require_admin(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ابتدا وارد حساب ادمین شوید")
    token = authorization.removeprefix("Bearer ").strip()
    session = fetch_one(
        """
        SELECT admins.id, admins.email, admin_sessions.expires_at
        FROM admin_sessions JOIN admins ON admins.id = admin_sessions.admin_id
        WHERE admin_sessions.token_hash = ?
        """,
        (_token_hash(token),),
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="نشست شما معتبر نیست")
    if datetime.fromisoformat(session["expires_at"]) <= datetime.now(timezone.utc):
        execute("DELETE FROM admin_sessions WHERE token_hash = ?", (_token_hash(token),))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="نشست شما منقضی شده است")
    return session


def save_product_image(image_data: str | None) -> str | None:
    if not image_data:
        return None
    match = re.fullmatch(r"data:image/(jpeg|png|webp);base64,(.+)", image_data, flags=re.DOTALL)
    if not match:
        raise HTTPException(status_code=422, detail="فرمت تصویر باید JPG، PNG یا WebP باشد")
    try:
        content = base64.b64decode(match.group(2), validate=True)
    except (ValueError, base64.binascii.Error):
        raise HTTPException(status_code=422, detail="فایل تصویر معتبر نیست") from None
    if len(content) > 3 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="حجم تصویر نباید بیشتر از ۳ مگابایت باشد")
    extension = {"jpeg": "jpg", "png": "png", "webp": "webp"}[match.group(1)]
    filename = f"{secrets.token_hex(16)}.{extension}"
    (UPLOAD_DIR / filename).write_bytes(content)
    return f"/uploads/{filename}"


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/home", response_model=HomeResponse)
def home() -> HomeResponse:
    categories = fetch_all("SELECT * FROM categories ORDER BY sort_order, id")
    products = fetch_all("SELECT * FROM products WHERE featured = 1 ORDER BY id LIMIT 4")
    return HomeResponse(
        hero=HERO,
        benefits=BENEFITS,
        categories=[Category(**row) for row in categories],
        featured_products=[Product(**row) for row in products],
        story=STORY,
    )


@app.get("/api/categories", response_model=list[Category])
def categories() -> list[Category]:
    return [Category(**row) for row in fetch_all("SELECT * FROM categories ORDER BY sort_order, id")]


@app.get("/api/products", response_model=list[Product])
def products(featured: bool | None = None) -> list[Product]:
    if featured is None:
        rows = fetch_all("SELECT * FROM products ORDER BY id")
    else:
        rows = fetch_all("SELECT * FROM products WHERE featured = ? ORDER BY id", (int(featured),))
    return [Product(**row) for row in rows]


@app.get("/api/products/{product_id}", response_model=Product)
def product_detail(product_id: int) -> Product:
    row = fetch_one("SELECT * FROM products WHERE id = ?", (product_id,))
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="محصول پیدا نشد")
    return Product(**row)


@app.post("/api/admin/login", response_model=AdminSessionOut)
def admin_login(payload: AdminLoginIn) -> AdminSessionOut:
    admin = fetch_one("SELECT * FROM admins WHERE email = ?", (payload.username.strip().lower(),))
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ایمیل یا رمز عبور نادرست است")

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS)
    execute("DELETE FROM admin_sessions WHERE expires_at <= ?", (datetime.now(timezone.utc).isoformat(),))
    execute(
        "INSERT INTO admin_sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)",
        (_token_hash(token), admin["id"], expires_at.isoformat()),
    )
    return AdminSessionOut(token=token, username=admin["email"], expires_at=expires_at.isoformat())


@app.get("/api/admin/me", response_model=AdminMeOut)
def admin_me(admin: dict = Depends(require_admin)) -> AdminMeOut:
    return AdminMeOut(username=admin["email"])


@app.post("/api/admin/logout", status_code=status.HTTP_204_NO_CONTENT)
def admin_logout(authorization: str | None = Header(default=None)) -> None:
    if authorization and authorization.startswith("Bearer "):
        execute("DELETE FROM admin_sessions WHERE token_hash = ?", (_token_hash(authorization[7:].strip()),))


@app.post("/api/admin/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreateIn, _: dict = Depends(require_admin)) -> Product:
    image_url = save_product_image(payload.image_data)
    try:
        product_id = execute(
            """
            INSERT INTO products (slug, name, category, price, tone, shape, badge, featured, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.slug,
                payload.name.strip(),
                payload.category.strip(),
                payload.price,
                payload.tone,
                payload.shape,
                payload.badge.strip() if payload.badge else None,
                int(payload.featured),
                image_url,
            ),
        )
    except sqlite3.IntegrityError:
        if image_url:
            (UPLOAD_DIR / Path(image_url).name).unlink(missing_ok=True)
        raise HTTPException(status_code=409, detail="این شناسه محصول قبلاً استفاده شده است") from None
    return Product(**fetch_one("SELECT * FROM products WHERE id = ?", (product_id,)))


@app.delete("/api/admin/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, _: dict = Depends(require_admin)) -> None:
    product = fetch_one("SELECT image_url FROM products WHERE id = ?", (product_id,))
    if not product:
        raise HTTPException(status_code=404, detail="محصول پیدا نشد")
    execute("DELETE FROM products WHERE id = ?", (product_id,))
    if product["image_url"]:
        (UPLOAD_DIR / Path(product["image_url"]).name).unlink(missing_ok=True)


@app.post("/api/newsletter", response_model=NewsletterOut, status_code=status.HTTP_201_CREATED)
def subscribe(payload: NewsletterIn) -> NewsletterOut:
    normalized = payload.mobile.replace("+98", "0").replace("0098", "0")
    if normalized.startswith("98"):
        normalized = "0" + normalized[2:]

    existing = fetch_one("SELECT id FROM newsletter_members WHERE mobile = ?", (normalized,))
    if existing:
        return NewsletterOut(message="این شماره قبلاً عضو باشگاه شده است", created=False)

    execute("INSERT INTO newsletter_members (mobile) VALUES (?)", (normalized,))
    return NewsletterOut(message="عضویت شما با موفقیت ثبت شد", created=True)


@app.post("/api/cart/quote", response_model=CartQuoteOut)
def quote_cart(payload: CartQuoteIn) -> CartQuoteOut:
    lines: list[CartLine] = []
    for item in payload.items:
        row = fetch_one("SELECT id, name, price FROM products WHERE id = ?", (item.product_id,))
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"محصول {item.product_id} پیدا نشد",
            )
        lines.append(
            CartLine(
                product_id=row["id"],
                name=row["name"],
                quantity=item.quantity,
                unit_price=row["price"],
                line_total=row["price"] * item.quantity,
            )
        )

    subtotal = sum(line.line_total for line in lines)
    shipping = 0 if subtotal >= 1_500_000 or subtotal == 0 else 85_000
    return CartQuoteOut(lines=lines, subtotal=subtotal, shipping=shipping, total=subtotal + shipping)


@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def create_contact_message(payload: ContactIn) -> dict[str, str]:
    execute(
        "INSERT INTO contact_messages (name, mobile, email, message) VALUES (?, ?, ?, ?)",
        (payload.name, payload.mobile, str(payload.email) if payload.email else None, payload.message),
    )
    return {"message": "پیام شما ثبت شد؛ به‌زودی با شما تماس می‌گیریم"}


if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="frontend-assets")
if (FRONTEND_DIST / "images").exists():
    app.mount("/images", StaticFiles(directory=FRONTEND_DIST / "images"), name="frontend-images")


@app.get("/{frontend_path:path}", include_in_schema=False)
def frontend_app(frontend_path: str) -> FileResponse:
    index = FRONTEND_DIST / "index.html"
    if not index.exists():
        raise HTTPException(status_code=404, detail="ابتدا فرانت‌اند را build کنید")
    return FileResponse(index)
