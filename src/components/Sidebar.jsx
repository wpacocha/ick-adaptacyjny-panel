export default function Sidebar({
  sidebarTools,
  stats,
  scores,
  formatScore,
  activeId,
  onOpen,
  onTogglePin,
  onReset,
  confirmReset,
  explainTool,
  buttonScale,
  showWhy,
  onToggleWhy,
  enlargeButtons,
  onToggleEnlarge,
  onShowAll,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">AP</div>
        <h1>Adaptacyjny panel</h1>
      </div>

      <section className="nav-section">
        <h2>Najczęściej używane</h2>
        <div className="nav-list">
          {sidebarTools.map((tool) => {
            const s = stats[tool.id]
            const score = scores[tool.id] || 0
            const scale = enlargeButtons ? buttonScale(tool.id) : 1
            const isActive = activeId === tool.id

            return (
              <div key={tool.id} className="nav-item-wrap">
                <button
                  type="button"
                  className={`nav-item${isActive ? ' active' : ''}`}
                  style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}
                  onClick={() => onOpen(tool.id)}
                  title={showWhy ? explainTool(tool.id) : tool.name}
                >
                  <span className="nav-icon" aria-hidden>
                    {tool.icon}
                  </span>
                  <span className="nav-text">
                    <span className="nav-name">{tool.name}</span>
                    <span className="nav-uses">
                      {s.uses} · waga {formatScore(score)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className={`pin-btn${s.pinned ? ' pinned' : ''}`}
                  onClick={() => onTogglePin(tool.id)}
                  title={s.pinned ? 'Odepnij' : 'Przypnij'}
                  aria-label={s.pinned ? 'Odepnij' : 'Przypnij'}
                >
                  📌
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <button type="button" className="btn ghost full" onClick={onShowAll}>
        Wszystkie narzędzia
      </button>

      <div className="sidebar-footer">
        <label className="toggle-row">
          <input type="checkbox" checked={showWhy} onChange={onToggleWhy} />
          „Dlaczego tak?”
        </label>
        <label className="toggle-row">
          <input type="checkbox" checked={enlargeButtons} onChange={onToggleEnlarge} />
          Powiększaj popularne
        </label>
        <button
          type="button"
          className={`btn reset-btn full${confirmReset ? ' confirm' : ''}`}
          onClick={onReset}
        >
          {confirmReset ? 'Potwierdź reset' : 'Reset historii'}
        </button>
      </div>
    </aside>
  )
}
