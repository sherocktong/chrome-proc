import { execSync } from "child_process";
import { homedir } from "os";
import { IPlatformProvider, IProcessManager } from "./types";
import { generateBashCompletion, generateZshCompletion } from "./completion-helpers";

const CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function getChromePids(exact = false): number[] {
  try {
    const flag = exact ? "-x" : "-f";
    const output = execSync(`pgrep ${flag} "Google Chrome"`, { encoding: "utf-8" });
    return output
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => parseInt(line.trim(), 10))
      .filter((pid) => !isNaN(pid));
  } catch {
    return [];
  }
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
    execSync(`/bin/kill -${signal} "${pid}"`, { stdio: "pipe" });
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

export const darwinProvider: IPlatformProvider = {
  name: "darwin",

  getChromeExecutablePath(): string {
    return CHROME_BIN;
  },

  getDefaultChromeDataDir(): string {
    return `${homedir()}/Library/Application Support/Google/Chrome`;
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
