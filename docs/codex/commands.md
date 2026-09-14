---
sidebar_position: 3
sidebar_label: Slash Commands & Shortcuts
description: Reference for Codex CLI slash commands, keyboard shortcuts, quick prefixes, IDE extension commands, and terminal customization options.
keywords: [Codex slash commands, Codex CLI shortcuts, /compact, /model, /permissions, /status, Codex keymap, Codex IDE commands, codex completion, Codex TUI]
---

# Slash Commands & Shortcuts

Codex CLI's interactive terminal UI (TUI) exposes slash commands for controlling the session without restarting it: switching models, changing permissions, compacting the transcript, resuming saved chats, and more. Type `/` in the composer to open the slash popup, then keep typing to filter. This page groups the built-in commands by purpose, lists the documented keyboard shortcuts, and summarizes the IDE extension's commands.

Skills also appear as commands: pick one with `/skills`, or mention it directly. See [Skills](./skills.md).

:::tip
While a turn is running, type a slash command and press `Tab` to queue it for the next turn. Codex parses queued commands when they run, so menus and errors appear after the current turn finishes.
:::

## Session & Navigation

| Command | What it does |
|---------|-------------|
| `/new [name]` | Start a fresh chat in the same CLI session. Pass a name to label it as you create it (`/new bug bash`). Does not clear the terminal view. |
| `/clear [name]` | Clear the terminal **and** start a fresh chat (`/clear release prep`). Unavailable while a task is running. Use `Ctrl+L` to clear only the screen and keep the chat. |
| `/resume` | Open the saved-session picker and reload a previous chat with its transcript intact. |
| `/fork` | Clone the current chat into a new chat with a fresh ID, leaving the original untouched. To fork a saved session instead, run `codex fork` from the shell. |
| `/side [prompt]`, `/btw` | Start an ephemeral side chat for a focused follow-up without touching the main transcript. The TUI keeps showing the parent chat's status. Unavailable inside another side chat or in review mode. |
| `/rename [name]` | Rename the current saved chat. |
| `/archive` | Archive the current session and exit. The transcript is kept; restore with `codex unarchive <SESSION>`. |
| `/delete` | Permanently delete the current session (and spawned descendant sessions) and exit. |
| `/app` | Continue the current session in the ChatGPT desktop app (macOS and Windows). |
| `/copy` | Copy the latest completed Codex output to the clipboard (same as `Ctrl+O`). |
| `/raw [on\|off]` | Toggle raw scrollback mode for easier terminal text selection (default binding `Alt+R`; persist with `tui.raw_output_mode = true`). |
| `/exit`, `/quit` | Exit the CLI. |

## Model & Output

| Command | What it does |
|---------|-------------|
| `/model` | Choose the active model (for example `gpt-5.6-terra` or `gpt-5.6-luna`) and, when the model supports it, the reasoning effort. Confirm with `/status`. |
| `/fast [on\|off\|status]` | Toggle the model's Fast service tier and persist the choice. Only shown when the model catalog advertises a Fast tier. See [Managing Context](./context.md). |
| `/personality` | Choose `friendly`, `pragmatic`, or `none`. Hidden when the active model does not support personalities. Default in `config.toml` with `personality = "pragmatic"`. |
| `/plan [prompt]` | Switch the chat to plan mode, optionally with an inline first planning request. Temporarily unavailable while Codex is working. |
| `/goal [objective]` | Set a persistent goal Codex tracks across turns. `/goal` alone shows it; `/goal edit`, `/goal pause`, `/goal resume`, and `/goal clear` manage it. Objectives are capped at 4,000 characters. |
| `/review` | Ask Codex to review the working tree, focusing on behavior changes and missing tests. Uses `review_model` from `config.toml` if set. Follow with `/diff`. |

## Context & Session State

| Command | What it does |
|---------|-------------|
| `/compact` | Replace earlier turns with a concise summary to free context. Codex also compacts automatically; see [Managing Context](./context.md). |
| `/status` | Show the active model, approval policy, sandbox writable roots, and token usage including remaining context. In remote sessions it also shows the server address and version. |
| `/usage [daily\|weekly\|cumulative]` | Show ChatGPT account token activity or redeem an earned rate-limit reset. Requires ChatGPT sign-in. |
| `/diff` | Show the Git diff, including staged, unstaged, and untracked files. |
| `/mention <path>` | Attach a file to the chat so follow-up turns reference it directly. |
| `/ide [text]` | Include open files, the current selection, and other IDE context in the next prompt. |
| `/ps` | List background terminals and up to three recent output lines each (populated when `unified_exec` is in use). |
| `/stop` | Stop all background terminals started by the session (alias: `/clean`). |
| `/agent`, `/subagents` | Switch the active agent thread to inspect or continue a spawned subagent. See [Subagents](./subagents.md). |

## Permissions & Safety

| Command | What it does |
|---------|-------------|
| `/permissions` | Pick an approval preset such as **Auto** or **Read Only**, or a named custom permission profile. See [Permissions & Sandbox](./permissions.md). |
| `/approve` | Approve one retry of an action that automatic review denied. See [Auto-review](./auto-review.md). |
| `/hooks` | Browse configured lifecycle hooks by event; trust, disable, or re-enable non-managed hooks. See [Hooks](./hooks.md). |
| `/setup-default-sandbox` | Windows only: set up the elevated agent sandbox when Codex is running the degraded restricted-token sandbox. |
| `/sandbox-add-read-dir <path>` | Windows only: grant the sandbox read access to an absolute directory outside the current readable roots. |

## Configuration & Appearance

| Command | What it does |
|---------|-------------|
| `/memories` | Choose whether the current chat may use existing memories or generate new ones. See [AGENTS.md & Memories](./agents-md.md). |
| `/experimental` | Toggle experimental features (for example Network proxy or Prevent sleep while running); saved to `config.toml`, some require a restart. |
| `/debug-config` | Print config layer order, on/off state, and policy sources (`allowed_approval_policies`, `allowed_sandbox_modes`, `mcp_servers`, `rules`, `experimental_network`). |
| `/keymap` | Inspect and remap TUI shortcuts; writes to `tui.keymap` in `config.toml`. |
| `/vim` | Toggle Vim mode in the composer for this session. Default it with `tui.vim_mode_default = true`. |
| `/statusline` | Pick and order footer items (model, model+reasoning, context stats, rate limits, git branch, token counters, session id, directory, Codex version); persists to `tui.status_line`. |
| `/title` | Pick and order terminal title items (app name, project, spinner, status, thread, branch, model, task progress); persists to `tui.terminal_title`. |
| `/theme` | Preview and persist a syntax-highlighting theme (`tui.theme`). Custom `.tmTheme` files go in `$CODEX_HOME/themes`. |
| `/pets`, `/pet` | Choose or hide an ambient terminal pet (`/pets off`). |

## Project, Tools & Integrations

| Command | What it does |
|---------|-------------|
| `/init` | Generate an `AGENTS.md` scaffold in the current directory. |
| `/skills` | Browse local skills and insert one so the next request follows its instructions. |
| `/mcp [verbose]` | List configured MCP servers and tools; `verbose` adds server diagnostics. See [MCP](./mcp.md). |
| `/apps` | Browse apps (connectors) and insert one into the prompt as `$app-slug`. |
| `/plugins` | Browse installed and discoverable plugins by marketplace; press `Space` to toggle an installed plugin. See [Plugins](./plugins.md). |
| `/import` | Import Claude Code or Cursor setup, project files, and up to 50 chats from the last 30 days. Unavailable during a running task, in remote sessions, or when connected to the app-server daemon. |

## Account & Support

| Command | What it does |
|---------|-------------|
| `/logout` | Clear local credentials. |
| `/feedback` | Send logs and diagnostics to the Codex maintainers (can be disabled by admins via `feedback.enabled`). |

## Keyboard shortcuts

These are the shortcuts the official CLI reference documents. Remap them with `/keymap`.

| Shortcut | What it does |
|----------|-------------|
| `Enter` (while Codex is working) | Inject new instructions into the current turn (steer). |
| `Tab` (while Codex is working) | Queue a follow-up prompt, slash command, or shell command for the next turn. |
| `Esc` `Esc` (empty composer) | Edit the previous user message and fork the chat from that point. |
| `Ctrl+C` | Close the session (same as `/exit`). |
| `Ctrl+L` | Clear the terminal view; keeps the current chat. Disabled while a task runs. |
| `Ctrl+O` | Copy the latest completed Codex output (same as `/copy`). |
| `Ctrl+R` | Search prompt history; `Enter` uses a match, `Esc` cancels. |
| `Up` / `Down` | Restore draft history. |
| `Ctrl+G` | Open the current prompt in the editor set by `VISUAL` (or `EDITOR`). Save and close to return the text to the composer. |
| `Alt+R` | Toggle raw scrollback mode (same as `/raw`). |

### Quick prefixes

| Prefix | What it does |
|--------|-------------|
| `/` | Open the slash command popup. |
| `@` | Search for a file in the workspace and insert its path into the prompt. |
| `!` | Run a local shell command under the current approval and sandbox settings (`! npm test`). |
| `$` | App mention inserted by `/apps` (`$app-slug`). |

### Multiline input and long prompts

The CLI reference does not document a dedicated newline key for the composer. The documented options are:

- Press `Ctrl+G` to write the prompt in your external editor, then save and close.
- Paste multi-line text directly. Codex detects burst pastes; disable that detection with `disable_paste_burst = true` in `config.toml` if your terminal misbehaves.
- Bind your own keys. The keymap uses names such as `shift-enter`, `ctrl-m`, and `page-down`, and the `composer.submit` action accepts a list of bindings, so you can control which keys send and which do not.

## Customizing the CLI

### Keymap

Shortcuts live under `[tui.keymap.<context>]` in `config.toml`. Supported contexts are `global`, `chat`, `composer`, `editor`, `vim_normal`, `vim_operator`, `vim_text_object`, `pager`, `list`, and `approval`. Composer actions fall back to matching `tui.keymap.global` bindings, context-specific bindings take precedence, and an empty list unbinds an action.

```toml
# ~/.codex/config.toml
[tui.keymap.global]
open_transcript = "ctrl-t"
open_external_editor = []          # unbind

[tui.keymap.composer]
submit = ["enter", "ctrl-m"]

[tui.keymap.chat]
interrupt_turn = "f12"
```

Run `/keymap` to edit bindings interactively instead of by hand.

### Editor

`Ctrl+G` opens the editor from `VISUAL`, falling back to `EDITOR`. Set one in your shell profile:

```bash
export VISUAL="code --wait"
```

### Shell completions

```bash
codex completion zsh        # also: bash, fish, power-shell, elvish
```

Load the script from your shell configuration. For zsh:

```bash
autoload -Uz compinit && compinit   # only if you see "command not found: compdef"
eval "$(codex completion zsh)"
```

Restart the shell, type `codex`, and press `Tab` to verify.

### Themes and TUI options

`/theme` previews and saves a syntax theme to `tui.theme`. Add `.tmTheme` files to `$CODEX_HOME/themes` to make them selectable. Other `[tui]` keys worth knowing:

| Key | Purpose |
|-----|---------|
| `tui.alternate_screen` | `auto` (default), `always`, or `never`. Use `never` to keep terminal scrollback; `--no-alt-screen` does the same for one run. |
| `tui.notifications` | `true`, `false`, or a list of event types (`agent-turn-complete`, `approval-requested`). |
| `tui.notification_method` | `auto`, `osc9`, or `bel`. |
| `tui.notification_condition` | `unfocused` or `always`. |
| `tui.animations` | Enable or disable ASCII animations and shimmer effects. |
| `tui.show_tooltips` | Show or hide onboarding tooltips. |
| `tui.resume_cwd` | `current` or `session`, to skip the working-directory prompt on `codex resume` and `codex fork`. |
| `file_opener` | URI scheme for clickable citations: `vscode` (default), `vscode-insiders`, `cursor`, `windsurf`, or `none`. |

## IDE extension commands

The IDE extension exposes VS Code Command Palette commands you can bind to keys via **Preferences: Open Keyboard Shortcuts** (search for `Codex` or the command ID).

| Command ID | Default key | Description |
|------------|-------------|-------------|
| `chatgpt.newChat` | `Cmd+N` (macOS) / `Ctrl+N` | Create a new chat |
| `chatgpt.addToThread` | none | Add the selected text range as context for the current chat |
| `chatgpt.addFileToThread` | none | Add the entire file as context |
| `chatgpt.newCodexPanel` | none | Open a new Codex panel |
| `chatgpt.openCommandMenu` | none | Open the Codex command menu |
| `chatgpt.openSidebar` | none | Open the Codex sidebar |

Two extension settings change how `Enter` behaves in the composer:

- `chatgpt.composerEnterBehavior`: `enter` (always sends, default), `cmdIfMultiline` (Cmd/Ctrl+Enter sends multiline prompts), or `cmdAlways`.
- `chatgpt.followUpQueueMode`: `queue` (default, messages sent during a run wait for the next run) or `steer`. Press `Cmd/Ctrl+Shift+Enter` to invert the behavior for one message.

### IDE slash commands

| Command | What it does |
|---------|-------------|
| `/model`, `/reasoning`, `/fast`, `/personality` | Choose model, reasoning effort, Fast tier, and communication style for the current chat |
| `/plan`, `/goal` | Toggle plan mode; set a persistent goal |
| `/compact`, `/status` | Compact the chat; show chat ID, context usage, and rate limits |
| `/local`, `/cloud`, `/cloud-environment`, `/worktree` | Run the chat locally, in Codex cloud, pick the cloud environment, or run it in a new Git worktree |
| `/review` | Review uncommitted changes or compare against a base branch |
| `/ide-context` | Turn automatic IDE context on or off |
| `/project` | Choose a project for new chats |
| `/fork`, `/side` | Copy a local chat into a new local chat; start a temporary side chat |
| `/init`, `/mcp`, `/memories`, `/approve`, `/feedback` | Same behavior as in the CLI |

## Notes

- Some commands are conditional: `/fast` only appears when the model catalog exposes a Fast tier, `/personality` only when the model supports it, and the two `sandbox` commands only on native Windows.
- `/compact`, `/clear`, `/archive`, `/delete`, `/plan`, and `/import` are unavailable (or deferred) while a task is running; queue them with `Tab` instead.
- `/quit` and `/exit` do not save anything on the way out. Commit or stash important work first.

## Compared with Claude Code

- Session control maps closely: Codex `/new` and `/clear` both start a fresh chat (Claude Code's `/clear` does the same); Codex `/fork` creates a new chat in the same TUI, whereas Claude Code's `/fork` spins off a background session and `/branch` stays in-session.
- Codex `/side` is the equivalent of Claude Code's `/btw` for asides, and Codex accepts `/btw` as an alias.
- Codex has no `/config` settings UI; edit `config.toml` or use `/experimental`, `/keymap`, `/statusline`, `/theme`, and `/debug-config` for the pieces that have interactive editors.
- Effort is chosen inside `/model` in the Codex CLI (a separate `/reasoning` command exists only in the IDE), while Claude Code has a dedicated `/effort`.
- Both tools use `!` for shell commands and `@` for file paths. Codex adds `$` for app mentions.
- Codex's `Tab` to queue versus `Enter` to steer a running turn has no direct Claude Code counterpart.

See [Claude Code Slash Commands & Shortcuts](../claude-code/commands.md) for the full Claude Code list.
