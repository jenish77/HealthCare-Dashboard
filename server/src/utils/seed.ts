import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.model';
import { Patient } from '../modules/patient/patient.model';
import { Encounter } from '../modules/encounter/encounter.model';
import { connectDB } from '../config/db';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already initialized. Skipping seed.');
      return;
    }

    console.log('Seeding initial data...');

    // 1. Create Default Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@healthtech.org',
      passwordHash: 'Admin@123456',
      role: 'admin',
    });

    const doctor = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'doctor@healthtech.org',
      passwordHash: 'Doctor@123456',
      role: 'doctor',
    });

    const nurse = await User.create({
      name: 'Nurse Priya Patel',
      email: 'nurse@healthtech.org',
      passwordHash: 'Nurse@123456',
      role: 'nurse',
    });

    console.log('Created Users: Admin, Doctor, Nurse');

    // 2. Create Sample Anonymized Patients
    const districts = ['Pune Rural', 'Nagpur Rural', 'Nashik', 'Thane NGO Center', 'Solapur Tele-clinic'];
    const genders: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Female', 'Male', 'Other'];
    const ages = [8, 16, 24, 45, 68, 5, 32, 54, 72, 11, 29, 38, 61, 14, 50];

    const patientDocs = [];
    for (let i = 0; i < ages.length; i++) {
      const p = await Patient.create({
        anonymizedId: `PAT-2026-00${i + 1}`,
        age: ages[i],
        gender: genders[i % genders.length],
        district: districts[i % districts.length],
        pincodePrefix: `41${i}0`,
        registeredBy: nurse._id,
      });
      patientDocs.push(p);
    }

    console.log(`Created ${patientDocs.length} Anonymized Patient Records`);

    // 3. Create Sample Encounters spanning past 90 days for trends
    const categories: Array<
      'Viral Illness' | 'Respiratory' | 'Diabetes' | 'Gastrointestinal' | 'Cardiovascular' | 'Other'
    > = ['Viral Illness', 'Respiratory', 'Diabetes', 'Gastrointestinal', 'Cardiovascular', 'Other'];

    const diagnosesMap = {
      'Viral Illness': ['Acute Viral Fever', 'Dengue Fever', 'Chikungunya', 'Influenza A'],
      Respiratory: ['Bronchial Asthma', 'Upper Respiratory Tract Infection', 'Pneumonia', 'Chronic Bronchitis'],
      Diabetes: ['Type 2 Diabetes Mellitus', 'Diabetic Ketoacidosis', 'Gestational Diabetes'],
      Gastrointestinal: ['Acute Gastroenteritis', 'Amoebic Dysentery', 'Acid Peptic Disease'],
      Cardiovascular: ['Essential Hypertension', 'Ischemic Heart Disease'],
      Other: ['Iron Deficiency Anemia', 'Urinary Tract Infection', 'Skin Rash'],
    };

    const now = new Date();
    const encounterDocs = [];

    for (let i = 0; i < 60; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const visitDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const patient = patientDocs[i % patientDocs.length];
      const category = categories[i % categories.length];
      const diagnoses = diagnosesMap[category];
      const specificDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

      const encounter = await Encounter.create({
        patientId: patient._id,
        clinicianId: i % 2 === 0 ? doctor._id : nurse._id,
        visitDate,
        chiefComplaint: `Patient presenting with ${category.toLowerCase()} symptoms`,
        symptoms: ['Fever', 'Fatigue', 'Body Ache'],
        vitalSigns: {
          bloodPressure: '120/80',
          pulseRate: 78,
          temperature: 99.4,
          weight: 62,
        },
        diagnosisCategory: category,
        specificDiagnosis,
        treatmentPlan: 'Prescribed rest, hydration, and medication regimen.',
        prescribedMedications: ['Paracetamol 500mg', 'ORSL Hydration Pack'],
        severity: i % 5 === 0 ? 'Severe' : i % 3 === 0 ? 'Moderate' : 'Mild',
        isDraft: false,
      });

      encounterDocs.push(encounter);
    }

    console.log(`Created ${encounterDocs.length} Sample Clinical Encounters across 90 days`);
  } catch (error) {
    console.error('Seed Database Error:', error);
  }
};
