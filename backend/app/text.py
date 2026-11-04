import re

DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")


def normalize_mobile(value: str) -> str:
    value = re.sub(r"[\s\-()]", "", str(value).translate(DIGITS))
    if re.fullmatch(r"(?:\+98|0098|98)9[0-9]{9}", value):
        return "0" + value[-10:]
    return "0" + value if re.fullmatch(r"9[0-9]{9}", value) else value


def normalize_search(value: str) -> str:
    value = value.translate(DIGITS).translate(str.maketrans({"ي": "ی", "ى": "ی", "ك": "ک", "أ": "ا", "إ": "ا", "آ": "ا", "\u200c": " ", "ـ": ""}))
    return re.sub(r"\s+", " ", re.sub(r"[\u064b-\u065f\u0670]", "", value)).strip().lower()
