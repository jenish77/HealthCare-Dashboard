'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [age, setAge] = useState<number | ''>(25);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [district, setDistrict] = useState('Pune Rural');
  const [pincodePrefix, setPincodePrefix] = useState('411');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (age === '' || age < 0 || age > 120) {
      setErrorMsg('Please enter a valid age between 0 and 120.');
      return;
    }
    if (!district.trim() || district.trim().length < 2 || district.trim().length > 50) {
      setErrorMsg('District/Region must be between 2 and 50 characters.');
      return;
    }

    // Pincode validation: must be 3 to 6 numeric digits only
    const pincodeClean = pincodePrefix.trim();
    if (!/^\d{3,6}$/.test(pincodeClean)) {
      setErrorMsg('Pincode must be 3 to 6 numeric digits only (e.g. 411 or 411001). Letters and special characters are not allowed.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/patients', {
        age: Number(age),
        gender,
        district: district.trim(),
        pincodePrefix: pincodeClean,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const respErr = err.response?.data;
      if (respErr?.errors && Array.isArray(respErr.errors) && respErr.errors.length > 0) {
        setErrorMsg(respErr.errors.map((e: any) => e.message).join(' | '));
      } else {
        setErrorMsg(respErr?.message || 'Failed to register anonymized patient.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Register Anonymized Patient</h3>
            <p className="text-xs text-slate-500">Generate secure patient identifier (No raw PII stored)</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs px-6 py-3 flex items-start space-x-2 border-b border-red-200 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Age (0-120) *
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              District / Health Center Region *
            </label>
            <input
              type="text"
              maxLength={50}
              placeholder="e.g. Nagpur Rural"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pincode / Prefix (3-6 Digits Only) *
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 411001 or 411"
              value={pincodePrefix}
              onChange={(e) => {
                // Allow only numeric digits 0-9
                const val = e.target.value.replace(/\D/g, '');
                setPincodePrefix(val);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">Numeric digits only (3 to 6 digits maximum).</p>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
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
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm flex items-center space-x-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
