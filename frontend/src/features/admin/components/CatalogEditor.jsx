import React, { useEffect, useState } from 'react'
import { resolveMediaUrl } from '../../../services/api/client.js'
import ImageDimensions from './ImageDimensions.jsx'

export default function CatalogEditor({ product, busy, onSave, onCancel }) {
  const catalog = product.catalog || {}
  const [newImages, setNewImages] = useState([])
  useEffect(() => setNewImages([]), [product.id])
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
          className="catalog-description-input"
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
              <ImageDimensions src={resolveMediaUrl(url)} />
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
        <small>اندازه پیشنهادی هر تصویر: ۱۰۰۰ × ۱۰۰۰ پیکسل؛ تصاویر عمودی هم پشتیبانی می‌شوند.</small>
        <input
          type="file"
          name="gallery_images"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setNewImages(Array.from(event.target.files || []).slice(0, 5))}
        />
      </label>
      {!!newImages.length && (
        <ul className="admin-image-dimension-list" aria-label="ابعاد تصاویر جدید گالری">
          {newImages.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <bdi>{file.name}</bdi>
              <ImageDimensions file={file} />
            </li>
          ))}
        </ul>
      )}
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
