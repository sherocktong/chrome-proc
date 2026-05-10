import { execSync } from "child_process";
import { existsSync } from "fs";
import { IPlatformProvider, IProcessManager } from "./types";
import { generatePowerShellCompletion } from "./completion-helpers";

function getChromePids(_exact = false): number[] {
  try {
    const output = execSync(
      `tasklist /FI "IMAGENAME eq chrome.exe" /FO CSV /NH`,
      { encoding: "utf-8" }
    ).trim();
    if (!output || output.startsWith("INFO:")) return [];
    return output
      .split("\n")
      .map((line) => {
        const match = line.match(/^"[^"]+","(\d+)"/);
        return match ? parseInt(match[1], 10) : NaN;
      })
      .filter((pid) => !isNaN(pid));
  } catch {
    return [];
  }
}

function getProcessArgs(pid: number): string {
  try {
    const output = execSync(
      `powershell.exe -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \\"ProcessId=${pid}\\").CommandLine"`,
      { encoding: "utf-8" }
    ).trim();
    return output || "?";
  } catch {
    return "?";
  }
}

function getProcessName(pid: number): string {
  try {
    const output = execSync(
      `tasklist /FI "PID eq ${pid}" /FO CSV /NH`,
      { encoding: "utf-8" }
    ).trim();
    if (!output || output.startsWith("INFO:")) return "?";
    const match = output.match(/^"([^"]+)"/);
    return match ? match[1] : "?";
  } catch {
    return "?";
  }
}

function killPid(pid: number, signal: "TERM" | "KILL"): boolean {
  try {
    const forceFlag = signal === "KILL" ? "/F" : "";
    execSync(`taskkill /PID ${pid} /T ${forceFlag}`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function isChromeRunning(): boolean {
  return getChromePids().length > 0;
}

const processManager: IProcessManager = {
  getChromePids,
  getProcessArgs,
  getProcessName,
  killPid,
  isChromeRunning,
};

function findChrome(): string {
  const candidates: string[] = [];
  if (process.env.LOCALAPPDATA) {
    candidates.push(`${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`);
  }
  if (process.env.PROGRAMFILES) {
    candidates.push(`${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`);
  }
  if (process.env["PROGRAMFILES(X86)"]) {
    candidates.push(`${process.env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`);
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return candidates[0] || "chrome.exe";
}

export const win32Provider: IPlatformProvider = {
  name: "win32",

  getChromeExecutablePath(): string {
    return findChrome();
  },

  getDefaultChromeDataDir(): string {
    if (process.env.LOCALAPPDATA) {
      return `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data`;
    }
    return `${process.env.USERPROFILE || ""}\\AppData\\Local\\Google\\Chrome\\User Data`;
  },

  getProcessManager(): IProcessManager {
    return processManager;
  },

  supportedShells(): string[] {
    return ["powershell"];
  },

  generateCompletion(shell: string, profileDirs: string[]): string {
    switch (shell) {
      case "powershell":
        return generatePowerShellCompletion(profileDirs);
      default:
        throw new Error(`Unsupported shell: ${shell}`);
    }
  },
};
