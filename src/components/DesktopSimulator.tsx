import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Maximize2,
  Sparkles,
  TrendingUp,
  Zap,
  Briefcase,
  Volume2,
  VolumeX,
  Layers,
  X,
  Move,
  ChevronRight,
  Smile,
  Play,
  Pause,
  Music,
  ExternalLink,
  LineChart,
  Grid,
  Radio,
  ArrowUpRight,
  Globe,
  Compass,
} from 'lucide-react';
import { VampieeOrb } from './VampieeOrb';
import { CartoonBatVampiee } from './CartoonBatVampiee';
import { AudioWaveform } from './AudioWaveform';
import { PWAInstallButton } from './PWAInstallButton';
import { SyncedAIModel, AvatarStyle, PersonalSyncState, ActiveTab, ConnectedAppItem } from '../types';
import { speechService } from '../utils/speech';

interface DesktopSimulatorProps {
  onOpenStudio: () => void;
  onOpenTab?: (tab: ActiveTab) => void;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  lastReply: string;
  onSpeakCommand: (cmd: string) => void;
  isLoading: boolean;
  portfolioNetWorth: number;
  monthlyRevenue: number;
  pendingTasksCount: number;
  syncedAIs: SyncedAIModel[];
  avatarStyle: AvatarStyle;
  onToggleAvatarStyle: (style: AvatarStyle) => void;
  personalSync: PersonalSyncState;
  connectedApps?: ConnectedAppItem[];
  onOpenApp?: (app: ConnectedAppItem) => void;
}

export const DesktopSimulator: React.FC<DesktopSimulatorProps> = ({
  onOpenStudio,
  onOpenTab,
  isListening,
  isSpeaking,
  onToggleMic,
  onStopSpeaking,
  lastReply,
  onSpeakCommand,
  isLoading,
  portfolioNetWorth,
  monthlyRevenue,
  pendingTasksCount,
  syncedAIs,
  avatarStyle,
  onToggleAvatarStyle,
  personalSync,
  connectedApps = [],
  onOpenApp,
}) => {
  const [wallpaperTheme, setWallpaperTheme] = useState<'cyber' | 'obsidian' | 'nebula'>('cyber');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRoaming, setIsRoaming] = useState(false);
  const [roamPos, setRoamPos] = useState({ x: 0, y: 0 });

  // Floating roaming animation for cartoon character
  useEffect(() => {
    if (!isRoaming) {
      setRoamPos({ x: 0, y: 0 });
      return;
    }

    const interval = setInterval(() => {
      // Gentle drift coordinates
      const randomX = Math.sin(Date.now() / 1500) * 120;
      const randomY = Math.cos(Date.now() / 1200) * 60;
      setRoamPos({ x: randomX, y: randomY });
    }, 100);

    return () => clearInterval(interval);
  }, [isRoaming]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isLoading) return;
    onSpeakCommand(customPrompt);
    setCustomPrompt('');
  };

  const orbState = isListening
    ? 'listening'
    : isSpeaking
    ? 'speaking'
    : isLoading
    ? 'thinking'
    : 'idle';

  const wallpapers = {
    cyber: 'bg-gradient-to-tr from-[#090b14] via-[#120a1f] to-[#04060d]',
    obsidian: 'bg-gradient-to-b from-[#0b0f19] via-[#090d16] to-[#05070a]',
    nebula: 'bg-gradient-to-br from-[#190924] via-[#0d0918] to-[#030611]',
  };

  const LIVE_MINI_TICKERS = [
    { symbol: 'BTC', price: '$87,420', change: '+3.4%' },
    { symbol: 'ETH', price: '$3,382', change: '+2.1%' },
    { symbol: 'GOLD', price: '$2,724', change: '+0.6%' },
    { symbol: 'AED', price: '0.2723', change: '3.6725' },
    { symbol: 'SOL', price: '$189', change: '+5.8%' },
  ];

  const handleAppClick = (app: ConnectedAppItem) => {
    if (onOpenApp) {
      onOpenApp(app);
    } else {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderAppIcon = (iconType: string) => {
    switch (iconType) {
      case 'tradingview':
        return <LineChart className="w-5 h-5 text-blue-400" />;
      case 'binance':
        return <span className="text-base font-bold text-amber-400">🔶</span>;
      case 'bybit':
        return <span className="text-base font-bold text-amber-300">⚡</span>;
      case 'dexscreener':
        return <span className="text-base font-bold text-emerald-400">🦅</span>;
      case 'metatrader':
        return <TrendingUp className="w-5 h-5 text-cyan-400" />;
      case 'uniswap':
        return <span className="text-base font-bold text-pink-400">🦄</span>;
      case 'coinbase':
        return <span className="text-base font-bold text-blue-500">🔵</span>;
      case 'calendar':
        return <span className="text-base font-bold text-blue-400">📅</span>;
      case 'contacts':
        return <span className="text-base font-bold text-emerald-400">👥</span>;
      case 'spotify':
        return <span className="text-base font-bold text-emerald-400">🟢</span>;
      case 'tiktok':
        return <span className="text-base font-bold text-rose-500">🎬</span>;
      case 'gmail':
        return <span className="text-base font-bold text-red-400">✉️</span>;
      case 'github':
        return <span className="text-base font-bold text-slate-200">🐙</span>;
      default:
        return <Globe className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className={`relative w-full h-full ${wallpapers[wallpaperTheme]} overflow-hidden select-none flex flex-col justify-between font-sans`}>
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(225,29,72,0.12),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.1),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top OS Desktop Menu Bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-2.5 bg-black/40 backdrop-blur-md border-b border-white/10 text-xs text-slate-300">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 font-bold text-white tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span>VAMPIEE OS</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden lg:inline">Desktop Companion</span>

          {/* Live Mini Trading Ticker */}
          <div className="hidden sm:flex items-center space-x-3 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE:
            </span>
            {LIVE_MINI_TICKERS.map((t) => (
              <span
                key={t.symbol}
                onClick={() => {
                  if (onOpenTab) {
                    onOpenTab('apps');
                    onOpenStudio();
                  }
                }}
                className="cursor-pointer hover:text-white transition-colors"
                title="Open Trading Suite"
              >
                <span className="text-slate-400">{t.symbol}</span>{' '}
                <span className="font-bold text-slate-200">{t.price}</span>{' '}
                <span className="text-emerald-400 text-[10px]">{t.change}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Avatar Style Switcher (Cartoon vs Orb) */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => onToggleAvatarStyle('cartoon')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                avatarStyle === 'cartoon' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🦇 Cartoon Bat
            </button>
            <button
              onClick={() => onToggleAvatarStyle('orb')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                avatarStyle === 'orb' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔮 Cyber Orb
            </button>
          </div>

          {/* Roaming Movement Toggle */}
          <button
            onClick={() => setIsRoaming(!isRoaming)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
              isRoaming
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle moving animated roaming across your desktop screen"
          >
            {isRoaming ? '✨ Roaming: ON' : '⏸ Roaming: OFF'}
          </button>

          {/* PWA Install Button right in top bar */}
          <PWAInstallButton />

          <button
            onClick={onOpenStudio}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-950 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Open Full Studio
          </button>
        </div>
      </div>

      {/* Desktop Workspace: Real Apps Shortcuts on Desktop Background */}
      <div className="relative z-10 flex-1 p-6 flex flex-col justify-between pointer-events-auto">
        {/* Left Desktop Grid of Real Apps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-2xl">
          {/* Preset / Pinned Apps */}
          {connectedApps.slice(0, 8).map((app) => (
            <div
              key={app.id}
              onClick={() => handleAppClick(app)}
              className="p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/60 hover:border-rose-500/50 backdrop-blur-sm cursor-pointer transition-all group flex flex-col items-center text-center space-y-1.5 hover:scale-105 shadow-sm"
              title={`Click to launch ${app.name} (${app.url})`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-inner group-hover:border-rose-500/40">
                {renderAppIcon(app.iconType)}
              </div>
              <span className="text-[11px] font-bold text-slate-200 group-hover:text-rose-400 truncate w-full">
                {app.name}
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800/80 text-slate-400">
                {app.badge || (app.isTradingApp ? 'Trading' : 'App')}
              </span>
            </div>
          ))}

          {/* Launch Trading Hub Shortcut */}
          <div
            onClick={() => {
              if (onOpenTab) {
                onOpenTab('apps');
                onOpenStudio();
              }
            }}
            className="p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 hover:border-rose-500/60 backdrop-blur-sm cursor-pointer transition-all group flex flex-col items-center text-center space-y-1.5 hover:scale-105"
            title="Open Trading Suite & Charts"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <LineChart className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-300 group-hover:text-white truncate w-full">
              Trading Suite
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-900/80 text-rose-200">
              Charts &amp; Feeds
            </span>
          </div>

          {/* Spotify Studio Shortcut */}
          <div
            onClick={() => {
              if (onOpenTab) {
                onOpenTab('music');
                onOpenStudio();
              }
            }}
            className="p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/30 hover:border-emerald-500/60 backdrop-blur-sm cursor-pointer transition-all group flex flex-col items-center text-center space-y-1.5 hover:scale-105"
            title="Open Daily Music Studio for Spotify Releases"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-300 group-hover:text-white truncate w-full">
              Spotify Studio
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-900/80 text-emerald-200">
              Make Music
            </span>
          </div>
        </div>
      </div>

      {/* THE VAMPIEE DESKTOP OVERLAY ICON & INTERACTIVE FLOATING HUD */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-xl px-4 pointer-events-auto transition-transform duration-300"
        style={{
          transform: `translate(calc(-50% + ${roamPos.x}px), calc(-50% + ${roamPos.y}px))`,
        }}
      >
        <div className="relative bg-gradient-to-b from-slate-900/95 via-[#131526]/95 to-slate-950/95 rounded-3xl border border-rose-500/30 shadow-[0_0_80px_rgba(225,29,72,0.25)] backdrop-blur-2xl p-6 overflow-hidden">
          {/* Subtle top red glow bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-700 flex items-center justify-center font-black text-white text-xs shadow-md shadow-rose-950">
                V
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  Vampiee Desktop Companion
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    {avatarStyle === 'cartoon' ? 'CARTOON MODE' : 'ORB MODE'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Speak to command anytime</span>
                  <span className="text-rose-400 font-mono">● Mood: {personalSync.currentMood}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onOpenStudio}
              title="Expand to Full Studio"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Center Avatar & Voice Stage (Cartoon Bat or Core Orb) */}
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            {avatarStyle === 'cartoon' ? (
              <CartoonBatVampiee
                state={orbState}
                size="lg"
                onClick={onToggleMic}
                showStatusLabel={true}
                mood={personalSync.currentMood}
                isRoaming={isRoaming}
              />
            ) : (
              <VampieeOrb
                state={orbState}
                size="lg"
                onClick={onToggleMic}
                showStatusLabel={true}
              />
            )}

            <div className="text-center space-y-1">
              <p className="text-xs text-slate-300 max-w-sm">
                {isListening
                  ? 'Listening to you... speak your command now'
                  : isSpeaking
                  ? 'Vampiee speaking...'
                  : isLoading
                  ? 'Thinking & synchronizing data...'
                  : 'Click the cartoon icon or mic to speak with Vampiee.'}
              </p>

              <div className="pt-2 flex items-center justify-center space-x-3">
                <AudioWaveform
                  isActive={isListening || isSpeaking}
                  type={isListening ? 'listening' : 'speaking'}
                  barCount={14}
                />

                <button
                  onClick={onToggleMic}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={isListening ? 'Mute Mic' : 'Activate Mic'}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                {isSpeaking && (
                  <button
                    onClick={onStopSpeaking}
                    className="p-2 rounded-xl bg-slate-800 text-rose-300 border border-rose-500/30 hover:bg-slate-700 cursor-pointer"
                    title="Mute speech"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Latest Answer Capsule */}
          {lastReply && (
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-28 overflow-y-auto font-sans shadow-inner">
              <span className="font-bold text-rose-400 font-mono block mb-1">Vampiee:</span>
              {lastReply}
            </div>
          )}

          {/* Mini Real-Time Vitals Dock */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">Net Worth</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                ${portfolioNetWorth.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">Monetization</span>
              <span className="text-xs font-bold text-amber-400 font-mono">
                ${monthlyRevenue.toLocaleString()}/mo
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">Work &amp; Mood</span>
              <span className="text-xs font-bold text-indigo-400 font-mono">
                {pendingTasksCount} Tasks • {personalSync.currentMood}
              </span>
            </div>
          </div>

          {/* Quick Voice Command Pills */}
          <div className="pt-4 flex flex-wrap gap-1.5 justify-center">
            <button
              onClick={() => onSpeakCommand("Vampiee, give me a quick morning briefing on wealth and work")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500/40 cursor-pointer transition-colors"
            >
              🎙️ "Morning briefing"
            </button>
            <button
              onClick={() => onSpeakCommand("Vampiee, what is my portfolio balance and risk score?")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500/40 cursor-pointer transition-colors"
            >
              📈 "Portfolio check"
            </button>
            <button
              onClick={() => onSpeakCommand("Vampiee, align with my current mood and what I want")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-white border border-slate-700 hover:border-purple-500/40 cursor-pointer transition-colors"
            >
              ❤️ "Align with my mind"
            </button>
            <button
              onClick={() => {
                if (onOpenTab) {
                  onOpenTab('music');
                  onOpenStudio();
                } else {
                  onSpeakCommand("Vampiee, make a new music track based on my daily experiences and phone photos/videos to release on Spotify");
                }
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-1 font-semibold"
            >
              🎵 "Make Spotify Music from Photos"
            </button>
            <button
              onClick={() => onSpeakCommand("Vampiee, I urgently need 1000 AED in 3 days to pay our bills. What are the best, safest legal options in the UAE and how can I negotiate extensions?")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 cursor-pointer transition-colors"
            >
              🚨 "1,000 AED in 3 Days (Bills)"
            </button>
          </div>

          {/* Quick text input */}
          <form onSubmit={handlePromptSubmit} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Or type command to cartoon Vampiee..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!customPrompt.trim() || isLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Speak
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Desktop Taskbar / Dock */}
      <div className="relative z-20 flex items-center justify-between px-6 py-2.5 bg-black/75 backdrop-blur-xl border-t border-white/10 text-xs">
        <div className="flex items-center space-x-2.5 shrink-0">
          <div
            onClick={onOpenStudio}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-700 flex items-center justify-center font-bold text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
            title="Open Vampiee Command Studio"
          >
            🦇
          </div>
          <span className="text-slate-300 font-bold hidden xl:inline">Vampiee OS</span>
        </div>

        {/* Real Apps Desktop Dock (macOS / Windows Style) */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800/90 px-3 py-1.5 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar">
          {connectedApps
            .filter((a) => a.isPinned)
            .slice(0, 10)
            .map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className="w-8 h-8 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 flex items-center justify-center text-xs transition-all hover:scale-110 cursor-pointer shadow-sm relative group"
                title={`${app.name} (${app.category})`}
              >
                {renderAppIcon(app.iconType)}
                {/* Micro active dot */}
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-slate-600 group-hover:bg-rose-400" />
              </button>
            ))}

          <span className="h-5 w-[1px] bg-slate-800 mx-1" />

          {/* Direct Trading Suite Shortcut */}
          <button
            onClick={() => {
              if (onOpenTab) {
                onOpenTab('apps');
                onOpenStudio();
              }
            }}
            className="w-8 h-8 rounded-xl bg-rose-950/60 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-sm"
            title="Open Trading Suite & Charts"
          >
            <LineChart className="w-4 h-4" />
          </button>

          {/* Music Studio Shortcut */}
          <button
            onClick={() => {
              if (onOpenTab) {
                onOpenTab('music');
                onOpenStudio();
              }
            }}
            className="w-8 h-8 rounded-xl bg-emerald-950/60 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-sm"
            title="Open Daily Music Studio"
          >
            <Music className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            {connectedApps.length} Apps Connected
          </span>
          <button
            onClick={onOpenStudio}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border border-slate-700 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            Studio
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
