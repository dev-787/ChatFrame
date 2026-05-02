import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  MessageCircle, 
  Star, 
  AlertTriangle, 
  UserPlus,
  Clock
} from 'lucide-react';
import './DashboardHome.scss';

const STATS = [
  { label: 'Total Tickets',        value: '1,284', delta: '+12 today',       color: 'blue' },
  { label: 'Active Conversations', value: '38',    delta: '5 urgent',        color: 'yellow' },
  { label: 'AI Resolution %',      value: '68%',   delta: '+4% this week',   color: 'green' },
  { label: 'CSAT Score',           value: '4.8★',  delta: 'Excellent',       color: 'green' },
  { label: 'Avg Response Time',    value: '1m 42s', delta: '-18s vs last week', color: 'blue' },
];

const TICKET_DATA = [
  { day: 'Mon', tickets: 42 },
  { day: 'Tue', tickets: 68 },
  { day: 'Wed', tickets: 55 },
  { day: 'Thu', tickets: 80 },
  { day: 'Fri', tickets: 63 },
  { day: 'Sat', tickets: 91 },
  { day: 'Sun', tickets: 74 },
];

const ACTIVITY = [
  { icon: CheckCircle, text: 'AI resolved ticket #1284',        time: '2m ago',  color: 'green'  },
  { icon: MessageCircle, text: 'Agent Sarah joined live chat',     time: '5m ago',  color: 'blue'   },
  { icon: Star, text: 'Customer gave 5-star rating',      time: '12m ago', color: 'yellow' },
  { icon: AlertTriangle, text: 'Ticket #1280 escalated to human', time: '18m ago', color: 'red'    },
  { icon: CheckCircle, text: 'AI resolved ticket #1279',        time: '24m ago', color: 'green'  },
  { icon: UserPlus, text: 'New agent Tom onboarded',          time: '1h ago',  color: 'blue'   },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      <div className="chart-tooltip__value">{payload[0].value} tickets</div>
    </div>
  );
};

const DashboardHome = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
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
      {/* Left column - Chart + Agent Insight */}
      <div className="dash-home__left-col">
        {/* Bar chart */}
        <div className="db-card dash-home__chart-card">
          <div className="dash-home__card-header">
            <span className="dash-home__card-title">Tickets per day</span>
            <span className="badge badge--ghost">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={TICKET_DATA}
              margin={{ 
                top: 10, 
                right: 0, 
                left: -28, 
                bottom: 5
              }}
              barCategoryGap="30%"
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(240,240,240,0.3)', fontSize: 11 }}
                height={15}
              />
              <YAxis hide domain={[0, 'dataMax']} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }}
              />
              <Bar dataKey="tickets" radius={[5, 5, 0, 0]} maxBarSize={40}>
                {TICKET_DATA.map((_, i) => (
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

        {/* Agent Response Time Insight */}
        <div className="db-card dash-home__insight dash-home__insight--yellow">
          <div className="dash-home__insight-icon dash-home__insight-icon--yellow">
            <Clock size={16} />
          </div>
          <div>
            <div className="dash-home__insight-title dash-home__insight-title--yellow">Agent Performance</div>
            <p className="dash-home__insight-text">
              Average agent response time is <strong>5 minutes</strong> — maintaining excellent customer experience standards.
            </p>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="dash-home__right-col">
        {/* AI insight */}
        <div className="db-card dash-home__insight">
          <div className="dash-home__insight-icon">
            <MessageCircle size={16} />
          </div>
          <div>
            <div className="dash-home__insight-title">AI Insight</div>
            <p className="dash-home__insight-text">
              AI handled <strong>68%</strong> of support volume today —
              saving your team approximately <strong>4.2 hours</strong>.
            </p>
          </div>
        </div>

        {/* Activity */}
        <div className="db-card dash-home__activity">
          <div className="dash-home__card-header">
            <span className="dash-home__card-title">Recent Activity</span>
          </div>
          <div className="dash-home__activity-list">
            {ACTIVITY.slice(0, 4).map((a, i) => {
              const IconComponent = a.icon;
              return (
                <div key={i} className="dash-home__activity-item">
                  <span className={`dash-home__activity-icon badge--${a.color}`}>
                    <IconComponent size={12} />
                  </span>
                  <span className="dash-home__activity-text">{a.text}</span>
                  <span className="dash-home__activity-time">{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default DashboardHome;