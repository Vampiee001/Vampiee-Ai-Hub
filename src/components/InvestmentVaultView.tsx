import React, { useState } from 'react';
import { TrendingUp, Plus, Trash2, Edit3, ShieldAlert, Sparkles, PieChart, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, Check, X } from 'lucide-react';
import { InvestmentAsset, AssetType } from '../types';

interface InvestmentVaultViewProps {
  assets: InvestmentAsset[];
  onAddAsset: (asset: Omit<InvestmentAsset, 'id'>) => void;
  onUpdateAsset: (id: string, updated: Partial<InvestmentAsset>) => void;
  onDeleteAsset: (id: string) => void;
  onAuditPortfolio: () => Promise<string | null>;
  isAuditing: boolean;
}

export const InvestmentVaultView: React.FC<InvestmentVaultViewProps> = ({
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onAuditPortfolio,
  isAuditing,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  // New Asset Form State
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('crypto');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [notes, setNotes] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  // Calculations
  const totalValue = assets.reduce(
    (sum, a) => sum + a.quantity * a.currentPrice,
    0
  );
  const totalCost = assets.reduce(
    (sum, a) => sum + a.quantity * a.buyPrice,
    0
  );
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // Breakdown by type
  const typeBreakdown = assets.reduce((acc, a) => {
    const val = a.quantity * a.currentPrice;
    acc[a.type] = (acc[a.type] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !name || !quantity || !currentPrice) return;

    onAddAsset({
      symbol: symbol.toUpperCase(),
      name,
      type,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice) || parseFloat(currentPrice),
      currentPrice: parseFloat(currentPrice),
      change24h: +(Math.random() * 6 - 2).toFixed(1),
      notes,
    });

    // Reset
    setSymbol('');
    setName('');
    setQuantity('');
    setBuyPrice('');
    setCurrentPrice('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleStartEdit = (asset: InvestmentAsset) => {
    setEditingId(asset.id);
    setEditPrice(asset.currentPrice.toString());
  };

  const handleSaveEdit = (id: string) => {
    const newPrice = parseFloat(editPrice);
    if (!isNaN(newPrice)) {
      onUpdateAsset(id, { currentPrice: newPrice });
    }
    setEditingId(null);
  };

  const handleRunAudit = async () => {
    const result = await onAuditPortfolio();
    if (result) {
      setAuditResult(result);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f17]/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Investment Wealth Vault
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                LIVE ASSET TRACKING
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronized with Vampiee for continuous yield &amp; risk optimization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isAuditing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            )}
            Audit Risk with Vampiee
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Net Worth
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <ArrowUpRight className="w-3 h-3" /> Real-time aggregate holdings
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              All-Time Profit
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className={`text-2xl font-extrabold font-mono ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                ({totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Cost Basis: ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Liquid Cash Reserve
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-indigo-300 font-mono">
                ${(typeBreakdown['cash'] || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <span className="text-[11px] text-indigo-400 mt-1 block">
              Emergency buffer &amp; dip-buying capital
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Vampiee Health Score
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                92 / 100
              </span>
            </div>
            <span className="text-[11px] text-amber-300/80 mt-1 block">
              High growth profile with cash hedge
            </span>
          </div>
        </div>

        {/* Asset Allocation Bar */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-rose-400" /> Asset Allocation Distribution
            </span>
            <span className="text-slate-400 font-mono">{assets.length} Holdings</span>
          </div>

          {/* Multi-segment progress bar */}
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
            {Object.entries(typeBreakdown).map(([t, val]) => {
              const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
              const color =
                t === 'crypto'
                  ? 'bg-amber-500'
                  : t === 'stock'
                  ? 'bg-rose-500'
                  : t === 'etf'
                  ? 'bg-indigo-500'
                  : t === 'cash'
                  ? 'bg-emerald-500'
                  : 'bg-purple-500';

              return (
                <div
                  key={t}
                  style={{ width: `${pct}%` }}
                  className={`${color} h-full transition-all duration-500`}
                  title={`${t.toUpperCase()}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>

          {/* Allocation Legends */}
          <div className="flex flex-wrap gap-4 pt-1 text-xs">
            {Object.entries(typeBreakdown).map(([t, val]) => {
              const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
              const dotColor =
                t === 'crypto'
                  ? 'bg-amber-500'
                  : t === 'stock'
                  ? 'bg-rose-500'
                  : t === 'etf'
                  ? 'bg-indigo-500'
                  : t === 'cash'
                  ? 'bg-emerald-500'
                  : 'bg-purple-500';
              return (
                <div key={t} className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  <span className="capitalize text-slate-300 font-medium">{t}:</span>
                  <span className="font-mono text-white font-semibold">${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className="text-slate-400 font-mono">({pct.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Audit Result if triggered */}
        {auditResult && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-rose-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-bold text-white font-mono uppercase">
                  Vampiee Financial Audit &amp; Rebalancing Directives
                </h4>
              </div>
              <button
                onClick={() => setAuditResult(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {auditResult}
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Your Integrated Holdings</h3>
            <span className="text-xs text-slate-400">Click any price to edit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Asset</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Holdings</th>
                  <th className="px-6 py-3.5 text-right">Current Price</th>
                  <th className="px-6 py-3.5 text-right">Total Value</th>
                  <th className="px-6 py-3.5 text-right">Gain / Loss</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assets.map((asset) => {
                  const val = asset.quantity * asset.currentPrice;
                  const cost = asset.quantity * asset.buyPrice;
                  const gain = val - cost;
                  const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
                  const isEditing = editingId === asset.id;

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white font-mono">
                            {asset.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{asset.symbol}</span>
                            <span className="text-slate-400 text-[11px]">{asset.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {asset.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-slate-200">
                        {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-slate-200">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-1">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 px-2 py-1 bg-slate-950 border border-rose-500 rounded text-right text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(asset.id)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(asset)}
                            className="hover:text-rose-400 flex items-center justify-end gap-1 ml-auto group cursor-pointer"
                          >
                            <span>${asset.currentPrice.toLocaleString()}</span>
                            <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-bold text-white text-sm">
                        ${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>

                      <td className="px-6 py-4 text-right font-mono">
                        <div className={`font-semibold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {gain >= 0 ? '+' : ''}${gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className={`text-[10px] ${gainPct >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                          {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Investment Asset</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Symbol / Ticker</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTC, NVDA"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssetType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="crypto">Crypto</option>
                    <option value="stock">Stock</option>
                    <option value="etf">ETF / Index Fund</option>
                    <option value="cash">Liquid Cash / Treasury</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="private_equity">Private Equity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ethereum, Microsoft Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Quantity Held</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 2.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Current Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 3400"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Buy Price ($) (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Defaults to current price"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Strategic Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DCA every Monday, Staked on Lido"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
