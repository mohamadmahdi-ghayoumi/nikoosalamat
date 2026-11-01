from .schemas import Benefit, HeroContent, StoryContent


HERO = HeroContent(
    eyebrow="مراقبت سالم، رفاقت عمیق‌تر",
    title="حال خوب اسب،",
    highlighted_title="قصه‌ی هر روز ماست.",
    description="محصولات تخصصی مراقبت از اسب با ترکیبات گیاهی و فرمولاسیون سازگار؛ طراحی و تولیدشده برای اقلیم ایران.",
    primary_action="مشاهده محصولات",
    secondary_action="بیشتر درباره ما",
)

BENEFITS = [
    Benefit(title="ترکیبات گیاهی", description="ملایم و سازگار با پوست", icon="leaf"),
    Benefit(title="تضمین اصالت", description="تولید با مواد اولیه مرغوب", icon="shield"),
    Benefit(title="ارسال به سراسر ایران", description="تحویل سریع و بسته‌بندی امن", icon="truck"),
    Benefit(title="مشاوره تخصصی", description="همراه شما در انتخاب بهتر", icon="heart"),
]

STORY = StoryContent(
    eyebrow="قصه‌ی سُوارا",
    title="از دل طبیعت ایران، برای سلامت همراه نجیب شما",
    description="ما سُوارا را با یک باور ساده آغاز کردیم: مراقبت خوب باید هم علمی باشد، هم مهربان. فرمول‌های ما با شناخت نیازهای اسب و شرایط آب‌وهوایی ایران توسعه پیدا می‌کنند.",
)
