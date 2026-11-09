import React, { useState } from 'react';
import { Layers, Cpu, Radio, Sparkles, Send, CheckCircle2, ArrowRight, ShieldCheck, Database, RefreshCw, Zap, Server, Globe } from 'lucide-react';
import { SyncedAIModel } from '../types';

interface AISyncHubViewProps {
  syncedAIs: SyncedAIModel[];
  onToggleSync: (id: string) => void;
  onDispatchMission: (objective: string, selectedModelNames: string[]) => Promise<string | null>;
  isDispatching: boolean;
  portfolioNetWorth: number;
  monthlyRevenue: number;
}

export const AISyncHubView: React.FC<AISyncHubViewProps> = ({
  syncedAIs,
  onToggleSync,
  onDispatchMission,
  isDispatching,
  portfolioNetWorth,
  monthlyRevenue,
}) => {
  const [objective, setObjective] = useState('');
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(
    syncedAIs.map((m) => m.name)
  );
  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'dispatcher' | 'memory'>('dispatcher');
  const [memorySynced, setMemorySynced] = useState(true);

  const handleToggleModelSelection = (name: string) => {
    if (selectedModels.includes(name)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter((n) => n !== name));
      }
    } else {
      setSelectedModels([...selectedModels, name]);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim() || isDispatching) return;
    const result = await onDispatchMission(objective, selectedModels);
    if (result) {
      setDispatchResult(result);
    }
  };

  const handleQuickTemplate = (template: string) => {
    setObjective(template);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f17]/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Multi-AI Synchronization Grid
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {syncedAIs.filter((m) => m.status !== 'standby').length}/{syncedAIs.length} NODES SYNCED
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Vampiee acts as Commander &amp; Context Router across all your AI models
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 mt-2 sm:mt-0">
          <button
            onClick={() => setActiveSubTab('dispatcher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'dispatcher'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Cross-AI Dispatcher
          </button>
          <button
            onClick={() => setActiveSubTab('fleet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'fleet'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 Connected Fleet ({syncedAIs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('memory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'memory'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧠 Shared Memory Vault
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeSubTab === 'dispatcher' && (
          <div className="space-y-6">
            {/* Mission input card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#121422] to-slate-950 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white">
                    Vampiee Fleet Mission Dispatcher
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Select which synced AIs contribute to this operation
                </span>
              </div>

              {/* Models selection chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {syncedAIs.map((ai) => {
                  const isSelected = selectedModels.includes(ai.name);
                  return (
                    <button
                      key={ai.id}
                      onClick={() => handleToggleModelSelection(ai.name)}
                      className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 text-white border-rose-500/50 shadow-[0_0_12px_rgba(225,29,72,0.2)]'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span className="font-medium">{ai.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({ai.role.split(' ')[0]})</span>
                    </button>
                  );
                })}
              </div>

              {/* Input Form */}
              <form onSubmit={handleDispatch} className="space-y-3">
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Describe your multi-AI mission (e.g. 'Synthesize a high-ticket AI consulting offer, validate competitive pricing with Perplexity, write the sales letter with Claude, and architect the backend schema with GPT-4o')..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-slate-400 flex items-center">Presets:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickTemplate("Architect a $10,000/mo AI Automation Micro-SaaS: Claude drafts the value proposition, GPT designs the tech architecture, Gemini plans the pricing tiers, and Perplexity benchmarks competitors.")}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
                    >
                      💡 Micro-SaaS Launch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTemplate("Evaluate my current $184,520 portfolio risk against macro tech trends, propose hedges with local Ollama privacy, and synthesize action steps.")}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
                    >
                      📈 Portfolio Macro Hedge
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTemplate("Sync our pending client deliverables for Nexus Financials: delegate API review to GPT, whitepaper to Claude, and project timeline to Vampiee.")}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
                    >
                      ⚡ Sprint Task Delegation
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!objective.trim() || isDispatching}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
                  >
                    {isDispatching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Synchronizing Fleet...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-rose-200" />
                        <span>Dispatch Across {selectedModels.length} AIs</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Orchestrated Master Plan Result */}
            {dispatchResult && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Vampiee Unified Synthesis Report
                    </h4>
                  </div>
                  <span className="text-xs text-indigo-300 font-mono">
                    {selectedModels.length} Models Orchestrated
                  </span>
                </div>

                <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-950/60 p-5 rounded-xl border border-slate-800/70">
                  {dispatchResult}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'fleet' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Connected AI Engines</h3>
                <p className="text-xs text-slate-400">
                  Each AI is registered with Vampiee for seamless role routing and data synchronization.
                </p>
              </div>
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Continuous Sync Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syncedAIs.map((ai) => {
                const isOnline = ai.status !== 'standby';
                return (
                  <div
                    key={ai.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${ai.avatarColor} flex items-center justify-center font-bold text-white text-xs shadow-md`}>
                          {ai.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{ai.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                              {ai.provider}
                            </span>
                          </div>
                          <p className="text-xs text-rose-400 font-medium">{ai.role}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleSync(ai.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium border transition-colors cursor-pointer ${
                          isOnline
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {isOnline ? 'SYNCED' : 'PAUSED'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ai.specialty}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Latency: <strong className="text-slate-200">{ai.latencyMs}ms</strong></span>
                      <span>Context: <strong className="text-slate-200">{(ai.contextTokens / 1000).toFixed(0)}k tokens</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === 'memory' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">
                    Synchronized Master Context Vault
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setMemorySynced(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-Broadcast Context to All AIs
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Whenever you speak to Vampiee or dispatch a mission, this unified memory payload is automatically embedded into every connected model, ensuring none of your AIs hallucinate or forget your active wealth figures, projects, or goals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Synced Wealth Memory</span>
                  <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
                    ${portfolioNetWorth.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-slate-400">6 Real-time Asset Classes</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Synced Revenue Velocity</span>
                  <p className="text-lg font-bold text-amber-400 font-mono mt-1">
                    ${monthlyRevenue.toLocaleString()}/mo
                  </p>
                  <span className="text-[11px] text-slate-400">5 Active Monetizations</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Security &amp; Encryption</span>
                  <p className="text-lg font-bold text-indigo-400 font-mono mt-1">
                    AES-256 Vault
                  </p>
                  <span className="text-[11px] text-slate-400">Zero Leakage Protocol</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
