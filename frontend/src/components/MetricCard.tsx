interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function MetricCard({ label, value, sub, accent }: Props) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${accent ? "var(--accent-dim)" : "var(--border)"}`,
      borderRadius: "8px",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
    }}>
      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: "1.5rem", fontFamily: "var(--font-display)", fontWeight: 700, color: accent ? "var(--accent)" : "var(--text-primary)" }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{sub}</span>}
    </div>
  )
}