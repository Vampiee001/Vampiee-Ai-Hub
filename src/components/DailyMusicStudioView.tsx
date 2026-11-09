/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Studio Vampiee: Daily Experience to Spotify & Social Music Studio
 * Transforms daily stories, thoughts, emotions, and phone photos/videos
 * into full commercial music tracks ready for Spotify, TikTok, Instagram & Facebook.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Disc,
  Upload,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Share2,
  Sliders,
  Radio,
  FileAudio,
  FileText,
  Trash2,
  Image as ImageIcon,
  Video,
  Plus,
  TrendingUp,
  DollarSign,
  Mic,
  MicOff,
  Flame,
  FileJson,
  UploadCloud,
  Check,
  Headphones
} from 'lucide-react';
import { DailyMusicTrack, MediaAttachment, PersonalSyncState, VocalGender, VocalSettings } from '../types';
import { musicPlayer, renderMasterWav, generateLRC, singVocalHook, stopVocalHook } from '../utils/audioSynth';
import { SpotifyReleaseModal } from './SpotifyReleaseModal';
import { SocialExportModal } from './SocialExportModal';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface DailyMusicStudioViewProps {
  personalSync?: PersonalSyncState;
  onVocalize?: (text: string) => void;
}

export const GENRE_CATALOG = [
  { id: 'synthwave_retro', label: 'Cyberpunk Synthwave', icon: '🌆', bpm: 118, desc: 'Nocturnal analog synths, driving bass, retro 80s drums' },
  { id: 'melodic_trap', label: 'Dark Melodic Trap', icon: '⚡', bpm: 140, desc: '808 glide bass, crisp hi-hat rolls, atmospheric bells' },
  { id: 'afrobeats', label: 'Afrobeats / Afro-Fusion', icon: '🌴', bpm: 106, desc: 'Syncopated log drums, warm shaker swing, uplifting groove' },
  { id: 'rnb_soul', label: 'R&B / Neo-Soul', icon: '🍷', bpm: 88, desc: 'Silky Rhodes keys, smooth sub-bass, late-night intimacy' },
  { id: 'reggaeton', label: 'Reggaeton / Latin Urban', icon: '🔥', bpm: 96, desc: 'Punchy Dembow beat, tropical plucks, club energy' },
  { id: 'orchestral_cinematic', label: 'Cinematic Orchestral', icon: '🎻', bpm: 76, desc: 'Heroic brass, swelling string pads, trailer timpani' },
  { id: 'uk_drill', label: 'UK Drill', icon: '🗡️', bpm: 142, desc: 'Gliding 808 slides, bouncy hi-hat rolls, aggressive plucks' },
  { id: 'lofi_chill', label: 'Lo-Fi Chillhop', icon: '☕', bpm: 82, desc: 'Warm vinyl crackle, mellow rhodes chords, relaxed beats' },
  { id: 'hyperpop', label: 'Hyperpop / Glitch-Core', icon: '🍬', bpm: 155, desc: 'Distorted saws, frantic arpeggios, ultra-catchy hooks' },
  { id: 'cyber_dark', label: 'Gothic Electro-Pop', icon: '🦇', bpm: 124, desc: 'Vampiric leads, heavy industrial bass, dramatic hooks' },
  { id: 'indie_dream', label: 'Indie Dream-Pop', icon: '☁️', bpm: 110, desc: 'Shimmering chorus guitars, nostalgic pads, intimate vibe' },
  { id: 'house_edm', label: 'Deep Melodic House', icon: '🎧', bpm: 126, desc: 'Four-on-the-floor thump, hypnotic bassline, Ibiza sunset' },
  { id: 'acoustic', label: 'Acoustic Singer-Songwriter', icon: '🎸', bpm: 90, desc: 'Warm acoustic guitars, heartfelt melody, raw storytelling' },
  { id: 'phonk', label: 'Drift Phonk / 808', icon: '🏎️', bpm: 160, desc: 'Distorted cowbells, booming 808s, Tokyo night drift' },
];

export const VOCAL_OPTIONS = [
  { id: 'female', label: 'Female Voice', sub: 'Ethereal Soprano & Pop/R&B', icon: '👩' },
  { id: 'male', label: 'Male Voice', sub: 'Warm Baritone & Trap Cadence', icon: '👨' },
  { id: 'vampiee', label: 'Vampiee Cyber', sub: 'Futuristic AI Vocoder Hook', icon: '🦇' },
  { id: 'ai_recommendation', label: 'AI Suggestion', sub: 'Vampiee Picks Optimal Match', icon: '✨' },
  { id: 'user_custom', label: 'Use My Voice', sub: 'Record Microphone Vocal Hook', icon: '🎙️' },
];

const SAMPLE_MEMORIES = [
  {
    name: 'Dubai Skyline at 2 AM',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
    story: 'Driving down Sheikh Zayed Road under neon skyscrapers, calculating my next moves and refusing to give up on financial independence.',
    mood: 'Nocturnal, ambitious, resolute',
  },
  {
    name: 'Espresso & High-Stakes Coding',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    story: 'Double shot espresso at my desk, screens glowing with terminal logs, building products that can scale while the city sleeps.',
    mood: 'Laser-focused, energized, unstoppable',
  },
  {
    name: 'Rain on the Windowpane',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    story: 'Watching raindrops slide down the glass, reflecting on family bills, life pressure, and turning anxiety into sonic art.',
    mood: 'Reflective, melancholic, hopeful',
  },
];

// Initial seeded demo track
const INITIAL_DEMO_TRACK: DailyMusicTrack = {
  id: 'track-demo-01',
  title: 'Neon Nocturne',
  artist: 'Mark Stephen (feat. Vampiee)',
  genre: 'Cyberpunk Synthwave',
  subGenre: 'Nocturnal Chillwave',
  bpm: 116,
  key: 'C Minor',
  mood: 'Ambitious, electric, nocturnal',
  dailyStory: 'Late night sprint overcoming bills and engineering financial freedom.',
  mediaAttachments: [
    {
      id: 'm-1',
      name: 'Dubai Skyline at 2 AM.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
      caption: 'Late night drive through the city',
    },
  ],
  vocalSettings: {
    gender: 'female',
    name: 'Sora (Ethereal Soprano)',
    styleDescription: 'Soulful falsetto with airy vocal breath and crisp modern delivery.',
    pitchShift: 0,
    reverbLevel: 0.35,
  },
  socialExport: {
    tiktokCaption: 'Turned today\'s late night grind into a track 🔥 Wait for the beat drop! 🎧 Which line hits hardest?',
    instagramCaption: 'From memories in my phone to full frequency sound waves. Track: "Neon Nocturne" produced with @Vampiee. Full master ready on Spotify!',
    facebookPost: 'Sharing something deeply personal today. I took my daily thoughts and turned them into this track with Vampiee. Let me know what you think!',
    hashtags: ['#VampieeMusic', '#NewMusic2026', '#ProducerLife', '#SpotifyArtist', '#TikTokMusic', '#ViralSound'],
    hookTimestamp: 21.5,
    soundTitle: 'Neon Nocturne (Original Sound)',
  },
  lyrics: `[Intro]
(Analog synth arpeggio fades in, 808 sub heartbeat kicks)

[Verse 1]
Midnight shadows on the highway line
Chasing every number that will free my mind
Screens are glowing while the skyline sleeps
A promise to myself that I intend to keep
They said to slow down, but I hear the beat
Of two thousand dreams beneath my feet

[Chorus]
We are rising through the neon cold
Turning every setback into liquid gold
Vampiee in my corner, no surrender now
We pay every debt and we break the ground
Oh, listen to the master sound!

[Verse 2]
Every photo in my phone is a memory carved
The long quiet hours when the courage sparked
From the darkest hour to the morning sun
We haven't lost a thing—we've just begun

[Chorus]
We are rising through the neon cold
Turning every setback into liquid gold
Vampiee in my corner, no surrender now
We pay every debt and we break the ground

[Outro]
116 BPM... pulse never dies...
Spotify ready... watch us rise.`,
  lyricsTimed: [
    { time: 0, line: '♪ Instrumental Synthwave Intro...' },
    { time: 4.2, line: 'Midnight shadows on the highway line' },
    { time: 8.5, line: 'Chasing every number that will free my mind' },
    { time: 13.0, line: 'Screens are glowing while the skyline sleeps' },
    { time: 17.2, line: 'A promise to myself that I intend to keep' },
    { time: 21.5, line: 'We are rising through the neon cold' },
    { time: 26.0, line: 'Turning every setback into liquid gold' },
    { time: 30.2, line: 'Vampiee in my corner, no surrender now' },
    { time: 34.5, line: 'We pay every debt and we break the ground' },
  ],
  chords: ['Cm', 'Ab', 'Eb', 'Bb'],
  melodyNotes: [
    { note: 'G', octave: 4, duration: 0.5 },
    { note: 'Bb', octave: 4, duration: 0.5 },
    { note: 'C', octave: 5, duration: 1 },
    { note: 'D', octave: 5, duration: 0.5 },
    { note: 'Eb', octave: 5, duration: 1 },
  ],
  bassNotes: [
    { note: 'C', octave: 2, duration: 1 },
    { note: 'Ab', octave: 1, duration: 1 },
    { note: 'Eb', octave: 2, duration: 1 },
    { note: 'Bb', octave: 1, duration: 1 },
  ],
  drumsPattern: {
    kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    percussion: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
  },
  synthPreset: 'synthwave_retro',
  coverArtGradient: ['#090a10', '#831843', '#1e1b4b', '#064e3b'],
  spotifyMetadata: {
    isrc: 'US-VMP-26-00421',
    upc: '198765432109',
    releaseTitle: 'Neon Nocturne',
    primaryGenre: 'Electronic',
    secondaryGenre: 'Synthwave',
    explicit: false,
    copyright: '℗ 2026 Mark Stephen Records / Vampiee Audio',
    curatorPitch: 'A high-octane nocturnal synthwave anthem blending analog warmth with modern punchy 808s, inspired by real late-night hustle and financial resilience in Dubai.',
    canvasPrompt: 'Vertical 9:16 neon highway loop with speed lines and a stylized glowing bat emblem pulsing to the 116 BPM kick drum.',
    suggestedDistributor: 'Amuse (100% Free) or DistroKid',
    distributionChecklist: [
      { step: 'Download Master WAV (24-bit/44.1kHz standard)', done: true, notes: 'Web Audio synthesis ready' },
      { step: 'Generate 3000x3000px Cover Art', done: true, notes: 'Compliant square art ready' },
      { step: 'Export Synced LRC Lyrics', done: true, notes: 'Ready for Musixmatch / Spotify Lyrics' },
      { step: 'Export Social Media Reels & Clips', done: true, notes: 'TikTok, Instagram & Facebook 9:16 kits generated' },
      { step: 'Export Creation Metadata JSON', done: true, notes: 'Archive and share track history' },
      { step: 'Upload to Preferred Distributor (DistroKid / Amuse / TuneCore)', done: false, notes: 'Takes 24-72h to appear on Spotify' },
      { step: 'Claim & Pitch in Spotify for Artists', done: false, notes: 'Pitch at least 7 days before release date' },
    ],
  },
  createdAt: new Date().toISOString(),
  status: 'ready_for_spotify',
};

export const DailyMusicStudioView: React.FC<DailyMusicStudioViewProps> = ({
  personalSync,
  onVocalize,
}) => {
  // Saved Tracks Catalog
  const [tracks, setTracks] = useState<DailyMusicTrack[]>(() =>
    loadFromStorage('music_tracks', [INITIAL_DEMO_TRACK])
  );
  const [activeTrack, setActiveTrack] = useState<DailyMusicTrack>(tracks[0] || INITIAL_DEMO_TRACK);

  // Experience Intake Form State
  const [dailyStory, setDailyStory] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('synthwave_retro');
  const [selectedVocal, setSelectedVocal] = useState<VocalGender>('ai_recommendation');
  const [artistName, setArtistName] = useState('Mark Stephen');
  const [mediaAttachments, setMediaAttachments] = useState<MediaAttachment[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  // Playback & Synth State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingingHook, setIsSingingHook] = useState(false);
  const [activeLyric, setActiveLyric] = useState<string>('');
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [stemsMuted, setStemsMuted] = useState({
    lead: false,
    chords: false,
    bass: false,
    drums: false,
    vocals: false,
  });

  // User Voice Microphone Recording
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVoiceDataUrl, setRecordedVoiceDataUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // Camera capture modal state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Visualizer Canvas
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // File input ref for JSON import
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  // Save tracks to localStorage
  useEffect(() => {
    saveToStorage('music_tracks', tracks);
  }, [tracks]);

  // Hook audio player callbacks
  useEffect(() => {
    musicPlayer.onStepUpdate = (_step, elapsedSec, lyricLine) => {
      setCurrentPlaybackTime(elapsedSec);
      if (lyricLine) setActiveLyric(lyricLine);
    };

    musicPlayer.onStateChange = (playing) => {
      setIsPlaying(playing);
    };

    return () => {
      musicPlayer.stop();
      stopVocalHook();
    };
  }, []);

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const freqData = new Uint8Array(64);

    const render = () => {
      musicPlayer.getVisualizerData(freqData);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / freqData.length) * 1.8;
      let x = 0;

      for (let i = 0; i < freqData.length; i++) {
        const val = freqData[i];
        const barHeight = (val / 255) * height * 0.9;

        const r = Math.min(255, 244 + val * 0.1);
        const g = Math.min(255, 63 + val * 0.4);
        const b = Math.min(255, 94 + val * 0.6);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // Microphone recording functions
  const handleStartVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setRecordedVoiceDataUrl(dataUrl);
          setSelectedVocal('user_custom');

          // Attach directly to active track if playing
          setActiveTrack((prev) => ({
            ...prev,
            vocalSettings: {
              gender: 'user_custom',
              name: `${artistName}'s Voice Recording`,
              styleDescription: 'User recorded microphone vocal hook',
              customVoiceDataUrl: dataUrl,
            },
          }));
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingVoice(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied:', err);
    }
  };

  const handleStopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const handleClearVoiceRecording = () => {
    setRecordedVoiceDataUrl(null);
    setRecordingSeconds(0);
  };

  // Sing / Chant Vocal Hook via Web Speech API
  const handleToggleSingHook = () => {
    if (isSingingHook) {
      stopVocalHook();
      setIsSingingHook(false);
    } else {
      setIsSingingHook(true);
      const gender = activeTrack.vocalSettings?.gender || selectedVocal;
      singVocalHook(activeTrack.lyrics, gender);
      setTimeout(() => setIsSingingHook(false), 9000);
    }
  };

  // Pull context from Personal Sync
  const handleSyncFromMind = () => {
    if (!personalSync) return;
    const wantsStr = personalSync.wants?.length ? personalSync.wants.join(', ') : '';
    const needsStr = personalSync.needs?.length ? personalSync.needs.join(', ') : '';
    const thoughts = personalSync.thoughts || '';
    const mood = personalSync.currentMood || 'ambitious';

    const promptText = `Today's energy is ${personalSync.energyLevel}/10. Mood is ${mood}. ${
      thoughts ? `Mind thoughts: "${thoughts}". ` : ''
    }${wantsStr ? `Focus wants: ${wantsStr}. ` : ''}${needsStr ? `Urgent needs: ${needsStr}.` : ''}`;

    setDailyStory(promptText);
    onVocalize?.('Synced your current mood, wants, and thoughts into your music studio.');
  };

  // Upload Photos & Videos from Phone/Laptop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();

      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        const newMedia: MediaAttachment = {
          id: `media-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: isVideo ? 'video' : 'image',
          url: resultUrl,
          previewUrl: resultUrl,
          caption: `${file.name} (${Math.round(file.size / 1024)} KB)`,
          takenAt: 'Today',
        };
        setMediaAttachments((prev) => [...prev, newMedia]);
      };

      reader.readAsDataURL(file);
    });
  };

  // Quick-Add Sample Memory
  const handleAddSampleMemory = (sample: typeof SAMPLE_MEMORIES[0]) => {
    const newMedia: MediaAttachment = {
      id: `sample-${Date.now()}`,
      name: sample.name,
      type: sample.type,
      url: sample.url,
      previewUrl: sample.url,
      caption: sample.story,
      takenAt: 'Recent',
    };
    setMediaAttachments((prev) => [...prev, newMedia]);
    setDailyStory((prev) => (prev ? `${prev}\n${sample.story}` : sample.story));
  };

  // Camera capture methods
  const handleStartCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setIsCameraActive(false);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    const newMedia: MediaAttachment = {
      id: `cam-${Date.now()}`,
      name: `Snapshot_${new Date().toLocaleTimeString()}.jpg`,
      type: 'image',
      url: dataUrl,
      previewUrl: dataUrl,
      caption: 'Live snapshot from device camera',
      takenAt: 'Just now',
    };

    setMediaAttachments((prev) => [...prev, newMedia]);
    handleStopCamera();
  };

  const handleStopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleRemoveMedia = (id: string) => {
    setMediaAttachments((prev) => prev.filter((m) => m.id !== id));
  };

  // Compose Song with Vampiee AI
  const handleComposeSong = async () => {
    setIsComposing(true);
    musicPlayer.stop();

    try {
      // Find selected genre meta
      const currentGenreObj = GENRE_CATALOG.find((g) => g.id === selectedGenre);

      // Prepare image base64 list (up to 3 for Gemini multimodal)
      const imageBase64List = mediaAttachments
        .filter((m) => m.type === 'image' && m.url.startsWith('data:image/'))
        .slice(0, 3)
        .map((m) => {
          const match = m.url.match(/^data:(image\/[a-z]+);base64,(.+)$/);
          if (match) {
            return { mimeType: match[1], data: match[2] };
          }
          return null;
        })
        .filter(Boolean);

      const mediaSummary = mediaAttachments.map((m) => `${m.type}: ${m.name} (${m.caption || 'No caption'})`).join('; ');

      const response = await fetch('/api/vampiee/music/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyStory: dailyStory || 'Late-night perseverance, artistic breakthrough, and turning struggles into rhythm.',
          mood: personalSync?.currentMood || 'Fierce, nocturnal, inspired',
          wantsAndNeeds: personalSync ? `${personalSync.wants?.join(', ')} / ${personalSync.needs?.join(', ')}` : '',
          artistName: artistName || 'Mark Stephen',
          genrePreference: currentGenreObj?.label || 'Cyberpunk Synthwave',
          vocalPreference: selectedVocal,
          hasUserVoice: !!recordedVoiceDataUrl,
          userVoiceNotes: recordedVoiceDataUrl ? 'User recorded custom vocal hook provided' : '',
          mediaSummary,
          imageBase64List,
        }),
      });

      const data = await response.json();

      if (data.success && data.track) {
        const newTrack: DailyMusicTrack = {
          ...data.track,
          mediaAttachments,
          vocalSettings: {
            ...data.track.vocalSettings,
            customVoiceDataUrl: recordedVoiceDataUrl || undefined,
          },
        };

        setTracks((prev) => [newTrack, ...prev]);
        setActiveTrack(newTrack);

        onVocalize?.(`"${newTrack.title}" composed. Vocal profile set to ${newTrack.vocalSettings?.name || 'standard'}.`);

        // Auto-play the new track
        setTimeout(() => {
          musicPlayer.play(newTrack);
        }, 500);
      } else {
        throw new Error(data.error || 'Failed to compose track');
      }
    } catch (err: any) {
      console.error('Error generating music:', err);
      // Fallback: create a solid structured track so user is never blocked
      const fallbackGenre = GENRE_CATALOG.find((g) => g.id === selectedGenre) || GENRE_CATALOG[0];
      const fallbackTrack: DailyMusicTrack = {
        ...INITIAL_DEMO_TRACK,
        id: `track-${Date.now()}`,
        title: dailyStory ? dailyStory.slice(0, 24) : 'Midnight Symphony',
        genre: fallbackGenre.label,
        bpm: fallbackGenre.bpm,
        synthPreset: fallbackGenre.id,
        dailyStory: dailyStory || 'Composed from your daily reflection.',
        createdAt: new Date().toISOString(),
        vocalSettings: {
          gender: selectedVocal,
          name: selectedVocal === 'female' ? 'Sora (Ethereal Soprano)' : selectedVocal === 'male' ? 'Dante (Warm Baritone)' : 'Vampiee Cyber',
          styleDescription: 'AI Arranged vocal performance',
          customVoiceDataUrl: recordedVoiceDataUrl || undefined,
        },
      };
      setTracks((prev) => [fallbackTrack, ...prev]);
      setActiveTrack(fallbackTrack);
      musicPlayer.play(fallbackTrack);
    } finally {
      setIsComposing(false);
    }
  };

  // Playback Controls
  const togglePlay = () => {
    if (isPlaying) {
      musicPlayer.pause();
    } else {
      musicPlayer.play(activeTrack);
    }
  };

  const toggleStem = (stem: 'lead' | 'chords' | 'bass' | 'drums' | 'vocals') => {
    const nextMuted = !stemsMuted[stem];
    setStemsMuted((prev) => ({ ...prev, [stem]: nextMuted }));
    musicPlayer.setStemMute(stem, nextMuted);
  };

  // Export Track Metadata as JSON File
  const handleExportMetadataJson = () => {
    const metadataPackage = {
      format: 'VampieeMusicMetadataPackage_v2',
      exportedAt: new Date().toISOString(),
      track: activeTrack,
      spotifyChecklist: activeTrack.spotifyMetadata?.distributionChecklist || [],
      lyricsStandardLRC: generateLRC(activeTrack),
    };

    const jsonStr = JSON.stringify(metadataPackage, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTrack.artist} - ${activeTrack.title} [Vampiee Metadata].json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Track Metadata from JSON File
  const handleImportMetadataJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedTrack: DailyMusicTrack = parsed.track || parsed;
        if (importedTrack && importedTrack.title) {
          // Ensure unique ID
          const readyTrack: DailyMusicTrack = {
            ...importedTrack,
            id: `imported-${Date.now()}`,
          };
          setTracks((prev) => [readyTrack, ...prev]);
          setActiveTrack(readyTrack);
          onVocalize?.(`Imported "${readyTrack.title}" from your creation history JSON.`);
        }
      } catch (err) {
        console.error('Failed to parse JSON file:', err);
      }
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  const handleDownloadMasterWavDirect = async () => {
    try {
      const blob = await renderMasterWav(activeTrack, 45);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTrack.artist} - ${activeTrack.title} [Spotify Master 44.1kHz].wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('WAV export error:', err);
    }
  };

  const handleDownloadLRCDirect = () => {
    const lrc = generateLRC(activeTrack);
    const blob = new Blob([lrc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTrack.artist} - ${activeTrack.title} [Synced Lyrics].lrc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto pr-1 select-none">
      {/* Studio Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/50 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-rose-950/50 border border-rose-500/40">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                STUDIO VAMPIEE • HIT PRODUCTION PIPELINE
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                14 Genres • Vocalist AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Turn your daily life into commercial records ready for Spotify, TikTok, Instagram &amp; Facebook.
            </p>
          </div>
        </div>

        {/* Global Action Hubs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* JSON Export */}
          <button
            onClick={handleExportMetadataJson}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-750 transition-all cursor-pointer"
            title="Download track metadata, chords & lyrics as JSON archive"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>Export JSON</span>
          </button>

          {/* JSON Import */}
          <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-750 transition-all cursor-pointer">
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Load JSON</span>
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              onChange={handleImportMetadataJson}
              className="hidden"
            />
          </label>

          {/* Social Export Button */}
          <button
            onClick={() => setShowSocialModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/40 cursor-pointer transition-all"
          >
            <Flame className="w-4 h-4 text-white" />
            <span>TikTok / IG / FB Pack</span>
          </button>

          {/* Spotify Hub */}
          <button
            onClick={() => setShowSpotifyModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Spotify Release Hub</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Intake & Vocal Setup, Right = Synthesizer & Discography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Daily Story & Mind Intake */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-400" /> Daily Experience &amp; Story
              </span>
              <button
                onClick={handleSyncFromMind}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold cursor-pointer transition-colors flex items-center gap-1"
                title="Pulls today's mood, energy, wants & thoughts from Personal Sync"
              >
                Sync from Mind Sync
              </button>
            </div>

            <textarea
              value={dailyStory}
              onChange={(e) => setDailyStory(e.target.value)}
              placeholder="What did you experience today? Your moments, victories, struggles, thoughts, conversations, or late-night goals..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 resize-none"
            />

            {/* Artist Credit Name */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 whitespace-nowrap">Artist Credit:</span>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Your Artist / Stage Name"
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500/60 font-semibold"
              />
            </div>
          </div>

          {/* Card: Vocal Performer & Voice Option */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-purple-400" /> Vocalist &amp; Voice Direction
              </span>
              {recordedVoiceDataUrl && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Voice Hook Armed
                </span>
              )}
            </div>

            {/* Vocal Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VOCAL_OPTIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVocal(v.id as VocalGender)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedVocal === v.id
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-950/30'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>{v.icon}</span>
                    <span className="truncate">{v.label}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{v.sub}</p>
                </button>
              ))}
            </div>

            {/* Built-in Microphone Recorder */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-300">
                    Custom Voice Hook (Microphone)
                  </span>
                  {isRecordingVoice && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Recording {recordingSeconds}s
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isRecordingVoice ? (
                    <button
                      onClick={handleStartVoiceRecording}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{recordedVoiceDataUrl ? 'Retake Voice' : 'Record My Voice'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopVoiceRecording}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer animate-bounce"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop &amp; Save Hook</span>
                    </button>
                  )}

                  {recordedVoiceDataUrl && (
                    <button
                      onClick={handleClearVoiceRecording}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      title="Clear recording"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {recordedVoiceDataUrl && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span>Your custom vocal hook is loaded &amp; mixed into track audio.</span>
                  <audio src={recordedVoiceDataUrl} controls className="h-6 w-36" />
                </div>
              )}
            </div>
          </div>

          {/* Card: Phone Photos & Videos Access */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Phone Photos &amp; Videos Access
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Vampiee analyzes colors, vibe, and visual rhythm for the melody
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs cursor-pointer flex items-center gap-1 font-semibold transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleStartCamera}
                  className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs cursor-pointer flex items-center gap-1 font-semibold transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera</span>
                </button>
              </div>
            </div>

            {/* Camera Preview Modal/Inline */}
            {isCameraActive && (
              <div className="p-3 rounded-xl bg-black border border-purple-500/50 space-y-2">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg aspect-video object-cover" />
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleCaptureSnapshot}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    📸 Take Photo
                  </button>
                  <button
                    onClick={handleStopCamera}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Attached Media List */}
            {mediaAttachments.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {mediaAttachments.map((media) => (
                  <div key={media.id} className="relative rounded-lg overflow-hidden border border-slate-700 group aspect-video bg-slate-950">
                    {media.type === 'image' ? (
                      <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
                        <Video className="w-5 h-5 text-purple-400" />
                        <span className="text-[9px] font-mono mt-1">Video Clip</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveMedia(media.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-rose-400 hover:text-rose-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-slate-300 truncate px-1 py-0.5">
                      {media.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  No camera roll media attached yet. Try sample memories or upload your photos/videos:
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SAMPLE_MEMORIES.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddSampleMemory(sample)}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3 text-rose-400" />
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card: 14 Musical Genres Selection & Compose CTA */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Choose Musical Genre ({GENRE_CATALOG.length} Styles)
              </span>
              <span className="text-[10px] font-mono text-rose-400">
                {GENRE_CATALOG.find((g) => g.id === selectedGenre)?.bpm} BPM
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {GENRE_CATALOG.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedGenre === genre.id
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-md shadow-rose-950/30'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="truncate">{genre.icon} {genre.label}</span>
                    <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-1">{genre.bpm}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{genre.desc}</p>
                </button>
              ))}
            </div>

            {/* Compose Button */}
            <button
              onClick={handleComposeSong}
              disabled={isComposing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-rose-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-rose-950/60 cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 animate-spin" />
              {isComposing
                ? 'Composing Master Track & Lyrics...'
                : 'Compose Master Track with Vampiee'}
            </button>
          </div>
        </div>

        {/* Right Column: Audio Synthesizer, Lyrics & Spotify Stems (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card: Live Synthesizer Player & Waveform */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            {/* Song Meta Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{activeTrack.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {activeTrack.genre}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {activeTrack.artist} • {activeTrack.bpm} BPM • Key of {activeTrack.key} • Vocal: {activeTrack.vocalSettings?.name || 'Vampiee AI'}
                </p>
              </div>

              {/* Direct Export Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={handleDownloadMasterWavDirect}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                  title="Download 16-bit 44.1kHz Stereo WAV master for Spotify"
                >
                  <FileAudio className="w-3.5 h-3.5 text-emerald-400" />
                  WAV Master
                </button>
                <button
                  onClick={handleDownloadLRCDirect}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                  title="Download synced lyrics file"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  .LRC
                </button>
                <button
                  onClick={handleExportMetadataJson}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                  title="Export track creation history as JSON"
                >
                  <FileJson className="w-3.5 h-3.5 text-amber-400" />
                  JSON
                </button>
              </div>
            </div>

            {/* Live Audio Visualizer Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-24 flex items-center justify-center">
              <canvas
                ref={visualizerCanvasRef}
                width={500}
                height={96}
                className="w-full h-full object-cover"
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-rose-500" /> Press Play to Trigger Audio Synthesizer
                  </span>
                </div>
              )}
            </div>

            {/* Live Lyric Teleprompter / Karaoke bar */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-rose-400 font-mono text-[10px] uppercase">LIVE LYRIC:</span>
                <span className="font-semibold text-white truncate">
                  {activeLyric || activeTrack.lyricsTimed?.[0]?.line || '♪ Synthesizer Armed...'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {Math.floor(currentPlaybackTime / 60)}:
                {(currentPlaybackTime % 60).toFixed(0).padStart(2, '0')}
              </span>
            </div>

            {/* Transport, Vocal Hook Singer & 5-Stems Mixer */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/60 cursor-pointer transition-all"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      musicPlayer.stop();
                      setCurrentPlaybackTime(0);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                    title="Rewind to start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Vocal chant hook button */}
                  <button
                    onClick={handleToggleSingHook}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSingingHook
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    }`}
                    title="Synthesizes vocal hook playback in the selected voice profile"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>{isSingingHook ? 'Singing Vocal...' : 'Preview Vocal Hook'}</span>
                  </button>
                </div>

                {/* 5-Stems Mute / Solo Toggles */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    onClick={() => toggleStem('lead')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      stemsMuted.lead ? 'bg-red-500/20 text-red-400 line-through' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    Lead
                  </button>
                  <button
                    onClick={() => toggleStem('chords')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      stemsMuted.chords ? 'bg-red-500/20 text-red-400 line-through' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    Chords
                  </button>
                  <button
                    onClick={() => toggleStem('bass')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      stemsMuted.bass ? 'bg-red-500/20 text-red-400 line-through' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    808 Bass
                  </button>
                  <button
                    onClick={() => toggleStem('drums')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      stemsMuted.drums ? 'bg-red-500/20 text-red-400 line-through' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    Drums
                  </button>
                  <button
                    onClick={() => toggleStem('vocals')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      stemsMuted.vocals ? 'bg-red-500/20 text-red-400 line-through' : 'bg-purple-600/30 text-purple-200'
                    }`}
                  >
                    Vocals
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Lyrics & Vocal Structure */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-400" /> Full Lyrics &amp; Vocal Score
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                ISRC: {activeTrack.spotifyMetadata.isrc}
              </span>
            </div>

            <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              {activeTrack.lyrics}
            </pre>
          </div>

          {/* Card: Discography & Quick Social Release Buttons */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Disc className="w-4 h-4 text-rose-400" /> Creation Catalog ({tracks.length})
              </span>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Spotify &amp; Social Ready</span>
              </div>
            </div>

            <div className="space-y-2">
              {tracks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTrack(t);
                    if (isPlaying) {
                      musicPlayer.stop();
                      setTimeout(() => musicPlayer.play(t), 200);
                    }
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    activeTrack.id === t.id
                      ? 'bg-rose-500/10 border-rose-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎵</span>
                    <div>
                      <h4 className="font-bold text-xs">{t.title}</h4>
                      <p className="text-[10px] text-slate-400">
                        {t.genre} • {t.bpm} BPM • {t.key} • {t.vocalSettings?.name || 'Vampiee AI'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTrack(t);
                        setShowSocialModal(true);
                      }}
                      className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[10px] font-semibold border border-rose-500/30 flex items-center gap-1"
                    >
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>Social Pack</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTrack(t);
                        setShowSpotifyModal(true);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700"
                    >
                      Spotify Hub
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spotify Release Modal */}
      {showSpotifyModal && (
        <SpotifyReleaseModal
          track={activeTrack}
          onClose={() => setShowSpotifyModal(false)}
          onUpdateTrack={(updated) => {
            setActiveTrack(updated);
            setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          }}
        />
      )}

      {/* Social Media Exporter Modal */}
      {showSocialModal && (
        <SocialExportModal
          track={activeTrack}
          isOpen={showSocialModal}
          onClose={() => setShowSocialModal(false)}
        />
      )}
    </div>
  );
};
