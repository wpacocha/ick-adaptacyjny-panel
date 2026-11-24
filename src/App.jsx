import { useEffect, useRef, useState } from 'react'
import AuthScreen from './components/AuthScreen'
import Sidebar from './components/Sidebar'
import ToolIcon from './components/ToolIcon'
import { UserProvider } from './context/UserContext'
import { toolsById } from './data/tools'
import { useAuth } from './hooks/useAuth'
import { useCustomApps } from './hooks/useCustomApps'
import { useToolStats } from './hooks/useToolStats'

export default function App() {
  const { currentUser, login, register, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <AuthScreen onLogin={login} onRegister={register} />
  }

  return (
    <UserProvider user={currentUser}>
      <Panel user={currentUser} onLogout={logout} />
    </UserProvider>
  )
}

function Panel({ user, onLogout }) {
  const { customTools, addApp, removeApp } = useCustomApps(user.id)
  const {
    stats,
    activeId,
    setActiveId,
    openTool,
    togglePin,
    toggleHide,
    movePin,
    resetStats,
    removeToolStats,
    sortedTools,
    pinnedTools,
    hiddenTools,
    sidebarTools,
  } = useToolStats(user.id, customTools)

  const [confirmReset, setConfirmReset] = useState(false)
  const [flashAll, setFlashAll] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [hiddenOpen, setHiddenOpen] = useState(false)
  const [webName, setWebName] = useState('')
  const [webUrl, setWebUrl] = useState('')
  const [webError, setWebError] = useState('')
  const toolsHomeRef = useRef(null)
  const nameInputRef = useRef(null)

  const active = activeId
    ? customTools.find((t) => t.id === activeId) || toolsById[activeId]
    : null
  const ActiveTool = active?.Component

  const closeAddModal = () => {
    setAddOpen(false)
    setWebName('')
    setWebUrl('')
    setWebError('')
  }

  useEffect(() => {
    if (!addOpen) return
    const id = window.setTimeout(() => nameInputRef.current?.focus(), 0)
    const onKey = (e) => {
      if (e.key === 'Escape') closeAddModal()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [addOpen])

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    resetStats()
    setConfirmReset(false)
  }

  const showAll = () => {
    setActiveId(null)
    requestAnimationFrame(() => {
      toolsHomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setFlashAll(true)
      window.setTimeout(() => setFlashAll(false), 700)
    })
  }

  const handleAddWebApp = (e) => {
    e.preventDefault()
    const result = addApp(webName, webUrl)
    if (!result.ok) {
      setWebError(result.error)
      return
    }
    closeAddModal()
  }

  const handleRemoveWebApp = (id) => {
    removeApp(id)
    removeToolStats(id)
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        sidebarTools={sidebarTools}
        stats={stats}
        activeId={activeId}
        onOpen={openTool}
        onTogglePin={togglePin}
        onMovePin={movePin}
        onReset={handleReset}
        confirmReset={confirmReset}
        onLogout={onLogout}
      />

      <main className="workspace">
        {active && ActiveTool ? (
          <>
            <header className="workspace-header">
              <div className="workspace-title">
                <button type="button" className="back-btn" onClick={showAll} aria-label="Wróć">
                  ←
                </button>
                <span className="workspace-icon">
                  <ToolIcon tool={active} />
                </span>
                <div>
                  <h2>{active.name}</h2>
                </div>
              </div>
              <div className="header-actions">
                <button
                  type="button"
                  className={`btn pin-action${stats[active.id]?.pinned ? ' pinned' : ''}`}
                  onClick={() => togglePin(active.id)}
                >
                  {stats[active.id]?.pinned ? 'Odepnij' : 'Przypnij'}
                </button>
                <button type="button" className="btn ghost" onClick={() => toggleHide(active.id)}>
                  Ukryj
                </button>
                <button
                  type="button"
                  className={`btn reset-btn${confirmReset ? ' confirm' : ''}`}
                  onClick={handleReset}
                >
                  {confirmReset ? 'Potwierdź reset' : 'Reset historii'}
                </button>
              </div>
            </header>
            <div className="workspace-body">
              <ActiveTool />
            </div>
          </>
        ) : (
          <div
            className={`workspace-body tools-home${flashAll ? ' flash' : ''}`}
            ref={toolsHomeRef}
          >
            <div className="tools-home-bar">
              <div className="tools-home-title">
                <h2>Narzędzia</h2>
                <button
                  type="button"
                  className="add-app-btn"
                  onClick={() => setAddOpen(true)}
                  title="Dodaj aplikację webową"
                  aria-label="Dodaj aplikację webową"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className={`btn reset-btn${confirmReset ? ' confirm' : ''}`}
                onClick={handleReset}
              >
                {confirmReset ? 'Potwierdź reset' : 'Reset historii'}
              </button>
            </div>

            {pinnedTools.length > 0 && (
              <section className="pin-section">
                <h3>Przypięte</h3>
                <div className="welcome-grid">
                  {pinnedTools.map((tool, index) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      pinned
                      pinIndex={index}
                      pinCount={pinnedTools.length}
                      onOpen={() => openTool(tool.id)}
                      onTogglePin={() => togglePin(tool.id)}
                      onToggleHide={() => toggleHide(tool.id)}
                      onMoveUp={() => movePin(tool.id, -1)}
                      onMoveDown={() => movePin(tool.id, 1)}
                      onRemove={
                        tool.kind === 'web' ? () => handleRemoveWebApp(tool.id) : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="pin-section">
              <h3>{pinnedTools.length > 0 ? 'Pozostałe' : 'Wszystkie'}</h3>
              <div className="welcome-grid">
                {sortedTools
                  .filter((tool) => !stats[tool.id]?.pinned)
                  .map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      pinned={false}
                      onOpen={() => openTool(tool.id)}
                      onTogglePin={() => togglePin(tool.id)}
                      onToggleHide={() => toggleHide(tool.id)}
                      onRemove={
                        tool.kind === 'web' ? () => handleRemoveWebApp(tool.id) : undefined
                      }
                    />
                  ))}
              </div>
            </section>

            <section className="pin-section hidden-fold">
              <button
                type="button"
                className={`fold-toggle${hiddenOpen ? ' open' : ''}`}
                onClick={() => setHiddenOpen((v) => !v)}
                aria-expanded={hiddenOpen}
              >
                <span className="fold-chevron" aria-hidden>
                  ▸
                </span>
                <span>Ukryte</span>
                <span className="fold-count">{hiddenTools.length}</span>
              </button>
              {hiddenOpen && (
                <div className="fold-body">
                  {hiddenTools.length === 0 ? (
                    <p className="fold-empty">Brak ukrytych aplikacji.</p>
                  ) : (
                    <div className="welcome-grid">
                      {hiddenTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          pinned={false}
                          hidden
                          onOpen={() => openTool(tool.id)}
                          onToggleHide={() => toggleHide(tool.id)}
                          onRemove={
                            tool.kind === 'web' ? () => handleRemoveWebApp(tool.id) : undefined
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {confirmReset && (
          <div className="toast">
            Potwierdź reset, aby wyczyścić historię.{' '}
            <button type="button" className="linkish" onClick={() => setConfirmReset(false)}>
              Anuluj
            </button>
          </div>
        )}

        {addOpen && (
          <div className="modal-backdrop" onClick={closeAddModal}>
            <div
              className="modal-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-app-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 id="add-app-title">Nowa aplikacja webowa</h3>
                <button
                  type="button"
                  className="icon-btn tiny"
                  onClick={closeAddModal}
                  aria-label="Zamknij"
                >
                  ×
                </button>
              </div>
              <form className="modal-form" onSubmit={handleAddWebApp}>
                <label className="stack">
                  Nazwa
                  <input
                    ref={nameInputRef}
                    value={webName}
                    onChange={(e) => setWebName(e.target.value)}
                    placeholder="np. Gmail"
                  />
                </label>
                <label className="stack">
                  Adres URL
                  <input
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="np. gmail.com"
                    required
                  />
                </label>
                {webError && <p className="webapp-error">{webError}</p>}
                <p className="webapp-hint">Ikona pobierze się automatycznie z favikony strony.</p>
                <div className="modal-actions">
                  <button type="button" className="btn ghost" onClick={closeAddModal}>
                    Anuluj
                  </button>
                  <button type="submit" className="btn primary">
                    Dodaj
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function HideIcon({ reveal = false }) {
  if (reveal) {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden focusable="false">
        <path
          fill="currentColor"
          d="M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5A2.5 2.5 0 1 0 12 9a2.5 2.5 0 0 0 0 5z"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M3.27 2 2 3.27 5.11 6.4C3.29 7.83 1.9 9.75 1 12c1.73 3.89 6 7 11 7 1.55 0 3.03-.3 4.38-.84L18.73 21 20 19.73 3.27 2zM12 17c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.19-.06.38-.06.57a3 3 0 0 0 3 3c.19 0 .38-.03.57-.06l1.57 1.57A4.97 4.97 0 0 1 12 17zm9.82-1.36-2.1-2.1c.18-.48.28-1 .28-1.54 0-2.76-2.24-5-5-5-.54 0-1.06.1-1.54.28L10.9 4.72A11.3 11.3 0 0 1 12 5c5 0 9.27 3.11 11 7-.55 1.23-1.4 2.36-2.18 3.64z"
      />
    </svg>
  )
}

function ToolCard({
  tool,
  pinned,
  hidden = false,
  pinIndex = 0,
  pinCount = 0,
  onOpen,
  onTogglePin,
  onToggleHide,
  onMoveUp,
  onMoveDown,
  onRemove,
}) {
  return (
    <div
      className={`welcome-card${pinned ? ' pinned' : ''}${hidden ? ' is-hidden' : ''}${tool.kind === 'web' ? ' web' : ''}`}
    >
      <div className="card-top-actions">
        {pinned && (
          <>
            <button
              type="button"
              className="icon-btn tiny"
              onClick={onMoveUp}
              disabled={pinIndex === 0}
              title="Wyżej"
              aria-label="Przenieś wyżej"
            >
              ↑
            </button>
            <button
              type="button"
              className="icon-btn tiny"
              onClick={onMoveDown}
              disabled={pinIndex >= pinCount - 1}
              title="Niżej"
              aria-label="Przenieś niżej"
            >
              ↓
            </button>
          </>
        )}
        {onRemove && (
          <button
            type="button"
            className="icon-btn tiny danger"
            onClick={onRemove}
            title="Usuń"
            aria-label="Usuń aplikację"
          >
            ×
          </button>
        )}
        {onToggleHide && (
          <button
            type="button"
            className={`icon-btn tiny hide-btn${hidden ? ' active' : ''}`}
            onClick={onToggleHide}
            title={hidden ? 'Pokaż' : 'Ukryj'}
            aria-label={hidden ? 'Pokaż narzędzie' : 'Ukryj narzędzie'}
          >
            <HideIcon reveal={hidden} />
          </button>
        )}
        {!hidden && onTogglePin && (
          <button
            type="button"
            className={`pin-btn corner${pinned ? ' pinned' : ''}`}
            onClick={onTogglePin}
            title={pinned ? 'Odepnij' : 'Przypnij'}
            aria-label={pinned ? 'Odepnij' : 'Przypnij'}
          >
            📌
          </button>
        )}
      </div>
      <button type="button" className="welcome-card-main" onClick={onOpen} disabled={hidden}>
        <ToolIcon tool={tool} className="card-icon" />
        <strong>{tool.name}</strong>
        {tool.kind === 'web' && <span className="card-url">{safeHost(tool.url)}</span>}
      </button>
    </div>
  )
}

function safeHost(url) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}
