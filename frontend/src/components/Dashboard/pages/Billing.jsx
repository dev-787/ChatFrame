import './Billing.scss';

const HISTORY = [
  { date:'May 1, 2026',  amount:'$49',  status:'paid' },
  { date:'Apr 1, 2026',  amount:'$49',  status:'paid' },
  { date:'Mar 1, 2026',  amount:'$29',  status:'paid' },
];

const Billing = () => (
  <div className="db-page billing">
    <div className="db-page__header">
      <h1 className="db-page__title">Billing</h1>
      <p className="db-page__sub">Manage your subscription and payment history.</p>
    </div>
    <div className="two-col">
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div className="db-card billing__plan">
          <div className="billing__plan-label">Current Plan</div>
          <div className="billing__plan-name">Pro</div>
          <div className="billing__plan-price">$49 <span>/ month</span></div>
          <button className="db-btn db-btn--primary" style={{ marginTop:16, width:'100%' }}>
            Upgrade to Enterprise
          </button>
        </div>
        <div className="db-card">
          <div style={{ fontWeight:600, fontSize:13, marginBottom:14 }}>AI Usage</div>
          <div className="billing__usage-bar">
            <div className="billing__usage-fill" style={{ width:'68%' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <span style={{ fontSize:12, color:'var(--text-2)' }}>6,800 / 10,000 AI replies</span>
            <span style={{ fontSize:12, color:'var(--green)' }}>68%</span>
          </div>
        </div>
      </div>
      <div className="db-card">
        <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Payment History</div>
        {HISTORY.map((h,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:13, color:'var(--text-2)' }}>{h.date}</span>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{h.amount}</span>
            <span className="badge badge--green">{h.status}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Billing;