import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { User, Holding, Portfolio, NavView } from './types';
import { DEMO_HOLDINGS } from './lib/analytics';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import PortfolioView from './views/PortfolioView';
import SimulatorView from './views/SimulatorView';
import DoctorView from './views/DoctorView';
import ProjectionView from './views/ProjectionView';
import StressTestView from './views/StressTestView';
import ScannerView from './views/ScannerView';
import CopilotView from './views/CopilotView';
import Sidebar from './components/Sidebar';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      } else {
        setUser(null);
        setPortfolio(null);
        setHoldings([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      initPortfolio(user.id);
    }
  }, [user]);

  async function initPortfolio(userId: string) {
    let { data: portfolios, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error) return;

    let p: Portfolio;
    if (!portfolios || portfolios.length === 0) {
      const { data: created, error: createErr } = await supabase
        .from('portfolios')
        .insert({ user_id: userId, name: 'My Portfolio' })
        .select()
        .single();
      if (createErr || !created) return;
      p = created;

      // Seed demo holdings
      await supabase.from('holdings').insert(
        DEMO_HOLDINGS.map(h => ({ ...h, portfolio_id: p.id, user_id: userId }))
      );
    } else {
      p = portfolios[0];
    }

    setPortfolio(p);
    await fetchHoldings(p.id);
  }

  const fetchHoldings = useCallback(async (portfolioId: string) => {
    const { data } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: true });
    setHoldings(data ?? []);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const views: Record<NavView, React.ReactNode> = {
    dashboard: <DashboardView holdings={holdings} onNavigate={v => setActiveView(v as NavView)} />,
    portfolio: portfolio ? (
      <PortfolioView holdings={holdings} portfolioId={portfolio.id} userId={user!.id} onHoldingsChange={() => fetchHoldings(portfolio.id)} />
    ) : null,
    simulator: <SimulatorView holdings={holdings} />,
    doctor: <DoctorView holdings={holdings} />,
    projection: <ProjectionView holdings={holdings} />,
    stress: <StressTestView holdings={holdings} />,
    scanner: <ScannerView holdings={holdings} />,
    copilot: <CopilotView holdings={holdings} />,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c14' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <div className="text-slate-400 text-sm">Loading AlphaTwin AI...</div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthView />;

  return (
    <div className="min-h-screen" style={{ background: '#080c14' }}>
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onSignOut={handleSignOut}
        userEmail={user.email}
      />
      <main className="ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {views[activeView]}
        </div>
      </main>
    </div>
  );
}
