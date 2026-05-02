import './Analytics.scss';

const METRICS = [
  { label:'Avg Resolution Time', value:'3m 12s', delta:'-22s', color:'green' },
  { label:'Escalation Rate',     value:'8.4%',   delta:'-1.2%', color:'green' },
  { label:'Customer Satisfaction',value:'4.8★',  delta:'+0.2',  color:'green' },
  { label:'AI Confidence Avg',   value:'81%',    delta:'+3%',   color:'blue' },
];

const AGENT_DATA = [
  { name:'Sarah K.', tickets:42, csat:'4.9', time:'2m 10s' },
  { name:'Mike L.',  tickets:31, csat:'4.7', time:'3m 45s' },
  { name:'Tom A.',   tickets:28, csat:'4.8', time:'2m 58s' },
  { name:'AI',       tickets:89, csat:'4.6', time:'0m 12s' },
];

const Analytics = () => (
  <div className="db-page analytics">
    <div className="db-page__header">
      <h1 className="db-page__title">Analytics</h1>
      <p className="db-page__sub">Business intelligence and performance metrics.</p>
    </div>

    <div className="stats-grid">
      {METRICS.map(m => (
        <div key={m.label} className="stat-card">
          <div className="stat-card__label">{m.label}</div>
          <div className="stat-card__value">{m.value}</div>
          <div className={`badge badge--${m.color}`}>{m.delta}</div>
        </div>
      ))}
    </div>

    <div className="two-col" style={{ marginBottom:16 }}>
      <div className="db-card analytics__chart-card">
        <div className="analytics__chart-title">Ticket Trends — 7 days</div>
        <div className="analytics__bars">
          {[55,72,61,88,70,95,80].map((h,i) => (
            <div key={i} className="analytics__bar-col">
              <div className="analytics__bar" style={{ height:`${h}%` }} />
              <span className="analytics__bar-day">
                {['M','T','W','T','F','S','S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="db-card analytics__chart-card">
        <div className="analytics__chart-title">AI vs Human Handled</div>
        <div className="analytics__donut-wrap">
          <svg viewBox="0 0 80 80" className="analytics__donut">
            <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
            <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(160,255,180,0.5)"
              strokeWidth="12" strokeDasharray="105 70" strokeDashoffset="0"
              strokeLinecap="round" transform="rotate(-90 40 40)"/>
            <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(120,180,255,0.4)"
              strokeWidth="12" strokeDasharray="70 105" strokeDashoffset="-105"
              strokeLinecap="round" transform="rotate(-90 40 40)"/>
          </svg>
          <div className="analytics__donut-center">68%<br/><span>AI</span></div>
        </div>
        <div className="analytics__donut-legend">
          <div className="analytics__legend-item">
            <span style={{ background:'rgba(160,255,180,0.5)' }} />AI handled
          </div>
          <div className="analytics__legend-item">
            <span style={{ background:'rgba(120,180,255,0.4)' }} />Human handled
          </div>
        </div>
      </div>
    </div>

    <div className="db-card">
      <div className="analytics__chart-title" style={{ marginBottom:16 }}>Agent Performance</div>
      <table className="tickets__table">
        <thead>
          <tr>
            {['Agent','Tickets Closed','CSAT','Avg Response Time'].map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {AGENT_DATA.map(a => (
            <tr key={a.name} className="tickets__row">
              <td style={{ fontWeight:500, color:'var(--text)' }}>{a.name}</td>
              <td style={{ color:'var(--text-2)' }}>{a.tickets}</td>
              <td><span className="badge badge--green">{a.csat}</span></td>
              <td style={{ color:'var(--text-2)', fontFamily:'monospace', fontSize:12 }}>{a.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Analytics;