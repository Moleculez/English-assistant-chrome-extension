import { Card, CardContent, CardHeader } from "../../ui/components/card";
import { Skeleton } from "../../ui/components/skeleton";

interface LoadingStateProps {
  selectedText: string;
}

export function LoadingState({ selectedText }: LoadingStateProps) {
  const truncated =
    selectedText.length > 100
      ? selectedText.slice(0, 100) + "..."
      : selectedText;

  return (
    <div className="space-y-3 p-4">
      {/* Original text preview */}
      <Card>
        <CardHeader className="p-3 pb-0">
          <p className="text-xs text-muted-foreground">Analyzing...</p>
        </CardHeader>
        <CardContent className="p-3 pt-1.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {truncated}
          </p>
        </CardContent>
      </Card>

      {/* Simplified skeleton */}
      <Card>
        <CardHeader className="p-3 pb-0">
          <Skeleton className="h-3 w-16" />
        </CardHeader>
        <CardContent className="p-3 pt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>

      {/* Why skeleton */}
      <Card>
        <CardHeader className="p-3 pb-0">
          <Skeleton className="h-3 w-8" />
        </CardHeader>
        <CardContent className="p-3 pt-2 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </CardContent>
      </Card>

      {/* Glossary skeleton */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
