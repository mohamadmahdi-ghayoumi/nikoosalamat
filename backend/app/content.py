from .schemas import Benefit, HeroContent, StoryContent


HERO = HeroContent(
    eyebrow="دانش دامپزشکی، مراقبت مطمئن",
    title="سلامت دام،",
    highlighted_title="سرمایه‌ی هر روز شماست.",
    description="نیکو سلامت؛ همراه دامداران، اسب‌داران و فعالان کشاورزی با محصولات تخصصی مراقبت، بهداشت و پیشگیری متناسب با نیازهای دامداری ایران.",
    primary_action="مشاهده محصولات",
    secondary_action="بیشتر درباره ما",
)

BENEFITS = [
    Benefit(title="تنوع محصول، تعهد به کیفیت", description="محصولات تخصصی برای انواع نیازها", icon="badge-check"),
    Benefit(title="از علم تا نوآوری سبز", description="تلفیق دانش، تجربه و شیمی سبز", icon="flask-conical"),
    Benefit(title="مشاوره تخصصی", description="همراه شما برای انتخاب درست", icon="sprout"),
    Benefit(title="ارسال به سراسر ایران", description="تحویل سریع و مطمئن", icon="truck"),
]

STORY = StoryContent(
    eyebrow="درباره نیکو سلامت",
    title="سلامت پایدار دام، از انتخاب درست آغاز می‌شود",
    description="نیکو سلامت با تمرکز بر نیاز واقعی دامداری‌ها و مراکز پرورش اسب، محصولات تخصصی مراقبت از سُم، سلامت پستان، ضدعفونی و بهداشت جایگاه را با رویکردی علمی و مسئولانه عرضه می‌کند.",
)
