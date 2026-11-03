import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'

export default function AdminLogin({ busy, login }) {
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-lock">
          <Icon name="shield" size={30} />
        </div>
        <span className="eyebrow">ورود امن</span>
        <h1>داشبورد مدیریت نیکو سلامت</h1>
        <p>این بخش فقط برای مدیر سایت قابل دسترسی است.</p>
        <form onSubmit={login}>
          <label>
            نام کاربری
            <input
              name="username"
              type="text"
              dir="ltr"
              autoComplete="username"
              placeholder="admin"
              minLength="3"
              required
            />
          </label>
          <label>
            رمز عبور
            <input
              name="password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              minLength="4"
              required
            />
          </label>
          <button className="button primary" type="submit" disabled={busy}>
            {busy ? 'در حال ورود…' : 'ورود به داشبورد'} <Icon name="arrow" size={18} />
          </button>
        </form>
      </section>
    </main>
  )
}
