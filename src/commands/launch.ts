import { spawn } from "child_process";
import { existsSync } from "fs";
import { getPlatform } from "../platform";
import { isChromeRunning, getChromePids } from "../utils/process";

interface LaunchOptions {
  dir?: string;
  profile?: string;
  debug?: boolean;
  debuggingPort?: string;
}

export function launchCommand(options: LaunchOptions): void {
  const chromeBin = getPlatform().getChromeExecutablePath();
  const profile = options.profile ?? process.env.CHROME_PROFILE ?? "";
  const dataDir = options.dir ?? process.env.CHROME_DATA_DIR ?? "";

  if (!existsSync(chromeBin)) {
    console.error(`Error: Chrome not found at ${chromeBin}`);
    process.exit(1);
  }

  if (!dataDir) {
    console.error("Error: CHROME_DATA_DIR environment variable is not set and --dir was not provided");
    process.exit(1);
  }

  const args: string[] = [];
  args.push(`--user-data-dir=${dataDir}`);
  if (profile) {
    args.push(`--profile-directory=${profile}`);
  }

  if (options.debug) {
    const port = options.debuggingPort ?? "9222";
    args.push(`--remote-debugging-port=${port}`);
  } else if (options.debuggingPort) {
    console.error("Warning: --debugging-port is ignored without --debug");
  }

  if (isChromeRunning()) {
    const existing = getChromePids(true);
    if (existing.length > 0) {
      console.error(`Warning: Chrome is already running (PIDs: ${existing.join(" ")})`);
    }
  }

  console.log("Launching Chrome...");
  console.log(`  binary:   ${chromeBin}`);
  console.log(`  data dir: ${dataDir}`);
  if (profile) {
    console.log(`  profile:  ${profile}`);
  }
  if (options.debug) {
    console.log(`  debug:    port ${options.debuggingPort ?? "9222"}`);
  }

  // Spawn detached so it survives parent exit, with stdio ignored
  const child = spawn(chromeBin, args, {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  console.log(`Chrome started (pid=${child.pid})`);
}
