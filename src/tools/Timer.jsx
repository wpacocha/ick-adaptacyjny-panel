import { useEffect, useRef, useState } from 'react'

export default function Timer() {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [left, setLeft] = useState(null)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (!running) return undefined
    const id = setInterval(() => {
      const remaining = Math.max(0, endRef.current - Date.now())
      setLeft(remaining)
      if (remaining <= 0) {
        setRunning(false)
        setDone(true)
      }
    }, 100)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    const total = (Number(minutes) || 0) * 60000 + (Number(seconds) || 0) * 1000
    if (total <= 0) return
    endRef.current = Date.now() + (left ?? total)
    if (left === null) setLeft(total)
    setDone(false)
    setRunning(true)
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setLeft(null)
    setDone(false)
  }

  const show = left ?? (minutes * 60000 + seconds * 1000)
  const mm = String(Math.floor(show / 60000)).padStart(2, '0')
  const ss = String(Math.floor((show % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="tool">
      <div className={`timer-face${done ? ' done' : ''}`}>
        {mm}:{ss}
      </div>
      {done && <p className="tool-alert">Czas minął!</p>}
      {!running && left === null && (
        <div className="row">
          <label>
            Min
            <input
              type="number"
              min="0"
              max="99"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>
          <label>
            Sek
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </label>
        </div>
      )}
      <div className="btn-row">
        {!running ? (
          <button type="button" className="btn primary" onClick={start}>
            Start
          </button>
        ) : (
          <button type="button" className="btn" onClick={pause}>
            Pauza
          </button>
        )}
        <button type="button" className="btn ghost" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  )
}
