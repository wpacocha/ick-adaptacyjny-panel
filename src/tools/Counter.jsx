import { useEffect, useState } from 'react'

const KEY = 'ick-tool-counter'

export default function Counter() {
  const [count, setCount] = useState(() => Number(localStorage.getItem(KEY)) || 0)

  useEffect(() => {
    localStorage.setItem(KEY, String(count))
  }, [count])

  return (
    <div className="tool">
      <div className="timer-face">{count}</div>
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => setCount((c) => c - 1)}>
          −1
        </button>
        <button type="button" className="btn primary" onClick={() => setCount((c) => c + 1)}>
          +1
        </button>
        <button type="button" className="btn ghost" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
    </div>
  )
}
