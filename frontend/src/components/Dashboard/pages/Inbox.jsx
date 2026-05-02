import { useState, useEffect } from 'react';
import { Search, Paperclip, Send, Bot } from 'lucide-react';
import './Inbox.scss';

const CONVOS = [
  { id:1, name:'Priya S.',   preview:'My order hasn\'t arrived…',     time:'2m',  priority:'urgent', unread:3, status:'open' },
  { id:2, name:'Tom B.',     preview:'Can\'t access my account at all', time:'8m',  priority:'high',   unread:1, status:'open' },
  { id:3, name:'Lena K.',    preview:'Refund still pending since Monday', time:'15m', priority:'normal', unread:0, status:'open' },
  { id:4, name:'James R.',   preview:'How do I upgrade my plan?',     time:'1h',  priority:'low',    unread:0, status:'open' },
  { id:5, name:'Mia C.',     preview:'Thanks, issue resolved!',       time:'2h',  priority:'normal', unread:0, status:'resolved' },
  { id:6, name:'Omar H.',    preview:'Need help with setup',         time:'1d',  priority:'normal', unread:2, status:'open' },
  { id:7, name:'Nina W.',    preview:'Great service, thank you!',     time:'2d',  priority:'normal', unread:0, status:'resolved' },
];

const CHAT_DATA = {
  1: {
    name: 'Priya S.',
    meta: 'Order #8821 · Delivery issue',
    messages: [
      { from:'customer', text:'Hi, my order #8821 was supposed to arrive yesterday but I still haven\'t received it.', time:'10:22 AM' },
      { from:'agent', text:'Hi Priya! I\'m looking into this right now. Let me check with our logistics team.', time:'10:24 AM' },
      { from:'customer', text:'It\'s been 3 days past the expected delivery date. This is really frustrating.', time:'10:25 AM' },
      { from:'ai', text:'Based on order #8821, the package was scanned at the regional hub 18 hours ago. There may be a local delay.', time:'10:26 AM' },
    ],
    suggestions: [
      'I\'ve escalated this to our logistics team. You\'ll receive an update within 2 hours.',
      'I\'m sorry for the inconvenience. I\'ll arrange a replacement or full refund for you right away.',
    ],
    customerInfo: {
      name: 'Priya Singh',
      email: 'priya@email.com',
      order: '#8821',
      plan: 'Standard'
    }
  },
  2: {
    name: 'Tom B.',
    meta: 'Account Access · Login Issue',
    messages: [
      { from:'customer', text:'I can\'t access my account at all. It keeps saying invalid credentials.', time:'9:15 AM' },
      { from:'agent', text:'Hi Tom! Let me help you with that. Can you confirm the email address you\'re using?', time:'9:17 AM' },
      { from:'customer', text:'Yes, it\'s tom.brown@company.com', time:'9:18 AM' },
    ],
    suggestions: [
      'I\'ll send you a password reset link to tom.brown@company.com right now.',
      'Let me check if there are any security locks on your account.',
    ],
    customerInfo: {
      name: 'Tom Brown',
      email: 'tom.brown@company.com',
      order: 'N/A',
      plan: 'Premium'
    }
  },
  3: {
    name: 'Lena K.',
    meta: 'Refund Request · Billing',
    messages: [
      { from:'customer', text:'My refund has been pending since Monday. When will it be processed?', time:'8:30 AM' },
      { from:'agent', text:'Hi Lena! I can see your refund request. Let me check the status for you.', time:'8:32 AM' },
    ],
    suggestions: [
      'Your refund is being processed and should appear in 3-5 business days.',
      'I can expedite this refund for you. It should be processed within 24 hours.',
    ],
    customerInfo: {
      name: 'Lena Kumar',
      email: 'lena.k@email.com',
      order: '#7654',
      plan: 'Basic'
    }
  },
  4: {
    name: 'James R.',
    meta: 'Plan Upgrade · Billing',
    messages: [
      { from:'customer', text:'How do I upgrade my plan? I need more features for my team.', time:'7:45 AM' },
    ],
    suggestions: [
      'I can help you upgrade to our Premium plan which includes advanced team features.',
      'Let me show you our available plans and their benefits.',
    ],
    customerInfo: {
      name: 'James Rodriguez',
      email: 'james.r@startup.com',
      order: 'N/A',
      plan: 'Basic'
    }
  },
  5: {
    name: 'Mia C.',
    meta: 'Issue Resolved · Support',
    messages: [
      { from:'customer', text:'Thanks for your help! The issue is completely resolved now.', time:'6:20 AM' },
      { from:'agent', text:'You\'re very welcome, Mia! Happy to help. Is there anything else I can assist you with?', time:'6:22 AM' },
      { from:'customer', text:'No, that\'s everything. Great service!', time:'6:23 AM' },
    ],
    suggestions: [
      'Thank you for the positive feedback! We\'re always here to help.',
      'I\'m glad we could resolve this quickly for you.',
    ],
    customerInfo: {
      name: 'Mia Chen',
      email: 'mia.chen@email.com',
      order: '#9876',
      plan: 'Premium'
    }
  },
  6: {
    name: 'Omar H.',
    meta: 'Setup Help · Technical',
    messages: [
      { from:'customer', text:'I need help setting up my account. The instructions are confusing.', time:'Yesterday' },
    ],
    suggestions: [
      'I\'d be happy to walk you through the setup process step by step.',
      'Let me send you our updated setup guide with screenshots.',
    ],
    customerInfo: {
      name: 'Omar Hassan',
      email: 'omar.h@email.com',
      order: 'N/A',
      plan: 'Basic'
    }
  },
  7: {
    name: 'Nina W.',
    meta: 'Feedback · Resolved',
    messages: [
      { from:'customer', text:'Just wanted to say thank you for the excellent support!', time:'2 days ago' },
      { from:'agent', text:'Thank you so much for the kind words, Nina! We really appreciate it.', time:'2 days ago' },
    ],
    suggestions: [
      'Thank you for taking the time to share your feedback!',
      'We\'re always here if you need any assistance in the future.',
    ],
    customerInfo: {
      name: 'Nina Williams',
      email: 'nina.w@email.com',
      order: '#5432',
      plan: 'Premium'
    }
  }
};

const Inbox = ({ initialCustomerId }) => {
  const [active, setActive] = useState(initialCustomerId || 1);
  const [input, setInput] = useState('');
  const [chatData, setChatData] = useState(CHAT_DATA);

  // Update active customer when initialCustomerId changes
  useEffect(() => {
    if (initialCustomerId) {
      setActive(initialCustomerId);
    }
  }, [initialCustomerId]);
  
  const currentChat = chatData[active];
  const currentConvo = CONVOS.find(c => c.id === active);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      from: 'agent',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatData(prev => ({
      ...prev,
      [active]: {
        ...prev[active],
        messages: [...prev[active].messages, newMessage]
      }
    }));

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="inbox">
      {/* Left — conversation list */}
      <div className="inbox__list">
        <div className="inbox__list-header">
          <span className="inbox__list-title">Inbox</span>
          <span className="badge badge--red">4 open</span>
        </div>
        <div className="inbox__search">
          <div className="inbox__search-wrapper">
            <Search size={14} className="inbox__search-icon" />
            <input className="db-input" placeholder="Search conversations…" />
          </div>
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
          <div className="inbox__chat-avatar">{currentChat.name[0]}</div>
          <div>
            <div className="inbox__chat-name">{currentChat.name}</div>
            <div className="inbox__chat-meta">{currentChat.meta}</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <span className={`badge badge--${currentConvo.priority === 'urgent' ? 'red' : currentConvo.priority === 'high' ? 'yellow' : 'ghost'}`}>
              {currentConvo.priority}
            </span>
            <span className={`badge badge--${currentConvo.status === 'resolved' ? 'green' : 'ghost'}`}>
              {currentConvo.status}
            </span>
          </div>
        </div>

        <div className="inbox__messages">
          {currentChat.messages.map((m, i) => (
            <div key={i} className={`inbox__msg inbox__msg--${m.from}`}>
              {m.from === 'ai' && (
                <div className="inbox__msg-ai-badge">
                  <Bot size={12} />
                  AI Copilot
                </div>
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
            onKeyPress={handleKeyPress}
            rows={2}
          />
          <div className="inbox__composer-actions">
            <button className="db-btn db-btn--ghost">
              <Paperclip size={14} />
              Attach
            </button>
            <button 
              className="db-btn db-btn--primary"
              onClick={handleSendMessage}
              disabled={!input.trim()}
            >
              <Send size={14} />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right — AI Copilot */}
      <div className="inbox__copilot">
        <div className="inbox__copilot-header">
          <span className="inbox__copilot-title">
            <Bot size={16} />
            AI Copilot
          </span>
          <span className="badge badge--green">Active</span>
        </div>

        <div className="inbox__copilot-section">
          <div className="inbox__copilot-label">Suggested Replies</div>
          {currentChat.suggestions.map((s, i) => (
            <div 
              key={i} 
              className="inbox__suggestion" 
              onClick={() => setInput(s)}
            >
              {s}
            </div>
          ))}
        </div>

        <div className="inbox__copilot-section">
          <div className="inbox__copilot-label">Customer Info</div>
          <div className="inbox__info-row"><span>Name</span><strong>{currentChat.customerInfo.name}</strong></div>
          <div className="inbox__info-row"><span>Email</span><strong>{currentChat.customerInfo.email}</strong></div>
          <div className="inbox__info-row"><span>Order</span><strong>{currentChat.customerInfo.order}</strong></div>
          <div className="inbox__info-row"><span>Plan</span><strong>{currentChat.customerInfo.plan}</strong></div>
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