import React, { useState } from "react";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.3 1.7 6.7 1 8c1.3 2.7 4 5 7 5a8 8 0 0 0 3.8-1M6 3.2A8 8 0 0 1 8 3c3 0 5.7 2.3 7 5a10 10 0 0 1-1.8 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );



const AccountDetails = ({ formData, updateForm, onNext, onBack, showBack }) => {
  const [show, setShow] = useState({ password: false, confirm: false });
  const [errors, setErrors] = useState({});

  const f = formData;

  const set = (key) => (e) => updateForm({ [key]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!f.firstName?.trim()) errs.firstName = "Required";
    if (!f.lastName?.trim())  errs.lastName  = "Required";
    if (!f.email?.includes("@")) errs.email  = "Valid email required";
    if ((f.password?.length || 0) < 8) errs.password = "Min 8 characters";
    if (f.password !== f.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => { if (validate()) onNext(); };

  return (
    <div className="account-details">
      {/* Name row */}
      <div className="ob-row">
        <div className={`ob-field ${errors.firstName ? "ob-field--error" : ""}`}>
          <label>First name</label>
          <input
            type="text"
            placeholder="Ada"
            value={f.firstName || ""}
            onChange={set("firstName")}
          />
          {errors.firstName && <span className="ob-field__error">{errors.firstName}</span>}
        </div>
        <div className={`ob-field ${errors.lastName ? "ob-field--error" : ""}`}>
          <label>Last name</label>
          <input
            type="text"
            placeholder="Lovelace"
            value={f.lastName || ""}
            onChange={set("lastName")}
          />
          {errors.lastName && <span className="ob-field__error">{errors.lastName}</span>}
        </div>
      </div>

      <div className={`ob-field ${errors.email ? "ob-field--error" : ""}`}>
        <label>Email address</label>
        <input
          type="email"
          placeholder="ada@company.com"
          value={f.email || ""}
          onChange={set("email")}
        />
        {errors.email && <span className="ob-field__error">{errors.email}</span>}
      </div>

      <div className={`ob-field ob-field--password ${errors.password ? "ob-field--error" : ""}`}>
        <label>Password</label>
        <input
          type={show.password ? "text" : "password"}
          placeholder="Min. 8 characters"
          value={f.password || ""}
          onChange={set("password")}
        />
        <button type="button" className="ob-field__eye" onClick={() => setShow(s => ({ ...s, password: !s.password }))}>
          <EyeIcon open={show.password} />
        </button>
        {errors.password && <span className="ob-field__error">{errors.password}</span>}
      </div>

      <div className={`ob-field ob-field--password ${errors.confirmPassword ? "ob-field--error" : ""}`}>
        <label>Confirm password</label>
        <input
          type={show.confirm ? "text" : "password"}
          placeholder="Re-enter password"
          value={f.confirmPassword || ""}
          onChange={set("confirmPassword")}
        />
        <button type="button" className="ob-field__eye" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}>
          <EyeIcon open={show.confirm} />
        </button>
        {errors.confirmPassword && <span className="ob-field__error">{errors.confirmPassword}</span>}
      </div>

      <div className="ob-actions">
        {showBack && (
          <button className="ob-btn ob-btn--ghost" type="button" onClick={onBack}>
            <span className="ob-arrow ob-arrow--back">
              <span className="ob-arrow__default">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="ob-arrow__hover">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </span>
            Back
          </button>
        )}
        <button className="ob-btn ob-btn--primary" type="button" onClick={handleContinue}>
          Continue
          <span className="ob-arrow">
            <span className="ob-arrow__default">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="ob-arrow__hover">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default AccountDetails;