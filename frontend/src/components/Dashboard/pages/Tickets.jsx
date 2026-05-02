import { useState } from 'react';
import './Tickets.scss';

const TICKETS = [
  { id:'#1284', customer:'Priya S.',   status:'open',     agent:'Sarah K.', priority:'urgent', created:'2h ago' },
  { id:'#1283', customer:'Tom B.',     status:'escalated',agent:'Mike L.',  priority:'high',   created:'4h ago' },
  { id:'#1282', customer:'Lena K.',    status:'open',     agent:'AI',       priority:'normal', created:'5h ago' },
  { id:'#1281', customer:'James R.',   status:'resolved', agent:'Sarah K.', priority:'low',    created:'8h ago' },
  { id:'#1280', customer:'Mia C.',     status:'closed',   agent:'AI',       priority:'low',    created:'1d ago' },
  { id:'#1279', customer:'Omar H.',    status:'open',     agent:'AI',       priority:'normal', created:'1d ago' },
  { id:'#1278', customer:'Nina W.',    status:'resolved', agent:'Tom A.',   priority:'high',   created:'2d ago' },
];

const STATUS_COLOR = { open:'green', escalated:'red', resolved:'blue', closed:'ghost' };
const PRI_COLOR    = { urgent:'red', high:'yellow', normal:'blue', low:'ghost' };

const FILTERS = ['All', 'Open', 'Escalated', 'Resolved', 'Closed'];

const Tickets = () => {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All'
    ? TICKETS
    : TICKETS.filter(t => t.status === filter.toLowerCase());

  return (
    <div className="db-page tickets">
      <div className="db-page__header">
        <h1 className="db-page__title">Tickets</h1>
        <p className="db-page__sub">Manage and track all support tickets.</p>
      </div>

      <div className="tickets__toolbar">
        <div className="tickets__filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`tickets__filter ${filter === f ? 'tickets__filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="db-btn db-btn--primary">+ New Ticket</button>
      </div>

      <div className="db-card tickets__table-wrap">
        <table className="tickets__table">
          <thead>
            <tr>
              {['Ticket ID','Customer','Status','Assigned Agent','Priority','Created'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="tickets__row">
                <td className="tickets__id">{t.id}</td>
                <td className="tickets__customer">{t.customer}</td>
                <td><span className={`badge badge--${STATUS_COLOR[t.status]}`}>{t.status}</span></td>
                <td className="tickets__agent">{t.agent}</td>
                <td><span className={`badge badge--${PRI_COLOR[t.priority]}`}>{t.priority}</span></td>
                <td className="tickets__time">{t.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tickets;