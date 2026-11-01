from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Category(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str
    icon: str
    color: str
    sort_order: int


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
    mobile: str = Field(pattern=r"^(?:\+98|0098|98|0)?9\d{9}$")


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
    mobile: str = Field(pattern=r"^(?:\+98|0098|98|0)?9\d{9}$")
    email: EmailStr | None = None
    message: str = Field(min_length=10, max_length=2000)
