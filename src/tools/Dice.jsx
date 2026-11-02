import { useState } from 'react'

export default function Dice() {
  const [count, setCount] = useState(2)
  const [sides, setSides] = useState(6)
  const [rolls, setRolls] = useState([])

  const roll = () => {
    const next = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides))
    setRolls(next)
  }

  const sum = rolls.reduce((a, b) => a + b, 0)

  return (
    <div className="tool">
      <div className="row">
        <label>
          Liczba kości
          <input
            type="number"
            min="1"
            max="12"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
          />
        </label>
        <label>
          Ścianki
          <select value={sides} onChange={(e) => setSides(Number(e.target.value))}>
            {[4, 6, 8, 10, 12, 20].map((s) => (
              <option key={s} value={s}>
                d{s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="button" className="btn primary" onClick={roll}>
        Rzuć
      </button>
      {rolls.length > 0 && (
        <div className="dice-results">
          {rolls.map((r, i) => (
            <span key={i} className="die">
              {r}
            </span>
          ))}
          <span className="dice-sum">Suma: {sum}</span>
        </div>
      )}
    </div>
  )
}
