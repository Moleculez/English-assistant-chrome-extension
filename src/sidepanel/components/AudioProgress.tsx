import { cn } from "../../ui/cn";

interface AudioProgressProps {
  progress: number;
  duration: number;
  canSeek: boolean;
  isActive: boolean;
  onSeek?: (time: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioProgress({
  progress,
  duration,
  canSeek,
  isActive,
  onSeek,
}: AudioProgressProps) {
  if (!isActive) return null;

  const elapsed = duration * progress;
  const pct = Math.min(progress * 100, 100);

  return (
    <div className="px-3 pb-2 space-y-1">
      <div
        className="group relative h-1.5 w-full cursor-pointer rounded-full bg-muted"
        onClick={(e) => {
          if (!canSeek || !onSeek || duration <= 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          onSeek(ratio * duration);
        }}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            canSeek ? "bg-indigo-500" : "bg-indigo-400"
          )}
          style={{ width: `${pct}%` }}
        />
        {canSeek && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-indigo-500 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${pct}% - 6px)` }}
          />
        )}
      </div>
      {duration > 0 && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
