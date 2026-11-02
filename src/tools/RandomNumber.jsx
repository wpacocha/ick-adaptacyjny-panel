import { useState } from 'react'

export default function RandomNumber() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [value, setValue] = useState(null)

  const generate = () => {
    const a = Number(min)
    const b = Number(max)
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    setValue(lo + Math.floor(Math.random() * (hi - lo + 1)))
  }

  return (
    <div className="tool">
      <div className="row">
        <label>
          Min
          <input type="number" value={min} onChange={(e) => setMin(e.target.value)} />
        </label>
        <label>
          Max
          <input type="number" value={max} onChange={(e) => setMax(e.target.value)} />
        </label>
      </div>
      <button type="button" className="btn primary" onClick={generate}>
        Losuj
      </button>
      {value !== null && <div className="timer-face">{value}</div>}
    </div>
  )
}
