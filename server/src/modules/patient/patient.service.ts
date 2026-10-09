import { Patient, IPatient } from './patient.model';
import { ApiError } from '../../utils/apiError';
import crypto from 'crypto';

export class PatientService {
  private static generateAnonymizedId(): string {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `PAT-${year}-${randomHex}`;
  }

  static async createPatient(
    patientData: { age: number; gender: 'Male' | 'Female' | 'Other'; district: string; pincodePrefix: string },
    registeredById: string
  ): Promise<IPatient> {
    let anonymizedId = this.generateAnonymizedId();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await Patient.findOne({ anonymizedId });
      if (!existing) {
        isUnique = true;
      } else {
        anonymizedId = this.generateAnonymizedId();
        attempts++;
      }
    }

    const patient = await Patient.create({
      anonymizedId,
      age: patientData.age,
      gender: patientData.gender,
      district: patientData.district,
      pincodePrefix: patientData.pincodePrefix,
      registeredBy: registeredById,
    });

    return patient;
  }

  static async getAllPatients(filter: any = {}, search?: string, limit = 50, page = 1) {
    const query: any = { ...filter };

    if (search) {
      query.$or = [
        { anonymizedId: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('registeredBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { patients, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getPatientById(id: string): Promise<IPatient> {
    const patient = await Patient.findById(id).populate('registeredBy', 'name email role');
    if (!patient) {
      throw new ApiError(404, 'Patient not found');
    }
    return patient;
  }

  static async updatePatient(id: string, updates: Partial<IPatient>): Promise<IPatient> {
    const patient = await Patient.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!patient) {
      throw new ApiError(404, 'Patient not found');
    }
    return patient;
  }
}
