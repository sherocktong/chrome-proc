import { getChromePids, getProcessArgs, extractDebugPort } from "../utils/process";
import { padEnd } from "../utils/format";

interface CdpOptions {
  json?: boolean;
}

interface CdpEntry {
  port: number;
  level: string;
  name: string;
  url: string;
}

export async function cdpCommand(options: CdpOptions): Promise<void> {
  const pids = getChromePids(true);

  if (pids.length === 0) {
    console.error("(no Chrome processes found)");
    process.exit(1);
  }

  const ports: number[] = [];
  for (const pid of pids) {
    const args = getProcessArgs(pid);
    const port = extractDebugPort(args);
    if (port !== null && !ports.includes(port)) {
      ports.push(port);
    }
  }

  if (ports.length === 0) {
    console.error("(no Chrome processes found with remote debugging enabled)");
    process.exit(1);
  }

  let any = false;
  let printedHeader = false;

  for (const port of ports) {
    const base = `http://localhost:${port}`;
    let verResp: Record<string, unknown> | null = null;
    let listResp: Array<Record<string, unknown>> | null = null;

    try {
      const ver = await fetchWithTimeout(`${base}/json/version`, 3000);
      verResp = (await ver.json()) as Record<string, unknown>;
    } catch {
      verResp = null;
    }

    try {
      const list = await fetchWithTimeout(`${base}/json/list`, 3000);
      listResp = (await list.json()) as Array<Record<string, unknown>>;
    } catch {
      listResp = null;
    }

    if (!verResp && !listResp) {
      console.error(`Warning: failed to query debug endpoint on port ${port}`);
      continue;
    }

    any = true;

    if (options.json) {
      if (verResp) {
        const browserUrl = typeof verResp.webSocketDebuggerUrl === "string" ? verResp.webSocketDebuggerUrl : "";
        const browserName = typeof verResp.Browser === "string" ? verResp.Browser : "Browser";
        if (browserUrl) {
          console.log(JSON.stringify({ port, level: "browser", name: browserName, url: browserUrl }, null, 2));
        }
      }
      if (listResp) {
        for (const item of listResp) {
          const name = (item.title as string) || (item.url as string) || "unknown";
          const url = (item.webSocketDebuggerUrl as string) || "";
          if (url) {
            console.log(JSON.stringify({ port, level: "tab", name, url }, null, 2));
          }
        }
      }
    } else {
      if (!printedHeader) {
        console.log(`${padEnd("PORT", 6)}  ${padEnd("LEVEL", 8)}  ${padEnd("NAME", 30)}  URL`);
        console.log(`${padEnd("----", 6)}  ${padEnd("-----", 8)}  ${padEnd("----", 30)}  ---`);
        printedHeader = true;
      }

      if (verResp) {
        const browserUrl = typeof verResp.webSocketDebuggerUrl === "string" ? verResp.webSocketDebuggerUrl : "";
        const browserName = typeof verResp.Browser === "string" ? verResp.Browser : "Browser";
        if (browserUrl) {
          console.log(
            `${padEnd(String(port), 6)}  ${padEnd("browser", 8)}  ${padEnd(truncate(browserName, 30), 30)}  ${browserUrl}`
          );
        }
      }

      if (listResp) {
        for (const item of listResp) {
          const name = (item.title as string) || (item.url as string) || "unknown";
          const url = (item.webSocketDebuggerUrl as string) || "";
          if (url) {
            console.log(
              `${padEnd(String(port), 6)}  ${padEnd("tab", 8)}  ${padEnd(truncate(name, 30), 30)}  ${url}`
            );
          }
        }
      }
    }
  }

  if (!any) {
    process.exit(1);
  }
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function truncate(str: string, max: number): string {
  if (str.length > max) {
    return str.slice(0, max - 3) + "...";
  }
  return str;
}
