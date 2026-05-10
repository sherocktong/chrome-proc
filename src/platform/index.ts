import { IPlatformProvider } from "./types";
import { darwinProvider } from "./darwin";
import { linuxProvider } from "./linux";
import { win32Provider } from "./win32";

const providers: Record<string, IPlatformProvider> = {
  darwin: darwinProvider,
  linux: linuxProvider,
  win32: win32Provider,
};

export function getPlatform(): IPlatformProvider {
  const p = providers[process.platform];
  if (!p) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  return p;
}
