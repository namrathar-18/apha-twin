import React, { useMemo } from 'react';
import { Holding } from '../types';
import { computeCrashScore, formatCurrency, getSectorColor, formatPercent } from '../lib/analytics';
import { AlertTriangle, CheckCircle, Stethoscope, TrendingUp, Layers, Zap } from 'lucide-react';

interface DoctorViewProps {
  holdings: Holding[];
}

export default function DoctorView({ holdings }: DoctorViewProps) {
  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);
  const score = useMemo(() => holdings.length > 0 ? computeCrashScore(holdings) : null, [holdings]);

  const sectorBreakdown = useMemo(() => {
    const acc: Record<string, { value: number; holdings: string[] }> = {};
    holdings.forEach(h => {
      const val = h.current_price * h.quantity;
      if (!acc[h.sector]) acc[h.sector] = { value: 0, holdings: [] };
      acc[h.sector].value += val;
      acc[h.sector].holdings.push(h.symbol);
    });
    return Object.entries(acc).sort((a, b) => b[1].value - a[1].value);
  }, [holdings]);

  const highBetaHoldings = holdings.filter(h => h.beta > 1.4);
  const duplicateSectors = sectorBreakdown.filter(([, data]) => (data.value / totalValue) > 0.30);
  const lowPerfHoldings = holdings.filter(h => h.current_price < h.avg_buy_price * 0.85);

  const diagnoses: { type: 'warning' | 'danger' | 'ok'; title: string; description: string; action: string }[] = [];

  if (duplicateSectors.length > 0) {
    duplicateSectors.forEach(([sector, data]) => {
      const pct = ((data.value / totalValue) * 100).toFixed(1);
      diagnoses.push({
        type: 'danger',
        title: `${sector} Overconcentration`,
        description: `${pct}% of your portfolio is in ${sector} (${data.holdings.join(', ')}). Sector shocks could cause significant drawdowns.`,
        action: `Reduce ${sector} exposure to below 25%. Consider diversifying into uncorrelated sectors.`
      });
    });
  }

  if (highBetaHoldings.length > 0 && (highBetaHoldings.reduce((s, h) => s + h.current_price * h.quantity, 0) / totalValue) > 0.3) {
    diagnoses.push({
      type: 'warning',
      title: 'High Volatility Exposure',
      description: `${highBetaHoldings.map(h => h.symbol).join(', ')} have beta >1.4, meaning they amplify market moves significantly.`,
      action: 'Limit high-beta holdings to 15-20% of portfolio. Add low-beta defensive names (FMCG, Gold ETF) to stabilize.'
    });
  }

  if (lowPerfHoldings.length > 0) {
    diagnoses.push({
      type: 'warning',
      title: 'Underperforming Holdings',
      description: `${lowPerfHoldings.map(h => h.symbol).join(', ')} are trading 15%+ below your average buy price.`,
      action: 'Review the thesis for these holdings. Consider averaging down only if conviction remains, or cutting losses and redeploying.'
    });
  }

  const sectors = new Set(holdings.map(h => h.sector));
  if (sectors.size < 4 && holdings.length >= 5) {
    diagnoses.push({
      type: 'warning',
      title: 'Low Sector Diversification',
      description: `Your portfolio only covers ${sectors.size} sectors. Single-sector events could significantly impact returns.`,
      action: 'Aim for 6-8 sectors. Consider adding Healthcare, FMCG, or Infrastructure exposure.'
    });
  }

  const cryptoVal = holdings.filter(h => h.asset_type === 'crypto').reduce((s, h) => s + h.current_price * h.quantity, 0);
  if (cryptoVal / totalValue > 0.2) {
    diagnoses.push({
      type: 'danger',
      title: 'Excessive Crypto Allocation',
      description: `Crypto represents ${((cryptoVal / totalValue) * 100).toFixed(1)}% of portfolio — extremely high volatility and correlation risk.`,
      action: 'Keep crypto under 10% of total portfolio for risk-adjusted returns.'
    });
  }

  if (diagnoses.length === 0) {
    diagnoses.push({
      type: 'ok',
      title: 'Portfolio Health Looks Good',
      description: 'No major structural issues detected in your current portfolio.',
      action: 'Continue monitoring concentration levels and rebalance quarterly.'
    });
  }

  const avgBeta = holdings.length > 0 ? holdings.reduce((s, h) => s + h.beta * (h.current_price * h.quantity) / totalValue, 0) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">AI Portfolio Doctor</h1>
        <p className="text-slate-400 text-sm mt-1">Deep structural analysis of risks, concentration, and inefficiencies in your portfolio</p>
      </div>

      {holdings.length === 0 ? (
        <div className="card p-16 text-center">
          <Stethoscope size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white mb-2">No portfolio to diagnose</h3>
          <p className="text-slate-400 text-sm">Add holdings to get an AI health check.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display font-semibold text-white text-sm">Diagnostic Report</h2>
            {diagnoses.map((d, i) => (
              <div key={i} className={`card p-5 border-l-4 ${
                d.type === 'danger' ? 'border-l-red-500' :
                d.type === 'warning' ? 'border-l-amber-500' :
                'border-l-emerald-500'
              } animate-slide-up`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${d.type === 'danger' ? 'text-red-400' : d.type === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {d.type === 'ok' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm mb-1 ${
                      d.type === 'danger' ? 'text-red-300' : d.type === 'warning' ? 'text-amber-300' : 'text-emerald-300'
                    }`}>{d.title}</div>
                    <p className="text-sm text-slate-400 mb-3">{d.description}</p>
                    <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Recommendation</div>
                      <div className="text-sm text-slate-300">{d.action}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Vitals */}
            <div className="card p-5">
              <h3 className="font-display font-semibold text-white text-sm mb-4">Portfolio Vitals</h3>
              <div className="space-y-3">
                {[
                  { label: 'Crash Survival', val: score?.total ?? 0, unit: '/100', color: (score?.total ?? 0) >= 70 ? '#10b981' : (score?.total ?? 0) >= 50 ? '#f59e0b' : '#ef4444' },
                  { label: 'Diversification', val: score?.diversification ?? 0, unit: '/100', color: '#06b6d4' },
                  { label: 'Volatility Index', val: score?.volatility ?? 0, unit: '/100', color: '#3b82f6' },
                  { label: 'Concentration Risk', val: score?.concentrationRisk ?? 0, unit: '/100', color: '#f59e0b' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-semibold" style={{ color: item.color }}>{item.val}{item.unit}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${item.val}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector Breakdown */}
            <div className="card p-5">
              <h3 className="font-display font-semibold text-white text-sm mb-4">Sector Exposure</h3>
              <div className="space-y-2.5">
                {sectorBreakdown.map(([sector, data]) => {
                  const pct = (data.value / totalValue) * 100;
                  const isRisk = pct > 30;
                  return (
                    <div key={sector}>
                      <div className="flex justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: getSectorColor(sector) }} />
                          <span className="text-slate-300">{sector}</span>
                        </div>
                        <span className={`font-semibold ${isRisk ? 'text-red-400' : 'text-slate-400'}`}>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%`, background: isRisk ? '#ef4444' : getSectorColor(sector) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Beta Breakdown */}
            <div className="card p-5">
              <h3 className="font-display font-semibold text-white text-sm mb-3">Risk Profile</h3>
              <div className="space-y-2">
                {[
                  { label: 'Avg. Portfolio Beta', val: avgBeta.toFixed(2) },
                  { label: 'High Beta Holdings', val: `${highBetaHoldings.length}` },
                  { label: 'Defensive Holdings', val: `${holdings.filter(h => h.beta < 0.8).length}` },
                  { label: 'Total Invested', val: formatCurrency(holdings.reduce((s, h) => s + h.avg_buy_price * h.quantity, 0)) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm py-1.5 border-b border-[#1e2d40] last:border-0">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-white font-medium">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
