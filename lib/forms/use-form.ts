/**
 * Form Management Hook
 * 
 * Simplifies form handling with validation, errors, and submission.
 * 
 * Usage:
 *   const form = useForm({
 *     initialValues: { email: '', password: '' },
 *     validate: (values) => {
 *       const errors = {};
 *       if (!values.email) errors.email = 'Required';
 *       return errors;
 *     },
 *     onSubmit: async (values) => {
 *       await api.post('/login', values);
 *     },
 *   });
 * 
 *   <Input
 *     value={form.values.email}
 *     onChangeText={form.handleChange('email')}
 *     error={form.errors.email}
 *   />
 *   <Button onPress={form.handleSubmit}>Submit</Button>
 */

import { useState, useCallback } from 'react';

export interface UseFormConfig<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: () => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setValues: (values: Partial<T>) => void;
  resetForm: () => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormConfig<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(
    (valuesToValidate: T): boolean => {
      if (!validate) return true;

      const validationErrors = validate(valuesToValidate);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    },
    [validate]
  );

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      const newValues = { ...values, [field]: value };
      setValuesState(newValues);

      // Validate on change if field was touched
      if (touched[field] && validate) {
        const validationErrors = validate(newValues);
        setErrors((prev) => ({
          ...prev,
          [field]: validationErrors[field],
        }));
      }
    },
    [values, touched, validate]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate on blur
      if (validate) {
        const validationErrors = validate(values);
        setErrors((prev) => ({
          ...prev,
          [field]: validationErrors[field],
        }));
      }
    },
    [values, validate]
  );

  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);

    // Validate
    const isValid = validateForm(values);
    if (!isValid) return;

    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    resetForm,
  };
}

// Common validators
export const validators = {
  required: (message = 'This field is required') => (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return undefined;
  },

  email: (message = 'Invalid email address') => (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return undefined;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `Must be at most ${max} characters`;
    }
    return undefined;
  },

  pattern: (pattern: RegExp, message = 'Invalid format') => (value: string) => {
    if (value && !pattern.test(value)) {
      return message;
    }
    return undefined;
  },

  matches: (field: string, message = 'Fields must match') => (
    value: string,
    values: any
  ) => {
    if (value !== values[field]) {
      return message;
    }
    return undefined;
  },
};

// Compose multiple validators
export function composeValidators(...validators: Array<(value: any) => string | undefined>) {
  return (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
}
