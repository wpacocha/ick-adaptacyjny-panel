import { useMemo, useState } from 'react'

export default function TipCalculator() {
  const [bill, setBill] = useState(120)
  const [tip, setTip] = useState(10)
  const [people, setPeople] = useState(2)

  const result = useMemo(() => {
    const b = Number(bill)
    const t = Number(tip)
    const p = Math.max(1, Number(people) || 1)
    if (Number.isNaN(b) || Number.isNaN(t)) return null
    const tipAmount = (b * t) / 100
    const total = b + tipAmount
    return {
      tipAmount: round(tipAmount),
      total: round(total),
      perPerson: round(total / p),
    }
  }, [bill, tip, people])

  return (
    <div className="tool">
      <div className="row">
        <label>
          Rachunek (zł)
          <input type="number" value={bill} onChange={(e) => setBill(e.target.value)} />
        </label>
        <label>
          Napiwek (%)
          <input type="number" value={tip} onChange={(e) => setTip(e.target.value)} />
        </label>
        <label>
          Osoby
          <input type="number" min="1" value={people} onChange={(e) => setPeople(e.target.value)} />
        </label>
      </div>
      {result && (
        <div className="stat-grid">
          <div>
            <strong>{result.tipAmount} zł</strong>
            <span>napiwek</span>
          </div>
          <div>
            <strong>{result.total} zł</strong>
            <span>razem</span>
          </div>
          <div>
            <strong>{result.perPerson} zł</strong>
            <span>na osobę</span>
          </div>
        </div>
      )}
    </div>
  )
}

function round(n) {
  return Math.round(n * 100) / 100
}
