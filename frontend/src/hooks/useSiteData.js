import { useEffect, useState } from 'react'
import { getHomeData } from '../services/api/home.js'
import { getProducts } from '../services/api/products.js'
import { fallbackProducts } from '../features/products/data/defaultProducts.js'

export default function useSiteData(currentPath) {
  const [homeData, setHomeData] = useState(null)
  const [apiOnline, setApiOnline] = useState(false)
  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts)
  useEffect(() => {
    let active = true
    getHomeData()
      .then((data) => {
        if (active) {
          setHomeData(data)
          setApiOnline(true)
        }
      })
      .catch(() => {
        if (active) setApiOnline(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    getProducts()
      .then((data) => setCatalogProducts(data))
      .catch(() => setCatalogProducts(fallbackProducts))
  }, [currentPath])
  return { homeData, apiOnline, catalogProducts, markApiOnline: () => setApiOnline(true) }
}
