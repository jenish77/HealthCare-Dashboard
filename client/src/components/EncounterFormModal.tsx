'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Patient, Encounter } from '../types';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EncounterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients: Patient[];
  initialData?: Encounter | null;
}

export const EncounterFormModal: React.FC<EncounterFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients,
  initialData,
}) => {
  const [patientId, setPatientId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [pulseRate, setPulseRate] = useState<number | ''>(72);
  const [temperature, setTemperature] = useState<number | ''>(98.6);
  const [weight, setWeight] = useState<number | ''>(65);
  const [diagnosisCategory, setDiagnosisCategory] = useState<
    'Viral Illness' | 'Respiratory' | 'Diabetes' | 'Gastrointestinal' | 'Cardiovascular' | 'Other'
  >('Viral Illness');
  const [specificDiagnosis, setSpecificDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [medicationsInput, setMedicationsInput] = useState('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const DRAFT_KEY = 'healthtech_encounter_draft';

  useEffect(() => {
    if (initialData) {
      setPatientId(typeof initialData.patientId === 'object' ? initialData.patientId._id : initialData.patientId);
      setChiefComplaint(initialData.chiefComplaint || '');
      setSymptomsInput(initialData.symptoms ? initialData.symptoms.join(', ') : '');
      setBloodPressure(initialData.vitalSigns?.bloodPressure || '');
      setPulseRate(initialData.vitalSigns?.pulseRate || '');
      setTemperature(initialData.vitalSigns?.temperature || '');
      setWeight(initialData.vitalSigns?.weight || '');
      setDiagnosisCategory(initialData.diagnosisCategory || 'Viral Illness');
      setSpecificDiagnosis(initialData.specificDiagnosis || '');
      setTreatmentPlan(initialData.treatmentPlan || '');
      setMedicationsInput(initialData.prescribedMedications ? initialData.prescribedMedications.join(', ') : '');
      setSeverity(initialData.severity || 'Mild');
    } else {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setPatientId(parsed.patientId || '');
          setChiefComplaint(parsed.chiefComplaint || '');
          setSymptomsInput(parsed.symptomsInput || '');
          setBloodPressure(parsed.bloodPressure || '120/80');
          setDiagnosisCategory(parsed.diagnosisCategory || 'Viral Illness');
          setSpecificDiagnosis(parsed.specificDiagnosis || '');
          setTreatmentPlan(parsed.treatmentPlan || '');
          setSeverity(parsed.severity || 'Mild');
        } catch (e) {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    }
  }, [initialData, isOpen]);

  const autoSaveDraftSilently = (updatedFields: Record<string, any>) => {
    if (initialData) return;
    try {
      const currentDraft = localStorage.getItem(DRAFT_KEY);
      const parsed = currentDraft ? JSON.parse(currentDraft) : {};
      const newDraft = { ...parsed, ...updatedFields };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(newDraft));
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientId) {
      setErrorMsg('Please select an anonymized patient.');
      return;
    }
    if (!chiefComplaint.trim() || chiefComplaint.trim().length < 2) {
      setErrorMsg('Chief complaint must be at least 2 characters.');
      return;
    }
    if (!specificDiagnosis.trim() || specificDiagnosis.trim().length < 2) {
      setErrorMsg('Specific diagnosis detail must be at least 2 characters.');
      return;
    }
    if (!treatmentPlan.trim() || treatmentPlan.trim().length < 2) {
      setErrorMsg('Treatment plan must be at least 2 characters.');
      return;
    }

    // Blood pressure validation: format 120/80
    if (bloodPressure.trim() && !/^\d{2,3}\/\d{2,3}$/.test(bloodPressure.trim())) {
      setErrorMsg('Blood pressure must be in Systolic/Diastolic format (e.g. 120/80 or 140/90).');
      return;
    }

    // Vitals range bounds
    if (pulseRate !== '' && (pulseRate < 30 || pulseRate > 220)) {
      setErrorMsg('Pulse rate must be between 30 and 220 bpm.');
      return;
    }
    if (temperature !== '' && (temperature < 80 || temperature > 110)) {
      setErrorMsg('Temperature must be between 80°F and 110°F.');
      return;
    }
    if (weight !== '' && (weight < 1 || weight > 300)) {
      setErrorMsg('Weight must be between 1 kg and 300 kg.');
      return;
    }

    const symptoms = symptomsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const prescribedMedications = medicationsInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const payload = {
      patientId,
      chiefComplaint: chiefComplaint.trim(),
      symptoms: symptoms.length > 0 ? symptoms : ['Fever'],
      vitalSigns: {
        bloodPressure: bloodPressure.trim() || undefined,
        pulseRate: pulseRate !== '' ? Number(pulseRate) : undefined,
        temperature: temperature !== '' ? Number(temperature) : undefined,
        weight: weight !== '' ? Number(weight) : undefined,
      },
      diagnosisCategory,
      specificDiagnosis: specificDiagnosis.trim(),
      treatmentPlan: treatmentPlan.trim(),
      prescribedMedications,
      severity,
      isDraft: false,
    };

    setLoading(true);
    try {
      if (initialData) {
        await api.patch(`/encounters/${initialData._id}`, payload);
      } else {
        await api.post('/encounters', payload);
        localStorage.removeItem(DRAFT_KEY);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const respErr = err.response?.data;
      if (respErr?.errors && Array.isArray(respErr.errors) && respErr.errors.length > 0) {
        setErrorMsg(respErr.errors.map((e: any) => e.message).join(' | '));
      } else {
        setErrorMsg(respErr?.message || 'Failed to save encounter entry.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {initialData ? 'Edit Patient Visit Encounter' : 'Record New Patient Visit'}
            </h3>
            <p className="text-xs text-slate-500">
              Clinical Telemedicine Visit Entry (Anonymized Data Compliance)
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs px-6 py-3 flex items-start space-x-2 border-b border-red-200 font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Anonymized Patient *
            </label>
            <select
              value={patientId}
              onChange={(e) => {
                const val = e.target.value;
                setPatientId(val);
                autoSaveDraftSilently({ patientId: val });
              }}
              disabled={!!initialData}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              required
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.anonymizedId} ({p.gender}, Age {p.age} - {p.district})
                </option>
              ))}
            </select>
          </div>

          {/* Chief Complaint & Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Chief Complaint *
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="e.g. High fever with chills for 3 days"
                value={chiefComplaint}
                onChange={(e) => {
                  const val = e.target.value;
                  setChiefComplaint(val);
                  autoSaveDraftSilently({ chiefComplaint: val });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Symptoms (comma separated)
              </label>
              <input
                type="text"
                placeholder="Fever, Cough, Headache"
                value={symptomsInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSymptomsInput(val);
                  autoSaveDraftSilently({ symptomsInput: val });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Vital Signs Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Patient Vital Signs
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">BP (e.g. 120/80)</label>
                <input
                  type="text"
                  maxLength={7}
                  placeholder="120/80"
                  value={bloodPressure}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBloodPressure(val);
                    autoSaveDraftSilently({ bloodPressure: val });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Pulse (30-220 bpm)</label>
                <input
                  type="number"
                  min="30"
                  max="220"
                  placeholder="72"
                  value={pulseRate}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setPulseRate(val);
                    autoSaveDraftSilently({ pulseRate: val });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Temp (80-110 °F)</label>
                <input
                  type="number"
                  step="0.1"
                  min="80"
                  max="110"
                  placeholder="98.6"
                  value={temperature}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setTemperature(val);
                    autoSaveDraftSilently({ temperature: val });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Weight (1-300 kg)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  placeholder="65"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setWeight(val);
                    autoSaveDraftSilently({ weight: val });
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis Category & Specific Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Diagnosis Category *
              </label>
              <select
                value={diagnosisCategory}
                onChange={(e: any) => {
                  const val = e.target.value;
                  setDiagnosisCategory(val);
                  autoSaveDraftSilently({ diagnosisCategory: val });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                required
              >
                <option value="Viral Illness">Viral Illness</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Specific Clinical Diagnosis *
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Acute Viral Fever"
                value={specificDiagnosis}
                onChange={(e) => {
                  const val = e.target.value;
                  setSpecificDiagnosis(val);
                  autoSaveDraftSilently({ specificDiagnosis: val });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Severity & Medications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e: any) => {
                  const val = e.target.value;
                  setSeverity(val);
                  autoSaveDraftSilently({ severity: val });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prescribed Medications (comma separated)
              </label>
              <input
                type="text"
                placeholder="Paracetamol 500mg, ORSL"
                value={medicationsInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setMedicationsInput(val);
                  autoSaveDraftSilently({ medicationsInput: val });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Treatment Plan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Treatment Plan & Clinical Notes *
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Detail medical advice, dietary guidelines, or referral notes..."
              value={treatmentPlan}
              onChange={(e) => {
                const val = e.target.value;
                setTreatmentPlan(val);
                autoSaveDraftSilently({ treatmentPlan: val });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm flex items-center space-x-2"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Encounter Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
