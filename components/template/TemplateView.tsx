export function TemplateView() {
  // TODO: build TemplateView
  return (
    <div className="flex h-full flex-col">
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "0.5px solid var(--color-border, #222)",
          fontFamily: "'Syne', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-foreground, #fff)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "var(--color-muted, #666)" }}>
          TemplateView — coming next
        </p>
      </div>
    </div>
  )
}
