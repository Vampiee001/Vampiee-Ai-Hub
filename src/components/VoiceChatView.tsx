import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, RefreshCw, Zap, Shield, TrendingUp, Layers, ChevronRight, Play } from 'lucide-react';
import { ChatMessage, InvestmentAsset, MonetizationStream, WorkProject, SyncedAIModel, AvatarStyle } from '../types';
import { VampieeOrb } from './VampieeOrb';
import { CartoonBatVampiee } from './CartoonBatVampiee';
import { AudioWaveform } from './AudioWaveform';
import { speechService } from '../utils/speech';

interface VoiceChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  portfolio: {
    totalNetWorth: number;
    change24h: string;
    allTimeGain: string;
  };
  monetization: {
    monthlyRevenue: number;
    targetRevenue: number;
    activeStreamsCount: number;
  };
  work: {
    activeProjectsCount: number;
    pendingTasksCount: number;
  };
  syncedAIs: SyncedAIModel[];
  avatarStyle?: AvatarStyle;
}

export const VoiceChatView: React.FC<VoiceChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isListening,
  isSpeaking,
  onToggleMic,
  onStopSpeaking,
  portfolio,
  monetization,
  work,
  syncedAIs,
  avatarStyle = 'cartoon',
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    onSendMessage(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    onSendMessage(suggestion);
  };

  const orbState = isListening
    ? 'listening'
    : isSpeaking
    ? 'speaking'
    : isLoading
    ? 'thinking'
    : 'idle';

  return (
    <div className="flex flex-col h-full bg-[#0d0f17]/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Top Header bar with live synchronized vital indicators */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-ping absolute inset-0 opacity-75" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block relative" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Vampiee Executive Terminal
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                CORE BRAIN ONLINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Desktop Voice Companion &amp; Multi-AI Orchestrator
            </p>
          </div>
        </div>

        {/* Live synced state pills */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Net Worth:</span>
            <span className="font-semibold text-white font-mono">
              ${portfolio.totalNetWorth.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Monetization:</span>
            <span className="font-semibold text-white font-mono">
              ${monetization.monthlyRevenue.toLocaleString()}/mo
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Synced AIs:</span>
            <span className="font-semibold text-indigo-300 font-mono">
              {syncedAIs.length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Main interactive area: split into Avatar/Voice stage & Conversation scroll */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Vampiee Avatar & Voice HUD Banner */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 via-[#131522] to-slate-950 border border-slate-800 shadow-xl overflow-hidden">
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e11d4815_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {avatarStyle === 'cartoon' ? (
                <CartoonBatVampiee
                  state={orbState}
                  size="lg"
                  onClick={onToggleMic}
                  showStatusLabel={false}
                />
              ) : (
                <VampieeOrb
                  state={orbState}
                  size="lg"
                  onClick={onToggleMic}
                  showStatusLabel={false}
                />
              )}
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-extrabold text-white tracking-wide">
                    VAMPIEE
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    v2.6 Synchronized
                  </span>
                </div>
                <p className="text-sm text-slate-300 max-w-md">
                  {isListening
                    ? 'Listening through your laptop microphone... speak your command now.'
                    : isSpeaking
                    ? 'Speaking response to you...'
                    : isLoading
                    ? 'Synthesizing market data & querying synced neural nodes...'
                    : 'Click the desktop orb or microphone to speak. I manage your investments, income growth, and work in real time.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <AudioWaveform isActive={isListening || isSpeaking} type={isListening ? 'listening' : 'speaking'} />

                  {isSpeaking && (
                    <button
                      onClick={onStopSpeaking}
                      className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      Mute Voice
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Voice Command Triggers */}
            <div className="flex flex-col gap-2 w-full md:w-auto min-w-[220px]">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Voice Invocations
              </span>
              <button
                onClick={() => handleSuggestionClick("Vampiee, give me a complete executive update on my investments and work")}
                className="text-left text-xs px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-200 border border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>🎙️ "Full Executive Briefing"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
              </button>
              <button
                onClick={() => handleSuggestionClick("Vampiee, analyze how to scale my monthly monetization to $15,000")}
                className="text-left text-xs px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 hover:border-amber-500/40 text-slate-200 border border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>💰 "Scale to $15k/mo Revenue"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
              </button>
              <button
                onClick={() => handleSuggestionClick("Vampiee, dispatch daily priorities across all synced AIs")}
                className="text-left text-xs px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-500/20 hover:border-indigo-500/40 text-slate-200 border border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>⚡ "Sync Daily Work Fleet"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              </button>
              <button
                onClick={() => handleSuggestionClick("Vampiee, I urgently need 1000 AED in 3 days to pay our bills. What is our fastest, safest step-by-step action plan in the UAE?")}
                className="text-left text-xs px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:border-red-500/40 text-slate-200 border border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>🚨 "1,000 AED Bill Triage"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-700 flex-shrink-0 flex items-center justify-center shadow-lg shadow-rose-950/50 border border-rose-500/40">
                    <span className="text-white font-extrabold text-xs">V</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                    isUser
                      ? 'bg-rose-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 gap-4">
                    <span className={`text-[11px] font-bold ${isUser ? 'text-rose-100' : 'text-rose-400'}`}>
                      {isUser ? 'You' : 'Vampiee AI'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => speechService.speak(msg.spokenSummary || msg.text)}
                          title="Speak answer aloud"
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Render content */}
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Interactive suggested chips from Vampiee */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(sug)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/20 hover:border-rose-500/50 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-rose-400" />
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 text-xs font-bold">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-700 flex-shrink-0 flex items-center justify-center shadow-lg border border-rose-500/40 animate-pulse">
                <span className="text-white font-extrabold text-xs">V</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-300 flex items-center space-x-3">
                <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                <span className="text-xs text-slate-400">Vampiee is consulting memory and calculating strategy...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice recognition (speak with Vampiee)'}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening to your speech...' : 'Speak or type to Vampiee (e.g., "Check portfolio", "Add $1k to SaaS MRR", "Sync models")...'}
              className="w-full px-4 py-3.5 bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-3.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">COMMAND</span>
          </button>
        </form>
      </div>
    </div>
  );
};
