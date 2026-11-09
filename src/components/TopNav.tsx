import React, { useState } from 'react';
import {
  MessageSquare,
  Heart,
  Layers,
  TrendingUp,
  Zap,
  Briefcase,
  Users,
  Music,
  Monitor,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Download,
  HelpCircle,
  X,
  LineChart,
} from 'lucide-react';
import { ActiveTab, ViewMode, AvatarStyle } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isListening: boolean;
  onToggleMic: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  portfolioNetWorth: number;
  monthlyRevenue: number;
  avatarStyle: AvatarStyle;
  onToggleAvatarStyle: (style: AvatarStyle) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  isListening,
  onToggleMic,
  isSpeaking,
  onStopSpeaking,
  portfolioNetWorth,
  monthlyRevenue,
  avatarStyle,
  onToggleAvatarStyle,
}) => {
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'chat', label: 'Voice & Terminal', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'apps', label: 'Trading & Apps', icon: <LineChart className="w-4 h-4 text-emerald-400" />, badge: 'Live Real' },
    { id: 'music', label: 'Daily Music & Spotify', icon: <Music className="w-4 h-4 text-rose-400" />, badge: 'Studio' },
    { id: 'contacts', label: 'Google Contacts', icon: <Users className="w-4 h-4" />, badge: 'OAuth' },
    { id: 'mind_sync', label: 'Wants, Needs & Mind', icon: <Heart className="w-4 h-4" /> },
    { id: 'ai_sync', label: 'AI Sync Grid', icon: <Layers className="w-4 h-4" />, badge: '6 AIs' },
    { id: 'investments', label: 'Investment Vault', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'monetization', label: 'Monetization Engine', icon: <Zap className="w-4 h-4" /> },
    { id: 'work', label: 'Work & Calendar', icon: <Briefcase className="w-4 h-4" />, badge: 'Calendar' },
  ];

  return (
    <header className="px-6 py-3.5 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 z-40 select-none">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3">
        <div
          onClick={() => onViewModeChange('desktop_overlay')}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-slate-900 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-950/50 cursor-pointer group hover:scale-105 transition-all"
          title="Click to switch to Floating Desktop Companion"
        >
          <span className="text-lg">🦇</span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-wider flex items-center gap-1.5">
              VAMPIEE
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                DESKTOP COMPANION
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400">
            Multi-AI Synchronizer • Personal Mind Sync • Wealth &amp; Work
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <nav className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Avatar Style, Install button, Mode switcher & Voice status */}
      <div className="flex items-center space-x-2.5">
        {/* Cartoon vs Orb Toggle */}
        <div className="hidden sm:flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => onToggleAvatarStyle('cartoon')}
            className={`px-2 py-1 rounded cursor-pointer transition-colors ${
              avatarStyle === 'cartoon' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Animated Cartoon Bat"
          >
            🦇 Cartoon
          </button>
          <button
            onClick={() => onToggleAvatarStyle('orb')}
            className={`px-2 py-1 rounded cursor-pointer transition-colors ${
              avatarStyle === 'orb' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Cybernetic Core Orb"
          >
            🔮 Orb
          </button>
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Quick mic toggle */}
        <button
          onClick={onToggleMic}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
          }`}
          title={isListening ? 'Listening... click to stop' : 'Click to speak to Vampiee'}
        >
          {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isListening ? 'Listening' : 'Speak'}</span>
        </button>

        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="p-2 rounded-xl bg-slate-800 text-rose-300 border border-rose-500/30 hover:bg-slate-700 cursor-pointer"
            title="Mute speaking voice"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
        )}

        {/* View Mode Switcher: Desktop Overlay vs Full Studio */}
        <button
          onClick={() => onViewModeChange(viewMode === 'studio' ? 'desktop_overlay' : 'studio')}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Toggle Desktop Icon Overlay Mode"
        >
          <Monitor className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">
            {viewMode === 'studio' ? 'Desktop Overlay Icon' : 'Studio Mode'}
          </span>
        </button>
      </div>
    </header>
  );
};
