import { useState } from 'react';
import './Inbox.scss';

const CONVOS = [
  { id:1, name:'Priya S.',   preview:'My order hasn\'t arrived…',     time:'2m',  priority:'urgent', unread:3, status:'open' },
  { id:2, name:'Tom B.',     preview:'Can\'t access my account at all', time:'8m',  priority:'high',   unread:1, status:'open' },
  { id:3, name:'Lena K.',    preview:'Refund still pending since Monday', time:'15m', priority:'normal', unread:0, status:'open' },
  { id:4, name:'James R.',   preview:'How do I upgrade my plan?',     time:'1h',  priority:'low',    unread:0, status:'open' },
  { id:5, name:'Mia C.',     preview:'Thanks, issue resolved!',       time:'2h',  priority:'normal', unread:0, status:'resolved' },
];

const MESSAGES = [
  { from:'customer', text:'Hi, my order #8821 was supposed to arrive yesterday but I still haven\'t received it.',     time:'10:22 AM' },
  { from:'agent',    text:'Hi Priya! I\'m looking into this right now. Let me check with our logistics team.',          time:'10:24 AM' },
  { from:'customer', text:'It\'s been 3 days past the expected delivery date. This is really frustrating.',             time:'10:25 AM' },
  { from:'ai',       text:'Based on order #8821, the package was scanned at the regional hub 18 hours ago. There may be a local delay.', time:'10:26 AM' },
];

const SUGGESTIONS = [
  'I\'ve escalated this to our logistics team. You\'ll receive an update within 2 hours.',
  'I\'m sorry for the inconvenience. I\'ll arrange a replacement or full refund for you right away.',
];

const Inbox = () => {
  const [active, setActive] = useState(1);
  const [input, setInput]   = useState('');

  return (
    <div className="inbox">
      {/* Left — conversation list */}
      <div className="inbox__list">
        <div className="inbox__list-header">
          <span className="inbox__list-title">Inbox</span>
          <span className="badge badge--red">4 open</span>
        </div>
        <div className="inbox__search">
          <input className="db-input" placeholder="Search conversations…" />
        </div>
        {CONVOS.map(c => (
          <div
            key={c.id}
            className={`inbox__convo ${active === c.id ? 'inbox__convo--active' : ''}`}
            onClick={() => setActive(c.id)}
          >
            <div className="inbox__convo-avatar">{c.name[0]}</div>
            <div className="inbox__convo-body">
              <div className="inbox__convo-row">
                <span className="inbox__convo-name">{c.name}</span>
                <span className="inbox__convo-time">{c.time}</span>
              </div>
              <div className="inbox__convo-row">
                <span className="inbox__convo-preview">{c.preview}</span>
                {c.unread > 0 && (
                  <span className="inbox__convo-unread">{c.unread}</span>
                )}
              </div>
              <span className={`badge badge--${c.priority === 'urgent' ? 'red' : c.priority === 'high' ? 'yellow' : 'ghost'}`}>
                {c.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Middle — chat window */}
      <div className="inbox__chat">
        <div className="inbox__chat-header">
          <div className="inbox__chat-avatar">P</div>
          <div>
            <div className="inbox__chat-name">Priya S.</div>
            <div className="inbox__chat-meta">Order #8821 · Delivery issue</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <span className="badge badge--red">Urgent</span>
            <span className="badge badge--ghost">Open</span>
          </div>
        </div>

        <div className="inbox__messages">
          {MESSAGES.map((m, i) => (
            <div key={i} className={`inbox__msg inbox__msg--${m.from}`}>
              {m.from === 'ai' && (
                <div className="inbox__msg-ai-badge">AI Copilot</div>
              )}
              <div className="inbox__msg-bubble">{m.text}</div>
              <div className="inbox__msg-time">{m.time}</div>
            </div>
          ))}
        </div>

        <div className="inbox__composer">
          <textarea
            className="inbox__composer-input"
            placeholder="Type a reply…"
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={2}
          />
          <div className="inbox__composer-actions">
            <button className="db-btn db-btn--ghost">Attach</button>
            <button className="db-btn db-btn--primary">Send</button>
          </div>
        </div>
      </div>

      {/* Right — AI Copilot */}
      <div className="inbox__copilot">
        <div className="inbox__copilot-header">
          <span className="inbox__copilot-title">AI Copilot</span>
          <span className="badge badge--green">Active</span>
        </div>

        <div className="inbox__copilot-section">
          <div className="inbox__copilot-label">Suggested Replies</div>
          {SUGGESTIONS.map((s, i) => (
            <div key={i} className="inbox__suggestion" onClick={() => setInput(s)}>
              {s}
            </div>
          ))}
        </div>

        <div className="inbox__copilot-section">
          <div className="inbox__copilot-label">Customer Info</div>
          <div className="inbox__info-row"><span>Name</span><strong>Priya Singh</strong></div>
          <div className="inbox__info-row"><span>Email</span><strong>priya@email.com</strong></div>
          <div className="inbox__info-row"><span>Order</span><strong>#8821</strong></div>
          <div className="inbox__info-row"><span>Plan</span><strong>Standard</strong></div>
        </div>

        <div className="inbox__copilot-section">
          <div className="inbox__copilot-label">AI Confidence</div>
          <div className="inbox__confidence">
            <div className="inbox__confidence-bar">
              <div className="inbox__confidence-fill" style={{ width:'84%' }} />
            </div>
            <span className="inbox__confidence-val">84%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;