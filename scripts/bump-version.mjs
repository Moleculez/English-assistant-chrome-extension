#!/usr/bin/env node

/**
 * Bump the extension version in both package.json and manifest.config.ts.
 *
 * Usage:
 *   node scripts/bump-version.mjs patch   # 0.1.0 → 0.1.1
 *   node scripts/bump-version.mjs minor   # 0.1.0 → 0.2.0
 *   node scripts/bump-version.mjs major   # 0.1.0 → 1.0.0
 *   node scripts/bump-version.mjs 2.0.0   # set exact version
 */

import { readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const PKG_PATH = join(ROOT, "package.json");
const MANIFEST_PATH = join(ROOT, "manifest.config.ts");

const bumpType = process.argv[2];
if (!bumpType) {
  console.error("Usage: node scripts/bump-version.mjs <patch|minor|major|x.y.z>");
  process.exit(1);
}

// Read current version
const pkg = JSON.parse(readFileSync(PKG_PATH, "utf-8"));
const current = pkg.version;
const [major, minor, patch] = current.split(".").map(Number);

// Calculate new version
let newVersion;
if (bumpType === "patch") newVersion = `${major}.${minor}.${patch + 1}`;
else if (bumpType === "minor") newVersion = `${major}.${minor + 1}.0`;
else if (bumpType === "major") newVersion = `${major + 1}.0.0`;
else if (/^\d+\.\d+\.\d+$/.test(bumpType)) newVersion = bumpType;
else {
  console.error(`Invalid bump type: ${bumpType}`);
  process.exit(1);
}

// Update package.json
pkg.version = newVersion;
writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + "\n");

// Update manifest.config.ts
let manifestSrc = readFileSync(MANIFEST_PATH, "utf-8");
manifestSrc = manifestSrc.replace(
  /version:\s*"[^"]+"/,
  `version: "${newVersion}"`
);
writeFileSync(MANIFEST_PATH, manifestSrc);

console.log(`✅ Version bumped: ${current} → ${newVersion}`);
console.log(`   Updated: package.json, manifest.config.ts`);
