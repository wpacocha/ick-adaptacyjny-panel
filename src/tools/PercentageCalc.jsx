import { useMemo, useState } from 'react'

export default function PercentageCalc() {
  const [mode, setMode] = useState('of')
  const [a, setA] = useState(20)
  const [b, setB] = useState(150)

  const result = useMemo(() => {
    const x = Number(a)
    const y = Number(b)
    if (Number.isNaN(x) || Number.isNaN(y)) return null
    if (mode === 'of') return round((x / 100) * y)
    if (mode === 'is') return y === 0 ? null : round((x / y) * 100)
    if (mode === 'change') return x === 0 ? null : round(((y - x) / x) * 100)
    return null
  }, [a, b, mode])

  return (
    <div className="tool">
      <div className="chip-row">
        <button type="button" className={`chip${mode === 'of' ? ' active' : ''}`} onClick={() => setMode('of')}>
          X% z Y
        </button>
        <button type="button" className={`chip${mode === 'is' ? ' active' : ''}`} onClick={() => setMode('is')}>
          X to ile % Y
        </button>
        <button
          type="button"
          className={`chip${mode === 'change' ? ' active' : ''}`}
          onClick={() => setMode('change')}
        >
          Zmiana %
        </button>
      </div>
      <div className="row">
        <label>
          {mode === 'of' ? 'Procent' : mode === 'is' ? 'Wartość' : 'Z'}
          <input type="number" value={a} onChange={(e) => setA(e.target.value)} />
        </label>
        <label>
          {mode === 'of' ? 'Z liczby' : mode === 'is' ? 'Z' : 'Na'}
          <input type="number" value={b} onChange={(e) => setB(e.target.value)} />
        </label>
      </div>
      {result !== null && (
        <div className="result-box">
          <span className="result-value">
            {result}
            {mode !== 'of' ? '%' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

function round(n) {
  return Math.round(n * 100) / 100
}
