// Speech recognition & synthesis utility for Vampiee Desktop Assistant

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onStateChangeCallback: ((listening: boolean, speaking: boolean) => void) | null = null;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initRecognition();
    this.initVoices();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.notifyState();
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (this.onTranscriptCallback) {
            if (finalTranscript) {
              this.onTranscriptCallback(finalTranscript, true);
            } else if (interimTranscript) {
              this.onTranscriptCallback(interimTranscript, false);
            }
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          this.notifyState();
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.notifyState();
        };
      } catch (err) {
        console.warn('Speech recognition initialization error:', err);
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const pickBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for a calm, crisp, charismatic voice (e.g. Google UK English Male, Daniel, Oliver, or standard en-US/en-GB)
      const preferred = voices.find(v => 
        (v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('George') || v.name.includes('Male') || v.name.includes('Natural')) && 
        v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      
      this.voice = preferred || null;
    };

    pickBestVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = pickBestVoice;
    }
  }

  public isVoiceSupported(): boolean {
    return typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public setCallbacks(
    onTranscript: (text: string, isFinal: boolean) => void,
    onStateChange: (listening: boolean, speaking: boolean) => void
  ) {
    this.onTranscriptCallback = onTranscript;
    this.onStateChangeCallback = onStateChange;
  }

  public startListening() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      console.warn('Speech recognition not supported on this browser');
      return false;
    }

    try {
      this.stopSpeaking();
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Error starting recognition:', e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    // Clean text of markdown asterisks and URLs for speech
    const cleanText = text
      .replace(/[*#_`>~]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    // Set a charismatic, measured pitch and rate for Vampiee
    utterance.pitch = 0.92;
    utterance.rate = 1.05;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifyState();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notifyState();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.notifyState();
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.notifyState();
    }
  }

  private notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.isListening, this.isSpeaking);
    }
  }
}

export const speechService = new SpeechService();
