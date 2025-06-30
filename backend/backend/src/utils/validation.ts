import { z } from 'zod';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/\d/, 'La contraseña debe contener al menos un número')
  .regex(/[@$!%*?&]/, 'La contraseña debe contener al menos un símbolo especial (@$!%*?&)');

// Email validation schema
const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email es requerido')
  .max(255, 'Email demasiado largo');

// Name validation schema
const nameSchema = z
  .string()
  .min(1, 'Nombre es requerido')
  .max(100, 'Nombre demasiado largo')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Nombre solo puede contener letras y espacios');

// Registration validation schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña es requerida')
});

// Profile data validation schemas
export const basicDataSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido')
    .optional(),
  location: z.string().max(200, 'Ubicación demasiado larga').optional(),
  summary: z.string().max(1000, 'Resumen demasiado largo').optional()
});

// Job description validation (for AI analysis)
export const jobDescriptionSchema = z.object({
  jobDescription: z.string()
    .min(50, 'La descripción del trabajo debe tener al menos 50 caracteres')
    .max(5000, 'La descripción del trabajo es demasiado larga (máximo 5000 caracteres)')
});

// Validation helper functions
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  try {
    passwordSchema.parse(password);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => e.message)
      };
    }
    return { valid: false, errors: ['Error de validación desconocido'] };
  }
};

export const validateEmail = (email: string): { valid: boolean; errors: string[] } => {
  try {
    emailSchema.parse(email);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => e.message)
      };
    }
    return { valid: false, errors: ['Error de validación desconocido'] };
  }
};

// Input sanitization helpers
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Common validation response helper
export const createValidationResponse = (errors: z.ZodError) => {
  return {
    error: 'Datos de entrada inválidos',
    details: errors.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
};