import { useState, useEffect, useRef } from 'react';
import './DashboardNav.scss';
import { Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PAGE_TITLES = {
  dashboard:    'Dashboard',
  inbox:        'Inbox',
  tickets:      'Tickets',
  analytics:    'Analytics',
  aiconfig:     'AI Config',
  knowledgebase:'Knowledge Base',
  aiinsights:   'AI Insights',
  chatwidget:   'Chat Widget',
  integrations: 'Integrations',
  teamagents:   'Team & Agents',
  notifications:'Notifications',
  csat:         'CSAT / Feedback',
  billing:      'Billing',
  orgsettings:  'Organization Settings',
  myprofile:    'My Profile',
};

const FEATURE_KEYWORDS = [
  { id: 'chatwidget', label: 'Chat Widget (Primary Color, Styling)', keywords: ['primary color', 'accent color', 'widget color', 'widget customization', 'styling', 'sdk', 'script', 'embed', 'position'] },
  { id: 'aiconfig', label: 'AI Config (AI Mode, Auto Escalation)', keywords: ['ai enabled', 'auto escalation', 'suggested replies', 'typing indicator', 'out-of-hours', 'ai model', 'prompt'] },
  { id: 'billing', label: 'Billing (Plans, Invoices, Pricing)', keywords: ['payment', 'plans', 'pricing', 'monthly', 'annual', 'yearly', 'invoice', 'pro', 'enterprise', 'upgrade', 'billing cycle'] },
  { id: 'orgsettings', label: 'Organization Settings (Branding, Name)', keywords: ['organization name', 'workspace name', 'company website', 'tenant', 'branding'] },
  { id: 'myprofile', label: 'My Profile (Name, Password)', keywords: ['change password', 'email', 'avatar', 'first name', 'last name', 'profile picture'] },
  { id: 'teamagents', label: 'Team & Agents (Add Members, Roles)', keywords: ['invite agent', 'team members', 'roles', 'add agent', 'support agents'] },
  { id: 'analytics', label: 'Analytics (CSAT, Charts, Performance)', keywords: ['charts', 'csat graph', 'csat score', 'response time', 'resolution time', 'conversation stats'] },
  { id: 'inbox', label: 'Inbox (Customer Chats, Messages)', keywords: ['customer chats', 'conversations', 'messages', 'active chats', 'replies'] },
  { id: 'tickets', label: 'Tickets (Customer Issues, Support)', keywords: ['tickets list', 'customer issues', 'resolved tickets', 'open tickets'] }
];

const DashboardNav = ({ activePage, setActivePage, sidebarOpen, setSidebarOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Setup keyboard shortcut ⌘K / Ctrl+K and Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter allowed views based on role (Agents only see allowed views)
  const isAgent = user?.role === 'support_agent';
  const allowedPageIds = isAgent 
    ? ['inbox', 'tickets', 'myprofile'] 
    : Object.keys(PAGE_TITLES);

  const queryLower = searchQuery.toLowerCase();
  const matches = [];

  if (searchQuery) {
    // 1. Direct page title matches
    allowedPageIds.forEach(id => {
      const label = PAGE_TITLES[id];
      if (label.toLowerCase().includes(queryLower)) {
        matches.push({ id, label });
      }
    });

    // 2. Feature keyword matches (exclude page IDs that already matched directly)
    const matchedPageIds = new Set(matches.map(m => m.id));
    FEATURE_KEYWORDS
      .filter(item => allowedPageIds.includes(item.id) && !matchedPageIds.has(item.id))
      .forEach(item => {
        const matchesKeyword = item.keywords.some(keyword => keyword.toLowerCase().includes(queryLower));
        if (matchesKeyword) {
          matches.push({ id: item.id, label: item.label });
        }
      });
  }



  const handleSelectPage = (pageId) => {
    if (setActivePage) {
      setActivePage(pageId);
    }
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputKeyDown = (e) => {
    if (matches.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectPage(matches[selectedIndex].id);
    }
  };

  return (
    <header className="db-nav">
      <div className="db-nav__left">
        <button
          className="db-nav__collapse"
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
        <div className="db-nav__breadcrumb">
          <span className="db-nav__bc-org">ChatFrame</span>
          <span className="db-nav__bc-sep">/</span>
          <span className="db-nav__bc-page">{PAGE_TITLES[activePage]}</span>
        </div>
      </div>

      <div className="db-nav__right" ref={containerRef}>
        <div className="db-nav__search-container">
          <div className={`db-nav__search ${isOpen && searchQuery ? 'db-nav__search--focused' : ''}`}>
            <Search size={13} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
                setSelectedIndex(0);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search views…"
            />
            <span className="db-nav__search-kbd">⌘K</span>
          </div>

          {isOpen && searchQuery && (
            <div className="db-nav__dropdown">
              {matches.length > 0 ? (
                <div className="db-nav__dropdown-list">
                  {matches.map((match, idx) => (
                    <div
                      key={match.id}
                      className={`db-nav__dropdown-item ${idx === selectedIndex ? 'db-nav__dropdown-item--selected' : ''}`}
                      onClick={() => handleSelectPage(match.id)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <span className="db-nav__dropdown-item-label">{match.label}</span>
                      <span className="db-nav__dropdown-item-action">Enter to Go</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="db-nav__dropdown-no-results">
                  No views found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <span className="db-nav__logout" onClick={handleLogout}>
          Logout
        </span>
      </div>
    </header>
  );
};

export default DashboardNav;