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
    Benefit(title="کیفیت قابل اعتماد", description="انتخاب محصولات تخصصی و کاربردی", icon="leaf"),
    Benefit(title="راهکارهای دامپزشکی", description="برای دام سنگین، اسب و جایگاه", icon="shield"),
    Benefit(title="ارسال به سراسر ایران", description="تحویل سریع و بسته‌بندی امن", icon="truck"),
    Benefit(title="مشاوره تخصصی", description="همراه شما در انتخاب بهتر", icon="heart"),
]

STORY = StoryContent(
    eyebrow="درباره نیکو سلامت",
    title="سلامت پایدار دام، از انتخاب درست آغاز می‌شود",
    description="نیکو سلامت با تمرکز بر نیاز واقعی دامداری‌ها و مراکز پرورش اسب، محصولات تخصصی مراقبت از سُم، سلامت پستان، ضدعفونی و بهداشت جایگاه را با رویکردی علمی و مسئولانه عرضه می‌کند.",
)
