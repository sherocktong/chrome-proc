import { existsSync, rmSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import {
  getChromeDataDir,
  readLocalState,
  writeLocalState,
  profileExists,
  validateProfileDir,
} from "../utils/localState";
import { isChromeRunning } from "../utils/process";
import { padEnd } from "../utils/format";

interface ProfileListOptions {
  json?: boolean;
}

export function profileList(options: ProfileListOptions): void {
  const dataDir = getChromeDataDir();
  const localStatePath = join(dataDir, "Local State");

  if (!existsSync(localStatePath)) {
    console.error(`Error: Local State not found at ${localStatePath}`);
    process.exit(1);
  }

  const state = readLocalState();
  const cache = state.profile?.info_cache ?? {};

  if (options.json) {
    for (const [dir, info] of Object.entries(cache)) {
      console.log(JSON.stringify({ dir, name: info.name }));
    }
    return;
  }

  console.log(`${padEnd("DIR", 20)}  NAME`);
  console.log(`${padEnd("---", 20)}  ----`);
  for (const [dir, info] of Object.entries(cache)) {
    console.log(`${padEnd(dir, 20)}  ${info.name}`);
  }
}

export function profileName(profileDir: string, newName: string): void {
  const state = readLocalState();

  if (!profileExists(profileDir, state)) {
    console.error(`Error: profile directory '${profileDir}' not found in Local State`);
    process.exit(1);
  }

  state.profile = state.profile ?? {};
  state.profile.info_cache = state.profile.info_cache ?? {};
  state.profile.info_cache[profileDir].name = newName;
  writeLocalState(state);
  console.log(`Renamed '${profileDir}' to '${newName}'`);
}

export async function profileDelete(profileDir: string): Promise<void> {
  const dataDir = getChromeDataDir();
  const state = readLocalState();

  if (!profileExists(profileDir, state)) {
    console.error(`Error: profile directory '${profileDir}' not found in Local State`);
    process.exit(1);
  }

  const profilePath = join(dataDir, profileDir);
  if (existsSync(profilePath)) {
    validateProfileDir(profileDir);
  }

  if (isChromeRunning()) {
    console.error("Warning: Chrome is currently running. Deleting a profile while Chrome is active may cause data loss.");
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>((resolve) => {
      rl.question("Are you sure you want to continue? [y/N] ", (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    });
    if (answer !== "y" && answer !== "Y") {
      console.error("Aborted.");
      process.exit(1);
    }
  }

  if (existsSync(profilePath)) {
    rmSync(profilePath, { recursive: true, force: true });
    console.log(`Deleted directory '${profilePath}'`);
  }

  delete state.profile!.info_cache![profileDir];
  writeLocalState(state);
  console.log(`Removed '${profileDir}' from Local State`);
}
