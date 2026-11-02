import { useEffect, useRef, useState } from 'react'

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const startRef = useRef(0)
  const baseRef = useRef(0)

  useEffect(() => {
    if (!running) return undefined
    const id = setInterval(() => {
      setElapsed(baseRef.current + (Date.now() - startRef.current))
    }, 50)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    startRef.current = Date.now()
    setRunning(true)
  }

  const pause = () => {
    baseRef.current = elapsed
    setRunning(false)
  }

  const reset = () => {
    setRunning(false)
    baseRef.current = 0
    setElapsed(0)
  }

  const ms = String(Math.floor((elapsed % 1000) / 10)).padStart(2, '0')
  const s = String(Math.floor((elapsed / 1000) % 60)).padStart(2, '0')
  const m = String(Math.floor(elapsed / 60000)).padStart(2, '0')

  return (
    <div className="tool">
      <div className="timer-face">
        {m}:{s}.{ms}
      </div>
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
