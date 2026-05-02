import './TeamAgents.scss';

const AGENTS = [
  { name:'Sarah K.',  role:'Senior Agent', status:'online',  tickets:42, csat:'4.9' },
  { name:'Mike L.',   role:'Agent',        status:'online',  tickets:31, csat:'4.7' },
  { name:'Tom A.',    role:'Agent',        status:'offline', tickets:28, csat:'4.8' },
  { name:'Nina W.',   role:'Agent',        status:'offline', tickets:19, csat:'4.6' },
];

const TeamAgents = () => (
  <div className="db-page team">
    <div className="db-page__header">
      <h1 className="db-page__title">Team & Agents</h1>
      <p className="db-page__sub">Manage your support team and their access.</p>
    </div>
    <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:18 }}>
      <button className="db-btn db-btn--primary">+ Invite Agent</button>
    </div>
    <div className="three-col">
      {AGENTS.map(a => (
        <div key={a.name} className="db-card team__card">
          <div className="team__card-top">
            <div className="team__avatar">{a.name[0]}</div>
            <span className={`badge badge--${a.status === 'online' ? 'green' : 'ghost'}`}>
              {a.status}
            </span>
          </div>
          <div className="team__name">{a.name}</div>
          <div className="team__role">{a.role}</div>
          <div className="team__stats">
            <div className="team__stat">
              <span>{a.tickets}</span>
              <label>Tickets</label>
            </div>
            <div className="team__stat">
              <span>{a.csat}</span>
              <label>CSAT</label>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TeamAgents;