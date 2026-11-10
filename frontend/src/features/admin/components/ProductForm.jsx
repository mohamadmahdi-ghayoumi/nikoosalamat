import React, { useEffect, useRef } from 'react'
import Icon from '../../../components/ui/Icon.jsx'
import { productCategories, resolveProductCategory } from '../../products/data/productCategories.js'
import { resolveMediaUrl } from '../../../services/api/client.js'

export default function ProductForm({ busy, createProduct, product = null, onCancel }) {
  const formRef = useRef(null)
  useEffect(() => {
    if (product) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [product?.id])
  return (
    <form className="admin-product-form" onSubmit={createProduct} ref={formRef}>
      <div className="form-heading">
        <span>{product ? 'ویرایش مشخصات محصول' : 'محصول تازه'}</span>
        <h2>{product ? 'ویرایش محصول' : 'افزودن محصول'}</h2>
      </div>
      <label>
        نام محصول
        <input name="name" type="text" minLength="2" maxLength="120" defaultValue={product?.name || ''} required />
      </label>
      <div className="form-row">
        <label>
          شناسه انگلیسی
          <input
            name="slug"
            type="text"
            dir="ltr"
            placeholder="hoof-care-oil"
            maxLength="80"
            defaultValue={product?.slug || ''}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label>
          دسته‌بندی
          <select name="category" defaultValue={resolveProductCategory(product?.category) || ''} required>
            <option value="" disabled>انتخاب دسته‌بندی</option>
            {productCategories.map((category) => (
              <option value={category} key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row three">
        <label>
          قیمت (تومان)
          <input name="price" type="number" dir="ltr" min="0" max="2000000000" defaultValue={product?.price ?? ''} required />
        </label>
        <label>
          رنگ نمایشی
          <select name="tone" defaultValue={product?.tone || 'olive'}>
            <option value="olive">سبز زیتونی</option>
            <option value="wine">زرشکی</option>
            <option value="amber">کهربایی</option>
            <option value="cream">کرم</option>
          </select>
        </label>
        <label>
          نوع بسته‌بندی
          <select name="shape" defaultValue={product?.shape || 'bottle'}>
            <option value="bottle">بطری</option>
            <option value="spray">اسپری</option>
            <option value="tin">قوطی</option>
            <option value="jar">کاسه‌ای</option>
          </select>
        </label>
      </div>
      <label>
        برچسب <small>(اختیاری)</small>
        <input name="badge" type="text" placeholder="جدید یا پرفروش" maxLength="30" defaultValue={product?.badge || ''} />
      </label>
      {product?.image_url && (
        <div className="admin-product-image-preview">
          <img src={resolveMediaUrl(product.image_url)} alt={product.name} />
          <label className="admin-check danger">
            <input name="remove_image" type="checkbox" /> حذف تصویر فعلی
          </label>
        </div>
      )}
      <label className="admin-file">
        {product ? 'جایگزینی تصویر محصول' : 'تصویر محصول'} <small>JPG، PNG یا WebP تا ۳ مگابایت{product && '؛ بدون انتخاب فایل، تصویر قبلی حفظ می‌شود'}</small>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
      </label>
      <label className="admin-check">
        <input name="featured" type="checkbox" defaultChecked={product?.featured || false} /> نمایش در محصولات پیشنهادی صفحه اصلی
      </label>
      <div className="admin-form-actions">
        <button className="button primary" type="submit" disabled={busy}>
          {busy ? 'در حال ذخیره…' : product ? 'ذخیره تغییرات محصول' : 'ثبت محصول'} <Icon name="plus" size={18} />
        </button>
        {product && <button className="button outline" type="button" onClick={onCancel} disabled={busy}>انصراف از ویرایش</button>}
      </div>
    </form>
  )
}
