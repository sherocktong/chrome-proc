import { getPlatform } from "../platform";

export function getChromePids(exact = false): number[] {
  return getPlatform().getProcessManager().getChromePids(exact);
}

export function getProcessArgs(pid: number): string {
  return getPlatform().getProcessManager().getProcessArgs(pid);
}

export function getProcessName(pid: number): string {
  return getPlatform().getProcessManager().getProcessName(pid);
}

export function extractDebugPort(args: string): number | null {
  const match = args.match(/--remote-debugging-port=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function killPid(pid: number, signal: "TERM" | "KILL"): boolean {
  return getPlatform().getProcessManager().killPid(pid, signal);
}

export function isChromeRunning(): boolean {
  return getPlatform().getProcessManager().isChromeRunning();
}
