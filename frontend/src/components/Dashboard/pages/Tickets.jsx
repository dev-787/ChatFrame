import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './Tickets.scss';

const TICKETS = [
  { id:'#1284', customer:'Priya S.',   status:'open',     agent:'Unassigned', priority:'urgent', created:'2h ago', customerId: 1 },
  { id:'#1283', customer:'Tom B.',     status:'escalated',agent:'Mike L.',  priority:'high',   created:'4h ago', customerId: 2 },
  { id:'#1282', customer:'Lena K.',    status:'open',     agent:'Unassigned',       priority:'normal', created:'5h ago', customerId: 3 },
  { id:'#1281', customer:'James R.',   status:'resolved', agent:'Sarah K.', priority:'low',    created:'8h ago', customerId: 4 },
  { id:'#1280', customer:'Mia C.',     status:'closed',   agent:'AI',       priority:'low',    created:'1d ago', customerId: 5 },
  { id:'#1279', customer:'Omar H.',    status:'open',     agent:'Unassigned',       priority:'normal', created:'1d ago', customerId: 6 },
  { id:'#1278', customer:'Nina W.',    status:'resolved', agent:'Tom A.',   priority:'high',   created:'2d ago', customerId: 7 },
];

const STATUS_COLOR = { open:'green', escalated:'red', resolved:'blue', closed:'ghost' };
const PRI_COLOR    = { urgent:'red', high:'yellow', normal:'blue', low:'ghost' };

const FILTERS = ['All', 'Open', 'Escalated', 'Resolved', 'Closed'];

const Tickets = ({ onNavigateToInbox }) => {
  const [filter, setFilter] = useState('All');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState(TICKETS);

  const filtered = filter === 'All'
    ? tickets
    : tickets.filter(t => t.status === filter.toLowerCase());

  const handleTicketClick = (ticket) => {
    // If ticket is already assigned to current agent, go directly to inbox
    if (ticket.agent !== 'Unassigned' && ticket.agent !== 'AI') {
      onNavigateToInbox && onNavigateToInbox(ticket.customerId);
      return;
    }

    // If unassigned, show assignment modal
    setSelectedTicket(ticket);
    setShowAssignModal(true);
  };

  const handleAssignTicket = () => {
    if (!selectedTicket) return;

    // Update ticket to assign to current agent
    setTickets(prev => prev.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, agent: 'Ada L.' } 
        : t
    ));

    // Close modal and navigate to inbox
    setShowAssignModal(false);
    onNavigateToInbox && onNavigateToInbox(selectedTicket.customerId);
    setSelectedTicket(null);
  };

  const handleCancelAssignment = () => {
    setShowAssignModal(false);
    setSelectedTicket(null);
  };

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
              <tr 
                key={t.id} 
                className="tickets__row"
                onClick={() => handleTicketClick(t)}
              >
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

      {/* Assignment Modal */}
      {showAssignModal && selectedTicket && (
        <div className="tickets__modal-overlay">
          <div className="tickets__modal">
            <div className="tickets__modal-header">
              <div className="tickets__modal-icon">
                <AlertTriangle size={20} />
              </div>
              <h3 className="tickets__modal-title">Assign Ticket</h3>
              <button 
                className="tickets__modal-close"
                onClick={handleCancelAssignment}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="tickets__modal-body">
              <p className="tickets__modal-text">
                You are about to be assigned to ticket <strong>{selectedTicket.id}</strong> for customer <strong>{selectedTicket.customer}</strong>.
              </p>
              <p className="tickets__modal-subtext">
                Once assigned, you'll be responsible for resolving this ticket and communicating with the customer.
              </p>
            </div>

            <div className="tickets__modal-actions">
              <button 
                className="db-btn db-btn--ghost"
                onClick={handleCancelAssignment}
              >
                Cancel
              </button>
              <button 
                className="db-btn db-btn--primary"
                onClick={handleAssignTicket}
              >
                Assign to Me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;