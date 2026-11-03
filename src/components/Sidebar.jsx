export default function Sidebar({
  user,
  sidebarTools,
  stats,
  activeId,
  onOpen,
  onTogglePin,
  onReset,
  confirmReset,
  onShowAll,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">AP</div>
        <h1>Adaptacyjny panel</h1>
      </div>

      <div className="user-box">
        <div className="user-avatar" aria-hidden>
          {user.username.slice(0, 1).toUpperCase()}
        </div>
        <div className="user-meta">
          <strong>{user.username}</strong>
          <button type="button" className="linkish dark" onClick={onLogout}>
            Wyloguj
          </button>
        </div>
      </div>

      <section className="nav-section">
        <h2>Najczęściej używane</h2>
        <div className="nav-list">
          {sidebarTools.map((tool) => {
            const s = stats[tool.id]
            const isActive = activeId === tool.id

            return (
              <div key={tool.id} className="nav-item-wrap">
                <button
                  type="button"
                  className={`nav-item${isActive ? ' active' : ''}`}
                  onClick={() => onOpen(tool.id)}
                  title={tool.name}
                >
                  <span className="nav-icon" aria-hidden>
                    {tool.icon}
                  </span>
                  <span className="nav-text">
                    <span className="nav-name">{tool.name}</span>
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
