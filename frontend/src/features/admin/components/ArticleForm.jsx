import React, { lazy, Suspense } from 'react'

const RichArticleEditor = lazy(() => import('../../../components/ui/RichArticleEditor.jsx'))

export default function ArticleForm({ busy, editingArticle, setEditingArticle, saveArticle }) {
  return (
    <form
      className="admin-product-form admin-editor-form"
      onSubmit={saveArticle}
      key={editingArticle?.id || 'new'}
    >
      <div className="form-heading">
        <span>{editingArticle ? 'ویرایش مقاله' : 'مقاله تازه'}</span>
        <h2>{editingArticle ? editingArticle.title : 'افزودن مقاله'}</h2>
      </div>
      <label>
        عنوان مقاله
        <input name="title" defaultValue={editingArticle?.title || ''} required />
      </label>
      <label>
        شناسه انگلیسی
        <input
          name="slug"
          dir="ltr"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          placeholder="hoof-care-guide"
          defaultValue={editingArticle?.slug || ''}
          required
        />
      </label>
      <label>
        خلاصه مقاله
        <textarea name="excerpt" rows="3" defaultValue={editingArticle?.excerpt || ''} required />
      </label>
      <Suspense fallback={<p>در حال آماده‌سازی ویرایشگر متن…</p>}>
        <RichArticleEditor key={editingArticle?.id || 'new'} initialValue={editingArticle?.body || ''} disabled={busy} />
      </Suspense>
      <label className="admin-file">
        تصویر شاخص <small>JPG، PNG یا WebP تا ۳ مگابایت</small>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
      </label>
      <div className="admin-options">
        <label className="admin-check">
          <input
            name="published"
            type="checkbox"
            defaultChecked={editingArticle ? editingArticle.published : true}
          />{' '}
          نمایش در سایت
        </label>
        {editingArticle?.image_url && (
          <label className="admin-check danger">
            <input name="remove_image" type="checkbox" /> حذف تصویر فعلی
          </label>
        )}
      </div>
      <div className="admin-form-actions">
        <button className="button primary" type="submit" disabled={busy}>
          {editingArticle ? 'ذخیره مقاله' : 'انتشار مقاله'}
        </button>
        {editingArticle && (
          <button className="button outline" type="button" onClick={() => setEditingArticle(null)}>
            انصراف
          </button>
        )}
      </div>
    </form>
  )
}
