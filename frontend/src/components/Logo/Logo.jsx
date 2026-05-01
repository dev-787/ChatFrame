import "./Logo.scss";

const Logo = ({ href = "/", className = "" }) => (
  <a href={href} className={`logo ${className}`}>
    <svg
      className="logo__icon"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="26" height="26" rx="7"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <rect x="4" y="4" width="20" height="20" rx="5"
        fill="rgba(255,255,255,0.06)" />
      <path
        d="M8 9.5C8 8.67 8.67 8 9.5 8h9C19.33 8 20 8.67 20 9.5v6c0 .83-.67 1.5-1.5 1.5H15l-3 2.5V17H9.5C8.67 17 8 16.33 8 15.5V9.5z"
        fill="white" opacity="0.9"
      />
      <circle cx="11" cy="12.5" r="1" fill="#0F0F0F" />
      <circle cx="14" cy="12.5" r="1" fill="#0F0F0F" />
      <circle cx="17" cy="12.5" r="1" fill="#0F0F0F" />
    </svg>
    <div className="logo__wordmark">
      <span className="logo__chat">Chat</span><span className="logo__frame">Frame</span>
    </div>
  </a>
);

export default Logo;
