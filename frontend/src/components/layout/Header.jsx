import React, { useEffect, useState } from 'react'
import Icon from '../ui/Icon.jsx'
import useHeaderOffset from '../../hooks/useHeaderOffset.js'
import { navigationItems } from '../../config/navigation.js'
import NavigationItem from './NavigationItem.jsx'

export default function Header({ currentPath, navigate, cartCount }) {
  const siteHeaderRef = useHeaderOffset()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const handleNavigate = (event, target) => {
    setMenuOpen(false)
    setSearchOpen(false)
    navigate(event, target)
  }
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [currentPath])
  return (
    <div className="site-header" ref={siteHeaderRef}>
      <div className="announcement">
        <span>ارسال رایگان سفارش‌های بالای ۱٬۵۰۰٬۰۰۰ تومان</span>
        <span className="announcement-dot" />
        <span>ارتباط با مدیر فروش: ۰۹۱۲۴۲۸۳۸۳۴</span>
      </div>

      <header className="header">
        <div className="header-inner">
          <button
            className="icon-button mobile-menu-button"
            aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>

          <a
            href="/"
            onClick={(event) => handleNavigate(event, '/')}
            className="brand"
            aria-label="صفحه اصلی حال نیکو سلامت"
          >
            <svg
              className="brand-logo"
              viewBox="80 80 305 315"
              aria-hidden="true"
              focusable="false"
            >
              <image href="/images/hns-logo.png" width="461" height="526" />
            </svg>
          </a>

          <div className="header-actions">
            <button
              className="icon-button search-button"
              aria-label="جست‌وجو"
              onClick={() => setSearchOpen((open) => !open)}
            >
              <Icon name="search" />
            </button>
            <a
              className={`admin-entry ${currentPath === '/admin' ? 'active' : ''}`}
              href="/admin"
              onClick={(event) => handleNavigate(event, '/admin')}
            >
              <Icon name="user" size={18} />
              <span>ورود</span>
            </a>
            <button className="icon-button cart-button" aria-label={`سبد خرید، ${cartCount} کالا`}>
              <Icon name="bag" />
              {cartCount > 0 && (
                <span className="cart-count">
                  {new Intl.NumberFormat('fa-IR').format(cartCount)}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="navigation-bar">
          <nav
            id="main-navigation"
            className={`nav ${menuOpen ? 'is-open' : ''}`}
            aria-label="منوی اصلی"
          >
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.label}
                item={item}
                currentPath={currentPath}
                navigate={handleNavigate}
              />
            ))}
          </nav>
        </div>
        {searchOpen && (
          <div className="search-panel">
            <Icon name="search" />
            <input
              autoFocus
              type="search"
              placeholder="جست‌وجوی محصول یا موضوع..."
              aria-label="جست‌وجو در سایت"
            />
            <button onClick={() => setSearchOpen(false)} aria-label="بستن جست‌وجو">
              <Icon name="close" size={19} />
            </button>
          </div>
        )}
      </header>
    </div>
  )
}
