import { Pause, Square, Volume2 } from "lucide-react";
import { Button } from "../../ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/components/tooltip";
import type { UseTtsReturn } from "../hooks/useTts";
import type { TtsProvider } from "../../lib/storage/types";
import { countWords } from "../../lib/utils/text";

interface TtsButtonProps {
  text: string;
  tts: UseTtsReturn;
  voiceURI?: string;
  ttsProvider?: TtsProvider;
  coquiServerUrl?: string;
}

export function TtsButton({ text, tts, voiceURI, ttsProvider, coquiServerUrl }: TtsButtonProps) {
  const { speak, pause, resume, stop, isPlaying, isPaused } = tts;

  const handleClick = () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text, { voiceURI, provider: ttsProvider, coquiServerUrl, wordCount: countWords(text) });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClick}
            aria-label={isPlaying ? "Pause" : isPaused ? "Resume" : "Listen"}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isPlaying ? "Pause" : isPaused ? "Resume" : "Listen"}
        </TooltipContent>
      </Tooltip>

      {(isPlaying || isPaused) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={stop}
              aria-label="Stop"
            >
              <Square className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Stop</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
