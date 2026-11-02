import { useEffect, useState } from 'react'

const KEY = 'ick-tool-todos'

export default function TodoList() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || []
    } catch {
      return []
    }
  })
  const [text, setText] = useState('')

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

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
