import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, TrendingUp, ShieldAlert, MessageSquare, Zap } from 'lucide-react';

export default function AuthView() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else setSuccess('Account created! Signing you in...');
    }
    setLoading(false);
  }

  const features = [
    { icon: <Zap size={16} />, label: 'AI Scenario Simulator', desc: 'Test portfolio against crashes' },
    { icon: <ShieldAlert size={16} />, label: 'Crash Survival Score', desc: 'Know your risk before it hits' },
    { icon: <TrendingUp size={16} />, label: 'Wealth Projection', desc: '5, 10, 20 year Monte Carlo' },
    { icon: <MessageSquare size={16} />, label: 'AI Copilot', desc: 'Ask anything about your portfolio' },
  ];

  return (
    <div className="min-h-screen bg-mesh flex" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden" style={{ background: '#080e1c', borderRight: '1px solid #1e2d40' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #0891b2 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)' }}>
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-lg">AlphaTwin AI</div>
              <div className="text-[10px] text-cyan-500 font-medium tracking-widest uppercase">Portfolio Intelligence</div>
            </div>
          </div>

          <h1 className="font-display font-bold text-4xl text-white mb-4 leading-tight">
            The Digital Twin of Your
            <br />
            <span className="text-gradient-cyan">Investment Portfolio</span>
          </h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            AI-powered simulation, stress testing, and predictive intelligence — know what happens to your money before it does.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[#1e2d40] bg-white/[0.02]">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{f.label}</div>
                  <div className="text-xs text-slate-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-500">
          <span>Simulation-driven investing</span>
          <span>•</span>
          <span>Predictive AI</span>
          <span>•</span>
          <span>Risk Intelligence</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)' }}>
              <Activity size={18} className="text-white" />
            </div>
            <div className="font-display font-bold text-white text-base">AlphaTwin AI</div>
          </div>

          <div className="card p-8">
            <h2 className="font-display font-bold text-xl text-white mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              {mode === 'login' ? 'Sign in to access your portfolio intelligence platform.' : 'Start building your AI-powered investment copilot.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{error}</div>
              )}
              {success && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">{success}</div>
              )}

              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            By continuing, you agree that this is a portfolio simulation tool and not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
