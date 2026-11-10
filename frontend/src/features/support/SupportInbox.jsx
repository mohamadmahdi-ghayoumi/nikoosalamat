import React, { useEffect, useRef, useState } from 'react'
import { MessageList, messageId, supportRequest } from './supportApi.jsx'

export default function SupportInbox({ token }) {
  const [status, setStatus] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [closed, setClosed] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const pending = useRef(null)
  const api = (path, options = {}) => supportRequest(path, options, null, token)
  async function refresh() {
    const [state, rows] = await Promise.all([api('/status'), api('/conversations')])
    setStatus(state); setConversations(rows)
  }
  useEffect(() => {
    let active = true; let timer
    async function poll() {
      try {
        const [state, rows] = await Promise.all([
          supportRequest('/status', {}, null, token), supportRequest('/conversations', {}, null, token),
        ])
        if (active) { setStatus(state); setConversations(rows) }
      } catch (error) { if (active) setNotice(error.message) }
      if (active) timer = window.setTimeout(poll, 15000)
    }
    poll(); return () => { active = false; window.clearTimeout(timer) }
  }, [token])
  useEffect(() => {
    setMessages([]); setDraft(''); setClosed(false); pending.current = null
    if (!selected) return undefined
    let active = true; let timer; let after = 0
    async function poll() {
      try {
        const data = await supportRequest(`/conversations/${selected}/messages?after=${after}`, {}, null, token)
        if (!active) return
        setClosed(data.closed)
        if (data.messages.length) {
          after = data.messages.at(-1).id
          setMessages((old) => [...old, ...data.messages.filter((item) => !old.some((entry) => entry.id === item.id))].sort((a, b) => a.id - b.id))
        }
        timer = window.setTimeout(poll, data.has_more ? 100 : 5000)
      } catch (error) { if (active) { setNotice(error.message); timer = window.setTimeout(poll, 10000) } }
    }
    poll(); return () => { active = false; window.clearTimeout(timer) }
  }, [selected, token])
  async function action(callback) {
    if (busy) return
    setBusy(true); setNotice('')
    try { await callback(); await refresh() } catch (error) { setNotice(error.message) }
    finally { setBusy(false) }
  }
  async function send(event) {
    event.preventDefault()
    const text = draft.trim(); if (!text || !selected || busy || closed) return
    await action(async () => {
      if (pending.current?.text !== text) pending.current = { text, client_id: messageId() }
      const saved = await api(`/conversations/${selected}/messages`, { method: 'POST', body: JSON.stringify(pending.current) })
      setMessages((old) => old.some((item) => item.id === saved.id) ? old : [...old, saved].sort((a, b) => a.id - b.id))
      setDraft(''); pending.current = null
    })
  }
  return (
    <section className="support-admin" dir="rtl">
      <h2>پیام‌های پشتیبانی</h2>
      <p>این بخش چت انسانی است، نه ربات هوش مصنوعی. مهمان‌ها بدون حساب کاربری پیام می‌دهند و پاسخ را در همان مرورگر می‌گیرند.</p>
      <div className="support-admin-settings">
        <button disabled={busy || !status} onClick={() => {
          if (!status.enabled && !window.confirm('دریافت پیام برای همه بازدیدکنندگان فعال شود؟ پاسخ‌گویی و بررسی این صندوق بر عهده تیم شماست.')) return
          action(() => api('/status', { method: 'PUT', body: JSON.stringify({ enabled: !status.enabled }) }))
        }}>{status?.enabled ? 'غیرفعال کردن دریافت پیام' : 'فعال کردن چت سایت'}</button>
        <span>{status?.telegram_configured ? 'تنظیمات تلگرام موجود است؛ اتصال و Cron را بررسی کنید.' : 'تلگرام هنوز تنظیم نشده؛ فعلاً پاسخ‌ها را از همین پنل بدهید.'}</span>
        <button disabled={busy || !status?.telegram_configured} onClick={() => action(async () => {
          await api('/telegram/connect', { method: 'POST', body: '{}' }); setNotice('وب‌هوک تلگرام ثبت شد. ارسال و دریافت را با یک پیام آزمایشی بررسی کنید.')
        })}>ثبت اتصال تلگرام</button>
        <button disabled={busy || !status?.telegram_configured} onClick={() => action(async () => {
          const result = await api('/retry', { method: 'POST', body: '{}' }); setNotice(`${result.sent} پیام از صف ارسال شد.`)
        })}>تلاش برای ارسال صف ({status?.pending ?? 0})</button>
      </div>
      {notice && <p className="support-admin-notice" role="status">{notice}</p>}
      <div className="support-inbox-grid">
        <nav className="support-conversations" aria-label="گفت‌وگوها">
          {!conversations.length && <p>هنوز پیامی ثبت نشده است.</p>}
          {conversations.map((item) => <button key={item.id} className={item.id === selected ? 'active' : ''} disabled={busy} onClick={() => setSelected(item.id)}>
            <strong>مهمان {item.id.slice(0, 8)} {item.closed ? '· بسته' : item.last_role === 'visitor' ? '· نیازمند پاسخ' : ''}</strong>
            <span>{item.preview || 'بدون پیام'}</span>
            <small>{new Date(item.updated_at * 1000).toLocaleString('fa-IR')}</small>
          </button>)}
        </nav>
        <div className="support-admin-thread">
          {selected ? <>
            <div className="support-history" role="log" aria-label="تاریخچه گفت‌وگو"><MessageList messages={messages} visitorLabel="بازدیدکننده" /></div>
            <form className="support-compose" onSubmit={send}>
              <label htmlFor="support-admin-reply">پاسخ به مهمان</label>
              <textarea id="support-admin-reply" maxLength={2000} rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} disabled={busy || closed} />
              <div className="support-actions"><button disabled={busy || closed || !draft.trim()}>ارسال پاسخ</button><button type="button" className="support-secondary" disabled={busy || closed} onClick={() => {
                if (window.confirm('این گفت‌وگو بسته شود؟')) action(async () => { await api(`/conversations/${selected}/close`, { method: 'POST', body: '{}' }); setClosed(true) })
              }}>بستن گفت‌وگو</button></div>
            </form>
          </> : <p>یک گفت‌وگو را انتخاب کنید.</p>}
        </div>
      </div>
      <p className="support-hint">پاسخ در تلگرام: روی پیام ارسالی ربات، Reply بزنید. فقط متنِ حداکثر ۲۰۰۰ نویسه از پشتیبان‌های مجاز پذیرفته می‌شود. نگهداری پیام‌ها ۳۰ روز است؛ Cron پاک‌سازی و ارسال صف باید روی هاست فعال باشد.</p>
    </section>
  )
}
