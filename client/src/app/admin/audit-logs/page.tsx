'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import { AuditLog } from '../../../types';
import { ShieldAlert, Search, Filter, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminAuditLogsPage() {
  const { user, hasRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!hasRole(['admin'])) {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, hasRole, router]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        params: { search, action: actionFilter || undefined, limit: 100 },
      });
      if (res.data.success) {
        setLogs(res.data.data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasRole(['admin'])) {
      fetchAuditLogs();
    }
  }, [user, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  if (authLoading || !user || !hasRole(['admin'])) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security & Access Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system security log tracking logins, patient creations, encounter edits, and role access violation attempts
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user email or resource..."
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

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium"
            >
              <option value="">All Security Events</option>
              <option value="ACCESS_DENIED">ACCESS_DENIED (Security Violation)</option>
              <option value="CREATE_ENCOUNTER">CREATE_ENCOUNTER</option>
              <option value="UPDATE_ENCOUNTER">UPDATE_ENCOUNTER</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="USER_LOGOUT">USER_LOGOUT</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">User & Role</th>
                  <th className="p-4">Resource Target</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      Loading security audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      No audit log records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log._id}
                      className={log.action === 'ACCESS_DENIED' ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}
                    >
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            log.action === 'ACCESS_DENIED'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : log.action.startsWith('CREATE')
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action.startsWith('UPDATE')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-sans">
                        <p className="font-bold text-slate-900">{log.userEmail}</p>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">{log.resource}</td>
                      <td className="p-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-4 font-sans">
                        {log.status === 'SUCCESS' ? (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> <span>SUCCESS</span>
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold text-[11px] flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5" /> <span>VIOLATION</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
