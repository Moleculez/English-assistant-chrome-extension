export function getManifestVersion(): string {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return "0.1.0";
  }
}

export function getManifestName(): string {
  try {
    return chrome.runtime.getManifest().name;
  } catch {
    return "Easy English Reader";
  }
}
