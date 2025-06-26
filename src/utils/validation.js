import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .refine((email) => {
    // Additional email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }, 'Please enter a valid email address');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .refine((password) => {
    // Check for at least one uppercase letter
    return /[A-Z]/.test(password);
  }, 'Password must contain at least one uppercase letter')
  .refine((password) => {
    // Check for at least one lowercase letter
    return /[a-z]/.test(password);
  }, 'Password must contain at least one lowercase letter')
  .refine((password) => {
    // Check for at least one number
    return /\d/.test(password);
  }, 'Password must contain at least one number')
  .refine((password) => {
    // Check for at least one special character
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }, 'Password must contain at least one special character')
  .refine((password) => {
    // Check for no common patterns
    const commonPatterns = ['password', '123456', 'qwerty', 'admin'];
    return !commonPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    );
  }, 'Password contains common patterns that are not secure');

// Auth form validation schema
export const authFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

// Validate and sanitize form data
export const validateAuthForm = (email, password) => {
  try {
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    
    const result = authFormSchema.parse({
      email: sanitizedEmail,
      password: sanitizedPassword,
    });
    
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path[0],
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
};

// Password strength checker
export const getPasswordStrength = (password) => {
  const feedback = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  if (password.length >= 12) score += 1;

  return { score, feedback };
};