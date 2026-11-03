export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:8011')

export async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      const message = payload?.detail || 'خطایی در ارتباط با سرور رخ داد'
      throw new Error(message)
    }
    return payload
  } finally {
    window.clearTimeout(timeout)
  }
}

export const resolveMediaUrl = (path) => (path?.startsWith('/') ? `${API_BASE_URL}${path}` : path)
