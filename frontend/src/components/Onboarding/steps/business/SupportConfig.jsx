import React, { useState } from "react";

const QUERY_TYPES = [
  "Billing & Payments",
  "Orders & Delivery",
  "Refunds & Returns",
  "Account & Access",
  "Technical Support",
  "Product Queries",
  "Complaints",
  "General Enquiries",
];

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

const SupportConfig = ({ formData, updateForm, onNext, onBack, isLast, onFinish }) => {
  const [selectedTypes, setSelectedTypes] = useState(formData.queryTypes || []);
  const f = formData;
  const set = (key) => (e) => updateForm({ [key]: e.target.value });

  const toggleType = (type) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(next);
    updateForm({ queryTypes: next });
  };

  const handleSubmit = () => {
    updateForm({ queryTypes: selectedTypes });
    if (isLast) onFinish();
    else onNext();
  };

  return (
    <div className="support-config">
      {/* Query types */}
      <div className="ob-field">
        <label>Types of queries you handle</label>
        <div className="pill-grid">
          {QUERY_TYPES.map(type => (
            <button
              key={type}
              type="button"
              className={`pill ${selectedTypes.includes(type) ? "pill--active" : ""}`}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

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
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button className="ob-btn ob-btn--primary" type="button" onClick={handleSubmit}>
          {isLast ? "Launch ChatFrame" : "Continue"}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SupportConfig;