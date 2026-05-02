import './Sidebar.scss';

const NAV = [
  {
    group: 'OVERVIEW',
    items: [
      { id: 'dashboard',    label: 'Dashboard',    icon: '⬡' },
      { id: 'inbox',        label: 'Inbox',         icon: '◈', badge: 4 },
      { id: 'tickets',      label: 'Tickets',       icon: '◻' },
      { id: 'analytics',    label: 'Analytics',     icon: '◬' },
    ],
  },
  {
    group: 'AI & CHANNELS',
    items: [
      { id: 'aiconfig',      label: 'AI Config',       icon: '◉' },
      { id: 'knowledgebase', label: 'Knowledge Base',  icon: '◎' },
      { id: 'aiinsights',    label: 'AI Insights',     icon: '◈' },
      { id: 'chatwidget',    label: 'Chat Widget',     icon: '◌' },
      { id: 'integrations',  label: 'Integrations',    icon: '⬡' },
    ],
  },
  {
    group: 'TEAM',
    items: [
      { id: 'teamagents',   label: 'Team & Agents',   icon: '◎' },
      { id: 'notifications',label: 'Notifications',   icon: '◌', badge: 2 },
      { id: 'csat',         label: 'CSAT / Feedback', icon: '◈' },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { id: 'billing',     label: 'Billing',              icon: '◻' },
      { id: 'orgsettings', label: 'Organization Settings', icon: '◉' },
      { id: 'myprofile',   label: 'My Profile',           icon: '◎' },
    ],
  },
];

const Sidebar = ({ activePage, setActivePage, open }) => {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : 'sidebar--closed'}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
          <rect x="1" y="1" width="26" height="26" rx="7"
            stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
          <rect x="4" y="4" width="20" height="20" rx="5"
            fill="rgba(255,255,255,0.06)"/>
          <path d="M8 9.5C8 8.67 8.67 8 9.5 8h9C19.33 8 20 8.67 20 9.5v6c0 .83-.67 1.5-1.5 1.5H15l-3 2.5V17H9.5C8.67 17 8 16.33 8 15.5V9.5z"
            fill="white" opacity="0.9"/>
          <circle cx="11" cy="12.5" r="1" fill="#0F0F0F"/>
          <circle cx="14" cy="12.5" r="1" fill="#0F0F0F"/>
          <circle cx="17" cy="12.5" r="1" fill="#0F0F0F"/>
        </svg>
        {open && (
          <span className="sidebar__logo-name">
            <span className="sidebar__logo-chat">Chat</span>
            <span className="sidebar__logo-frame">Frame</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {NAV.map(section => (
          <div key={section.group} className="sidebar__group">
            {open && (
              <span className="sidebar__group-label">{section.group}</span>
            )}
            {section.items.map(item => (
              <button
                key={item.id}
                className={`sidebar__item ${activePage === item.id ? 'sidebar__item--active' : ''}`}
                onClick={() => setActivePage(item.id)}
                title={!open ? item.label : undefined}
              >
                <span className="sidebar__item-icon">{item.icon}</span>
                {open && (
                  <span className="sidebar__item-label">{item.label}</span>
                )}
                {open && item.badge && (
                  <span className="sidebar__item-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {open && (
        <div className="sidebar__footer">
          <div className="sidebar__avatar">CF</div>
          <div className="sidebar__user">
            <span className="sidebar__user-name">Ada Lovelace</span>
            <span className="sidebar__user-role">Owner</span>
          </div>
          <div className="sidebar__status">
            <span className="sidebar__status-dot" />
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;