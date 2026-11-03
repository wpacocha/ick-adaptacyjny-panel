import { useEffect, useState } from 'react'
import { toolKeyForUser } from '../auth/storage'
import { useCurrentUser } from '../context/UserContext'

const BASE_KEY = 'ick-tool-todos'

function loadItems(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

export default function TodoList() {
  const user = useCurrentUser()
  const storageKey = toolKeyForUser(BASE_KEY, user.id)
  const [items, setItems] = useState(() => loadItems(storageKey))
  const [text, setText] = useState('')

  useEffect(() => {
    setItems(loadItems(storageKey))
    setText('')
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items, storageKey])

  const add = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setItems((prev) => [...prev, { id: Date.now(), text: t, done: false }])
    setText('')
  }

  const toggle = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  const remove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="tool">
      <form className="inline-form" onSubmit={add}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nowe zadanie…"
        />
        <button type="submit" className="btn primary">
          Dodaj
        </button>
      </form>
      <ul className="todo-list">
        {items.length === 0 && <li className="empty">Brak zadań</li>}
        {items.map((item) => (
          <li key={item.id} className={item.done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} />
              <span>{item.text}</span>
            </label>
            <button type="button" className="icon-btn" onClick={() => remove(item.id)} aria-label="Usuń">
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
