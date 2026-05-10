import { execSync } from "child_process";
import { homedir } from "os";
import { existsSync } from "fs";
import { IPlatformProvider, IProcessManager } from "./types";
import { generateBashCompletion, generateZshCompletion } from "./completion-helpers";

const CHROME_CANDIDATES = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

function getChromePids(exact = false): number[] {
  const names = ["chrome", "google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
  const pids: number[] = [];
  for (const name of names) {
    try {
      const flag = exact ? "-x" : "-f";
      const output = execSync(`pgrep ${flag} "${name}"`, { encoding: "utf-8" });
      output
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => parseInt(line.trim(), 10))
        .filter((pid) => !isNaN(pid) && !pids.includes(pid))
        .forEach((pid) => pids.push(pid));
    } catch {
      // pgrep exits with code 1 when no matches found
    }
  }
  return pids;
}

function getProcessArgs(pid: number): string {
  try {
    return execSync(`ps -p "${pid}" -o args=`, { encoding: "utf-8" }).trim();
  } catch {
    return "?";
  }
}

function getProcessName(pid: number): string {
  try {
    return execSync(`ps -p "${pid}" -o comm=`, { encoding: "utf-8" }).trim();
  } catch {
    return "?";
  }
}

function killPid(pid: number, signal: "TERM" | "KILL"): boolean {
  try {
    execSync(`kill -${signal} "${pid}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function isChromeRunning(): boolean {
  return getChromePids(true).length > 0;
}

const processManager: IProcessManager = {
  getChromePids,
  getProcessArgs,
  getProcessName,
  killPid,
  isChromeRunning,
};

function findChrome(): string {
  for (const candidate of CHROME_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return CHROME_CANDIDATES[0];
}

export const linuxProvider: IPlatformProvider = {
  name: "linux",

  getChromeExecutablePath(): string {
    return findChrome();
  },

  getDefaultChromeDataDir(): string {
    return `${homedir()}/.config/google-chrome`;
  },

  getProcessManager(): IProcessManager {
    return processManager;
  },

  supportedShells(): string[] {
    return ["bash", "zsh"];
  },

  generateCompletion(shell: string, profileDirs: string[]): string {
    switch (shell) {
      case "bash":
        return generateBashCompletion(profileDirs);
      case "zsh":
        return generateZshCompletion(profileDirs);
      default:
        throw new Error(`Unsupported shell: ${shell}`);
    }
  },
};
