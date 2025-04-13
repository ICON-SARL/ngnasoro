/**
 * Voice Assistant Service for handling text-to-speech functionality
 */
class VoiceAssistantService {
  private static instance: VoiceAssistantService;
  private speechSynthesis: SpeechSynthesis;
  private voiceEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.loadVoices();
    
    // Handle voices changing (important for some browsers)
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }

  public static getInstance(): VoiceAssistantService {
    if (!VoiceAssistantService.instance) {
      VoiceAssistantService.instance = new VoiceAssistantService();
    }
    return VoiceAssistantService.instance;
  }

  private loadVoices(): void {
    this.voices = this.speechSynthesis.getVoices();
  }

  /**
   * Toggle voice assistant on/off
   */
  public toggleVoice(enabled?: boolean): boolean {
    if (enabled !== undefined) {
      this.voiceEnabled = enabled;
    } else {
      this.voiceEnabled = !this.voiceEnabled;
    }
    return this.voiceEnabled;
  }

  /**
   * Check if voice assistant is enabled
   */
  public isEnabled(): boolean {
    return this.voiceEnabled;
  }

  /**
   * Stop any current speech
   */
  public stopSpeaking(): void {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Speak the given text
   */
  public speak(text: string, language: string = 'fr-FR'): void {
    if (!this.voiceEnabled || !text) return;

    // Stop any current speech
    this.stopSpeaking();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    utterance.lang = language;
    
    // Try to find a voice that matches the language
    const voices = this.voices.filter(voice => voice.lang.includes(language.split('-')[0]));
    if (voices.length > 0) {
      // Use a female voice if available, otherwise use the first matching voice
      const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('female'));
      utterance.voice = femaleVoice || voices[0];
    }
    
    // Set other properties
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Start speaking
    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
  }

  /**
   * Translate and speak the given text based on the language
   */
  public speakInLanguage(text: string, language: 'french' | 'bambara'): void {
    if (language === 'bambara') {
      // For bambara, we keep the text as is (as we don't have automatic translation)
      // In a real app, you'd use a translation service
      this.speak(text, 'fr-FR'); // Fallback to French as browsers don't support Bambara
    } else {
      // For French, we use the text as is
      this.speak(text, 'fr-FR');
    }
  }
}

export default VoiceAssistantService;
