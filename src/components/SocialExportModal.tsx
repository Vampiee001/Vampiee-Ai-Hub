/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Studio Vampiee: Social Media Viral Exporter (TikTok, Instagram, Facebook)
 * Exports 9:16 vertical video visualizers, 15s TikTok sound clips,
 * copy-ready viral captions, and native social sharing.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Video,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Flame,
  Radio,
  Music,
  Play,
  Pause,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { DailyMusicTrack } from '../types';
import { renderSocialClipWav } from '../utils/audioSynth';

interface SocialExportModalProps {
  track: DailyMusicTrack;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialExportModal: React.FC<SocialExportModalProps> = ({
  track,
  isOpen,
  onClose,
}) => {
  const [activePlatform, setActivePlatform] = useState<'tiktok' | 'instagram' | 'facebook'>('tiktok');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isDownloadingSoundClip, setIsDownloadingSoundClip] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<15 | 30>(15);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Captions & tags
  const defaultHashtags = track.socialExport?.hashtags?.join(' ') ||
    `#${track.genre.replace(/\s+/g, '')} #NewMusic2026 #VampieeAudio #SpotifyArtist #FYP #ViralBeats #IndependentArtist`;

  const tiktokCaption = track.socialExport?.tiktokCaption ||
    `Turned today's late night grind into a track 🔥 Wait for the beat drop! 🎧 Which line hits hardest?\n\nSound: ${track.title} by ${track.artist}\n${defaultHashtags}`;

  const igCaption = track.socialExport?.instagramCaption ||
    `From daily memories to master sound waves.\n\n🎵 Track: "${track.title}"\n👤 Artist: ${track.artist}\n⚡ Produced with Vampiee Music Studio\n\nFull master ready on Spotify. Drop your thoughts in the comments 👇\n\n${defaultHashtags}`;

  const fbCaption = track.socialExport?.facebookPost ||
    `Sharing my latest creation: "${track.title}"! Produced from today's real thoughts and phone photos. Check out the vibes and let me know what you think! 🎶\n\n${defaultHashtags}`;

  // Live Canvas 9:16 Visualizer
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const drawFrame = () => {
      tick++;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Dynamic background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a0a14');
      bgGrad.addColorStop(0.5, '#1e102d');
      bgGrad.addColorStop(1, '#051814');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Glowing orb pulses
      const orbRadius = 140 + Math.sin(tick * 0.05) * 25;
      const orbGrad = ctx.createRadialGradient(width / 2, height * 0.38, 20, width / 2, height * 0.38, orbRadius);
      orbGrad.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
      orbGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
      orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.38, orbRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Header Branding
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STUDIO VAMPIEE • ORIGINAL SOUND', width / 2, 45);

      // Genre pill badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 70, 58, 140, 24, 12);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText(`${track.genre} • ${track.bpm} BPM`, width / 2, 74);

      // 3. Album Cover (Center square with vinyl glow)
      const coverSize = 220;
      const coverX = (width - coverSize) / 2;
      const coverY = height * 0.22;

      // Cover shadow & border
      ctx.save();
      ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverSize, coverSize, 20);
      ctx.fill();
      ctx.restore();

      // Cover Art gradient
      const coverGrad = ctx.createLinearGradient(coverX, coverY, coverX + coverSize, coverY + coverSize);
      coverGrad.addColorStop(0, '#e11d48');
      coverGrad.addColorStop(0.5, '#7c3aed');
      coverGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = coverGrad;
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverSize, coverSize, 20);
      ctx.fill();

      // Vinyl ring inside cover
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(coverX + coverSize / 2, coverY + coverSize / 2, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Center vinyl dot
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(coverX + coverSize / 2, coverY + coverSize / 2, 18, 0, Math.PI * 2);
      ctx.fill();

      // 4. Track Info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(track.title, width / 2, coverY + coverSize + 48);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(track.artist, width / 2, coverY + coverSize + 72);

      // 5. Sound Waveform Bars (Animated)
      const numBars = 28;
      const barWidth = 6;
      const barGap = 4;
      const totalWaveWidth = numBars * (barWidth + barGap);
      const startX = (width - totalWaveWidth) / 2;
      const waveY = coverY + coverSize + 115;

      for (let i = 0; i < numBars; i++) {
        const offset = i * 0.35 + tick * 0.08;
        const barH = 10 + Math.abs(Math.sin(offset)) * 45 + Math.abs(Math.cos(offset * 0.7)) * 20;

        const barGrad = ctx.createLinearGradient(0, waveY - barH, 0, waveY + barH);
        barGrad.addColorStop(0, '#f43f5e');
        barGrad.addColorStop(0.5, '#a855f7');
        barGrad.addColorStop(1, '#06b6d4');

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(startX + i * (barWidth + barGap), waveY - barH / 2, barWidth, barH, 3);
        ctx.fill();
      }

      // 6. Dynamic Lyrics Highlight
      const timedLyric = track.lyricsTimed?.[Math.floor((tick / 90) % (track.lyricsTimed?.length || 1))]?.line ||
        '♪ Turning every setback into liquid gold ♪';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.roundRect(24, height - 150, width - 48, 64, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timedLyric, width / 2, height - 114);

      // 7. Footer Social Tag
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText('Available on Spotify • TikTok Sound Ready', width / 2, height - 55);

      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, track]);

  if (!isOpen) return null;

  // Copy Caption to Clipboard
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Direct Web Share API (TikTok / IG / FB native sheet)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${track.title} - ${track.artist}`,
          text: activePlatform === 'tiktok' ? tiktokCaption : activePlatform === 'instagram' ? igCaption : fbCaption,
          url: window.location.href,
        });
      } catch (err) {
        console.warn('Native share cancelled or error:', err);
      }
    } else {
      handleCopy(
        activePlatform === 'tiktok' ? tiktokCaption : activePlatform === 'instagram' ? igCaption : fbCaption,
        'share'
      );
    }
  };

  // Download 15s / 30s TikTok Master Sound Clip (.wav)
  const handleDownloadSoundClip = async () => {
    setIsDownloadingSoundClip(true);
    try {
      const blob = await renderSocialClipWav(track, selectedDuration);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.artist} - ${track.title} [TikTok ${selectedDuration}s Sound].wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export sound clip:', err);
    } finally {
      setIsDownloadingSoundClip(false);
    }
  };

  // Export 9:16 Reel / Story Video (.webm)
  const handleExportReelVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRenderingVideo(true);
    setVideoProgress(10);

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(fullBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${track.artist} - ${track.title} [9x16 Reel].webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRenderingVideo(false);
        setVideoProgress(100);
      };

      recorder.start();

      // Progress animation
      const durationMs = selectedDuration * 1000;
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(95, Math.round((elapsed / durationMs) * 100));
        setVideoProgress(pct);
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        recorder.stop();
      }, durationMs);
    } catch (err) {
      console.error('Error rendering video:', err);
      setIsRenderingVideo(false);
    }
  };

  const currentCaption =
    activePlatform === 'tiktok' ? tiktokCaption : activePlatform === 'instagram' ? igCaption : fbCaption;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-950/50">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Social Media Exporter &amp; Reel Kit
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  TikTok • IG • FB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                9:16 vertical video visualizers, 15s viral sound clips &amp; copy-ready captions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-4 sm:px-6 pt-2">
          <button
            onClick={() => setActivePlatform('tiktok')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activePlatform === 'tiktok'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            TikTok Reel &amp; Sound
          </button>
          <button
            onClick={() => setActivePlatform('instagram')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activePlatform === 'instagram'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Instagram Reels &amp; Stories
          </button>
          <button
            onClick={() => setActivePlatform('facebook')}
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activePlatform === 'facebook'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            Facebook Story &amp; Feed
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: 9:16 Canvas Preview Card */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-black">
              <canvas
                ref={canvasRef}
                width={360}
                height={640}
                className="w-[240px] sm:w-[270px] h-[426px] sm:h-[480px] object-cover"
              />
              {isRenderingVideo && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4">
                  <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-3" />
                  <p className="text-sm font-bold text-white">Rendering 9:16 Reel Video...</p>
                  <p className="text-xs text-slate-400 mt-1">{videoProgress}% completed</p>
                  <div className="w-44 h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Duration Selector */}
            <div className="mt-3 flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Reel Length:</span>
              <button
                onClick={() => setSelectedDuration(15)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDuration === 15
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                15s (Viral Hook)
              </button>
              <button
                onClick={() => setSelectedDuration(30)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDuration === 30
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30s (Extended)
              </button>
            </div>
          </div>

          {/* Right: Export Tools, Captions, Direct Links */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            {/* Quick Export Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Download 9:16 Video */}
              <button
                onClick={handleExportReelVideo}
                disabled={isRenderingVideo}
                className="p-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer transition-all disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                {isRenderingVideo ? 'Exporting Video...' : `Export 9:16 Video (${selectedDuration}s)`}
              </button>

              {/* 2. Download Sound Clip WAV */}
              <button
                onClick={handleDownloadSoundClip}
                disabled={isDownloadingSoundClip}
                className="p-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer transition-all disabled:opacity-50"
              >
                <Music className="w-4 h-4" />
                {isDownloadingSoundClip ? 'Rendering Audio...' : `Download Sound WAV (${selectedDuration}s)`}
              </button>
            </div>

            {/* Native OS Share Button */}
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              Direct Share to {activePlatform === 'tiktok' ? 'TikTok' : activePlatform === 'instagram' ? 'Instagram' : 'Facebook'} App
            </button>

            {/* Caption & Hashtag Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Optimized {activePlatform.toUpperCase()} Caption &amp; Hashtags
                </span>
                <button
                  onClick={() => handleCopy(currentCaption, 'caption')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedType === 'caption' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                rows={5}
                value={currentCaption}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono resize-none focus:outline-none"
              />
            </div>

            {/* Platform Direct Upload Shortcuts */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 flex flex-col space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Direct Upload Portals:
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.tiktok.com/upload"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>Open TikTok Web Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>Open Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>Open Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Tips Banner */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-2.5">
              <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Pro Creator Tip:</strong> Upload the 9:16 video as your main Reel/Story, select &quot;Add Sound&quot; on TikTok/IG, and choose the exported WAV sound or search for your song once distributed via DistroKid to link official streaming royalties!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
