import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.model';
import { Patient } from '../modules/patient/patient.model';
import { Encounter } from '../modules/encounter/encounter.model';
import { AuditLog } from '../modules/audit/audit.model';
import { connectDB } from '../config/db';

dotenv.config();

const resetDb = async () => {
  try {
    await connectDB();
    console.log('Clearing database collections...');

    await Patient.deleteMany({});
    await Encounter.deleteMany({});
    await AuditLog.deleteMany({});
    
    // Keep admin/doctor/nurse user accounts so you can still log in, but wipe all patients & encounters
    console.log('✅ Patients, Encounters, and Audit Logs cleared successfully!');
    console.log('You can now log in and create all patient records 100% from scratch.');

    process.exit(0);
  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1);
  }
};

resetDb();
