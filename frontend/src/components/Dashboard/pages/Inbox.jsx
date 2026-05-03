import { useState, useEffect } from 'react';
import { Search, Paperclip, Send, Bot } from 'lucide-react';
import './Inbox.scss';
import apiService from '../../../services/api';
import socketService from '../../../services/socket';

const Inbox = ({ initialCustomerId }) => {
  const [active, setActive] = useState(initialCustomerId || null);
  const [input, setInput] = useState('');
  const [chatData, setChatData] = useState({});
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load conversations from API
  useEffect(() => {
    loadConversations();
    
    // Connect socket for real-time updates
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Listen for new messages
    const handleNewMessage = (message) => {
      setChatData(prev => ({
        ...prev,
        [message.ticketId]: {
          ...prev[message.ticketId],
          messages: [...(prev[message.ticketId]?.messages || []), {
            from: message.from,
            text: message.text,
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        }
      }));
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
      if (active) {
        socketService.leaveTicket(active);
      }
    };
  }, []);

  // Validate MongoDB ObjectId
  const isValidObjectId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Join ticket room when active conversation changes
  useEffect(() => {
    if (active && isValidObjectId(active)) {
      console.log("Joining ticket room:", active);
      socketService.joinTicket(active);
      loadTicketDetails(active);
    }
  }, [active]);

  // Update active customer when initialCustomerId changes
  useEffect(() => {
    if (initialCustomerId && isValidObjectId(initialCustomerId)) {
      setActive(initialCustomerId);
    }
  }, [initialCustomerId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInboxConversations();
      
      if (response.success && response.data && Array.isArray(response.data.conversations)) {
        setConversations(response.data.conversations);
        
        // Set first conversation as active if no active conversation and we have data
        if (!active && response.data.conversations.length > 0) {
          setActive(response.data.conversations[0]._id);
        }
      } else {
        console.warn('Invalid conversations response:', response);
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError(error.message);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId) => {
    if (!isValidObjectId(ticketId)) {
      console.error('Invalid ticket ID:', ticketId);
      return;
    }

    try {
      const response = await apiService.getInboxTicket(ticketId);
      
      if (response.success && response.data) {
        setChatData(prev => ({
          ...prev,
          [ticketId]: response.data
        }));
      }
    } catch (error) {
      console.error('Failed to load ticket details:', error);
      // Don't show error to user, just log it
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || sendingMessage || !isValidObjectId(active)) return;

    const messageText = input.trim();
    const tempMessage = {
      from: 'agent',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sending: true
    };

    // Optimistically add message to UI
    setChatData(prev => ({
      ...prev,
      [active]: {
        ...prev[active],
        messages: [...(prev[active]?.messages || []), tempMessage]
      }
    }));

    setInput('');
    setSendingMessage(true);

    try {
      const response = await apiService.sendMessage(active, {
        text: messageText,
        type: 'agent_reply'
      });

      if (response.success && response.data) {
        // Replace temp message with real message from server
        setChatData(prev => ({
          ...prev,
          [active]: {
            ...prev[active],
            messages: prev[active].messages.map(msg => 
              msg.sending ? {
                ...msg,
                sending: false,
                id: response.data._id,
                time: new Date(response.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              } : msg
            )
          }
        }));
      } else {
        // Just remove the sending flag if no proper response
        setChatData(prev => ({
          ...prev,
          [active]: {
            ...prev[active],
            messages: prev[active].messages.map(msg => 
              msg.sending ? { ...msg, sending: false } : msg
            )
          }
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove failed message and restore input
      setChatData(prev => ({
        ...prev,
        [active]: {
          ...prev[active],
          messages: prev[active].messages.filter(msg => !msg.sending)
        }
      }));
      setInput(messageText); // Restore input
    } finally {
      setSendingMessage(false);
    }
  };

  
  const currentChat = chatData[active];
  const currentConvo = conversations.find(c => c._id === active);

  // Don't render if we don't have the required data
  if (loading) {
    return (
      <div className="inbox">
        <div className="inbox__loading">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="inbox">
        <div className="inbox__loading">
          <p>No conversations available</p>
        </div>
      </div>
    );
  }

  if (!active || !currentChat) {
    return (
      <div className="inbox">
        <div className="inbox__loading">
          <div className="loading-spinner"></div>
          <p>Loading conversation details...</p>
        </div>
      </div>
    );
  }



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
        {(conversations || []).map(c => (
          <div
            key={c._id}
            className={`inbox__convo ${active === c._id ? 'inbox__convo--active' : ''}`}
            onClick={() => setActive(c._id)}
          >
            <div className="inbox__convo-avatar">{c.customer?.name?.[0] || c.customerName?.[0] || '?'}</div>
            <div className="inbox__convo-body">
              <div className="inbox__convo-row">
                <span className="inbox__convo-name">{c.customer?.name || c.customerName || 'Unknown'}</span>
                <span className="inbox__convo-time">{c.lastActivity || c.time || 'N/A'}</span>
              </div>
              <div className="inbox__convo-row">
                <span className="inbox__convo-preview">{c.lastMessage || c.preview || 'No messages'}</span>
                {c.unreadCount > 0 && (
                  <span className="inbox__convo-unread">{c.unreadCount}</span>
                )}
              </div>
              <span className={`badge badge--${c.priority === 'urgent' ? 'red' : c.priority === 'high' ? 'yellow' : 'ghost'}`}>
                {c.priority || 'normal'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Middle — chat window */}
      <div className="inbox__chat">
        <div className="inbox__chat-header">
          <div className="inbox__chat-avatar">{currentChat?.name?.[0] || '?'}</div>
          <div>
            <div className="inbox__chat-name">{currentChat?.name || 'Unknown'}</div>
            <div className="inbox__chat-meta">{currentChat?.meta || 'Loading...'}</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <span className={`badge badge--${currentConvo?.priority === 'urgent' ? 'red' : currentConvo?.priority === 'high' ? 'yellow' : 'ghost'}`}>
              {currentConvo?.priority || 'normal'}
            </span>
            <span className={`badge badge--${currentConvo?.status === 'resolved' ? 'green' : 'ghost'}`}>
              {currentConvo?.status || 'open'}
            </span>
          </div>
        </div>

        <div className="inbox__messages">
          {(currentChat?.messages || []).map((m, i) => (
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
              disabled={!input.trim() || sendingMessage}
            >
              <Send size={14} />
              {sendingMessage ? 'Sending...' : 'Send'}
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
          {(currentChat?.suggestions || []).map((s, i) => (
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
          <div className="inbox__info-row"><span>Name</span><strong>{currentChat?.customerInfo?.name || 'N/A'}</strong></div>
          <div className="inbox__info-row"><span>Email</span><strong>{currentChat?.customerInfo?.email || 'N/A'}</strong></div>
          <div className="inbox__info-row"><span>Order</span><strong>{currentChat?.customerInfo?.order || 'N/A'}</strong></div>
          <div className="inbox__info-row"><span>Plan</span><strong>{currentChat?.customerInfo?.plan || 'N/A'}</strong></div>
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