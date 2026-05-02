import { useState } from 'react';
import './ChatWidget.scss';

const ChatWidget = () => {
  const [color, setColor] = useState('#a0ffb4');
  const [welcome, setWelcome] = useState('Hi there 👋 How can we help?');

  return (
    <div className="db-page chatwidget">
      <div className="db-page__header">
        <h1 className="db-page__title">Chat Widget</h1>
        <p className="db-page__sub">Customize your embeddable support widget.</p>
      </div>
      <div className="two-col">
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="db-card">
            <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Customization</div>
            <div className="chatwidget__field">
              <label>Primary Color</label>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="chatwidget__color" />
                <span style={{ fontSize:12, color:'var(--text-2)' }}>{color}</span>
              </div>
            </div>
            <div className="chatwidget__field">
              <label>Welcome Message</label>
              <input className="db-input" value={welcome} onChange={e => setWelcome(e.target.value)} />
            </div>
          </div>

          <div className="db-card">
            <div style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>Embed Code</div>
            <div className="chatwidget__code">
              <pre>{`<script
  src="https://cdn.chatframe.io/v2/widget.js"
  data-key="cf_live_••••••••"
  defer
></script>`}</pre>
              <button className="db-btn db-btn--ghost" style={{ fontSize:11, padding:'4px 10px' }}>Copy</button>
            </div>
          </div>
        </div>

        <div className="chatwidget__preview">
          <div className="chatwidget__window" style={{ '--wc': color }}>
            <div className="chatwidget__win-header">
              <div className="chatwidget__win-title">ChatFrame Support</div>
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:18, cursor:'pointer' }}>×</span>
            </div>
            <div className="chatwidget__win-body">
              <div className="chatwidget__win-bubble">{welcome}</div>
            </div>
            <div className="chatwidget__win-input">
              <input placeholder="Type a message…" readOnly />
              <button style={{ background: color, border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:600 }}>→</button>
            </div>
          </div>
          <p style={{ textAlign:'center', fontSize:11, color:'var(--text-3)', marginTop:16 }}>Live preview</p>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;