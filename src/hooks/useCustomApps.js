import { useCallback, useEffect, useMemo, useState } from 'react'
import { createUserId, customAppsKeyForUser } from '../auth/storage'

function normalizeUrl(raw) {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return null
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.href
  } catch {
    return null
  }
}

export function faviconForUrl(url) {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`
  } catch {
    return null
  }
}

function loadCustomApps(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(customAppsKeyForUser(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        const url = normalizeUrl(item?.url)
        if (!url) return null
        const name = String(item?.name || '').trim() || new URL(url).hostname
        return {
          id: String(item?.id || createUserId()),
          name,
          url,
          iconUrl: item?.iconUrl || faviconForUrl(url),
        }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

export function useCustomApps(userId) {
  const [apps, setApps] = useState(() => loadCustomApps(userId))

  useEffect(() => {
    setApps(loadCustomApps(userId))
  }, [userId])

  useEffect(() => {
    if (!userId) return
    localStorage.setItem(customAppsKeyForUser(userId), JSON.stringify(apps))
  }, [apps, userId])

  const addApp = useCallback((name, rawUrl) => {
    const url = normalizeUrl(rawUrl)
    if (!url) return { ok: false, error: 'Podaj poprawny adres URL.' }

    const hostname = new URL(url).hostname
    const label = String(name || '').trim() || hostname
    const id = `web-${createUserId()}`

    setApps((prev) => [
      ...prev,
      {
        id,
        name: label,
        url,
        iconUrl: faviconForUrl(url),
      },
    ])
    return { ok: true, id }
  }, [])

  const removeApp = useCallback((id) => {
    setApps((prev) => prev.filter((app) => app.id !== id))
  }, [])

  const customTools = useMemo(
    () =>
      apps.map((app) => ({
        id: app.id,
        name: app.name,
        description: app.url,
        icon: '🌐',
        iconUrl: app.iconUrl,
        url: app.url,
        kind: 'web',
        Component: null,
      })),
    [apps],
  )

  return { apps, customTools, addApp, removeApp }
}
