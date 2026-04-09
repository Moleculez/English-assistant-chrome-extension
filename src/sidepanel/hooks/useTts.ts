import { useCallback, useEffect, useRef, useState } from "react";

interface UseTtsReturn {
  speak: (text: string, voiceURI?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
}

const TTS_SUPPORTED =
  typeof window !== "undefined" && "speechSynthesis" in window;

export function useTts(): UseTtsReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (!TTS_SUPPORTED) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (TTS_SUPPORTED) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, voiceURI?: string) => {
    if (!TTS_SUPPORTED) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    if (voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.voiceURI === voiceURI);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const pause = useCallback(() => {
    if (!TTS_SUPPORTED) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (!TTS_SUPPORTED) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isSupported: TTS_SUPPORTED,
  };
}
