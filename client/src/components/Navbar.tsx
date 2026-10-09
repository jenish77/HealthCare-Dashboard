'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, Menu, X, ShieldCheck, Stethoscope, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
          avatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white',
          Icon: ShieldCheck,
        };
      case 'doctor':
        return {
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
          avatarBg: 'bg-gradient-to-tr from-blue-600 to-cyan-600 text-white',
          Icon: Stethoscope,
        };
      case 'nurse':
        return {
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white',
          Icon: UserCheck,
        };
      default:
        return {
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
          avatarBg: 'bg-slate-600 text-white',
          Icon: Activity,
        };
    }
  };

  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.Icon;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight block">ArogyaData</span>
              <span className="text-xs font-semibold text-slate-500 block -mt-1">Telemedicine Dashboard</span>
            </div>
          </div>

          {/* Enhanced Desktop User Profile UX */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100/80 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 transition-all shadow-2xs">
              <div className={`w-9 h-9 rounded-xl ${roleConfig.avatarBg} flex items-center justify-center font-bold text-sm shadow-sm`}>
                {user.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <p className="text-xs font-bold text-slate-900 leading-snug">{user.name}</p>
                </div>
                <div className="mt-0.5">
                  <span className={`inline-flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${roleConfig.badgeBg}`}>
                    <RoleIcon className="w-3 h-3" />
                    <span>{user.role}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-red-600 px-3.5 py-2 rounded-xl hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          <div className="flex items-center space-x-3 py-3 border-b border-slate-100">
            <div className={`w-10 h-10 rounded-xl ${roleConfig.avatarBg} flex items-center justify-center font-bold text-base shadow-sm`}>
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              <span className={`inline-flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border mt-1.5 uppercase ${roleConfig.badgeBg}`}>
                <RoleIcon className="w-3 h-3" />
                <span>{user.role}</span>
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
