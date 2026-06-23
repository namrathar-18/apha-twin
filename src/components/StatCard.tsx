import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent } from '../lib/analytics';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  icon?: React.ReactNode;
  accent?: 'cyan' | 'green' | 'red' | 'amber';
  loading?: boolean;
}

export default function StatCard({ label, value, subValue, change, icon, accent = 'cyan', loading }: StatCardProps) {
  const accentColors = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${accentColors[accent]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="font-display font-bold text-2xl text-white mb-1">{value}</div>
      <div className="flex items-center gap-2">
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {formatPercent(change)}
          </span>
        )}
        {subValue && <span className="text-xs text-slate-500">{subValue}</span>}
      </div>
    </div>
  );
}
