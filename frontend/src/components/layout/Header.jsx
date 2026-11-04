import React, { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon.jsx'
import useHeaderOffset from '../../hooks/useHeaderOffset.js'
import useHeaderMenus, { desktopNavigation } from '../../hooks/useHeaderMenus.js'
import { navigationItems } from '../../config/navigation.js'
import NavigationItem from './NavigationItem.jsx'
import HeaderSearch from './HeaderSearch.jsx'

export default function Header({ currentPath, navigate, cartCount }) {
  const siteHeaderRef = useHeaderOffset()
  const {
    navigationRef,
    mobileToggleRef,
    menuOpen,
    setMenuOpen,
    openPath,
    setOpenPath,
    closeMenus,
  } = useHeaderMenus(currentPath)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchButtonRef = useRef(null)
  const closeSearch = useCallback((restoreFocus) => {
    setSearchOpen(false)
    if (restoreFocus) searchButtonRef.current?.focus()
  }, [])
  const handleNavigate = (event, target) => {
    closeMenus()
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
        <a href="tel:09124283834" className="announcement-contact">
          <Icon name="phone" size={18} />
          <span>
            ارتباط با مدیر فروش: <bdi>۰۹۱۲۴۲۸۳۸۳۴</bdi>
          </span>
        </a>
      </div>

      <header className="header">
        <div className="header-utility">
          <div className="header-inner">
            <div className="header-actions">
              <button
                className="icon-button search-button"
                ref={searchButtonRef}
                aria-label="جست‌وجو"
                aria-expanded={searchOpen}
                aria-controls="header-search"
                onClick={() => setSearchOpen((open) => !open)}
              >
                <Icon name="search" />
              </button>
            </div>
          </div>
        </div>
        <div className="navigation-bar">
          <div className="navigation-inner">
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
              <span className="brand-name">حال نیکو سلامت</span>
            </a>
            <button
              className="icon-button mobile-menu-button"
              ref={mobileToggleRef}
              aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
              onClick={() => {
                setMenuOpen((open) => !open)
                setOpenPath([])
              }}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>

            <nav
              ref={navigationRef}
              id="main-navigation"
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse' && desktopNavigation()) setOpenPath([])
              }}
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget) &&
                  !mobileToggleRef.current?.contains(event.relatedTarget)
                )
                  closeMenus()
              }}
              className={`nav ${menuOpen ? 'is-open' : ''}`}
              aria-label="منوی اصلی"
            >
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.label}
                  item={item}
                  currentPath={currentPath}
                  navigate={handleNavigate}
                  openPath={openPath}
                  setOpenPath={setOpenPath}
                />
              ))}
            </nav>
          </div>
        </div>
        {searchOpen && (
          <HeaderSearch
            buttonRef={searchButtonRef}
            onClose={closeSearch}
            navigate={handleNavigate}
          />
        )}
      </header>
    </div>
  )
}
