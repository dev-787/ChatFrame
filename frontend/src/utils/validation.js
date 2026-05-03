// Password validation rules that mirror backend express-validator rules
export const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
};

// Validation functions
export const validatePassword = (password) => {
  const checks = {
    minLength: password.length >= passwordRules.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isValid = Object.values(checks).every(Boolean);
  
  return {
    isValid,
    checks,
    errors: getPasswordErrors(password, checks)
  };
};

const getPasswordErrors = (password, checks) => {
  const errors = [];
  
  if (!checks.minLength) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!checks.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!checks.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!checks.hasNumber) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    error: isValid ? null : 'Please enter a valid email address'
  };
};

export const validateRequired = (value, fieldName) => {
  const isValid = value && value.trim().length > 0;
  
  return {
    isValid,
    error: isValid ? null : `${fieldName} is required`
  };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  const isValid = password === confirmPassword;
  
  return {
    isValid,
    error: isValid ? null : 'Passwords do not match'
  };
};

// Parse backend validation errors
export const parseBackendErrors = (errors) => {
  if (!Array.isArray(errors)) return {};
  
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {});
};

// Form validation for AccountDetails step
export const validateAccountDetailsForm = (formData) => {
  const errors = {};
  
  // First name validation
  const firstNameValidation = validateRequired(formData.firstName, 'First name');
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
  }
  
  // Last name validation
  const lastNameValidation = validateRequired(formData.lastName, 'Last name');
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
  }
  
  // Email validation
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  // Password validation
  const passwordValidation = validatePassword(formData.password || '');
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0]; // Show first error
  }
  
  // Confirm password validation
  const confirmPasswordValidation = validatePasswordMatch(
    formData.password || '', 
    formData.confirmPassword || ''
  );
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};