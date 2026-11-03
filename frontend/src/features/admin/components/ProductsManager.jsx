import React from 'react'
import ProductForm from './ProductForm.jsx'
import ProductList from './ProductList.jsx'

export default function ProductsManager({
  products,
  busy,
  createProduct,
  removeProduct,
  setEditingCatalog,
}) {
  return (
    <div className="admin-layout">
      <ProductForm busy={busy} createProduct={createProduct} />
      <ProductList
        products={products}
        removeProduct={removeProduct}
        setEditingCatalog={setEditingCatalog}
      />
    </div>
  )
}
