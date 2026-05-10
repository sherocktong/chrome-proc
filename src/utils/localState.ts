import { readFileSync, writeFileSync, existsSync, realpathSync, rmSync } from "fs";
import { join, resolve } from "path";

export interface ProfileEntry {
  name: string;
}

export interface LocalState {
  profile?: {
    info_cache?: Record<string, ProfileEntry>;
  };
}

export function getChromeDataDir(): string {
  const dir = process.env.CHROME_DATA_DIR;
  if (!dir) {
    throw new Error("CHROME_DATA_DIR environment variable is not set");
  }
  return dir;
}

export function getLocalStatePath(): string {
  return join(getChromeDataDir(), "Local State");
}

export function readLocalState(): LocalState {
  const path = getLocalStatePath();
  if (!existsSync(path)) {
    throw new Error(`Local State not found at ${path}`);
  }
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as LocalState;
}

export function writeLocalState(data: LocalState): void {
  const path = getLocalStatePath();
  const tmpPath = `${path}.tmp.${process.pid}`;
  try {
    writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    // Atomic rename
    const { renameSync } = require("fs");
    renameSync(tmpPath, path);
  } catch (err) {
    try {
      rmSync(tmpPath);
    } catch {}
    throw new Error("failed to update Local State");
  }
}

export function profileExists(dir: string, state?: LocalState): boolean {
  const s = state || readLocalState();
  return !!s.profile?.info_cache?.[dir];
}

export function validateProfileDir(profileDir: string): void {
  const dataDir = getChromeDataDir();
  const profilePath = resolve(dataDir, profileDir);
  const realDataDir = realpathSync(dataDir);
  const realProfilePath = realpathSync(profilePath);
  if (!realProfilePath.startsWith(realDataDir)) {
    throw new Error(`profile path '${profilePath}' is not inside CHROME_DATA_DIR`);
  }
}
