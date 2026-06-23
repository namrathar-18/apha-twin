import React, { useState } from 'react';
import { Holding } from '../types';
import { runSimulation, SCENARIOS, formatCurrency, formatPercent } from '../lib/analytics';
import { Zap, TrendingDown, TrendingUp, Clock, ShieldAlert, ChevronRight } from 'lucide-react';

interface SimulatorViewProps {
  holdings: Holding[];
}

export default function SimulatorView({ holdings }: SimulatorViewProps) {
  const [selected, setSelected] = useState<typeof SCENARIOS[number] | null>(null);
  const [custom, setCustom] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof runSimulation> | null>(null);

  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);

  async function runScenario(scenario: typeof SCENARIOS[number]) {
    if (holdings.length === 0) return;
    setSelected(scenario);
    setRunning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 900));
    const res = runSimulation(holdings, scenario.drop, scenario.name, scenario.type);
    setResult(res);
    setRunning(false);
  }

  async function runCustom() {
    const drop = parseFloat(custom);
    if (isNaN(drop) || holdings.length === 0) return;
    const scenario = { id: 'custom', name: `Market ${drop > 0 ? '+' : ''}${drop}%`, type: drop < 0 ? 'crash' : 'bull', drop, icon: '⚙️', color: drop < 0 ? 'red' : 'green' };
    setSelected(scenario);
    setRunning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 900));
    const res = runSimulation(holdings, drop, scenario.name, scenario.type);
    setResult(res);
    setRunning(false);
  }

  const isDown = result && result.portfolioImpact < 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">AI Market Scenario Simulator</h1>
        <p className="text-slate-400 text-sm mt-1">Stress-test your portfolio against real and hypothetical market scenarios</p>
      </div>

      {holdings.length === 0 ? (
        <div className="card p-16 text-center">
          <Zap size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-white mb-2">No portfolio to simulate</h3>
          <p className="text-slate-400 text-sm">Add holdings to your portfolio first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Scenario Selector */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-4">
              <h2 className="font-display font-semibold text-white text-sm mb-3">Select Scenario</h2>
              <div className="space-y-2">
                {SCENARIOS.map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => runScenario(scenario)}
                    disabled={running}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border ${
                      selected?.id === scenario.id
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                        : 'border-[#1e2d40] text-slate-300 hover:bg-white/[0.03] hover:border-[#2a3f5a]'
                    } ${running ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-base">{scenario.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{scenario.name}</div>
                      <div className={`text-xs font-semibold ${scenario.drop < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {scenario.drop > 0 ? '+' : ''}{scenario.drop}% market move
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Scenario */}
            <div className="card p-4">
              <h2 className="font-display font-semibold text-white text-sm mb-3">Custom Scenario</h2>
              <p className="text-xs text-slate-400 mb-3">Enter a custom market change percentage (e.g. -20 or +15)</p>
              <div className="flex gap-2">
                <input
                  className="input-field"
                  type="number"
                  placeholder="e.g. -25"
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                />
                <button className="btn-primary whitespace-nowrap" onClick={runCustom} disabled={running || !custom}>Run</button>
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-3">
            {running && (
              <div className="card p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mb-4" />
                <div className="font-display font-semibold text-white mb-1">Simulating Scenario</div>
                <div className="text-sm text-slate-400">Running Monte Carlo analysis on {holdings.length} holdings...</div>
              </div>
            )}

            {!running && !result && (
              <div className="card p-12 flex flex-col items-center justify-center min-h-[400px]">
                <Zap size={48} className="text-slate-700 mb-4" />
                <div className="font-display font-semibold text-slate-400 text-lg mb-2">Select a scenario to simulate</div>
                <p className="text-slate-500 text-sm text-center max-w-xs">Choose from pre-built historical scenarios or enter a custom market change to see how your portfolio reacts.</p>
              </div>
            )}

            {!running && result && (
              <div className="space-y-4 animate-slide-up">
                {/* Impact Summary */}
                <div className={`card p-6 border ${isDown ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-white">{result.scenarioName}</h2>
                    <span className={`badge-${isDown ? 'bearish' : 'bullish'}`}>{isDown ? 'Bearish' : 'Bullish'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Portfolio Impact</div>
                      <div className={`font-display font-bold text-3xl ${isDown ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatPercent(result.portfolioImpact)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">{isDown ? 'Est. Loss' : 'Est. Gain'}</div>
                      <div className={`font-display font-bold text-2xl ${isDown ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatCurrency(Math.abs(result.absoluteLoss))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Recovery Est.</div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-400" />
                        <span className="font-display font-bold text-xl text-white">{result.recoveryMonths} mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-slate-400 mb-1">Portfolio After Scenario</div>
                    <div className="font-display font-bold text-xl text-white">
                      {formatCurrency(totalValue + result.absoluteLoss)}
                      <span className="text-sm font-normal text-slate-400 ml-2">vs. {formatCurrency(totalValue)} today</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Vulnerable Holdings */}
                  <div className="card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert size={14} className="text-red-400" />
                      <h3 className="font-semibold text-sm text-white">{isDown ? 'Most Vulnerable' : 'Top Gainers'}</h3>
                    </div>
                    <div className="space-y-2.5">
                      {result.vulnerableHoldings.map((h, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">{h.symbol}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[100px]">{h.name}</div>
                          </div>
                          <span className={`text-xs font-bold ${isDown ? 'text-red-400' : 'text-emerald-400'}`}>
                            {formatPercent(h.impact)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Defensive Holdings */}
                  <div className="card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {isDown ? <TrendingDown size={14} className="text-emerald-400" /> : <TrendingUp size={14} className="text-cyan-400" />}
                      <h3 className="font-semibold text-sm text-white">{isDown ? 'Defensive Holdings' : 'Moderate Gains'}</h3>
                    </div>
                    <div className="space-y-2.5">
                      {result.defensiveHoldings.map((h, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">{h.symbol}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[100px]">{h.name}</div>
                          </div>
                          <span className={`text-xs font-bold ${isDown ? 'text-emerald-400' : 'text-emerald-400'}`}>
                            {formatPercent(h.impact)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
