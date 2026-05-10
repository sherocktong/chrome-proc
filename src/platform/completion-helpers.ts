export function generateBashCompletion(profileDirs: string[]): string {
  const profileDirsNewline = profileDirs.join("\n");

  return `#!/usr/bin/env bash
_chrome_proc() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local prev="\${COMP_WORDS[COMP_CWORD-1]}"

  local commands="list kill launch profile cdp completion"
  local profile_subcommands="list name delete"

  local list_opts="--verbose --json"
  local kill_opts="--force --all"
  local launch_opts="--dir --profile --debug --debugging-port"
  local profile_list_opts="--json"
  local cdp_opts="--json"
  local completion_shells="bash zsh powershell"

  local profile_dirs='
${profileDirsNewline}
'

  local cmd=""
  local subcmd=""
  local i=1

  while [[ $i -lt $COMP_CWORD ]]; do
    local word="\${COMP_WORDS[$i]}"
    if [[ "$word" != -* ]]; then
      if [[ -z "$cmd" ]]; then
        cmd="$word"
      elif [[ "$cmd" == "profile" && -z "$subcmd" ]]; then
        subcmd="$word"
        break
      else
        break
      fi
    fi
    ((i++))
  done

  if [[ -z "$cmd" ]]; then
    if [[ "$cur" == -* ]]; then
      COMPREPLY=()
    else
      COMPREPLY=( $(compgen -W "$commands" -- "$cur") )
    fi
    return
  fi

  case "$cmd" in
    list)
      COMPREPLY=( $(compgen -W "$list_opts" -- "$cur") )
      ;;
    kill)
      COMPREPLY=( $(compgen -W "$kill_opts" -- "$cur") )
      ;;
    launch)
      COMPREPLY=( $(compgen -W "$launch_opts" -- "$cur") )
      ;;
    cdp)
      COMPREPLY=( $(compgen -W "$cdp_opts" -- "$cur") )
      ;;
    completion)
      COMPREPLY=( $(compgen -W "$completion_shells" -- "$cur") )
      ;;
    profile)
      if [[ -z "$subcmd" ]]; then
        if [[ "$cur" == -* ]]; then
          COMPREPLY=()
        else
          COMPREPLY=( $(compgen -W "$profile_subcommands" -- "$cur") )
        fi
      else
        case "$subcmd" in
          list)
            COMPREPLY=( $(compgen -W "$profile_list_opts" -- "$cur") )
            ;;
          name|delete)
            if [[ -n "$profile_dirs" && ( -z "$prev" || "$prev" == "name" || "$prev" == "delete" ) ]]; then
              local OLD_IFS="$IFS"
              IFS=$'\n'
              COMPREPLY=( $(compgen -W "$profile_dirs" -- "$cur") )
              IFS="$OLD_IFS"
            else
              COMPREPLY=()
            fi
            ;;
          *)
            COMPREPLY=()
            ;;
        esac
      fi
      ;;
    *)
      COMPREPLY=()
      ;;
  esac
}

complete -F _chrome_proc chrome-proc
`;
}

export function generateZshCompletion(profileDirs: string[]): string {
  const profileDirsNewline = profileDirs.join("\n");

  return `#!/usr/bin/env zsh
#compdef chrome-proc

_chrome_proc() {
  local curcontext="$curcontext" state line
  typeset -A opt_args

  local profile_dirs='
${profileDirsNewline}
'

  _arguments -C \\
    '1: :->command' \\
    '2: :->subcommand' \\
    '*: :->args'

  case "$state" in
    command)
      local commands=(list kill launch profile cdp completion)
      _describe -t commands 'chrome-proc command' commands
      ;;
    subcommand)
      case "$line[1]" in
        list)
          local opts=('--verbose:Show full command line' '--json:Output as JSON lines')
          _describe -t options 'list options' opts
          ;;
        kill)
          local opts=('--force:Use SIGKILL instead of SIGTERM' '--all:Kill helper processes too')
          _describe -t options 'kill options' opts
          ;;
        launch)
          local opts=('--dir:Chrome user data directory' '--profile:Chrome profile name' '--debug:Enable remote debugging mode' '--debugging-port:Remote debugging port')
          _describe -t options 'launch options' opts
          ;;
        cdp)
          local opts=('--json:Output as JSON lines')
          _describe -t options 'cdp options' opts
          ;;
        completion)
          local shells=(bash zsh powershell)
          _describe -t shells 'shell' shells
          ;;
        profile)
          local subcmds=(list name delete)
          _describe -t subcommands 'profile subcommand' subcmds
          ;;
      esac
      ;;
    args)
      case "$line[1]" in
        list)
          local opts=('--verbose:Show full command line' '--json:Output as JSON lines')
          _describe -t options 'list options' opts
          ;;
        kill)
          local opts=('--force:Use SIGKILL instead of SIGTERM' '--all:Kill helper processes too')
          _describe -t options 'kill options' opts
          ;;
        launch)
          local opts=('--dir:Chrome user data directory' '--profile:Chrome profile name' '--debug:Enable remote debugging mode' '--debugging-port:Remote debugging port')
          _describe -t options 'launch options' opts
          ;;
        cdp)
          local opts=('--json:Output as JSON lines')
          _describe -t options 'cdp options' opts
          ;;
        profile)
          case "$line[2]" in
            list)
              local opts=('--json:Output as JSON lines')
              _describe -t options 'profile list options' opts
              ;;
            name|delete)
              if [[ -n "$profile_dirs" ]]; then
                local dirs=(\${(f)profile_dirs})
                _describe -t directories 'profile directory' dirs
              fi
              ;;
          esac
          ;;
      esac
      ;;
  esac
}

_chrome_proc "$@"
`;
}

export function generatePowerShellCompletion(profileDirs: string[]): string {
  const profileDirsQuoted = profileDirs.map((d) => `'${d.replace(/'/g, "''")}'`).join(", ");

  return `Register-ArgumentCompleter -Native -CommandName chrome-proc -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)

    $commands = @('list', 'kill', 'launch', 'profile', 'cdp', 'completion')
    $profileSubcommands = @('list', 'name', 'delete')
    $tokens = $commandAst.CommandElements | ForEach-Object { $_.Value }
    $cmd = $tokens[1]
    $subcmd = $tokens[2]

    if (-not $cmd) {
        $commands | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
        return
    }

    switch ($cmd) {
        'list' {
            @('--verbose', '--json') | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
        }
        'kill' {
            @('--force', '--all') | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
        }
        'launch' {
            @('--dir', '--profile', '--debug', '--debugging-port') | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
        }
        'cdp' {
            @('--json') | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
        }
        'completion' {
            @('bash', 'zsh', 'powershell') | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
        }
        'profile' {
            if (-not $subcmd) {
                $profileSubcommands | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
            } else {
                switch ($subcmd) {
                    'list' {
                        @('--json') | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
                    }
                    'name' {
                        $profileDirs = @(${profileDirsQuoted})
                        $profileDirs | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
                    }
                    'delete' {
                        $profileDirs = @(${profileDirsQuoted})
                        $profileDirs | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { $_ }
                    }
                }
            }
        }
    }
}
`;
}
