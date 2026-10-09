import mongoose, { Schema, Document } from 'mongoose';

export interface IVitalSigns {
  bloodPressure?: string;
  pulseRate?: number;
  temperature?: number;
  weight?: number;
}

export interface IEncounter extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  clinicianId: mongoose.Types.ObjectId;
  visitDate: Date;
  chiefComplaint: string;
  symptoms: string[];
  vitalSigns?: IVitalSigns;
  diagnosisCategory: 'Viral Illness' | 'Respiratory' | 'Diabetes' | 'Gastrointestinal' | 'Cardiovascular' | 'Other';
  specificDiagnosis: string;
  treatmentPlan: string;
  prescribedMedications?: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const encounterSchema = new Schema<IEncounter>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    clinicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Clinician ID is required'],
      index: true,
    },
    visitDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    chiefComplaint: {
      type: String,
      required: [true, 'Chief complaint is required'],
      trim: true,
    },
    symptoms: [
      {
        type: String,
        required: true,
      },
    ],
    vitalSigns: {
      bloodPressure: { type: String, trim: true },
      pulseRate: { type: Number, min: 30, max: 220 },
      temperature: { type: Number, min: 80, max: 110 },
      weight: { type: Number, min: 1, max: 300 },
    },
    diagnosisCategory: {
      type: String,
      enum: [
        'Viral Illness',
        'Respiratory',
        'Diabetes',
        'Gastrointestinal',
        'Cardiovascular',
        'Other',
      ],
      required: [true, 'Diagnosis category is required'],
      index: true,
    },
    specificDiagnosis: {
      type: String,
      required: [true, 'Specific diagnosis detail is required'],
      trim: true,
    },
    treatmentPlan: {
      type: String,
      required: [true, 'Treatment plan is required'],
      trim: true,
    },
    prescribedMedications: [
      {
        type: String,
      },
    ],
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
      default: 'Mild',
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

encounterSchema.index({ visitDate: -1, diagnosisCategory: 1 });

export const Encounter = mongoose.model<IEncounter>('Encounter', encounterSchema);
export default Encounter;
