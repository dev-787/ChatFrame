import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return { value: `${String(i).padStart(2, "0")}:00`, label: `${h}:00 ${ampm}` };
});

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SupportConfig = ({ formData, updateForm, onNext, onBack, isLast, onFinish, onSubmit, loading, fieldErrors }) => {
  const f = formData;
  const set = (key) => (e) => updateForm({ [key]: e.target.value });

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit(f);
    } else if (isLast) {
      onFinish();
    } else {
      onNext();
    }
  };

  return (
    <div className="support-config">
      {/* Support hours */}
      <div className="ob-field">
        <label>Support hours</label>
        <div className="hours-row">
          <div className="ob-field ob-field--select ob-field--inline">
            <span className="hours-label">Opens at</span>
            <div className="ob-select-wrap">
              <select value={f.openHour || "09:00"} onChange={set("openHour")}>
                {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
              <ChevronIcon />
            </div>
          </div>
          <div className="ob-field ob-field--select ob-field--inline">
            <span className="hours-label">Closes at</span>
            <div className="ob-select-wrap">
              <select value={f.closeHour || "17:00"} onChange={set("closeHour")}>
                {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
              <ChevronIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Out-of-hours message */}
      <div className="ob-field">
        <label>
          Out-of-hours message
          <span className="ob-field__optional">optional</span>
        </label>
        <textarea
          placeholder="We're currently offline. We'll get back to you within 24 hours..."
          value={f.outOfHoursMessage || ""}
          onChange={set("outOfHoursMessage")}
          rows={3}
        />
      </div>

      <div className="ob-actions">
        <button className="ob-btn ob-btn--ghost" type="button" onClick={onBack}>
          <span className="ob-arrow ob-arrow--back">
            <span className="ob-arrow__default"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className="ob-arrow__hover"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
          </span>
          Back
        </button>
        <button className="ob-btn ob-btn--primary" type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Setting up workspace..." : (isLast ? "Launch ChatFrame" : "Continue")}
          <span className="ob-arrow">
            <span className="ob-arrow__default"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className="ob-arrow__hover"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default SupportConfig;
