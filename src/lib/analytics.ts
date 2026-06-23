import { Holding, SimulationResult, CrashSurvivalScore, WealthProjection } from '../types';

export const DEMO_HOLDINGS: Omit<Holding, 'id' | 'portfolio_id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', asset_type: 'stock', quantity: 50, avg_buy_price: 2400, current_price: 2678, sector: 'Energy', beta: 1.1 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', asset_type: 'stock', quantity: 30, avg_buy_price: 3200, current_price: 3542, sector: 'Technology', beta: 0.85 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', asset_type: 'stock', quantity: 80, avg_buy_price: 1580, current_price: 1621, sector: 'Banking', beta: 0.95 },
  { symbol: 'INFY', name: 'Infosys', asset_type: 'stock', quantity: 60, avg_buy_price: 1450, current_price: 1389, sector: 'Technology', beta: 0.9 },
  { symbol: 'ITC', name: 'ITC Limited', asset_type: 'stock', quantity: 200, avg_buy_price: 380, current_price: 432, sector: 'FMCG', beta: 0.6 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', asset_type: 'stock', quantity: 100, avg_buy_price: 620, current_price: 588, sector: 'Automobile', beta: 1.6 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', asset_type: 'stock', quantity: 25, avg_buy_price: 2800, current_price: 2456, sector: 'Conglomerate', beta: 1.8 },
  { symbol: 'GOLDBEES', name: 'Nippon Gold ETF', asset_type: 'etf', quantity: 150, avg_buy_price: 52, current_price: 58, sector: 'Commodities', beta: 0.1 },
  { symbol: 'NIFTYBEES', name: 'Nippon Nifty ETF', asset_type: 'etf', quantity: 100, avg_buy_price: 210, current_price: 228, sector: 'Index', beta: 1.0 },
  { symbol: 'BTC', name: 'Bitcoin', asset_type: 'crypto', quantity: 0.15, avg_buy_price: 3800000, current_price: 5200000, sector: 'Crypto', beta: 2.2 },
];

export const SCENARIOS = [
  { id: 'nifty_crash_20', name: 'Nifty Falls 20%', type: 'crash', drop: -20, icon: '📉', color: 'red' },
  { id: 'nifty_crash_30', name: 'Nifty Falls 30%', type: 'crash', drop: -30, icon: '🔻', color: 'red' },
  { id: 'covid_crash', name: 'COVID-style Crash', type: 'historical', drop: -38, icon: '🦠', color: 'red' },
  { id: 'crisis_2008', name: '2008 Financial Crisis', type: 'historical', drop: -55, icon: '🏦', color: 'red' },
  { id: 'dotcom_bubble', name: 'Dot-com Bubble Burst', type: 'historical', drop: -45, icon: '💻', color: 'red' },
  { id: 'rate_hike', name: 'Interest Rate Shock (+3%)', type: 'macro', drop: -15, icon: '📊', color: 'amber' },
  { id: 'inflation_spike', name: 'Inflation Spike (8%)', type: 'macro', drop: -12, icon: '💸', color: 'amber' },
  { id: 'bull_run', name: 'Bull Market Rally +25%', type: 'bull', drop: 25, icon: '🚀', color: 'green' },
];

export function runSimulation(holdings: Holding[], marketDrop: number, scenarioName: string, scenarioType: string): SimulationResult {
  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);
  
  const holdingImpacts = holdings.map(h => {
    const weight = (h.current_price * h.quantity) / totalValue;
    const sectorMultiplier = getSectorMultiplier(h.sector, scenarioType);
    const impact = marketDrop * h.beta * sectorMultiplier * weight;
    return { symbol: h.symbol, name: h.name, impact, weight };
  });

  const portfolioImpact = holdingImpacts.reduce((sum, h) => sum + h.impact, 0);
  const absoluteLoss = totalValue * (portfolioImpact / 100);

  const sorted = [...holdingImpacts].sort((a, b) => a.impact - b.impact);
  const isDown = marketDrop < 0;

  const vulnerableHoldings = isDown
    ? sorted.slice(0, 3).map(h => ({ symbol: h.symbol, name: h.name, impact: h.impact }))
    : sorted.slice(-3).reverse().map(h => ({ symbol: h.symbol, name: h.name, impact: h.impact }));

  const defensiveHoldings = isDown
    ? sorted.slice(-3).reverse().map(h => ({ symbol: h.symbol, name: h.name, impact: h.impact }))
    : sorted.slice(0, 3).map(h => ({ symbol: h.symbol, name: h.name, impact: h.impact }));

  const recoveryMonths = Math.abs(portfolioImpact) < 10 ? 6 : Math.abs(portfolioImpact) < 20 ? 14 : Math.abs(portfolioImpact) < 35 ? 28 : 48;

  return { portfolioImpact, absoluteLoss, recoveryMonths, vulnerableHoldings, defensiveHoldings, scenarioName, scenarioType };
}

function getSectorMultiplier(sector: string, scenarioType: string): number {
  const multipliers: Record<string, Record<string, number>> = {
    'crash': { Technology: 1.3, Banking: 1.2, Automobile: 1.4, Crypto: 2.0, FMCG: 0.7, Commodities: 0.6, Energy: 1.0, Conglomerate: 1.3, Index: 1.0 },
    'historical': { Technology: 1.4, Banking: 1.5, Automobile: 1.3, Crypto: 1.8, FMCG: 0.6, Commodities: 0.8, Energy: 1.1, Conglomerate: 1.2, Index: 1.0 },
    'macro': { Technology: 1.2, Banking: 0.9, Automobile: 1.1, Crypto: 1.5, FMCG: 0.8, Commodities: 1.3, Energy: 1.4, Conglomerate: 1.0, Index: 1.0 },
    'bull': { Technology: 1.3, Banking: 1.1, Automobile: 1.2, Crypto: 2.0, FMCG: 0.7, Commodities: 0.9, Energy: 1.0, Conglomerate: 1.1, Index: 1.0 },
  };
  return multipliers[scenarioType]?.[sector] ?? 1.0;
}

export function computeCrashScore(holdings: Holding[]): CrashSurvivalScore {
  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);

  // Diversification: number of sectors
  const sectors = new Set(holdings.map(h => h.sector));
  const diversification = Math.min(100, Math.round((sectors.size / 8) * 100));

  // Volatility: weighted avg beta
  const avgBeta = holdings.reduce((sum, h) => {
    const weight = (h.current_price * h.quantity) / totalValue;
    return sum + h.beta * weight;
  }, 0);
  const volatility = Math.max(0, Math.round(100 - (avgBeta - 0.5) * 60));

  // Concentration risk: largest single holding weight
  const maxWeight = Math.max(...holdings.map(h => (h.current_price * h.quantity) / totalValue));
  const concentrationRisk = Math.round(100 - maxWeight * 100);

  // Liquidity: penalize illiquid assets
  const illiquidWeight = holdings
    .filter(h => h.asset_type === 'crypto' || h.asset_type === 'mutual_fund')
    .reduce((sum, h) => sum + (h.current_price * h.quantity) / totalValue, 0);
  const liquidity = Math.round(100 - illiquidWeight * 80);

  const total = Math.round((diversification * 0.3 + volatility * 0.3 + concentrationRisk * 0.25 + liquidity * 0.15));

  const breakdown: string[] = [];
  if (sectors.size < 4) breakdown.push('Low sector diversification increases crash risk');
  if (avgBeta > 1.3) breakdown.push('High portfolio beta amplifies market movements');
  if (maxWeight > 0.25) breakdown.push('Single holding over 25% creates concentration risk');
  if (breakdown.length === 0) breakdown.push('Portfolio shows solid defensive characteristics');

  return { total, diversification, volatility, concentrationRisk, liquidity, breakdown };
}

export function computeWealthProjection(holdings: Holding[]): WealthProjection[] {
  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);
  const timeframes = [5, 10, 20];

  return timeframes.map(years => {
    const pessimistic = totalValue * Math.pow(1.06, years);
    const expected = totalValue * Math.pow(1.12, years);
    const optimistic = totalValue * Math.pow(1.18, years);
    return { years, pessimistic, expected, optimistic };
  });
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function getSectorColor(sector: string): string {
  const colors: Record<string, string> = {
    Technology: '#06b6d4', Banking: '#3b82f6', Automobile: '#f59e0b',
    FMCG: '#10b981', Energy: '#ef4444', Commodities: '#f97316',
    Conglomerate: '#8b5cf6', Index: '#64748b', Crypto: '#ec4899',
  };
  return colors[sector] ?? '#64748b';
}

export function generateAIResponse(question: string, holdings: Holding[]): string {
  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);
  const score = computeCrashScore(holdings);
  const sectors = [...new Set(holdings.map(h => h.sector))];
  const q = question.toLowerCase();

  if (q.includes('recession') || q.includes('crash') || q.includes('survive')) {
    const sim = runSimulation(holdings, -30, 'Recession', 'crash');
    return `Based on your current portfolio of ${formatCurrency(totalValue)}, here is my recession survival analysis:

**Crash Survival Score: ${score.total}/100** — ${score.total >= 70 ? 'Strong defensive positioning' : score.total >= 50 ? 'Moderate resilience' : 'High vulnerability'}

In a 30% market decline scenario:
- Your portfolio would decline by approximately **${formatPercent(sim.portfolioImpact)}**
- Estimated loss: **${formatCurrency(sim.absoluteLoss)}**
- Recovery timeline: ~**${sim.recoveryMonths} months**

Your most vulnerable positions are ${sim.vulnerableHoldings.slice(0,2).map(h => h.name).join(' and ')}, while ${sim.defensiveHoldings.slice(0,2).map(h => h.name).join(' and ')} provide defensive cover.

**Recommendation:** ${score.diversification < 60 ? 'Increase sector diversification. ' : ''}${score.volatility < 50 ? 'Reduce high-beta holdings. ' : ''}Consider allocating 10-15% to gold or bonds as a hedge.`;
  }

  if (q.includes('inflation')) {
    const sim = runSimulation(holdings, -12, 'Inflation Spike', 'macro');
    return `Inflation analysis for your portfolio:

An 8% inflation spike would impact your portfolio by approximately **${formatPercent(sim.portfolioImpact)}**.

**Winners in inflationary environments from your holdings:**
- Energy and commodity-linked stocks tend to outperform
- ${holdings.filter(h => h.sector === 'Energy' || h.sector === 'Commodities').map(h => h.name).join(', ') || 'No direct inflation hedges found'}

**Sectors at risk:** Technology stocks often underperform during inflation due to higher discount rates.

**Recommendation:** Add inflation hedges — consider GOLDBEES or commodity ETFs to protect purchasing power.`;
  }

  if (q.includes('diversif') || q.includes('sector')) {
    const sectorBreakdown = holdings.reduce((acc, h) => {
      const val = h.current_price * h.quantity;
      acc[h.sector] = (acc[h.sector] || 0) + val;
      return acc;
    }, {} as Record<string, number>);

    const topSector = Object.entries(sectorBreakdown).sort((a, b) => b[1] - a[1])[0];
    const topPct = ((topSector[1] / totalValue) * 100).toFixed(1);

    return `Diversification analysis:

Your portfolio spans **${sectors.length} sectors**: ${sectors.join(', ')}.

Largest concentration: **${topSector[0]}** at ${topPct}% of portfolio value.

${parseFloat(topPct) > 35 ? `⚠️ ${topSector[0]} exceeds 35% — this is a concentration risk that could hurt you if this sector faces headwinds.` : '✅ No single sector dominates excessively.'}

**Diversification Score: ${score.diversification}/100**

Recommendation: ${sectors.length < 5 ? 'Add 2-3 more uncorrelated sectors. Consider Healthcare, FMCG, or Infrastructure ETFs.' : 'Diversification looks healthy. Focus on rebalancing weightings rather than adding new sectors.'}`;
  }

  if (q.includes('rebalanc') || q.includes('optimize')) {
    const highBeta = holdings.filter(h => h.beta > 1.4).map(h => h.name);
    const lowBeta = holdings.filter(h => h.beta < 0.8).map(h => h.name);
    return `Portfolio rebalancing recommendations:

**Reduce exposure:**
${highBeta.length > 0 ? highBeta.map(n => `- ${n} (high beta, amplifies downturns)`).join('\n') : '- No immediate reduction needed'}

**Maintain/increase:**
${lowBeta.length > 0 ? lowBeta.map(n => `- ${n} (defensive, provides stability)`).join('\n') : '- Consider adding low-beta defensive stocks'}

**Target allocation:**
- Core holdings (low beta): 50-60%
- Growth holdings (moderate beta): 30-40%
- High-conviction bets (high beta): 10-15%

This structure aims to capture market upside while limiting crash exposure.`;
  }

  if (q.includes('buy') || q.includes('sell') || q.includes('invest')) {
    return `Investment analysis for your portfolio:

**Current portfolio health:** ${score.total}/100 crash survival score

**Market outlook considerations:**
- Your portfolio has ${formatCurrency(totalValue)} in assets across ${holdings.length} holdings
- Weighted average beta: ${(holdings.reduce((s, h) => s + h.beta * (h.current_price * h.quantity) / totalValue, 0)).toFixed(2)}

**Before adding new positions, consider:**
1. Does this holding add diversification or duplicate existing exposure?
2. What is the correlation with your existing holdings?
3. What is your maximum acceptable drawdown?

**Specific to your portfolio:** You appear ${sectors.includes('Healthcare') ? '' : 'to lack Healthcare exposure — a defensive sector worth considering. '}${score.concentrationRisk < 60 ? 'overconcentrated in a few positions, so a new diversifying asset could improve risk-adjusted returns.' : 'well-diversified, so focus on quality over quantity.'}`;
  }

  return `AI Portfolio Analysis:

Your portfolio of **${formatCurrency(totalValue)}** across **${holdings.length} holdings** shows:

- **Crash Survival Score:** ${score.total}/100
- **Sectors covered:** ${sectors.length} (${sectors.join(', ')})
- **Avg Portfolio Beta:** ${(holdings.reduce((s, h) => s + h.beta * (h.current_price * h.quantity) / totalValue, 0)).toFixed(2)}

**Key insights:**
${score.breakdown.map(b => `- ${b}`).join('\n')}

Try asking me about specific scenarios like "Can my portfolio survive a recession?" or "How diversified am I?" or "What should I rebalance?"`;
}
