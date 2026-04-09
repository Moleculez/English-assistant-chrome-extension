import { useEffect, useState } from "react";
import type { CEFRLevel } from "@/lib/llm/types";
import type { UserSettings } from "@/lib/storage/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/card";
import { Label } from "@/ui/components/label";
import { Input } from "@/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { Switch } from "@/ui/components/switch";
import { Separator } from "@/ui/components/separator";

const CEFR_OPTIONS: Array<{ value: CEFRLevel; label: string }> = [
  { value: "A2", label: "A2 - Easy" },
  { value: "B1", label: "B1 - Medium" },
  { value: "B2", label: "B2 - Precise" },
];

const THEME_OPTIONS: Array<{
  value: UserSettings["theme"];
  label: string;
}> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

interface PreferencesFormProps {
  settings: UserSettings;
  onChange: (patch: Partial<UserSettings>) => void;
}

export function PreferencesForm({ settings, onChange }: PreferencesFormProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const available = speechSynthesis.getVoices();
      setVoices(available);
    };
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  return (
    <div className="space-y-6">
      {/* Reading Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reading Level</CardTitle>
          <CardDescription>
            Set the default difficulty for simplified text.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="cefr-level">Default CEFR Level</Label>
            <Select
              value={settings.defaultLevel}
              onValueChange={(value) =>
                onChange({ defaultLevel: value as CEFRLevel })
              }
            >
              <SelectTrigger id="cefr-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CEFR_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              A2 uses simple words and short sentences. B2 preserves more
              nuance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the extension.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme-select">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) =>
                onChange({ theme: value as UserSettings["theme"] })
              }
            >
              <SelectTrigger id="theme-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Text-to-Speech */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Text-to-Speech</CardTitle>
          <CardDescription>
            Have simplified text read aloud.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tts-toggle">Enable TTS</Label>
              <p className="text-xs text-muted-foreground">
                Show a play button on simplified text.
              </p>
            </div>
            <Switch
              id="tts-toggle"
              checked={settings.ttsEnabled}
              onCheckedChange={(checked) => onChange({ ttsEnabled: checked })}
            />
          </div>
          {settings.ttsEnabled && voices.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="tts-voice">Voice</Label>
                <Select
                  value={settings.ttsVoice || "__default__"}
                  onValueChange={(value) =>
                    onChange({ ttsVoice: value === "__default__" ? "" : value })
                  }
                >
                  <SelectTrigger id="tts-voice">
                    <SelectValue placeholder="Default voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">Default</SelectItem>
                    {voices.map((v) => (
                      <SelectItem key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Privacy & Data</CardTitle>
          <CardDescription>
            Control what data is sent and stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="minimal-context">
                Send minimal context only
              </Label>
              <p className="text-xs text-muted-foreground max-w-xs">
                Only send the selected text to the AI, without surrounding page
                context. May reduce accuracy.
              </p>
            </div>
            <Switch
              id="minimal-context"
              checked={settings.sendMinimalContext}
              onCheckedChange={(checked) =>
                onChange({ sendMinimalContext: checked })
              }
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="max-history">Max history items</Label>
            <Input
              id="max-history"
              type="number"
              min={10}
              max={100}
              value={settings.maxHistoryItems}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 10 && val <= 100) {
                  onChange({ maxHistoryItems: val });
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Number of past look-ups to keep (10-100).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
