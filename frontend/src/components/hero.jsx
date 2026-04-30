import React from "react";
import "./hero.scss";

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M3 7h8M8 4l3 3-3 3"
      stroke="#0F0F0F"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="rgba(250,250,250,0.4)" strokeWidth="1.2" />
    <path d="M6 5l3 2-3 2V5z" fill="rgba(250,250,250,0.55)" />
  </svg>
);

const STATS = [
  { num: "10x", label: "Faster resolution" },
  { num: "98%", label: "CSAT score" },
  { num: "40+", label: "Integrations" },
];

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__left">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            AI-powered customer support — now in beta
          </div>

          <h1 className="hero__headline">
            Support that
            <br />
            <em>thinks</em> before
            <br />
            you do
          </h1>

          <p className="hero__sub">
            ChatFrame brings AI to every customer conversation — resolving
            issues faster, learning your product, and freeing your team to
            focus on what matters.
          </p>

          <div className="hero__ctas">
            <a href="#" className="hero__cta hero__cta--primary">
              Start for free
              <ArrowIcon />
            </a>
            <a href="#" className="hero__cta hero__cta--secondary">
              See how it works
              <PlayIcon />
            </a>
          </div>

          <div className="hero__stats">
            {STATS.map((stat, i) => (
              <React.Fragment key={stat.num}>
                {i !== 0 && <div className="hero__stat-divider" />}
                <div className="hero__stat">
                  <span className="hero__stat-num">{stat.num}</span>
                  <span className="hero__stat-label">{stat.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;