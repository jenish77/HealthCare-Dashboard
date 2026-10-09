'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../lib/api';
import { User } from '../../../types';
import { SkeletonTable } from '../../../components/ui/Skeleton';
import { UserPlus, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const { user, hasRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'doctor' | 'nurse'>('nurse');
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!hasRole(['admin'])) {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, hasRole, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsersList(res.data.data.users);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasRole(['admin'])) {
      fetchUsers();
    }
  }, [user]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    setFormLoading(true);

    try {
      await api.post('/users', { name, email, password, role });
      setFormMsg('User account created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err: any) {
      setFormMsg(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    try {
      await api.patch(`/users/${u._id}`, { isActive: !u.isActive });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  if (authLoading || !user || !hasRole(['admin'])) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clinician & Staff User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin console for provisioning clinicians, doctors, nurses, and managing role permissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-sky-600" />
              <span>Create New Account</span>
            </h2>

            {formMsg && (
              <div
                className={`text-xs p-3 rounded-xl border ${
                  formMsg.includes('successfully')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {formMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ananya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ananya@healthtech.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="nurse">Nurse (Data Entry)</option>
                  <option value="doctor">Doctor (View & Edit)</option>
                  <option value="admin">Admin (Full Control)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                {formLoading ? 'Creating...' : 'Create Clinician Account'}
              </button>
            </form>
          </div>

          {/* User Directory Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">Active Clinicians Directory</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <SkeletonTable rows={4} cols={4} />
                  ) : (
                    usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 font-bold rounded-full uppercase text-[10px] ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'doctor'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.isActive ? (
                            <span className="inline-flex items-center text-emerald-700 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-600 text-[11px] font-bold">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Deactivated
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleActive(u)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border text-slate-700 hover:bg-slate-100"
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
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
    </div>
  );
}
