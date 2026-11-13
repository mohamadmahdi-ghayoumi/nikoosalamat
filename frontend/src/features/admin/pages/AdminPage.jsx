import React from 'react'
import useAdminController from '../hooks/useAdminController.js'
import AdminLogin from '../components/AdminLogin.jsx'
import AdminHeader from '../components/AdminHeader.jsx'
import AdminTabs from '../components/AdminTabs.jsx'
import ProductsManager from '../components/ProductsManager.jsx'
import PagesManager from '../components/PagesManager.jsx'
import ArticlesManager from '../components/ArticlesManager.jsx'
import CatalogEditor from '../components/CatalogEditor.jsx'
import SupportInbox from '../../support/SupportInbox.jsx'
import FaqManager from '../components/FaqManager.jsx'
const SiteCustomizer = React.lazy(() => import('../../site/SiteCustomizer.jsx'))

export default function AdminPage({ showNotice }) {
  const manager = useAdminController(showNotice)
  const [siteDirty, setSiteDirty] = React.useState(false)
  if (manager.checking) return <main className="admin-loading">در حال بررسی دسترسی…</main>
  if (!manager.admin) return <AdminLogin busy={manager.busy} login={manager.login} />
  return (
    <main className="admin-page">
      <AdminHeader admin={manager.admin} logout={manager.logout} />
      <p className="admin-home-edit-hint">
        <a href="/">ویرایش متن‌های صفحه اصلی ←</a> — پس از رفتن به صفحه اصلی، مداد کنار هر متن را
        بزنید.
      </p>
      <AdminTabs
        activeTab={manager.activeTab}
        setActiveTab={(tab) => {
          if (
            !siteDirty ||
            tab === manager.activeTab ||
            window.confirm('تغییرات سایت ذخیره نشده‌اند؛ بخش دیگری باز شود؟')
          ) {
            manager.setActiveTab(tab)
            setSiteDirty(false)
          }
        }}
      />
      {manager.activeTab === 'site' && (
        <React.Suspense fallback={<p>دریافت مدیریت سایت…</p>}>
          <SiteCustomizer
            token={manager.token}
            showNotice={showNotice}
            onDirtyChange={setSiteDirty}
          />
        </React.Suspense>
      )}
      {manager.activeTab === 'support' && <SupportInbox token={manager.token} />}
      {manager.activeTab === 'faqs' && <FaqManager token={manager.token} />}
      {manager.activeTab === 'products' && (
        <ProductsManager
          products={manager.products}
          busy={manager.busy}
          createProduct={manager.createProduct}
          editingProduct={manager.editingProduct}
          setEditingProduct={manager.setEditingProduct}
          removeProduct={manager.removeProduct}
          setEditingCatalog={manager.setEditingCatalog}
        />
      )}
      {manager.activeTab === 'products' && manager.editingCatalog && (
        <CatalogEditor
          product={manager.editingCatalog}
          busy={manager.busy}
          onSave={manager.saveCatalog}
          onCancel={() => manager.setEditingCatalog(null)}
        />
      )}
      {manager.activeTab === 'pages' && (
        <PagesManager pages={manager.pages} busy={manager.busy} savePage={manager.savePage} />
      )}
      {manager.activeTab === 'articles' && (
        <ArticlesManager
          token={manager.token}
          busy={manager.busy}
          articles={manager.articles}
          editingArticle={manager.editingArticle}
          setEditingArticle={manager.setEditingArticle}
          saveArticle={manager.saveArticle}
          removeArticle={manager.removeArticle}
        />
      )}
    </main>
  )
}
