import React from 'react';
import { NavView } from '../types';
import {
  LayoutDashboard, Briefcase, Zap, Stethoscope,
  TrendingUp, MessageSquare, ShieldAlert, Search, LogOut, Activity
} from 'lucide-react';

interface SidebarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  onSignOut: () => void;
  userEmail: string;
}

const NAV_ITEMS: { id: NavView; label: string; icon: React.ReactNode; tag?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'portfolio', label: 'Portfolio', icon: <Briefcase size={18} /> },
  { id: 'simulator', label: 'Scenario Simulator', icon: <Zap size={18} />, tag: 'AI' },
  { id: 'stress', label: 'Stress Test', icon: <ShieldAlert size={18} />, tag: 'AI' },
  { id: 'doctor', label: 'Portfolio Doctor', icon: <Stethoscope size={18} />, tag: 'AI' },
  { id: 'projection', label: 'Wealth Projection', icon: <TrendingUp size={18} />, tag: 'AI' },
  { id: 'scanner', label: 'Opportunity Scanner', icon: <Search size={18} />, tag: 'NEW' },
  { id: 'copilot', label: 'AI Copilot', icon: <MessageSquare size={18} />, tag: 'AI' },
];

export default function Sidebar({ activeView, onNavigate, onSignOut, userEmail }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40" style={{ background: '#0a1020', borderRight: '1px solid #1e2d40' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1e2d40]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)' }}>
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-base leading-tight">AlphaTwin</div>
            <div className="text-[10px] text-cyan-500 font-medium tracking-widest uppercase">Portfolio AI</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                activeView === item.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={activeView === item.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.tag && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  item.tag === 'AI' ? 'bg-cyan-500/15 text-cyan-400' :
                  item.tag === 'NEW' ? 'bg-emerald-500/15 text-emerald-400' : ''
                }`}>{item.tag}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-[#1e2d40]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {userEmail[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-300 truncate">{userEmail}</div>
            <div className="text-[10px] text-slate-500">Investor</div>
          </div>
        </div>
        <button onClick={onSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all">
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
