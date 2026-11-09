export type AssetType = 'crypto' | 'stock' | 'etf' | 'cash' | 'real_estate' | 'private_equity';

export interface InvestmentAsset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  change24h: number;
  notes?: string;
}

export type MonetizationCategory = 'saas' | 'consulting' | 'digital_product' | 'content' | 'yield' | 'affiliate';

export interface MonetizationStream {
  id: string;
  name: string;
  category: MonetizationCategory;
  monthlyRevenue: number;
  targetMonthlyRevenue: number;
  growthRate: number; // percentage
  status: 'active' | 'scaling' | 'incubating' | 'paused';
  description: string;
}

export interface WorkTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignedAI?: string;
  dueDate?: string;
}

export interface WorkProject {
  id: string;
  title: string;
  clientOrDomain: string;
  status: 'active' | 'review' | 'planning' | 'completed';
  progress: number;
  deadline: string;
  budgetOrValue?: number;
  tasks: WorkTask[];
}

export interface SyncedAIModel {
  id: string;
  name: string;
  provider: string;
  role: string;
  status: 'online' | 'synced' | 'standby';
  avatarColor: string;
  latencyMs: number;
  contextTokens: number;
  specialty: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'vampiee' | 'system';
  text: string;
  timestamp: string;
  spokenSummary?: string;
  suggestions?: string[];
  category?: 'chat' | 'investment' | 'monetization' | 'work' | 'ai_sync' | 'mind_sync' | 'music';
}

export interface PersonalSyncState {
  wants: string[];
  needs: string[];
  currentMood: string;
  energyLevel: number; // 1-10
  thoughts: string;
  lastUpdated: string;
}

export interface MediaAttachment {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string; // base64 or blob URL
  previewUrl: string;
  caption?: string;
  takenAt?: string;
}

export interface SpotifyReleasePackage {
  isrc: string;
  upc: string;
  releaseTitle: string;
  primaryGenre: string;
  secondaryGenre: string;
  explicit: boolean;
  copyright: string;
  curatorPitch: string;
  canvasPrompt: string;
  suggestedDistributor: string;
  distributionChecklist: { step: string; done: boolean; notes: string }[];
}

export type VocalGender = 'female' | 'male' | 'vampiee' | 'ai_recommendation' | 'user_custom';

export interface VocalSettings {
  gender: VocalGender;
  name: string;
  styleDescription: string;
  customVoiceDataUrl?: string; // Captured audio from user's microphone
  customVoiceDuration?: number; // duration in seconds
  pitchShift?: number;
  reverbLevel?: number;
}

export interface SocialExportData {
  tiktokCaption: string;
  instagramCaption: string;
  facebookPost: string;
  hashtags: string[];
  hookTimestamp: number;
  soundTitle: string;
}

export type SynthPresetType =
  | 'synthwave_retro'
  | 'cyber_dark'
  | 'lofi_chill'
  | 'ambient_night'
  | 'melodic_trap'
  | 'afrobeats'
  | 'rnb_soul'
  | 'orchestral_cinematic'
  | 'uk_drill'
  | 'reggaeton'
  | 'hyperpop'
  | 'house_edm'
  | 'indie_dream'
  | 'phonk';

export interface DailyMusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  subGenre: string;
  bpm: number;
  key: string;
  mood: string;
  dailyStory: string;
  mediaAttachments: MediaAttachment[];
  lyrics: string;
  lyricsTimed: { time: number; line: string }[];
  chords: string[];
  melodyNotes: { note: string; octave: number; duration: number }[];
  bassNotes: { note: string; octave: number; duration: number }[];
  drumsPattern: {
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    percussion: boolean[];
  };
  synthPreset: SynthPresetType | string;
  vocalSettings?: VocalSettings;
  socialExport?: SocialExportData;
  spotifyMetadata: SpotifyReleasePackage;
  coverArtGradient?: string[];
  coverArtDataUrl?: string;
  audioDataUrl?: string;
  createdAt: string;
  status: 'draft' | 'synthesized' | 'ready_for_spotify' | 'distributed';
}

export type AvatarStyle = 'cartoon' | 'orb';
export type ActiveTab = 'chat' | 'apps' | 'music' | 'contacts' | 'mind_sync' | 'ai_sync' | 'investments' | 'monetization' | 'work';
export type ViewMode = 'studio' | 'desktop_overlay';

export type AppCategory = 'trading' | 'crypto_dex' | 'productivity' | 'social_music' | 'ai_tools' | 'custom';

export interface ConnectedAppItem {
  id: string;
  name: string;
  url: string;
  category: AppCategory;
  description: string;
  iconType: string;
  isTradingApp: boolean;
  isPinned: boolean;
  badge?: string;
  accentColor?: string;
  accountIdentifier?: string;
  notes?: string;
  lastOpened?: string;
}

export interface LiveMarketTicker {
  symbol: string;
  name: string;
  price: string;
  change24h: number;
  high24h: string;
  low24h: string;
  volume: string;
  tradeUrl: string;
  tradingViewSymbol: string;
}

export interface TradeJournalEntry {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  positionSize: string;
  leverage?: string;
  platform: string;
  status: 'planned' | 'open' | 'closed';
  pnl?: number;
  notes: string;
  createdAt: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  hangoutLink?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
    self?: boolean;
  }>;
  status?: string;
  colorId?: string;
  category?: 'meeting' | 'deep_work' | 'deadline' | 'review' | 'general';
}


