import React, { useMemo } from 'react';
import { Holding } from '../types';
import { computeWealthProjection, formatCurrency, runSimulation, SCENARIOS } from '../lib/analytics';
import { TrendingUp, Clock } from 'lucide-react';

interface ProjectionViewProps {
  holdings: Holding[];
}

export default function ProjectionView({ holdings }: ProjectionViewProps) {
  const projections = useMemo(() => holdings.length > 0 ? computeWealthProjection(holdings) : [], [holdings]);
  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);

  const annualReturns = [
    { label: 'Conservative (6%)', rate: 0.06, color: '#64748b' },
    { label: 'Moderate (12%)', rate: 0.12, color: '#06b6d4' },
    { label: 'Aggressive (18%)', rate: 0.18, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">AI Wealth Projection Engine</h1>
        <p className="text-slate-400 text-sm mt-1">Monte Carlo simulation of your portfolio's future value across multiple scenarios</p>
      </div>

      {holdings.length === 0 ? (
        <div className="card p-16 text-center">
          <TrendingUp size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white mb-2">No portfolio to project</h3>
          <p className="text-slate-400 text-sm">Add holdings to see your wealth projection.</p>
        </div>
      ) : (
        <>
          {/* Projection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projections.map(proj => (
              <div key={proj.years} className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-cyan-400" />
                  <h3 className="font-display font-semibold text-white">{proj.years} Year Projection</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Pessimistic', val: proj.pessimistic, color: '#ef4444', rate: '6%' },
                    { label: 'Expected', val: proj.expected, color: '#06b6d4', rate: '12%' },
                    { label: 'Optimistic', val: proj.optimistic, color: '#10b981', rate: '18%' },
                  ].map(scenario => (
                    <div key={scenario.label} className="p-3 rounded-lg border border-[#1e2d40] bg-white/[0.02]">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">{scenario.label} ({scenario.rate}/yr)</div>
                          <div className="font-display font-bold text-lg" style={{ color: scenario.color }}>
                            {formatCurrency(scenario.val)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Growth</div>
                          <div className="text-sm font-semibold text-white">
                            {((scenario.val - totalValue) / totalValue * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(100, (scenario.val / (totalValue * Math.pow(1.20, proj.years))) * 100)}%`,
                            background: scenario.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Monte Carlo Chart */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white text-sm mb-1">20-Year Wealth Growth Comparison</h2>
            <p className="text-xs text-slate-500 mb-6">Starting portfolio: {formatCurrency(totalValue)}</p>
            <div className="space-y-6">
              {annualReturns.map(rate => {
                const checkpoints = [1, 3, 5, 10, 15, 20];
                const maxVal = totalValue * Math.pow(1 + rate.rate, 20);
                return (
                  <div key={rate.label}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: rate.color }} />
                      <span className="text-sm font-medium text-slate-300">{rate.label}</span>
                    </div>
                    <div className="flex items-end gap-2 h-20">
                      {checkpoints.map(year => {
                        const val = totalValue * Math.pow(1 + rate.rate, year);
                        const heightPct = (val / maxVal) * 100;
                        return (
                          <div key={year} className="flex-1 flex flex-col items-center gap-1">
                            <div className="text-[10px] text-slate-500 font-medium">{formatCurrency(val)}</div>
                            <div
                              className="w-full rounded-t"
                              style={{
                                height: `${Math.max(8, heightPct * 0.6)}px`,
                                background: `${rate.color}40`,
                                border: `1px solid ${rate.color}60`,
                                minHeight: '8px'
                              }}
                            />
                            <div className="text-[10px] text-slate-500">{year}Y</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIP Simulator */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white text-sm mb-4">Monthly SIP Impact</h2>
            <p className="text-xs text-slate-400 mb-4">What if you invest additionally every month? (at 12% annual return)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[5000, 10000, 25000, 50000].map(sip => {
                const val10 = totalValue * Math.pow(1.12, 10) + sip * 12 * ((Math.pow(1.12, 10) - 1) / 0.12);
                const val20 = totalValue * Math.pow(1.12, 20) + sip * 12 * ((Math.pow(1.12, 20) - 1) / 0.12);
                return (
                  <div key={sip} className="p-4 rounded-xl border border-[#1e2d40] bg-white/[0.02]">
                    <div className="text-xs text-slate-400 mb-1">SIP: ₹{(sip/1000).toFixed(0)}K/mo</div>
                    <div className="text-sm font-semibold text-cyan-400 mb-0.5">10Y: {formatCurrency(val10)}</div>
                    <div className="text-sm font-semibold text-emerald-400">20Y: {formatCurrency(val20)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
