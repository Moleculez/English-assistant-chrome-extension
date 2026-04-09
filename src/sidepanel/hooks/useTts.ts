import { useCallback, useEffect, useRef, useState } from "react";
import type { TtsProvider } from "../../lib/storage/types";

interface UseTtsReturn {
  speak: (text: string, options?: TtsOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
}

interface TtsOptions {
  voiceURI?: string;
  provider?: TtsProvider;
  coquiServerUrl?: string;
}

const BROWSER_TTS =
  typeof window !== "undefined" && "speechSynthesis" in window;

export function useTts(): UseTtsReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
  }, []);

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

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    if (voiceURI) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); utteranceRef.current = null; };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); utteranceRef.current = null; };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakWithCoqui = useCallback(async (text: string, serverUrl: string) => {
    try {
      setIsPlaying(true);
      setIsPaused(false);

      const response = await fetch(`${serverUrl}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "en" }),
      });

      if (!response.ok) throw new Error(`TTS server error: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audioRef.current = audio;
      await audio.play();
    } catch {
      setIsPlaying(false);
      setIsPaused(false);
      // Fall back to browser TTS
      speakWithBrowser(text);
    }
  }, [speakWithBrowser]);

  const speak = useCallback((text: string, options?: TtsOptions) => {
    stop();
    const provider = options?.provider ?? "browser";
    if (provider === "coqui" && options?.coquiServerUrl) {
      speakWithCoqui(text, options.coquiServerUrl);
    } else {
      speakWithBrowser(text, options?.voiceURI);
    }
  }, [stop, speakWithBrowser, speakWithCoqui]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (BROWSER_TTS) {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    } else if (BROWSER_TTS) {
      window.speechSynthesis.resume();
    }
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  return { speak, pause, resume, stop, isPlaying, isPaused, isSupported: true };
}
