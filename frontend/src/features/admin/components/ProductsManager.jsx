import React from 'react'
import ProductForm from './ProductForm.jsx'
import ProductList from './ProductList.jsx'

export default function ProductsManager({
  products,
  busy,
  createProduct,
  removeProduct,
  setEditingCatalog,
  editingProduct,
  setEditingProduct,
}) {
  return (
    <div className="admin-layout">
      <ProductForm key={editingProduct?.id || 'new'} busy={busy} createProduct={createProduct} product={editingProduct} onCancel={() => setEditingProduct(null)} />
      <ProductList
        products={products}
        removeProduct={removeProduct}
        setEditingCatalog={setEditingCatalog}
        editProduct={setEditingProduct}
        busy={busy}
      />
    </div>
  )
}
