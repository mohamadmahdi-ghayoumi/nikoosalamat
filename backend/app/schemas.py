import json
from typing import Literal
from .text import normalize_mobile

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class Category(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str
    icon: str
    color: str
    sort_order: int


class ProductCatalog(BaseModel):
    summary: str = Field(default="", max_length=350)
    description: str = Field(default="", max_length=15000)
    features: list[str] = Field(default_factory=list, max_length=20)
    usage: str = Field(default="", max_length=10000)
    gallery: list[str] = Field(default_factory=list, max_length=5)

    @field_validator("features")
    @classmethod
    def validate_features(cls, value):
        if any(len(feature) > 1000 for feature in value):
            raise ValueError("هر ویژگی حداکثر ۱۰۰۰ حرف باشد")
        return value


class ProductCatalogUpdate(ProductCatalog):
    gallery_data: list[str] = Field(default_factory=list, max_length=5)

    @field_validator("gallery_data")
    @classmethod
    def validate_gallery_size(cls, value):
        if any(not data for data in value):
            raise ValueError("تصویر گالری معتبر نیست")
        if sum(len(data) for data in value) > 7_000_000:
            raise ValueError("حجم مجموع تصاویر جدید بیش از حد مجاز است")
        return value


class Product(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    category: str
    price: int
    tone: str
    shape: str
    badge: str | None = None
    featured: bool
    image_url: str | None = None
    catalog: ProductCatalog = Field(default_factory=ProductCatalog)

    @field_validator("catalog", mode="before")
    @classmethod
    def decode_catalog(cls, value):
        return json.loads(value or "{}") if isinstance(value, str) else value


class AdminLoginIn(BaseModel):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=4, max_length=128)


class AdminSessionOut(BaseModel):
    token: str
    username: str
    expires_at: str


class AdminMeOut(BaseModel):
    username: str


class ProductCreateIn(BaseModel):
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=80)
    price: int = Field(ge=0, le=2_000_000_000)
    tone: str = Field(default="olive", pattern=r"^(amber|wine|olive|cream)$")
    shape: str = Field(default="bottle", pattern=r"^(tin|spray|bottle|jar)$")
    badge: str | None = Field(default=None, max_length=30)
    featured: bool = False
    image_data: str | None = None


class ProductUpdateIn(ProductCreateIn):
    model_config = ConfigDict(str_strip_whitespace=True)
    remove_image: bool = False


class ContentPage(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    eyebrow: str
    title: str
    summary: str
    body: str
    image_url: str | None = None
    published: bool
    updated_at: str


class ContentPageUpdateIn(BaseModel):
    eyebrow: str = Field(min_length=2, max_length=80)
    title: str = Field(min_length=2, max_length=160)
    summary: str = Field(min_length=2, max_length=500)
    body: str = Field(min_length=2, max_length=20_000)
    published: bool = True
    image_data: str | None = None
    remove_image: bool = False


MagazineCategory = Literal['general', 'hoof-trimming', 'diseases', 'scientific', 'sheep-goats', 'agriculture', 'horses', 'human']


class Article(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    excerpt: str
    body: str
    category: MagazineCategory = 'general'
    image_url: str | None = None
    published: bool
    created_at: str
    updated_at: str


class ArticleImageIn(BaseModel):
    image_data: str = Field(min_length=30, max_length=4_194_400)


class ArticleWriteIn(BaseModel):
    slug: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=2, max_length=180)
    excerpt: str = Field(min_length=2, max_length=500)
    body: str = Field(min_length=2, max_length=30_000)
    category: MagazineCategory | None = None
    published: bool = True
    image_data: str | None = None
    remove_image: bool = False


class Benefit(BaseModel):
    title: str
    description: str
    icon: str


class HeroContent(BaseModel):
    eyebrow: str
    title: str
    highlighted_title: str
    description: str
    primary_action: str
    secondary_action: str


class StoryContent(BaseModel):
    eyebrow: str
    title: str
    description: str


class HomeResponse(BaseModel):
    hero: HeroContent
    benefits: list[Benefit]
    categories: list[Category]
    featured_products: list[Product]
    story: StoryContent


class NewsletterIn(BaseModel):
    mobile: str = Field(pattern=r"^(?:\+98|0098|98|0)?9[0-9]{9}$")

    @field_validator("mobile", mode="before")
    @classmethod
    def normalize_mobile_digits(cls, value):
        return normalize_mobile(value)


class NewsletterOut(BaseModel):
    message: str
    created: bool


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=20)


class CartQuoteIn(BaseModel):
    items: list[CartItemIn]


class CartLine(BaseModel):
    product_id: int
    name: str
    quantity: int
    unit_price: int
    line_total: int


class CartQuoteOut(BaseModel):
    lines: list[CartLine]
    subtotal: int
    shipping: int
    total: int


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    mobile: str = Field(pattern=r"^(?:\+98|0098|98|0)?9[0-9]{9}$")
    email: EmailStr | None = None
    message: str = Field(min_length=10, max_length=2000)

    @field_validator("mobile", mode="before")
    @classmethod
    def normalize_mobile_digits(cls, value):
        return normalize_mobile(value)
