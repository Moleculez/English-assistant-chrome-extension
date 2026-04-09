import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Easy English Reader",
  version: "0.2.2",
  description:
    "ESL reading aid - select text and get simplified English explanations",
  permissions: ["sidePanel", "contextMenus", "storage", "activeTab", "tabs"],
  host_permissions: ["http://localhost:*", "http://127.0.0.1:*", "https://*/*"],
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/content-script.ts"],
      css: ["src/content/content.css"],
      run_at: "document_idle",
    },
  ],
  side_panel: { default_path: "src/sidepanel/index.html" },
  options_ui: { page: "src/options/index.html", open_in_tab: true },
  icons: {
    "16": "public/icons/icon-16.png",
    "48": "public/icons/icon-48.png",
    "128": "public/icons/icon-128.png",
  },
  commands: {
    "simplify-selection": {
      suggested_key: { default: "Ctrl+Shift+E", mac: "Command+Shift+E" },
      description: "Simplify selected text",
    },
  },
});
