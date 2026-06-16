import { useState, useEffect } from 'react';
import './AIConfig.scss';
import apiService from '../../../services/api';

const Toggle = ({ label, checked, onChange }) => {
  return (
    <div className="aiconfig__toggle-row">
      <div>
        <div className="aiconfig__toggle-label">{label}</div>
      </div>
      <label className="db-toggle">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <div className="db-toggle__track"><div className="db-toggle__thumb" /></div>
      </label>
    </div>
  );
};

const AIConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [isEnabled, setIsEnabled] = useState(true);
  const [autoEscalation, setAutoEscalation] = useState(true);
  const [suggestedReplies, setSuggestedReplies] = useState(true);
  
  const [confidence, setConfidence] = useState(75);
  const [tone, setTone] = useState('professional');
  const [maxLen, setMaxLen] = useState(300);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.getAIConfig();
        if (res.success && res.data && res.data.config) {
          const cfg = res.data.config;
          setIsEnabled(cfg.isEnabled !== undefined ? cfg.isEnabled : true);
          setAutoEscalation(cfg.autoEscalation !== undefined ? cfg.autoEscalation : true);
          setSuggestedReplies(cfg.suggestedReplies !== undefined ? cfg.suggestedReplies : true);
          setConfidence(cfg.confidenceThreshold !== undefined ? Math.round(cfg.confidenceThreshold * 100) : 75);
          setTone(cfg.responseTone || 'professional');
          setPrompt(cfg.systemPrompt || '');
        }
      } catch (err) {
        console.error('Failed to load AI config:', err);
        setError(err.message || 'Failed to load AI configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaved(false);
      const res = await apiService.updateAIConfig({
        isEnabled,
        autoEscalation,
        suggestedReplies,
        confidenceThreshold: confidence / 100,
        responseTone: tone,
        systemPrompt: prompt
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save AI config:', err);
      setError(err.message || 'Failed to save AI configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="db-page aiconfig">
        <div className="db-page__header">
          <h1 className="db-page__title">AI Config</h1>
          <p className="db-page__sub">Control how the AI behaves across your support channels.</p>
        </div>
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading configuration…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-page aiconfig">
      <div className="db-page__header">
        <h1 className="db-page__title">AI Config</h1>
        <p className="db-page__sub">Control how the AI behaves across your support channels.</p>
      </div>

      {error && (
        <div className="dashboard-error" style={{ marginBottom: 16 }}>
          <p>{error}</p>
        </div>
      )}

      <div className="two-col">
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="db-card">
            <div className="aiconfig__section-title">Toggles</div>
            <Toggle label="AI Enabled"               checked={isEnabled} onChange={() => setIsEnabled(v => !v)} />
            <Toggle label="Auto Escalation"          checked={autoEscalation} onChange={() => setAutoEscalation(v => !v)} />
            <Toggle label="Suggested Replies"        checked={suggestedReplies} onChange={() => setSuggestedReplies(v => !v)} />
          </div>

          <div className="db-card">
            <div className="aiconfig__section-title">Response Settings</div>
            <div className="aiconfig__field">
              <label>Confidence Threshold — <strong>{confidence}%</strong></label>
              <input
                type="range" min={40} max={100} value={confidence}
                className="aiconfig__slider"
                onChange={e => setConfidence(parseInt(e.target.value))}
              />
              <div className="aiconfig__slider-labels">
                <span>More answers</span><span>More accurate</span>
              </div>
            </div>
            <div className="aiconfig__field">
              <label>Response Tone</label>
              <select className="db-input aiconfig__select" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div className="aiconfig__field">
              <label>Max Response Length — <strong>{maxLen} chars</strong></label>
              <input type="range" min={100} max={800} value={maxLen}
                className="aiconfig__slider"
                onChange={e => setMaxLen(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="db-card aiconfig__prompt-card">
          <div className="aiconfig__section-title">System Prompt</div>
          <p className="aiconfig__prompt-hint">
            This is the instruction your AI follows for every response. Be specific about tone, limits, and context.
          </p>
          <textarea
            className="aiconfig__prompt-area"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={10}
          />
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
            <button 
              className="db-btn db-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfig;