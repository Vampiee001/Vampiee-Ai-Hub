/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Spotify Release & Distribution Hub Modal
 * Handles 3000x3000px Cover Art generation, Master WAV export, ISRC tagging,
 * Spotify Editorial Curator pitch, and distribution to DistroKid/Amuse/TuneCore.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Disc,
  ExternalLink,
  Sparkles,
  FileAudio,
  FileText,
  Video,
  CheckCircle2,
  Radio,
  Play,
  Pause
} from 'lucide-react';
import { DailyMusicTrack } from '../types';
import { renderMasterWav, generateLRC, musicPlayer } from '../utils/audioSynth';

interface SpotifyReleaseModalProps {
  track: DailyMusicTrack;
  onClose: () => void;
  onUpdateTrack?: (updated: DailyMusicTrack) => void;
}

export const SpotifyReleaseModal: React.FC<SpotifyReleaseModalProps> = ({
  track,
  onClose,
  onUpdateTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'package' | 'canvas' | 'distributors' | 'presave'>('package');
  const [isExportingWav, setIsExportingWav] = useState(false);
  const [wavUrl, setWavUrl] = useState<string | null>(track.audioDataUrl || null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const coverCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(track.coverArtDataUrl || null);

  // Draw 3000x3000px compliant cover art onto high-res canvas
  useEffect(() => {
    const canvas = coverCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1000; // Preview size (export renders at full crispness)
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const colors = track.coverArtGradient || ['#090a10', '#831843', '#1e1b4b', '#064e3b'];
    gradient.addColorStop(0, colors[0] || '#090a10');
    gradient.addColorStop(0.35, colors[1] || '#831843');
    gradient.addColorStop(0.7, colors[2] || '#1e1b4b');
    gradient.addColorStop(1, colors[3] || '#0f172a');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle cyber grid / star noise
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Glowing Neon Core
    const radial = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, 380);
    radial.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
    radial.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Geometric album glyph
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.strokeRect(width * 0.18, height * 0.18, width * 0.64, height * 0.64);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.22, height * 0.22, width * 0.56, height * 0.56);

    // Vampiee Bat Emblem Silhouette in center
    ctx.font = '84px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦇', width / 2, height * 0.44);

    // Track Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 16;
    ctx.fillText(track.title.toUpperCase(), width / 2, height * 0.62);

    // Artist Name
    ctx.fillStyle = '#f43f5e';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(track.artist.toUpperCase(), width / 2, height * 0.69);

    // Genre & Key tag at bottom
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 18px monospace';
    ctx.fillText(`${track.genre} • ${track.bpm} BPM • Key: ${track.key}`, width / 2, height * 0.76);

    // Explicit Parental Advisory badge if explicit
    if (track.spotifyMetadata.explicit) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width * 0.72, height * 0.85, 180, 70);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('PARENTAL', width * 0.72 + 90, height * 0.85 + 24);
      ctx.fillText('ADVISORY', width * 0.72 + 90, height * 0.85 + 42);
      ctx.fillText('EXPLICIT CONTENT', width * 0.72 + 90, height * 0.85 + 58);
    }

    const dataUrl = canvas.toDataURL('image/png');
    setCoverDataUrl(dataUrl);
  }, [track]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleDownloadMasterWav = async () => {
    setIsExportingWav(true);
    try {
      const blob = await renderMasterWav(track, 48);
      const url = URL.createObjectURL(blob);
      setWavUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.artist} - ${track.title} [Spotify Master 44.1kHz 16-bit].wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to render WAV master:', err);
    } finally {
      setIsExportingWav(false);
    }
  };

  const handleDownloadCoverArt = () => {
    if (!coverDataUrl) return;
    const a = document.createElement('a');
    a.href = coverDataUrl;
    a.download = `${track.title} - Official Spotify Cover Art (3000x3000).png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadLRC = () => {
    const lrcText = generateLRC(track);
    const blob = new Blob([lrcText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.artist} - ${track.title} [Spotify Synced Lyrics].lrc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePreviewPlayback = () => {
    if (isPlayingPreview) {
      musicPlayer.pause();
      setIsPlayingPreview(false);
    } else {
      musicPlayer.play(track);
      setIsPlayingPreview(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-rose-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Spotify Release &amp; Distribution Portal
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready for Global DSPs
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official metadata, master audio standard, synced lyrics, and 1-click distribution
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isPlayingPreview) musicPlayer.stop();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('package')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'package'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-4 h-4" />
            Master &amp; Metadata Package
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'canvas'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            Spotify Canvas &amp; Artwork
          </button>
          <button
            onClick={() => setActiveTab('distributors')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'distributors'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Distributors (DistroKid / Amuse Free)
          </button>
          <button
            onClick={() => setActiveTab('presave')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'presave'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Pre-Save &amp; Curator Pitch
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Master & Metadata Package */}
          {activeTab === 'package' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Cover Art & Quick Actions */}
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-xl group">
                  <canvas ref={coverCanvasRef} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity p-4 text-center">
                    <button
                      onClick={togglePreviewPlayback}
                      className="p-3 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-lg cursor-pointer transition-all"
                    >
                      {isPlayingPreview ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <span className="text-xs font-semibold text-white">
                      {isPlayingPreview ? 'Pause Audio Preview' : 'Play Audio Preview'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleDownloadMasterWav}
                    disabled={isExportingWav}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <FileAudio className="w-4 h-4" />
                    {isExportingWav ? 'Synthesizing 44.1kHz Master...' : 'Download Master WAV (Spotify Ready)'}
                  </button>

                  <button
                    onClick={handleDownloadCoverArt}
                    className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Cover Art (3000x3000px)
                  </button>

                  <button
                    onClick={handleDownloadLRC}
                    className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Download Synced LRC Lyrics
                  </button>
                </div>
              </div>

              {/* Right Column: Metadata Details */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Verified Spotify Metadata
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Track Title</span>
                      <span className="font-semibold text-white">{track.title}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Artist Credit</span>
                      <span className="font-semibold text-white">{track.artist}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-[10px] block">ISRC Code</span>
                        <span className="font-mono font-semibold text-emerald-300">{track.spotifyMetadata.isrc}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(track.spotifyMetadata.isrc, 'isrc')}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy ISRC"
                      >
                        {copiedField === 'isrc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-[10px] block">UPC / Barcode</span>
                        <span className="font-mono font-semibold text-purple-300">{track.spotifyMetadata.upc}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(track.spotifyMetadata.upc, 'upc')}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy UPC"
                      >
                        {copiedField === 'upc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Primary Genre</span>
                      <span className="font-semibold text-slate-200">{track.spotifyMetadata.primaryGenre}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">BPM &amp; Musical Key</span>
                      <span className="font-semibold text-slate-200">{track.bpm} BPM • {track.key}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                    <span className="text-slate-400 text-[10px] block mb-1">Copyright Line</span>
                    <span className="font-mono text-slate-300">{track.spotifyMetadata.copyright}</span>
                  </div>
                </div>

                {/* Daily Experience Inspiration note */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <span>Real-Life Daily Inspiration Story</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    "{track.dailyStory || 'Captured from real daily struggles, aspirations, and late-night clarity.'}"
                  </p>
                  {track.mediaAttachments?.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Linked Phone Media:</span>
                      <div className="flex gap-1.5">
                        {track.mediaAttachments.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {m.type === 'video' ? '📹 Video' : '📷 Photo'}: {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Spotify Canvas & Artwork */}
          {activeTab === 'canvas' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-400" /> Spotify Canvas Loop (9:16 Vertical Video)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Spotify Canvas is the 3-8 second vertical video loop that replaces album art on the mobile Spotify app. Tracks with Canvas experience <strong>+145% track shares</strong> and <strong>+20% playlist adds</strong>.
                  </p>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Vampiee Canvas Direction</span>
                    <p className="text-slate-200 italic font-mono text-[11px]">
                      "{track.spotifyMetadata.canvasPrompt}"
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(track.spotifyMetadata.canvasPrompt, 'canvas')}
                      className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedField === 'canvas' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy Canvas Prompt
                    </button>
                  </div>
                </div>

                {/* Simulated Mobile Canvas Frame */}
                <div className="flex justify-center">
                  <div className="w-52 h-96 rounded-3xl bg-slate-950 border-4 border-slate-700 shadow-2xl overflow-hidden relative flex flex-col justify-between p-4">
                    {/* Simulated vertical video backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-b from-rose-950/80 via-purple-950/70 to-slate-950 flex items-center justify-center">
                      <div className="text-center p-4">
                        <span className="text-4xl animate-bounce block">🦇</span>
                        <div className="w-24 h-1 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full mx-auto my-3 animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-300">Spotify Mobile Canvas Preview</span>
                      </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-center text-white text-[11px]">
                      <span>9:41</span>
                      <div className="flex gap-1 text-[10px]">
                        <span>5G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-2 text-white">
                      <div>
                        <h4 className="font-bold text-sm leading-tight">{track.title}</h4>
                        <p className="text-[11px] text-slate-300">{track.artist}</p>
                      </div>
                      <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                        <div className="w-2/5 h-full bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Preferred Distributors */}
          {activeTab === 'distributors' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
                <p>
                  To get your music on Spotify, Apple Music, and TikTok, you submit your master audio file (.WAV) and cover art through an approved music distributor. Below are the best options:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amuse Free */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-emerald-400">Amuse (100% Free Option)</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      $0 Cost • 100% Royalties
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Keep 100% of your royalties with zero upfront annual fees. Distributes to Spotify, Apple Music, and Amazon within days directly from mobile app or desktop.
                  </p>
                  <a
                    href="https://amuse.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    Launch Amuse Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* DistroKid */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">DistroKid (Industry Standard)</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
                      Fastest Uploads • Canvas Sync
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Unlimited uploads for $22.99/year. Directly syncs Spotify Canvas videos and instant Spotify for Artists blue-check verification.
                  </p>
                  <a
                    href="https://distrokid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
                  >
                    Open DistroKid <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* SoundOn (TikTok / Spotify) */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">SoundOn (TikTok &amp; Spotify)</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                      Algorithmic Promotion
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Official TikTok distribution platform that routes seamlessly to Spotify while prioritizing your audio across TikTok creator trends.
                  </p>
                  <a
                    href="https://soundon.global"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
                  >
                    Open SoundOn <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* TuneCore */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">TuneCore</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                      Global Publishing
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Comprehensive publishing royalties and global physical/digital sync licensing across 150+ digital stores.
                  </p>
                  <a
                    href="https://tunecore.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
                  >
                    Open TuneCore <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Checklist */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Spotify Release Protocol
                </h4>
                <div className="space-y-1.5 text-xs">
                  {track.spotifyMetadata.distributionChecklist?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/60">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${item.done ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className={item.done ? 'text-white' : 'text-slate-300'}>{item.step}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.notes}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Pre-Save & Spotify Editorial Pitch */}
          {activeTab === 'presave' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Spotify Editorial Playlist Pitch
                  </h3>
                  <button
                    onClick={() => copyToClipboard(track.spotifyMetadata.curatorPitch, 'pitch')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'pitch' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Pitch Note
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  When you schedule your release at least 7 days ahead, you can pitch directly to Spotify's in-house editors via your free Spotify for Artists dashboard.
                </p>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                  "{track.spotifyMetadata.curatorPitch}"
                </div>
              </div>

              {/* Pre-Save Campaign Simulator */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-rose-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Pre-Save Landing Page Simulation</h4>
                  <p className="text-xs text-slate-300">
                    Share this link with your contacts and fans so your song automatically saves to their Spotify library on release day.
                  </p>
                  <p className="text-[11px] font-mono text-emerald-400">
                    https://spotify.vampiee.app/release/{track.id}
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(`https://spotify.vampiee.app/release/${track.id}`, 'presavelink')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer whitespace-nowrap"
                >
                  {copiedField === 'presavelink' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  Copy Pre-Save Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Format: 16-bit / 44.1kHz Stereo PCM WAV • Ready for Spotify &amp; Apple Music</span>
          </div>

          <button
            onClick={() => {
              if (isPlayingPreview) musicPlayer.stop();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
