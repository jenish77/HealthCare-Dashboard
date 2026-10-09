'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Activity, Lock, Mail, ShieldAlert, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired');

  const [email, setEmail] = useState('doctor@healthtech.org');
  const [password, setPassword] = useState('Doctor@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If active user session exists, redirect immediately to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  // Only show full page spinner on initial app launch session verification
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 text-slate-300">
        <Activity className="w-8 h-8 text-sky-400 animate-pulse" />
        <span className="text-xs font-semibold">Verifying Session...</span>
      </div>
    );
  }

  // If already logged in, show brief redirect status
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 text-slate-300">
        <Activity className="w-8 h-8 text-sky-400 animate-pulse" />
        <span className="text-xs font-semibold">Redirecting to Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-sky-50 text-sky-600 mb-2">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinician Portal</h1>
        <p className="text-xs font-medium text-slate-500">
          Telemedicine Patient Data & Health Trends Analytics
        </p>
      </div>

      {expired && (
        <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl flex items-center space-x-2 border border-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Session expired for security. Please sign in again.</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-200 font-semibold flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="clinician@healthtech.org"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitLoading}
          className="w-full py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
        >
          {submitLoading ? <span>Signing in...</span> : <span>Sign In to Dashboard</span>}
        </button>
      </form>

      {/* Quick Demo Accounts Helper */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
          Quick Role Test Login
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('doctor@healthtech.org', 'Doctor@123456')}
            className="py-2 px-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-center"
          >
            Doctor
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('nurse@healthtech.org', 'Nurse@123456')}
            className="py-2 px-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-center"
          >
            Nurse
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@healthtech.org', 'Admin@123456')}
            className="py-2 px-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-center"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-sm">Loading login portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
