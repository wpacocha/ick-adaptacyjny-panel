import { useState } from 'react'

const LOWER = 'abcdefghijkmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%&*?-_'

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [upper, setUpper] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    let alphabet = LOWER
    if (upper) alphabet += UPPER
    if (digits) alphabet += DIGITS
    if (symbols) alphabet += SYMBOLS
    const arr = new Uint32Array(length)
    crypto.getRandomValues(arr)
    const pwd = Array.from(arr, (n) => alphabet[n % alphabet.length]).join('')
    setPassword(pwd)
    setCopied(false)
  }

  const copy = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
  }

  return (
    <div className="tool">
      <label className="stack">
        Długość: {length}
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
        />
      </label>
      <div className="checks">
        <label>
          <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          Wielkie litery
        </label>
        <label>
          <input type="checkbox" checked={digits} onChange={(e) => setDigits(e.target.checked)} />
          Cyfry
        </label>
        <label>
          <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
          Symbole
        </label>
      </div>
      <div className="btn-row">
        <button type="button" className="btn primary" onClick={generate}>
          Generuj
        </button>
        <button type="button" className="btn" onClick={copy} disabled={!password}>
          {copied ? 'Skopiowano' : 'Kopiuj'}
        </button>
      </div>
      {password && <div className="mono-box">{password}</div>}
    </div>
  )
}
