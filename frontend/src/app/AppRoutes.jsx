import React from 'react'
import HomePage from '../features/home/pages/HomePage.jsx'
import ProductsPage from '../features/products/pages/ProductsPage.jsx'
import ProductDetailPage from '../features/products/pages/ProductDetailPage.jsx'
import ArticlesPage from '../features/articles/pages/ArticlesPage.jsx'
import ArticlePage from '../features/articles/pages/ArticlePage.jsx'
import ContentPageView from '../features/content/pages/ContentPage.jsx'
import SolutionsPage from '../features/content/pages/SolutionsPage.jsx'
import SearchPage from '../features/search/pages/SearchPage.jsx'
import AboutPage from '../features/about/pages/AboutPage.jsx'
import ContactPage from '../features/contact/pages/ContactPage.jsx'
import AdminPage from '../features/admin/pages/AdminPage.jsx'
import NotFoundPage from '../components/ui/NotFoundPage.jsx'

export default function AppRoutes({
  currentPath,
  currentSearch,
  navigate,
  homeData,
  catalogProducts,
  showNotice,
  markApiOnline,
  addToCart,
}) {
  if (currentPath === '/')
    return (
      <HomePage
        homeData={homeData}
        navigate={navigate}
        showNotice={showNotice}
        onApiOnline={markApiOnline}
      />
    )
  if (currentPath === '/products')
    return <ProductsPage products={catalogProducts} navigate={navigate} />
  if (/^\/products\/\d+$/.test(currentPath))
    return (
      <ProductDetailPage
        id={currentPath.split('/')[2]}
        navigate={navigate}
        onAddToCart={addToCart}
      />
    )
  if (currentPath === '/search')
    return (
      <SearchPage query={new URLSearchParams(currentSearch).get('q') || ''} navigate={navigate} />
    )
  if (currentPath === '/solutions') return <SolutionsPage navigate={navigate} />
  if (currentPath === '/articles') return <ArticlesPage navigate={navigate} />
  if (currentPath.startsWith('/articles/'))
    return <ArticlePage slug={currentPath.slice('/articles/'.length)} navigate={navigate} />
  if (currentPath.startsWith('/pages/'))
    return <ContentPageView slug={currentPath.slice('/pages/'.length)} navigate={navigate} />
  if (currentPath === '/about') return <AboutPage navigate={navigate} />
  if (currentPath === '/contact') return <ContactPage showNotice={showNotice} />
  if (currentPath === '/admin') return <AdminPage showNotice={showNotice} />
  return <NotFoundPage navigate={navigate} />
}
