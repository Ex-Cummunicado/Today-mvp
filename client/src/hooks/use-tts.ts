import { useState, useCallback, useEffect } from 'react';

interface TTSConfig {
  enabled: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface TTSState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
}

export const useTTS = (config: TTSConfig = { enabled: true }) => {
  const [state, setState] = useState<TTSState>({
    isSupported: false,
    isSpeaking: false,
    isPaused: false,
    voices: [],
    currentVoice: null
  });

  // Check TTS support and load voices
  useEffect(() => {
    const isSupported = 'speechSynthesis' in window;
    setState(prev => ({ ...prev, isSupported }));

    if (isSupported) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setState(prev => ({
          ...prev,
          voices,
          currentVoice: voices.find(v => v.lang.startsWith('en')) || voices[0] || null
        }));
      };

      // Load voices immediately
      loadVoices();

      // Load voices when they become available
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const speak = useCallback((text: string, options?: Partial<TTSConfig>) => {
    if (!state.isSupported || !config.enabled) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply configuration
    if (state.currentVoice) {
      utterance.voice = state.currentVoice;
    }
    utterance.rate = options?.rate || config.rate || 1.0;
    utterance.pitch = options?.pitch || config.pitch || 1.0;
    utterance.volume = options?.volume || config.volume || 0.8;

    // Event handlers
    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true, isPaused: false }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
    };

    utterance.onerror = (event) => {
      console.error('TTS Error:', event.error);
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
    };

    speechSynthesis.speak(utterance);
  }, [state.isSupported, state.currentVoice, config]);

  const pause = useCallback(() => {
    if (state.isSupported && state.isSpeaking) {
      speechSynthesis.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [state.isSupported, state.isSpeaking]);

  const resume = useCallback(() => {
    if (state.isSupported && state.isPaused) {
      speechSynthesis.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [state.isSupported, state.isPaused]);

  const stop = useCallback(() => {
    if (state.isSupported) {
      speechSynthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
    }
  }, [state.isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState(prev => ({ ...prev, currentVoice: voice }));
  }, []);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    setVoice
  };
};

// Hook for automatic TTS on page changes
export const useAutoTTS = (text: string, enabled: boolean = true) => {
  const tts = useTTS({ enabled });

  useEffect(() => {
    if (enabled && text && tts.isSupported) {
      // Small delay to ensure page has loaded
      const timer = setTimeout(() => {
        tts.speak(text);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [text, enabled, tts]);

  return tts;
};
