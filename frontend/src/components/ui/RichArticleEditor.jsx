import React, { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { articleHTML } from '../../utils/articleContent.js'

export default function RichArticleEditor({ initialValue = '', disabled = false }) {
  const fieldRef = useRef(null)
  const [value, setValue] = useState(() => articleHTML(initialValue))
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false } })],
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
  useEffect(() => { editor?.setEditable(!disabled) }, [editor, disabled])
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
      <p className="rich-editor-help">متن را مستقیم از Word کپی کنید؛ بولد، تیتر و فهرست‌ها حفظ می‌شوند. برای تغییر قالب از ابزارهای زیر استفاده کنید.</p>
      <div className={`rich-article-editor ${disabled ? 'is-disabled' : ''}`}>
        <div className="rich-editor-toolbar" role="toolbar" aria-label="قالب‌بندی متن مقاله">
          {buttons.map(([label, text, command, active, attrs]) => (
            <button type="button" key={label} aria-label={label} title={label} disabled={!editor || disabled}
              aria-pressed={active ? editor?.isActive(active, attrs) || false : undefined}
              onMouseDown={(event) => event.preventDefault()} onClick={command}>{text}</button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name="body" value={value} />
      <small className={value.length > 30000 ? 'rich-editor-limit' : ''}>{new Intl.NumberFormat('fa-IR').format(value.length)} از ۳۰٬۰۰۰ کاراکتر (با قالب‌بندی)</small>
    </div>
  )
}
