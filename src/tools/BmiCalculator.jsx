import { useMemo, useState } from 'react'

export default function BmiCalculator() {
  const [cm, setCm] = useState(175)
  const [kg, setKg] = useState(70)

  const bmi = useMemo(() => {
    const h = Number(cm) / 100
    const w = Number(kg)
    if (!h || !w) return null
    return Math.round((w / (h * h)) * 10) / 10
  }, [cm, kg])

  const category = !bmi
    ? ''
    : bmi < 18.5
      ? 'niedowaga'
      : bmi < 25
        ? 'waga prawidłowa'
        : bmi < 30
          ? 'nadwaga'
          : 'otyłość'

  return (
    <div className="tool">
      <div className="row">
        <label>
          Wzrost (cm)
          <input type="number" value={cm} onChange={(e) => setCm(e.target.value)} />
        </label>
        <label>
          Masa (kg)
          <input type="number" value={kg} onChange={(e) => setKg(e.target.value)} />
        </label>
      </div>
      {bmi && (
        <div className="result-box">
          <span className="result-value">{bmi}</span>
          <span>BMI — {category}</span>
        </div>
      )}
    </div>
  )
}
