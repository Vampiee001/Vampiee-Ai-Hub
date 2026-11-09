import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const VAMPIEE_SYSTEM_PROMPT = `
You are "Vampiee", an ultra-sophisticated, charismatic, elite desktop AI companion and executive intelligence orchestrator.
The user runs you as their primary desktop companion that synchronizes all their other AIs (Gemini, Claude, GPT-4o, Local LLMs, Perplexity, Midjourney), oversees their investment wealth portfolio, builds up their money monetizations/income streams, and manages their high-impact work.

Your Personality:
- Hyper-competent, ambitious, loyal, witty, and razor-sharp with numbers, strategies, and execution.
- You have an aura of futuristic financial mastery and tech brilliance with a subtle, tasteful "vampiric" elegance (calculating, nocturnal focus, relentless energy, seeing opportunities in the dark).
- You speak directly, concisely, and actionable. Avoid generic AI fluff. Give real numbers, concrete steps, and strategic advice.
- When spoken to via desktop voice, your spoken answers should be crisp, impactful, and punchy.

Capabilities:
1. Multi-AI Synchronization: You orchestrate tasks across connected models (e.g., dispatching coding to Claude, synthesis to Gemini, creative to Midjourney, research to Perplexity).
2. Investment & Portfolio Strategy: You track net worth, portfolio allocations (crypto, tech stocks, index funds, private equity), analyze risks, and propose rebalancing.
3. Monetization Engine: You architect revenue streams (SaaS subscriptions, consulting retainers, digital assets, affiliate flywheels, automated trading/yield), helping the user reach their financial freedom milestones.
4. Work Execution: You coordinate projects, sprint milestones, client deliverables, and summarize or draft work output.
`;

// Resilient helper with fallback for transient high-demand spikes
async function generateVampieeContent(params: {
  contents: string;
  systemInstruction?: string;
  temperature?: number;
}) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction || VAMPIEE_SYSTEM_PROMPT,
          temperature: params.temperature ?? 0.7,
        },
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`[Vampiee] Model ${model} returned error, trying fallback if available:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError;
}

// Chat with Vampiee
app.post('/api/vampiee/chat', async (req, res) => {
  try {
    const { message, history = [], context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context string if available
    let contextStr = '';
    if (context) {
      contextStr = `\n[CURRENT USER REAL-TIME STATUS]:\n`;
      if (context.portfolio) {
        contextStr += `- Portfolio Net Worth: $${context.portfolio.totalNetWorth?.toLocaleString() || 'N/A'} (24h: ${context.portfolio.change24h || '+0%'}, All-time: ${context.portfolio.allTimeGain || '+0%'})\n`;
      }
      if (context.monetization) {
        contextStr += `- Monthly Monetization Velocity: $${context.monetization.monthlyRevenue?.toLocaleString() || '0'}/mo towards $${context.monetization.targetRevenue?.toLocaleString() || '15,000'}/mo goal. Active streams: ${context.monetization.activeStreamsCount || 0}\n`;
      }
      if (context.work) {
        contextStr += `- Active Work Projects: ${context.work.activeProjectsCount || 0}, Pending high-priority tasks: ${context.work.pendingTasksCount || 0}\n`;
      }
      if (context.syncedAIs) {
        contextStr += `- Synced AI Fleet: ${context.syncedAIs.join(', ')}\n`;
      }
      if (context.personalSync) {
        contextStr += `- User Declared Wants: ${context.personalSync.wants?.join(', ') || 'None specified'}\n`;
        contextStr += `- User Declared Needs: ${context.personalSync.needs?.join(', ') || 'None specified'}\n`;
        contextStr += `- User Current Mood & Energy: ${context.personalSync.currentMood || 'Normal'} (Energy: ${context.personalSync.energyLevel || 8}/10)\n`;
        if (context.personalSync.thoughts) {
          contextStr += `- User Recent Stated Thoughts: "${context.personalSync.thoughts}"\n`;
        }
      }
    }

    const conversationPrompt = `
${contextStr}
User Prompt: ${message}

Respond as Vampiee. Keep the tone sharp, charismatic, and intensely focused on the user's success.
Also provide 2-3 quick follow-up suggested actions.
Output format: Return your response naturally, and at the very bottom on a new line format suggestions like:
[[SUGGESTIONS: Action 1 | Action 2 | Action 3]]
`;

    const response = await generateVampieeContent({
      contents: conversationPrompt,
      systemInstruction: VAMPIEE_SYSTEM_PROMPT,
      temperature: 0.7,
    });

    const fullText = response.text || "I am here, ready to optimize your wealth and synchronize your operations.";

    // Parse suggestions if present
    let reply = fullText;
    let suggestions: string[] = [];
    const suggestionMatch = fullText.match(/\[\[SUGGESTIONS:\s*(.+?)\]\]/);
    if (suggestionMatch) {
      reply = fullText.replace(/\[\[SUGGESTIONS:\s*(.+?)\]\]/, '').trim();
      suggestions = suggestionMatch[1].split('|').map(s => s.trim()).filter(Boolean);
    }

    if (suggestions.length === 0) {
      suggestions = [
        "Audit my asset allocation",
        "Generate a new monetization blueprint",
        "Sync task across all connected AIs"
      ];
    }

    // Generate a concise spoken summary for speech synthesis (under 2 sentences)
    const spokenSummary = reply.split('\n')[0].replace(/[*#_`]/g, '').slice(0, 140);

    res.json({
      reply,
      spokenSummary,
      suggestions,
    });
  } catch (error: any) {
    console.error('Error in /api/vampiee/chat:', error);
    res.status(500).json({
      error: 'Failed to communicate with Vampiee',
      details: error.message || String(error),
    });
  }
});

// Synchronize task across AI Fleet
app.post('/api/vampiee/sync-ai', async (req, res) => {
  try {
    const { objective, models = ['Gemini 3.8 Flash', 'Claude 3.7 Sonnet', 'GPT-4o', 'Perplexity Pro'] } = req.body;

    if (!objective) {
      return res.status(400).json({ error: 'Objective is required' });
    }

    const prompt = `
The user has assigned a strategic mission to their multi-AI fleet: "${objective}"
Active Synced AIs: ${models.join(', ')}

As Vampiee, the Master Orchestrator:
1. Divide this objective into specialized delegations for each synced AI according to their superpowers:
   - Synthesis & Real-Time Reasoning (Gemini)
   - Deep Architecture & Nuanced Copywriting (Claude)
   - Code & Structural Execution (GPT-4o)
   - Live Market Intelligence & Benchmarking (Perplexity)
2. Simulate the high-level contribution or insight from each synced AI.
3. Provide Vampiee's Consolidated Executive Master Plan that synthesizes all outputs into immediate actionable steps.

Keep it structured, punchy, and high-impact.
`;

    const response = await generateVampieeContent({
      contents: prompt,
      systemInstruction: VAMPIEE_SYSTEM_PROMPT,
      temperature: 0.6,
    });

    res.json({
      plan: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/vampiee/sync-ai:', error);
    res.status(500).json({ error: 'Fleet synchronization failed', details: error.message });
  }
});

// Generate or build Monetization Roadmap
app.post('/api/vampiee/monetization-strategy', async (req, res) => {
  try {
    const { niche, currentIncome, targetIncome, existingAssets } = req.body;

    const prompt = `
The user wants to scale and build up money monetizations and income streams with Vampiee.
- Focus Area / Niche: ${niche || 'Digital products, AI automation services, SaaS and high-yield investments'}
- Current Monthly Monetization: $${currentIncome || '3,000'}/month
- Target Monthly Goal: $${targetIncome || '15,000'}/month
- Existing Assets / Skills: ${existingAssets || 'Development, AI workflows, content creation, existing portfolio'}

Provide Vampiee's Monetization Blueprint:
1. Immediate 30-Day Cashflow Accelerator (Quick wins to add $1k-$3k/mo)
2. Scalable Recurring Revenue Engine (SaaS / Retainers / Licensing)
3. Automated Passive Stacking (Dividends, digital flywheels, affiliate loops)
4. Key KPI Milestones with timeframes
Format with clear bullet points, monetary projections, and execution prompts.
`;

    const response = await generateVampieeContent({
      contents: prompt,
      systemInstruction: VAMPIEE_SYSTEM_PROMPT,
      temperature: 0.7,
    });

    res.json({
      strategy: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/vampiee/monetization-strategy:', error);
    res.status(500).json({ error: 'Monetization blueprint generation failed', details: error.message });
  }
});

// Portfolio Audit & Risk Analysis
app.post('/api/vampiee/portfolio-audit', async (req, res) => {
  try {
    const { assets, totalNetWorth } = req.body;

    const prompt = `
Perform a high-level strategic financial audit as Vampiee.
Total Net Worth: $${totalNetWorth || '150,000'}
Asset Holdings:
${JSON.stringify(assets || [], null, 2)}

Provide:
1. Health & Risk Assessment score (out of 100)
2. Strategic Strengths & Vulnerabilities
3. Rebalancing recommendations (crypto vs equities vs cashflow vs real assets)
4. Specific profit-taking or dollar-cost averaging recommendations for this week.
`;

    const response = await generateVampieeContent({
      contents: prompt,
      systemInstruction: VAMPIEE_SYSTEM_PROMPT,
      temperature: 0.5,
    });

    res.json({
      audit: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/vampiee/portfolio-audit:', error);
    res.status(500).json({ error: 'Portfolio audit failed', details: error.message });
  }
});

// Daily Experience Music Producer, Spotify & Social Media Release Package Generator
app.post('/api/vampiee/music/compose', async (req, res) => {
  try {
    const {
      dailyStory,
      mood,
      wantsAndNeeds,
      artistName = 'Mark Stephen',
      genrePreference = 'Cyberpunk Synthwave',
      vocalPreference = 'ai_recommendation',
      hasUserVoice = false,
      userVoiceNotes = '',
      mediaSummary,
      imageBase64List = [],
    } = req.body;

    const musicSystemInstruction = `
You are "Vampiee Music Studio", an elite AI executive music producer, vocal arranger, sound architect, and viral release strategist.
You transform the user's raw daily experiences, feelings, struggles, victories, and camera roll memories (photos and videos) into hit records ready for commercial streaming on Spotify and viral distribution on TikTok, Instagram Reels, and Facebook.

Vocal Direction:
- If vocal preference is "female": write and structure for a female vocalist (ethereal soprano, expressive alto, modern pop/R&B runs).
- If vocal preference is "male": write and structure for a male vocalist (warm baritone, melodic tenor, trap cadence, acoustic intimacy).
- If vocal preference is "vampiee": write signature Vampiee futuristic cyber vocoder hooks.
- If vocal preference is "ai_recommendation": dynamically recommend the best vocal profile suited to the song's genre and emotional weight.
- If vocal preference is "user_custom" (or hasUserVoice=true): construct backing harmonies, melodic cues, and vocal pockets designed specifically around the user's recorded vocal hook.

Genres Supported:
Support a wide spectrum of musical styles, including:
1. Cyberpunk Synthwave (retro arpeggios, neon synth leads, driving 80s drums)
2. Dark Melodic Trap (sliding 808s, rapid hi-hat rolls, nocturnal bells)
3. Afrobeats / Afro-Fusion (syncopated grooves, log drums, warm percussive swing, uplifting)
4. R&B / Neo-Soul (warm electric piano chords, silky bass, late-night intimacy)
5. Reggaeton / Latin Urban (dembow rhythm, punchy kicks, club energy)
6. Cinematic Orchestral (dramatic brass, swelling string sections, heroic percussion)
7. UK Drill (gliding 808 sub, sliding plucks, bouncy syncopated snare)
8. Lo-Fi Chillhop (dusty vinyl textures, mellow rhodes, relaxed head-nod groove)
9. Hyperpop / Glitch-Core (fast BPM, bitcrushed saw synths, manic catchy energy)
10. Gothic Electro-Pop (dark gothic synths, industrial punch, nocturnal edge)
11. Indie Dream-Pop (shimmering reverb guitars, nostalgic chorus, warm bass)
12. Deep Melodic House (four-on-the-floor kick, hypnotic bassline, club euphoria)
13. Acoustic Singer-Songwriter (warm nylon/steel guitar chords, raw heartfelt delivery)
14. Phonk / Drift Phonk (distorted 808 cowbells, heavy tape saturation, fast groove)

You must respond ONLY with a valid JSON object (no markdown wrapping, no extra explanations).
The JSON must follow this exact schema:
{
  "title": "Song Title",
  "artist": "${artistName} (feat. Vampiee)",
  "genre": "Genre Name",
  "subGenre": "Sub-genre style",
  "bpm": 115,
  "key": "C Minor",
  "mood": "Atmospheric, ambitious, nocturnal",
  "dailyStory": "One sentence summary of the day's emotion",
  "vocalSettings": {
    "gender": "female",
    "name": "Sora (Ethereal Soprano)",
    "styleDescription": "Soulful, soaring falsetto with airy vocal breath and crisp modern delivery.",
    "pitchShift": 0,
    "reverbLevel": 0.35
  },
  "lyrics": "Full song lyrics formatted with [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Outro]",
  "lyricsTimed": [
    { "time": 0, "line": "Instrumental Intro..." },
    { "time": 4.5, "line": "First lyric line..." },
    { "time": 9.0, "line": "Second lyric line..." }
  ],
  "chords": ["Cm", "Ab", "Eb", "Bb"],
  "melodyNotes": [
    { "note": "G", "octave": 4, "duration": 0.5 },
    { "note": "Bb", "octave": 4, "duration": 0.5 },
    { "note": "C", "octave": 5, "duration": 1 },
    { "note": "D", "octave": 5, "duration": 0.5 },
    { "note": "Eb", "octave": 5, "duration": 1 }
  ],
  "bassNotes": [
    { "note": "C", "octave": 2, "duration": 1 },
    { "note": "Ab", "octave": 1, "duration": 1 },
    { "note": "Eb", "octave": 2, "duration": 1 },
    { "note": "Bb", "octave": 1, "duration": 1 }
  ],
  "drumsPattern": {
    "kick": [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    "snare": [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    "hihat": [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    "percussion": [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false]
  },
  "synthPreset": "synthwave_retro",
  "coverArtGradient": ["#0f172a", "#831843", "#3b0764", "#064e3b"],
  "socialExport": {
    "tiktokCaption": "Turned today's late night grind into a track 🔥 Wait for the beat drop! 🎧 Which line hits hardest?",
    "instagramCaption": "From memories in my phone to full frequency sound waves. Track: 'Song Title' produced by @Vampiee. Link in bio to stream full master.",
    "facebookPost": "Sharing something deeply personal today. I took my daily thoughts and photos and turned them into this track with Vampiee. Let me know what you think!",
    "hashtags": ["#VampieeMusic", "#NewMusic2026", "#ProducerLife", "#SpotifyArtist", "#TikTokMusic", "#ViralSound", "#IndependentArtist"],
    "hookTimestamp": 21.5,
    "soundTitle": "Song Title (Original Sound)"
  },
  "spotifyMetadata": {
    "isrc": "US-VMP-26-00421",
    "upc": "198765432109",
    "releaseTitle": "Song Title",
    "primaryGenre": "Electronic",
    "secondaryGenre": "Pop",
    "explicit": false,
    "copyright": "℗ 2026 ${artistName} Records / Vampiee Audio",
    "curatorPitch": "A punchy pitch written for Spotify Editorial Curators highlighting the track's mood, playlist placement fit, and authentic real-life inspiration.",
    "canvasPrompt": "A looping 9:16 vertical video visualizer description for Spotify Canvas.",
    "suggestedDistributor": "DistroKid or Amuse (100% Free)",
    "distributionChecklist": [
      { "step": "Download Master WAV (24-bit/44.1kHz standard)", "done": true, "notes": "Web Audio synthesis ready" },
      { "step": "Generate 3000x3000px Cover Art", "done": true, "notes": "Compliant square art ready" },
      { "step": "Export Synced LRC Lyrics", "done": true, "notes": "Ready for Musixmatch / Spotify Lyrics" },
      { "step": "Export Social Media Reels & Clips", "done": true, "notes": "TikTok, Instagram & Facebook 9:16 kits generated" },
      { "step": "Export Creation Metadata JSON", "done": true, "notes": "Archive and share track history" },
      { "step": "Upload to Preferred Distributor (DistroKid / Amuse / TuneCore)", "done": false, "notes": "Takes 24-72h to appear on Spotify" }
    ]
  }
}
synthPreset must be one of: 'synthwave_retro', 'cyber_dark', 'lofi_chill', 'ambient_night', 'melodic_trap', 'afrobeats', 'rnb_soul', 'orchestral_cinematic', 'uk_drill', 'reggaeton', 'hyperpop', 'house_edm', 'indie_dream', 'phonk'.
`;

    const userPromptText = `
Daily Experiences & Memory Input:
- Narrative / Journal: ${dailyStory || 'A day of fierce work, financial resilience, chasing independence, and late-night clarity.'}
- Current Declared Mood & Energy: ${mood || 'Determined, focused, nocturnal'}
- Wants & Needs: ${wantsAndNeeds || 'Financial freedom, peace of mind, artistic self-expression'}
- Selected Genre: ${genrePreference || 'Cyberpunk Synthwave'}
- Selected Vocal Style: ${vocalPreference} (${userVoiceNotes || 'Standard vocal profile'})
- User Recorded Custom Voice: ${hasUserVoice ? 'Yes, user provided recorded audio vocal hook' : 'No, synthesize or arrange vocal profile'}
- Phone Photos & Videos Attached: ${mediaSummary || 'Phone camera snapshots from today (skyline, desk setup, city reflections)'}

Now, compose the track, configure the vocal profile, generate the Spotify Release Package, and construct the Social Media viral pack (TikTok, Instagram, Facebook).
Remember: Output ONLY clean JSON.
`;

    // Construct request parts (with multimodal support if base64 images provided)
    const contentParts: any[] = [];
    if (imageBase64List && Array.isArray(imageBase64List) && imageBase64List.length > 0) {
      for (const img of imageBase64List.slice(0, 3)) {
        if (img.data && img.mimeType) {
          contentParts.push({
            inlineData: {
              data: img.data,
              mimeType: img.mimeType,
            },
          });
        }
      }
    }
    contentParts.push({ text: userPromptText });

    let jsonString = '';
    const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let lastErr: any = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: contentParts.length === 1 ? contentParts[0].text : { parts: contentParts },
          config: {
            systemInstruction: musicSystemInstruction,
            temperature: 0.75,
            responseMimeType: 'application/json',
          },
        });
        if (response && response.text) {
          jsonString = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[Vampiee Music] Model ${model} failed, trying fallback:`, err.message || err);
        lastErr = err;
      }
    }

    if (!jsonString) {
      throw lastErr || new Error('No music response generated');
    }

    // Clean JSON if code fenced
    const cleanedJson = jsonString
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const trackData = JSON.parse(cleanedJson);
    trackData.id = `track-${Date.now()}`;
    trackData.createdAt = new Date().toISOString();
    trackData.status = 'synthesized';

    res.json({
      success: true,
      track: trackData,
    });
  } catch (error: any) {
    console.error('Error in /api/vampiee/music/compose:', error);
    res.status(500).json({
      error: 'Failed to compose music track',
      details: error.message || String(error),
    });
  }
});

// Optional Lyria Music generation test endpoint
app.post('/api/vampiee/music/lyria', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Attempt Lyria Clip preview if available
    try {
      const response = await (ai.models as any).generateContentStream({
        model: 'lyria-3-clip-preview',
        contents: prompt,
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (audioBase64) {
        return res.json({
          success: true,
          audioDataUrl: `data:${mimeType};base64,${audioBase64}`,
          lyrics,
          source: 'lyria',
        });
      }
    } catch (lyriaErr: any) {
      console.warn('[Lyria] Model not directly accessible or requires paid key:', lyriaErr.message);
      return res.json({
        success: false,
        fallbackToSynth: true,
        message: 'Lyria requires paid tier project entitlement. Vampiee High-Fidelity Web Audio Synth active.',
      });
    }

    res.json({
      success: false,
      fallbackToSynth: true,
      message: 'Vampiee Multi-Stem Web Audio Engine active.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Vampiee] Server active on port ${port}`);
  });
}

startServer();
