import { useMemo, useState } from 'react'

export default function ColorPicker() {
  const [hex, setHex] = useState('#0f766e')

  const rgb = useMemo(() => hexToRgb(hex), [hex])

  return (
    <div className="tool">
      <div className="color-preview" style={{ background: hex }} />
      <div className="row">
        <label>
          Kolor
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} />
        </label>
        <label>
          HEX
          <input
            value={hex}
            onChange={(e) => {
              let v = e.target.value.trim()
              if (!v.startsWith('#')) v = `#${v}`
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setHex(v.toLowerCase())
            }}
          />
        </label>
      </div>
      {rgb && (
        <div className="result-box">
          RGB({rgb.r}, {rgb.g}, {rgb.b})
        </div>
      )}
    </div>
  )
}

function hexToRgb(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}
