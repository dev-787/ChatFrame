import React from 'react';
import { validatePassword } from '../../utils/validation';

const CheckIcon = ({ checked }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    {checked ? (
      <path 
        d="M2 6l2.5 2.5L10 3" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    ) : (
      <circle 
        cx="6" 
        cy="6" 
        r="2" 
        fill="currentColor" 
        opacity="0.3"
      />
    )}
  </svg>
);

const PasswordStrength = ({ password, className = '' }) => {
  const validation = validatePassword(password || '');
  const { checks } = validation;
  
  const requirements = [
    { key: 'minLength', label: 'Minimum 8 characters', checked: checks.minLength },
    { key: 'hasUppercase', label: 'One uppercase letter', checked: checks.hasUppercase },
    { key: 'hasLowercase', label: 'One lowercase letter', checked: checks.hasLowercase },
    { key: 'hasNumber', label: 'One number', checked: checks.hasNumber },
  ];

  const checkedCount = requirements.filter(req => req.checked).length;
  const strengthLevel = checkedCount === 0 ? 'none' : 
                       checkedCount <= 2 ? 'weak' : 
                       checkedCount === 3 ? 'medium' : 'strong';

  return (
    <div className={`password-strength ${className}`}>
      <div className="password-strength__requirements">
        {requirements.map((req) => (
          <div 
            key={req.key} 
            className={`password-strength__requirement ${req.checked ? 'password-strength__requirement--checked' : ''}`}
          >
            <div className="password-strength__check">
              <CheckIcon checked={req.checked} />
            </div>
            <span className="password-strength__label">{req.label}</span>
          </div>
        ))}
      </div>
      
      {password && (
        <div className="password-strength__meter">
          <div className="password-strength__meter-track">
            <div 
              className={`password-strength__meter-fill password-strength__meter-fill--${strengthLevel}`}
              style={{ width: `${(checkedCount / requirements.length) * 100}%` }}
            />
          </div>
          <span className={`password-strength__level password-strength__level--${strengthLevel}`}>
            {strengthLevel === 'none' ? '' :
             strengthLevel === 'weak' ? 'Weak' :
             strengthLevel === 'medium' ? 'Good' : 'Strong'}
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;