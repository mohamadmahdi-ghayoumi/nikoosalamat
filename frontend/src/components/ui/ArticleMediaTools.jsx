import React, { useEffect, useRef, useState } from 'react'
import { uploadArticleImage } from '../../services/api/admin.js'
import { readImageFile } from '../../utils/files.js'
import { imageWidth, safeImageSource } from '../../utils/articleFormatting.js'

export default function ArticleMediaTools({ editor, token, disabled, onPending }) {
  const toolsRef = useRef(null)
  const [panel, setPanel] = useState(null)
  const [selection, setSelection] = useState(null)
  const [image, setImage] = useState({ src: '', alt: '', width: '100%', alignment: 'center' })
  const [file, setFile] = useState(null)
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  useEffect(() => {
    const form = toolsRef.current?.closest('form')
    const reset = () => { setPanel(null); setFile(null); setError(''); setSelection(null) }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [])
  const open = (type) => {
    const { from, to } = editor.state.selection
    setSelection({ from, to, image: editor.isActive('image') })
    setError(''); setFile(null)
    setImage({ src: '', alt: '', width: '100%', alignment: 'center', ...(editor.isActive('image') ? editor.getAttributes('image') : {}) })
    setLink(editor.getAttributes('link').href || '')
    setPanel(type)
  }
  const applyLink = () => {
    const href = link.trim()
    if (href && !/^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(href)) { setError('نشانی معتبر با https:// یا مسیر داخلی سایت وارد کنید'); return }
    const chain = editor.chain().focus().setTextSelection({ from: selection.from, to: selection.to }).extendMarkRange('link')
    if (href) chain.setLink({ href, target: null, rel: 'noopener noreferrer' }).run()
    else chain.unsetLink().run()
    setPanel(null)
  }
  const applyImage = async () => {
    if (!image.alt.trim()) { setError('توضیح کوتاه و دقیق تصویر (متن جایگزین) را وارد کنید'); return }
    if (!file && !safeImageSource(image.src)) { setError('عکس انتخاب کنید یا نشانی HTTPS معتبر وارد کنید'); return }
    setError(''); setUploading(true); onPending(true)
    try {
      let src = safeImageSource(image.src)
      if (file) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('فقط JPG، PNG یا WebP قابل بارگذاری است')
        const result = await uploadArticleImage(token, await readImageFile(file))
        src = safeImageSource(result.url)
        if (!src) throw new Error('نشانی تصویر دریافتی معتبر نیست')
      }
      const attrs = { src, alt: image.alt.trim().slice(0, 300), width: imageWidth(image.width), alignment: image.alignment }
      const chain = editor.chain().focus()
      if (selection.image) chain.setNodeSelection(selection.from).updateAttributes('image', attrs).run()
      else chain.setTextSelection({ from: selection.from, to: selection.to }).setImage(attrs).run()
      setPanel(null)
    } catch (cause) { setError(cause.message || 'بارگذاری تصویر انجام نشد') }
    finally { setUploading(false); onPending(false) }
  }
  return (
    <div className="article-media-tools" ref={toolsRef}>
      <div className="article-media-buttons">
        <button type="button" disabled={!editor || disabled || uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => open('link')}>درج / ویرایش لینک</button>
        <button type="button" disabled={!editor || disabled || uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => open('image')}>درج / تنظیم تصویر</button>
        {editor?.isActive('image') && <button type="button" disabled={disabled || uploading} onClick={() => editor.chain().focus().deleteSelection().run()}>حذف تصویر از متن</button>}
      </div>
      {panel && <fieldset className="article-media-panel" disabled={uploading || disabled} onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); setPanel(null) }
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') { event.preventDefault(); if (panel === 'link') applyLink(); else applyImage() }
      }}>
        <legend>{panel === 'image' ? 'تصویر در محل نشانگر متن' : 'لینک روی متن انتخاب‌شده'}</legend>
        {panel === 'link' ? <label>نشانی لینک (خالی برای حذف لینک)<input aria-label="نشانی لینک" value={link} dir="ltr" onChange={(event) => setLink(event.target.value)} placeholder="https://…" /></label> : <>
          <label>آپلود عکس از دستگاه<input aria-label="عکس داخل مقاله" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} /><small>حداکثر ۳ مگابایت؛ JPG، PNG یا WebP</small></label>
          <details className="article-image-address"><summary>استفاده از نشانی عکس به‌جای آپلود</summary><label>نشانی عکس<input aria-label="نشانی عکس" dir="ltr" value={image.src} onChange={(event) => setImage({ ...image, src: event.target.value })} placeholder="https://…" /></label></details>
          <label>متن جایگزین تصویر (Alt)<input aria-label="متن جایگزین تصویر" maxLength={300} value={image.alt} onChange={(event) => setImage({ ...image, alt: event.target.value })} /></label>
          <div className="article-media-size">
            <label>اندازهٔ عکس<select aria-label="اندازه عکس" value={['35%', '65%', '100%'].includes(image.width) ? image.width : 'custom'} onChange={(event) => {
              if (event.target.value === 'custom') {
                setImage({ ...image, width: '400px' })
                event.target.closest('fieldset').querySelector('.article-image-custom').open = true
              } else setImage({ ...image, width: event.target.value })
            }}><option value="35%">کوچک</option><option value="65%">متوسط</option><option value="100%">تمام عرض متن</option><option value="custom">اندازهٔ دلخواه</option></select></label>
            <label>تراز تصویر<select aria-label="تراز تصویر" value={image.alignment} onChange={(event) => setImage({ ...image, alignment: event.target.value })}><option value="right">راست</option><option value="center">وسط</option><option value="left">چپ</option></select></label>
          </div>
          <details className="article-image-custom"><summary>عرض دقیق تصویر (اختیاری)</summary><label>عرض تصویر<input aria-label="عرض تصویر" dir="ltr" value={image.width} onChange={(event) => setImage({ ...image, width: event.target.value })} placeholder="50% یا 400px" /><small>۲۰ تا ۱۰۰٪ یا ۸۰ تا ۱۲۰۰px؛ ارتفاع متناسب حفظ می‌شود.</small></label></details>
        </>}
        <div className="article-media-buttons">
          <button type="button" onClick={panel === 'link' ? applyLink : applyImage}>اعمال {panel === 'image' ? 'تصویر' : 'لینک'}</button>
          <button type="button" onClick={() => setPanel(null)}>بستن</button>
        </div>
      </fieldset>}
      {uploading && <p role="status">در حال بارگذاری تصویر؛ لطفاً صبر کنید…</p>}
      {error && <p className="rich-editor-error" role="alert">{error}</p>}
    </div>
  )
}
