import React, { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { articleHTML } from '../../utils/articleContent.js'
import { articleFonts, articleFontSizes } from '../../utils/articleFormatting.js'
import { ArticleImage } from './ArticleImage.js'
import ArticleMediaTools from './ArticleMediaTools.jsx'

export default function RichArticleEditor({ initialValue = '', disabled = false, token, onPending = () => {} }) {
  const fieldRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [value, setValue] = useState(() => articleHTML(initialValue))
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4, 5, 6] }, link: { openOnClick: false } }),
      TextStyle, FontFamily, FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }), ArticleImage,
    ],
    content: value,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { role: 'textbox', 'aria-label': 'متن کامل مقاله', 'aria-multiline': 'true', dir: 'rtl', class: 'article-rich-text' },
      transformPastedHTML: (html) => articleHTML(html),
      handlePaste: (_view, event) => {
        const clipboard = event.clipboardData
        if (clipboard?.getData('text/html')) return false
        const text = clipboard?.getData('text/plain')
        if (!text) return false
        event.preventDefault()
        editor?.commands.insertContent(articleHTML(text))
        return true
      },
    },
    onUpdate: ({ editor: instance }) => setValue(instance.getHTML()),
  })
  useEffect(() => { editor?.setEditable(!disabled && !uploading) }, [editor, disabled, uploading])
  useEffect(() => {
    if (!editor) return
    const form = fieldRef.current?.closest('form')
    const reset = () => { editor.commands.clearContent(); setValue('') }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [editor])
  const buttons = [
    ['بولد', 'B', () => editor.chain().focus().toggleBold().run(), 'bold'],
    ['کج', 'I', () => editor.chain().focus().toggleItalic().run(), 'italic'],
    ['زیرخط', 'U', () => editor.chain().focus().toggleUnderline().run(), 'underline'],
    ['پاراگراف', 'متن', () => editor.chain().focus().setParagraph().run(), 'paragraph'],
    ['تیتر اصلی', 'H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'heading', { level: 2 }],
    ['زیرتیتر', 'H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'heading', { level: 3 }],
    ['فهرست بولت‌دار', '• فهرست', () => editor.chain().focus().toggleBulletList().run(), 'bulletList'],
    ['فهرست شماره‌دار', '۱. فهرست', () => editor.chain().focus().toggleOrderedList().run(), 'orderedList'],
    ['نقل‌قول', 'نقل‌قول', () => editor.chain().focus().toggleBlockquote().run(), 'blockquote'],
    ['بازگردانی', '↶', () => editor.chain().focus().undo().run()],
    ['انجام دوباره', '↷', () => editor.chain().focus().redo().run()],
    ['حذف قالب‌بندی', 'پاک‌کردن قالب', () => editor.chain().focus().unsetAllMarks().clearNodes().run()],
  ]
  return (
    <div className="rich-article-field" ref={fieldRef}>
      <span id="article-body-label">متن کامل مقاله</span>
      <p className="rich-editor-help">متن را مستقیم از Word کپی کنید؛ بولد، تیتر و فهرست‌ها حفظ می‌شوند. عنوان مقاله در بالای فرم، H1 صفحه است؛ برای بخش‌های متن H2 تا H6 انتخاب کنید. برای عکس، نشانگر را در محل دلخواه متن قرار دهید یا روی عکس موجود کلیک کنید.</p>
      <div className={`rich-article-editor ${disabled ? 'is-disabled' : ''}`}>
        <div className="rich-editor-toolbar" role="toolbar" aria-label="قالب‌بندی متن مقاله">
          <label>نوع متن<select aria-label="نوع تیتر" disabled={!editor || disabled || uploading} value={editor?.isActive('heading') ? String(editor.getAttributes('heading').level) : 'p'} onChange={(event) => {
            if (event.target.value === 'p') editor.chain().focus().setParagraph().run()
            else editor.chain().focus().setHeading({ level: Number(event.target.value) }).run()
          }}><option value="p">پاراگراف</option><option disabled value="1">H1 — عنوان مقاله</option>{[2, 3, 4, 5, 6].map((level) => <option key={level} value={level}>{`H${level}`}</option>)}</select></label>
          <label>فونت<select aria-label="فونت متن" disabled={!editor || disabled || uploading} value={editor?.getAttributes('textStyle').fontFamily || ''} onChange={(event) => event.target.value ? editor.chain().focus().setFontFamily(event.target.value).run() : editor.chain().focus().unsetFontFamily().run()}><option value="">پیش‌فرض</option>{articleFonts.map(([font, label]) => <option key={font} value={font}>{label}</option>)}</select></label>
          <label>اندازه<select aria-label="اندازه متن" disabled={!editor || disabled || uploading} value={editor?.getAttributes('textStyle').fontSize || ''} onChange={(event) => event.target.value ? editor.chain().focus().setFontSize(event.target.value).run() : editor.chain().focus().unsetFontSize().run()}><option value="">پیش‌فرض</option>{articleFontSizes.map((size) => <option key={size} value={`${size}px`}>{size}px</option>)}</select></label>
          {buttons.map(([label, text, command, active, attrs]) => (
            <button type="button" key={label} aria-label={label} title={label} disabled={!editor || disabled || uploading}
              aria-pressed={active ? editor?.isActive(active, attrs) || false : undefined}
              onMouseDown={(event) => event.preventDefault()} onClick={command}>{text}</button>
          ))}
          {[[ 'right', 'راست‌چین' ], [ 'center', 'وسط‌چین' ], [ 'left', 'چپ‌چین' ], [ 'justify', 'تراز دوطرفه' ]].map(([align, label]) => <button key={align} type="button" disabled={!editor || disabled || uploading} aria-pressed={editor?.isActive({ textAlign: align }) || false} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().setTextAlign(align).run()}>{label}</button>)}
        </div>
        <ArticleMediaTools editor={editor} token={token} disabled={disabled} onPending={(pending) => { setUploading(pending); onPending(pending) }} />
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name="body" value={value} />
      <small className={value.length > 30000 ? 'rich-editor-limit' : ''}>{new Intl.NumberFormat('fa-IR').format(value.length)} از ۳۰٬۰۰۰ کاراکتر (با قالب‌بندی)</small>
      <p className="rich-editor-help">برای تیترها از ترتیب H2، سپس H3 استفاده کنید؛ برای ظاهر درشت فقط اندازهٔ متن را تغییر ندهید. متن لینک و Alt را توصیفی بنویسید. این ابزارها ساختار محتوا را بهتر می‌کنند و تضمین رتبهٔ جست‌وجو نیستند.</p>
    </div>
  )
}
