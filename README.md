# chrome-proc

Manage Chrome browser processes, profiles, and CDP endpoints.

## Installation

```bash
npm install -g chrome-proc
```

## Usage

```bash
chrome-proc <command> [options]
```

### Commands

- `list` — List Chrome processes
  - `-v, --verbose` — Show full command line
  - `-j, --json` — Output as JSON lines
- `kill` — Kill Chrome processes
  - `-f, --force` — Use SIGKILL instead of SIGTERM
  - `-a, --all` — Kill helper processes too
- `launch` — Launch Chrome browser
  - `--dir <dir>` — Chrome user data directory
  - `--profile <profile>` — Chrome profile name
  - `-d, --debug` — Enable remote debugging mode
  - `-p, --debugging-port <port>` — Remote debugging port
- `profile` — Manage Chrome profiles
  - `profile list [-j, --json]`
  - `profile name <profile_dir> <new_name>`
  - `profile delete <profile_dir>`
- `cdp` — List CDP WebSocket URLs
  - `-j, --json` — Output as JSON lines
- `completion <shell>` — Generate shell completion script

## Shell Completions

Add to your shell config:

**Bash** (`~/.bashrc`):
```bash
eval "$(chrome-proc completion bash)"
```

**Zsh** (`~/.zshrc`):
```zsh
eval "$(chrome-proc completion zsh)"
```
