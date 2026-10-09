'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import { api } from '../../lib/api';
import { Encounter, Patient } from '../../types';
import { EncounterFormModal } from '../../components/EncounterFormModal';
import {
  Stethoscope,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Filter,
  Calendar,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EncountersPage() {
  const { user, hasRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/encounters', {
        params: { search, category: categoryFilter || undefined },
      });
      if (res.data.success) {
        setEncounters(res.data.data.encounters);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch encounters.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients?limit=100');
      if (res.data.success) {
        setPatients(res.data.data.patients);
      }
    } catch (e) {
      console.error('Failed to fetch patients', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEncounters();
      fetchPatients();
    }
  }, [user, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEncounters();
  };

  const handleOpenNew = () => {
    setSelectedEncounter(null);
    setModalOpen(true);
  };

  const handleEdit = (encounter: Encounter) => {
    setSelectedEncounter(encounter);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this encounter record?')) return;
    try {
      await api.delete(`/encounters/${id}`);
      fetchEncounters();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete encounter.');
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Visit Encounters
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter, view, and update anonymized clinical encounter records in real time
            </p>
          </div>

          <button
            onClick={handleOpenNew}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Visit</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search diagnosis, complaints, or symptoms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
            >
              Search
            </button>
          </form>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium"
            >
              <option value="">All Categories</option>
              <option value="Viral Illness">Viral Illness</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Gastrointestinal">Gastrointestinal</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Encounters List Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
              Loading encounters...
            </div>
          ) : encounters.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
              No encounter records found matching your filters.
            </div>
          ) : (
            encounters.map((enc) => {
              const patientObj = typeof enc.patientId === 'object' ? enc.patientId : null;
              const clinicianObj = typeof enc.clinicianId === 'object' ? enc.clinicianId : null;

              return (
                <div
                  key={enc._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-xs rounded-full border border-sky-200">
                        {patientObj?.anonymizedId || 'PATIENT'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(enc.visitDate).toLocaleDateString()}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        (Age: {patientObj?.age ?? 'N/A'}, {patientObj?.gender ?? ''})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                          enc.severity === 'Severe'
                            ? 'bg-red-100 text-red-800'
                            : enc.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {enc.severity} Severity
                      </span>

                      {/* Doctor or Admin Edit Button */}
                      {hasRole(['doctor', 'admin']) && (
                        <button
                          onClick={() => handleEdit(enc)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                          title="Edit Visit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Admin Delete Button */}
                      {hasRole(['admin']) && (
                        <button
                          onClick={() => handleDelete(enc._id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Visit Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Diagnosis Category
                      </p>
                      <p className="font-bold text-slate-900 text-sm">{enc.diagnosisCategory}</p>
                      <p className="text-slate-600 mt-0.5">{enc.specificDiagnosis}</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Chief Complaint & Symptoms
                      </p>
                      <p className="text-slate-800 font-medium">{enc.chiefComplaint}</p>
                      <p className="text-slate-500 mt-1">
                        Symptoms: {enc.symptoms?.join(', ') || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Treatment & Medication
                      </p>
                      <p className="text-slate-800">{enc.treatmentPlan}</p>
                      {enc.prescribedMedications && enc.prescribedMedications.length > 0 && (
                        <p className="text-slate-500 mt-1">
                          Meds: {enc.prescribedMedications.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-50">
                    <span>
                      Attending Clinician:{' '}
                      <strong className="text-slate-600">{clinicianObj?.name || 'Clinician'}</strong> (
                      {clinicianObj?.role?.toUpperCase()})
                    </span>
                    <span>Region: {patientObj?.district || 'General Clinic'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <EncounterFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchEncounters()}
        patients={patients}
        initialData={selectedEncounter}
      />
    </div>
  );
}
