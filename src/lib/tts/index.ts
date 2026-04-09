export interface TtsOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  lang?: string;
}

export interface TtsController {
  speak(text: string, options?: TtsOptions): void;
  pause(): void;
  resume(): void;
  stop(): void;
  isPlaying(): boolean;
  isPaused(): boolean;
  isSpeaking(): boolean;
  onEnd(callback: () => void): void;
  onError(callback: (error: string) => void): void;
  getVoices(): SpeechSynthesisVoice[];
  getEnglishVoices(): SpeechSynthesisVoice[];
  dispose(): void;
}

const DEFAULT_RATE = 0.9;
const DEFAULT_PITCH = 1;
const DEFAULT_VOLUME = 1;
const DEFAULT_LANG = "en-US";

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function createNoopController(): TtsController {
  return {
    speak() {},
    pause() {},
    resume() {},
    stop() {},
    isPlaying: () => false,
    isPaused: () => false,
    isSpeaking: () => false,
    onEnd() {},
    onError() {},
    getVoices: () => [],
    getEnglishVoices: () => [],
    dispose() {},
  };
}

export function createTtsController(): TtsController {
  if (!isTtsSupported()) {
    return createNoopController();
  }

  const synth = window.speechSynthesis;
  let endCallbacks: Array<() => void> = [];
  let errorCallbacks: Array<(error: string) => void> = [];
  let disposed = false;

  // Ensure voices are loaded (some browsers load them asynchronously)
  const triggerVoiceLoad = (): void => {
    synth.getVoices();
  };
  triggerVoiceLoad();
  synth.addEventListener("voiceschanged", triggerVoiceLoad);

  const findVoice = (name: string): SpeechSynthesisVoice | undefined => {
    const voices = synth.getVoices();
    return voices.find((v) => v.name === name || v.voiceURI === name);
  };

  const speak = (text: string, options?: TtsOptions): void => {
    if (disposed) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? DEFAULT_RATE;
    utterance.pitch = options?.pitch ?? DEFAULT_PITCH;
    utterance.volume = options?.volume ?? DEFAULT_VOLUME;
    utterance.lang = options?.lang ?? DEFAULT_LANG;

    if (options?.voice) {
      const found = findVoice(options.voice);
      if (found) {
        utterance.voice = found;
      }
    }

    utterance.addEventListener("end", () => {
      for (const cb of endCallbacks) cb();
    });

    utterance.addEventListener("error", (event) => {
      const msg = event.error ?? "Unknown TTS error";
      for (const cb of errorCallbacks) cb(msg);
    });

    synth.speak(utterance);
  };

  const pause = (): void => {
    if (!disposed) synth.pause();
  };

  const resume = (): void => {
    if (!disposed) synth.resume();
  };

  const stop = (): void => {
    if (!disposed) synth.cancel();
  };

  const isPlaying = (): boolean => synth.speaking && !synth.paused;

  const isPaused = (): boolean => synth.paused;

  const isSpeaking = (): boolean => synth.speaking;

  const onEnd = (callback: () => void): void => {
    endCallbacks.push(callback);
  };

  const onError = (callback: (error: string) => void): void => {
    errorCallbacks.push(callback);
  };

  const getVoices = (): SpeechSynthesisVoice[] => {
    return synth.getVoices();
  };

  const getEnglishVoices = (): SpeechSynthesisVoice[] => {
    return synth.getVoices().filter((v) => v.lang.startsWith("en"));
  };

  const dispose = (): void => {
    disposed = true;
    synth.cancel();
    synth.removeEventListener("voiceschanged", triggerVoiceLoad);
    endCallbacks = [];
    errorCallbacks = [];
  };

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isSpeaking,
    onEnd,
    onError,
    getVoices,
    getEnglishVoices,
    dispose,
  };
}
