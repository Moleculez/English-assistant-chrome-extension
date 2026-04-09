import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/card";
import { Button } from "@/ui/components/button";
import { Separator } from "@/ui/components/separator";
import { ExternalLink } from "lucide-react";
import { getManifestName, getManifestVersion } from "@/lib/utils/manifest";

interface AboutSectionProps {
  onReset: () => void;
}

export function AboutSection({ onReset }: AboutSectionProps) {
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onReset();
    setConfirming(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{getManifestName()}</CardTitle>
          <CardDescription>Version {getManifestVersion()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            An ESL reading aid that simplifies English text on any webpage. Select
            text to get AI-powered explanations tailored to your reading level.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href="https://github.com/Moleculez/English-assistant-chrome-extension"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub Repository
          </a>
          <a
            href="https://github.com/Moleculez/English-assistant-chrome-extension/wiki"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Documentation
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reset</CardTitle>
          <CardDescription>
            Restore all settings to their defaults.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center gap-3">
            <Button
              variant={confirming ? "destructive" : "outline"}
              onClick={handleReset}
            >
              {confirming ? "Confirm Reset" : "Reset All Settings"}
            </Button>
            {confirming && (
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            )}
          </div>
          {confirming && (
            <p className="mt-2 text-sm text-destructive">
              This will erase your API keys and all preferences.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
