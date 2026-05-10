import { spawn } from "child_process";
import { existsSync } from "fs";
import { isChromeRunning } from "../utils/process";

interface LaunchOptions {
  dir?: string;
  profile?: string;
  debug?: boolean;
  debuggingPort?: string;
}

export function launchCommand(options: LaunchOptions): void {
  const chromeBin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
    const { execSync } = require("child_process");
    const existing = execSync('pgrep -x "Google Chrome" | tr "\\n" " " | sed "s/ $//"', { encoding: "utf-8" }).trim();
    if (existing) {
      console.error(`Warning: Chrome is already running (PIDs: ${existing})`);
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
