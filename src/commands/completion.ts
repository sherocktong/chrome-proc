import { getPlatform } from "../platform";
import { readLocalState } from "../utils/localState";

export function completionCommand(shell: string): void {
  const platform = getPlatform();
  const shells = platform.supportedShells();
  if (!shells.includes(shell)) {
    console.error(`Error: unsupported shell '${shell}'. Supported: ${shells.join(", ")}`);
    process.exit(1);
  }
  console.log(platform.generateCompletion(shell, getProfileDirs()));
}

function getProfileDirs(): string[] {
  try {
    const state = readLocalState();
    return Object.keys(state.profile?.info_cache ?? {});
  } catch {
    return [];
  }
}
