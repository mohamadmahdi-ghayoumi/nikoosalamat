import React from 'react'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import SocialLinks from './SocialLinks.jsx'
import Toast from '../ui/Toast.jsx'
import { ADMIN_PATH } from '../../app/adminRoute.js'
import SupportChat from '../../features/support/SupportChat.jsx'

export default function SiteLayout({ currentPath, navigate, cartCount, notice, children }) {
  const isAdmin = currentPath === ADMIN_PATH
  return (
    <div className={`site-shell${isAdmin ? '' : ' site-customized'}`}>
      <Header currentPath={currentPath} navigate={navigate} cartCount={cartCount} />
      {children}
      {!isAdmin && <SocialLinks placement="dock" />}
      {!isAdmin && <Footer navigate={navigate} />}
      {!isAdmin && <SupportChat />}
      <Toast message={notice} />
    </div>
  )
}
