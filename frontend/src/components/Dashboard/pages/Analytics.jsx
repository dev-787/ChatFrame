import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid
} from 'recharts';
import './Analytics.scss';

const METRICS = [
  { label: 'Avg Resolution Time',    value: '3m 12s', delta: '-22s',  color: 'green'  },
  { label: 'Escalation Rate',        value: '8.4%',   delta: '-1.2%', color: 'green'  },
  { label: 'Customer Satisfaction',  value: '4.8 ★',  delta: '+0.2',  color: 'green'  },
  { label: 'AI Confidence Avg',      value: '81%',    delta: '+3%',   color: 'blue'   },
];

const TREND_DATA = [
  { day: 'Mon', tickets: 55 },
  { day: 'Tue', tickets: 72 },
  { day: 'Wed', tickets: 61 },
  { day: 'Thu', tickets: 88 },
  { day: 'Fri', tickets: 70 },
  { day: 'Sat', tickets: 95 },
  { day: 'Sun', tickets: 80 },
];

const HOURS_DATA = [
  { hour: '9am',  vol: 12 },
  { hour: '10am', vol: 28 },
  { hour: '11am', vol: 45 },
  { hour: '12pm', vol: 38 },
  { hour: '1pm',  vol: 22 },
  { hour: '2pm',  vol: 55 },
  { hour: '3pm',  vol: 62 },
  { hour: '4pm',  vol: 40 },
  { hour: '5pm',  vol: 18 },
];

const AGENT_DATA = [
  { name: 'Sarah K.', tickets: 42, csat: '4.9', time: '2m 10s' },
  { name: 'Mike L.',  tickets: 31, csat: '4.7', time: '3m 45s' },
  { name: 'Tom A.',   tickets: 28, csat: '4.8', time: '2m 58s' },
  { name: 'AI',       tickets: 89, csat: '4.6', time: '0m 12s' },
];

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      <div className="chart-tooltip__value">{payload[0].value} tickets</div>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      <div className="chart-tooltip__value">{payload[0].value} queries</div>
    </div>
  );
};

const Analytics = () => (
  <div className="db-page analytics">
    <div className="db-page__header">
      <h1 className="db-page__title">Analytics</h1>
      <p className="db-page__sub">Business intelligence and performance metrics.</p>
    </div>

    {/* Top stats */}
    <div className="stats-grid">
      {METRICS.map(m => (
        <div key={m.label} className="stat-card">
          <div className="stat-card__label">{m.label}</div>
          <div className="stat-card__value">{m.value}</div>
          <div className={`badge badge--${m.color}`}>{m.delta}</div>
        </div>
      ))}
    </div>

    {/* Charts row */}
    <div className="two-col" style={{ marginBottom: 16 }}>

      {/* Ticket trends — bar */}
      <div className="db-card analytics__chart-card">
        <div className="analytics__chart-header">
          <span className="analytics__chart-title">Ticket Trends — 7 days</span>
          <span className="badge badge--ghost">This week</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={TREND_DATA}
            margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
            barCategoryGap="30%"
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(240,240,240,0.3)', fontSize: 11 }}
            />
            <YAxis hide />
            <Tooltip
              content={<BarTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }}
            />
            <Bar dataKey="tickets" radius={[5, 5, 0, 0]} maxBarSize={40}>
              {TREND_DATA.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 5
                    ? 'rgba(160,255,180,0.55)'
                    : 'rgba(255,255,255,0.08)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Busiest hours — line */}
      <div className="db-card analytics__chart-card">
        <div className="analytics__chart-header">
          <span className="analytics__chart-title">Busiest Support Hours</span>
          <span className="badge badge--ghost">Today</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={HOURS_DATA}
            margin={{ top: 4, right: 8, left: -28, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(240,240,240,0.3)', fontSize: 10 }}
            />
            <YAxis hide />
            <Tooltip
              content={<LineTooltip />}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="vol"
              stroke="rgba(120,180,255,0.7)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: 'rgba(120,180,255,0.9)',
                stroke: '#0f0f0f',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* AI vs Human donut + agent table */}
    <div className="two-col">

      {/* Donut */}
      <div className="db-card analytics__donut-card">
        <div className="analytics__chart-header">
          <span className="analytics__chart-title">AI vs Human Handled</span>
        </div>
        <div className="analytics__donut-wrap">
          <svg viewBox="0 0 80 80" className="analytics__donut">
            <circle
              cx="40" cy="40" r="28"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
            />
            <circle
              cx="40" cy="40" r="28"
              fill="none"
              stroke="rgba(160,255,180,0.5)"
              strokeWidth="12"
              strokeDasharray="105 70"
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
            <circle
              cx="40" cy="40" r="28"
              fill="none"
              stroke="rgba(120,180,255,0.4)"
              strokeWidth="12"
              strokeDasharray="70 105"
              strokeDashoffset="-105"
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="analytics__donut-center">
            68%<br /><span>AI</span>
          </div>
        </div>
        <div className="analytics__donut-legend">
          <div className="analytics__legend-item">
            <span className="analytics__legend-dot analytics__legend-dot--green" />
            AI handled — 68%
          </div>
          <div className="analytics__legend-item">
            <span className="analytics__legend-dot analytics__legend-dot--blue" />
            Human handled — 32%
          </div>
        </div>
      </div>

      {/* Agent table */}
      <div className="db-card analytics__table-card">
        <div className="analytics__chart-header" style={{ marginBottom: 16 }}>
          <span className="analytics__chart-title">Agent Performance</span>
        </div>
        <table className="analytics__table">
          <thead>
            <tr>
              {['Agent', 'Tickets', 'CSAT', 'Avg Time'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENT_DATA.map(a => (
              <tr key={a.name} className="analytics__row">
                <td className="analytics__agent-name">{a.name}</td>
                <td className="analytics__cell">{a.tickets}</td>
                <td>
                  <span className="badge badge--green">{a.csat}</span>
                </td>
                <td className="analytics__cell analytics__cell--mono">{a.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Analytics;