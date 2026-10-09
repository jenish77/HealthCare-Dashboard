'use client';

import React from 'react';

export const SkeletonRow: React.FC<{ cols?: number }> = ({ cols = 6 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-slate-200 rounded-lg w-full max-w-[120px]"></div>
        </td>
      ))}
    </tr>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-28 bg-slate-200 rounded-full"></div>
              <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
            </div>
            <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="h-5 w-32 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="h-5 w-48 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="h-5 w-40 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="h-6 w-16 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-200 rounded"></div>
              <div className="h-5 w-48 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-48 w-full bg-slate-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
