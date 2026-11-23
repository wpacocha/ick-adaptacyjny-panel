import { useCallback, useEffect, useMemo, useState } from 'react'
import { statsKeyForUser } from '../auth/storage'
import { RECENT_LIMIT, SIDEBAR_LIMIT, tools } from '../data/tools'

export const HALF_LIFE_DAYS = 7
const MAX_HISTORY = 120
const DAY_MS = 86400000

function createDefaultStats() {
  const entries = {}
  for (const tool of tools) {
    entries[tool.id] = { uses: 0, lastUsed: 0, pinned: false, pinOrder: 0, history: [] }
  }
  return entries
}

function normalizeEntry(raw) {
  const uses = Number(raw?.uses) || 0
  const lastUsed = Number(raw?.lastUsed) || 0
  const pinned = Boolean(raw?.pinned)
  const pinOrder = Number(raw?.pinOrder) || 0
  let history = Array.isArray(raw?.history)
    ? raw.history.map(Number).filter((t) => Number.isFinite(t) && t > 0)
    : []

  if (history.length === 0 && uses > 0 && lastUsed > 0) {
    history = Array.from({ length: Math.min(uses, MAX_HISTORY) }, () => lastUsed)
  }

  return {
    uses: history.length > 0 ? history.length : uses,
    lastUsed: lastUsed || (history.length ? Math.max(...history) : 0),
    pinned,
    pinOrder: pinned ? pinOrder || lastUsed || 1 : 0,
    history: history.slice(-MAX_HISTORY),
  }
}

function loadStats(userId) {
  if (!userId) return createDefaultStats()
  try {
    const raw = localStorage.getItem(statsKeyForUser(userId))
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

/** dziś ≈ 1, po tygodniu ≈ 0.5, po 2 tyg. ≈ 0.25 */
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

function nextPinOrder(stats) {
  let max = 0
  for (const entry of Object.values(stats)) {
    if (entry?.pinned && entry.pinOrder > max) max = entry.pinOrder
  }
  return max + 1
}

export function useToolStats(userId) {
  const [stats, setStats] = useState(() => loadStats(userId))
  const [activeId, setActiveId] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setStats(loadStats(userId))
    setActiveId(null)
  }, [userId])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!userId) return
    localStorage.setItem(statsKeyForUser(userId), JSON.stringify(stats))
  }, [stats, userId])

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
      const current = prev[id] || {
        uses: 0,
        lastUsed: 0,
        pinned: false,
        pinOrder: 0,
        history: [],
      }
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
    setStats((prev) => {
      const current = prev[id] || {
        uses: 0,
        lastUsed: 0,
        pinned: false,
        pinOrder: 0,
        history: [],
      }
      if (current.pinned) {
        return {
          ...prev,
          [id]: { ...current, pinned: false, pinOrder: 0 },
        }
      }
      return {
        ...prev,
        [id]: { ...current, pinned: true, pinOrder: nextPinOrder(prev) },
      }
    })
  }, [])

  const movePin = useCallback((id, direction) => {
    setStats((prev) => {
      const pinnedIds = tools
        .filter((t) => prev[t.id]?.pinned)
        .sort((a, b) => (prev[a.id].pinOrder || 0) - (prev[b.id].pinOrder || 0))
        .map((t) => t.id)

      const index = pinnedIds.indexOf(id)
      if (index < 0) return prev
      const swapWith = index + direction
      if (swapWith < 0 || swapWith >= pinnedIds.length) return prev

      const otherId = pinnedIds[swapWith]
      const orderA = prev[id].pinOrder
      const orderB = prev[otherId].pinOrder

      return {
        ...prev,
        [id]: { ...prev[id], pinOrder: orderB },
        [otherId]: { ...prev[otherId], pinOrder: orderA },
      }
    })
  }, [])

  const resetStats = useCallback(() => {
    setStats(createDefaultStats())
    setActiveId(null)
  }, [])

  const sortedTools = useMemo(() => {
    const byScore = (a, b) => {
      const sa = stats[a.id]
      const sb = stats[b.id]
      const scoreDiff = scores[b.id] - scores[a.id]
      if (Math.abs(scoreDiff) > 0.0001) return scoreDiff
      if (sa.lastUsed !== sb.lastUsed) return sb.lastUsed - sa.lastUsed
      return a.name.localeCompare(b.name, 'pl')
    }

    const pinned = tools
      .filter((t) => stats[t.id]?.pinned)
      .sort((a, b) => (stats[a.id].pinOrder || 0) - (stats[b.id].pinOrder || 0))

    const unpinned = tools.filter((t) => !stats[t.id]?.pinned).sort(byScore)
    return [...pinned, ...unpinned]
  }, [stats, scores])

  const pinnedTools = useMemo(
    () => sortedTools.filter((t) => stats[t.id]?.pinned),
    [sortedTools, stats],
  )

  const sidebarTools = useMemo(() => {
    const pinned = pinnedTools
    if (pinned.length >= SIDEBAR_LIMIT) return pinned.slice(0, SIDEBAR_LIMIT)

    const rest = sortedTools
      .filter((t) => !stats[t.id]?.pinned)
      .slice(0, SIDEBAR_LIMIT - pinned.length)
    return [...pinned, ...rest]
  }, [pinnedTools, sortedTools, stats])

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
        reasons.push('przypięte przez Ciebie — kolejność ustawiasz sam')
      }
      if (s.uses === 0) {
        reasons.push('jeszcze nieużywane')
      } else {
        reasons.push(`${s.uses} użyć · waga ${formatScore(score)}`)
      }
      return reasons.join(' · ')
    },
    [stats, scores],
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
    movePin,
    resetStats,
    sortedTools,
    pinnedTools,
    sidebarTools,
    recentTools,
    explainTool,
    buttonScale,
    maxScore,
    formatScore,
  }
}
