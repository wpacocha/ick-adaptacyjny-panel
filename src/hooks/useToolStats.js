import { useCallback, useEffect, useMemo, useState } from 'react'
import { statsKeyForUser } from '../auth/storage'
import { RECENT_LIMIT, SIDEBAR_LIMIT, tools as builtInTools } from '../data/tools'

/** Półokres zanikania wagi dnia (w dniach). */
export const HALF_LIFE_DAYS = 7
/** Półokres zanikania wagi tygodnia (w tygodniach). */
export const HALF_LIFE_WEEKS = 2
/** Udział dzienny vs tygodniowy w końcowym score. */
export const DAY_SHARE_WEIGHT = 0.65
export const WEEK_SHARE_WEIGHT = 0.35
const MAX_HISTORY = 120
const DAY_MS = 86400000
const WEEK_MS = 7 * DAY_MS

function emptyEntry() {
  return { uses: 0, lastUsed: 0, pinned: false, pinOrder: 0, hidden: false, history: [] }
}

function createDefaultStats(toolList) {
  const entries = {}
  for (const tool of toolList) {
    entries[tool.id] = emptyEntry()
  }
  return entries
}

function normalizeEntry(raw) {
  const uses = Number(raw?.uses) || 0
  const lastUsed = Number(raw?.lastUsed) || 0
  const pinned = Boolean(raw?.pinned)
  const pinOrder = Number(raw?.pinOrder) || 0
  const hidden = Boolean(raw?.hidden)
  let history = Array.isArray(raw?.history)
    ? raw.history.map(Number).filter((t) => Number.isFinite(t) && t > 0)
    : []

  if (history.length === 0 && uses > 0 && lastUsed > 0) {
    history = Array.from({ length: Math.min(uses, MAX_HISTORY) }, () => lastUsed)
  }

  return {
    uses: history.length > 0 ? history.length : uses,
    lastUsed: lastUsed || (history.length ? Math.max(...history) : 0),
    pinned: hidden ? false : pinned,
    pinOrder: hidden ? 0 : pinned ? pinOrder || lastUsed || 1 : 0,
    hidden,
    history: history.slice(-MAX_HISTORY),
  }
}

function loadStats(userId, toolList) {
  if (!userId) return createDefaultStats(toolList)
  try {
    const raw = localStorage.getItem(statsKeyForUser(userId))
    if (!raw) return createDefaultStats(toolList)
    const parsed = JSON.parse(raw)
    const base = createDefaultStats(toolList)
    for (const id of Object.keys(base)) {
      if (parsed[id]) base[id] = normalizeEntry(parsed[id])
    }
    return base
  } catch {
    return createDefaultStats(toolList)
  }
}

function startOfLocalDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Poniedziałek 00:00 lokalnie. */
function startOfLocalWeek(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  const mondayOffset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - mondayOffset)
  return d.getTime()
}

/** Waga kubełka czasu: dziś/ten tydzień ≈ 1, po półokresie ≈ 0.5. */
export function bucketWeight(ageUnits, halfLife) {
  if (halfLife <= 0) return 0
  return Math.pow(0.5, Math.max(0, ageUnits) / halfLife)
}

/** Waga dnia, w którym nastąpiło użycie (półokres 7 dni). */
export function useWeight(timestamp, now = Date.now()) {
  const dayAge = Math.max(0, (startOfLocalDay(now) - startOfLocalDay(timestamp)) / DAY_MS)
  return bucketWeight(dayAge, HALF_LIFE_DAYS)
}

/**
 * Score = mieszanka udziału w aktywności dnia i tygodnia.
 * Intensywny tydzień nie przebija spokojnego — liczy się proporcja użyć, nie surowa liczba.
 */
export function scoresFromShare(statsById, toolIds, now = Date.now()) {
  const dayTotals = new Map()
  const weekTotals = new Map()
  const toolDayCounts = new Map()
  const toolWeekCounts = new Map()

  for (const id of toolIds) {
    const dayMap = new Map()
    const weekMap = new Map()
    for (const ts of statsById[id]?.history || []) {
      const day = startOfLocalDay(ts)
      const week = startOfLocalWeek(ts)
      dayMap.set(day, (dayMap.get(day) || 0) + 1)
      weekMap.set(week, (weekMap.get(week) || 0) + 1)
      dayTotals.set(day, (dayTotals.get(day) || 0) + 1)
      weekTotals.set(week, (weekTotals.get(week) || 0) + 1)
    }
    toolDayCounts.set(id, dayMap)
    toolWeekCounts.set(id, weekMap)
  }

  const today = startOfLocalDay(now)
  const thisWeek = startOfLocalWeek(now)
  const scores = {}

  for (const id of toolIds) {
    let dayScore = 0
    for (const [day, count] of toolDayCounts.get(id) || []) {
      const total = dayTotals.get(day) || 1
      const ageDays = (today - day) / DAY_MS
      dayScore += (count / total) * bucketWeight(ageDays, HALF_LIFE_DAYS)
    }

    let weekScore = 0
    for (const [week, count] of toolWeekCounts.get(id) || []) {
      const total = weekTotals.get(week) || 1
      const ageWeeks = (thisWeek - week) / WEEK_MS
      weekScore += (count / total) * bucketWeight(ageWeeks, HALF_LIFE_WEEKS)
    }

    scores[id] = DAY_SHARE_WEIGHT * dayScore + WEEK_SHARE_WEIGHT * weekScore
  }

  return scores
}

/** Stare API: udział narzędzia przy założeniu, że to jedyne narzędzie (mało użyteczne). */
export function scoreFromHistory(history, now = Date.now()) {
  if (!history?.length) return 0
  const fakeStats = { only: { history } }
  return scoresFromShare(fakeStats, ['only'], now).only || 0
}

function formatScore(score) {
  if (score <= 0) return '0'
  if (score < 1) return score.toFixed(2)
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

export function useToolStats(userId, extraTools = []) {
  const catalog = useMemo(() => [...builtInTools, ...extraTools], [extraTools])
  const catalogKey = useMemo(() => catalog.map((t) => t.id).join('|'), [catalog])

  const [stats, setStats] = useState(() => loadStats(userId, catalog))
  const [activeId, setActiveId] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setStats(loadStats(userId, catalog))
    setActiveId(null)
  }, [userId])

  useEffect(() => {
    setStats((prev) => {
      let changed = false
      const next = { ...prev }
      for (const tool of catalog) {
        if (!next[tool.id]) {
          next[tool.id] = emptyEntry()
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [catalogKey, catalog])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!userId) return
    localStorage.setItem(statsKeyForUser(userId), JSON.stringify(stats))
  }, [stats, userId])

  const scores = useMemo(() => {
    return scoresFromShare(
      stats,
      catalog.map((t) => t.id),
      now,
    )
  }, [catalog, stats, now])

  const recordUse = useCallback((id) => {
    const ts = Date.now()
    setNow(ts)
    setStats((prev) => {
      const current = prev[id] || emptyEntry()
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
  }, [])

  const openTool = useCallback(
    (id) => {
      const tool = catalog.find((t) => t.id === id)
      recordUse(id)
      if (tool?.kind === 'web' && tool.url) {
        window.open(tool.url, '_blank', 'noopener,noreferrer')
        return
      }
      setActiveId(id)
    },
    [catalog, recordUse],
  )

  const togglePin = useCallback((id) => {
    setStats((prev) => {
      const current = prev[id] || emptyEntry()
      if (current.hidden) return prev
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

  const toggleHide = useCallback((id) => {
    setStats((prev) => {
      const current = prev[id] || emptyEntry()
      const hidden = !current.hidden
      return {
        ...prev,
        [id]: {
          ...current,
          hidden,
          pinned: hidden ? false : current.pinned,
          pinOrder: hidden ? 0 : current.pinOrder,
        },
      }
    })
    setActiveId((current) => (current === id ? null : current))
  }, [])

  const movePin = useCallback(
    (id, direction) => {
      setStats((prev) => {
        const pinnedIds = catalog
          .filter((t) => prev[t.id]?.pinned && !prev[t.id]?.hidden)
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
    },
    [catalog],
  )

  const resetStats = useCallback(() => {
    setStats((prev) => {
      const next = createDefaultStats(catalog)
      for (const tool of catalog) {
        if (prev[tool.id]?.hidden) {
          next[tool.id] = { ...next[tool.id], hidden: true }
        }
      }
      return next
    })
    setActiveId(null)
  }, [catalog])

  const removeToolStats = useCallback((id) => {
    setStats((prev) => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    setActiveId((current) => (current === id ? null : current))
  }, [])

  const visibleCatalog = useMemo(
    () => catalog.filter((t) => !stats[t.id]?.hidden),
    [catalog, stats],
  )

  const hiddenTools = useMemo(
    () =>
      catalog
        .filter((t) => stats[t.id]?.hidden)
        .sort((a, b) => a.name.localeCompare(b.name, 'pl')),
    [catalog, stats],
  )

  const sortedTools = useMemo(() => {
    const byScore = (a, b) => {
      const sa = stats[a.id] || emptyEntry()
      const sb = stats[b.id] || emptyEntry()
      const scoreDiff = scores[b.id] - scores[a.id]
      if (Math.abs(scoreDiff) > 0.0001) return scoreDiff
      if (sa.lastUsed !== sb.lastUsed) return sb.lastUsed - sa.lastUsed
      return a.name.localeCompare(b.name, 'pl')
    }

    const pinned = visibleCatalog
      .filter((t) => stats[t.id]?.pinned)
      .sort((a, b) => (stats[a.id]?.pinOrder || 0) - (stats[b.id]?.pinOrder || 0))

    const unpinned = visibleCatalog.filter((t) => !stats[t.id]?.pinned).sort(byScore)
    return [...pinned, ...unpinned]
  }, [visibleCatalog, stats, scores])

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
    return [...visibleCatalog]
      .filter((t) => (stats[t.id]?.lastUsed || 0) > 0)
      .sort((a, b) => (stats[b.id]?.lastUsed || 0) - (stats[a.id]?.lastUsed || 0))
      .slice(0, RECENT_LIMIT)
  }, [visibleCatalog, stats])

  const maxScore = useMemo(() => Math.max(0, ...Object.values(scores)), [scores])

  const explainTool = useCallback(
    (id) => {
      const s = stats[id]
      const tool = catalog.find((t) => t.id === id)
      if (!tool || !s) return ''

      const score = scores[id] || 0
      const reasons = []
      if (s.pinned) {
        reasons.push('przypięte przez Ciebie — kolejność ustawiasz sam')
      }
      if (s.uses === 0) {
        reasons.push('jeszcze nieużywane')
      } else {
        reasons.push(
          `${s.uses} użyć · udział dzień/tydzień · waga ${formatScore(score)}`,
        )
      }
      return reasons.join(' · ')
    },
    [catalog, stats, scores],
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
    toggleHide,
    movePin,
    resetStats,
    removeToolStats,
    sortedTools,
    pinnedTools,
    hiddenTools,
    sidebarTools,
    recentTools,
    explainTool,
    buttonScale,
    maxScore,
    formatScore,
    catalog,
  }
}
