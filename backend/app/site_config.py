"""Versioned site appearance/content with private drafts and atomic publication."""
from contextlib import contextmanager
import base64
import json
from pathlib import Path
import re

from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from . import database

SCHEMA = json.loads(Path(__file__).with_name('site_config_schema.json').read_text(encoding='utf-8'))


def valid_url(value, image=False):
    if not value or re.search(r'[\s\\\x00-\x1f\x7f]', value):
        return False
    if value.startswith('/') and not value.startswith('//'):
        return True
    if re.match(r'^https?://[^/?#]+(?:[/?#]|$)', value, re.I):
        return True
    return not image and bool(re.match(r'^(?:#[^\s]+|tel:\+?[0-9()-]+|mailto:[^\s@]+@[^\s@]+)$', value))


def validate(value, kind='config', depth=0):
    spec = SCHEMA[kind]
    typ = spec['type']
    ok = depth <= 16
    if typ in ('object', 'map'):
        ok = ok and isinstance(value, dict)
        if ok and typ == 'object':
            ok = not (set(value) - set(spec['fields'])) and all(key in value for key in spec.get('required', []))
            if ok:
                for key, child in value.items():
                    validate(child, spec['fields'][key], depth + 1)
        elif ok:
            ok = len(value) <= spec['max'] and all(re.fullmatch(spec['keyPattern'], key) for key in value)
            if ok:
                for child in value.values():
                    validate(child, spec['item'], depth + 1)
    elif typ == 'array':
        ok = ok and isinstance(value, list) and len(value) <= spec['max']
        if ok:
            for child in value:
                validate(child, spec['item'], depth + 1)
            if kind == 'navigation':
                ok = len({node['label'] for node in value}) == len(value)
            if kind == 'slides':
                ok = len({node['id'] for node in value}) == len(value)
            if kind == 'sections':
                ok = len(set(value)) == len(value)
    elif typ == 'string':
        ok = ok and isinstance(value, str) and spec.get('min', 0) <= len(value) <= spec.get('max', 12000)
        if ok and 'pattern' in spec:
            ok = bool(re.fullmatch(spec['pattern'], value))
        if ok and 'choices' in spec:
            ok = value in spec['choices']
        if ok and 'format' in spec:
            ok = valid_url(value, spec['format'] == 'imageUrl')
    elif typ == 'integer':
        ok = ok and type(value) is int and spec['min'] <= value <= spec['max']
    elif typ == 'boolean':
        ok = ok and type(value) is bool
    if not ok:
        raise HTTPException(422, 'تنظیمات نامعتبر است؛ اندازه‌ها، لینک‌ها یا موارد تکراری را بررسی کنید')
    return value


@contextmanager
def config_db():
    db = database.connect()
    try:
        db.executescript(Path(__file__).with_name('site_config_schema.sql').read_text(encoding='utf-8'))
        db.execute('BEGIN IMMEDIATE')
        with db:
            yield db
    finally:
        db.close()


def result(value, status=200):
    return JSONResponse(value, status_code=status, headers={'Cache-Control': 'no-store'})


def state(db):
    row = dict(db.execute('SELECT * FROM site_config WHERE id=1').fetchone())
    row['draft'] = json.loads(row['draft'])
    row['published'] = json.loads(row['published'])
    row['history'] = [dict(item) for item in db.execute('SELECT id,created_at FROM site_config_history ORDER BY id DESC LIMIT 20')]
    row['media'] = [dict(item) for item in db.execute('SELECT * FROM site_media ORDER BY id DESC LIMIT 100')]
    return row


def check_revision(row, expected, published=False):
    if row['published_revision' if published else 'revision'] != expected:
        raise HTTPException(409, 'نسخه تازه‌تری ذخیره شده است؛ ابتدا نوشته‌های خود را نگه دارید و آخرین نسخه را دریافت کنید')


def publish(db, config):
    encoded = json.dumps(config, ensure_ascii=False)
    db.execute('UPDATE site_config SET published=?,published_revision=published_revision+1 WHERE id=1', (encoded,))
    db.execute('INSERT INTO site_config_history(config) VALUES(?)', (encoded,))
    db.execute('DELETE FROM site_config_history WHERE id NOT IN (SELECT id FROM site_config_history ORDER BY id DESC LIMIT 20)')


class Revision(BaseModel):
    model_config = ConfigDict(extra='forbid')
    revision: int = Field(strict=True, ge=0)


class DraftWrite(Revision):
    config: dict


class TextWrite(Revision):
    text: str = Field(strict=True, max_length=12000)


class RestoreWrite(Revision):
    history_id: int = Field(strict=True, gt=0)


class MediaWrite(BaseModel):
    model_config = ConfigDict(extra='forbid')
    name: str = Field(default='تصویر', max_length=200)
    image_data: str = Field(max_length=4_194_400)


def install(app, require_admin, save_image):
    @app.get('/api/site-config')
    def public_config():
        with config_db() as db:
            row = db.execute('SELECT * FROM site_config WHERE id=1').fetchone()
            return result({'config': json.loads(row['published']), 'revision': row['published_revision']})

    @app.get('/api/admin/site-config')
    def admin_config(_=Depends(require_admin)):
        with config_db() as db:
            return result(state(db))

    @app.put('/api/admin/site-config')
    def save_draft(payload: DraftWrite, _=Depends(require_admin)):
        if len(json.dumps(payload.config, ensure_ascii=False).encode()) > 1_000_000:
            raise HTTPException(422, 'حجم تنظیمات بیش از حد است')
        validate(payload.config)
        with config_db() as db:
            check_revision(state(db), payload.revision)
            db.execute('UPDATE site_config SET draft=?,revision=revision+1 WHERE id=1', (json.dumps(payload.config, ensure_ascii=False),))
            return result(state(db))

    @app.post('/api/admin/site-config/publish')
    def publish_draft(payload: Revision, _=Depends(require_admin)):
        with config_db() as db:
            row = state(db)
            check_revision(row, payload.revision)
            validate(row['draft'])
            publish(db, row['draft'])
            db.execute('UPDATE site_config SET revision=revision+1 WHERE id=1')
            return result(state(db))

    @app.post('/api/admin/site-config/restore')
    def restore(payload: RestoreWrite, _=Depends(require_admin)):
        with config_db() as db:
            check_revision(state(db), payload.revision)
            snapshot = db.execute('SELECT config FROM site_config_history WHERE id=?', (payload.history_id,)).fetchone()
            if not snapshot:
                raise HTTPException(404, 'نسخه پیدا نشد')
            db.execute('UPDATE site_config SET draft=?,revision=revision+1 WHERE id=1', (snapshot['config'],))
            return result(state(db))

    @app.put('/api/admin/site-config/text/{field}')
    def inline_text(field: str, payload: TextWrite, _=Depends(require_admin)):
        validate({field: {'text': payload.text}}, 'texts')
        with config_db() as db:
            row = state(db)
            check_revision(row, payload.revision, published=True)
            config, draft = row['published'], row['draft']
            old_text = config.get('texts', {}).get(field, {}).get('text')
            config.setdefault('texts', {}).setdefault(field, {})['text'] = payload.text
            if draft.get('texts', {}).get(field, {}).get('text') == old_text:
                draft.setdefault('texts', {}).setdefault(field, {})['text'] = payload.text
            publish(db, config)
            db.execute('UPDATE site_config SET draft=?,revision=revision+1 WHERE id=1', (json.dumps(draft, ensure_ascii=False),))
            return result({'config': config, 'revision': row['published_revision'] + 1})

    @app.post('/api/admin/site-config/media', status_code=201)
    def upload(payload: MediaWrite, _=Depends(require_admin)):
        match = re.fullmatch(r'data:image/(png|jpeg|webp);base64,(.+)', payload.image_data, re.S)
        try:
            raw = base64.b64decode(match[2], validate=True) if match else b''
        except ValueError:
            raw = b''
        valid = match and ((match[1] == 'png' and raw.startswith(b'\x89PNG\r\n\x1a\n')) or
                           (match[1] == 'jpeg' and raw.startswith(b'\xff\xd8\xff')) or
                           (match[1] == 'webp' and raw.startswith(b'RIFF') and raw[8:12] == b'WEBP'))
        if not valid:
            raise HTTPException(422, 'فقط فایل واقعی PNG، JPG یا WebP مجاز است')
        url = save_image(payload.image_data)
        with config_db() as db:
            cursor = db.execute('INSERT INTO site_media(url,name) VALUES(?,?)', (url, payload.name))
            return result(dict(db.execute('SELECT * FROM site_media WHERE id=?', (cursor.lastrowid,)).fetchone()), 201)
