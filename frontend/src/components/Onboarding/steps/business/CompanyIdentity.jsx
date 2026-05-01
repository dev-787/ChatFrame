import React, { useState, useRef } from "react";

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 14V4M7 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CompanyIdentity = ({ formData, updateForm, onNext, onBack }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const f = formData;
  const set = (key) => (e) => updateForm({ [key]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    updateForm({ companyLogo: file });
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!f.companyName?.trim()) errs.companyName = "Company name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
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

      <div className={`ob-field ${errors.companyName ? "ob-field--error" : ""}`}>
        <label>Company name</label>
        <input
          type="text"
          placeholder="Acme Corp"
          value={f.companyName || ""}
          onChange={set("companyName")}
        />
        {errors.companyName && <span className="ob-field__error">{errors.companyName}</span>}
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

export default CompanyIdentity;