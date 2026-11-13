import React, { lazy, Suspense, useEffect, useState } from 'react'
import { siteAdminRequest, siteMediaUrl, useSiteConfig, siteLink } from './SiteConfig.jsx'
import {
  textFields,
  imageFields,
  sectionCatalog,
  themeDefaults,
  footerMenuDefaults,
  linkFields,
} from './siteDefaults.js'
import { navigationItems } from '../../config/navigation.js'
import { heroSlides } from '../home/data/heroSlides.js'
import { request } from '../../services/api/client.js'
import { readImageFile } from '../../utils/files.js'

const RichArticleEditor = lazy(() => import('../../components/ui/RichArticleEditor.jsx'))
const clone = (value) => JSON.parse(JSON.stringify(value))
const menuData = (items) =>
  items.map(({ label, path, children, activePaths }) => ({
    label,
    path,
    ...(children ? { children: menuData(children) } : {}),
    ...(activePaths ? { activePaths } : {}),
  }))
const backupKey = 'niko_site_customizer_unsaved'
const id = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
const swap = (items, index, delta) => {
  const next = [...items]
  ;[next[index], next[index + delta]] = [next[index + delta], next[index]]
  return next
}

function OrderButtons({ index, count, move, remove }) {
  return (
    <div className="cms-order-buttons">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => move(-1)}
        aria-label="انتقال به بالا"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => move(1)}
        aria-label="انتقال به پایین"
      >
        ↓
      </button>
      <button type="button" className="cms-danger" onClick={remove}>
        حذف از نمایش
      </button>
    </div>
  )
}

function MenuEditor({ items, onChange, depth = 0 }) {
  const change = (index, value) => onChange(items.map((item, i) => (i === index ? value : item)))
  return (
    <div className="cms-menu-level">
      {items.map((item, index) => (
        <div className="cms-menu-item" key={index}>
          <div className="cms-fields-row">
            <label>
              نام پیوند
              <input
                value={item.label}
                onChange={(e) => change(index, { ...item, label: e.target.value })}
                maxLength={100}
              />
            </label>
            <label>
              نشانی پیوند
              <input
                dir="ltr"
                value={item.path}
                list="cms-page-paths"
                onChange={(e) => change(index, { ...item, path: e.target.value })}
                placeholder="/products"
              />
            </label>
          </div>
          <OrderButtons
            index={index}
            count={items.length}
            move={(delta) => onChange(swap(items, index, delta))}
            remove={() => onChange(items.filter((_, i) => i !== index))}
          />
          {depth < 2 && (
            <details>
              <summary>زیرمنو ({item.children?.length || 0})</summary>
              <MenuEditor
                items={item.children || []}
                depth={depth + 1}
                onChange={(children) => change(index, { ...item, children })}
              />
            </details>
          )}
        </div>
      ))}
      <button
        type="button"
        className="button outline"
        onClick={() => onChange([...items, { label: `پیوند ${items.length + 1}`, path: '/' }])}
        disabled={items.length >= 30}
      >
        افزودن {depth ? 'زیرمنو' : 'پیوند'}
      </button>
    </div>
  )
}

function ImageControl({
  value = {},
  onChange,
  onReset,
  media,
  upload,
  disabled,
  label = 'تصویر',
  allowWidth = true,
}) {
  const choose = (url) => onChange({ ...value, url })
  return (
    <div className="cms-image-control">
      {value.url && (
        <img src={siteMediaUrl(value.url)} alt="پیش‌نمایش تصویر انتخابی" loading="lazy" />
      )}
      <label>
        {label} — نشانی
        <input
          dir="ltr"
          value={value.url || ''}
          onChange={(e) => (e.target.value ? choose(e.target.value) : onReset?.())}
          placeholder="/uploads/... یا https://..."
        />
      </label>
      <label className="cms-upload">
        بارگذاری JPG، PNG یا WebP تا ۳ مگابایت
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={disabled}
          onChange={async (event) => {
            const input = event.currentTarget,
              file = input.files?.[0]
            if (file) {
              const item = await upload(file)
              if (item) choose(item.url)
            }
            input.value = ''
          }}
        />
      </label>
      <label>
        انتخاب از کتابخانه
        <select
          aria-label="انتخاب از کتابخانه"
          value=""
          onChange={(e) => e.target.value && choose(e.target.value)}
        >
          <option value="">انتخاب تصویر…</option>
          {media.map((item) => (
            <option value={item.url} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        توضیح تصویر (Alt)
        <input
          value={value.alt || ''}
          maxLength={300}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />
      </label>
      <div className="cms-fields-row">
        <label>
          نحوه نمایش
          <select
            aria-label="نحوه نمایش"
            value={value.fit || 'cover'}
            onChange={(e) => onChange({ ...value, fit: e.target.value })}
          >
            <option value="cover">پرکردن قاب</option>
            <option value="contain">نمایش کامل تصویر</option>
          </select>
        </label>
        {allowWidth && (
          <label>
            عرض تصویر: {value.width ?? 100}٪
            <input
              type="range"
              min="10"
              max="100"
              value={value.width ?? 100}
              onChange={(e) => onChange({ ...value, width: Number(e.target.value) })}
            />
          </label>
        )}
      </div>
      {onReset && (
        <button type="button" onClick={onReset}>
          برگشت به تصویر پیش‌فرض / حذف تصویر
        </button>
      )}
    </div>
  )
}

export default function SiteCustomizer({ token, showNotice, onDirtyChange }) {
  const site = useSiteConfig()
  const [server, setServer] = useState(null),
    [draft, setDraft] = useState({}),
    [legacy, setLegacy] = useState({})
  const [busy, setBusy] = useState(false),
    [uploadBusy, setUploadBusy] = useState(false),
    [pending, setPending] = useState({}),
    [dirty, setDirty] = useState(false)
  const [error, setError] = useState(''),
    [tab, setTab] = useState('content'),
    [search, setSearch] = useState(''),
    [group, setGroup] = useState(''),
    [field, setField] = useState('')
  const [page, setPage] = useState('home'),
    [selectedBlock, setSelectedBlock] = useState(''),
    [recovery, setRecovery] = useState(null)
  const [newSlug, setNewSlug] = useState(''),
    [newPageTitle, setNewPageTitle] = useState('')
  const [frame, setFrame] = useState(null)
  const allowLeave = React.useRef(false)
  const blocked = busy || uploadBusy || Object.values(pending).some(Boolean)
  const media = server?.media || []
  const apply = (next) => {
    setServer(next)
    setDraft(next.draft)
    setDirty(false)
    setError('')
    sessionStorage.removeItem(backupKey)
    setRecovery(null)
    return next
  }
  const load = async () => {
    setBusy(true)
    setError('')
    try {
      const [data, old] = await Promise.all([
        siteAdminRequest(token),
        request('/api/home-text').catch(() => ({})),
      ])
      if (!data?.draft || !data?.published)
        throw new Error('تنظیمات معتبر دریافت نشد؛ دوباره تلاش کنید.')
      let backup
      try {
        backup = JSON.parse(sessionStorage.getItem(backupKey) || 'null')
      } catch {}
      apply(data)
      setLegacy(old)
      if (backup) {
        sessionStorage.setItem(backupKey, JSON.stringify(backup))
        setRecovery(backup)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  useEffect(() => {
    load()
  }, [token])
  useEffect(() => {
    onDirtyChange?.(dirty)
    if (dirty && server) {
      try {
        sessionStorage.setItem(
          backupKey,
          JSON.stringify({ revision: server.revision, config: draft }),
        )
      } catch {}
    }
  }, [draft, dirty, server?.revision])
  useEffect(() => {
    if (!dirty) return
    const unload = (e) => {
      if (allowLeave.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    const leave = (e) => {
      const anchor = e.target.closest('a[href]')
      if (
        anchor &&
        !anchor.download &&
        !e.ctrlKey &&
        !e.metaKey &&
        !window.confirm('تغییرات ذخیره نشده‌اند؛ از این صفحه خارج می‌شوید؟')
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', unload)
    document.addEventListener('click', leave, true)
    return () => {
      window.removeEventListener('beforeunload', unload)
      document.removeEventListener('click', leave, true)
    }
  }, [dirty])
  const edit = (fn) => {
    setDraft((old) => fn(clone(old)))
    setDirty(true)
    setError('')
  }
  const setMap = (name, key, value) =>
    edit((next) => {
      next[name] ??= {}
      if (value === undefined) delete next[name][key]
      else next[name][key] = value
      return next
    })
  const setTheme = (key, value) =>
    edit((next) => {
      next.theme ??= {}
      next.theme[key] = value
      return next
    })
  const handle = async (fn) => {
    if (blocked) return
    setBusy(true)
    setError('')
    try {
      return await fn()
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setBusy(false)
    }
  }
  const save = async () =>
    apply(
      await siteAdminRequest(token, '', {
        method: 'PUT',
        body: JSON.stringify({ revision: server.revision, config: draft }),
      }),
    )
  const saveClick = () =>
    handle(async () => {
      await save()
      showNotice('پیش‌نویس ذخیره شد؛ هنوز برای بازدیدکننده‌ها منتشر نشده است.')
    })
  const publishClick = () =>
    handle(async () => {
      if (!window.confirm('این تغییرات برای همه بازدیدکننده‌ها منتشر شوند؟')) return
      const saved = dirty ? await save() : server
      const next = apply(
        await siteAdminRequest(token, '/publish', {
          method: 'POST',
          body: JSON.stringify({ revision: saved.revision }),
        }),
      )
      site.adoptPublished({ config: next.published, revision: next.published_revision })
      showNotice('تغییرات سایت منتشر شد.')
    })
  const preview = () =>
    handle(async () => {
      if (dirty) await save()
      onDirtyChange?.(false)
      allowLeave.current = true
      window.location.assign(
        `${page.startsWith('custom:') ? '/site/' + page.slice(7) : { home: '/', about: '/about', contact: '/contact' }[page] || '/'}?site-preview=1`,
      )
    })
  const upload = async (file) => {
    setUploadBusy(true)
    setError('')
    try {
      const image_data = await readImageFile(file)
      const item = await siteAdminRequest(token, '/media', {
        method: 'POST',
        body: JSON.stringify({ name: file.name, image_data }),
      })
      setServer((old) => ({ ...old, media: [item, ...(old.media || [])].slice(0, 100) }))
      return item
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setUploadBusy(false)
    }
  }
  const allFields = textFields.filter(
    (item) => !(draft.slides !== undefined && item.field.startsWith('home.hero.')),
  )
  const shown = allFields.filter(
    (item) =>
      (!group || item.group === group) &&
      (!search || `${item.label} ${item.value}`.includes(search)),
  )
  const selected = allFields.find((item) => item.field === field) || shown[0]
  const textValue = selected ? draft.texts?.[selected.field] || {} : {}
  const fallback = selected
    ? selected.field.startsWith('home.')
      ? (legacy[selected.field.slice(5)]?.text ?? selected.value)
      : selected.value
    : ''
  const writeText = (value) =>
    selected &&
    edit((next) => {
      next.texts ??= {}
      next.texts[selected.field] = { ...textValue, ...value }
      if (Object.hasOwn(value, 'text')) {
        for (const keys of [
          ['copy.header.1', 'copy.footer.14', 'copy.contactdetails.4'],
          ['copy.footer.15', 'copy.contactdetails.6'],
          ['copy.footer.16', 'copy.contactdetails.10'],
          ['copy.header.2', 'copy.footer.0'],
        ]) {
          if (keys.includes(selected.field))
            for (const key of keys) next.texts[key] = { ...next.texts[key], text: value.text }
        }
        if (['copy.header.1', 'copy.footer.14', 'copy.contactdetails.4'].includes(selected.field))
          delete next.links?.['contact.phone']
        if (['copy.footer.15', 'copy.contactdetails.6'].includes(selected.field))
          delete next.links?.['contact.email']
      }
      return next
    })
  const sections = page.startsWith('custom:')
    ? draft.pages?.[page.slice(7)]?.sections || []
    : (draft.layouts?.[page] ?? (sectionCatalog[page] || []).map(([key]) => key))
  const setSections = (nextConfig, items) => {
    if (page.startsWith('custom:')) nextConfig.pages[page.slice(7)].sections = items
    else {
      nextConfig.layouts ??= {}
      nextConfig.layouts[page] = items
    }
    return nextConfig
  }
  const sectionName = (key) =>
    (sectionCatalog[page] || []).find(([id]) => id === key)?.[1] ||
    draft.blocks?.[key]?.title ||
    key
  const addBlock = () =>
    edit((next) => {
      const key = id('block')
      next.blocks ??= {}
      next.blocks[key] = {
        title: 'بخش جدید',
        body: '<p>متن خود را اینجا بنویسید.</p>',
        layout: 'text',
      }
      setSelectedBlock(key)
      return setSections(next, [...sections, key])
    })
  const block = draft.blocks?.[selectedBlock]
  const slides =
    draft.slides ??
    heroSlides.map((slide, index) => ({
      id: `slide-${index}`,
      image: draft.images?.[`hero.${index}`]?.url || slide.image,
      title:
        draft.texts?.[`home.hero.${index}.title`]?.text ??
        legacy[`hero.${index}.title`]?.text ??
        slide.title,
      text:
        draft.texts?.[`home.hero.${index}.text`]?.text ??
        legacy[`hero.${index}.text`]?.text ??
        slide.text,
      action: draft.texts?.[`home.hero.${index}.action`]?.text ?? slide.action,
      path: slide.path,
      alt: slide.alt,
      layout: slide.layout,
      enabled: true,
    }))
  const changeSlide = (index, value) =>
    edit((next) => {
      next.slides = clone(slides)
      next.slides[index] = { ...next.slides[index], ...value }
      return next
    })
  const onBlockContent = React.useCallback(
    (body) => {
      setDraft((old) => {
        if (!old.blocks?.[selectedBlock] || old.blocks[selectedBlock].body === body) return old
        const next = clone(old)
        next.blocks[selectedBlock].body = body
        return next
      })
      setDirty(true)
    },
    [selectedBlock],
  )
  const devicePreview = (width) =>
    handle(async () => {
      const saved = dirty ? await save() : server
      const path = page.startsWith('custom:')
        ? '/site/' + page.slice(7)
        : { home: '/', about: '/about', contact: '/contact' }[page] || '/'
      setFrame({ width, url: `${path}?site-preview=1&revision=${saved.revision}` })
    })
  return (
    <section className="site-customizer" data-site-customizer>
      <datalist id="cms-page-paths">
        {[
          ['/', 'خانه'],
          ['/products', 'محصولات'],
          ['/mag/', 'مجله'],
          ['/solutions', 'راهکارها'],
          ['/about', 'درباره ما'],
          ['/contact', 'ارتباط با ما'],
          ...Object.entries(draft.pages || {}).map(([key, value]) => ['/site/' + key, value.title]),
        ].map(([path, label]) => (
          <option value={path} label={label} key={path} />
        ))}
      </datalist>
      <div className="cms-intro">
        <h2>مدیریت سایت و ظاهر</h2>
        <p>
          متن‌ها، تصاویر، منوها و چیدمان را بدون کدنویسی تغییر دهید. «ذخیره پیش‌نویس» سایت زنده را
          عوض نمی‌کند؛ «انتشار» تغییرات را برای همه نمایش می‌دهد.
        </p>
      </div>
      {error && (
        <div className="cms-error" role="alert">
          {error}
          <button
            type="button"
            disabled={blocked}
            onClick={() => {
              if (
                !dirty ||
                window.confirm(
                  'نسخه تازه دریافت شود؟ تغییرات محلی در نسخه پشتیبان مرورگر باقی می‌مانند.',
                )
              )
                load()
            }}
          >
            دریافت آخرین نسخه
          </button>
        </div>
      )}
      {!server ? (
        <p role="status">
          {busy ? 'در حال دریافت تنظیمات…' : 'دریافت تنظیمات انجام نشد؛ دوباره تلاش کنید.'}
        </p>
      ) : (
        <>
          {recovery && (
            <div className="cms-recovery">
              تغییرات ذخیره‌نشده در این مرورگر پیدا شد.{' '}
              {recovery.revision !== server.revision &&
                'این نوشته‌ها مربوط به نسخه قدیمی‌تری هستند.'}
              <button
                type="button"
                onClick={() => {
                  if (
                    recovery.revision === server.revision ||
                    window.confirm(
                      'نسخه محلی جای پیش‌نویس نمایش‌داده‌شده قرار گیرد؟ هنوز منتشر نخواهد شد.',
                    )
                  ) {
                    setDraft(recovery.config)
                    setDirty(true)
                    setRecovery(null)
                  }
                }}
              >
                بازیابی تغییرات محلی
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem(backupKey)
                  setRecovery(null)
                }}
              >
                کنار گذاشتن
              </button>
            </div>
          )}
          <div className="cms-toolbar">
            <button
              className="button primary"
              type="button"
              disabled={blocked || !dirty}
              onClick={saveClick}
            >
              ذخیره پیش‌نویس
            </button>
            <button className="button outline" type="button" disabled={blocked} onClick={preview}>
              پیش‌نمایش
            </button>
            <button
              className="button primary"
              type="button"
              disabled={blocked}
              onClick={publishClick}
            >
              انتشار تغییرات
            </button>
            <span role="status">
              {blocked ? 'در حال انجام…' : dirty ? 'تغییرات ذخیره نشده‌اند' : 'پیش‌نویس ذخیره است'}{' '}
              · نسخه {server.revision}
            </span>
          </div>
          <div className="cms-preview-actions">
            <button type="button" disabled={blocked} onClick={() => devicePreview(1200)}>
              نمایش دسکتاپ
            </button>
            <button type="button" disabled={blocked} onClick={() => devicePreview(768)}>
              نمایش تبلت
            </button>
            <button type="button" disabled={blocked} onClick={() => devicePreview(390)}>
              نمایش موبایل
            </button>
          </div>
          {frame && (
            <div className="cms-device-preview">
              <div>
                <strong>پیش‌نمایش خصوصی — عرض {frame.width} پیکسل</strong>
                <button type="button" onClick={() => setFrame(null)}>
                  بستن پیش‌نمایش
                </button>
              </div>
              <div className="cms-device-scroll">
                <iframe
                  key={frame.url + frame.width}
                  title="پیش‌نمایش سایت"
                  src={frame.url}
                  style={{ width: frame.width }}
                />
              </div>
            </div>
          )}
          <div className="cms-tabs" role="tablist">
            {[
              ['content', 'متن‌ها'],
              ['images', 'تصاویر'],
              ['slides', 'اسلایدها'],
              ['theme', 'رنگ و اندازه‌ها'],
              ['menus', 'منوها'],
              ['pages', 'صفحات و بخش‌ها'],
              ['media', 'کتابخانه رسانه'],
              ['history', 'نسخه‌های قبلی'],
            ].map(([key, label]) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={tab === key ? 'active' : ''}
                key={key}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <fieldset disabled={blocked} className="cms-panel">
            {tab === 'content' && (
              <>
                <div className="cms-fields-row">
                  <label>
                    جست‌وجوی متن
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setField('')
                      }}
                    />
                  </label>
                  <label>
                    بخش
                    <select
                      aria-label="بخش"
                      value={group}
                      onChange={(e) => {
                        setGroup(e.target.value)
                        setField('')
                      }}
                    >
                      <option value="">همه بخش‌ها</option>
                      {[...new Set(allFields.map((item) => item.group))].map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  انتخاب متن
                  <select
                    aria-label="انتخاب متن"
                    value={selected?.field || ''}
                    onChange={(e) => setField(e.target.value)}
                  >
                    {shown.map((item) => (
                      <option key={item.field} value={item.field}>
                        {item.group} —{' '}
                        {item.group === 'عنوان صفحات' ? item.value.slice(0, 60) : item.label}
                      </option>
                    ))}
                  </select>
                </label>
                {selected ? (
                  <>
                    <label>
                      متن
                      <textarea
                        aria-label="متن"
                        rows={5}
                        maxLength={12000}
                        value={textValue.text ?? fallback}
                        onChange={(e) => writeText({ text: e.target.value })}
                      />
                    </label>
                    <div className="cms-fields-row">
                      <label>
                        رنگ نوشته
                        <input
                          type="color"
                          value={textValue.color || '#3d3f44'}
                          onChange={(e) => writeText({ color: e.target.value })}
                        />
                      </label>
                      <label>
                        ضخامت
                        <select
                          aria-label="ضخامت"
                          value={textValue.weight || 'inherit'}
                          onChange={(e) => writeText({ weight: e.target.value })}
                        >
                          {[
                            ['inherit', 'پیش‌فرض'],
                            ['400', 'معمولی'],
                            ['500', 'متوسط'],
                            ['700', 'بولد'],
                            ['900', 'خیلی بولد'],
                          ].map(([value, label]) => (
                            <option value={value} key={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        فونت این نوشته
                        <select
                          aria-label="فونت این نوشته"
                          value={textValue.font || ''}
                          onChange={(e) => {
                            const value = { ...textValue }
                            if (e.target.value) value.font = e.target.value
                            else delete value.font
                            setMap('texts', selected.field, value)
                          }}
                        >
                          <option value="">پیش‌فرض سایت</option>
                          <option value="digikala">فونت فعلی سایت</option>
                          <option value="tahoma">Tahoma</option>
                          <option value="arial">Arial</option>
                        </select>
                      </label>
                      <label>
                        تراز
                        <select
                          aria-label="تراز"
                          value={textValue.align || 'inherit'}
                          onChange={(e) => writeText({ align: e.target.value })}
                        >
                          {[
                            ['inherit', 'پیش‌فرض'],
                            ['right', 'راست'],
                            ['center', 'وسط'],
                            ['left', 'چپ'],
                          ].map(([value, label]) => (
                            <option value={value} key={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="cms-fields-row">
                      {[
                        ['desktop', 'دسکتاپ'],
                        ['tablet', 'تبلت'],
                        ['mobile', 'موبایل'],
                      ].map(([key, label]) => (
                        <label key={key}>
                          اندازه {label} (px)
                          <input
                            type="number"
                            min="10"
                            max="80"
                            placeholder="پیش‌فرض"
                            value={textValue.sizes?.[key] ?? ''}
                            onChange={(e) => {
                              const sizes = { ...textValue.sizes }
                              if (e.target.value) sizes[key] = Number(e.target.value)
                              else delete sizes[key]
                              writeText({ sizes })
                            }}
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMap('texts', selected.field, undefined)}
                    >
                      برگرداندن این متن و ظاهرش به پیش‌فرض
                    </button>
                  </>
                ) : (
                  <p>متنی پیدا نشد.</p>
                )}
                <p className="cms-hint">
                  نوشته‌ای که داخل خودِ فایل عکس چاپ شده با ویرایش متن تغییر نمی‌کند؛ عکس را در بخش
                  تصاویر جایگزین کنید. متن، قیمت و تصویر محصولات و مقالات از بخش مربوط به خودشان
                  مدیریت می‌شود.
                </p>
              </>
            )}
            {tab === 'images' && (
              <>
                {imageFields
                  .filter(
                    (item) => !(draft.slides !== undefined && item.group === 'اسلایدهای فعلی'),
                  )
                  .map((item) => (
                    <details key={item.field}>
                      <summary>
                        {item.group} — {item.label}
                      </summary>
                      <ImageControl
                        value={draft.images?.[item.field] ?? { url: item.url }}
                        allowWidth={
                          !item.field.endsWith('.cover') &&
                          item.field !== 'about.photo' &&
                          !item.field.startsWith('hero.')
                        }
                        media={media}
                        upload={upload}
                        disabled={blocked}
                        onChange={(value) => setMap('images', item.field, value)}
                        onReset={() => setMap('images', item.field, undefined)}
                      />
                    </details>
                  ))}
              </>
            )}
            {tab === 'slides' && (
              <>
                <p>
                  اسلایدها را جابه‌جا، پنهان، حذف یا اضافه کنید. پوستر نوشته‌دار با «حالت پوستر»
                  نمایش داده می‌شود؛ نوشته‌های چاپ‌شده در آن قابل ویرایش نیستند.
                </p>
                {slides.map((slide, index) => (
                  <details key={slide.id}>
                    <summary>
                      {index + 1}. {slide.title || 'اسلاید بی‌عنوان'}
                      {slide.enabled === false ? ' (پنهان)' : ''}
                    </summary>
                    <OrderButtons
                      index={index}
                      count={slides.length}
                      move={(delta) =>
                        edit((next) => ({ ...next, slides: swap(slides, index, delta) }))
                      }
                      remove={() =>
                        edit((next) => ({ ...next, slides: slides.filter((_, i) => i !== index) }))
                      }
                    />
                    <label className="cms-checkbox">
                      <input
                        type="checkbox"
                        checked={slide.enabled !== false}
                        onChange={(e) => changeSlide(index, { enabled: e.target.checked })}
                      />
                      نمایش اسلاید
                    </label>
                    <label>
                      عنوان
                      <input
                        value={slide.title}
                        maxLength={300}
                        onChange={(e) => changeSlide(index, { title: e.target.value })}
                      />
                    </label>
                    <label>
                      توضیح
                      <textarea
                        aria-label="توضیح"
                        value={slide.text}
                        onChange={(e) => changeSlide(index, { text: e.target.value })}
                      />
                    </label>
                    <div className="cms-fields-row">
                      <label>
                        متن دکمه
                        <input
                          value={slide.action}
                          maxLength={100}
                          onChange={(e) => changeSlide(index, { action: e.target.value })}
                        />
                      </label>
                      <label>
                        لینک دکمه
                        <input
                          dir="ltr"
                          value={slide.path}
                          onChange={(e) => changeSlide(index, { path: e.target.value })}
                        />
                      </label>
                    </div>
                    <label>
                      حالت نمایش
                      <select
                        aria-label="حالت نمایش"
                        value={slide.layout}
                        onChange={(e) => changeSlide(index, { layout: e.target.value })}
                      >
                        <option value="panoramic">تصویر با متن روی آن</option>
                        <option value="poster">پوستر کامل</option>
                      </select>
                    </label>
                    <ImageControl
                      value={{
                        url: slide.image,
                        alt: slide.alt || '',
                        fit: slide.fit || (slide.layout === 'poster' ? 'contain' : 'cover'),
                      }}
                      allowWidth={false}
                      onChange={(image) =>
                        changeSlide(index, {
                          image: image.url,
                          alt: image.alt || '',
                          fit: image.fit || 'cover',
                        })
                      }
                      media={media}
                      upload={upload}
                      disabled={blocked}
                    />
                  </details>
                ))}
                <button
                  className="button outline"
                  type="button"
                  disabled={slides.length >= 30}
                  onClick={() =>
                    edit((next) => ({
                      ...next,
                      slides: [
                        ...slides,
                        {
                          id: id('slide'),
                          title: 'اسلاید جدید',
                          text: '',
                          action: 'بیشتر بخوانید',
                          path: '/about',
                          image: '/images/slides/hns-sunlit-farm.webp',
                          layout: 'panoramic',
                          enabled: true,
                        },
                      ],
                    }))
                  }
                >
                  افزودن اسلاید
                </button>
              </>
            )}
            {tab === 'theme' && (
              <>
                <h3>رنگ‌های سایت</h3>
                <div className="cms-color-grid">
                  {Object.entries({
                    primary: 'رنگ اصلی',
                    primaryDark: 'رنگ اصلی تیره',
                    background: 'پس‌زمینه',
                    paper: 'کارت‌ها',
                    text: 'نوشته‌ها',
                    muted: 'نوشته کم‌رنگ',
                    line: 'خط‌ها',
                    header: 'منوی بالا',
                    footer: 'فوتر',
                    navigationText: 'نوشته‌های منو',
                  }).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        type="color"
                        value={draft.theme?.[key] ?? themeDefaults[key]}
                        onChange={(e) => setTheme(key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <label>
                  فونت سایت
                  <select
                    aria-label="فونت سایت"
                    value={draft.theme?.font ?? 'digikala'}
                    onChange={(e) => setTheme('font', e.target.value)}
                  >
                    <option value="digikala">فونت فعلی سایت</option>
                    <option value="tahoma">Tahoma</option>
                    <option value="arial">Arial</option>
                  </select>
                </label>
                {['heading', 'body', 'cards', 'navigation'].map((type) => (
                  <div key={type}>
                    <h3>
                      {type === 'heading'
                        ? 'اندازه تیترها'
                        : type === 'body'
                          ? 'اندازه متن پاراگراف‌ها'
                          : type === 'cards'
                            ? 'اندازه نام محصولات'
                            : 'اندازه نوشته منوها'}
                    </h3>
                    <div className="cms-fields-row">
                      {[
                        ['desktop', 'دسکتاپ'],
                        ['tablet', 'تبلت'],
                        ['mobile', 'موبایل'],
                      ].map(([key, label]) => (
                        <label key={key}>
                          {label} (px)
                          <input
                            type="number"
                            min="10"
                            max="80"
                            value={draft.theme?.[type]?.[key] ?? themeDefaults[type][key]}
                            onChange={(e) =>
                              setTheme(type, {
                                ...themeDefaults[type],
                                ...draft.theme?.[type],
                                [key]: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="cms-fields-row">
                  <label>
                    گردی گوشه‌ها (px)
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={draft.theme?.radius ?? 8}
                      onChange={(e) => setTheme('radius', Number(e.target.value))}
                    />
                  </label>
                  <label>
                    حداکثر عرض محتوا (px)
                    <input
                      type="number"
                      min="960"
                      max="1600"
                      value={draft.theme?.contentWidth ?? 1240}
                      onChange={(e) => setTheme('contentWidth', Number(e.target.value))}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    edit((next) => {
                      delete next.theme
                      return next
                    })
                  }
                >
                  بازگرداندن ظاهر پیش‌فرض
                </button>
                <p className="cms-hint">
                  برای نوشته‌های داخل کارت‌ها می‌توانید از بخش متن‌ها اندازه جداگانه تعیین کنید. پیش
                  از انتشار، پیش‌نمایش موبایل را هم بررسی کنید.
                </p>
              </>
            )}
            {tab === 'menus' && (
              <>
                <h3>نوار منوی اصلی و زیرمنوها</h3>
                <MenuEditor
                  items={draft.navigation ?? navigationItems}
                  onChange={(items) => edit((next) => ({ ...next, navigation: menuData(items) }))}
                />
                <button
                  type="button"
                  onClick={() =>
                    edit((next) => {
                      delete next.navigation
                      return next
                    })
                  }
                >
                  بازگرداندن منوی پیش‌فرض
                </button>
                {Object.entries(footerMenuDefaults).map(([key, items]) => (
                  <details key={key}>
                    <summary>منوی فوتر — {key === 'solutions' ? 'راهکارها' : 'راهنما'}</summary>
                    <MenuEditor
                      items={draft.footerMenus?.[key] ?? items}
                      onChange={(items) => setMap('footerMenus', key, items)}
                    />
                  </details>
                ))}
                <details>
                  <summary>لینک‌های تماس، شبکه‌ها و ویدیو</summary>
                  {linkFields.map(([key, label, value]) => (
                    <label key={key}>
                      {label}
                      <input
                        dir="ltr"
                        value={siteLink(draft, key, value)}
                        onChange={(e) => setMap('links', key, e.target.value || undefined)}
                      />
                    </label>
                  ))}
                </details>
                <p className="cms-hint">
                  نشانی داخلی مثل /contact یا /site/my-page وارد کنید. لینک بیرونی باید با https://
                  شروع شود. نام‌های هم‌سطح نباید تکراری باشند.
                </p>
              </>
            )}
            {tab === 'pages' && (
              <>
                <label>
                  صفحه
                  <select
                    aria-label="صفحه"
                    value={page}
                    onChange={(e) => {
                      setPage(e.target.value)
                      setSelectedBlock('')
                    }}
                  >
                    {[
                      ['home', 'خانه'],
                      ['about', 'درباره ما'],
                      ['contact', 'ارتباط با ما'],
                    ].map(([key, label]) => (
                      <option value={key} key={key}>
                        {label}
                      </option>
                    ))}
                    {Object.entries(draft.pages || {}).map(([key, value]) => (
                      <option key={key} value={`custom:${key}`}>
                        {value.title} — /site/{key}
                      </option>
                    ))}
                  </select>
                </label>
                {page.startsWith('custom:') && draft.pages?.[page.slice(7)] && (
                  <>
                    <label>
                      عنوان صفحه
                      <input
                        value={draft.pages[page.slice(7)].title}
                        onChange={(e) =>
                          setMap('pages', page.slice(7), {
                            ...draft.pages[page.slice(7)],
                            title: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      توضیح صفحه
                      <textarea
                        aria-label="توضیح صفحه"
                        value={draft.pages[page.slice(7)].description || ''}
                        onChange={(e) =>
                          setMap('pages', page.slice(7), {
                            ...draft.pages[page.slice(7)],
                            description: e.target.value,
                          })
                        }
                      />
                    </label>
                    <p dir="ltr">/site/{page.slice(7)}</p>
                    <button
                      type="button"
                      className="cms-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            'این صفحه از پیش‌نویس حذف شود؟ لینک‌های منو را هم بررسی کنید.',
                          )
                        ) {
                          setMap('pages', page.slice(7), undefined)
                          setPage('home')
                        }
                      }}
                    >
                      حذف صفحه از پیش‌نویس
                    </button>
                  </>
                )}
                <h3>بخش‌های صفحه؛ از بالا به پایین</h3>
                {sections.map((key, index) => (
                  <div className="cms-section-row" key={key}>
                    <strong>{sectionName(key)}</strong>
                    <OrderButtons
                      index={index}
                      count={sections.length}
                      move={(delta) =>
                        edit((next) => setSections(next, swap(sections, index, delta)))
                      }
                      remove={() =>
                        edit((next) =>
                          setSections(
                            next,
                            sections.filter((item) => item !== key),
                          ),
                        )
                      }
                    />
                    {draft.blocks?.[key] && (
                      <button type="button" onClick={() => setSelectedBlock(key)}>
                        ویرایش بخش
                      </button>
                    )}
                  </div>
                ))}
                <div className="cms-fields-row">
                  <button className="button outline" type="button" onClick={addBlock}>
                    افزودن بخش جدید
                  </button>
                  <label>
                    بازگرداندن / افزودن بخش موجود
                    <select
                      aria-label="بازگرداندن / افزودن بخش موجود"
                      value=""
                      onChange={(e) =>
                        e.target.value &&
                        edit((next) => setSections(next, [...sections, e.target.value]))
                      }
                    >
                      <option value="">انتخاب بخش…</option>
                      {[
                        ...(sectionCatalog[page] || []),
                        ...Object.entries(draft.blocks || {}).map(([key, value]) => [
                          key,
                          value.title || key,
                        ]),
                      ]
                        .filter(([key]) => !sections.includes(key))
                        .map(([key, label]) => (
                          <option value={key} key={key}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                {block && (
                  <div className="cms-block-editor">
                    <h3>ویرایش بخش: {block.title}</h3>
                    <label>
                      عنوان
                      <input
                        value={block.title || ''}
                        onChange={(e) =>
                          setMap('blocks', selectedBlock, { ...block, title: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      چیدمان
                      <select
                        aria-label="چیدمان"
                        value={block.layout || 'text'}
                        onChange={(e) =>
                          setMap('blocks', selectedBlock, { ...block, layout: e.target.value })
                        }
                      >
                        <option value="text">متن</option>
                        <option value="image">تصویر و متن زیر آن</option>
                        <option value="split">متن و تصویر کنار هم</option>
                      </select>
                    </label>
                    <Suspense fallback={<p>دریافت ویرایشگر…</p>}>
                      <RichArticleEditor
                        key={selectedBlock}
                        token={token}
                        initialValue={block.body || ''}
                        disabled={busy}
                        onPending={(value) =>
                          setPending((old) => ({ ...old, [selectedBlock]: value }))
                        }
                        onContentChange={onBlockContent}
                      />
                    </Suspense>
                    <ImageControl
                      value={{ url: block.image || '', alt: block.alt || '' }}
                      media={media}
                      upload={upload}
                      disabled={blocked}
                      onChange={(image) =>
                        setMap('blocks', selectedBlock, {
                          ...block,
                          image: image.url,
                          alt: image.alt || '',
                        })
                      }
                      onReset={() => {
                        const next = { ...block }
                        delete next.image
                        setMap('blocks', selectedBlock, next)
                      }}
                    />
                    <div className="cms-fields-row">
                      <label>
                        متن دکمه
                        <input
                          value={block.action || ''}
                          onChange={(e) =>
                            setMap('blocks', selectedBlock, { ...block, action: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        نشانی دکمه
                        <input
                          dir="ltr"
                          value={block.path || ''}
                          onChange={(e) => {
                            const next = { ...block }
                            if (e.target.value) next.path = e.target.value
                            else delete next.path
                            setMap('blocks', selectedBlock, next)
                          }}
                        />
                      </label>
                      <label>
                        پس‌زمینه
                        <input
                          type="color"
                          value={block.background || '#ffffff'}
                          onChange={(e) =>
                            setMap('blocks', selectedBlock, {
                              ...block,
                              background: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}
                <details>
                  <summary>ساخت صفحه جدید</summary>
                  <div className="cms-fields-row">
                    <label>
                      عنوان
                      <input
                        value={newPageTitle}
                        onChange={(e) => setNewPageTitle(e.target.value)}
                        maxLength={300}
                      />
                    </label>
                    <label>
                      نام انگلیسی در نشانی
                      <input
                        dir="ltr"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                        placeholder="my-page"
                      />
                    </label>
                  </div>
                  <button
                    className="button outline"
                    type="button"
                    onClick={() => {
                      if (
                        !/^[a-z0-9][a-z0-9-]{1,79}$/.test(newSlug) ||
                        !newPageTitle.trim() ||
                        draft.pages?.[newSlug]
                      ) {
                        setError('نام انگلیسی یکتا با حداقل دو حرف و عنوان صفحه وارد کنید.')
                        return
                      }
                      setMap('pages', newSlug, {
                        title: newPageTitle.trim(),
                        description: '',
                        sections: [],
                      })
                      setPage('custom:' + newSlug)
                      setNewSlug('')
                      setNewPageTitle('')
                    }}
                  >
                    ساخت صفحه
                  </button>
                  <p>
                    نشانی صفحه /site/نام-انگلیسی خواهد بود. پس از انتشار می‌توانید آن را به منو
                    اضافه کنید.
                  </p>
                </details>
              </>
            )}
            {tab === 'media' && (
              <>
                <p>
                  ۱۰۰ تصویر بارگذاری‌شدهٔ آخر. برای حفظ نسخه‌های قبلی، جایگزینی تصویر، فایل قدیمی را
                  پاک نمی‌کند.
                </p>
                <label>
                  بارگذاری تصویر
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={blocked}
                    onChange={async (e) => {
                      const input = e.currentTarget
                      if (input.files[0]) await upload(input.files[0])
                      input.value = ''
                    }}
                  />
                </label>
                <div className="cms-media-grid">
                  {media.map((item) => (
                    <article key={item.id}>
                      <img src={siteMediaUrl(item.url)} alt={item.name} loading="lazy" />
                      <strong>{item.name}</strong>
                      <input
                        aria-label={`نشانی ${item.name}`}
                        dir="ltr"
                        value={item.url}
                        readOnly
                        onFocus={(e) => e.target.select()}
                      />
                    </article>
                  ))}
                </div>
              </>
            )}
            {tab === 'history' && (
              <>
                <p>
                  ۲۰ نسخهٔ منتشرشدهٔ آخر نگه داشته می‌شوند. بازیابی فقط پیش‌نویس را عوض می‌کند؛
                  انتشار نیاز به تأیید جداگانه دارد.
                </p>
                {server.history.map((item) => (
                  <div className="cms-section-row" key={item.id}>
                    <span>
                      نسخه {item.id} ·{' '}
                      {new Date(item.created_at.replace(' ', 'T') + 'Z').toLocaleString('fa-IR', {
                        timeZone: 'Asia/Tehran',
                      })}
                    </span>
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() =>
                        handle(async () => {
                          if (
                            !window.confirm(
                              'این نسخه به پیش‌نویس برگردد؟ تغییرات ذخیره‌نشده کنار گذاشته می‌شوند.',
                            )
                          )
                            return
                          apply(
                            await siteAdminRequest(token, '/restore', {
                              method: 'POST',
                              body: JSON.stringify({
                                revision: server.revision,
                                history_id: item.id,
                              }),
                            }),
                          )
                          showNotice(
                            'نسخه به پیش‌نویس برگشت؛ پیش‌نمایش را ببینید و در صورت تأیید منتشر کنید.',
                          )
                        })
                      }
                    >
                      بازیابی در پیش‌نویس
                    </button>
                  </div>
                ))}
              </>
            )}
          </fieldset>
        </>
      )}
    </section>
  )
}
