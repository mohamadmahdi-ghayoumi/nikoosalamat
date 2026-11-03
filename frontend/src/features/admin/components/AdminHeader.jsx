import React from 'react'

export default function AdminHeader({ admin, logout }) {
  return (
    <div className="admin-topbar">
      <div>
        <span className="eyebrow">پنل مدیریت محتوا</span>
        <h1>مدیریت سایت</h1>
        <p>
          خوش آمدید، <b dir="ltr">{admin.username}</b>
        </p>
      </div>
      <button className="button admin-logout" onClick={logout}>
        خروج از حساب
      </button>
    </div>
  )
}
