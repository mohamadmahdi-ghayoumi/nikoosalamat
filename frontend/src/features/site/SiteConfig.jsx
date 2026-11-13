import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { request, resolveMediaUrl } from '../../services/api/client.js'
import { articleHTML } from '../../utils/articleContent.js'
import { ADMIN_PATH } from '../../app/adminRoute.js'

const Context = createContext({ config: {}, revision: 0, ready: false, preview: false })
export const useSiteConfig = () => useContext(Context)
export const siteMediaUrl = (url) => (url?.startsWith('/uploads/') ? resolveMediaUrl(url) : url)
export function siteLink(config, key, fallback) {
  if (config.links?.[key] !== undefined) return config.links[key]
  if (key === 'contact.phone') {
    const text = config.texts?.['copy.contactdetails.4']?.text
    if (text) {
      const phone = text.replace(/[۰-۹]/g, (x) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(x)).replace(/[^+0-9]/g, '')
      if (phone) return `tel:${phone}`
    }
  }
  if (key === 'contact.email') {
    const email = config.texts?.['copy.contactdetails.6']?.text?.trim()
    if (email && /^[\w.+%-]+@[\w.-]+\.[a-z]{2,}$/i.test(email)) return `mailto:${email}`
  }
  return fallback
}
export const siteAdminRequest = (token, suffix = '', options = {}) =>
  request(`/api/admin/site-config${suffix}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  })

function themeCSS(theme = {}) {
  const colors = {
    primary: '--wine',
    primaryDark: '--wine-dark',
    background: '--cream',
    paper: '--paper',
    text: '--ink',
    muted: '--muted',
    line: '--line',
  }
  const declarations = Object.entries(colors)
    .filter(([key]) => theme[key])
    .map(([key, name]) => `${name}:${theme[key]};`)
    .join('')
  const fonts = {
    digikala: "'Digikala',Tahoma,Arial,sans-serif",
    tahoma: 'Tahoma,Arial,sans-serif',
    arial: 'Arial,Tahoma,sans-serif',
  }
  let css = `.site-customized{${declarations}${theme.text ? `color:${theme.text};` : ''}${theme.font ? `font-family:${fonts[theme.font]};--font-family:${fonts[theme.font]};` : ''}}`
  if (theme.primary) css += `.site-customized .announcement{background:${theme.primary}}`
  if (theme.header) css += `.site-customized .navigation-bar{background:${theme.header}}`
  if (theme.footer) css += `.site-customized .footer{background:${theme.footer}}`
  if (theme.navigationText)
    css += `.site-customized .nav-link,.site-customized .submenu-toggle{color:${theme.navigationText}}`
  if (theme.radius !== undefined)
    css += `.site-customized :is(.button,.product-card,.category-card,.contact-form,.values-grid article,.pharmucare-brand){border-radius:${theme.radius}px!important}`
  if (theme.contentWidth)
    css += `.site-customized :is(.section,.footer-main,.navigation-inner){max-width:${theme.contentWidth}px}`
  for (const [device, query, fallback] of [
    ['desktop', '', 37],
    ['tablet', '@media(max-width:1100px)', 22],
    ['mobile', '@media(max-width:560px)', 18],
  ]) {
    let rules = ''
    if (Object.keys(theme.heading || {}).length)
      rules += `.site-customized{--heading-size:${theme.heading[device] ?? fallback}px}`
    if (Object.keys(theme.body || {}).length)
      rules += `.site-customized p{font-size:${theme.body[device] ?? { desktop: 14, tablet: 13, mobile: 12 }[device]}px}`
    if (Object.keys(theme.cards || {}).length)
      rules += `.site-customized .product-card{--heading-size:${theme.cards[device] ?? { desktop: 18, tablet: 16, mobile: 13 }[device]}px}`
    if (Object.keys(theme.navigation || {}).length)
      rules += `.site-customized .nav-link{font-size:${theme.navigation[device] ?? { desktop: 14, tablet: 13, mobile: 13 }[device]}px}`
    css += query ? `${query}{${rules}}` : rules
  }
  return css
}

export default function SiteConfigProvider({ children }) {
  const [value, setValue] = useState({ config: {}, revision: 0 })
  const [ready, setReady] = useState(false)
  const [preview, setPreview] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const isRequested = new URLSearchParams(window.location.search).get('site-preview') === '1'
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const published = await request('/api/site-config')
        if (
          !published?.config ||
          typeof published.config !== 'object' ||
          Array.isArray(published.config)
        )
          throw new Error('تنظیمات دریافت نشد')
        if (active) setValue(published)
        if (isRequested) {
          const token = sessionStorage.getItem('sovara_admin_token')
          if (!token) throw new Error('برای پیش‌نمایش ابتدا وارد پنل شوید.')
          const draft = await siteAdminRequest(token)
          if (active) {
            setValue({ config: draft.draft, revision: draft.published_revision })
            setPreview(true)
          }
        }
      } catch (error) {
        if (active && isRequested)
          setPreviewError('پیش‌نمایش در دسترس نیست؛ وارد پنل شوید و دوباره تلاش کنید.')
      } finally {
        if (active) setReady(true)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [isRequested])
  const publishText = async (field, text, revision) => {
    const saved = await siteAdminRequest(
      sessionStorage.getItem('sovara_admin_token') || '',
      `/text/${field}`,
      { method: 'PUT', body: JSON.stringify({ text, revision }) },
    )
    setValue(saved)
    return saved
  }
  const refresh = async () => {
    const next = await request('/api/site-config')
    if (!next?.config || typeof next.revision !== 'number')
      throw new Error('تنظیمات دریافت نشد؛ دوباره تلاش کنید.')
    setValue(next)
    return next
  }
  useEffect(() => {
    if (isRequested) return
    const check = () =>
      request('/api/site-config')
        .then((next) => {
          if (next?.config && typeof next.revision === 'number')
            setValue((old) => (old.revision === next.revision ? old : next))
        })
        .catch(() => {})
    window.addEventListener('focus', check)
    return () => window.removeEventListener('focus', check)
  }, [isRequested])
  const adoptPublished = (next) => setValue(next)
  const context = useMemo(
    () => ({ ...value, ready, preview, publishText, refresh, adoptPublished }),
    [value, ready, preview],
  )
  return (
    <Context.Provider value={context}>
      <style>{themeCSS(value.config?.theme)}</style>
      {(preview || previewError) && (
        <aside className="site-preview-bar" role="status">
          <span>
            {preview
              ? 'پیش‌نمایش خصوصی پیش‌نویس — هنوز برای بازدیدکننده‌ها منتشر نشده'
              : previewError}
          </span>
          <a href={ADMIN_PATH}>بازگشت به پنل</a>
          <a href={window.location.pathname}>نمایش نسخه منتشرشده</a>
        </aside>
      )}
      {children}
    </Context.Provider>
  )
}

export function SiteText({ field, children }) {
  const { config } = useSiteConfig()
  const item = config.texts?.[field]
  if (!item) return <>{children}</>
  let text = item.text ?? children
  if (typeof children === 'string' && typeof text === 'string') {
    if (children.startsWith(' ') && !text.startsWith(' ')) text = ' ' + text
    if (children.endsWith(' ') && !text.endsWith(' ')) text += ' '
  }
  const style = {
    fontFamily: item.font
      ? {
          digikala: "'Digikala',Tahoma,Arial,sans-serif",
          tahoma: 'Tahoma,Arial,sans-serif',
          arial: 'Arial,Tahoma,sans-serif',
        }[item.font]
      : undefined,
    color: item.color,
    fontWeight: item.weight,
    textAlign: item.align,
    ...(item.align && item.align !== 'inherit' ? { display: 'block', width: '100%' } : {}),
  }
  for (const [device, size] of Object.entries(item.sizes || {}))
    style[`--site-text-${device}`] = `${size}px`
  return (
    <span className="site-config-text" style={style}>
      {text}
    </span>
  )
}

export function SiteImage({ field, ...props }) {
  const { config } = useSiteConfig()
  const image = config.images?.[field]
  return (
    <img
      {...props}
      src={siteMediaUrl(image?.url ?? props.src)}
      alt={image?.alt ?? props.alt ?? ''}
      style={{
        ...props.style,
        ...(image?.fit ? { objectFit: image.fit } : {}),
        ...(image?.width ? { width: `${image.width}%`, height: 'auto', marginInline: 'auto' } : {}),
      }}
    />
  )
}

export function SiteSections({ page, builtins = {}, navigate, sections }) {
  const { config } = useSiteConfig()
  const order = sections ?? config.layouts?.[page] ?? Object.keys(builtins)
  return order.map((id) => {
    if (builtins[id]) return <React.Fragment key={id}>{builtins[id]}</React.Fragment>
    const block = config.blocks?.[id]
    if (!block) return null
    return (
      <section
        key={id}
        id={id}
        className={`section cms-block cms-block--${block.layout || 'text'}`}
        style={block.background ? { background: block.background } : undefined}
      >
        <div>
          {block.title && <h2>{block.title}</h2>}
          {block.body && (
            <div
              className="article-rich-text"
              dangerouslySetInnerHTML={{ __html: articleHTML(block.body) }}
            />
          )}
          {block.action && block.path && (
            <a
              className="button primary"
              href={block.path}
              onClick={(event) => navigate(event, block.path)}
            >
              {block.action}
            </a>
          )}
        </div>
        {block.image && (
          <img src={siteMediaUrl(block.image)} alt={block.alt || ''} loading="lazy" />
        )}
      </section>
    )
  })
}

export function FooterLinks({ name, navigate, children }) {
  const { config } = useSiteConfig()
  const items = config.footerMenus?.[name]
  const render = (nodes) =>
    nodes.map((item, index) => (
      <React.Fragment key={`${item.label}-${index}`}>
        <a href={item.path} onClick={(event) => navigate(event, item.path)}>
          {item.label}
        </a>
        {item.children?.length ? render(item.children) : null}
      </React.Fragment>
    ))
  return items === undefined ? children : render(items)
}
