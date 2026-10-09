'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { AgeGroupDistribution } from '../../types';

interface AgeGroupChartProps {
  data: AgeGroupDistribution[];
}

const AGE_COLORS = ['#06b6d4', '#0284c7', '#3b82f6', '#6366f1', '#8b5cf6'];

export const AgeGroupChart: React.FC<AgeGroupChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No age demographic data available for selected range.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="ageGroup" name="Age Bracket" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="count" name="Patient Visits" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`age-cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
