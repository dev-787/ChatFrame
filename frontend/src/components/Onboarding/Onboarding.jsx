import React, { useState } from "react";
import "./Onboarding.scss";
import Logo from "../Logo/Logo";
import RoleSelect from "./steps/RoleSelect";
import AccountDetails from "./steps/AccountDetails";
import CompanyIdentity from "./steps/business/CompanyIdentity";
import CompanyDetails from "./steps/business/CompanyDetails";
import SupportConfig from "./steps/business/SupportConfig";
import JoinCompany from "./steps/agent/JoinCompany";

const FLOW_MAP = {
  business: [
    { component: RoleSelect,       title: "Who are you?",            subtitle: "Choose how you'll be using ChatFrame." },
    { component: AccountDetails,   title: "Create your account",     subtitle: "You're one step away from smarter support." },
    { component: CompanyIdentity,  title: "Your company identity",   subtitle: "Let's set up your brand presence." },
    { component: CompanyDetails,   title: "Tell us about your work", subtitle: "A few details so we can tailor your experience." },
    { component: SupportConfig,    title: "Configure support",       subtitle: "Define how your team handles customer queries." },
  ],
  agent: [
    { component: RoleSelect,     title: "Who are you?",        subtitle: "Choose how you'll be using ChatFrame." },
    { component: AccountDetails, title: "Create your account", subtitle: "You're one step away from smarter support." },
    { component: JoinCompany,    title: "Join your team",      subtitle: "Connect with your company's workspace." },
  ],
};

const DEFAULT_FLOW = [
  { component: RoleSelect, title: "Who are you?", subtitle: "Choose how you'll be using ChatFrame." },
];

const SUCCESS_CONTENT = {
  business: {
    title: "Your workspace is ready",
    subtitle: "ChatFrame is set up and waiting for your team. Start inviting agents and configuring your AI support.",
    cta: "Go to Dashboard",
    ctaHref: "/dashboard",
    items: [
      "Workspace created successfully",
      "AI support configured",
      "Ready to invite your team",
    ],
  },
  agent: {
    title: "You're in the team",
    subtitle: "You've joined your company's ChatFrame workspace. Head to your dashboard to start resolving customer queries.",
    cta: "Open Workspace",
    ctaHref: "/dashboard",
    items: [
      "Account created successfully",
      "Joined company workspace",
      "Ready to handle support",
    ],
  },
};

const SuccessScreen = ({ role, formData }) => {
  const content = SUCCESS_CONTENT[role];
  const name = formData.firstName || "there";

  return (
    <div className="ob-success">
      <div className="ob-success__icon">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="rgba(160,255,180,0.5)" strokeWidth="1.2"/>
          <path d="M8 14l4 4 8-8" stroke="rgba(160,255,180,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 className="ob-success__title">
        Hey {name}, {content.title.toLowerCase()}
      </h1>
      <p className="ob-success__subtitle">{content.subtitle}</p>

      <ul className="ob-success__list">
        {content.items.map((item) => (
          <li key={item} className="ob-success__item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="7" fill="rgba(160,255,180,0.12)"/>
              <path d="M4 7l2 2 4-4" stroke="rgba(160,255,180,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {item}
          </li>
        ))}
      </ul>

      <div className="ob-success__bar">
        <div className="ob-success__fill" />
      </div>

      <a href={content.ctaHref} className="ob-success__cta">
        {content.cta}
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
      </a>
    </div>
  );
};

const Onboarding = () => {
  const [role, setRole] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [direction, setDirection] = useState("forward");
  const [done, setDone] = useState(false);

  const flow = role ? FLOW_MAP[role] : DEFAULT_FLOW;
  const totalSteps = role ? flow.length : 1;
  const currentStep = flow[stepIndex];
  const StepComponent = currentStep.component;

  const updateForm = (data) => setFormData((prev) => ({ ...prev, ...data }));

  const goNext = () => {
    setDirection("forward");
    setStepIndex((i) => Math.min(i + 1, flow.length - 1));
  };

  const goBack = () => {
    setDirection("back");
    if (stepIndex === 0) return;
    if (stepIndex === 1) {
      setRole(null);
      setStepIndex(0);
    } else {
      setStepIndex((i) => i - 1);
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setDirection("forward");
    setStepIndex(1);
  };

  const handleFinish = () => {
    console.log("Onboarding complete:", formData);
    setDone(true);
  };

  const isLast = stepIndex === flow.length - 1;

  return (
    <div className="onboarding">
      {/* Background effects */}
      <div className="onboarding__bg">
        <div className="onboarding__bg-glow onboarding__bg-glow--1" />
        <div className="onboarding__bg-glow onboarding__bg-glow--2" />
        <div className="onboarding__bg-grid" />
      </div>

      {/* Logo */}
      <Logo href="/" className="logo--fixed" />

      {/* Card */}
      <div className="onboarding__card">
        {done ? (
          <SuccessScreen role={role} formData={formData} />
        ) : (
          <>
            {/* Progress bar */}
            {role && (
              <div className="onboarding__progress">
                <span className="onboarding__progress-label">
                  Step {stepIndex} of {totalSteps - 1}
                </span>
                <div className="onboarding__progress-track">
                  <div
                    className="onboarding__progress-fill"
                    style={{ width: `${(stepIndex / (totalSteps - 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Header */}
            <div className="onboarding__header">
              <h1 className="onboarding__title">{currentStep.title}</h1>
              <p className="onboarding__subtitle">{currentStep.subtitle}</p>
            </div>

            {/* Step content */}
            <div className={`onboarding__step onboarding__step--${direction}`} key={stepIndex}>
              <StepComponent
                formData={formData}
                updateForm={updateForm}
                onNext={stepIndex === 0 ? handleRoleSelect : goNext}
                onBack={goBack}
                onFinish={handleFinish}
                isLast={isLast}
                showBack={stepIndex > 0}
                role={role}
              />
            </div>
          </>
        )}
      </div>

      {/* Sign in link */}
      {!done && stepIndex === 0 && (
        <p className="onboarding__signin">
          Already have an account?{" "}
          <a href="/login">Sign in</a>
        </p>
      )}
    </div>
  );
};

export default Onboarding;