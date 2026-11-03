import React from 'react'
import { resolveMediaUrl } from '../../../services/api/client.js'

export default function PagesManager({ pages, busy, savePage }) {
  return (
    <section className="admin-content-list">
      <div className="admin-section-intro">
        <span>صفحات چهار دسته اصلی</span>
        <h2>ویرایش متن و تصویر صفحات</h2>
        <p>تغییرات هر صفحه را جداگانه ذخیره کنید.</p>
      </div>
      {pages.map((page) => (
        <form
          className="admin-editor-form"
          onSubmit={(event) => savePage(event, page)}
          key={`${page.id}-${page.updated_at}`}
        >
          <div className="admin-editor-head">
            <div>
              <span dir="ltr">/pages/{page.slug}</span>
              <h3>{page.title}</h3>
            </div>
            {page.image_url && <img src={resolveMediaUrl(page.image_url)} alt="" />}
          </div>
          <div className="form-row">
            <label>
              متن بالای عنوان
              <input name="eyebrow" defaultValue={page.eyebrow} required />
            </label>
            <label>
              عنوان صفحه
              <input name="title" defaultValue={page.title} required />
            </label>
          </div>
          <label>
            خلاصه
            <textarea name="summary" rows="3" defaultValue={page.summary} required />
          </label>
          <label>
            متن کامل صفحه
            <textarea name="body" rows="8" defaultValue={page.body} required />
          </label>
          <label className="admin-file">
            تصویر شاخص <small>JPG، PNG یا WebP تا ۳ مگابایت</small>
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
          </label>
          <div className="admin-options">
            <label className="admin-check">
              <input name="published" type="checkbox" defaultChecked={page.published} /> صفحه منتشر
              باشد
            </label>
            {page.image_url && (
              <label className="admin-check danger">
                <input name="remove_image" type="checkbox" /> حذف تصویر فعلی
              </label>
            )}
          </div>
          <button className="button primary" type="submit" disabled={busy}>
            ذخیره تغییرات
          </button>
        </form>
      ))}
    </section>
  )
}
