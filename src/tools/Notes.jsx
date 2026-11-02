import { useEffect, useState } from 'react'

const KEY = 'ick-tool-notes'

export default function Notes() {
  const [text, setText] = useState(() => localStorage.getItem(KEY) || '')

  useEffect(() => {
    localStorage.setItem(KEY, text)
  }, [text])

  return (
    <div className="tool">
      <p className="tool-lead">Notatki zapisują się automatycznie w przeglądarce.</p>
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
