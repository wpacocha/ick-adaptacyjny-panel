import { useState } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState(null)
  const [op, setOp] = useState(null)
  const [fresh, setFresh] = useState(true)

  const inputDigit = (d) => {
    if (fresh) {
      setDisplay(d)
      setFresh(false)
    } else {
      setDisplay(display === '0' ? d : display + d)
    }
  }

  const inputDot = () => {
    if (fresh) {
      setDisplay('0.')
      setFresh(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const applyOp = (nextOp) => {
    const current = parseFloat(display)
    if (prev !== null && op && !fresh) {
      const result = compute(prev, current, op)
      setDisplay(String(result))
      setPrev(result)
    } else {
      setPrev(current)
    }
    setOp(nextOp)
    setFresh(true)
  }

  const equals = () => {
    if (prev === null || !op) return
    const result = compute(prev, parseFloat(display), op)
    setDisplay(String(result))
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const keys = [
    ['C', clear, 'wide'],
    ['÷', () => applyOp('/')],
    ['7', () => inputDigit('7')],
    ['8', () => inputDigit('8')],
    ['9', () => inputDigit('9')],
    ['×', () => applyOp('*')],
    ['4', () => inputDigit('4')],
    ['5', () => inputDigit('5')],
    ['6', () => inputDigit('6')],
    ['−', () => applyOp('-')],
    ['1', () => inputDigit('1')],
    ['2', () => inputDigit('2')],
    ['3', () => inputDigit('3')],
    ['+', () => applyOp('+')],
    ['0', () => inputDigit('0'), 'wide'],
    ['.', inputDot],
    ['=', equals],
  ]

  return (
    <div className="tool calc">
      <div className="calc-display">{display}</div>
      <div className="calc-grid">
        {keys.map(([label, fn, wide]) => (
          <button
            key={label}
            type="button"
            className={`calc-key${wide ? ' wide' : ''}${label === '=' ? ' accent' : ''}`}
            onClick={fn}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function compute(a, b, op) {
  switch (op) {
    case '+':
      return round(a + b)
    case '-':
      return round(a - b)
    case '*':
      return round(a * b)
    case '/':
      return b === 0 ? 'Błąd' : round(a / b)
    default:
      return b
  }
}

function round(n) {
  return Math.round(n * 1e10) / 1e10
}
