import React from 'react'
import useNavigation from '../hooks/useNavigation.js'
import useNotice from '../hooks/useNotice.js'
import useSiteData from '../hooks/useSiteData.js'
import useCart from '../hooks/useCart.js'
import usePageTitle from '../hooks/usePageTitle.js'
import SiteLayout from '../components/layout/SiteLayout.jsx'
import AppRoutes from './AppRoutes.jsx'

export default function App() {
  const { currentPath, navigate } = useNavigation()
  const { notice, showNotice } = useNotice()
  const { homeData, apiOnline, catalogProducts, markApiOnline } = useSiteData(currentPath)
  const { cartCount, addToCart } = useCart({ apiOnline, showNotice })
  usePageTitle(currentPath)
  return (
    <SiteLayout currentPath={currentPath} navigate={navigate} cartCount={cartCount} notice={notice}>
      <AppRoutes
        currentPath={currentPath}
        navigate={navigate}
        homeData={homeData}
        catalogProducts={catalogProducts}
        showNotice={showNotice}
        markApiOnline={markApiOnline}
        addToCart={addToCart}
      />
    </SiteLayout>
  )
}
