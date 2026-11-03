const summaries = {
  'مراقبت از سُم': 'مراقبت و بهداشت سُم دام در برنامه روزانه دامداری.',
  'سلامت پستان': 'مراقبت از پوست خارجی پستان دام.',
  'ضدعفونی دامداری': 'راهکارهای بهداشتی برای دام و دامداری.',
  'بهداشت دامداری': 'بهداشت محیط و جایگاه نگهداری دام.',
}
export const productSummary = (product) =>
  product.catalog?.summary ||
  (/ویروگاردیا/.test(product.name)
    ? 'محلول مراقبت دهانی دام.'
    : summaries[product.category] || `آشنایی با ${product.name} و مشخصات آن.`)
export const productPath = (product) => `/products/${product.id}`
