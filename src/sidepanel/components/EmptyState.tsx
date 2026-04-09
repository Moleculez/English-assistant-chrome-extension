import { BookOpen, Highlighter, MousePointerClick } from "lucide-react";
import { Card, CardContent } from "../../ui/components/card";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="relative mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 p-5 dark:from-indigo-950 dark:to-purple-950">
          <BookOpen className="h-10 w-10 text-indigo-500 animate-[pulse_3s_ease-in-out_infinite]" />
        </div>
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 animate-[ping_2s_ease-in-out_infinite]" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400" />
      </div>

      <h2 className="text-base font-semibold">Easy English Reader</h2>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-[280px]">
        Select any text on a webpage and click the purple button to simplify it
      </p>

      <Card className="mt-8 w-full max-w-[280px] bg-gradient-to-b from-card to-muted/30">
        <CardContent className="space-y-4 p-4">
          <Step
            number={1}
            icon={<Highlighter className="h-4 w-4 text-indigo-500" />}
            title="Highlight text"
            description="Select any text on a webpage"
          />
          <Step
            number={2}
            icon={<MousePointerClick className="h-4 w-4 text-purple-500" />}
            title="Click the button"
            description="Use the popup or right-click menu"
          />
          <Step
            number={3}
            icon={<BookOpen className="h-4 w-4 text-emerald-500" />}
            title="Read simplified version"
            description="Easy English appears right here"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-medium">
          <span className="text-muted-foreground mr-1.5">{number}.</span>
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
