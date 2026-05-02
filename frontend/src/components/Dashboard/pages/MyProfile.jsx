import './MyProfile.scss';

const MyProfile = () => (
  <div className="db-page myprofile">
    <div className="db-page__header">
      <h1 className="db-page__title">My Profile</h1>
      <p className="db-page__sub">Manage your account settings.</p>
    </div>
    <div className="two-col">
      <div className="db-card">
        <div className="myprofile__avatar-row">
          <div className="myprofile__avatar">AL</div>
          <div>
            <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>Ada Lovelace</div>
            <div style={{ fontSize:12, color:'var(--text-3)' }}>Owner · ChatFrame</div>
          </div>
        </div>
        <div style={{ height:1, background:'var(--border)', margin:'18px 0' }} />
        
        {/* Editable fields */}
        {[
          { label:'Full Name',  val:'Ada Lovelace' },
          { label:'Email',      val:'ada@chatframe.io' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:7 }}>{f.label}</label>
            <input className="db-input" defaultValue={f.val} />
          </div>
        ))}
        
        {/* Non-editable role field */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:7 }}>Role</label>
          <div className="myprofile__readonly-field">Owner</div>
        </div>
        
        <button className="db-btn db-btn--primary">Save Profile</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div className="db-card">
          <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Change Password</div>
          {['Current Password','New Password','Confirm Password'].map(l => (
            <div key={l} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:7 }}>{l}</label>
              <input type="password" className="db-input" placeholder="••••••••" />
            </div>
          ))}
          <button className="db-btn db-btn--ghost">Update Password</button>
        </div>
        <div className="db-card">
          <div style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>Notification Preferences</div>
          {['Email alerts','Browser push','Weekly digest'].map(n => (
            <div key={n} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:13, color:'var(--text-2)' }}>{n}</span>
              <label className="db-toggle">
                <input type="checkbox" defaultChecked />
                <div className="db-toggle__track"><div className="db-toggle__thumb" /></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MyProfile;