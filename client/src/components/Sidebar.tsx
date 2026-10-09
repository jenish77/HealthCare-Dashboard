'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Stethoscope, Users, UserCheck, ShieldAlert } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { label: 'Health Trends Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse'] },
    { label: 'Patient Visits', href: '/encounters', icon: Stethoscope, roles: ['admin', 'doctor', 'nurse'] },
    { label: 'Anonymized Patients', href: '/patients', icon: Users, roles: ['admin', 'doctor', 'nurse'] },
    { label: 'User Management', href: '/admin/users', icon: UserCheck, roles: ['admin'] },
    { label: 'Security Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 md:min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-bold border-l-4 border-sky-600 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
