#!/usr/bin/env node

/**
 * Pack the built extension into a .zip for Chrome Web Store distribution
 * and a .crx-ready folder for local distribution.
 *
 * Usage:
 *   node scripts/pack.mjs          # uses version from manifest
 *   node scripts/pack.mjs 1.2.0    # overrides version
 */

import { execSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from "fs";
import { join, resolve } from "path";
import { createRequire } from "module";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const RELEASE_DIR = join(ROOT, "releases");

// Read version from manifest or CLI arg
const versionArg = process.argv[2];
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
const version = versionArg || pkg.version || "0.1.0";

console.log(`\n📦 Packing Easy English Reader v${version}\n`);

// Step 1: Clean build
console.log("1. Building extension...");
execSync("npm run build", { cwd: ROOT, stdio: "inherit" });

if (!existsSync(join(DIST, "manifest.json"))) {
  console.error("❌ Build failed — dist/manifest.json not found");
  process.exit(1);
}

// Step 2: Verify manifest
const manifest = JSON.parse(readFileSync(join(DIST, "manifest.json"), "utf-8"));
console.log(`   Manifest: ${manifest.name} v${manifest.version}`);
console.log(`   Permissions: ${manifest.permissions.join(", ")}`);

// Step 3: Create releases directory
mkdirSync(RELEASE_DIR, { recursive: true });

// Step 4: Create .zip for Chrome Web Store
const zipName = `easy-english-reader-v${version}.zip`;
const zipPath = join(RELEASE_DIR, zipName);

// Remove old zip if exists
if (existsSync(zipPath)) rmSync(zipPath);

console.log(`\n2. Creating ${zipName}...`);

// Use tar on Windows (git bash) or zip
try {
  // Try PowerShell Compress-Archive (works on Windows)
  execSync(
    `powershell -Command "Compress-Archive -Path '${DIST}\\*' -DestinationPath '${zipPath}' -Force"`,
    { cwd: ROOT, stdio: "pipe" }
  );
} catch {
  try {
    // Fallback: use zip command (Linux/Mac/Git Bash)
    execSync(`cd "${DIST}" && zip -r "${zipPath}" .`, { stdio: "pipe" });
  } catch {
    console.error("❌ Could not create zip. Install zip or use PowerShell.");
    process.exit(1);
  }
}

const zipSize = readFileSync(zipPath).length;
console.log(`   ✅ ${zipPath} (${(zipSize / 1024).toFixed(0)} KB)`);

// Step 5: Summary
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Release package ready!

  📁 ${zipPath}

To distribute:
  • Chrome Web Store: Upload the .zip at https://chrome.google.com/webstore/devconsole
  • Manual install: Unzip and load as unpacked extension in chrome://extensions
  • Share: Send the .zip file directly

To test before publishing:
  1. Go to chrome://extensions
  2. Enable "Developer mode"
  3. Click "Load unpacked" → select the dist/ folder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
