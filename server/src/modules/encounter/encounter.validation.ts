import { z } from 'zod';

export const createEncounterSchema = z.object({
  body: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    visitDate: z.string().optional(),
    chiefComplaint: z
      .string()
      .trim()
      .min(2, 'Chief complaint must be at least 2 characters')
      .max(200, 'Chief complaint cannot exceed 200 characters'),
    symptoms: z
      .array(z.string().trim().min(1))
      .min(1, 'At least one symptom is required'),
    vitalSigns: z
      .object({
        bloodPressure: z
          .string()
          .trim()
          .regex(/^\d{2,3}\/\d{2,3}$/, 'Blood pressure must be in format Systolic/Diastolic (e.g. 120/80)')
          .optional()
          .or(z.literal('')),
        pulseRate: z
          .number()
          .int('Pulse rate must be a whole number')
          .min(30, 'Pulse rate must be at least 30 bpm')
          .max(220, 'Pulse rate cannot exceed 220 bpm')
          .optional(),
        temperature: z
          .number()
          .min(80, 'Temperature must be at least 80°F')
          .max(110, 'Temperature cannot exceed 110°F')
          .optional(),
        weight: z
          .number()
          .min(1, 'Weight must be at least 1 kg')
          .max(300, 'Weight cannot exceed 300 kg')
          .optional(),
      })
      .optional(),
    diagnosisCategory: z.enum([
      'Viral Illness',
      'Respiratory',
      'Diabetes',
      'Gastrointestinal',
      'Cardiovascular',
      'Other',
    ]),
    specificDiagnosis: z
      .string()
      .trim()
      .min(2, 'Specific diagnosis must be at least 2 characters')
      .max(100, 'Specific diagnosis cannot exceed 100 characters'),
    treatmentPlan: z
      .string()
      .trim()
      .min(2, 'Treatment plan must be at least 2 characters')
      .max(500, 'Treatment plan cannot exceed 500 characters'),
    prescribedMedications: z.array(z.string().trim()).optional(),
    severity: z.enum(['Mild', 'Moderate', 'Severe']).default('Mild'),
    isDraft: z.boolean().optional(),
  }),
});

export const updateEncounterSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Encounter ID is required'),
  }),
  body: z.object({
    chiefComplaint: z.string().trim().min(2).max(200).optional(),
    symptoms: z.array(z.string().trim()).optional(),
    vitalSigns: z
      .object({
        bloodPressure: z
          .string()
          .trim()
          .regex(/^\d{2,3}\/\d{2,3}$/, 'Blood pressure must be in format 120/80')
          .optional()
          .or(z.literal('')),
        pulseRate: z.number().int().min(30).max(220).optional(),
        temperature: z.number().min(80).max(110).optional(),
        weight: z.number().min(1).max(300).optional(),
      })
      .optional(),
    diagnosisCategory: z
      .enum(['Viral Illness', 'Respiratory', 'Diabetes', 'Gastrointestinal', 'Cardiovascular', 'Other'])
      .optional(),
    specificDiagnosis: z.string().trim().min(2).max(100).optional(),
    treatmentPlan: z.string().trim().min(2).max(500).optional(),
    prescribedMedications: z.array(z.string().trim()).optional(),
    severity: z.enum(['Mild', 'Moderate', 'Severe']).optional(),
    isDraft: z.boolean().optional(),
  }),
});

export const getEncounterByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Encounter ID is required'),
  }),
});
