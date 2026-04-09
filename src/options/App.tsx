import { ThemeProvider } from "@/ui/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/tabs";
import { Badge } from "@/ui/components/badge";
import { ProviderConfig } from "./components/ProviderConfig";
import { PreferencesForm } from "./components/PreferencesForm";
import { AboutSection } from "./components/AboutSection";
import { useSettings } from "./use-settings";
import { DEFAULT_SETTINGS } from "@/lib/storage/types";
import { getManifestVersion } from "@/lib/utils/manifest";

function OptionsPage() {
  const { settings, updateSettings, loaded } = useSettings();

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Easy English Reader Settings
          </h1>
          <Badge variant="secondary">v{getManifestVersion()}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your AI provider, reading preferences, and more.
        </p>
      </div>

      <Tabs defaultValue="provider">
        <TabsList className="w-full">
          <TabsTrigger value="provider" className="flex-1">
            Provider
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex-1">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="about" className="flex-1">
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="provider" className="mt-6">
          <ProviderConfig
            provider={settings.provider}
            onChange={(provider) => updateSettings({ provider })}
          />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <PreferencesForm settings={settings} onChange={updateSettings} />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <AboutSection
            onReset={() => updateSettings({ ...DEFAULT_SETTINGS })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <OptionsPage />
    </ThemeProvider>
  );
}
