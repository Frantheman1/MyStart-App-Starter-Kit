/**
 * Validation Schemas
 * 
 * Type-safe validation utilities for forms and API responses.
 * You can integrate with libraries like Zod or Yup if needed.
 * 
 * Usage:
 *   const result = emailSchema.validate(email);
 *   if (!result.valid) console.log(result.error);
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ValidationSchema<T> {
  validate: (value: T) => ValidationResult;
}

// Email validation
export const emailSchema: ValidationSchema<string> = {
  validate: (email: string): ValidationResult => {
    if (!email) {
      return { valid: false, error: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
  },
};

// Password validation
export const passwordSchema: ValidationSchema<string> = {
  validate: (password: string): ValidationResult => {
    if (!password) {
      return { valid: false, error: 'Password is required' };
    }
    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain an uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain a lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain a number' };
    }
    return { valid: true };
  },
};

// Phone number validation (basic)
export const phoneSchema: ValidationSchema<string> = {
  validate: (phone: string): ValidationResult => {
    if (!phone) {
      return { valid: false, error: 'Phone number is required' };
    }
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
      return { valid: false, error: 'Invalid phone number' };
    }
    return { valid: true };
  },
};

// URL validation
export const urlSchema: ValidationSchema<string> = {
  validate: (url: string): ValidationResult => {
    if (!url) {
      return { valid: false, error: 'URL is required' };
    }
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  },
};

// Required field validation
export function required<T>(value: T, fieldName: string = 'Field'): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

// Min length validation
export function minLength(value: string, min: number): ValidationResult {
  if (value.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` };
  }
  return { valid: true };
}

// Max length validation
export function maxLength(value: string, max: number): ValidationResult {
  if (value.length > max) {
    return { valid: false, error: `Must be at most ${max} characters` };
  }
  return { valid: true };
}

// Min value validation
export function minValue(value: number, min: number): ValidationResult {
  if (value < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }
  return { valid: true };
}

// Max value validation
export function maxValue(value: number, max: number): ValidationResult {
  if (value > max) {
    return { valid: false, error: `Must be at most ${max}` };
  }
  return { valid: true };
}

// Combine multiple validations
export function validate<T>(
  value: T,
  ...validators: Array<(val: T) => ValidationResult>
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
