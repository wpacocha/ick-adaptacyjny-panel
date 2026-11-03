import { useEffect, useState } from 'react'
import { toolKeyForUser } from '../auth/storage'
import { useCurrentUser } from '../context/UserContext'

const BASE_KEY = 'ick-tool-counter'

export default function Counter() {
  const user = useCurrentUser()
  const storageKey = toolKeyForUser(BASE_KEY, user.id)
  const [count, setCount] = useState(() => Number(localStorage.getItem(storageKey)) || 0)

  useEffect(() => {
    setCount(Number(localStorage.getItem(storageKey)) || 0)
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, String(count))
  }, [count, storageKey])

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
