import { useMemo, useState } from 'react'

export default function AgeCalculator() {
  const [birth, setBirth] = useState('2000-01-01')

  const age = useMemo(() => {
    const start = new Date(`${birth}T00:00:00`)
    if (Number.isNaN(start.getTime())) return null
    const now = new Date()
    if (start > now) return null

    let years = now.getFullYear() - start.getFullYear()
    let months = now.getMonth() - start.getMonth()
    let days = now.getDate() - start.getDate()

    if (days < 0) {
      months -= 1
      const prev = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prev.getDate()
    }
    if (months < 0) {
      years -= 1
      months += 12
    }

    const totalDays = Math.floor((now - start) / 86400000)
    return { years, months, days, totalDays }
  }, [birth])

  return (
    <div className="tool">
      <label className="stack">
        Data urodzenia
        <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
      </label>
      {age ? (
        <div className="result-box">
          <span className="result-value">
            {age.years} lat, {age.months} mies., {age.days} dni
          </span>
          <span className="tool-meta">łącznie {age.totalDays} dni</span>
        </div>
      ) : (
        <p className="tool-meta">Podaj datę z przeszłości.</p>
      )}
    </div>
  )
}
