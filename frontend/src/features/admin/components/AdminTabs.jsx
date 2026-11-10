import React from 'react'

export default function AdminTabs({ activeTab, setActiveTab }) {
  return (
    <div className="admin-tabs" role="tablist">
      {[
        ['products', 'محصولات'],
        ['pages', 'راهکارها'],
        ['articles', 'مقالات'],
        ['support', 'پشتیبانی'],
      ].map(([id, label]) => (
        <button
          className={activeTab === id ? 'active' : ''}
          onClick={() => setActiveTab(id)}
          key={id}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
