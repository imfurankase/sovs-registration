/**
 * Format date to YYYY-MM-DD format
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

/**
 * Parse date string and return Date object
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Remove formatting from phone number
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Capitalize first letter of string
 */
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

/**
 * Check if string is valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check password strength and return feedback
 */
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} => {
  const feedback: string[] = [];
  let strength = 0;

  if (password.length >= 8) strength++;
  else feedback.push('At least 8 characters');

  if (/[A-Z]/.test(password)) strength++;
  else feedback.push('At least one uppercase letter');

  if (/[a-z]/.test(password)) strength++;
  else feedback.push('At least one lowercase letter');

  if (/[0-9]/.test(password)) strength++;
  else feedback.push('At least one number');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  else feedback.push('At least one special character');

  let strengthLevel: 'weak' | 'fair' | 'good' | 'strong';
  if (strength <= 1) strengthLevel = 'weak';
  else if (strength <= 2) strengthLevel = 'fair';
  else if (strength <= 3) strengthLevel = 'good';
  else strengthLevel = 'strong';

  return { strength: strengthLevel, feedback };
};

/**
 * Delay execution for async operations
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generate a short random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
