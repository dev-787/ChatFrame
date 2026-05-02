import './Notifications.scss';

const NOTIFS = [
  { type:'red',    icon:'⚠', title:'New escalation',            body:'Ticket #1283 escalated to senior agent.', time:'2m ago' },
  { type:'yellow', icon:'◈', title:'AI confidence dropped',      body:'Avg confidence fell below 70% on billing queries.', time:'15m ago' },
  { type:'blue',   icon:'◎', title:'Agent reassigned',           body:'Ticket #1280 reassigned from Mike to Sarah.', time:'1h ago' },
  { type:'green',  icon:'★', title:'New 5-star review',          body:'Customer Lena K. left a 5-star rating.', time:'2h ago' },
  { type:'ghost',  icon:'◉', title:'AI resolved 10 tickets',     body:'AI handled 10 conversations without escalation.', time:'3h ago' },
];

const Notifications = () => (
  <div className="db-page notifs">
    <div className="db-page__header">
      <h1 className="db-page__title">Notifications</h1>
      <p className="db-page__sub">Centralized alerts from across your platform.</p>
    </div>
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {NOTIFS.map((n,i) => (
        <div key={i} className="db-card notifs__item">
          <div className={`notifs__icon badge--${n.type}`}>{n.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="notifs__title">{n.title}</div>
            <div className="notifs__body">{n.body}</div>
          </div>
          <div className="notifs__time">{n.time}</div>
        </div>
      ))}
    </div>
  </div>
);

export default Notifications;