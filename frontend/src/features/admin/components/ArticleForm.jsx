import React, { lazy, Suspense, useEffect, useState } from 'react'
import ArticleSEOChecklist from '../../../components/ui/ArticleSEOChecklist.jsx'

const RichArticleEditor = lazy(() => import('../../../components/ui/RichArticleEditor.jsx'))

export default function ArticleForm({ busy, editingArticle, setEditingArticle, saveArticle, token }) {
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState(editingArticle?.title || '')
  const [excerpt, setExcerpt] = useState(editingArticle?.excerpt || '')
  const [body, setBody] = useState(editingArticle?.body || '')
  useEffect(() => { setTitle(editingArticle?.title || ''); setExcerpt(editingArticle?.excerpt || ''); setBody(editingArticle?.body || '') }, [editingArticle])
  return (
    <form
      className="admin-product-form admin-editor-form"
      onSubmit={(event) => { if (uploading) event.preventDefault(); else saveArticle(event) }}
      onReset={() => { setTitle(''); setExcerpt(''); setBody('') }}
      key={editingArticle?.id || 'new'}
    >
      <div className="form-heading">
        <span>{editingArticle ? 'ویرایش مقاله' : 'مقاله تازه'}</span>
        <h2>{editingArticle ? editingArticle.title : 'افزودن مقاله'}</h2>
      </div>
      <label>
        عنوان مقاله (عنوان اصلی صفحه / H1)
        <input name="title" defaultValue={editingArticle?.title || ''} onChange={(event) => setTitle(event.target.value)} maxLength={180} required />
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
        خلاصه مقاله (توضیح صفحه برای موتورهای جست‌وجو)
        <textarea name="excerpt" rows="3" defaultValue={editingArticle?.excerpt || ''} onChange={(event) => setExcerpt(event.target.value)} maxLength={500} required />
      </label>
      <Suspense fallback={<p>در حال آماده‌سازی ویرایشگر متن…</p>}>
        <RichArticleEditor key={editingArticle?.id || 'new'} initialValue={editingArticle?.body || ''} disabled={busy} token={token} onPending={setUploading} onContentChange={setBody} />
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
        <button className="button primary" type="submit" disabled={busy || uploading}>
          {editingArticle ? 'ذخیره مقاله' : 'انتشار مقاله'}
        </button>
        {editingArticle && (
          <button className="button outline" type="button" onClick={() => setEditingArticle(null)}>
            انصراف
          </button>
        )}
      </div>
      <ArticleSEOChecklist title={title} excerpt={excerpt} body={body} />
    </form>
  )
}
