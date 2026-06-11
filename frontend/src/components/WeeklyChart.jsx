import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatWeekData } from './weeklyChartData'

const tooltipValue = (value, name) => [Math.round(Number(value)), name === 'Proteína' ? 'Proteína (g)' : 'Calorías (kcal)']
const legendValue = (value) => <span style={{ color: 'var(--muted)' }}>{value === 'Calorías' ? 'Calorías (kcal)' : 'Proteína (g)'}</span>

export default function WeeklyChart({ data = [], proteinGoal = 150 }) {
  const formatted = formatWeekData(data)
  const summary = formatted.map((item) => `${item.day}: ${Math.round(item.calories)} kcal, ${Math.round(item.protein)} g de proteína`).join('. ')

  return <div className="chart" aria-label="Calorías y proteína consumidas durante los últimos siete días">
    <div className="sr-only" role="status">{summary || 'Todavía no hay consumo registrado esta semana.'}</div>
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={formatted} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
        <YAxis yAxisId="calories" hide />
        <YAxis yAxisId="protein" orientation="right" hide />
        <Tooltip formatter={tooltipValue} contentStyle={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, color: 'var(--ink)' }} />
        <Legend formatter={legendValue} />
        <ReferenceLine yAxisId="protein" y={Number(proteinGoal || 0)} stroke="var(--chart-goal)" strokeDasharray="4 4" label={{ value: 'Meta proteína', position: 'insideTopRight', fill: 'var(--muted)', fontSize: 11 }} />
        <Bar yAxisId="calories" dataKey="calories" name="Calorías" fill="var(--chart-calories)" radius={[7, 7, 0, 0]} />
        <Line yAxisId="protein" dataKey="protein" name="Proteína" type="monotone" stroke="var(--chart-protein)" strokeWidth={3} dot={{ r: 4, fill: 'var(--chart-protein)' }} activeDot={{ r: 6 }} />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
}
