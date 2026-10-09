export type Role = 'admin' | 'doctor' | 'nurse';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
}

export interface Patient {
  _id: string;
  anonymizedId: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  district: string;
  pincodePrefix: string;
  registeredBy?: User | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  pulseRate?: number;
  temperature?: number;
  weight?: number;
}

export interface Encounter {
  _id: string;
  patientId: Patient | string;
  clinicianId: User | string;
  visitDate: string;
  chiefComplaint: string;
  symptoms: string[];
  vitalSigns?: VitalSigns;
  diagnosisCategory: 'Viral Illness' | 'Respiratory' | 'Diabetes' | 'Gastrointestinal' | 'Cardiovascular' | 'Other';
  specificDiagnosis: string;
  treatmentPlan: string;
  prescribedMedications?: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  isDraft: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  _id: string;
  userId: User | string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  createdAt: string;
}

export interface IllnessTrendPoint {
  date: string;
  'Viral Illness': number;
  Respiratory: number;
  Diabetes: number;
  Gastrointestinal: number;
  Cardiovascular: number;
  Other: number;
}

export interface DiagnosisFrequency {
  diagnosis: string;
  category: string;
  count: number;
}

export interface SeasonalPattern {
  month: string;
  monthNum: number;
  'Viral Illness': number;
  Respiratory: number;
  Gastrointestinal: number;
  Diabetes: number;
  Cardiovascular: number;
  Other: number;
}

export interface AgeGroupDistribution {
  ageGroup: string;
  count: number;
}

export interface DashboardData {
  kpis: {
    totalEncounters: number;
    topCategory: string;
    uniquePatients: number;
  };
  illnessTrends: IllnessTrendPoint[];
  commonDiagnoses: DiagnosisFrequency[];
  seasonalPatterns: SeasonalPattern[];
  ageGroupDistribution: AgeGroupDistribution[];
}
