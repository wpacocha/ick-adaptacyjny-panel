import { useMemo, useState } from 'react'

export default function Countdown() {
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [label, setLabel] = useState('Wydarzenie')

  const info = useMemo(() => {
    const target = new Date(`${date}T00:00:00`)
    if (Number.isNaN(target.getTime())) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const diff = Math.round((target - now) / 86400000)
    return { diff, abs: Math.abs(diff) }
  }, [date])

  return (
    <div className="tool">
      <label className="stack">
        Nazwa
        <input value={label} onChange={(e) => setLabel(e.target.value)} />
      </label>
      <label className="stack">
        Data
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      {info && (
        <div className="result-box">
          {info.diff > 0 && (
            <>
              Do <strong>{label}</strong> zostało <span className="result-value">{info.abs}</span> dni
            </>
          )}
          {info.diff < 0 && (
            <>
              Od <strong>{label}</strong> minęło <span className="result-value">{info.abs}</span> dni
            </>
          )}
          {info.diff === 0 && (
            <>
              <strong>{label}</strong> jest dziś!
            </>
          )}
        </div>
      )}
    </div>
  )
}
