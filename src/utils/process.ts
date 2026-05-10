import { execSync } from "child_process";

export function getChromePids(exact = false): number[] {
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

export function getProcessArgs(pid: number): string {
  try {
    return execSync(`ps -p "${pid}" -o args=`, { encoding: "utf-8" }).trim();
  } catch {
    return "?";
  }
}

export function getProcessName(pid: number): string {
  try {
    return execSync(`ps -p "${pid}" -o comm=`, { encoding: "utf-8" }).trim();
  } catch {
    return "?";
  }
}

export function extractDebugPort(args: string): number | null {
  const match = args.match(/--remote-debugging-port=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function killPid(pid: number, signal: "TERM" | "KILL"): boolean {
  try {
    execSync(`/bin/kill -${signal} "${pid}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function isChromeRunning(): boolean {
  return getChromePids(true).length > 0;
}
