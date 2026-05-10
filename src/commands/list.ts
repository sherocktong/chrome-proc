import { getChromePids, getProcessArgs, getProcessName, extractDebugPort } from "../utils/process";
import { padEnd } from "../utils/format";

interface ListOptions {
  verbose?: boolean;
  json?: boolean;
}

export function listCommand(options: ListOptions): void {
  const pids = getChromePids(true);

  if (pids.length === 0) {
    console.log("(no Chrome processes found)");
    return;
  }

  if (options.json) {
    for (const pid of pids) {
      const cmd = getProcessArgs(pid);
      const port = extractDebugPort(cmd);
      const obj: Record<string, unknown> = { pid, cmd };
      if (port !== null) {
        obj.port = port;
      } else {
        obj.port = null;
      }
      console.log(JSON.stringify(obj));
    }
    return;
  }

  if (options.verbose) {
    console.log(`${padEnd("PID", 8)}  ${padEnd("PORT", 6)}  COMMAND`);
    console.log(`${padEnd("---", 8)}  ${padEnd("----", 6)}  -------`);
    for (const pid of pids) {
      const cmd = getProcessArgs(pid);
      const port = extractDebugPort(cmd);
      console.log(`${padEnd(String(pid), 8)}  ${padEnd(port !== null ? String(port) : "-", 6)}  ${cmd}`);
    }
  } else {
    console.log(`${padEnd("PID", 8)}  ${padEnd("PORT", 6)}  NAME`);
    console.log(`${padEnd("---", 8)}  ${padEnd("----", 6)}  ----`);
    for (const pid of pids) {
      const name = getProcessName(pid);
      const cmd = getProcessArgs(pid);
      const port = extractDebugPort(cmd);
      console.log(`${padEnd(String(pid), 8)}  ${padEnd(port !== null ? String(port) : "-", 6)}  ${name}`);
    }
  }
}
