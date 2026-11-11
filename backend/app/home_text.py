"""Plain-text homepage overrides; per-field optimistic locking prevents lost edits."""
from contextlib import contextmanager
import json
from pathlib import Path

from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict

from . import database

FIELDS = json.loads(Path(__file__).with_name('home_text_fields.json').read_text(encoding='utf-8'))


class HomeTextWrite(BaseModel):
    model_config = ConfigDict(extra='forbid')
    text: str = Field(strict=True, min_length=1, max_length=6000)
    revision: int = Field(strict=True, ge=0)


@contextmanager
def home_db():
    db = database.connect()
    try:
        db.executescript(Path(__file__).with_name('home_text_schema.sql').read_text(encoding='utf-8'))
        db.execute('BEGIN IMMEDIATE')
        with db:
            yield db
    finally:
        db.close()


def result(payload):
    return JSONResponse(payload, headers={'Cache-Control': 'no-store'})


def install(app, require_admin):
    @app.get('/api/home-text')
    def home_text():
        with home_db() as db:
            return result({row['field']: {'text': row['text'], 'revision': row['revision']}
                           for row in db.execute('SELECT * FROM home_text') if row['field'] in FIELDS})

    @app.put('/api/admin/home-text/{field}')
    def save_text(field: str, payload: HomeTextWrite, _=Depends(require_admin)):
        if field not in FIELDS:
            raise HTTPException(404, 'این متن قابل ویرایش نیست')
        text = payload.text.strip()
        if not text or len(text) > FIELDS[field]:
            raise HTTPException(422, 'متن خالی یا بیش از اندازه طولانی است')
        with home_db() as db:
            row = db.execute('SELECT revision FROM home_text WHERE field=?', (field,)).fetchone()
            revision = row['revision'] if row else 0
            if payload.revision != revision:
                raise HTTPException(409, 'این متن در جای دیگری تغییر کرده؛ نسخه تازه را دریافت کنید')
            revision += 1
            db.execute('INSERT INTO home_text(field,text,revision) VALUES(?,?,?) '
                       'ON CONFLICT(field) DO UPDATE SET text=excluded.text,revision=excluded.revision,updated_at=CURRENT_TIMESTAMP',
                       (field, text, revision))
            return result({'text': text, 'revision': revision})
