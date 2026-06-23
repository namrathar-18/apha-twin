import React from 'react';
import { Holding } from '../types';
import { runSimulation, formatCurrency, formatPercent } from '../lib/analytics';
import { ShieldAlert } from 'lucide-react';

interface StressTestViewProps {
  holdings: Holding[];
}

const STRESS_EVENTS = [
  { id: 'covid', name: 'COVID-19 Crash (2020)', drop: -38, duration: '33 days', recovery: '5 months', icon: '🦠', desc: 'Fastest crash in market history triggered by global pandemic shutdowns.' },
  { id: 'gfc', name: '2008 Global Financial Crisis', drop: -55, duration: '17 months', recovery: '4 years', icon: '🏦', desc: 'Collapse of housing market and banking system. Worst crisis since Great Depression.' },
  { id: 'dotcom', name: 'Dot-com Bubble (2000-02)', drop: -45, duration: '30 months', recovery: '7 years', icon: '💻', desc: 'Tech sector overcorrection after extreme valuation multiples in 1999-2000.' },
  { id: 'rate2022', name: 'Rate Hike Cycle (2022)', drop: -25, duration: '12 months', recovery: '18 months', icon: '📊', desc: 'Aggressive Fed rate hikes from 0.25% to 5.25% crushed growth stocks.' },
  { id: 'russian', name: 'Ukraine War Shock (2022)', drop: -18, duration: '3 months', recovery: '6 months', icon: '🌍', desc: 'Geopolitical shock causing energy, commodities, and defense sector repricing.' },
  { id: 'flash', name: 'Flash Crash Scenario', drop: -10, duration: '1 day', recovery: '2 weeks', icon: '⚡', desc: 'Algorithmic trading cascade causing rapid intraday market collapse.' },
];

export default function StressTestView({ holdings }: StressTestViewProps) {
  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Portfolio Stress Testing</h1>
        <p className="text-slate-400 text-sm mt-1">Historical crisis simulations — see how your portfolio would have survived major market events</p>
      </div>

      {holdings.length === 0 ? (
        <div className="card p-16 text-center">
          <ShieldAlert size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white mb-2">No portfolio to stress test</h3>
          <p className="text-slate-400 text-sm">Add holdings to run historical crisis simulations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Bar */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ShieldAlert size={18} className="text-amber-400" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Historical Stress Test Results</div>
                <div className="text-xs text-slate-400">Current portfolio value: {formatCurrency(totalValue)} — testing against 6 major market events</div>
              </div>
            </div>
          </div>

          {STRESS_EVENTS.map((event, i) => {
            const result = runSimulation(holdings, event.drop, event.name, 'historical');
            const survivedValue = totalValue + result.absoluteLoss;
            const isDown = result.portfolioImpact < 0;
            const severity = Math.abs(result.portfolioImpact);
            const label = severity < 15 ? 'Mild' : severity < 25 ? 'Moderate' : severity < 40 ? 'Severe' : 'Critical';
            const labelColor = severity < 15 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : severity < 25 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';

            return (
              <div key={event.id} className="card p-5 card-hover" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{event.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-white text-sm">{event.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${labelColor}`}>{label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{event.desc}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-[#1e2d40]">
                          <div className="text-[10px] text-slate-500 mb-0.5">Market Drop</div>
                          <div className="text-sm font-bold text-red-400">{event.drop}%</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-[#1e2d40]">
                          <div className="text-[10px] text-slate-500 mb-0.5">Portfolio Impact</div>
                          <div className={`text-sm font-bold ${isDown ? 'text-red-400' : 'text-emerald-400'}`}>
                            {formatPercent(result.portfolioImpact)}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-[#1e2d40]">
                          <div className="text-[10px] text-slate-500 mb-0.5">Estimated Loss</div>
                          <div className="text-sm font-bold text-red-400">{formatCurrency(Math.abs(result.absoluteLoss))}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-[#1e2d40]">
                          <div className="text-[10px] text-slate-500 mb-0.5">Portfolio After</div>
                          <div className="text-sm font-bold text-white">{formatCurrency(survivedValue)}</div>
                        </div>
                      </div>

                      {/* Impact bar */}
                      <div className="mt-3">
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${100 - Math.abs(result.portfolioImpact)}%`,
                              background: severity < 15 ? '#10b981' : severity < 25 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>Portfolio survives at {(100 + result.portfolioImpact).toFixed(1)}%</span>
                          <span>Historical: {event.duration} crash, {event.recovery} recovery</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
