import React from 'react';
import { Holding } from '../types';
import { computeCrashScore, formatCurrency, formatPercent, getSectorColor } from '../lib/analytics';
import StatCard from '../components/StatCard';
import {
  TrendingUp, TrendingDown, Briefcase, Shield, Activity, DollarSign, Zap, AlertTriangle
} from 'lucide-react';

interface DashboardViewProps {
  holdings: Holding[];
  onNavigate: (view: string) => void;
}

export default function DashboardView({ holdings, onNavigate }: DashboardViewProps) {
  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.avg_buy_price * h.quantity, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const score = holdings.length > 0 ? computeCrashScore(holdings) : null;

  const sectorBreakdown = holdings.reduce((acc, h) => {
    const val = h.current_price * h.quantity;
    acc[h.sector] = (acc[h.sector] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topHoldings = [...holdings]
    .sort((a, b) => (b.current_price * b.quantity) - (a.current_price * a.quantity))
    .slice(0, 5);

  const avgBeta = holdings.length > 0
    ? holdings.reduce((s, h) => s + h.beta * (h.current_price * h.quantity) / totalValue, 0)
    : 0;

  const scoreColor = !score ? '#64748b' : score.total >= 70 ? '#10b981' : score.total >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = !score ? '-' : score.total >= 70 ? 'Strong' : score.total >= 50 ? 'Moderate' : 'Vulnerable';
  const circumference = 2 * Math.PI * 40;
  const dashOffset = score ? circumference - (score.total / 100) * circumference : circumference;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Portfolio Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Your digital twin — real-time intelligence on your investments</p>
      </div>

      {holdings.length === 0 ? (
        <div className="card p-16 text-center">
          <Briefcase size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg text-white mb-2">No holdings yet</h3>
          <p className="text-slate-400 text-sm mb-6">Add stocks to your portfolio to unlock AI-powered analysis and simulations.</p>
          <button className="btn-primary" onClick={() => onNavigate('portfolio')}>Add Holdings</button>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Portfolio Value"
              value={formatCurrency(totalValue)}
              change={totalPnLPct}
              subValue={`${totalPnL >= 0 ? '+' : ''}${formatCurrency(totalPnL)} P&L`}
              icon={<DollarSign size={14} />}
              accent="cyan"
            />
            <StatCard
              label="Total Holdings"
              value={`${holdings.length}`}
              subValue={`${new Set(holdings.map(h => h.sector)).size} sectors`}
              icon={<Briefcase size={14} />}
              accent="cyan"
            />
            <StatCard
              label="Portfolio Beta"
              value={avgBeta.toFixed(2)}
              subValue={avgBeta > 1.2 ? 'High volatility' : avgBeta < 0.8 ? 'Low volatility' : 'Moderate'}
              icon={<Activity size={14} />}
              accent={avgBeta > 1.3 ? 'red' : avgBeta < 0.8 ? 'green' : 'amber'}
            />
            <StatCard
              label="Crash Score"
              value={score ? `${score.total}/100` : '-'}
              subValue={scoreLabel}
              icon={<Shield size={14} />}
              accent={score ? (score.total >= 70 ? 'green' : score.total >= 50 ? 'amber' : 'red') : 'cyan'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crash Survival Score */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-white text-sm">Crash Survival Score</h2>
                <span className="text-xs text-slate-500">AI Analysis</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2d40" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={scoreColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-xl" style={{ color: scoreColor }}>{score?.total}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Score</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {score && [
                    { label: 'Diversification', val: score.diversification },
                    { label: 'Volatility', val: score.volatility },
                    { label: 'Concentration', val: score.concentrationRisk },
                    { label: 'Liquidity', val: score.liquidity },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-slate-300 font-medium">{item.val}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${item.val}%`,
                            background: item.val >= 70 ? '#10b981' : item.val >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {score && score.breakdown.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {score.breakdown.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                      <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sector Allocation */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-white text-sm">Sector Allocation</h2>
                <span className="text-xs text-slate-500">{topSectors.length} sectors</span>
              </div>
              <div className="space-y-3">
                {topSectors.map(([sector, val]) => {
                  const pct = (val / totalValue) * 100;
                  return (
                    <div key={sector}>
                      <div className="flex justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: getSectorColor(sector) }} />
                          <span className="text-slate-300">{sector}</span>
                        </div>
                        <span className="text-slate-400 font-medium">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%`, background: getSectorColor(sector) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Holdings */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-white text-sm">Top Holdings</h2>
                <button onClick={() => onNavigate('portfolio')} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all</button>
              </div>
              <div className="space-y-3">
                {topHoldings.map(h => {
                  const value = h.current_price * h.quantity;
                  const pnl = ((h.current_price - h.avg_buy_price) / h.avg_buy_price) * 100;
                  return (
                    <div key={h.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `${getSectorColor(h.sector)}20`, border: `1px solid ${getSectorColor(h.sector)}40`, color: getSectorColor(h.sector) }}>
                        {h.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{h.symbol}</div>
                        <div className="text-xs text-slate-500">{formatCurrency(value)}</div>
                      </div>
                      <span className={`text-xs font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-display font-semibold text-white text-sm mb-3">Quick Analysis</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Run Simulation', desc: 'Stress test scenarios', icon: <Zap size={16} />, view: 'simulator', color: 'cyan' },
                { label: 'Portfolio Doctor', desc: 'Find hidden risks', icon: <Activity size={16} />, view: 'doctor', color: 'emerald' },
                { label: 'Wealth Projection', desc: '5, 10, 20 year outlook', icon: <TrendingUp size={16} />, view: 'projection', color: 'amber' },
                { label: 'AI Copilot', desc: 'Ask anything', icon: <Shield size={16} />, view: 'copilot', color: 'blue' },
              ].map(action => (
                <button
                  key={action.view}
                  onClick={() => onNavigate(action.view)}
                  className="card card-hover p-4 text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    action.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                    action.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                    action.color === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {action.icon}
                  </div>
                  <div className="font-semibold text-sm text-white mb-0.5">{action.label}</div>
                  <div className="text-xs text-slate-500">{action.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
