export function normalizeDigits(value) {
  return String(value).replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0)
    return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660))
  })
}

export function normalizeMobile(value) {
  const digits = normalizeDigits(value).replace(/[\s\-()]/g, '')
  if (/^(?:\+98|0098|98)9\d{9}$/.test(digits)) return `0${digits.slice(-10)}`
  return /^9\d{9}$/.test(digits) ? `0${digits}` : digits
}

export const isValidMobile = (value) => /^09\d{9}$/.test(normalizeMobile(value))
