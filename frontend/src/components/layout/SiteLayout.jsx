import React from 'react'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import SocialLinks from './SocialLinks.jsx'
import Toast from '../ui/Toast.jsx'

export default function SiteLayout({ currentPath, navigate, cartCount, notice, children }) {
  const isAdmin = currentPath === '/admin'
  return (
    <div className="site-shell">
      <Header currentPath={currentPath} navigate={navigate} cartCount={cartCount} />
      {children}
      {!isAdmin && <SocialLinks placement="dock" />}
      {!isAdmin && <Footer navigate={navigate} />}
      <Toast message={notice} />
    </div>
  )
}
