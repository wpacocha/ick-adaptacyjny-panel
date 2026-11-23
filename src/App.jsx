import { useRef, useState } from 'react'
import AuthScreen from './components/AuthScreen'
import Sidebar from './components/Sidebar'
import { UserProvider } from './context/UserContext'
import { toolsById } from './data/tools'
import { useAuth } from './hooks/useAuth'
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
  const {
    stats,
    activeId,
    setActiveId,
    openTool,
    togglePin,
    movePin,
    resetStats,
    sortedTools,
    pinnedTools,
    sidebarTools,
  } = useToolStats(user.id)

  const [confirmReset, setConfirmReset] = useState(false)
  const [flashAll, setFlashAll] = useState(false)
  const toolsHomeRef = useRef(null)

  const active = activeId ? toolsById[activeId] : null
  const ActiveTool = active?.Component
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
        {active ? (
          <>
            <header className="workspace-header">
              <div className="workspace-title">
                <button type="button" className="back-btn" onClick={showAll} aria-label="Wróć">
                  ←
                </button>
                <span className="workspace-icon">{active.icon}</span>
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
              <h2>Narzędzia</h2>
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
                      onMoveUp={() => movePin(tool.id, -1)}
                      onMoveDown={() => movePin(tool.id, 1)}
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
                    />
                  ))}
              </div>
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
      </main>
    </div>
  )
}

function ToolCard({
  tool,
  pinned,
  pinIndex = 0,
  pinCount = 0,
  onOpen,
  onTogglePin,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <div className={`welcome-card${pinned ? ' pinned' : ''}`}>
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
        <button
          type="button"
          className={`pin-btn corner${pinned ? ' pinned' : ''}`}
          onClick={onTogglePin}
          title={pinned ? 'Odepnij' : 'Przypnij'}
          aria-label={pinned ? 'Odepnij' : 'Przypnij'}
        >
          📌
        </button>
      </div>
      <button type="button" className="welcome-card-main" onClick={onOpen}>
        <span>{tool.icon}</span>
        <strong>{tool.name}</strong>
      </button>
    </div>
  )
}
