import React, { useState } from 'react';
import { DollarSign, Zap, Plus, ArrowUpRight, Sparkles, Target, RefreshCw, Trash2, Edit3, Check, X, Compass, Award } from 'lucide-react';
import { MonetizationStream, MonetizationCategory } from '../types';

interface MonetizationEngineViewProps {
  streams: MonetizationStream[];
  onAddStream: (stream: Omit<MonetizationStream, 'id'>) => void;
  onUpdateStream: (id: string, updated: Partial<MonetizationStream>) => void;
  onDeleteStream: (id: string) => void;
  onGenerateBlueprint: (params: { niche: string; currentIncome: number; targetIncome: number; existingAssets: string }) => Promise<string | null>;
  isGeneratingBlueprint: boolean;
}

export const MonetizationEngineView: React.FC<MonetizationEngineViewProps> = ({
  streams,
  onAddStream,
  onUpdateStream,
  onDeleteStream,
  onGenerateBlueprint,
  isGeneratingBlueprint,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [blueprintResult, setBlueprintResult] = useState<string | null>(null);

  // 72-Hour Emergency Cash Checklist
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    step1_bill_extension: false,
    step2_hr_advance: false,
    step3_gadget_valuation: false,
    step4_ewp_access: false,
  });

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // New stream state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MonetizationCategory>('saas');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [targetRevenue, setTargetRevenue] = useState('');
  const [growthRate, setGrowthRate] = useState('15');
  const [status, setStatus] = useState<'active' | 'scaling' | 'incubating'>('scaling');
  const [description, setDescription] = useState('');

  // Editing revenue inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRev, setEditRev] = useState('');

  // Blueprint form
  const [niche, setNiche] = useState('AI Automation & Agentic Software Solutions');
  const [customTarget, setCustomTarget] = useState('15000');
  const [skills, setSkills] = useState('Full stack coding, AI prompt engineering, client consulting, sales funnel creation');

  const totalMonthly = streams.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const totalTarget = streams.reduce((sum, s) => sum + s.targetMonthlyRevenue, 0) || 15000;
  const progressPercent = Math.min(100, Math.round((totalMonthly / totalTarget) * 100));

  const handleCreateStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !monthlyRevenue) return;

    onAddStream({
      name,
      category,
      monthlyRevenue: parseFloat(monthlyRevenue),
      targetMonthlyRevenue: parseFloat(targetRevenue) || parseFloat(monthlyRevenue) * 1.5,
      growthRate: parseFloat(growthRate) || 10,
      status,
      description,
    });

    setName('');
    setMonthlyRevenue('');
    setTargetRevenue('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleSaveInlineRev = (id: string) => {
    const val = parseFloat(editRev);
    if (!isNaN(val)) {
      onUpdateStream(id, { monthlyRevenue: val });
    }
    setEditingId(null);
  };

  const handleRunBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onGenerateBlueprint({
      niche,
      currentIncome: totalMonthly,
      targetIncome: parseFloat(customTarget) || 15000,
      existingAssets: skills,
    });
    if (result) {
      setBlueprintResult(result);
      setShowBlueprintModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f17]/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Money Monetization Engine
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                INCOME STREAMS ACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Architect and build scalable income flywheels with Vampiee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-red-950/50 transition-all cursor-pointer animate-pulse"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ 72h Cash Triage (1,000 AED)</span>
          </button>

          <button
            onClick={() => setShowBlueprintModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            Build Blueprint
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Stream
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Urgent 72h Emergency Cash Triage Alert Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900/90 to-amber-950/70 border border-red-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                URGENT: 1,000 AED in 3 Days (Bill Relief &amp; Cash Strategy)
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Facing immediate bills? The safest fast options in the UAE include <strong>Utility Installment / Extension requests</strong> (DEWA/Du/e&), <strong>same-day gadget cash-out</strong> (doorstep buyers in Dubai), and <strong>workplace salary advances</strong>.
            </p>
          </div>

          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Open 3-Day Action Plan</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        {/* Freedom Progress Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#161224] to-slate-950 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Monthly Freedom Milestone
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-extrabold text-white font-mono">
                  ${totalMonthly.toLocaleString()}/mo
                </span>
                <span className="text-sm text-slate-400 font-mono">
                  towards ${totalTarget.toLocaleString()}/mo goal
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block uppercase font-mono">Annualized Run Rate</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ${(totalMonthly * 12).toLocaleString()}/yr
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 font-mono">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>$0/mo (Base)</span>
              <span>$5,000/mo (Cover Survival)</span>
              <span>$10,000/mo (Location Freedom)</span>
              <span className="text-amber-400 font-bold">${totalTarget.toLocaleString()}/mo (Target)</span>
            </div>
          </div>
        </div>

        {/* Blueprint result display */}
        {blueprintResult && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white font-mono uppercase">
                  Vampiee Monetization Blueprint &amp; Revenue Action Plan
                </h4>
              </div>
              <button
                onClick={() => setBlueprintResult(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {blueprintResult}
            </div>
          </div>
        )}

        {/* Active Streams Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Active Monetization Streams ({streams.length})</h3>
            <span className="text-xs text-slate-400">Click monthly revenue to adjust</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streams.map((stream) => {
              const streamPct = stream.targetMonthlyRevenue > 0
                ? Math.min(100, Math.round((stream.monthlyRevenue / stream.targetMonthlyRevenue) * 100))
                : 100;
              const isEditing = editingId === stream.id;

              return (
                <div
                  key={stream.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{stream.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {stream.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stream.description}</p>
                    </div>

                    <button
                      onClick={() => onDeleteStream(stream.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove stream"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Revenue metrics */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Monthly Run Rate</span>
                      {isEditing ? (
                        <div className="flex items-center space-x-1 mt-1">
                          <input
                            type="number"
                            value={editRev}
                            onChange={(e) => setEditRev(e.target.value)}
                            className="w-24 px-2 py-1 bg-slate-950 border border-amber-500 rounded text-xs text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveInlineRev(stream.id)}
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-slate-700 text-slate-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(stream.id);
                            setEditRev(stream.monthlyRevenue.toString());
                          }}
                          className="text-lg font-extrabold text-white font-mono hover:text-amber-400 flex items-center gap-1 group cursor-pointer"
                        >
                          ${stream.monthlyRevenue.toLocaleString()}/mo
                          <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Monthly Target</span>
                      <span className="text-sm font-semibold text-slate-300 font-mono">
                        ${stream.targetMonthlyRevenue.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  {/* Stream mini progress */}
                  <div className="space-y-1 pt-1">
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${streamPct}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Status: <strong className="text-amber-300 uppercase">{stream.status}</strong></span>
                      <span className="text-emerald-400 font-semibold">+{stream.growthRate}% MoM growth</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Stream Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Monetization Stream</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStream} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Stream Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Customer Support Bot SaaS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MonetizationCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="saas">SaaS / App</option>
                    <option value="consulting">High-Ticket Consulting</option>
                    <option value="digital_product">Digital Products / Templates</option>
                    <option value="content">Content / Newsletter</option>
                    <option value="yield">Staking &amp; Dividend Yield</option>
                    <option value="affiliate">Software Affiliates</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Growth Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="incubating">Incubating (Launch Phase)</option>
                    <option value="scaling">Scaling ($1k-$5k/mo)</option>
                    <option value="active">Active &amp; Stable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Current Monthly Rev ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 2500"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Monthly Rev ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 5000"
                    value={targetRevenue}
                    onChange={(e) => setTargetRevenue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Brief Description</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly subscription for 15 dental clinic clients"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg cursor-pointer"
                >
                  Save Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Blueprint Modal */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  Vampiee Monetization Incubator
                </h3>
              </div>
              <button onClick={() => setShowBlueprintModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunBlueprint} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Niche or Business Model</label>
                <input
                  type="text"
                  required
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Monthly Income Goal ($)</label>
                <input
                  type="number"
                  required
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Your Skills, Assets, or Unfair Advantages</label>
                <textarea
                  rows={3}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBlueprintModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingBlueprint}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  {isGeneratingBlueprint ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Generate Blueprint
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 72-Hour Emergency Cash Triage Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Emergency 72h Cash Triage: 1,000 AED for Bills
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real, verified options in the UAE to bridge cash and protect your utilities
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Crucial Priority 1: Stop Disconnections Immediately */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Priority 1: Prevent Disconnections Today (Buy Time)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Do not wait for service disconnection. Utility providers and telecom operators in the UAE grant grace periods and installment arrangements if contacted prior to cutoff:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <strong className="text-white block font-mono">DEWA (Electricity &amp; Water):</strong>
                  <span className="text-slate-400 block text-[11px]">
                    Call <strong>04-601-9999</strong> or use DEWA Smart App &gt; Request Installment Plan to split the bill over monthly payments.
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <strong className="text-white block font-mono">Du / e&amp; (Etisalat):</strong>
                  <span className="text-slate-400 block text-[11px]">
                    Call <strong>155 (Du)</strong> or <strong>101 (e&amp;)</strong>. Request a payment promise or 7-day extension to keep mobile &amp; home Wi-Fi active.
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Real Ways to Raise 1,000 AED in 72 Hours */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Fastest Proven Ways to Obtain 1,000 AED (Legally &amp; Safely)
              </h4>

              {/* Method A: Doorstep Gadget Sale */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-emerald-400 font-bold">
                    1. Sell an Unused Gadget / Phone (Same-Day Doorstep Cash)
                  </strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Within 2–6 Hours
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  If you have an old smartphone, tablet, laptop, smartwatch, or console, specialized UAE buyers value it via WhatsApp and deliver cash directly to your door or in-store:
                </p>
                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                  <p>• <strong>Milaaj / Cash Your Gadget / Dofy:</strong> Send photos/specs on WhatsApp, get instant valuation, same-day cash pickup in Dubai.</p>
                  <p>• <strong>Cash Converters UAE:</strong> Physical store on Sheikh Zayed Road / Al Quoz paying instant cash on the spot for electronics.</p>
                  <p>• <strong>Dubizzle / Facebook Marketplace UAE:</strong> List slightly below market value for immediate cash collection.</p>
                </div>
              </div>

              {/* Method B: Employer Advance & WPS */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-blue-400 font-bold">
                    2. Employer HR Salary Advance or Earned Wage Access
                  </strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    24–48 Hours
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Most UAE employers provide emergency micro-advances (1,000 AED is standard) deducted from your next salary with 0% interest.
                </p>
                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                  <p>• <strong>Company HR / Finance:</strong> Submit a polite written request stating an emergency bill payment.</p>
                  <p>• <strong>FlexxPay / Abhi:</strong> If your company is partnered, withdraw already-worked wages instantly to your bank account.</p>
                  <p>• <strong>Al Ansari Exchange / Al Fardan:</strong> If paid via WPS, check the Send Now Pay Later (SNPL) or salary advance facility.</p>
                </div>
              </div>

              {/* Method C: Bank & Digital Wallet Micro-Facility */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-purple-400 font-bold">
                    3. Licensed Digital Bank &amp; Wallet Micro-Advances
                  </strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Same Day (Emirates ID)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>• <strong>e&amp; money (EasyCredit):</strong> Mobile microloan feature inside the e&amp; money app for UAE residents.</p>
                  <p>• <strong>Your Main Bank App:</strong> Banks like Mashreq, CBD, ADCB, and ENBD offer instant pre-approved mini salary advance lines with zero paperwork.</p>
                </div>
              </div>
            </div>

            {/* Interactive 3-Day Action Checklist */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Your 72-Hour Execution Checklist
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <label
                  onClick={() => toggleChecklist('step1_bill_extension')}
                  className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-900 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist.step1_bill_extension || false}
                    readOnly
                    className="accent-red-500 rounded"
                  />
                  <span className={checklist.step1_bill_extension ? 'line-through text-slate-500' : ''}>
                    Day 1: Call DEWA / Du / Etisalat to request an installment plan or 7-day payment extension.
                  </span>
                </label>

                <label
                  onClick={() => toggleChecklist('step2_hr_advance')}
                  className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-900 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist.step2_hr_advance || false}
                    readOnly
                    className="accent-red-500 rounded"
                  />
                  <span className={checklist.step2_hr_advance ? 'line-through text-slate-500' : ''}>
                    Day 1: Request a 1,000 AED salary advance from employer HR or check FlexxPay / WPS exchange house.
                  </span>
                </label>

                <label
                  onClick={() => toggleChecklist('step3_gadget_valuation')}
                  className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-900 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist.step3_gadget_valuation || false}
                    readOnly
                    className="accent-red-500 rounded"
                  />
                  <span className={checklist.step3_gadget_valuation ? 'line-through text-slate-500' : ''}>
                    Day 2: Value any unused smartphone, tablet, or gaming console for same-day cash pickup.
                  </span>
                </label>

                <label
                  onClick={() => toggleChecklist('step4_ewp_access')}
                  className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-900 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist.step4_ewp_access || false}
                    readOnly
                    className="accent-red-500 rounded"
                  />
                  <span className={checklist.step4_ewp_access ? 'line-through text-slate-500' : ''}>
                    Day 3: Settle the essential utility portion and retain official confirmation receipts.
                  </span>
                </label>
              </div>
            </div>

            {/* Critical Safety Warning */}
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-red-200 leading-relaxed">
              <strong>⚠️ Critical Warning:</strong> Strictly avoid informal lenders on social media (Facebook groups, TikTok, Telegram, or WhatsApp) offering "cash with passport hold" or "advance fee processing". These are illegal loan shark scams under UAE law that trap borrowers in severe debt. Only deal with licensed banks, your employer, or registered buyers.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
