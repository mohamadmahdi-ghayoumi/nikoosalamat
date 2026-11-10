import React, { useEffect, useRef, useState } from 'react'
import { MessageList, messageId, supportRequest } from './supportApi.jsx'

const STORAGE_KEY = 'nikoosalamat_support_v1'
function readSession() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return /^[a-f0-9]{32}$/.test(value?.id) && /^[a-f0-9]{64}$/.test(value?.token) ? value : null
  } catch { return null }
}

export default function SupportChat() {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(readSession)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [consent, setConsent] = useState(false)
  const [sending, setSending] = useState(false)
  const [closed, setClosed] = useState(false)
  const [error, setError] = useState('')
  const [unread, setUnread] = useState(0)
  const list = useRef(null)
  const input = useRef(null)
  const launcher = useRef(null)
  const cursor = useRef(0)
  const pending = useRef(null)
  const stickToBottom = useRef(true)
  const busy = useRef(false)

  useEffect(() => {
    let active = true
    let timer
    async function check() {
      try { const data = await supportRequest('/status'); if (active) setEnabled(data.enabled) } catch { /* Retry without interrupting existing history. */ }
      if (active) timer = window.setTimeout(check, 60000)
    }
    check()
    return () => { active = false; window.clearTimeout(timer) }
  }, [])

  useEffect(() => {
    if (!session) return undefined
    let active = true
    let timer
    let loading = false
    async function poll() {
      if (!active || loading) return
      loading = true
      if (!document.hidden) {
        try {
          const data = await supportRequest(`/conversations/${session.id}/messages?after=${cursor.current}`, {}, session)
          if (!active) return
          setClosed(data.closed)
          if (data.messages.length) {
            cursor.current = data.messages.at(-1).id
            setMessages((old) => [...old, ...data.messages.filter((item) => !old.some((entry) => entry.id === item.id))].sort((a, b) => a.id - b.id))
            if (!open) setUnread((old) => old + data.messages.filter((item) => item.role === 'staff').length)
          }
          setError('')
          timer = window.setTimeout(poll, data.has_more ? 100 : open ? 5000 : 30000)
          loading = false
          return
        } catch (cause) { if (active) setError(cause.status === 404 ? cause.message : 'دریافت پاسخ قطع شده؛ دوباره تلاش می‌کنیم. پیام‌های ثبت‌شده محفوظ‌اند.') }
      }
      loading = false
      if (active) timer = window.setTimeout(poll, open ? 8000 : 30000)
    }
    poll()
    const visible = () => { if (!document.hidden) { window.clearTimeout(timer); timer = window.setTimeout(poll, 200) } }
    document.addEventListener('visibilitychange', visible)
    return () => { active = false; window.clearTimeout(timer); document.removeEventListener('visibilitychange', visible) }
  }, [session, open])

  useEffect(() => {
    if (open) { setUnread(0); input.current?.focus() }
  }, [open])
  useEffect(() => {
    if (stickToBottom.current && list.current) list.current.scrollTop = list.current.scrollHeight
  }, [messages, open])

  function close() { setOpen(false); launcher.current?.focus() }
  function startNew() {
    if (!window.confirm('گفت‌وگوی جدید شروع شود؟ دسترسی این مرورگر به گفت‌وگوی قبلی حذف می‌شود.')) return
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* Session remains usable in memory. */ }
    cursor.current = 0; pending.current = null
    setSession(null); setMessages([]); setClosed(false); setError(''); setConsent(false)
  }
  async function send(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || busy.current || closed || (!session && !consent)) return
    busy.current = true; setSending(true); setError('')
    try {
      let current = session
      if (!current) {
        current = await supportRequest('/conversations', { method: 'POST', body: '{}' })
        // Persist before sending: losing a response must not lose access to the conversation.
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current)) } catch {
          throw new Error('ذخیره‌سازی مرورگر مسدود است؛ برای حفظ دسترسی به پاسخ، آن را فعال کنید یا تلفنی تماس بگیرید.')
        }
        setSession(current)
      }
      if (pending.current?.text !== text) pending.current = { text, client_id: messageId() }
      const saved = await supportRequest(`/conversations/${current.id}/messages`, { method: 'POST', body: JSON.stringify(pending.current) }, current)
      stickToBottom.current = true
      setMessages((old) => old.some((item) => item.id === saved.id) ? old : [...old, saved].sort((a, b) => a.id - b.id))
      setDraft(''); pending.current = null
    } catch (cause) { setError(cause.message || 'پیام ارسال نشد؛ دوباره تلاش کنید.') }
    finally { busy.current = false; setSending(false) }
  }

  if (!enabled && !session) return null
  return (
    <aside className="support-widget" dir="rtl" aria-label="پشتیبانی سایت">
      {open && (
        <section className="support-panel" role="dialog" aria-label="گفت‌وگو با پشتیبانی" onKeyDown={(event) => { if (event.key === 'Escape') close() }}>
          <header className="support-panel-header">
            <div><strong>پشتیبانی نیکو سلامت</strong><small>پاسخ‌گویی توسط همکاران ما، نه هوش مصنوعی</small></div>
            <button type="button" onClick={close} aria-label="بستن گفت‌وگو">×</button>
          </header>
          <div className="support-history" ref={list} role="log" aria-label="پیام‌های گفت‌وگو" aria-live="polite" onScroll={() => {
            const el = list.current; stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 70
          }}>
            <p className="support-hint">بدون ثبت‌نام پیام بدهید. پاسخ در همین مرورگر نمایش داده می‌شود؛ ممکن است فوری نباشد.</p>
            <MessageList messages={messages} />
          </div>
          {error && <p className="support-error" role="alert">{error}</p>}
          <form className="support-compose" onSubmit={send}>
            {!enabled && <p className="support-hint">دریافت پیام تازه موقتاً غیرفعال است؛ پاسخ‌های قبلی همچنان قابل مشاهده‌اند.</p>}
            {!session && <label className="support-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />می‌پذیرم پیامم برای تیم پشتیبانی، از جمله در تلگرام، ارسال و تا ۳۰ روز نگهداری شود.</label>}
            <label className="support-input-label" htmlFor="support-text">پیام شما</label>
            <textarea id="support-text" ref={input} rows={2} maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={closed ? 'این گفت‌وگو بسته شده است' : 'سؤال خود را بنویسید…'} disabled={closed || sending || !enabled} />
            <div className="support-actions">
              <button type="submit" disabled={!draft.trim() || sending || closed || !enabled || (!session && !consent)}>{sending ? 'در حال ثبت…' : 'ارسال پیام'}</button>
              {session && <button type="button" className="support-secondary" disabled={sending} onClick={startNew}>گفت‌وگوی تازه</button>}
            </div>
            <small>برای دیدن پاسخ دوباره به همین سایت و مرورگر برگردید. اطلاعات حساس نفرستید. برای موضوع فوری با مدیر فروش تماس بگیرید.</small>
          </form>
        </section>
      )}
      <button className="support-launcher" ref={launcher} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'بستن پشتیبانی' : `گفت‌وگو با پشتیبانی${unread ? `، ${unread} پاسخ جدید` : ''}`}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 1 1 18 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.8" /></svg>
        <span>پشتیبانی</span>{unread > 0 && <span className="support-unread">{unread}</span>}
      </button>
    </aside>
  )
}
