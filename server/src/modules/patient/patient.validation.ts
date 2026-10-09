import { z } from 'zod';

export const createPatientSchema = z.object({
  body: z.object({
    age: z
      .number({ required_error: 'Age is required' })
      .int('Age must be a whole number')
      .min(0, 'Age cannot be negative')
      .max(120, 'Age cannot exceed 120 years'),
    gender: z.enum(['Male', 'Female', 'Other'], {
      required_error: 'Gender is required',
    }),
    district: z
      .string()
      .trim()
      .min(2, 'District must be at least 2 characters')
      .max(50, 'District name cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9\s\.\-]+$/, 'District contains invalid special characters'),
    pincodePrefix: z
      .string()
      .trim()
      .regex(/^\d{3,6}$/, 'Pincode must be 3 to 6 numeric digits (e.g. 411 or 411001)'),
  }),
});

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
  body: z.object({
    age: z.number().int().min(0).max(120).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    district: z.string().min(2).max(50).optional(),
    pincodePrefix: z.string().regex(/^\d{3,6}$/).optional(),
  }),
});

export const getPatientByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});
