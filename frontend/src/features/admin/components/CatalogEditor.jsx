import React from 'react'
import { resolveMediaUrl } from '../../../services/api/client.js'

export default function CatalogEditor({ product, busy, onSave, onCancel }) {
  const catalog = product.catalog || {}
  return (
    <form
      className="admin-editor-form catalog-editor"
      onSubmit={(event) => onSave(event, product)}
      key={product.id}
    >
      <div className="admin-editor-head">
        <div>
          <span>صفحه اختصاصی محصول</span>
          <h3>{product.name}</h3>
        </div>
        <button className="button outline" type="button" onClick={onCancel}>
          بستن
        </button>
      </div>
      <label>
        کاربرد کوتاه روی کارت محصول
        <textarea name="summary" rows="2" maxLength="350" defaultValue={catalog.summary || ''} />
      </label>
      <label>
        معرفی کامل
        <textarea
          name="description"
          rows="5"
          maxLength="15000"
          defaultValue={catalog.description || ''}
        />
      </label>
      <label>
        ویژگی‌ها <small>هر ویژگی در یک خط، حداکثر ۲۰ مورد</small>
        <textarea name="features" rows="5" defaultValue={(catalog.features || []).join('\n')} />
      </label>
      <label>
        روش مصرف <small>مطابق اطلاعات تأییدشده محصول</small>
        <textarea name="usage" rows="5" maxLength="10000" defaultValue={catalog.usage || ''} />
      </label>
      {!!catalog.gallery?.length && (
        <div className="admin-gallery">
          {catalog.gallery.map((url) => (
            <label key={url}>
              <img src={resolveMediaUrl(url)} alt="تصویر گالری محصول" />
              <span>
                <input type="checkbox" name="gallery" value={url} defaultChecked /> نگهداری تصویر
              </span>
            </label>
          ))}
        </div>
      )}
      <label className="admin-file">
        تصاویر بیشتر محصول{' '}
        <small>
          تا ۵ تصویر JPG، PNG یا WebP؛ هر فایل تا ۳ مگابایت و مجموع فایل‌های جدید تا ۵ مگابایت
        </small>
        <input
          type="file"
          name="gallery_images"
          multiple
          accept="image/jpeg,image/png,image/webp"
        />
      </label>
      <div className="admin-form-actions">
        <button className="button primary" disabled={busy}>
          ذخیره کاتالوگ محصول
        </button>
        <button className="button outline" type="button" onClick={onCancel}>
          انصراف
        </button>
      </div>
    </form>
  )
}
