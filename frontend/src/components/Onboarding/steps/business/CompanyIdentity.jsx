import React, { useState, useRef, useEffect } from "react";
import { validateRequired, parseBackendErrors } from "../../../../utils/validation";

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 14V4M7 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CompanyIdentity = ({ formData, updateForm, onNext, onBack, onSubmit, loading, fieldErrors }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const fileRef = useRef();

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
    
    if (touched.companyName) {
      const validation = validateRequired(f.companyName, 'Company name');
      if (!validation.isValid) {
        newErrors.companyName = validation.error;
      }
    }
    
    setErrors(newErrors);
  }, [f, touched]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    updateForm({ companyLogo: file });
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const validate = () => {
    const errs = {};
    const companyNameValidation = validateRequired(f.companyName, 'Company name');
    if (!companyNameValidation.isValid) {
      errs.companyName = companyNameValidation.error;
    }
    
    setErrors(errs);
    setTouched({ companyName: true });
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
    <div className="company-identity">
      {/* Logo upload */}
      <div className="logo-upload" onClick={() => fileRef.current.click()}>
        {logoPreview ? (
          <img src={logoPreview} alt="Logo preview" className="logo-upload__preview" />
        ) : (
          <>
            <UploadIcon />
            <span>Upload company logo</span>
            <small>PNG, JPG, SVG — optional</small>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>

      <div className={`ob-field ob-field--${getFieldState('companyName')}`}>
        <label>Company name</label>
        <input
          type="text"
          placeholder="Acme Corp"
          value={f.companyName || ""}
          onChange={set("companyName")}
          onBlur={() => handleBlur('companyName')}
        />
        {allErrors.companyName && <span className="ob-field__error">{allErrors.companyName}</span>}
      </div>

      <div className="ob-field">
        <label>
          Company website
          <span className="ob-field__optional">optional</span>
        </label>
        <input
          type="url"
          placeholder="https://acme.com"
          value={f.companyWebsite || ""}
          onChange={set("companyWebsite")}
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

export default CompanyIdentity;