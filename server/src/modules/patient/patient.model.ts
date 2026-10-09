import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  anonymizedId: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  district: string;
  pincodePrefix: string;
  registeredBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    anonymizedId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age exceeds realistic limit'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    district: {
      type: String,
      required: [true, 'District/Region is required'],
      trim: true,
      index: true,
    },
    pincodePrefix: {
      type: String,
      required: [true, 'Pincode prefix is required'],
      trim: true,
    },
    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

patientSchema.index({ age: 1 });
patientSchema.index({ district: 1 });

export const Patient = mongoose.model<IPatient>('Patient', patientSchema);
export default Patient;
