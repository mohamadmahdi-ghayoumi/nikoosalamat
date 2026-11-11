import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { request } from '../../../services/api/client.js'
import { getAdminProfile } from '../../../services/api/admin.js'

const HomeTextContext = createContext(null)

export function useHomeTextDialogOpen() {
  return Boolean(useContext(HomeTextContext)?.dialogOpen)
}

function textLimit(field) {
  if (field === 'about.description') return 6000
  if (field.startsWith('hero.')) return field.endsWith('.title') ? 250 : 600
  if (field.startsWith('benefits.')) return field.endsWith('.title') ? 200 : 400
  if (field.startsWith('brand.trait.')) return 100
  if (field.startsWith('featured.') && !field.endsWith('.eyebrow')) return 150
  if (field.endsWith('.eyebrow')) return 200
  if (field === 'newsletter.description') return 600
  return 250
}

export function EditableText({ field, children }) {
  const editor = useContext(HomeTextContext)
  const text = editor?.entries[field]?.text ?? children
  if (!editor?.editing) return <>{text}</>
  return (
    <span className="home-editable-text">
      {text}
      <button
        type="button"
        className="home-edit-pencil"
        data-home-field={field}
        aria-label={`ویرایش: ${String(text).slice(0, 70)}`}
        title="ویرایش متن"
        onClick={(event) => {
          event.stopPropagation()
          editor.open(field, text, event.currentTarget)
        }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path
            d="m15 5 4 4M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </span>
  )
}

export function HomeEditingBar() {
  const editor = useContext(HomeTextContext)
  if (!editor?.admin) return null
  return (
    <aside className="home-editing-bar" aria-label="ویرایش صفحه اصلی">
      <span>
        {editor.loaded ? 'برای تغییر متن، روی مداد کنار آن بزنید.' : 'دریافت متن‌های صفحه…'}
      </span>
      {editor.loadError ? (
        <button type="button" onClick={editor.reload}>
          دریافت دوباره متن‌ها
        </button>
      ) : (
        <button
          type="button"
          disabled={!editor.loaded}
          aria-pressed={editor.editing}
          onClick={editor.toggle}
        >
          {editor.editing ? 'پنهان‌کردن علامت‌های ویرایش' : 'نمایش علامت‌های ویرایش'}
        </button>
      )}
      {editor.loadError && (
        <span role="alert">دریافت متن‌ها انجام نشد؛ ویرایش موقتاً غیرفعال است.</span>
      )}
      <small>نوشته‌های داخل عکس و ویدیو با این ابزار تغییر نمی‌کنند.</small>
    </aside>
  )
}

export default function HomeTextEditor({ children, showNotice }) {
  const [entries, setEntries] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [token] = useState(() => sessionStorage.getItem('sovara_admin_token') || '')
  const [target, setTarget] = useState(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [conflict, setConflict] = useState(false)
  const dialog = useRef(null)
  const textarea = useRef(null)
  const opener = useRef(null)

  const reload = async () => {
    setLoadError(false)
    try {
      const data = await request('/api/home-text')
      setEntries(data)
      setLoaded(true)
      return data
    } catch {
      setLoadError(true)
      setLoaded(false)
      return null
    }
  }
  useEffect(() => {
    let active = true
    request('/api/home-text')
      .then((data) => {
        if (active) {
          setEntries(data)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
    if (token) {
      getAdminProfile(token)
        .then(() => {
          if (active) setAdmin(true)
        })
        .catch(() => {})
    }
    return () => {
      active = false
    }
  }, [token])

  useEffect(() => {
    if (target && !dialog.current.open) {
      dialog.current.showModal()
      textarea.current.focus()
    }
  }, [target])

  const close = () => {
    if (busy) return
    dialog.current.close()
    setTarget(null)
    opener.current?.focus()
  }
  const open = (field, text, button) => {
    opener.current = button
    setError('')
    setConflict(false)
    setDraft(text)
    setTarget({ field, revision: entries[field]?.revision ?? 0 })
  }
  const save = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const saved = await request(`/api/admin/home-text/${target.field}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: draft.trim(), revision: target.revision }),
      })
      setEntries((previous) => ({ ...previous, [target.field]: saved }))
      dialog.current.close()
      setTarget(null)
      opener.current?.focus()
      showNotice('متن ذخیره شد و برای بازدیدکننده‌ها نمایش داده می‌شود.')
    } catch (failure) {
      setError(
        failure.status === 401
          ? 'نشست مدیریت تمام شده؛ دوباره وارد پنل شوید. متن شما هنوز در این کادر است.'
          : failure.name === 'AbortError'
            ? 'سرور پاسخ نداد؛ اتصال را بررسی کنید و دوباره ذخیره را بزنید. متن شما در کادر باقی مانده است.'
            : failure.message,
      )
      setConflict(failure.status === 409)
      if (failure.status === 401) setAdmin(false)
    } finally {
      setBusy(false)
    }
  }
  const fetchLatest = async () => {
    setBusy(true)
    const data = await reload()
    if (data) {
      setDraft(data[target.field]?.text ?? draft)
      setTarget({ ...target, revision: data[target.field]?.revision ?? 0 })
      setError('')
      setConflict(false)
    }
    setBusy(false)
  }
  return (
    <HomeTextContext.Provider
      value={{
        entries,
        admin,
        loaded,
        loadError,
        reload,
        dialogOpen: Boolean(target),
        editing: admin && enabled && loaded,
        open,
        toggle: () => setEnabled((value) => !value),
      }}
    >
      {children}
      <dialog
        ref={dialog}
        className="home-text-dialog"
        aria-labelledby="home-text-dialog-title"
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
      >
        {target && (
          <form onSubmit={save} aria-busy={busy}>
            <h2 id="home-text-dialog-title">ویرایش متن صفحه اصلی</h2>
            <p>تغییر پس از ذخیره روی سایت نمایش داده می‌شود؛ ظاهر و اندازهٔ متن حفظ می‌شود.</p>
            <label htmlFor="home-text-draft">متن جدید</label>
            <textarea
              id="home-text-draft"
              ref={textarea}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={5}
              maxLength={textLimit(target.field)}
              required
              disabled={busy}
            />
            <small>حداکثر {textLimit(target.field).toLocaleString('fa-IR')} نویسه</small>
            {error && (
              <p className="home-text-error" role="alert">
                {error}
              </p>
            )}
            {conflict && (
              <button type="button" disabled={busy} onClick={fetchLatest}>
                جایگزینی نوشتهٔ کادر با آخرین نسخهٔ ذخیره‌شده
              </button>
            )}
            <div className="home-text-dialog-actions">
              <button
                className="button primary"
                type="submit"
                disabled={busy || !draft.trim() || conflict}
              >
                {busy ? 'در حال ذخیره…' : 'ذخیره متن'}
              </button>
              <button className="button outline" type="button" disabled={busy} onClick={close}>
                انصراف
              </button>
            </div>
          </form>
        )}
      </dialog>
    </HomeTextContext.Provider>
  )
}
