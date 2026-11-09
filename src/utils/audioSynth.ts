/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vampiee Audio Synthesizer & Spotify WAV Master Exporter
 * Pure Web Audio API engine: multi-stem synthesis, interactive playback, and offline WAV export.
 */

import { DailyMusicTrack } from '../types';

// Note frequency map
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11,
};

export function noteToFreq(note: string, octave: number = 4): number {
  const cleanNote = note.trim().replace(/[0-9]/g, '');
  const semitone = NOTE_SEMITONES[cleanNote] ?? 0;
  // A4 = 440 Hz is octave 4, note A (semitone 9)
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Chord name to frequencies
export function chordToFreqs(chord: string): number[] {
  const rootMatch = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!rootMatch) return [261.63, 329.63, 392.00]; // C major default
  const root = rootMatch[1];
  const type = rootMatch[2].toLowerCase();

  const rootFreq = noteToFreq(root, 3);
  let intervals = [0, 4, 7]; // major triad

  if (type.includes('m') && !type.includes('maj')) {
    intervals = [0, 3, 7]; // minor
  }
  if (type.includes('7')) {
    intervals.push(type.includes('maj') ? 11 : 10);
  }
  if (type.includes('sus4')) {
    intervals = [0, 5, 7];
  }
  if (type.includes('dim')) {
    intervals = [0, 3, 6];
  }

  return intervals.map((semi) => rootFreq * Math.pow(2, semi / 12));
}

// Generate White Noise Buffer for Snare and Hi-Hat
function createNoiseBuffer(ctx: BaseAudioContext, duration: number = 1): AudioBuffer {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Synthesize Drums into an AudioContext
function triggerKick(ctx: BaseAudioContext, dest: AudioNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(36, time + 0.18);

  gain.gain.setValueAtTime(0.9, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + 0.26);
}

function triggerSnare(ctx: BaseAudioContext, dest: AudioNode, time: number, noiseBuffer: AudioBuffer) {
  // Tone body
  const osc = ctx.createOscillator();
  const toneGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.12);
  toneGain.gain.setValueAtTime(0.4, time);
  toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
  osc.connect(toneGain);
  toneGain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.15);

  // Noise snap
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.6, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(dest);

  noise.start(time);
  noise.stop(time + 0.22);
}

function triggerHiHat(ctx: BaseAudioContext, dest: AudioNode, time: number, noiseBuffer: AudioBuffer) {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7500;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  noise.start(time);
  noise.stop(time + 0.08);
}

// Convert AudioBuffer to 16-bit PCM Stereo WAV file
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = 2;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  const numSamples = buffer.length;
  const dataSize = numSamples * blockAlign;
  const bufferLength = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave and write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left channel
    let sampleL = Math.max(-1, Math.min(1, left[i]));
    view.setInt16(offset, sampleL < 0 ? sampleL * 0x8000 : sampleL * 0x7FFF, true);
    offset += 2;

    // Right channel
    let sampleR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sampleR < 0 ? sampleR * 0x8000 : sampleR * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Helper to decode Base64 / Data URL audio into AudioBuffer
export async function decodeAudioDataUrl(ctx: BaseAudioContext, dataUrl: string): Promise<AudioBuffer | null> {
  try {
    const res = await fetch(dataUrl);
    const arrayBuffer = await res.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.warn('Could not decode audio data URL:', err);
    return null;
  }
}

// Master WAV Renderer using OfflineAudioContext (44.1kHz, 16-bit Stereo Master)
export async function renderMasterWav(
  track: DailyMusicTrack,
  durationSeconds: number = 45,
  startOffsetSec: number = 0
): Promise<Blob> {
  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSeconds, sampleRate);
  const noiseBuffer = createNoiseBuffer(offlineCtx, 2);

  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = 0.85;
  masterGain.connect(offlineCtx.destination);

  const bpm = track.bpm || 110;
  const beatSec = 60 / bpm;
  const stepSec = beatSec / 4; // 16th note

  // Drums
  const kickPattern = track.drumsPattern?.kick || [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
  const snarePattern = track.drumsPattern?.snare || [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
  const hihatPattern = track.drumsPattern?.hihat || [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];

  const totalSteps = Math.floor(durationSeconds / stepSec);

  for (let step = 0; step < totalSteps; step++) {
    const t = step * stepSec;
    const patIdx = step % 16;
    if (kickPattern[patIdx]) triggerKick(offlineCtx, masterGain, t);
    if (snarePattern[patIdx]) triggerSnare(offlineCtx, masterGain, t, noiseBuffer);
    if (hihatPattern[patIdx]) triggerHiHat(offlineCtx, masterGain, t, noiseBuffer);
  }

  // Chords
  const chords = track.chords.length ? track.chords : ['Cm', 'Ab', 'Eb', 'Bb'];
  const chordDuration = beatSec * 4; // 1 chord per bar
  const totalBars = Math.floor(durationSeconds / chordDuration);

  for (let bar = 0; bar < totalBars; bar++) {
    const chord = chords[bar % chords.length];
    const freqs = chordToFreqs(chord);
    const chordTime = bar * chordDuration;

    freqs.forEach((freq) => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();

      // Tailor oscillator timbre by genre preset
      if (track.synthPreset === 'lofi_chill' || track.synthPreset === 'rnb_soul') {
        osc.type = 'triangle';
      } else if (track.synthPreset === 'hyperpop' || track.synthPreset === 'phonk') {
        osc.type = 'sawtooth';
      } else if (track.synthPreset === 'afrobeats') {
        osc.type = 'sine';
      } else {
        osc.type = 'sawtooth';
      }

      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, chordTime);
      filter.frequency.exponentialRampToValueAtTime(1900, chordTime + chordDuration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(600, chordTime + chordDuration);

      gain.gain.setValueAtTime(0.001, chordTime);
      gain.gain.linearRampToValueAtTime(0.12, chordTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, chordTime + chordDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(chordTime);
      osc.stop(chordTime + chordDuration);
    });
  }

  // Bass Notes
  const bassNotes = track.bassNotes?.length ? track.bassNotes : [
    { note: 'C', octave: 2, duration: 1 },
    { note: 'Ab', octave: 1, duration: 1 },
    { note: 'Eb', octave: 2, duration: 1 },
    { note: 'Bb', octave: 1, duration: 1 },
  ];

  bassNotes.forEach((b, idx) => {
    const repeats = Math.floor(durationSeconds / (bassNotes.length * beatSec * 2));
    for (let r = 0; r < Math.max(1, repeats); r++) {
      const bTime = (r * bassNotes.length + idx) * (beatSec * 2);
      if (bTime >= durationSeconds) break;

      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = track.synthPreset === 'uk_drill' || track.synthPreset === 'melodic_trap' ? 'triangle' : 'sine';
      osc.frequency.value = noteToFreq(b.note, b.octave);

      gain.gain.setValueAtTime(0.36, bTime);
      gain.gain.exponentialRampToValueAtTime(0.001, bTime + beatSec * 1.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(bTime);
      osc.stop(bTime + beatSec * 1.9);
    }
  });

  // Melody Lead
  const melodyNotes = track.melodyNotes?.length ? track.melodyNotes : [
    { note: 'G', octave: 4, duration: 0.5 },
    { note: 'Bb', octave: 4, duration: 0.5 },
    { note: 'C', octave: 5, duration: 1 },
    { note: 'D', octave: 5, duration: 0.5 },
    { note: 'Eb', octave: 5, duration: 1 },
  ];

  let curTime = 0;
  while (curTime < durationSeconds) {
    for (const m of melodyNotes) {
      if (curTime >= durationSeconds) break;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();

      osc.type = track.synthPreset === 'afrobeats' ? 'triangle' : 'sawtooth';
      osc.frequency.value = noteToFreq(m.note, m.octave);

      const dur = m.duration * beatSec;
      gain.gain.setValueAtTime(0.001, curTime);
      gain.gain.linearRampToValueAtTime(0.18, curTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + dur);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(curTime);
      osc.stop(curTime + dur);

      curTime += dur;
    }
  }

  // Mix user's recorded custom voice if present
  if (track.vocalSettings?.customVoiceDataUrl) {
    try {
      const vocalBuffer = await decodeAudioDataUrl(offlineCtx, track.vocalSettings.customVoiceDataUrl);
      if (vocalBuffer) {
        const vocalSrc = offlineCtx.createBufferSource();
        vocalSrc.buffer = vocalBuffer;
        const vocalGain = offlineCtx.createGain();
        vocalGain.gain.value = 0.85;

        // Loop vocal hook every 8 bars or play over the chorus
        vocalSrc.loop = true;
        vocalSrc.connect(vocalGain);
        vocalGain.connect(masterGain);
        vocalSrc.start(0);
        vocalSrc.stop(durationSeconds);
      }
    } catch (vErr) {
      console.warn('Could not mix vocal buffer into master WAV:', vErr);
    }
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavBlob(renderedBuffer);
}

// Render 15-Second High-Energy Social Clip (WAV) for TikTok / Reels
export async function renderSocialClipWav(track: DailyMusicTrack, durationSeconds: number = 15): Promise<Blob> {
  return renderMasterWav(track, durationSeconds);
}

// Live Playback Engine
export class MusicPlayerEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private currentTrack: DailyMusicTrack | null = null;
  private timerId: number | null = null;
  private startTime = 0;
  private currentStep = 0;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private stemGains: {
    lead: GainNode | null;
    chords: GainNode | null;
    bass: GainNode | null;
    drums: GainNode | null;
    vocals: GainNode | null;
  } = { lead: null, chords: null, bass: null, drums: null, vocals: null };
  private vocalSourceNode: AudioBufferSourceNode | null = null;

  public onStepUpdate?: (step: number, currentTime: number, lyricLine?: string) => void;
  public onStateChange?: (isPlaying: boolean) => void;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.75;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Stems
      ['lead', 'chords', 'bass', 'drums', 'vocals'].forEach((stem) => {
        const g = this.ctx!.createGain();
        g.gain.value = 1.0;
        g.connect(this.masterGain!);
        (this.stemGains as any)[stem] = g;
      });

      this.noiseBuffer = createNoiseBuffer(this.ctx, 1.5);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async play(track: DailyMusicTrack) {
    this.initContext();
    if (!this.ctx) return;

    this.currentTrack = track;
    this.isPlaying = true;
    this.startTime = this.ctx.currentTime;
    this.currentStep = 0;
    this.onStateChange?.(true);

    // If track has custom vocal recording, play it through the vocals stem
    if (track.vocalSettings?.customVoiceDataUrl) {
      try {
        if (this.vocalSourceNode) {
          try { this.vocalSourceNode.stop(); } catch (_) {}
          this.vocalSourceNode.disconnect();
          this.vocalSourceNode = null;
        }

        const buffer = await decodeAudioDataUrl(this.ctx, track.vocalSettings.customVoiceDataUrl);
        if (buffer && this.isPlaying && this.stemGains.vocals) {
          const src = this.ctx.createBufferSource();
          src.buffer = buffer;
          src.loop = true;
          src.connect(this.stemGains.vocals);
          src.start(0);
          this.vocalSourceNode = src;
        }
      } catch (err) {
        console.warn('Playback vocal stem error:', err);
      }
    }
    const bpm = track.bpm || 110;
    const stepDurationMs = ((60 / bpm) / 4) * 1000;

    if (this.timerId) window.clearInterval(this.timerId);

    this.timerId = window.setInterval(() => {
      this.tick();
    }, stepDurationMs);
  }

  private tick() {
    if (!this.ctx || !this.currentTrack || !this.isPlaying) return;

    const t = this.ctx.currentTime;
    const patIdx = this.currentStep % 16;
    const bpm = this.currentTrack.bpm || 110;
    const beatSec = 60 / bpm;
    const elapsedSec = (this.currentStep * (beatSec / 4));

    // Drums
    if (this.stemGains.drums) {
      const kick = this.currentTrack.drumsPattern?.kick || [true, false, false, false, true, false, false, false];
      const snare = this.currentTrack.drumsPattern?.snare || [false, false, false, false, true, false, false, false];
      const hihat = this.currentTrack.drumsPattern?.hihat || [true, true, true, true, true, true, true, true];

      if (kick[patIdx % kick.length]) triggerKick(this.ctx, this.stemGains.drums, t);
      if (snare[patIdx % snare.length] && this.noiseBuffer) triggerSnare(this.ctx, this.stemGains.drums, t, this.noiseBuffer);
      if (hihat[patIdx % hihat.length] && this.noiseBuffer) triggerHiHat(this.ctx, this.stemGains.drums, t, this.noiseBuffer);
    }

    // Chords on bar boundaries (every 16 steps)
    if (this.currentStep % 16 === 0 && this.stemGains.chords) {
      const chords = this.currentTrack.chords.length ? this.currentTrack.chords : ['Cm', 'Ab', 'Eb', 'Bb'];
      const chordIdx = Math.floor(this.currentStep / 16) % chords.length;
      const freqs = chordToFreqs(chords[chordIdx]);
      const chordDur = beatSec * 3.8;

      freqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = this.currentTrack!.synthPreset === 'lofi_chill' ? 'triangle' : 'sawtooth';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + chordDur);

        osc.connect(gain);
        gain.connect(this.stemGains.chords!);
        osc.start(t);
        osc.stop(t + chordDur);
      });
    }

    // Bass on beats 0, 4, 8, 12
    if (this.currentStep % 4 === 0 && this.stemGains.bass) {
      const bassNotes = this.currentTrack.bassNotes?.length ? this.currentTrack.bassNotes : [
        { note: 'C', octave: 2, duration: 1 },
        { note: 'Ab', octave: 1, duration: 1 },
        { note: 'Eb', octave: 2, duration: 1 },
        { note: 'Bb', octave: 1, duration: 1 },
      ];
      const bIdx = Math.floor(this.currentStep / 4) % bassNotes.length;
      const b = bassNotes[bIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = noteToFreq(b.note, b.octave);

      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + beatSec * 0.9);

      osc.connect(gain);
      gain.connect(this.stemGains.bass);
      osc.start(t);
      osc.stop(t + beatSec * 0.95);
    }

    // Melody
    if (this.stemGains.lead && this.currentStep % 2 === 0) {
      const melodyNotes = this.currentTrack.melodyNotes?.length ? this.currentTrack.melodyNotes : [
        { note: 'G', octave: 4, duration: 0.5 },
        { note: 'Bb', octave: 4, duration: 0.5 },
        { note: 'C', octave: 5, duration: 1 },
      ];
      const mIdx = Math.floor(this.currentStep / 2) % melodyNotes.length;
      const m = melodyNotes[mIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = noteToFreq(m.note, m.octave);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + beatSec * 0.45);

      osc.connect(gain);
      gain.connect(this.stemGains.lead);
      osc.start(t);
      osc.stop(t + beatSec * 0.48);
    }

    // Match timed lyric
    let activeLyric = '';
    if (this.currentTrack.lyricsTimed?.length) {
      for (const item of this.currentTrack.lyricsTimed) {
        if (elapsedSec >= item.time) {
          activeLyric = item.line;
        }
      }
    }

    this.onStepUpdate?.(this.currentStep, elapsedSec, activeLyric);
    this.currentStep++;
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.vocalSourceNode) {
      try { this.vocalSourceNode.stop(); } catch (_) {}
      this.vocalSourceNode.disconnect();
      this.vocalSourceNode = null;
    }
    this.onStateChange?.(false);
  }

  public stop() {
    this.pause();
    this.currentStep = 0;
  }

  public setStemMute(stem: 'lead' | 'chords' | 'bass' | 'drums' | 'vocals', muted: boolean) {
    if (this.stemGains[stem]) {
      this.stemGains[stem]!.gain.value = muted ? 0 : 1;
    }
  }

  public setStemVolume(stem: 'lead' | 'chords' | 'bass' | 'drums' | 'vocals', volume: number) {
    if (this.stemGains[stem]) {
      this.stemGains[stem]!.gain.value = Math.max(0, Math.min(1.5, volume));
    }
  }

  public getVisualizerData(array: Uint8Array): void {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(array as any);
    } else {
      array.fill(0);
    }
  }

  public getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      currentStep: this.currentStep,
    };
  }
}

export const musicPlayer = new MusicPlayerEngine();

// Generate standard LRC format string
export function generateLRC(track: DailyMusicTrack): string {
  const meta = [
    `[ti:${track.title}]`,
    `[ar:${track.artist}]`,
    `[al:${track.spotifyMetadata.releaseTitle || track.title}]`,
    `[by:Vampiee AI Studio]`,
  ].join('\n');

  const lines = (track.lyricsTimed || []).map((item) => {
    const mins = Math.floor(item.time / 60).toString().padStart(2, '0');
    const secs = (item.time % 60).toFixed(2).padStart(5, '0');
    return `[${mins}:${secs}] ${item.line}`;
  }).join('\n');

  return `${meta}\n\n${lines}`;
}

// Browser vocal chant / singing synthesizer for lyrics preview
export function singVocalHook(lyrics: string, gender: string = 'female'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  // Extract lyrics lines, ignoring markdown headings
  const lines = lyrics
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('[') && !l.startsWith('('));

  const textToSing = lines.slice(0, 4).join('. ');
  if (!textToSing) return;

  const utterance = new SpeechSynthesisUtterance(textToSing);
  const voices = window.speechSynthesis.getVoices();

  if (gender === 'female') {
    utterance.pitch = 1.35;
    utterance.rate = 1.0;
    const femaleVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes('female') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Zira') ||
        v.name.includes('Karen')
    );
    if (femaleVoice) utterance.voice = femaleVoice;
  } else if (gender === 'male') {
    utterance.pitch = 0.85;
    utterance.rate = 0.95;
    const maleVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes('male') ||
        v.name.includes('Daniel') ||
        v.name.includes('David') ||
        v.name.includes('Alex') ||
        v.name.includes('George')
    );
    if (maleVoice) utterance.voice = maleVoice;
  } else {
    // Vampiee signature cyber voice
    utterance.pitch = 0.65;
    utterance.rate = 1.1;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopVocalHook(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

