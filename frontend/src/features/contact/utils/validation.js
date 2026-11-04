import { isValidMobile, normalizeMobile } from '../../../utils/persian.js'

export function validateContact(values) {
  const errors = {}
  if (String(values.name || '').trim().length < 2)
    errors.name = 'نام و نام خانوادگی را با حداقل ۲ حرف وارد کنید.'
  if (!isValidMobile(values.mobile || ''))
    errors.mobile = 'شماره موبایل معتبر وارد کنید؛ مانند ۰۹۱۲۳۴۵۶۷۸۹.'
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'نشانی ایمیل معتبر وارد کنید؛ مانند name@example.com.'
  if (String(values.message || '').trim().length < 10)
    errors.message = 'متن پیام باید حداقل ۱۰ حرف باشد.'
  return errors
}

export function normalizeContact(values) {
  const result = {
    ...values,
    name: values.name.trim(),
    mobile: normalizeMobile(values.mobile),
    message: values.message.trim(),
  }
  if (values.email?.trim()) result.email = values.email.trim()
  else delete result.email
  return result
}
