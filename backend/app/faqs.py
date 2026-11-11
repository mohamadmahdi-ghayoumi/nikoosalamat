"""Editable contact FAQs. Seed existing copy once, never restore deleted entries."""
from contextlib import contextmanager
import json
from pathlib import Path

from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from . import database


class FaqWrite(BaseModel):
    question: str = Field(min_length=2, max_length=300)
    answer: str = Field(min_length=2, max_length=6000)
    sort_order: int = Field(default=0, ge=0, le=10000, strict=True)
    published: bool = Field(default=True, strict=True)

    @field_validator('question', 'answer')
    @classmethod
    def trim_text(cls, value):
        value = value.strip()
        if len(value) < 2:
            raise ValueError('متن سؤال و پاسخ را وارد کنید')
        return value


def init_faqs(db):
    db.executescript(Path(__file__).with_name('faq_schema.sql').read_text(encoding='utf-8'))
    db.execute('BEGIN IMMEDIATE')
    try:
        if not db.execute('SELECT seeded FROM faq_state WHERE id=1').fetchone()[0]:
            seed = json.loads(Path(__file__).with_name('faq_seed.json').read_text(encoding='utf-8'))
            db.executemany('INSERT INTO faqs(question,answer,sort_order) VALUES (?,?,?)',
                           [(question, answer, index) for index, (question, answer) in enumerate(seed)])
            db.execute('UPDATE faq_state SET seeded=1 WHERE id=1')
        db.commit()
    except Exception:
        db.rollback()
        raise


@contextmanager
def faq_db():
    db = database.connect()
    try:
        init_faqs(db)
        with db:
            yield db
    finally:
        db.close()


def result(payload, status=200):
    return JSONResponse(payload, status_code=status, headers={'Cache-Control': 'no-store'})


def as_faq(row):
    data = dict(row)
    data['published'] = bool(data['published'])
    return data


def install(app, require_admin):
    @app.get('/api/faqs')
    def public_faqs():
        with faq_db() as db:
            return result([as_faq(row) for row in db.execute('SELECT * FROM faqs WHERE published=1 ORDER BY sort_order,id')])

    @app.get('/api/admin/faqs')
    def admin_faqs(_=Depends(require_admin)):
        with faq_db() as db:
            return result([as_faq(row) for row in db.execute('SELECT * FROM faqs ORDER BY sort_order,id')])

    @app.post('/api/admin/faqs')
    def create_faq(payload: FaqWrite, _=Depends(require_admin)):
        with faq_db() as db:
            cursor = db.execute('INSERT INTO faqs(question,answer,sort_order,published) VALUES (?,?,?,?)',
                                (payload.question, payload.answer, payload.sort_order, int(payload.published)))
            return result(as_faq(db.execute('SELECT * FROM faqs WHERE id=?', (cursor.lastrowid,)).fetchone()), 201)

    @app.put('/api/admin/faqs/{faq_id}')
    def update_faq(faq_id: int, payload: FaqWrite, _=Depends(require_admin)):
        with faq_db() as db:
            if not db.execute('SELECT id FROM faqs WHERE id=?', (faq_id,)).fetchone():
                raise HTTPException(404, 'سؤال پیدا نشد')
            db.execute('UPDATE faqs SET question=?,answer=?,sort_order=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',
                       (payload.question, payload.answer, payload.sort_order, int(payload.published), faq_id))
            return result(as_faq(db.execute('SELECT * FROM faqs WHERE id=?', (faq_id,)).fetchone()))

    @app.delete('/api/admin/faqs/{faq_id}')
    def delete_faq(faq_id: int, _=Depends(require_admin)):
        with faq_db() as db:
            if not db.execute('DELETE FROM faqs WHERE id=?', (faq_id,)).rowcount:
                raise HTTPException(404, 'سؤال پیدا نشد')
            return result({'ok': True})
