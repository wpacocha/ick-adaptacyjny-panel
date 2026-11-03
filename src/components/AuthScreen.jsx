import { useState } from 'react'

export default function AuthScreen({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const action = mode === 'login' ? onLogin : onRegister
    const result = await action(username, password)
    setBusy(false)
    if (!result.ok) setError(result.error)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">AP</div>
          <h1>Adaptacyjny panel</h1>
        </div>

        <div className="chip-row auth-tabs">
          <button
            type="button"
            className={`chip${mode === 'login' ? ' active' : ''}`}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            Logowanie
          </button>
          <button
            type="button"
            className={`chip${mode === 'register' ? ' active' : ''}`}
            onClick={() => {
              setMode('register')
              setError('')
            }}
          >
            Rejestracja
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label className="stack">
            Nazwa użytkownika
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="stack">
            Hasło
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn primary full" disabled={busy}>
            {busy ? '…' : mode === 'login' ? 'Zaloguj' : 'Utwórz konto'}
          </button>
        </form>
      </div>
    </div>
  )
}
