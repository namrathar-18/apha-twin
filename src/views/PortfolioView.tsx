import React, { useState } from 'react';
import { Holding } from '../types';
import { formatCurrency, formatPercent, getSectorColor } from '../lib/analytics';
import { Plus, Trash2, Edit2, X, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PortfolioViewProps {
  holdings: Holding[];
  portfolioId: string;
  userId: string;
  onHoldingsChange: () => void;
}

const ASSET_TYPES = ['stock', 'etf', 'mutual_fund', 'crypto'] as const;
const SECTORS = ['Technology', 'Banking', 'Automobile', 'FMCG', 'Energy', 'Commodities', 'Conglomerate', 'Healthcare', 'Index', 'Crypto', 'Real Estate', 'Infrastructure', 'Unknown'];

const DEFAULT_BETAS: Record<string, number> = {
  Technology: 0.9, Banking: 1.0, Automobile: 1.4, FMCG: 0.6, Energy: 1.1,
  Commodities: 0.8, Conglomerate: 1.2, Healthcare: 0.7, Index: 1.0, Crypto: 2.0,
  'Real Estate': 0.9, Infrastructure: 0.8, Unknown: 1.0,
};

interface HoldingForm {
  symbol: string;
  name: string;
  asset_type: typeof ASSET_TYPES[number];
  quantity: string;
  avg_buy_price: string;
  current_price: string;
  sector: string;
}

const EMPTY_FORM: HoldingForm = {
  symbol: '', name: '', asset_type: 'stock', quantity: '', avg_buy_price: '', current_price: '', sector: 'Unknown',
};

export default function PortfolioView({ holdings, portfolioId, userId, onHoldingsChange }: PortfolioViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<HoldingForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const totalValue = holdings.reduce((sum, h) => sum + h.current_price * h.quantity, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.avg_buy_price * h.quantity, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  async function handleSave() {
    if (!form.symbol || !form.name || !form.quantity || !form.avg_buy_price || !form.current_price) {
      setError('Please fill all required fields');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      portfolio_id: portfolioId,
      user_id: userId,
      symbol: form.symbol.toUpperCase().trim(),
      name: form.name.trim(),
      asset_type: form.asset_type,
      quantity: parseFloat(form.quantity),
      avg_buy_price: parseFloat(form.avg_buy_price),
      current_price: parseFloat(form.current_price),
      sector: form.sector,
      beta: DEFAULT_BETAS[form.sector] ?? 1.0,
    };

    let err;
    if (editId) {
      ({ error: err } = await supabase.from('holdings').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editId));
    } else {
      ({ error: err } = await supabase.from('holdings').insert(payload));
    }

    if (err) {
      setError(err.message);
    } else {
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      onHoldingsChange();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('holdings').delete().eq('id', id);
    onHoldingsChange();
  }

  function handleEdit(h: Holding) {
    setForm({
      symbol: h.symbol,
      name: h.name,
      asset_type: h.asset_type,
      quantity: h.quantity.toString(),
      avg_buy_price: h.avg_buy_price.toString(),
      current_price: h.current_price.toString(),
      sector: h.sector,
    });
    setEditId(h.id);
    setShowForm(true);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">My Portfolio</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your holdings and track performance</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
          <Plus size={16} /> Add Holding
        </button>
      </div>

      {/* Summary */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Value', value: formatCurrency(totalValue) },
            { label: 'Total Invested', value: formatCurrency(totalCost) },
            { label: 'Overall P&L', value: `${formatCurrency(totalPnL)} (${formatPercent(totalPnLPct)})`, positive: totalPnL >= 0 },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className="text-xs text-slate-400 mb-1">{s.label}</div>
              <div className={`font-display font-bold text-lg ${s.positive === false ? 'text-red-400' : s.positive === true ? 'text-emerald-400' : 'text-white'}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-white">{editId ? 'Edit Holding' : 'Add New Holding'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Symbol *</label>
              <input className="input-field" placeholder="e.g. TCS" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Company Name *</label>
              <input className="input-field" placeholder="e.g. Tata Consultancy" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Asset Type</label>
              <select className="input-field" value={form.asset_type} onChange={e => setForm(f => ({ ...f, asset_type: e.target.value as typeof ASSET_TYPES[number] }))}>
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Sector</label>
              <select className="input-field" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Quantity *</label>
              <input className="input-field" type="number" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Avg Buy Price (₹) *</label>
              <input className="input-field" type="number" placeholder="0.00" value={form.avg_buy_price} onChange={e => setForm(f => ({ ...f, avg_buy_price: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Current Price (₹) *</label>
              <input className="input-field" type="number" placeholder="0.00" value={form.current_price} onChange={e => setForm(f => ({ ...f, current_price: e.target.value }))} />
            </div>
          </div>
          {error && <div className="mt-3 text-xs text-red-400">{error}</div>}
          <div className="flex gap-3 mt-5">
            <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
              <Check size={15} /> {saving ? 'Saving...' : editId ? 'Update' : 'Add Holding'}
            </button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      {holdings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-slate-500 text-4xl mb-4">📈</div>
          <h3 className="font-display font-semibold text-white mb-2">No holdings yet</h3>
          <p className="text-slate-400 text-sm">Start building your portfolio by adding your first holding above.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2d40]">
                  {['Symbol', 'Name', 'Sector', 'Qty', 'Avg Price', 'CMP', 'Value', 'P&L', 'P&L %', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d40]">
                {holdings.map(h => {
                  const value = h.current_price * h.quantity;
                  const pnl = (h.current_price - h.avg_buy_price) * h.quantity;
                  const pnlPct = ((h.current_price - h.avg_buy_price) / h.avg_buy_price) * 100;
                  return (
                    <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold"
                            style={{ background: `${getSectorColor(h.sector)}15`, color: getSectorColor(h.sector) }}>
                            {h.symbol.slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-white">{h.symbol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 max-w-[160px] truncate">{h.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${getSectorColor(h.sector)}15`, color: getSectorColor(h.sector) }}>
                          {h.sector}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{h.quantity}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">₹{h.avg_buy_price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">₹{h.current_price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-white">{formatCurrency(value)}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>{pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pnlPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {formatPercent(pnlPct)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(h)} className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors rounded hover:bg-cyan-500/10">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(h.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded hover:bg-red-500/10">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
