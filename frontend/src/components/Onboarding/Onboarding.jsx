import React, { useState } from "react";
import "./Onboarding.scss";
import RoleSelect from "./steps/RoleSelect";
import AccountDetails from "./steps/AccountDetails";
import CompanyIdentity from "./steps/business/CompanyIdentity";
import CompanyDetails from "./steps/business/CompanyDetails";
import SupportConfig from "./steps/business/SupportConfig";
import CustomerSupport from "./steps/customer/CustomerSupport";
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
  customer: [
    { component: RoleSelect,      title: "Who are you?",         subtitle: "Choose how you'll be using ChatFrame." },
    { component: AccountDetails,  title: "Create your account",  subtitle: "You're almost there." },
    { component: CustomerSupport, title: "What do you need?",    subtitle: "Tell us what you need help with." },
  ],
};

const DEFAULT_FLOW = [
  { component: RoleSelect, title: "Who are you?", subtitle: "Choose how you'll be using ChatFrame." },
];

const Onboarding = () => {
  const [role, setRole] = useState(null);       // 'business' | 'agent' | 'customer'
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [direction, setDirection] = useState("forward"); // for transition

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
    // TODO: submit formData to API
    console.log("Onboarding complete:", formData);
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
      <a href="/" className="onboarding__logo">
        <svg viewBox="0 0 28 28" fill="none" width="24" height="24">
          <rect x="1" y="1" width="26" height="26" rx="7" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
          <rect x="4" y="4" width="20" height="20" rx="5" fill="rgba(255,255,255,0.06)"/>
          <path d="M8 9.5C8 8.67 8.67 8 9.5 8h9C19.33 8 20 8.67 20 9.5v6c0 .83-.67 1.5-1.5 1.5H15l-3 2.5V17H9.5C8.67 17 8 16.33 8 15.5V9.5z" fill="white" opacity="0.9"/>
          <circle cx="11" cy="12.5" r="1" fill="#0F0F0F"/>
          <circle cx="14" cy="12.5" r="1" fill="#0F0F0F"/>
          <circle cx="17" cy="12.5" r="1" fill="#0F0F0F"/>
        </svg>
        <span className="onboarding__logo-chat">Chat</span>
        <span className="onboarding__logo-frame">Frame</span>
      </a>

      {/* Card */}
      <div className="onboarding__card">
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
      </div>

      {/* Sign in link */}
      {stepIndex === 0 && (
        <p className="onboarding__signin">
          Already have an account?{" "}
          <a href="/login">Sign in</a>
        </p>
      )}
    </div>
  );
};

export default Onboarding;