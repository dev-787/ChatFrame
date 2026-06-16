import React from 'react';
import './Chip.scss';

const Chip = ({ children, color = 'default', className = '', ...props }) => {
  return (
    <div className={`custom-chip custom-chip--${color} ${className}`} {...props}>
      {children}
    </div>
  );
};

Chip.Label = ({ children }) => {
  return <span className="custom-chip__label">{children}</span>;
};

export default Chip;
export { Chip };
