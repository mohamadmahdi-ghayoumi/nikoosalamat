import { useEffect, useState } from 'react'
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  getAdminPages,
  getAdminArticles,
  createAdminProduct,
  deleteAdminProduct,
  updateProductCatalog,
  updateAdminPage,
  createAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
} from '../../../services/api/admin.js'
import { getProducts } from '../../../services/api/products.js'
import { readImageFile } from '../../../utils/files.js'

export default function useAdminController(showNotice) {
  const [token, setToken] = useState(
    () => window.sessionStorage.getItem('sovara_admin_token') || '',
  )
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(Boolean(token))
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [pages, setPages] = useState([])
  const [articles, setArticles] = useState([])
  const [editingArticle, setEditingArticle] = useState(null)
  const [editingCatalog, setEditingCatalog] = useState(null)

  const loadAdminData = async (activeToken = token) => {
    const [nextProducts, nextPages, nextArticles] = await Promise.all([
      getProducts(),
      getAdminPages(activeToken),
      getAdminArticles(activeToken),
    ])
    setProducts(nextProducts)
    setPages(nextPages)
    setArticles(nextArticles)
  }

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }
    let active = true
    getAdminProfile(token)
      .then((profile) => {
        if (!active) return
        setAdmin(profile)
        return loadAdminData(token)
      })
      .catch((error) => {
        if (!active) return
        // Only an expired/invalid session should clear the stored login.
        // Network failures (including an interrupted reload) are not logout.
        if (error.status === 401) {
          window.sessionStorage.removeItem('sovara_admin_token')
          setToken('')
          setAdmin(null)
        } else {
          showNotice('بررسی دسترسی انجام نشد؛ اتصال را بررسی و صفحه را دوباره بارگذاری کنید.')
        }
      })
      .finally(() => {
        if (active) setChecking(false)
      })
    return () => {
      active = false
    }
  }, [token])

  const login = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      const session = await adminLogin(Object.fromEntries(new FormData(event.currentTarget)))
      window.sessionStorage.setItem('sovara_admin_token', session.token)
      setToken(session.token)
      setAdmin({ username: session.username })
      showNotice('با موفقیت وارد شدید')
    } catch (error) {
      showNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  const logout = () => {
    if (token) adminLogout(token).catch(() => {})
    window.sessionStorage.removeItem('sovara_admin_token')
    setToken('')
    setAdmin(null)
    setProducts([])
    setPages([])
    setArticles([])
    setEditingCatalog(null)
  }

  const createProduct = async (event) => {
    event.preventDefault()
    setBusy(true)
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      await createAdminProduct(token, {
        slug: String(data.get('slug')).trim().toLowerCase(),
        name: String(data.get('name')).trim(),
        category: String(data.get('category')).trim(),
        price: Number(data.get('price')),
        tone: data.get('tone'),
        shape: data.get('shape'),
        badge: String(data.get('badge') || '').trim() || null,
        featured: data.get('featured') === 'on',
        image_data: await readImageFile(data.get('image')),
      })
      form.reset()
      await loadAdminData()
      showNotice('محصول با موفقیت ثبت شد')
    } catch (error) {
      showNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  const removeProduct = async (product) => {
    if (!window.confirm(`محصول «${product.name}» حذف شود؟`)) return
    try {
      await deleteAdminProduct(token, product.id)
      setProducts((items) => items.filter((item) => item.id !== product.id))
      showNotice('محصول حذف شد')
    } catch (error) {
      showNotice(error.message)
    }
    if (editingCatalog?.id === product.id) setEditingCatalog(null)
  }

  const saveCatalog = async (event, product) => {
    event.preventDefault()
    setBusy(true)
    const data = new FormData(event.currentTarget)
    try {
      const files = data
        .getAll('gallery_images')
        .filter((file) => file instanceof File && file.size > 0)
      const retained = data.getAll('gallery')
      if (retained.length + files.length > 5)
        throw new Error('حداکثر ۵ تصویر برای گالری انتخاب کنید')
      if (files.reduce((total, file) => total + file.size, 0) > 5 * 1024 * 1024)
        throw new Error('حجم مجموع تصاویر جدید حداکثر ۵ مگابایت باشد')
      const features = String(data.get('features') || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      if (features.length > 20 || features.some((line) => line.length > 1000))
        throw new Error('حداکثر ۲۰ ویژگی، هر مورد تا ۱۰۰۰ حرف ثبت کنید')
      const updated = await updateProductCatalog(token, product.id, {
        summary: String(data.get('summary') || '').trim(),
        description: String(data.get('description') || '').trim(),
        features,
        usage: String(data.get('usage') || '').trim(),
        gallery: retained,
        gallery_data: await Promise.all(files.map(readImageFile)),
      })
      setProducts((items) => items.map((item) => (item.id === updated.id ? updated : item)))
      setEditingCatalog(null)
      showNotice('کاتالوگ محصول ذخیره شد')
    } catch (error) {
      showNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  const savePage = async (event, page) => {
    event.preventDefault()
    setBusy(true)
    const data = new FormData(event.currentTarget)
    try {
      const updated = await updateAdminPage(token, page.id, {
        eyebrow: String(data.get('eyebrow')).trim(),
        title: String(data.get('title')).trim(),
        summary: String(data.get('summary')).trim(),
        body: String(data.get('body')).trim(),
        published: data.get('published') === 'on',
        image_data: await readImageFile(data.get('image')),
        remove_image: data.get('remove_image') === 'on',
      })
      setPages((items) => items.map((item) => (item.id === updated.id ? updated : item)))
      showNotice('صفحه با موفقیت به‌روزرسانی شد')
    } catch (error) {
      showNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  const saveArticle = async (event) => {
    event.preventDefault()
    setBusy(true)
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      const payload = {
        slug: String(data.get('slug')).trim().toLowerCase(),
        title: String(data.get('title')).trim(),
        excerpt: String(data.get('excerpt')).trim(),
        body: String(data.get('body')).trim(),
        published: data.get('published') === 'on',
        image_data: await readImageFile(data.get('image')),
        remove_image: data.get('remove_image') === 'on',
      }
      if (editingArticle) await updateAdminArticle(token, editingArticle.id, payload)
      else await createAdminArticle(token, payload)
      setEditingArticle(null)
      form.reset()
      await loadAdminData()
      showNotice(editingArticle ? 'مقاله ویرایش شد' : 'مقاله منتشر شد')
    } catch (error) {
      showNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  const removeArticle = async (article) => {
    if (!window.confirm(`مقاله «${article.title}» حذف شود؟`)) return
    try {
      await deleteAdminArticle(token, article.id)
      setArticles((items) => items.filter((item) => item.id !== article.id))
      if (editingArticle?.id === article.id) setEditingArticle(null)
      showNotice('مقاله حذف شد')
    } catch (error) {
      showNotice(error.message)
    }
  }
  return {
    checking,
    admin,
    busy,
    activeTab,
    setActiveTab,
    products,
    pages,
    articles,
    editingArticle,
    setEditingArticle,
    editingCatalog,
    setEditingCatalog,
    login,
    logout,
    createProduct,
    removeProduct,
    saveCatalog,
    savePage,
    saveArticle,
    removeArticle,
  }
}
