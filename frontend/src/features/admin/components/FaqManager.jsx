import React, { useEffect, useRef, useState } from 'react'
import { faqAdminRequest } from '../../../services/api/faqs.js'

const empty = () => ({ question: '', answer: '', sort_order: 0, published: true })

export default function FaqManager({ token }) {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const form = useRef(null)
  const api = (suffix = '', options = {}) => faqAdminRequest(token, suffix, options)

  useEffect(() => {
    let active = true
    faqAdminRequest(token)
      .then((data) => {
        if (active) setItems(data)
      })
      .catch((error) => {
        if (active) setNotice(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  function edit(item) {
    setEditing(item.id)
    setDraft({
      question: item.question,
      answer: item.answer,
      sort_order: item.sort_order,
      published: item.published,
    })
    setNotice('')
    form.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    form.current?.querySelector('[name="faq-question"]')?.focus({ preventScroll: true })
  }
  function clear() {
    setEditing(null)
    setDraft(empty())
  }
  async function refresh() {
    setItems(await api())
  }
  async function save(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setNotice('')
    try {
      await api(editing ? `/${editing}` : '', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...draft,
          question: draft.question.trim(),
          answer: draft.answer.trim(),
          sort_order: Number(draft.sort_order),
        }),
      })
      clear()
      await refresh()
      setNotice('سؤال ذخیره شد؛ تغییرات در صفحه ارتباط با ما نمایش داده می‌شود.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }
  async function remove(item) {
    if (
      busy ||
      !window.confirm(
        `سؤال «${item.question}» حذف شود؟ برای نگهداری آن می‌توانید به‌جای حذف، نمایش آن را غیرفعال کنید.`,
      )
    )
      return
    setBusy(true)
    setNotice('')
    try {
      await api(`/${item.id}`, { method: 'DELETE' })
      if (editing === item.id) clear()
      await refresh()
      setNotice('سؤال حذف شد.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="faq-admin">
      <div className="admin-section-intro">
        <h2>مدیریت سؤالات متداول</h2>
        <p>
          سؤال و پاسخ‌های صفحه «ارتباط با ما» را اضافه یا ویرایش کنید. عدد کوچک‌تر زودتر نمایش داده
          می‌شود؛ با برداشتن تیک نمایش، سؤال بدون حذف‌کردن پنهان می‌شود.
        </p>
      </div>
      {notice && (
        <p className="faq-admin-notice" role="status">
          {notice}
        </p>
      )}
      <div className="admin-layout">
        <form className="admin-product-form" ref={form} onSubmit={save}>
          <div className="form-heading">
            <span>{editing ? 'ویرایش سؤال' : 'سؤال تازه'}</span>
            <h2>{editing ? 'ویرایش سؤال و پاسخ' : 'افزودن سؤال'}</h2>
          </div>
          <label>
            سؤال
            <input
              name="faq-question"
              value={draft.question}
              onChange={(event) => setDraft({ ...draft, question: event.target.value })}
              required
              minLength={2}
              maxLength={300}
              disabled={busy}
            />
          </label>
          <label>
            پاسخ
            <textarea
              name="faq-answer"
              value={draft.answer}
              onChange={(event) => setDraft({ ...draft, answer: event.target.value })}
              rows={8}
              required
              minLength={2}
              maxLength={6000}
              disabled={busy}
            />
          </label>
          <label>
            ترتیب نمایش
            <input
              name="faq-order"
              type="number"
              min={0}
              max={10000}
              step={1}
              value={draft.sort_order}
              onChange={(event) => setDraft({ ...draft, sort_order: event.target.value })}
              required
              disabled={busy}
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) => setDraft({ ...draft, published: event.target.checked })}
              disabled={busy}
            />
            نمایش در سایت
          </label>
          <div className="admin-form-actions">
            <button className="button primary" disabled={busy || loading}>
              {busy ? 'در حال ذخیره…' : editing ? 'ذخیره تغییرات سؤال' : 'افزودن سؤال'}
            </button>
            {editing && (
              <button className="button outline" type="button" onClick={clear} disabled={busy}>
                انصراف
              </button>
            )}
          </div>
        </form>
        <div className="admin-products">
          <div className="admin-list-head">
            <h2>{items.length.toLocaleString('fa-IR')} سؤال</h2>
            <button
              type="button"
              className="button outline"
              disabled={busy || loading}
              onClick={async () => {
                setLoading(true)
                try {
                  await refresh()
                  setNotice('')
                } catch (error) {
                  setNotice(error.message)
                } finally {
                  setLoading(false)
                }
              }}
            >
              بارگذاری دوباره
            </button>
          </div>
          {loading ? (
            <p role="status">در حال دریافت سؤالات…</p>
          ) : !items.length ? (
            <p>هنوز سؤالی ثبت نشده است.</p>
          ) : (
            <div className="faq-admin-list">
              {items.map((item) => (
                <article key={item.id}>
                  <small>
                    {item.published ? 'نمایش در سایت' : 'پنهان'} · ترتیب{' '}
                    {item.sort_order.toLocaleString('fa-IR')}
                  </small>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => edit(item)} disabled={busy}>
                      ویرایش
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => remove(item)}
                      disabled={busy}
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
