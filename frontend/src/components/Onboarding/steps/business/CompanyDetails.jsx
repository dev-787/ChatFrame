import React, { useState } from "react";

const INDUSTRIES = [
  "E-commerce & Retail",
  "SaaS / Software",
  "Healthcare",
  "Finance & Banking",
  "Travel & Hospitality",
  "Education",
  "Logistics & Delivery",
  "Media & Entertainment",
  "Real Estate",
  "Other",
];

const COUNTRIES = [
  "United States", "United Kingdom", "India", "Canada", "Australia",
  "Germany", "France", "Singapore", "UAE", "Other",
];

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CompanyDetails = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const f = formData;
  const set = (key) => (e) => updateForm({ [key]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!f.industry) errs.industry = "Please select an industry";
    if (!f.country)  errs.country  = "Please select a region";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div className="company-details">
      <div className={`ob-field ob-field--select ${errors.industry ? "ob-field--error" : ""}`}>
        <label>Industry type</label>
        <div className="ob-select-wrap">
          <select value={f.industry || ""} onChange={set("industry")}>
            <option value="" disabled>Select your industry</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <ChevronIcon />
        </div>
        {errors.industry && <span className="ob-field__error">{errors.industry}</span>}
      </div>

      <div className={`ob-field ob-field--select ${errors.country ? "ob-field--error" : ""}`}>
        <label>Country / Region</label>
        <div className="ob-select-wrap">
          <select value={f.country || ""} onChange={set("country")}>
            <option value="" disabled>Select your country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronIcon />
        </div>
        {errors.country && <span className="ob-field__error">{errors.country}</span>}
      </div>

      <div className="ob-actions">
        <button className="ob-btn ob-btn--ghost" type="button" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button className="ob-btn ob-btn--primary" type="button" onClick={() => { if (validate()) onNext(); }}>
          Continue
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CompanyDetails;