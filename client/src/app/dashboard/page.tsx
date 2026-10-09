'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import { api } from '../../lib/api';
import { DashboardData, Patient } from '../../types';
import { IllnessTrendsChart } from '../../components/charts/IllnessTrendsChart';
import { CommonDiagnosesChart } from '../../components/charts/CommonDiagnosesChart';
import { SeasonalPatternsChart } from '../../components/charts/SeasonalPatternsChart';
import { AgeGroupChart } from '../../components/charts/AgeGroupChart';
import { EncounterFormModal } from '../../components/EncounterFormModal';
import { Activity, Users, Calendar, TrendingUp, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('90');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    setError('');

    let startDate = '';
    const now = new Date();
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      startDate = pastDate.toISOString().split('T')[0];
    }

    try {
      const res = await api.get('/analytics/dashboard', {
        params: { startDate: startDate || undefined },
      });
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
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
      console.error('Failed to fetch patients list', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardMetrics();
      fetchPatients();
    }
  }, [user, dateRange]);

  if (authLoading || !user) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Health Trends & Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time anonymized epidemiological surveillance for telemedicine health centers
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardMetrics}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Patient Visit</span>
            </button>
          </div>
        </div>

        {/* Date Range Filter Bar */}
        <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">Filter Period:</span>
          {(['7', '30', '90', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                dateRange === r
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r === 'all' ? 'All Time' : `Last ${r} Days`}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Encounters</p>
              <p className="text-2xl font-black text-slate-900">{dashboardData?.kpis.totalEncounters ?? 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Top Diagnosis Category</p>
              <p className="text-lg font-black text-slate-900">{dashboardData?.kpis.topCategory ?? 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Unique Patients Seen</p>
              <p className="text-2xl font-black text-slate-900">{dashboardData?.kpis.uniquePatients ?? 0}</p>
            </div>
          </div>
        </div>

        {/* 4 Core Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                Highest Priority
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">A. Illness Trends Over Time</h2>
              <p className="text-xs text-slate-500">
                Is a medical condition becoming more frequent over time?
              </p>
            </div>
            <IllnessTrendsChart data={dashboardData?.illnessTrends || []} />
          </div>

          {/* Chart B */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                Frequency Ranking
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">B. Most Common Diagnoses</h2>
              <p className="text-xs text-slate-500">
                Which health conditions account for the majority of clinic visits?
              </p>
            </div>
            <CommonDiagnosesChart data={dashboardData?.commonDiagnoses || []} />
          </div>

          {/* Chart C */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                Seasonal Patterns
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">C. Seasonal Illness Patterns</h2>
              <p className="text-xs text-slate-500">
                Which illnesses show recurring monthly or seasonal surges?
              </p>
            </div>
            <SeasonalPatternsChart data={dashboardData?.seasonalPatterns || []} />
          </div>

          {/* Chart D */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-700">
                Demographics
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">D. Encounters by Age Group</h2>
              <p className="text-xs text-slate-500">
                Which age brackets (0–12, 13–18, 19–35, 36–60, 60+) account for the most visits?
              </p>
            </div>
            <AgeGroupChart data={dashboardData?.ageGroupDistribution || []} />
          </div>
        </div>
      </div>

      {/* Real-time Patient Visit Modal */}
      <EncounterFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchDashboardMetrics()}
        patients={patients}
      />
    </div>
  );
}
