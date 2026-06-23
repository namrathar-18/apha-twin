import React, { useMemo } from 'react';
import { Holding } from '../types';
import { formatCurrency, formatPercent, getSectorColor } from '../lib/analytics';
import { Search, TrendingUp, Zap, Star, BarChart2 } from 'lucide-react';

interface ScannerViewProps {
  holdings: Holding[];
}

const OPPORTUNITIES = [
  { symbol: 'TATAPOWER', name: 'Tata Power', sector: 'Energy', signal: 'momentum', score: 91, pTarget: 12.4, reason: 'Renewable energy expansion, strong order book, undervalued relative to peers.', tag: 'Momentum' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'Commodities', signal: 'value', score: 87, pTarget: 9.8, reason: 'Trading at discount to book value. Aluminium cycle turning, strong global demand.', tag: 'Value' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Banking', signal: 'growth', score: 84, pTarget: 15.2, reason: 'Consistent 25%+ loan book growth. Digital lending expansion gaining traction.', tag: 'Growth' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceuticals', sector: 'Healthcare', signal: 'value', score: 82, pTarget: 11.1, reason: 'Strong US generics pipeline. India branded formulations growing at 14% YoY.', tag: 'Value' },
  { symbol: 'COALINDIA', name: 'Coal India', sector: 'Energy', signal: 'dividend', score: 79, pTarget: 7.3, reason: 'Dividend yield of 6.8%. Government backing, consistent cash generation.', tag: 'Dividend' },
  { symbol: 'PIIND', name: 'PI Industries', sector: 'Chemicals', signal: 'growth', score: 78, pTarget: 18.4, reason: 'Agri-chem export leader. Multi-year CSM pipeline with global innovator partnerships.', tag: 'Growth' },
  { symbol: 'POLYCAB', name: 'Polycab India', sector: 'Infrastructure', signal: 'momentum', score: 76, pTarget: 13.7, reason: 'Beneficiary of India\'s infrastructure push. Market leader in wires & cables.', tag: 'Momentum' },
  { symbol: 'DMART', name: 'Avenue Supermarts', sector: 'FMCG', signal: 'growth', score: 74, pTarget: 8.9, reason: 'Consistent 15-20% revenue growth. Expanding store count with strong unit economics.', tag: 'Growth' },
];

const SIGNAL_COLORS: Record<string, string> = {
  momentum: '#06b6d4', value: '#10b981', growth: '#3b82f6', dividend: '#f59e0b',
};

export default function ScannerView({ holdings }: ScannerViewProps) {
  const ownedSymbols = new Set(holdings.map(h => h.symbol));
  const unowned = OPPORTUNITIES.filter(o => !ownedSymbols.has(o.symbol));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">AI Opportunity Scanner</h1>
        <p className="text-slate-400 text-sm mt-1">AI-curated investment opportunities based on momentum, value, and growth signals</p>
      </div>

      {/* Signal Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All Signals', color: '#64748b', count: OPPORTUNITIES.length },
          { label: 'Momentum', color: SIGNAL_COLORS.momentum, count: OPPORTUNITIES.filter(o => o.signal === 'momentum').length },
          { label: 'Value', color: SIGNAL_COLORS.value, count: OPPORTUNITIES.filter(o => o.signal === 'value').length },
          { label: 'Growth', color: SIGNAL_COLORS.growth, count: OPPORTUNITIES.filter(o => o.signal === 'growth').length },
          { label: 'Dividend', color: SIGNAL_COLORS.dividend, count: OPPORTUNITIES.filter(o => o.signal === 'dividend').length },
        ].map(f => (
          <button key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e2d40] text-xs font-medium text-slate-300 hover:border-[#2a3f5a] transition-all">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} />
            {f.label}
            <span className="text-slate-500">({f.count})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {OPPORTUNITIES.map((opp, i) => {
          const isOwned = ownedSymbols.has(opp.symbol);
          const scoreColor = opp.score >= 85 ? '#10b981' : opp.score >= 75 ? '#06b6d4' : '#f59e0b';
          return (
            <div
              key={opp.symbol}
              className="card p-5 card-hover animate-slide-up"
              style={{ animationDelay: `${i * 50}ms`, opacity: isOwned ? 0.65 : 1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ background: `${getSectorColor(opp.sector)}15`, color: getSectorColor(opp.sector), border: `1px solid ${getSectorColor(opp.sector)}30` }}>
                    {opp.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-display font-bold text-white text-sm">{opp.symbol}</div>
                    <div className="text-xs text-slate-400">{opp.name}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded font-semibold" style={{ background: `${SIGNAL_COLORS[opp.signal]}15`, color: SIGNAL_COLORS[opp.signal] }}>
                      {opp.tag}
                    </span>
                    {isOwned && <span className="text-[10px] px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 font-medium">Owned</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={11} style={{ color: scoreColor }} fill={scoreColor} />
                    <span className="text-xs font-bold" style={{ color: scoreColor }}>{opp.score}/100</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{opp.reason}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5">AI Price Target</div>
                    <div className="text-sm font-semibold text-emerald-400">+{opp.pTarget}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5">Sector</div>
                    <div className="text-xs font-medium" style={{ color: getSectorColor(opp.sector) }}>{opp.sector}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 mb-0.5">AI Score</div>
                    <div className="progress-bar w-20">
                      <div className="progress-bar-fill" style={{ width: `${opp.score}%`, background: scoreColor }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <BarChart2 size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300/80">
            These are AI-generated signals for educational purposes only, not financial advice. Always conduct your own research before investing. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
}
