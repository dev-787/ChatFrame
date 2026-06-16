import { useState, useEffect, useRef } from 'react';
import { Search, Paperclip, Send, Bot, UserCheck, CheckCircle2, Clock, XCircle, ChevronDown } from 'lucide-react';
import Chip from '../../Chip/Chip';
import './Inbox.scss';
import apiService from '../../../services/api';
import socketService from '../../../services/socket';
import { useAuth } from '../../../contexts/AuthContext';

const renderStatusChip = (status) => {
  switch (status) {
    case 'resolved':
      return (
        <Chip color="success">
          <CheckCircle2 size={12} />
          <Chip.Label>Completed</Chip.Label>
        </Chip>
      );
    case 'in_progress':
      return (
        <Chip color="warning">
          <Clock size={12} />
          <Chip.Label>Pending</Chip.Label>
        </Chip>
      );
    case 'open':
      return (
        <Chip color="default">
          <span className="chip-dot" />
          <Chip.Label>Open</Chip.Label>
        </Chip>
      );
    case 'escalated':
      return (
        <Chip color="danger">
          <XCircle size={12} />
          <Chip.Label>Escalated</Chip.Label>
        </Chip>
      );
    case 'closed':
      return (
        <Chip color="danger">
          <XCircle size={12} />
          <Chip.Label>Closed</Chip.Label>
        </Chip>
      );
    default:
      return (
        <Chip color="default">
          <span className="chip-dot" />
          <Chip.Label>{status}</Chip.Label>
        </Chip>
      );
  }
};

const renderPriorityChip = (priority) => {
  switch (priority) {
    case 'urgent':
      return (
        <Chip color="danger">
          <span className="chip-dot" />
          <Chip.Label>Urgent</Chip.Label>
        </Chip>
      );
    case 'high':
      return (
        <Chip color="warning">
          <span className="chip-dot" />
          <Chip.Label>High</Chip.Label>
        </Chip>
      );
    case 'medium':
      return (
        <Chip color="default">
          <span className="chip-dot" />
          <Chip.Label>Medium</Chip.Label>
        </Chip>
      );
    case 'low':
      return (
        <Chip color="accent">
          <span className="chip-dot" />
          <Chip.Label>Low</Chip.Label>
        </Chip>
      );
    default:
      return (
        <Chip color="default">
          <span className="chip-dot" />
          <Chip.Label>{priority}</Chip.Label>
        </Chip>
      );
  }
};

const Inbox = ({ initialCustomerId }) => {
  const { user, getFullName } = useAuth();
  const [active, setActive] = useState(initialCustomerId || null);
  const [input, setInput] = useState('');
  const [chatData, setChatData] = useState({});
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [assigningTicket, setAssigningTicket] = useState(false);
  const [suggestedRepliesEnabled, setSuggestedRepliesEnabled] = useState(true);
  const [toasts, setToasts] = useState([]);

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const showToast = (message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message }]);
    
    // Automatically remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Load conversations from API
  useEffect(() => {
    loadConversations();

    // Fetch AI Config to check if suggested replies is enabled
    const checkAIConfig = async () => {
      try {
        const res = await apiService.getAIConfig();
        if (res.success && res.data && res.data.config) {
          setSuggestedRepliesEnabled(res.data.config.suggestedReplies !== false);
        }
      } catch (err) {
        console.error('Failed to load AI config in Inbox:', err);
      }
    };
    checkAIConfig();
    
    // Connect socket for real-time updates
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Listen for new messages
    const handleNewMessage = (payload) => {
      if (!payload || !payload.ticketId || !payload.message) return;
      const { ticketId, message } = payload;

      // Update conversations preview and last activity in the list
      setConversations(prev => {
        return prev.map(convo => {
          if (convo._id === ticketId) {
            return {
              ...convo,
              lastMessage: message,
              lastActivity: new Date(message.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              preview: message.isSummary 
                ? `[Summary] ${message.content}`
                : message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
            };
          }
          return convo;
        });
      });

      // Update active chat window messages
      setChatData(prev => {
        const existingChat = prev[ticketId];
        if (!existingChat) return prev;

        const mappedMsg = {
          from: message.senderType === 'customer' ? 'customer' : 
                message.senderType === 'ai' ? 'ai' : 'agent',
          text: message.content,
          time: new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          id: message._id,
          isAiGenerated: message.isAiGenerated || false,
          aiConfidence: message.aiConfidence || null,
          isSummary: message.isSummary || false
        };

        const isDuplicate = existingChat.messages.some(m => m.id === mappedMsg.id);
        if (isDuplicate) return prev;

        let newMessages = [...existingChat.messages];
        if (mappedMsg.from === 'agent') {
          const sendingIndex = newMessages.findIndex(m => m.sending);
          if (sendingIndex !== -1) {
            newMessages[sendingIndex] = { ...mappedMsg, sending: false };
          } else {
            newMessages.push(mappedMsg);
          }
        } else {
          newMessages.push(mappedMsg);
        }

        return {
          ...prev,
          [ticketId]: {
            ...existingChat,
            messages: newMessages
          }
        };
      });
    };

    // Listen for real-time ticket escalation notifications
    const handleNotification = (notification) => {
      console.log('📡 Real-time notification received in Inbox:', notification);
      if (notification && notification.type === 'ticket_escalated') {
        showToast(notification.message || `Ticket has been escalated!`);
        loadConversations();
        
        if (activeRef.current && activeRef.current === notification.metadata?.ticketId) {
          loadTicketDetails(activeRef.current);
        }
      }
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onNotification(handleNotification);

    return () => {
      socketService.offNewMessage(handleNewMessage);
      socketService.offNotification(handleNotification);
      if (activeRef.current) {
        socketService.leaveTicket(activeRef.current);
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
        // Transform API response to match frontend expectations
        const transformedConversations = response.data.conversations.map(convo => ({
          ...convo,
          customer: {
            name: convo.customerName || 'Unknown Customer'
          },
          lastActivity: convo.lastMessage ? 
            new Date(convo.lastMessage.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'N/A',
          preview: convo.lastMessage ? 
            convo.lastMessage.content.substring(0, 50) + (convo.lastMessage.content.length > 50 ? '...' : '') : 
            'No messages',
          unreadCount: 0 // You can implement this later based on your needs
        }));

        console.log('Transformed conversations:', transformedConversations);
        setConversations(transformedConversations);
        
        // Set first accessible conversation as active if no active conversation and we have data
        if (!active && transformedConversations.length > 0) {
          const alreadyAssignedToMe = transformedConversations.find(c => {
            const assignedUserId = c.assignedTo?._id || c.assignedTo;
            return String(assignedUserId) === String(user?.id || user?._id);
          });
          
          if (alreadyAssignedToMe) {
            setActive(alreadyAssignedToMe._id);
          } else if (user?.role === 'company_admin') {
            setActive(transformedConversations[0]._id);
          }
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
        // Transform API response to match frontend expectations
        const transformedData = {
          ...response.data.ticket,
          name: response.data.ticket.customerName || 'Unknown Customer',
          meta: `Ticket #${response.data.ticket.ticketNumber} • ${response.data.ticket.status}`,
          assignedTo: response.data.ticket.assignedTo || null,
          messages: (response.data.messages || []).map(msg => ({
            from: msg.senderType === 'customer' ? 'customer' : 
                  msg.senderType === 'ai' ? 'ai' : 'agent',
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            id: msg._id,
            isAiGenerated: msg.isAiGenerated || false,
            aiConfidence: msg.aiConfidence || null,
            isSummary: msg.isSummary || false
          })),
          suggestions: [
            "Thanks for reaching out! I'll help you with that.",
            "Let me look into this for you right away.",
            "I understand your concern. Here's what we can do...",
            "Is there anything else I can help you with today?"
          ],
          customerInfo: {
            name: response.data.ticket.customerName || 'N/A',
            email: response.data.ticket.customerEmail || 'N/A',
            order: 'N/A',
            plan: 'Standard'
          }
        };

        setChatData(prev => ({
          ...prev,
          [ticketId]: transformedData
        }));
      }
    } catch (error) {
      console.error('Failed to load ticket details:', error);
      if (error.status === 403) {
        alert(error.message || "Access Denied: This ticket is assigned to another agent.");
        setActive(null);
      }
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
        content: messageText,
        senderType: 'agent'
      });

      if (response.success && response.data && response.data.message) {
        // Replace temp message with real message from server
        setChatData(prev => ({
          ...prev,
          [active]: {
            ...prev[active],
            messages: prev[active].messages.map(msg => 
              msg.sending ? {
                from: 'agent',
                text: response.data.message.content,
                time: new Date(response.data.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                id: response.data.message._id,
                sending: false
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

  const handleAssignToMe = async () => {
    if (!isValidObjectId(active) || assigningTicket) return;
    try {
      setAssigningTicket(true);
      const res = await apiService.updateTicket(active, {
        assignedTo: user?.id || user?._id,
        status: 'in_progress',
      });
      if (res.success) {
        const agentName = getFullName() || 'You';
        // Update chatData with new assigned agent and status
        setChatData(prev => ({
          ...prev,
          [active]: {
            ...prev[active],
            assignedTo: { firstName: user?.firstName, lastName: user?.lastName },
            meta: `Ticket #${prev[active]?.ticketNumber} • in_progress`,
          }
        }));
        // Update conversation list status
        setConversations(prev =>
          prev.map(c => c._id === active ? { ...c, status: 'in_progress' } : c)
        );
      }
    } catch (e) {
      console.error('Failed to assign ticket:', e);
    } finally {
      setAssigningTicket(false);
    }
  };

  const currentChat = chatData[active];
  const currentConvo = conversations.find(c => c._id === active);
  const chatSummary = currentChat?.messages?.find(m => m.isSummary);

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







  const handleConvoClick = async (c) => {
    const assignedUserId = c.assignedTo?._id || c.assignedTo;
    const isAssigned = !!assignedUserId;
    const isAssignedToMe = String(assignedUserId) === String(user?.id || user?._id);
    const isCompanyOwner = user?.role === 'company_admin';

    if (isCompanyOwner || isAssignedToMe || !isAssigned) {
      setActive(c._id);
    } else {
      alert("Access Denied: This ticket is assigned to another agent.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="inbox">
      {/* Real-time Toast Notifications */}
      <div className="inbox__toast-container">
        {toasts.map(t => (
          <div key={t.id} className="inbox__toast">
            <div className="inbox__toast-icon">⚠️</div>
            <div className="inbox__toast-content">
              <div className="inbox__toast-title">Ticket Escalated</div>
              <div className="inbox__toast-message">{t.message}</div>
            </div>
            <button className="inbox__toast-close" onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>

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
        <div className="inbox__convos">
          {conversations.length === 0 ? (
            <div className="inbox__empty-convos">
              No conversations assigned to you. Go to the Tickets section to find and claim new tickets.
            </div>
          ) : (
            (conversations || []).map(c => (
              <div
                key={c._id}
                className={`inbox__convo ${active === c._id ? 'inbox__convo--active' : ''}`}
                onClick={() => handleConvoClick(c)}
              >
                <div className="inbox__convo-avatar">
                  {String(c.customer?.name || c.customerName || '?')[0]}
                </div>
                <div className="inbox__convo-body">
                  <div className="inbox__convo-row">
                    <span className="inbox__convo-name">
                      {String(c.customer?.name || c.customerName || 'Unknown')}
                    </span>
                    <span className="inbox__convo-time">
                      {String(c.lastActivity || 'N/A')}
                    </span>
                  </div>
                  <div className="inbox__convo-row">
                    <span className="inbox__convo-preview">
                      {String(c.preview || 'No messages')}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="inbox__convo-unread">{c.unreadCount}</span>
                    )}
                  </div>
                  {renderPriorityChip(c.priority || 'medium')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Middle — chat window */}
      <div className="inbox__chat">
        {!active ? (
          <div className="inbox__no-chat">
            <Bot size={48} style={{ color: 'var(--green)', opacity: 0.3, marginBottom: 16 }} />
            <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>No Active Conversation</p>
            <p style={{ marginTop: '8px', opacity: 0.7, textAlign: 'center', maxWidth: '300px', lineHeight: '1.5' }}>
              Select a conversation from the sidebar list, or head over to the <strong>Tickets</strong> section to claim a new ticket.
            </p>
          </div>
        ) : !currentChat ? (
          <div className="inbox__loading">
            <div className="loading-spinner"></div>
            <p>Loading conversation details...</p>
          </div>
        ) : (
          <>
            <div className="inbox__chat-header">
              <div className="inbox__chat-avatar">
                {String(currentChat?.name || '?')[0]}
              </div>
              <div>
                <div className="inbox__chat-name">
                  {String(currentChat?.name || 'Unknown')}
                </div>
                <div className="inbox__chat-meta">
                  {String(currentChat?.meta || 'Loading...')}
                </div>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
                {renderPriorityChip(currentConvo?.priority || 'medium')}
                {renderStatusChip(currentConvo?.status || 'open')}
              </div>
            </div>

            <div className="inbox__messages">
              {(currentChat?.messages || []).map((m, i) => {
                if (m.isSummary) {
                  return null;
                }

                return (
                  <div key={i} className={`inbox__msg inbox__msg--${m.from}`}>
                    {m.from === 'ai' && (
                      <div className="inbox__msg-ai-badge">
                        <Bot size={12} />
                        AI Assistant
                        {m.aiConfidence && (
                          <span className="inbox__msg-confidence">
                            {Math.round(m.aiConfidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                    <div className="inbox__msg-bubble">
                      {String(m.text || m.content || '')}
                    </div>
                    <div className="inbox__msg-time">
                      {String(m.time || '')}
                    </div>
                  </div>
                );
              })}
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
          </>
        )}
      </div>

      {/* Right — AI Copilot */}
      {active && currentChat && (
        <div className="inbox__copilot">
          <div className="inbox__copilot-header">
            <span className="inbox__copilot-title">
              <Bot size={16} />
              AI Copilot
            </span>
            <span className="badge badge--green">Active</span>
          </div>

          {chatSummary && (
            <div className="inbox__copilot-section">
              <div className="inbox__copilot-label">AI Chat Summary</div>
              <div className="inbox__copilot-summary-box">
                <div className="inbox__copilot-summary-text">
                  "{chatSummary.text}"
                </div>
                {chatSummary.aiConfidence && (
                  <div className="inbox__copilot-summary-confidence">
                    Escalated @ {Math.round(chatSummary.aiConfidence * 100)}% Confidence
                  </div>
                )}
              </div>
            </div>
          )}

          {suggestedRepliesEnabled && (
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
          )}

          <div className="inbox__copilot-section">
            <div className="inbox__copilot-label">Customer Info</div>
            <div className="inbox__info-row">
              <span>Name</span>
              <strong>{String(currentChat?.customerInfo?.name || 'N/A')}</strong>
            </div>
            <div className="inbox__info-row">
              <span>Email</span>
              <strong>{String(currentChat?.customerInfo?.email || 'N/A')}</strong>
            </div>
          </div>

          <div className="inbox__copilot-section">
            <div className="inbox__copilot-label">Assigned Agent</div>
            <div className="inbox__info-row">
              <span>Agent</span>
              <strong>
                {currentChat?.assignedTo
                  ? `${currentChat.assignedTo.firstName || ''} ${currentChat.assignedTo.lastName || ''}`.trim()
                  : 'Unassigned'}
              </strong>
            </div>
            {!currentChat?.assignedTo && (
              <button
                className="db-btn db-btn--ghost inbox__assign-btn"
                onClick={handleAssignToMe}
                disabled={assigningTicket}
              >
                <UserCheck size={13} />
                {assigningTicket ? 'Assigning…' : 'Assign to me'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;