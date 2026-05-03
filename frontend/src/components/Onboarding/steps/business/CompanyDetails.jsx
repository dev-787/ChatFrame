import React, { useState, useEffect } from "react";
import { parseBackendErrors } from "../../../../utils/validation";

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

const CompanyDetails = ({ formData, updateForm, onNext, onBack, onSubmit, loading, fieldErrors }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const f = formData;
  
  const set = (key) => (e) => {
    updateForm({ [key]: e.target.value });
    setTouched(prev => ({ ...prev, [key]: true }));
    
    // Clear errors for this field when user starts typing
    if (errors[key] || fieldErrors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    
    if (touched.industry && !f.industry) {
      newErrors.industry = "Please select an industry";
    }
    if (touched.country && !f.country) {
      newErrors.country = "Please select a region";
    }
    
    setErrors(newErrors);
  }, [f, touched]);

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const validate = () => {
    const errs = {};
    if (!f.industry) errs.industry = "Please select an industry";
    if (!f.country)  errs.country  = "Please select a region";
    setErrors(errs);
    setTouched({ industry: true, country: true });
    return Object.keys(errs).length === 0;
  };

  const handleContinue = async () => {
    if (validate()) {
      if (onSubmit) {
        await onSubmit(f);
      } else {
        onNext();
      }
    }
  };

  // Merge local validation errors with API field errors
  const allErrors = { ...errors, ...parseBackendErrors(fieldErrors) };
  
  const getFieldState = (fieldName) => {
    if (allErrors[fieldName]) return 'error';
    if (touched[fieldName] && f[fieldName]) return 'success';
    return 'default';
  };

  return (
    <div className="company-details">
      <div className={`ob-field ob-field--select ob-field--${getFieldState('industry')}`}>
        <label>Industry type</label>
        <div className="ob-select-wrap">
          <select 
            value={f.industry || ""} 
            onChange={set("industry")}
            onBlur={() => handleBlur('industry')}
          >
            <option value="" disabled>Select your industry</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <ChevronIcon />
        </div>
        {allErrors.industry && <span className="ob-field__error">{allErrors.industry}</span>}
      </div>

      <div className={`ob-field ob-field--select ob-field--${getFieldState('country')}`}>
        <label>Country / Region</label>
        <div className="ob-select-wrap">
          <select 
            value={f.country || ""} 
            onChange={set("country")}
            onBlur={() => handleBlur('country')}
          >
            <option value="" disabled>Select your country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronIcon />
        </div>
        {allErrors.country && <span className="ob-field__error">{allErrors.country}</span>}
      </div>

      <div className="ob-actions">
        <button className="ob-btn ob-btn--ghost" type="button" onClick={onBack}>
          <span className="ob-arrow ob-arrow--back">
            <span className="ob-arrow__default"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className="ob-arrow__hover"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
          </span>
          Back
        </button>
        <button className="ob-btn ob-btn--primary" type="button" onClick={handleContinue} disabled={loading}>
          {loading ? "Saving..." : "Continue"}
          <span className="ob-arrow">
            <span className="ob-arrow__default"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className="ob-arrow__hover"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default CompanyDetails;