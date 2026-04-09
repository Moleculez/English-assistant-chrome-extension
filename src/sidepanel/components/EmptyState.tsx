import { BookOpen, MousePointerClick, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-full bg-indigo-50 p-4 dark:bg-indigo-950">
        <BookOpen className="h-8 w-8 text-indigo-500" />
      </div>

      <h2 className="mt-4 text-base font-semibold">
        Select text to get started
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px]">
        Highlight any text on a webpage to get an easy-to-read English version.
      </p>

      <div className="mt-8 space-y-4 text-left w-full max-w-[240px]">
        <Step
          icon={<MousePointerClick className="h-4 w-4 text-indigo-500" />}
          title="Highlight text"
          description="Select text on any webpage"
        />
        <Step
          icon={<Sparkles className="h-4 w-4 text-indigo-500" />}
          title="Click the icon"
          description="Or use the right-click menu"
        />
        <Step
          icon={<BookOpen className="h-4 w-4 text-indigo-500" />}
          title="Get easy English"
          description="Read the simplified version here"
        />
      </div>
    </div>
  );
}

function Step({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md bg-indigo-50 p-1.5 dark:bg-indigo-950">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
