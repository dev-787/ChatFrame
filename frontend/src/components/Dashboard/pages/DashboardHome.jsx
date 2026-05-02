import './DashboardHome.scss';

const STATS = [
  { label: 'Total Tickets',       value: '1,284', delta: '+12 today',    color: 'blue' },
  { label: 'Active Conversations', value: '38',    delta: '5 urgent',     color: 'yellow' },
  { label: 'AI Resolution %',     value: '68%',   delta: '+4% this week', color: 'green' },
  { label: 'CSAT Score',          value: '4.8★',  delta: 'Excellent',     color: 'green' },
  { label: 'Avg Response Time',   value: '1m 42s', delta: '-18s vs last week', color: 'blue' },
];

const ACTIVITY = [
  { icon: '◉', text: 'AI resolved ticket #1284',         time: '2m ago',  color: 'green' },
  { icon: '◈', text: 'Agent Sarah joined live chat',      time: '5m ago',  color: 'blue' },
  { icon: '★', text: 'Customer gave 5-star rating',       time: '12m ago', color: 'yellow' },
  { icon: '⚠', text: 'Ticket #1280 escalated to human',  time: '18m ago', color: 'red' },
  { icon: '◉', text: 'AI resolved ticket #1279',         time: '24m ago', color: 'green' },
  { icon: '◈', text: 'New agent Tom onboarded',           time: '1h ago',  color: 'blue' },
];

const BAR_DATA = [42, 68, 55, 80, 63, 91, 74];
const DAYS     = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DashboardHome = () => (
  <div className="db-page dash-home">
    <div className="db-page__header">
      <h1 className="db-page__title">Good morning, Ada 👋</h1>
      <p className="db-page__sub">Here's what's happening with your support system today.</p>
    </div>

    {/* Stats */}
    <div className="stats-grid">
      {STATS.map(s => (
        <div key={s.label} className="stat-card">
          <div className="stat-card__label">{s.label}</div>
          <div className="stat-card__value">{s.value}</div>
          <div className={`stat-card__delta badge badge--${s.color}`}>{s.delta}</div>
        </div>
      ))}
    </div>

    <div className="two-col">
      {/* Chart */}
      <div className="db-card dash-home__chart-card">
        <div className="dash-home__card-header">
          <span className="dash-home__card-title">Tickets per day</span>
          <span className="badge badge--ghost">This week</span>
        </div>
        <div className="dash-home__chart">
          {BAR_DATA.map((h, i) => (
            <div key={i} className="dash-home__chart-col">
              <div
                className={`dash-home__bar ${i === 5 ? 'dash-home__bar--highlight' : ''}`}
                style={{ height: `${h}%` }}
              />
              <span className="dash-home__day">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity + insight */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {/* Quick insight */}
        <div className="db-card dash-home__insight">
          <div className="dash-home__insight-icon">◈</div>
          <div>
            <div className="dash-home__insight-title">AI Insight</div>
            <p className="dash-home__insight-text">
              AI handled <strong>68%</strong> of support volume today — saving your team approximately <strong>4.2 hours</strong>.
            </p>
          </div>
        </div>

        {/* Activity */}
        <div className="db-card dash-home__activity" style={{ flex:1 }}>
          <div className="dash-home__card-header">
            <span className="dash-home__card-title">Recent Activity</span>
          </div>
          <div className="dash-home__activity-list">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="dash-home__activity-item">
                <span className={`dash-home__activity-icon badge--${a.color}`}>{a.icon}</span>
                <span className="dash-home__activity-text">{a.text}</span>
                <span className="dash-home__activity-time">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardHome;