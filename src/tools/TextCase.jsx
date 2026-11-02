import { useState } from 'react'

export default function TextCase() {
  const [text, setText] = useState('Przykładowy tekst do zamiany.')

  const transforms = [
    { label: 'WIELKIE', fn: (t) => t.toUpperCase() },
    { label: 'małe', fn: (t) => t.toLowerCase() },
    {
      label: 'Title Case',
      fn: (t) =>
        t
          .toLowerCase()
          .replace(/(^|\s)\S/g, (c) => c.toUpperCase()),
    },
    {
      label: 'Odwróć',
      fn: (t) => [...t].reverse().join(''),
    },
  ]

  return (
    <div className="tool">
      <textarea className="notes-area" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="btn-row wrap">
        {transforms.map((t) => (
          <button key={t.label} type="button" className="btn" onClick={() => setText(t.fn(text))}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
