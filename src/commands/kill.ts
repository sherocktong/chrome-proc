import { getChromePids, killPid } from "../utils/process";

interface KillOptions {
  force?: boolean;
  all?: boolean;
}

export function killCommand(options: KillOptions): void {
  const signal: "TERM" | "KILL" = options.force ? "KILL" : "TERM";
  const exact = !options.all;
  const pids = getChromePids(exact);

  if (pids.length === 0) {
    console.log("(no Chrome processes found)");
    return;
  }

  let count = 0;
  for (const pid of pids) {
    if (killPid(pid, signal)) {
      console.log(`Killed PID ${pid} (SIG${signal})`);
      count++;
    } else {
      console.error(`Failed to kill PID ${pid}`);
    }
  }

  console.log("");
  console.log(`Sent SIG${signal} to ${count} process(es)`);
}
