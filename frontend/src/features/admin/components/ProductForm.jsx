import React from 'react'
import Icon from '../../../components/ui/Icon.jsx'

export default function ProductForm({ busy, createProduct }) {
  return (
    <form className="admin-product-form" onSubmit={createProduct}>
      <div className="form-heading">
        <span>محصول تازه</span>
        <h2>افزودن محصول</h2>
      </div>
      <label>
        نام محصول
        <input name="name" type="text" minLength="2" required />
      </label>
      <div className="form-row">
        <label>
          شناسه انگلیسی
          <input
            name="slug"
            type="text"
            dir="ltr"
            placeholder="hoof-care-oil"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label>
          دسته‌بندی
          <input name="category" type="text" placeholder="مراقبت از سُم" required />
        </label>
      </div>
      <div className="form-row three">
        <label>
          قیمت (تومان)
          <input name="price" type="number" dir="ltr" min="0" required />
        </label>
        <label>
          رنگ نمایشی
          <select name="tone" defaultValue="olive">
            <option value="olive">سبز زیتونی</option>
            <option value="wine">زرشکی</option>
            <option value="amber">کهربایی</option>
            <option value="cream">کرم</option>
          </select>
        </label>
        <label>
          نوع بسته‌بندی
          <select name="shape" defaultValue="bottle">
            <option value="bottle">بطری</option>
            <option value="spray">اسپری</option>
            <option value="tin">قوطی</option>
            <option value="jar">کاسه‌ای</option>
          </select>
        </label>
      </div>
      <label>
        برچسب <small>(اختیاری)</small>
        <input name="badge" type="text" placeholder="جدید یا پرفروش" maxLength="30" />
      </label>
      <label className="admin-file">
        تصویر محصول <small>JPG، PNG یا WebP تا ۳ مگابایت</small>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
      </label>
      <label className="admin-check">
        <input name="featured" type="checkbox" /> نمایش در محصولات پیشنهادی صفحه اصلی
      </label>
      <button className="button primary" type="submit" disabled={busy}>
        {busy ? 'در حال ثبت…' : 'ثبت محصول'} <Icon name="plus" size={18} />
      </button>
    </form>
  )
}
