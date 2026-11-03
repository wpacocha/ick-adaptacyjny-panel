import { useEffect, useState } from 'react'
import { toolKeyForUser } from '../auth/storage'
import { useCurrentUser } from '../context/UserContext'

const BASE_KEY = 'ick-tool-notes'

export default function Notes() {
  const user = useCurrentUser()
  const storageKey = toolKeyForUser(BASE_KEY, user.id)
  const [text, setText] = useState(() => localStorage.getItem(storageKey) || '')

  useEffect(() => {
    setText(localStorage.getItem(storageKey) || '')
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, text)
  }, [text, storageKey])

  return (
    <div className="tool">
      <textarea
        className="notes-area"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Napisz coś…"
        rows={12}
      />
      <div className="tool-meta">{text.length} znaków</div>
    </div>
  )
}
