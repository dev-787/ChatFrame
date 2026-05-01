import React, { useState } from "react";
import "./Login.scss";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.3 1.7 6.7 1 8c1.3 2.7 4 5 7 5a8 8 0 0 0 3.8-1M6 3.2A8 8 0 0 1 8 3c3 0 5.7 2.3 7 5a10 10 0 0 1-1.8 2.5"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );

const Login = () => {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email.includes("@"))      errs.email    = "Enter a valid email";
    if (form.password.length < 6)       errs.password = "Password is too short";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="login">
      {/* Background */}
      <div className="login__bg">
        <div className="login__bg-glow login__bg-glow--1" />
        <div className="login__bg-glow login__bg-glow--2" />
        <div className="login__bg-grid" />
      </div>

      {/* Logo */}
      <a href="/" className="login__logo">
        <svg viewBox="0 0 28 28" fill="none" width="24" height="24">
          <rect x="1" y="1" width="26" height="26" rx="7"
            stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
          <rect x="4" y="4" width="20" height="20" rx="5"
            fill="rgba(255,255,255,0.06)"/>
          <path d="M8 9.5C8 8.67 8.67 8 9.5 8h9C19.33 8 20 8.67 20 9.5v6c0 .83-.67 1.5-1.5 1.5H15l-3 2.5V17H9.5C8.67 17 8 16.33 8 15.5V9.5z"
            fill="white" opacity="0.9"/>
          <circle cx="11" cy="12.5" r="1" fill="#0F0F0F"/>
          <circle cx="14" cy="12.5" r="1" fill="#0F0F0F"/>
          <circle cx="17" cy="12.5" r="1" fill="#0F0F0F"/>
        </svg>
        <span className="login__logo-chat">Chat</span>
        <span className="login__logo-frame">Frame</span>
      </a>

      {/* Card */}
      <div className="login__card">
        {done ? (
          <SuccessState email={form.email} />
        ) : (
          <>
            <div className="login__header">
              <h1 className="login__title">Welcome back</h1>
              <p className="login__subtitle">
                Sign in to your ChatFrame workspace.
              </p>
            </div>

            <form className="login__form" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className={`lf ${errors.email ? "lf--error" : ""}`}>
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="ada@company.com"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && (
                  <span className="lf__error">{errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className={`lf lf--password ${errors.password ? "lf--error" : ""}`}>
                <div className="lf__label-row">
                  <label>Password</label>
                  <a href="/forgot-password" className="lf__forgot">
                    Forgot password?
                  </a>
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lf__eye"
                  onClick={() => setShowPw((s) => !s)}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
                {errors.password && (
                  <span className="lf__error">{errors.password}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`login__submit ${loading ? "login__submit--loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="login__spinner" />
                ) : (
                  <>
                    Sign in
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor"
                        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Sign up link */}
      {!done && (
        <p className="login__footer">
          Don't have an account?{" "}
          <a href="/signup">Create one free</a>
        </p>
      )}
    </div>
  );
};

const SuccessState = ({ email }) => (
  <div className="login__success">
    <div className="login__success-icon">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="10" stroke="rgba(160,255,180,0.6)" strokeWidth="1.2"/>
        <path d="M6.5 11l3 3 6-6" stroke="rgba(160,255,180,0.9)"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <h2 className="login__success-title">You're in</h2>
    <p className="login__success-sub">
      Signed in as <strong>{email}</strong>.<br />
      Redirecting to your workspace…
    </p>
    <div className="login__success-bar">
      <div className="login__success-fill" />
    </div>
  </div>
);

export default Login;