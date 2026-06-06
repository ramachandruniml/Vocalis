interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function MetricCard({ label, value, sub, accent }: Props) {
  return (
    <div className={`rounded-lg p-4 border ${accent ? "border-accent-dim bg-accent/5" : "border-border bg-card"}`}>
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1 font-mono">{label}</p>
      <p className={`text-2xl font-display font-bold ${accent ? "text-accent" : "text-zinc-100"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-600 mt-0.5 font-mono">{sub}</p>}
    </div>
  )
}