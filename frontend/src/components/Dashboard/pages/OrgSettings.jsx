import './OrgSettings.scss';

const OrgSettings = () => (
  <div className="db-page orgsettings">
    <div className="db-page__header">
      <h1 className="db-page__title">Organization Settings</h1>
      <p className="db-page__sub">Configure your company workspace.</p>
    </div>
    <div className="two-col">
      <div className="db-card">
        <div style={{ fontWeight:600, fontSize:13, marginBottom:18 }}>General</div>
        {[
          { label:'Company Name',    placeholder:'Acme Corp' },
          { label:'Support Email',   placeholder:'support@acme.com' },
          { label:'Business Hours',  placeholder:'9:00 AM – 5:00 PM' },
          { label:'Timezone',        placeholder:'UTC+0' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:7 }}>{f.label}</label>
            <input className="db-input" placeholder={f.placeholder} />
          </div>
        ))}
        <button className="db-btn db-btn--primary">Save Changes</button>
      </div>
      <div className="db-card">
        <div style={{ fontWeight:600, fontSize:13, marginBottom:18 }}>Company Logo</div>
        <div className="orgsettings__logo-upload">
          <div className="orgsettings__logo-icon">⬆</div>
          <p>Drag & drop or click to upload</p>
          <small>PNG, SVG — max 2MB</small>
        </div>
      </div>
    </div>
  </div>
);

export default OrgSettings;