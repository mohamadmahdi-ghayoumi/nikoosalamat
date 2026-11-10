import React, { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { articleHTML } from '../../utils/articleContent.js'
import { articleFonts, articleFontSizes } from '../../utils/articleFormatting.js'
import { ArticleImage } from './ArticleImage.js'
import ArticleMediaTools from './ArticleMediaTools.jsx'

export default function RichArticleEditor({ initialValue = '', disabled = false, token, onPending = () => {}, onContentChange }) {
  const fieldRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [value, setValue] = useState(() => articleHTML(initialValue))
  useEffect(() => { onContentChange?.(value) }, [value, onContentChange])
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
    ['فهرست بولت‌دار', '• فهرست', () => editor.chain().focus().toggleBulletList().run(), 'bulletList'],
    ['فهرست شماره‌دار', '۱. فهرست', () => editor.chain().focus().toggleOrderedList().run(), 'orderedList'],
    ['بازگردانی', '↶', () => editor.chain().focus().undo().run()],
    ['انجام دوباره', '↷', () => editor.chain().focus().redo().run()],
  ]
  return (
    <div className="rich-article-field" ref={fieldRef}>
      <span id="article-body-label">متن کامل مقاله</span>
      <p className="rich-editor-help">متن را بنویسید یا از Word کپی کنید. برای عکس، ابتدا محل دلخواه را در متن انتخاب کنید. عنوان اصلی مقاله خودکار H1 است.</p>
      <div className={`rich-article-editor ${disabled ? 'is-disabled' : ''}`}>
        <div className="rich-editor-toolbar" role="toolbar" aria-label="قالب‌بندی متن مقاله">
          <label>نوع متن<select aria-label="نوع تیتر" disabled={!editor || disabled || uploading} value={editor?.isActive('heading') ? String(editor.getAttributes('heading').level) : 'p'} onChange={(event) => {
            if (event.target.value === 'p') editor.chain().focus().setParagraph().run()
            else editor.chain().focus().setHeading({ level: Number(event.target.value) }).run()
          }}><option value="p">متن معمولی</option><option disabled value="1">H1 — عنوان مقاله</option>{[2, 3, 4, 5, 6].map((level) => <option key={level} value={level}>{`${level === 2 ? 'تیتر بخش' : level === 3 ? 'زیرتیتر' : 'تیتر سطح ' + level} (H${level})`}</option>)}</select></label>
          {buttons.map(([label, text, command, active, attrs]) => (
            <button type="button" key={label} aria-label={label} title={label} disabled={!editor || disabled || uploading}
              aria-pressed={active ? editor?.isActive(active, attrs) || false : undefined}
              onMouseDown={(event) => event.preventDefault()} onClick={command}>{text}</button>
          ))}
        </div>
        <details className="rich-editor-advanced">
          <summary>تنظیمات بیشتر: فونت، اندازه و تراز</summary>
          <div className="rich-editor-toolbar">
            <label>فونت<select aria-label="فونت متن" disabled={!editor || disabled || uploading} value={editor?.getAttributes('textStyle').fontFamily || ''} onChange={(event) => event.target.value ? editor.chain().focus().setFontFamily(event.target.value).run() : editor.chain().focus().unsetFontFamily().run()}><option value="">پیش‌فرض</option>{articleFonts.map(([font, label]) => <option key={font} value={font}>{label}</option>)}</select></label>
            <label>اندازه<select aria-label="اندازه متن" disabled={!editor || disabled || uploading} value={editor?.getAttributes('textStyle').fontSize || ''} onChange={(event) => event.target.value ? editor.chain().focus().setFontSize(event.target.value).run() : editor.chain().focus().unsetFontSize().run()}><option value="">پیش‌فرض</option>{articleFontSizes.map((size) => <option key={size} value={`${size}px`}>{size}px</option>)}</select></label>
            {[[ 'right', 'راست‌چین' ], [ 'center', 'وسط‌چین' ], [ 'left', 'چپ‌چین' ], [ 'justify', 'تراز دوطرفه' ]].map(([align, label]) => <button key={align} type="button" disabled={!editor || disabled || uploading} aria-pressed={editor?.isActive({ textAlign: align }) || false} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().setTextAlign(align).run()}>{label}</button>)}
            <button type="button" disabled={!editor || disabled || uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleUnderline().run()}>زیرخط</button>
            <button type="button" disabled={!editor || disabled || uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()}>نقل‌قول</button>
            <button type="button" disabled={!editor || disabled || uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>پاک‌کردن قالب</button>
          </div>
        </details>
        <ArticleMediaTools editor={editor} token={token} disabled={disabled} onPending={(pending) => { setUploading(pending); onPending(pending) }} />
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name="body" value={value} />
      <small className={value.length > 30000 ? 'rich-editor-limit' : ''}>{new Intl.NumberFormat('fa-IR').format(value.length)} از ۳۰٬۰۰۰ کاراکتر (با قالب‌بندی)</small>
      <p className="rich-editor-help">تیتر بخش‌ها را با «نوع متن» مشخص کنید؛ تغییر اندازهٔ فونت جای تیتر را نمی‌گیرد.</p>
    </div>
  )
}
