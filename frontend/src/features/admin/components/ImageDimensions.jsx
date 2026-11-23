import React, { useEffect, useState } from 'react'

export default function ImageDimensions({ src, file }) {
  const [details, setDetails] = useState(null)
  useEffect(() => {
    let active = true
    const objectUrl = file ? URL.createObjectURL(file) : null
    const source = objectUrl || src
    setDetails(null)
    if (!source) return
    const image = new Image()
    image.onload = () => {
      if (active) setDetails({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      if (active) setDetails({ error: true })
    }
    image.src = source
    return () => {
      active = false
      image.onload = null
      image.onerror = null
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src, file])
  if (!src && !file) return null
  return (
    <small className="admin-image-dimensions" role="status">
      {details?.error ? 'ابعاد تصویر قابل خواندن نیست.' : details ? (
        <>عرض × ارتفاع: <bdi>{details.width} × {details.height}</bdi> پیکسل</>
      ) : 'در حال بررسی ابعاد تصویر…'}
    </small>
  )
}
