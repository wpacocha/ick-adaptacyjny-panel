import ToolIcon from './ToolIcon'

export default function Sidebar({
  user,
  sidebarTools,
  stats,
  activeId,
  onOpen,
  onTogglePin,
  onMovePin,
  onReset,
  confirmReset,
  onLogout,
}) {
  const pinnedInSidebar = sidebarTools.filter((t) => stats[t.id]?.pinned)

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
        <h2>Skróty</h2>
        <div className="nav-list">
          {sidebarTools.map((tool) => {
            const s = stats[tool.id]
            const pinned = Boolean(s?.pinned)
            const isActive = activeId === tool.id
            const pinnedIndex = pinnedInSidebar.findIndex((t) => t.id === tool.id)

            return (
              <div key={tool.id} className="nav-item-wrap">
                <button
                  type="button"
                  className={`nav-item${isActive ? ' active' : ''}`}
                  onClick={() => onOpen(tool.id)}
                  title={tool.name}
                >
                  <span className="nav-icon" aria-hidden>
                    <ToolIcon tool={tool} />
                  </span>
                  <span className="nav-text">
                    <span className="nav-name">{tool.name}</span>
                  </span>
                </button>
                <div className="nav-actions">
                  {pinned && (
                    <div className="pin-order-btns">
                      <button
                        type="button"
                        className="icon-btn tiny"
                        onClick={() => onMovePin(tool.id, -1)}
                        disabled={pinnedIndex <= 0}
                        title="Wyżej"
                        aria-label="Przenieś wyżej"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="icon-btn tiny"
                        onClick={() => onMovePin(tool.id, 1)}
                        disabled={pinnedIndex < 0 || pinnedIndex >= pinnedInSidebar.length - 1}
                        title="Niżej"
                        aria-label="Przenieś niżej"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    className={`pin-btn${pinned ? ' pinned' : ''}`}
                    onClick={() => onTogglePin(tool.id)}
                    title={pinned ? 'Odepnij' : 'Przypnij'}
                    aria-label={pinned ? 'Odepnij' : 'Przypnij'}
                  >
                    📌
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

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
