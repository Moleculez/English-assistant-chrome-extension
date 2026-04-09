import { useCallback, useEffect, useRef, useState } from "react";
import type { TtsProvider } from "../../lib/storage/types";

export interface UseTtsReturn {
  speak: (text: string, options?: TtsOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentWordIndex: number;
  progress: number;
  duration: number;
  canSeek: boolean;
}

interface TtsOptions {
  voiceURI?: string;
  provider?: TtsProvider;
  coquiServerUrl?: string;
  wordCount?: number;
}

const BROWSER_TTS =
  typeof window !== "undefined" && "speechSynthesis" in window;

function charIndexToWordIndex(text: string, charIndex: number): number {
  const before = text.slice(0, charIndex);
  return before.split(/\s+/).filter(Boolean).length;
}

export function useTts(): UseTtsReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canSeek, setCanSeek] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordCountRef = useRef(0);
  const textLengthRef = useRef(0);

  const resetTracking = useCallback(() => {
    setCurrentWordIndex(-1);
    setProgress(0);
    setDuration(0);
    setCanSeek(false);
  }, []);

  const stop = useCallback(() => {
    if (BROWSER_TTS) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    resetTracking();
  }, [resetTracking]);

  useEffect(() => {
    return () => {
      if (BROWSER_TTS) window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const speakWithBrowser = useCallback((text: string, voiceURI?: string) => {
    if (!BROWSER_TTS) return;
    window.speechSynthesis.cancel();

    textLengthRef.current = text.length;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    if (voiceURI) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utterance.onend = () => {
      setIsPlaying(false); setIsPaused(false);
      utteranceRef.current = null;
      resetTracking();
    };
    utterance.onerror = () => {
      setIsPlaying(false); setIsPaused(false);
      utteranceRef.current = null;
      resetTracking();
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === "word") {
        setCurrentWordIndex(charIndexToWordIndex(text, event.charIndex));
        setProgress(textLengthRef.current > 0 ? event.charIndex / textLengthRef.current : 0);
      }
    };

    utteranceRef.current = utterance;
    setCanSeek(false);
    window.speechSynthesis.speak(utterance);
  }, [resetTracking]);

  const speakWithCoqui = useCallback(async (text: string, serverUrl: string, wordCount: number) => {
    try {
      setIsPlaying(true);
      setIsPaused(false);
      wordCountRef.current = wordCount;

      const response = await fetch(`${serverUrl}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "en" }),
      });

      if (!response.ok) throw new Error(`TTS server error: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        setCanSeek(true);
      };

      audio.ontimeupdate = () => {
        if (audio.duration > 0) {
          const p = audio.currentTime / audio.duration;
          setProgress(p);
          if (wordCountRef.current > 0) {
            setCurrentWordIndex(Math.floor(p * wordCountRef.current));
          }
        }
      };

      audio.onended = () => {
        setIsPlaying(false); setIsPaused(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        resetTracking();
      };
      audio.onerror = () => {
        setIsPlaying(false); setIsPaused(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        resetTracking();
      };

      audioRef.current = audio;
      await audio.play();
    } catch {
      setIsPlaying(false); setIsPaused(false);
      resetTracking();
      speakWithBrowser(text);
    }
  }, [speakWithBrowser, resetTracking]);

  const speak = useCallback((text: string, options?: TtsOptions) => {
    stop();
    const provider = options?.provider ?? "browser";
    const wordCount = options?.wordCount ?? text.split(/\s+/).filter(Boolean).length;
    if (provider === "coqui" && options?.coquiServerUrl) {
      speakWithCoqui(text, options.coquiServerUrl, wordCount);
    } else {
      speakWithBrowser(text, options?.voiceURI);
    }
  }, [stop, speakWithBrowser, speakWithCoqui]);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    else if (BROWSER_TTS) window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) audioRef.current.play();
    else if (BROWSER_TTS) window.speechSynthesis.resume();
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  return {
    speak, pause, resume, stop, seek,
    isPlaying, isPaused, isSupported: true,
    currentWordIndex, progress, duration, canSeek,
  };
}
