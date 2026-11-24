export default function ToolIcon({ tool, className = '' }) {
  if (tool?.iconUrl) {
    return (
      <img
        className={`tool-favicon${className ? ` ${className}` : ''}`}
        src={tool.iconUrl}
        alt=""
        width={24}
        height={24}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <span className={className || undefined} aria-hidden>
      {tool?.icon}
    </span>
  )
}
