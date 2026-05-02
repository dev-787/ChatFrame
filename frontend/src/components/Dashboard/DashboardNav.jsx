import './DashboardNav.scss';

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

const CollapseIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d={open
        ? "M3 5.5h4V2M3 9.5h4V13M12 5.5H8V2M12 9.5H8V13"
        : "M2 3h4v4M2 12h4V8M13 3H9v4M13 12H9V8"}
      stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const DashboardNav = ({ activePage, sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="db-nav">
      <div className="db-nav__left">
        <button
          className="db-nav__collapse"
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <CollapseIcon open={sidebarOpen} />
        </button>
        <div className="db-nav__breadcrumb">
          <span className="db-nav__bc-org">ChatFrame</span>
          <span className="db-nav__bc-sep">/</span>
          <span className="db-nav__bc-page">{PAGE_TITLES[activePage]}</span>
        </div>
      </div>

      <div className="db-nav__right">
        <div className="db-nav__search">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input placeholder="Search…" />
          <span className="db-nav__search-kbd">⌘K</span>
        </div>
        <button className="db-nav__icon-btn">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1zM7.5 4v4l3 1.5"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="db-nav__avatar">AL</div>
      </div>
    </header>
  );
};

export default DashboardNav;