/**
 * Enhanced Validation Utilities
 * Comprehensive input validation with error messages
 */

export interface ValidationResult<T> {
  valid: boolean;
  error?: string;
  data?: T;
}

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Email validation with RFC 5322 pattern
 */
export function validateEmail(email: string): ValidationResult<string> {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  
  // RFC 5322 simplified pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email address is too long' };
  }

  return { valid: true, data: trimmed };
}

/**
 * Phone number validation
 */
export function validatePhoneNumber(phone: string): ValidationResult<string> {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  const trimmed = phone.trim();
  // Allow various phone formats
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

  if (!phoneRegex.test(trimmed.replace(/\s/g, ''))) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }

  if (trimmed.replace(/\D/g, '').length < 10) {
    return { valid: false, error: 'Phone number must have at least 10 digits' };
  }

  return { valid: true, data: trimmed };
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
  valid: boolean;
  score: 'weak' | 'fair' | 'good' | 'strong';
  errors: string[];
  suggestions: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  if (!password) {
    errors.push('Password is required');
    return {
      valid: false,
      score: 'weak',
      errors,
      suggestions: ['Create a password at least 8 characters long'],
    };
  }

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 25;
    if (password.length >= 12) score += 10;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter');
    suggestions.push('Add uppercase letters (A-Z)');
  } else {
    score += 25;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter');
    suggestions.push('Add lowercase letters (a-z)');
  } else {
    score += 25;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number');
    suggestions.push('Add numbers (0-9)');
  } else {
    score += 25;
  }

  // Special character check (optional but recommended)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('Consider adding special characters for extra security');
  }

  // Determine strength
  let strengthScore: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 50) {
    strengthScore = 'weak';
  } else if (score < 70) {
    strengthScore = 'fair';
  } else if (score < 85) {
    strengthScore = 'good';
  } else {
    strengthScore = 'strong';
  }

  return {
    valid: errors.length === 0,
    score: strengthScore,
    errors,
    suggestions,
  };
}

/**
 * Name validation
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult<string> {
  if (!name) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters long` };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: `${fieldName} must not exceed 50 characters` };
  }

  // Allow only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { valid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }

  return { valid: true, data: trimmed };
}

/**
 * Date of birth validation
 */
export function validateDateOfBirth(date: string): ValidationResult<string> {
  if (!date) {
    return { valid: false, error: 'Date of birth is required' };
  }

  try {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      const calculatedAge = age - 1;
      if (calculatedAge < 18) {
        return { valid: false, error: 'You must be at least 18 years old' };
      }
    } else {
      if (age < 18) {
        return { valid: false, error: 'You must be at least 18 years old' };
      }
    }

    if (age > 150) {
      return { valid: false, error: 'Please enter a valid date of birth' };
    }

    return { valid: true, data: date };
  } catch (e) {
    return { valid: false, error: 'Invalid date format' };
  }
}

/**
 * National ID validation (basic format check)
 */
export function validateNationalId(id: string): ValidationResult<string> {
  if (!id) {
    return { valid: false, error: 'National ID is required' };
  }

  const trimmed = id.trim();

  if (trimmed.length < 5) {
    return { valid: false, error: 'National ID is too short' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'National ID is too long' };
  }

  return { valid: true, data: trimmed };
}

/**
 * Batch validation for multiple fields
 */
export interface RegistrationValidationData {
  email?: string;
  phone?: string;
  password?: string;
  passwordConfirm?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationalId?: string;
}

export function validateRegistration(data: RegistrationValidationData): {
  valid: boolean;
  errors: FieldError[];
} {
  const errors: FieldError[] = [];

  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.push({ field: 'email', message: emailValidation.error! });
    }
  }

  if (data.phone) {
    const phoneValidation = validatePhoneNumber(data.phone);
    if (!phoneValidation.valid) {
      errors.push({ field: 'phone', message: phoneValidation.error! });
    }
  }

  if (data.password) {
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      errors.push({ field: 'password', message: passwordValidation.errors[0] });
    }

    if (data.passwordConfirm && data.password !== data.passwordConfirm) {
      errors.push({ field: 'passwordConfirm', message: 'Passwords do not match' });
    }
  }

  if (data.firstName) {
    const nameValidation = validateName(data.firstName, 'First name');
    if (!nameValidation.valid) {
      errors.push({ field: 'firstName', message: nameValidation.error! });
    }
  }

  if (data.lastName) {
    const nameValidation = validateName(data.lastName, 'Last name');
    if (!nameValidation.valid) {
      errors.push({ field: 'lastName', message: nameValidation.error! });
    }
  }

  if (data.dateOfBirth) {
    const dobValidation = validateDateOfBirth(data.dateOfBirth);
    if (!dobValidation.valid) {
      errors.push({ field: 'dateOfBirth', message: dobValidation.error! });
    }
  }

  if (data.nationalId) {
    const idValidation = validateNationalId(data.nationalId);
    if (!idValidation.valid) {
      errors.push({ field: 'nationalId', message: idValidation.error! });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
