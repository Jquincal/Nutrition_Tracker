export default function MacroCard({ label, value = 0, goal = 0, unit, color }) {
  const pct = Math.min(100, Math.round((Number(value) / Math.max(Number(goal), 1)) * 100))
  return <article className="macro-card"><div className="row"><span>{label}</span><strong>{Math.round(value)}<small> / {Math.round(goal)} {unit}</small></strong></div><div className="progress"><span style={{ width: `${pct}%`, background: color }} /></div><small>{pct}% del objetivo</small></article>
}
