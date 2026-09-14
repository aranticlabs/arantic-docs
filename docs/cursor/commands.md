---
sidebar_position: 3
sidebar_label: Commands & Shortcuts
description: Reference for Cursor CLI slash commands, IDE keyboard shortcuts for Agent, Inline Edit and Tab, built-in skills invoked with /, and terminal setup.
keywords: [Cursor slash commands, Cursor keyboard shortcuts, Cursor CLI commands, Cmd+K, Cmd+I, Cmd+L, inline edit, Tab completion, custom commands, Cursor agent]
---

# Commands & Shortcuts

Cursor has two surfaces with their own command sets: the IDE (Agent panel, Inline Edit, Tab) and the Cursor CLI (`agent`). In both, typing `/` opens a menu of slash commands and skills, and `@` attaches context. This page is the reference for both surfaces, plus the terminal configuration you need for multi-line input in the CLI.

## CLI slash commands

Type `/` in an interactive `agent` session to see the list. Commands below are grouped by purpose; the official reference is [cursor.com/docs/cli/reference/slash-commands](https://cursor.com/docs/cli/reference/slash-commands).

### Session and navigation

| Command | What it does |
|---------|-------------|
| `/clear` | Start a new chat session (aliases: `/new`, `/new-chat`, `/newchat`) |
| `/resume` | Open recent chats and resume one |
| `/fork` | Fork the current chat into a new session |
| `/rename <name>` | Rename the current chat session |
| `/rewind` | Jump back to a previous message (enable with `rewind: true` in `cli-config.json` if it is off) |
| `/summarize` | Summarize the conversation to reduce context (alias: `/compress`) |
| `/copy` | Copy a previous user message to the clipboard |
| `/copy-request-id` | Copy the last request ID (useful when reporting issues) |
| `/copy-conversation-id` | Copy the current conversation ID |
| `/open` | Open the repository's Git root in the Cursor editor (alias: `/cursor`) |
| `/quit`, `/exit` | Exit the CLI |

### Modes and model

| Command | What it does |
|---------|-------------|
| `/model [filter]` | Select a model. Press `Tab` to edit the filter |
| `/plan [prompt]` | Switch to Plan mode, show the current plan, or submit a prompt in Plan mode |
| `/ask` | Toggle Ask mode for read-only questions |
| `/debug [prompt]` | Toggle Debug mode or submit a prompt in Debug mode |
| `/goal [objective]` | Give the agent a long-lived objective it keeps working toward until complete. Rolling out; `Ctrl+C` pauses the goal |
| `/run-everything [on\|off\|status]` | Toggle Run Everything (no per-command approval) or show its status (alias: `/auto-run`) |
| `/max-mode` | Toggle Max Mode on legacy request-based plans |
| `/sandbox` | Configure sandbox mode and network access |

See [Agent Modes](./modes.md) for what Plan, Ask, and Debug do, and [Security & Run Modes](./permissions.md) for Run Everything and the sandbox.

### Shell and tools

| Command | What it does |
|---------|-------------|
| `/shell [command]` | Enter Shell Mode and run a command directly (aliases: `/sh`, `/run`) |
| `/mcp [list\|list-tools] [identifier]` | Manage MCP servers and list tools for a server |
| `/plugin [subcommand]` | Manage plugins and marketplaces |
| `/bedrock [subcommand]` | Configure Amazon Bedrock when that feature is enabled |

### Display and configuration

| Command | What it does |
|---------|-------------|
| `/config` | Configure CLI settings interactively |
| `/vim` | Toggle Vim keybindings in the input area |
| `/line-numbers` | Toggle line numbers in code blocks |
| `/show-thinking` | Toggle display of thinking blocks |
| `/status-indicators` | Toggle terminal title status indicators |
| `/setup-terminal` | Detect your terminal and configure newline keybindings |

### Account and diagnostics

| Command | What it does |
|---------|-------------|
| `/about` | Show CLI version, system, and account info (also copied to clipboard) |
| `/logs` | Show the debug log path and copy it |
| `/update` | Update the CLI to the latest version |
| `/help [command]` | Show help, or details for one command |
| `/feedback <message>` | Send feedback to the Cursor team |
| `/logout` | Sign out |

### Built-in skills invoked with `/`

Skills also live in the `/` menu, in both the IDE and the CLI. Cursor ships these built-in ones:

| Skill | What it does |
|-------|-------------|
| `/create-rule` | Creates a Cursor rule with the right scope and frontmatter |
| `/create-skill` | Scaffolds an Agent Skill and its `SKILL.md` |
| `/create-subagent` | Creates a custom subagent |
| `/create-hook` | Creates a hook and updates `hooks.json` |
| `/review` | Picks and runs the appropriate code-review agent |
| `/review-bugbot` | Reviews code for likely bugs with Bugbot |
| `/review-security` | Reviews code for security vulnerabilities |
| `/autopilot` | Monitors a pull request and addresses feedback, conflicts, and failing checks |
| `/split-to-prs` | Splits a large change into smaller pull requests |
| `/automate` | Creates Cursor Automations triggered by schedules or events |
| `/loop` | Runs a prompt or skill repeatedly at an interval |
| `/canvas` | Creates an interactive React artifact next to the conversation |
| `/cursor-blame` | Investigates AI-authored changes and the prompts that produced them |
| `/sdk` | Helps build on the Cursor SDK |
| `/statusline` | Configures the CLI status line |
| `/update-cli-config` | Updates `~/.cursor/cli-config.json` |
| `/update-cursor-settings` | Finds and updates a Cursor or VS Code setting |
| `/migrate-to-skills` | Converts eligible dynamic rules and legacy slash commands into skills |

Pressing `Enter` on a skill attaches it to one message. Pressing `Option+Enter` (`Alt+Enter`) instead turns it into a **Custom Mode** that stays active for the whole session. See [Skills](./skills.md).

### IDE-only slash commands

A few `/` commands exist in the editor rather than the CLI:

| Command | What it does |
|---------|-------------|
| `/side [question]` | Open a side chat (optionally with a first prompt). See [Managing Context](./context.md) |
| `/in-cloud` | Hand a task to a cloud subagent from the Agents Window. See [Cloud Agents](./cloud-agents.md) |

## IDE keyboard shortcuts

Cursor keeps VS Code's defaults and adds shortcuts for AI features. Mac keys are shown; on Windows and Linux replace `Cmd` with `Ctrl` and `Opt` with `Alt`. See every binding with `Cmd+R` then `Cmd+S`, or through the command palette (`Cmd+Shift+P` > Keyboard Shortcuts). Everything, including Cursor-specific bindings, can be remapped.

### General

| Shortcut | Action |
|----------|--------|
| `Cmd+I` or `Cmd+L` | Toggle the Agent sidepanel (unless bound to a mode) |
| `Cmd+E` | Toggle Agent layout |
| `Cmd+.` | Mode menu |
| `Shift+Tab` | Rotate between Agent modes (Agent, Ask, Plan, Debug) |
| `Cmd+/` | Cycle through AI models |
| `Cmd+Shift+J` | Cursor settings |
| `Cmd+,` | General settings |
| `Cmd+Shift+P` | Command palette |
| `Cmd+Shift+Space` | Toggle Voice Mode |

### Agent chat input

| Shortcut | Action |
|----------|--------|
| `Return` | Send (or nudge a running agent; the message is delivered at the next tool call) |
| `Ctrl+Return` | Queue the message to run after the current task |
| `Cmd+Return` while typing | Force send immediately, bypassing the queue |
| `Cmd+Shift+Backspace` | Cancel generation |
| `Cmd+Return` with suggested changes | Accept all changes |
| `Cmd+Backspace` | Reject all changes |
| `Cmd+Shift+L` with code selected | Add selection as context |
| `Cmd+L` with code selected | Add selection to a new chat |
| `Cmd+V` with code or a log in the clipboard | Add clipboard as context |
| `Cmd+Shift+V` with code in the clipboard | Paste clipboard into the input as text |
| `Cmd+M` | Toggle file reading strategies |
| `Tab` | Cycle to next message |
| `Cmd+Opt+/` | Model toggle |
| `Cmd+N` or `Cmd+R` | New chat |
| `Cmd+T` | New chat tab |
| `Cmd+[` / `Cmd+]` | Previous / next chat |
| `Cmd+W` | Close chat |
| `Shift+Cmd+S` | Open a side chat seeded with the current transcript selection |
| `Escape` | Unfocus the input |

### Inline Edit (`Cmd+K`)

Inline Edit changes the selected code in place without opening the chat panel. Select code, press `Cmd+K`, describe the change, press `Return`. Follow-up instructions refine the same edit.

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open Inline Edit on the selection (in the terminal: open the terminal prompt bar) |
| `Cmd+Shift+K` | Toggle input focus / add selection to Edit |
| `Return` | Submit |
| `Opt+Return` | Ask a quick question about the selection instead of editing (type "do it" to apply a suggested change) |
| `Cmd+Shift+Backspace` | Cancel |
| `Cmd+L` with the same selection | Escalate to Agent with the selection as context, for multi-file changes |

User Rules and project rules do not apply to Inline Edit; they are Agent-only.

### Tab

Tab is Cursor's autocomplete. It reads recent edits, surrounding code, and linter errors, and can edit multiple lines, add imports, and jump between files.

| Shortcut | Action |
|----------|--------|
| `Tab` | Accept the suggestion |
| `Tab` again after accepting | Jump to the predicted next edit location (jump-in-file); a portal appears when the jump is in another file |
| `Cmd+Right` | Accept the next word only |
| `Escape` (or keep typing) | Reject |

Click the **Tab** indicator in the status bar to snooze Tab, disable it globally, or disable it for specific file types. Remap the accept key by searching **Accept Cursor Tab Suggestions** in Keyboard Shortcuts.

### Terminal

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open the terminal prompt bar (describe a command in plain language) |
| `Cmd+Return` | Run the generated command |
| `Escape` | Accept the command into the terminal without running it |

### Agents Window

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+P` > **Open Agents Window** | Switch to the agent-first interface |
| `Cmd+Shift+P` > **Open IDE** | Switch back to the editor |
| `Cmd+K` (in the Agents Window) | Search across past agent transcripts |
| `Cmd+F` (inside a conversation) | Search within the transcript |
| `Cmd+P` / `Cmd+Shift+F` | Search files / search all files without leaving the Agents Window |

## CLI keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift+Tab` | Rotate between Agent, Plan, and Ask |
| `Enter` while the agent works | Steer the active run at a safe boundary; press `Enter` again to interrupt |
| `Shift+Enter` | Insert a newline (iTerm2, Ghostty, Kitty, Warp, Zed) |
| `Ctrl+J` or `\` then `Enter` | Insert a newline in any terminal, including tmux and SSH |
| `Option+Enter` | Insert a newline after `/setup-terminal` (Apple Terminal, Alacritty, VS Code terminal) |
| `ArrowUp` | Cycle through previous prompts |
| `Ctrl+R` | Review changes; `i` adds follow-up instructions, arrows scroll and switch files |
| `Ctrl+O` | Expand truncated Shell Mode output |
| `Ctrl+C` | Cancel the current command or pause a `/goal` |
| `Ctrl+D` (twice) | Exit |
| `y` / `n` | Approve or reject a proposed terminal command |
| `Tab` on a permission prompt | Add the command to the allowlist |
| `Esc` on empty input | Leave Shell Mode |

### Quick prefixes

| Prefix | What it does |
|--------|-------------|
| `/` | Slash commands and skills |
| `@` | Attach files, folders, and other context |
| `&` | Send the message to a Cloud Agent and continue there (`& refactor the auth module and add tests`) |

## Custom commands

Cursor's Customize page still lists **Commands** as a component: reusable Markdown prompts you invoke with `/` in Agent chat, which plugins can bundle. The current documentation no longer describes a dedicated `.cursor/commands/` directory or file format; the documented way to create a reusable `/` command today is a **skill** with model invocation disabled:

```markdown
---
name: release-notes
description: Draft release notes from the commits since the last tag.
disable-model-invocation: true
---

1. Run `git log $(git describe --tags --abbrev=0)..HEAD --oneline`.
2. Group the commits under Added, Changed, Fixed.
3. Write the result to CHANGELOG.md under a new heading and stop. Do not commit.
```

Save it as `.cursor/skills/release-notes/SKILL.md` and it appears as `/release-notes`. Because `disable-model-invocation` is `true`, Agent will not pull it in on its own; it runs only when you type the command. Existing user-level and workspace-level commands can be converted in bulk with `/migrate-to-skills`. Details in [Skills](./skills.md).

## `@`-symbols quick reference

| Symbol | Attaches |
|--------|----------|
| `@file.ts`, `@src/components/` | A file or folder (type `/` after a folder to navigate deeper) |
| `@Terminals` | Terminal output |
| `@Chats` | Context from a previous conversation or side chat |
| `@Commit (Diff of Working State)` | Uncommitted changes |
| `@Branch (Diff with Main)` | The full branch diff |
| `@Browser` | State from the built-in browser |
| `@rule-name` | A manual rule from `.cursor/rules/` |

Skip `@` when you are not sure which files matter; Agent searches the codebase itself. Full detail in [Managing Context](./context.md).

## Terminal setup for the CLI

Multi-line prompts are the main thing that needs configuration. Run `/setup-terminal`; it detects your terminal and prints instructions.

| Keybinding | Works in | Notes |
|------------|----------|-------|
| `Ctrl+J` | All terminals | Most reliable, including tmux, screen, and SSH |
| `\` then `Enter` | All terminals | Universal alternative |
| `Shift+Enter` | iTerm2, Ghostty, Kitty, Warp, Zed | Native, no configuration |
| `Option+Enter` | After `/setup-terminal` | Apple Terminal, Alacritty, VS Code integrated terminal |

tmux and screen intercept `Shift+Enter` before it reaches the CLI, so use `Ctrl+J` there.

**Manual configuration.** Option+Enter needs the terminal to send `\x1b\r`:

```toml
# alacritty.toml
[keyboard]
bindings = [
  { key = "Return", mods = "Alt", chars = "\u001b\r" }
]
```

```json
// VS Code keybindings.json, to make Shift+Enter work in the integrated terminal
{
  "key": "shift+enter",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "\u001b[13;2u" },
  "when": "terminalFocus"
}
```

**Vim mode.** Toggle with `/vim` or set it in `~/.cursor/cli-config.json`:

```json
{
  "version": 1,
  "editor": { "vimMode": true },
  "permissions": { "allow": [], "deny": [] }
}
```

Vim mode affects only the input area (normal/insert modes, `hjkl`, `w`/`b`, `dd`, `cc`, counts like `3w`).

**Theme.** The CLI detects light or dark backgrounds automatically. Force one with `export COLORFGBG="15;0"` (dark) or `"0;15"` (light). In tmux, add `set -g default-terminal "tmux-256color"` and `set -ag terminal-overrides ",xterm-256color:RGB"` to `.tmux.conf`.

**Shell integration.** `agent install-shell-integration` adds integration to `~/.zshrc`; `agent uninstall-shell-integration` removes it.

## Compared with Claude Code

| Topic | Cursor | Claude Code |
|-------|--------|-------------|
| Compact the conversation | `/summarize` (alias `/compress`) | `/compact [instructions]` |
| New conversation | `/clear`, `/new` | `/clear` (aliases `/reset`, `/new`) |
| Fork | `/fork` creates a new session; `/side` opens an attached side chat | `/fork` (background copy), `/branch`, `/subtask` |
| Mode cycling | `Shift+Tab` through Agent, Plan, Ask (Debug in IDE) | `Shift+Tab` through permission modes (Normal, Auto-Accept, Plan) |
| Run a shell command inline | `/shell` (`/sh`, `/run`) or Shell Mode | `!` prefix |
| Send to the cloud | `&` prefix | `/background`, `/autofix-pr`, `/teleport` |
| Custom commands | Skills with `disable-model-invocation: true` | Skills in `.claude/skills/` |
| Rewind | `/rewind` (CLI), checkpoints in the IDE | `/rewind`, `Esc` `Esc` |

See [Claude Code Slash Commands & Shortcuts](../claude-code/commands.md) for the full Claude Code reference.
