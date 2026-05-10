export interface IProcessManager {
  getChromePids(exact?: boolean): number[];
  getProcessArgs(pid: number): string;
  getProcessName(pid: number): string;
  killPid(pid: number, signal: "TERM" | "KILL"): boolean;
  isChromeRunning(): boolean;
}

export interface IPlatformProvider {
  readonly name: "darwin" | "linux" | "win32";
  getChromeExecutablePath(): string;
  getDefaultChromeDataDir(): string;
  getProcessManager(): IProcessManager;
  supportedShells(): string[];
  generateCompletion(shell: string, profileDirs: string[]): string;
}
