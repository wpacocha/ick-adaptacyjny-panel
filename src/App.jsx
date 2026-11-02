import { useState } from 'react'
import Sidebar from './components/Sidebar'
import { toolsById } from './data/tools'
import { useToolStats } from './hooks/useToolStats'

export default function App() {
  const {
    stats,
    scores,
    activeId,
    setActiveId,
    openTool,
    togglePin,
    resetStats,
    sortedTools,
    sidebarTools,
    explainTool,
    buttonScale,
    formatScore,
  } = useToolStats()

  const [showWhy, setShowWhy] = useState(false)
  const [enlargeButtons, setEnlargeButtons] = useState(true)
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
        sidebarTools={sidebarTools}
        stats={stats}
        scores={scores}
        formatScore={formatScore}
        activeId={activeId}
        onOpen={openTool}
        onTogglePin={togglePin}
        onReset={handleReset}
        confirmReset={confirmReset}
        explainTool={explainTool}
        buttonScale={buttonScale}
        showWhy={showWhy}
        onToggleWhy={() => setShowWhy((v) => !v)}
        enlargeButtons={enlargeButtons}
        onToggleEnlarge={() => setEnlargeButtons((v) => !v)}
        onShowAll={showAll}
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
                {showWhy && (
                  <aside className="why-box">
                    <strong>Dlaczego tu?</strong>
                    <p>{explainTool(active.id)}</p>
                  </aside>
                )}
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
                  title={showWhy ? explainTool(tool.id) : undefined}
                >
                  <span>{tool.icon}</span>
                  <strong>{tool.name}</strong>
                  <em>
                    {stats[tool.id].uses} · waga {formatScore(scores[tool.id] || 0)}
                  </em>
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
