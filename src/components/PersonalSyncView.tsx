import React, { useState } from 'react';
import { Heart, Brain, Sparkles, Plus, Trash2, CheckCircle, RefreshCw, Smile, BatteryCharging, AlertCircle, MessageSquare } from 'lucide-react';
import { PersonalSyncState } from '../types';

interface PersonalSyncViewProps {
  personalSync: PersonalSyncState;
  onUpdatePersonalSync: (updated: Partial<PersonalSyncState>) => void;
  onAskVampieeReflection: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export const PersonalSyncView: React.FC<PersonalSyncViewProps> = ({
  personalSync,
  onUpdatePersonalSync,
  onAskVampieeReflection,
  isLoading,
}) => {
  const [newWant, setNewWant] = useState('');
  const [newNeed, setNewNeed] = useState('');
  const [thoughtsInput, setThoughtsInput] = useState(personalSync.thoughts || '');
  const [syncedAlert, setSyncedAlert] = useState(false);

  const moodOptions = [
    { label: 'Inspired', emoji: '✨', color: 'from-amber-500 to-rose-500' },
    { label: 'Focused', emoji: '🎯', color: 'from-purple-500 to-indigo-500' },
    { label: 'Energized', emoji: '⚡', color: 'from-emerald-500 to-teal-500' },
    { label: 'Calm', emoji: '🌿', color: 'from-blue-500 to-cyan-500' },
    { label: 'Overwhelmed', emoji: '🌊', color: 'from-orange-500 to-rose-500' },
    { label: 'Reflective', emoji: '🌙', color: 'from-indigo-500 to-slate-500' },
  ];

  const handleAddWant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWant.trim()) return;
    onUpdatePersonalSync({
      wants: [...personalSync.wants, newWant.trim()],
      lastUpdated: 'Just now',
    });
    setNewWant('');
  };

  const handleDeleteWant = (index: number) => {
    const updated = personalSync.wants.filter((_, i) => i !== index);
    onUpdatePersonalSync({ wants: updated });
  };

  const handleAddNeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeed.trim()) return;
    onUpdatePersonalSync({
      needs: [...personalSync.needs, newNeed.trim()],
      lastUpdated: 'Just now',
    });
    setNewNeed('');
  };

  const handleDeleteNeed = (index: number) => {
    const updated = personalSync.needs.filter((_, i) => i !== index);
    onUpdatePersonalSync({ needs: updated });
  };

  const handleSaveThoughts = () => {
    onUpdatePersonalSync({
      thoughts: thoughtsInput,
      lastUpdated: 'Just now',
    });
    setSyncedAlert(true);
    setTimeout(() => setSyncedAlert(false), 2500);
  };

  const handleAskVampieeAboutThoughts = () => {
    const query = `Based on what I want (${personalSync.wants.join(', ')}), what I need (${personalSync.needs.join(', ')}), my current mood (${personalSync.currentMood}, Energy: ${personalSync.energyLevel}/10), and my recent thoughts ("${thoughtsInput}"), provide a grounded, actionable reflection and prioritize what I should focus on next.`;
    onAskVampieeReflection(query);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f17]/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Personal Sync: Wants, Needs, Feelings &amp; Mind
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                USER PROFILE SYNC
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Share your explicit priorities, mood, and mental state so Vampiee can support you accurately
            </p>
          </div>
        </div>

        <button
          onClick={handleAskVampieeAboutThoughts}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/40 cursor-pointer transition-all mt-2 sm:mt-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Vampiee to Align With My Mind</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Reality-Grounded Transparency Notice */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">How Vampiee synchronizes with you:</strong>{' '}
            As an AI program running on your laptop, Vampiee cannot read your thoughts or feelings directly without your input. By explicitly logging what you want, what you need, and what's on your mind below, you give Vampiee the exact context it needs to tailor advice, investments, and work to your declared state.
          </div>
        </div>

        {/* Section 1: Mood & Energy Level */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smile className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">How I Feel Right Now</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Current: <strong className="text-rose-400">{personalSync.currentMood}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {moodOptions.map((mood) => {
              const isSelected = personalSync.currentMood === mood.label;
              return (
                <button
                  key={mood.label}
                  onClick={() => onUpdatePersonalSync({ currentMood: mood.label })}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-xs font-semibold">{mood.label}</span>
                </button>
              );
            })}
          </div>

          {/* Energy Level Slider */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Energy Level
              </span>
              <span className="font-mono text-emerald-400 font-bold">{personalSync.energyLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={personalSync.energyLevel}
              onChange={(e) => onUpdatePersonalSync({ energyLevel: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Section 2: Wants & Needs (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What I Want */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="text-rose-400 font-black">★</span> What I Want (Goals &amp; Desires)
              </h3>
              <span className="text-xs text-slate-400 font-mono">{personalSync.wants.length} logged</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {personalSync.wants.map((want, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200"
                >
                  <span>{want}</span>
                  <button
                    onClick={() => handleDeleteWant(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddWant} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add what you want (e.g. $15k/mo recurring revenue)..."
                value={newWant}
                onChange={(e) => setNewWant(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* What I Need */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="text-amber-400 font-black">▲</span> What I Need (Essentials &amp; Foundation)
              </h3>
              <span className="text-xs text-slate-400 font-mono">{personalSync.needs.length} logged</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {personalSync.needs.map((need, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200"
                >
                  <span>{need}</span>
                  <button
                    onClick={() => handleDeleteNeed(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNeed} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add what you need (e.g. Uninterrupted focus time)..."
                value={newNeed}
                onChange={(e) => setNewNeed(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Section 3: What I'm Thinking (Mental Notes & Reflections) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">What I'm Thinking (Mental Notes &amp; Thoughts)</h3>
            </div>
            {syncedAlert && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Thoughts Synced!
              </span>
            )}
          </div>

          <textarea
            rows={4}
            value={thoughtsInput}
            onChange={(e) => setThoughtsInput(e.target.value)}
            placeholder="Type what is on your mind right now—your current thoughts, ideas, questions, or doubts. Vampiee keeps this in memory to tailor every piece of advice to your real mindset."
            className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 text-xs leading-relaxed"
          />

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-slate-500 font-mono">
              Auto-included in Vampiee's executive context
            </span>
            <button
              onClick={handleSaveThoughts}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Save Thoughts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
