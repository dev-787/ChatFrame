import { useState } from 'react';
import './Dashboard.scss';
import Sidebar from './Sidebar';
import DashboardNav from './DashboardNav';
import DashboardHome from './pages/DashboardHome';
import Inbox from './pages/Inbox';
import Tickets from './pages/Tickets';
import Analytics from './pages/Analytics';
import AIConfig from './pages/AIConfig';
import KnowledgeBase from './pages/KnowledgeBase';
import AIInsights from './pages/AIInsights';
import ChatWidget from './pages/ChatWidget';
import TeamAgents from './pages/TeamAgents';
import Notifications from './pages/Notifications';
import CSAT from './pages/CSAT';
import Billing from './pages/Billing';
import OrgSettings from './pages/OrgSettings';
import MyProfile from './pages/MyProfile';

const PAGES = {
  dashboard:    DashboardHome,
  inbox:        Inbox,
  tickets:      Tickets,
  analytics:    Analytics,
  aiconfig:     AIConfig,
  knowledgebase: KnowledgeBase,
  aiinsights:   AIInsights,
  chatwidget:   ChatWidget,
  teamagents:   TeamAgents,
  notifications: Notifications,
  csat:         CSAT,
  billing:      Billing,
  orgsettings:  OrgSettings,
  myprofile:    MyProfile,
};

const Dashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const PageComponent = PAGES[activePage] || DashboardHome;

  return (
    <div className={`db ${sidebarOpen ? 'db--sidebar-open' : 'db--sidebar-closed'}`}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <div className="db__main">
        <DashboardNav
          activePage={activePage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="db__content">
          <PageComponent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;