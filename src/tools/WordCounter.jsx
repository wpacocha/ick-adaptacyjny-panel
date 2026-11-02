import { useMemo, useState } from 'react'

export default function WordCounter() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0
    const lines = text ? text.split(/\n/).length : 0
    return { chars, charsNoSpace, words, sentences, lines }
  }, [text])

  return (
    <div className="tool">
      <textarea
        className="notes-area"
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Wklej lub wpisz tekst…"
      />
      <div className="stat-grid">
        <div>
          <strong>{stats.chars}</strong>
          <span>znaków</span>
        </div>
        <div>
          <strong>{stats.charsNoSpace}</strong>
          <span>bez spacji</span>
        </div>
        <div>
          <strong>{stats.words}</strong>
          <span>słów</span>
        </div>
        <div>
          <strong>{stats.sentences}</strong>
          <span>zdań</span>
        </div>
        <div>
          <strong>{stats.lines}</strong>
          <span>linii</span>
        </div>
      </div>
    </div>
  )
}
