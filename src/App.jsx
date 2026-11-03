import { useState } from 'react'
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
    resetStats,
    sortedTools,
    sidebarTools,
  } = useToolStats(user.id)

  const [confirmReset, setConfirmReset] = useState(false)

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

  const showAll = () => setActiveId(null)

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        sidebarTools={sidebarTools}
        stats={stats}
        activeId={activeId}
        onOpen={openTool}
        onTogglePin={togglePin}
        onReset={handleReset}
        confirmReset={confirmReset}
        onShowAll={showAll}
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
          <div className="workspace-body tools-home">
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
            <div className="welcome-grid">
              {sortedTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={`welcome-card${stats[tool.id]?.pinned ? ' pinned' : ''}`}
                  onClick={() => openTool(tool.id)}
                >
                  <span>{tool.icon}</span>
                  <strong>{tool.name}</strong>
                </button>
              ))}
            </div>
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
