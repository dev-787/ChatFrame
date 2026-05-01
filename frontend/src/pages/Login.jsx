import { useState } from "react";
import './Login.scss';
import Logo from '../components/Logo/Logo';

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

const LOGIN_ROLES = [
  {
    id: "business",
    icon: (
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="8" width="22" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 14h22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
        <circle cx="14" cy="14" r="2" fill="currentColor"/>
      </svg>
    ),
    label: "Company Owner",
    description: "Sign in to manage your workspace and team.",
  },
  {
    id: "agent",
    icon: (
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 24c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M19 16l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Support Agent",
    description: "Sign in to your company's support workspace.",
  },
];

const Login = () => {
  const [role, setRole]         = useState(null);
  const [step, setStep]         = useState("role"); // 'role' | 'form'
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email.includes("@"))   errs.email    = "Enter a valid email";
    if (form.password.length < 6)    errs.password = "Password is too short";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
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
      <Logo href="/" className="logo--fixed" />

      {/* Card */}
      <div className="login__card">
        {done ? (
          <SuccessState email={form.email} />
        ) : step === "role" ? (
          <>
            <div className="login__header">
              <h1 className="login__title">Welcome back</h1>
              <p className="login__subtitle">Who are you signing in as?</p>
            </div>
            <div className="login__roles">
              {LOGIN_ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`role-card ${role === r.id ? "role-card--active" : ""}`}
                  onClick={() => setRole(r.id)}
                >
                  <div className="role-card__icon">{r.icon}</div>
                  <div className="role-card__body">
                    <span className="role-card__label">{r.label}</span>
                    <span className="role-card__desc">{r.description}</span>
                  </div>
                  <div className="role-card__check">
                    {role === r.id && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="7" fill="#fafafa"/>
                        <path d="M4 7l2 2 4-4" stroke="#0f0f0f" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              className={`login__submit ${!role ? "login__submit--disabled" : ""}`}
              type="button"
              disabled={!role}
              onClick={() => role && setStep("form")}
            >
              Continue
              <span className="login__arrow">
                <span className="login__arrow-default">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="login__arrow-hover">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </span>
            </button>
          </>
        ) : (
          <>
            <div className="login__header">
              <button className="login__back" type="button" onClick={() => setStep("role")}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <h1 className="login__title">Welcome back</h1>
              <p className="login__subtitle">Sign in to your ChatFrame workspace.</p>
            </div>

            <form className="login__form" onSubmit={handleSubmit} noValidate>
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
                {errors.email && <span className="lf__error">{errors.email}</span>}
              </div>

              <div className={`lf lf--password ${errors.password ? "lf--error" : ""}`}>
                <div className="lf__label-row">
                  <label>Password</label>
                  <a href="/forgot-password" className="lf__forgot">Forgot password?</a>
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="current-password"
                />
                <button type="button" className="lf__eye" onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
                  <EyeIcon open={showPw} />
                </button>
                {errors.password && <span className="lf__error">{errors.password}</span>}
              </div>

              <button
                type="submit"
                className={`login__submit login__submit--full ${loading ? "login__submit--loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="login__spinner" />
                ) : (
                  <>
                    Sign in
                    <span className="login__arrow">
                      <span className="login__arrow-default">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="login__arrow-hover">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {!done && (
        <p className="login__footer">
          Don't have an account?{" "}
          <a href="/onboarding">Create one free</a>
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
        <path d="M6.5 11l3 3 6-6" stroke="rgba(160,255,180,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
