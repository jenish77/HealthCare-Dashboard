import { Encounter, IEncounter } from './encounter.model';
import { Patient } from '../patient/patient.model';
import { ApiError } from '../../utils/apiError';

export class EncounterService {
  static async createEncounter(data: Partial<IEncounter>, clinicianId: string): Promise<IEncounter> {
    const patientExists = await Patient.findById(data.patientId);
    if (!patientExists) {
      throw new ApiError(404, 'Associated patient record not found');
    }

    const encounter = await Encounter.create({
      ...data,
      clinicianId,
    });

    return await encounter.populate([
      { path: 'patientId', select: 'anonymizedId age gender district pincodePrefix' },
      { path: 'clinicianId', select: 'name email role' },
    ]);
  }

  static async getAllEncounters(filter: any = {}, search?: string, limit = 20, page = 1) {
    const query: any = { ...filter };

    if (search) {
      query.$or = [
        { specificDiagnosis: { $regex: search, $options: 'i' } },
        { chiefComplaint: { $regex: search, $options: 'i' } },
        { diagnosisCategory: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Encounter.countDocuments(query);
    const encounters = await Encounter.find(query)
      .populate('patientId', 'anonymizedId age gender district pincodePrefix')
      .populate('clinicianId', 'name email role')
      .sort({ visitDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { encounters, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getEncounterById(id: string): Promise<IEncounter> {
    const encounter = await Encounter.findById(id)
      .populate('patientId', 'anonymizedId age gender district pincodePrefix')
      .populate('clinicianId', 'name email role');
    if (!encounter) {
      throw new ApiError(404, 'Encounter record not found');
    }
    return encounter;
  }

  static async updateEncounter(id: string, updates: Partial<IEncounter>): Promise<IEncounter> {
    const encounter = await Encounter.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'patientId', select: 'anonymizedId age gender district pincodePrefix' },
      { path: 'clinicianId', select: 'name email role' },
    ]);

    if (!encounter) {
      throw new ApiError(404, 'Encounter record not found');
    }
    return encounter;
  }

  static async deleteEncounter(id: string): Promise<void> {
    const encounter = await Encounter.findByIdAndDelete(id);
    if (!encounter) {
      throw new ApiError(404, 'Encounter record not found');
    }
  }
}
