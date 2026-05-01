import React, { useState } from "react";

const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 1.5L2 3.5v4.5c0 3.3 2.4 6 5.5 6.5C10.6 14 13 11.3 13 8V3.5L7.5 1.5Z"
      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M5 7.5l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const JoinCompany = ({ formData, updateForm, onNext, onBack, isLast, onFinish }) => {
  const [errors, setErrors] = useState({});
  const f = formData;
  const set = (key) => (e) => updateForm({ [key]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!f.inviteCode?.trim()) errs.inviteCode = "Invite code is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (isLast) onFinish();
    else onNext();
  };

  return (
    <div className="join-company">
      <div className="join-company__hint">
        <ShieldIcon />
        <p>
          Your company admin will share a unique <strong>Company ID</strong> or{" "}
          <strong>Invite Code</strong> with you. Enter it below to join your workspace securely.
        </p>
      </div>

      <div className={`ob-field ob-field--code ${errors.inviteCode ? "ob-field--error" : ""}`}>
        <label>Company ID / Invite Code</label>
        <input
          type="text"
          placeholder="e.g. CF-XXXXXXXX"
          value={f.inviteCode || ""}
          onChange={set("inviteCode")}
          spellCheck={false}
          autoComplete="off"
        />
        {errors.inviteCode && <span className="ob-field__error">{errors.inviteCode}</span>}
      </div>

      <p className="join-company__note">
        Don't have a code? Ask your support team manager to send you an invite from their ChatFrame dashboard.
      </p>

      <div className="ob-actions">
        <button className="ob-btn ob-btn--ghost" type="button" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button className="ob-btn ob-btn--primary" type="button" onClick={handleSubmit}>
          {isLast ? "Join workspace" : "Continue"}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default JoinCompany;