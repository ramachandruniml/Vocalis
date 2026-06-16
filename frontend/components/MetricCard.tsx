interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function MetricCard({ label, value, sub, accent }: Props) {
  return (
    <div
      className="rounded-xl p-4"
      style={
        accent
          ? { background: "rgba(125,211,252,0.06)", border: "1px solid rgba(125,211,252,0.22)" }
          : { background: "rgba(8,24,50,0.55)", border: "1px solid rgba(125,211,252,0.1)" }
      }
    >
      <p className="label-mono mb-1">{label}</p>
      <p
        className="text-2xl font-display font-bold"
        style={{ color: accent ? "#7dd3fc" : "#e0f2fe" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs font-mono mt-0.5" style={{ color: "rgba(125,211,252,0.35)" }}>
          {sub}
        </p>
      )}
    </div>
  )
}
