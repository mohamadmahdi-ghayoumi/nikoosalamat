export async function readImageFile(file) {
  if (!file?.size) return null
  if (file.size > 3 * 1024 * 1024) throw new Error('حجم تصویر نباید بیشتر از ۳ مگابایت باشد')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('خواندن تصویر ممکن نبود'))
    reader.readAsDataURL(file)
  })
}
