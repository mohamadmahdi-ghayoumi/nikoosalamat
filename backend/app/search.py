import re

from .database import fetch_all
from .text import normalize_search


def search_public_content(query: str) -> dict:
    normalized = normalize_search(query)
    if not normalized:
        return {"query": query, "total": 0, "results": []}
    candidates = [
        {"kind": "page", "title": "درباره حال نیکو سلامت", "excerpt": "معرفی شرکت، حوزه‌های فعالیت و همکاری با فارمیوکِر", "path": "/about"},
        {"kind": "page", "title": "ارتباط با ما", "excerpt": "تماس با مدیر فروش، آدرس، فرم تماس و سؤالات متداول", "path": "/contact"},
        {"kind": "page", "title": "راهکارهای مراقبت از سلامت دام", "excerpt": "موضوعات مراقبت از سُم، سلامت پستان و بهداشت دام", "path": "/solutions"},
    ]
    for row in fetch_all("SELECT id, name, category FROM products ORDER BY id"):
        candidates.append({"kind": "product", "title": row["name"], "excerpt": row["category"], "path": f"/products/{row['id']}"})
    for kind, table, excerpt in (("article", "articles", "excerpt"), ("page", "content_pages", "summary")):
        for row in fetch_all(f"SELECT slug, title, {excerpt}, body FROM {table} WHERE published = 1 ORDER BY id"):
            candidates.append({"kind": kind, "title": row["title"], "excerpt": row[excerpt], "path": f"/{'articles' if kind == 'article' else 'pages'}/{row['slug']}", "body": row["body"]})
    matches = []
    for item in candidates:
        haystack = normalize_search(" ".join((item["title"], item["excerpt"], item.get("body", ""))))
        if all(term in haystack for term in normalized.split()):
            result = {key: item[key] for key in ("kind", "title", "excerpt", "path")}
            result["excerpt"] = re.sub(r"\s+", " ", result["excerpt"]).strip()[:160]
            matches.append((normalized not in normalize_search(item["title"]), result))
    matches.sort(key=lambda item: item[0])
    return {"query": query, "total": len(matches), "results": [item[1] for item in matches[:30]]}
