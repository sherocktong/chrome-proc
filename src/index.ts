#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { listCommand } from "./commands/list";
import { killCommand } from "./commands/kill";
import { launchCommand } from "./commands/launch";
import { profileList, profileName, profileDelete } from "./commands/profile";
import { cdpCommand } from "./commands/cdp";
import { completionCommand } from "./commands/completion";

const program = new Command();

const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));

program
  .name("chrome-proc")
  .description("Manage Chrome browser processes, profiles, and CDP endpoints")
  .version(pkg.version, "-V, --version");

program
  .command("list")
  .description("List Chrome processes")
  .option("-v, --verbose", "Show full command line")
  .option("-j, --json", "Output as JSON lines")
  .action((options) => {
    listCommand(options);
  });

program
  .command("kill")
  .description("Kill Chrome processes")
  .option("-f, --force", "Use SIGKILL instead of SIGTERM")
  .option("-a, --all", "Kill helper processes too (not just the main process)")
  .action((options) => {
    killCommand(options);
  });

program
  .command("launch")
  .description("Launch Chrome browser")
  .option("--dir <dir>", "Chrome user data directory (overrides CHROME_DATA_DIR)")
  .option("--profile <profile>", "Chrome profile name (default: $CHROME_PROFILE)")
  .option("-d, --debug", "Enable remote debugging mode")
  .option("-p, --debugging-port <port>", "Remote debugging port (default: 9222, only with --debug)")
  .action((options) => {
    launchCommand(options);
  });

const profileCmd = program
  .command("profile")
  .description("Manage Chrome profiles");

profileCmd
  .command("list")
  .description("List Chrome profiles")
  .option("-j, --json", "Output as JSON lines")
  .action((options) => {
    profileList(options);
  });

profileCmd
  .command("name <profile_dir> <new_name>")
  .description("Rename a Chrome profile")
  .action((profileDir: string, newName: string) => {
    profileName(profileDir, newName);
  });

profileCmd
  .command("delete <profile_dir>")
  .description("Delete a Chrome profile")
  .action(async (profileDir: string) => {
    await profileDelete(profileDir);
  });

program
  .command("cdp")
  .description("List Chrome DevTools Protocol (CDP) WebSocket URLs")
  .option("-j, --json", "Output as JSON lines")
  .action(async (options) => {
    await cdpCommand(options);
  });

program
  .command("completion <shell>")
  .description("Generate shell completion script (bash or zsh)")
  .action((shell: string) => {
    completionCommand(shell);
  });

program.parse();
