import { useMemo, useState } from 'react'

const categories = {
  długość: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.344,
    ft: 0.3048,
    in: 0.0254,
  },
  masa: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.45359237,
    oz: 0.028349523125,
  },
  temperatura: 'temp',
}

export default function UnitConverter() {
  const [cat, setCat] = useState('długość')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('km')
  const [value, setValue] = useState('1')

  const units = useMemo(() => {
    if (cat === 'temperatura') return ['C', 'F', 'K']
    return Object.keys(categories[cat])
  }, [cat])

  const result = useMemo(() => {
    const n = parseFloat(value)
    if (Number.isNaN(n)) return '—'
    if (cat === 'temperatura') return convertTemp(n, from, to)
    const base = n * categories[cat][from]
    return round(base / categories[cat][to])
  }, [cat, from, to, value])

  const changeCat = (c) => {
    setCat(c)
    if (c === 'temperatura') {
      setFrom('C')
      setTo('F')
    } else {
      const keys = Object.keys(categories[c])
      setFrom(keys[0])
      setTo(keys[1])
    }
  }

  return (
    <div className="tool">
      <div className="chip-row">
        {Object.keys(categories).map((c) => (
          <button
            key={c}
            type="button"
            className={`chip${cat === c ? ' active' : ''}`}
            onClick={() => changeCat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="row">
        <label>
          Wartość
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label>
          Z
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <label>
          Na
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="result-box">
        <span className="result-value">{result}</span>
        <span className="result-unit">{to}</span>
      </div>
    </div>
  )
}

function convertTemp(n, from, to) {
  let c = n
  if (from === 'F') c = ((n - 32) * 5) / 9
  if (from === 'K') c = n - 273.15
  let out = c
  if (to === 'F') out = (c * 9) / 5 + 32
  if (to === 'K') out = c + 273.15
  return round(out)
}

function round(n) {
  return Math.round(n * 1e8) / 1e8
}
