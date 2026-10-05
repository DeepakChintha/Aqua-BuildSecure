import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { healthSeries, appointmentFlow, revenueSeries } from '../data'
import { Card } from './ui'

const axis = { fontSize: 11, fill: '#7B8794' }
const tooltipStyle = { border: '1px solid #D9E2EC', borderRadius: 12, boxShadow: '0 12px 30px rgba(16,42,67,0.12)', background: '#FFFFFF' }

export function HealthTrendChart({ metric = 'heart', height = 220 }: { metric?: 'heart' | 'systolic' | 'glucose' | 'weight'; height?: number }) {
  const key = metric === 'heart' ? 'heart' : metric === 'systolic' ? 'systolic' : metric === 'glucose' ? 'glucose' : 'weight'
  const color = metric === 'heart' ? '#087F8C' : metric === 'systolic' ? '#526A95' : metric === 'glucose' ? '#F59E0B' : '#16A34A'
  return <ResponsiveContainer width="100%" height={height}><LineChart data={healthSeries} margin={{ top: 10, right: 4, bottom: 0, left: -24 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={axis} /><YAxis axisLine={false} tickLine={false} tick={axis} /><Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#B9D8D4' }} /><Line type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{ r: 3, fill: '#FFFFFF', stroke: color, strokeWidth: 2 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer>
}

export function RevenueAreaChart({ height = 258 }: { height?: number }) {
  return <ResponsiveContainer width="100%" height={height}><AreaChart data={revenueSeries} margin={{ top: 10, right: 8, bottom: 0, left: -22 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16B8A6" stopOpacity={0.22} /><stop offset="100%" stopColor="#16B8A6" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={axis} /><YAxis axisLine={false} tickLine={false} tick={axis} tickFormatter={(value) => `$${value}k`} /><Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value}k`, 'Revenue']} /><Area type="monotone" dataKey="revenue" stroke="#087F8C" strokeWidth={3} fill="url(#revenueFill)" /></AreaChart></ResponsiveContainer>
}

export function AppointmentFlowChart({ height = 268 }: { height?: number }) {
  return <ResponsiveContainer width="100%" height={height}><BarChart data={appointmentFlow} margin={{ top: 12, right: 8, bottom: 0, left: -22 }} barGap={5}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" /><XAxis dataKey="department" axisLine={false} tickLine={false} tick={axis} /><YAxis axisLine={false} tickLine={false} tick={axis} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="upcoming" fill="#087F8C" radius={[5, 5, 0, 0]} /><Bar dataKey="completed" fill="#16B8A6" radius={[5, 5, 0, 0]} /><Bar dataKey="cancelled" fill="#F59E0B" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
}

export function OccupancyChart() {
  const data = [{ name: 'General', value: 48, color: '#087F8C' }, { name: 'ICU', value: 28, color: '#526A95' }, { name: 'Emergency', value: 24, color: '#16B8A6' }]
  return <div className="occupancy-wrap"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius="68%" outerRadius="92%" paddingAngle={4} dataKey="value" stroke="none">{data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>78%</strong><span>occupied</span></div></div><div className="legend-list">{data.map((item) => <div key={item.name}><span className="legend-dot" style={{ background: item.color }} /><span>{item.name}</span><strong>{item.value}%</strong></div>)}</div></div>
}

export function MiniSparkline({ color = '#087F8C' }: { color?: string }) {
  return <ResponsiveContainer width="100%" height={42}><LineChart data={revenueSeries}><Line type="monotone" dataKey="revenue" stroke={color} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
}

export function ChartCard({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <Card className="chart-card"><div className="chart-head"><div><h3>{title}</h3>{description && <p>{description}</p>}</div>{action}</div>{children}</Card>
}
