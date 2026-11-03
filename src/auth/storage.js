const AUTH_KEY = 'ick-auth-v1'

function emptyStore() {
  return { users: [], currentUserId: null }
}

export function loadAuthStore() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw)
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      currentUserId: parsed.currentUserId || null,
    }
  } catch {
    return emptyStore()
  }
}

export function saveAuthStore(store) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(store))
}

export function statsKeyForUser(userId) {
  return `ick-user-stats-${userId}`
}

export function toolKeyForUser(baseKey, userId) {
  return `${baseKey}:${userId}`
}

export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function createUserId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `u-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}
