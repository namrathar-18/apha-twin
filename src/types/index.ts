export interface User {
  id: string;
  email: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  user_id: string;
  symbol: string;
  name: string;
  asset_type: 'stock' | 'etf' | 'mutual_fund' | 'crypto';
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  sector: string;
  beta: number;
  created_at: string;
  updated_at: string;
}

export interface SimulationResult {
  portfolioImpact: number;
  absoluteLoss: number;
  recoveryMonths: number;
  vulnerableHoldings: { symbol: string; name: string; impact: number }[];
  defensiveHoldings: { symbol: string; name: string; impact: number }[];
  scenarioName: string;
  scenarioType: string;
}

export interface CrashSurvivalScore {
  total: number;
  diversification: number;
  volatility: number;
  concentrationRisk: number;
  liquidity: number;
  breakdown: string[];
}

export interface WealthProjection {
  years: number;
  pessimistic: number;
  expected: number;
  optimistic: number;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type NavView = 'dashboard' | 'portfolio' | 'simulator' | 'doctor' | 'projection' | 'copilot' | 'stress' | 'scanner';
