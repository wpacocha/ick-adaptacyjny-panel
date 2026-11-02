import { useCallback, useEffect, useMemo, useState } from 'react'
import { RECENT_LIMIT, SIDEBAR_LIMIT, tools } from '../data/tools'

const STORAGE_KEY = 'ick-adaptive-panel-stats-v2'

/** Po tylu dniach pojedyncze użycie traci połowę wagi. */
export const HALF_LIFE_DAYS = 7
const MAX_HISTORY = 120
const DAY_MS = 86400000

function createDefaultStats() {
  const entries = {}
  for (const tool of tools) {
    entries[tool.id] = { uses: 0, lastUsed: 0, pinned: false, history: [] }
  }
  return entries
}

function normalizeEntry(raw) {
  const uses = Number(raw?.uses) || 0
  const lastUsed = Number(raw?.lastUsed) || 0
  const pinned = Boolean(raw?.pinned)
  let history = Array.isArray(raw?.history)
    ? raw.history.map(Number).filter((t) => Number.isFinite(t) && t > 0)
    : []

  // Migracja ze starego formatu (tylko licznik): przybliż historię ostatnim użyciem.
  if (history.length === 0 && uses > 0 && lastUsed > 0) {
    history = Array.from({ length: Math.min(uses, MAX_HISTORY) }, () => lastUsed)
  }

  return {
    uses: history.length > 0 ? history.length : uses,
    lastUsed: lastUsed || (history.length ? Math.max(...history) : 0),
    pinned,
    history: history.slice(-MAX_HISTORY),
  }
}

function loadStats() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('ick-adaptive-panel-stats-v1')
    if (!raw) return createDefaultStats()
    const parsed = JSON.parse(raw)
    const base = createDefaultStats()
    for (const id of Object.keys(base)) {
      if (parsed[id]) base[id] = normalizeEntry(parsed[id])
    }
    return base
  } catch {
    return createDefaultStats()
  }
}

/** Waga pojedynczego użycia: dziś ≈ 1, po tygodniu ≈ 0.5, po 2 tyg. ≈ 0.25 */
export function useWeight(timestamp, now = Date.now()) {
  const daysAgo = Math.max(0, (now - timestamp) / DAY_MS)
  return Math.pow(0.5, daysAgo / HALF_LIFE_DAYS)
}

export function scoreFromHistory(history, now = Date.now()) {
  if (!history?.length) return 0
  return history.reduce((sum, ts) => sum + useWeight(ts, now), 0)
}

function formatScore(score) {
  if (score <= 0) return '0'
  if (score < 10) return score.toFixed(1)
  return String(Math.round(score))
}

export function useToolStats() {
  const [stats, setStats] = useState(loadStats)
  const [activeId, setActiveId] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  // Odświeżaj wagi okresowo, żeby ranking „starzał się” także bez nowych kliknięć.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  }, [stats])

  const scores = useMemo(() => {
    const map = {}
    for (const tool of tools) {
      map[tool.id] = scoreFromHistory(stats[tool.id]?.history, now)
    }
    return map
  }, [stats, now])

  const recordUse = useCallback((id) => {
    const ts = Date.now()
    setNow(ts)
    setStats((prev) => {
      const current = prev[id] || { uses: 0, lastUsed: 0, pinned: false, history: [] }
      const history = [...(current.history || []), ts].slice(-MAX_HISTORY)
      return {
        ...prev,
        [id]: {
          ...current,
          uses: history.length,
          lastUsed: ts,
          history,
        },
      }
    })
    setActiveId(id)
  }, [])

  const openTool = useCallback(
    (id) => {
      recordUse(id)
    },
    [recordUse],
  )

  const togglePin = useCallback((id) => {
    setStats((prev) => ({
      ...prev,
      [id]: { ...prev[id], pinned: !prev[id]?.pinned },
    }))
  }, [])

  const resetStats = useCallback(() => {
    setStats(createDefaultStats())
    setActiveId(null)
    localStorage.removeItem('ick-adaptive-panel-stats-v1')
  }, [])

  const sortedTools = useMemo(() => {
    const compare = (a, b) => {
      const sa = stats[a.id]
      const sb = stats[b.id]
      if (sa.pinned !== sb.pinned) return sa.pinned ? -1 : 1
      const scoreDiff = scores[b.id] - scores[a.id]
      if (Math.abs(scoreDiff) > 0.0001) return scoreDiff
      if (sa.lastUsed !== sb.lastUsed) return sb.lastUsed - sa.lastUsed
      return a.name.localeCompare(b.name, 'pl')
    }

    const pinned = tools.filter((t) => stats[t.id]?.pinned).sort(compare)
    const unpinned = tools.filter((t) => !stats[t.id]?.pinned).sort(compare)
    return [...pinned, ...unpinned]
  }, [stats, scores])

  const sidebarTools = useMemo(
    () => sortedTools.slice(0, SIDEBAR_LIMIT),
    [sortedTools],
  )

  const recentTools = useMemo(() => {
    return [...tools]
      .filter((t) => stats[t.id]?.lastUsed > 0)
      .sort((a, b) => stats[b.id].lastUsed - stats[a.id].lastUsed)
      .slice(0, RECENT_LIMIT)
  }, [stats])

  const maxScore = useMemo(
    () => Math.max(0, ...Object.values(scores)),
    [scores],
  )

  const explainTool = useCallback(
    (id) => {
      const s = stats[id]
      const tool = tools.find((t) => t.id === id)
      if (!tool || !s) return ''

      const score = scores[id] || 0
      const reasons = []
      if (s.pinned) {
        reasons.push('przypięte przez Ciebie — pozycja jest stała')
      }
      if (s.uses === 0) {
        reasons.push(
          'jeszcze nieużywane — w domyślnej kolejności alfabetycznej wśród niewykorzystanych',
        )
      } else {
        reasons.push(`${s.uses} użyć · waga ${formatScore(score)}`)
        reasons.push(
          `świeższe kliknięcia liczą się bardziej (połowa wagi po ${HALF_LIFE_DAYS} dniach)`,
        )
        const rank = sortedTools.findIndex((t) => t.id === id) + 1
        reasons.push(`pozycja ${rank} z ${tools.length}`)
        if (rank <= SIDEBAR_LIMIT) {
          reasons.push(`w top ${SIDEBAR_LIMIT} skrótach z lewej`)
        } else if (!s.pinned) {
          reasons.push('kolejność wynika z aktualnej wagi użyć')
        }
      }
      if (s.lastUsed) {
        reasons.push(`ostatnio: ${formatRelative(s.lastUsed, now)}`)
      }
      return reasons.join(' · ')
    },
    [stats, sortedTools, scores, now],
  )

  const buttonScale = useCallback(
    (id) => {
      const score = scores[id] || 0
      if (maxScore === 0 || score === 0) return 1
      return 1 + Math.min(0.18, (score / maxScore) * 0.18)
    },
    [scores, maxScore],
  )

  return {
    stats,
    scores,
    activeId,
    setActiveId,
    openTool,
    togglePin,
    resetStats,
    sortedTools,
    sidebarTools,
    recentTools,
    explainTool,
    buttonScale,
    maxScore,
    formatScore,
  }
}

function formatRelative(ts, now = Date.now()) {
  const diff = now - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'przed chwilą'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min temu`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} godz. temu`
  const d = Math.floor(h / 24)
  return `${d} dni temu`
}
