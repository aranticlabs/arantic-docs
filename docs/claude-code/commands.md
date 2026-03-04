---
sidebar_position: 3
sidebar_label: Slash Commands & Shortcuts
---

# Slash Commands & Shortcuts

Claude Code's interactive mode provides built-in slash commands for controlling sessions, switching models, managing context, and more. Type `/` in the prompt to see all available commands, including your custom skills.

This page covers only the built-in commands. Custom skills (created in `.claude/skills/`) also appear in the `/` menu. See the [Skills](./skills.md) page for details.

## Session & Navigation

| Command | What it does |
|---------|-------------|
| `/help` | Show help and available commands |
| `/exit` | Exit Claude Code (alias: `/quit`) |
| `/clear` | Clear conversation history and free up context (aliases: `/reset`, `/new`) |
| `/resume [session]` | Resume a previous conversation by ID or name, or open the session picker (alias: `/continue`) |
| `/fork [name]` | Create a fork of the current conversation at this point |
| `/rename [name]` | Rename the current session (auto-generates a name if none provided) |
| `/export [filename]` | Export current conversation as plain text |
| `/copy` | Copy the last assistant response to clipboard (shows interactive picker for code blocks) |
| `/rewind` | Rewind conversation and code to a previous point, or summarize from a selected message (alias: `/checkpoint`) |

## Model & Output

| Command | What it does |
|---------|-------------|
| `/model [model]` | Select or change the AI model. Use arrow keys to adjust effort level. |
| `/fast [on\|off]` | Toggle fast mode (same model, faster output) |
| `/output-style [style]` | Switch between output styles: Default, Explanatory, or Learning |
| `/plan` | Enter plan mode (Claude analyzes and plans before writing code) |

## Context & Cost

| Command | What it does |
|---------|-------------|
| `/context` | Visualize current context usage as a colored grid |
| `/compact [instructions]` | Compact the conversation to free context. Optional instructions guide what to preserve. |
| `/cost` | Show token usage statistics for the current session |
| `/usage` | Show plan usage limits and rate limit status |
| `/extra-usage` | Configure extra usage to keep working when rate limits are hit |
| `/diff` | Open interactive diff viewer showing uncommitted changes and per-turn diffs |

## Configuration

| Command | What it does |
|---------|-------------|
| `/config` | Open the settings interface (alias: `/settings`) |
| `/permissions` | View or update tool permissions (alias: `/allowed-tools`) |
| `/hooks` | Manage hook configurations for tool lifecycle events |
| `/keybindings` | Open or create your keybindings configuration file |
| `/theme` | Change the color theme (light, dark, colorblind variants, ANSI themes) |
| `/vim` | Toggle between Vim and Normal editing modes |
| `/statusline` | Configure the status line display |
| `/terminal-setup` | Configure terminal keybindings (Shift+Enter for multiline, etc.) |
| `/sandbox` | Toggle sandbox mode for additional filesystem/network isolation |
| `/privacy-settings` | View and update privacy settings (Pro/Max plans only) |

## Project & Memory

| Command | What it does |
|---------|-------------|
| `/init` | Initialize a project with a `CLAUDE.md` guide |
| `/memory` | Edit `CLAUDE.md` memory files, enable or disable auto-memory |
| `/add-dir <path>` | Add a new working directory to the current session |

## Tools & Integrations

| Command | What it does |
|---------|-------------|
| `/mcp` | Manage MCP server connections and OAuth authentication |
| `/plugin` | Manage Claude Code plugins (install, uninstall, enable, disable, update) |
| `/skills` | List all available skills |
| `/agents` | Manage agent and subagent configurations |
| `/tasks` | List and manage background tasks |
| `/chrome` | Configure Claude in Chrome settings |

## Account & System

| Command | What it does |
|---------|-------------|
| `/login` | Sign in to your Anthropic account |
| `/logout` | Sign out from your Anthropic account |
| `/doctor` | Diagnose and verify your Claude Code installation and settings |
| `/status` | Show version, model, account, and connectivity status |
| `/stats` | Visualize daily usage, session history, streaks, and model preferences |
| `/insights` | Generate a report analyzing your Claude Code sessions |
| `/feedback [report]` | Submit feedback about Claude Code (alias: `/bug`) |
| `/release-notes` | View the full changelog |
| `/upgrade` | Open the upgrade page to switch to a higher plan tier |

## Platform-Specific Commands

| Command | What it does | Availability |
|---------|-------------|-------------|
| `/desktop` | Continue the current session in the Claude Code Desktop app (alias: `/app`) | macOS, Windows |
| `/remote-control` | Make this session available for remote control from claude.ai (alias: `/rc`) | All platforms |
| `/remote-env` | Configure the default remote environment for teleport sessions | All platforms |
| `/ide` | Manage IDE integrations and show status | All platforms |
| `/install-github-app` | Set up the Claude GitHub Actions app for a repository | All platforms |
| `/install-slack-app` | Install the Claude Slack app | All platforms |
| `/mobile` | Show QR code to download the Claude mobile app (aliases: `/ios`, `/android`) | All platforms |
| `/pr-comments [PR]` | Fetch and display comments from a GitHub pull request | All platforms |
| `/review [PR]` | Review a pull request for quality, correctness, security, and test coverage | All platforms |
| `/security-review` | Analyze pending changes on current branch for security vulnerabilities | All platforms |

## Keyboard Shortcuts

### General

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+C` | Cancel current input or generation |
| `Ctrl+D` | Exit Claude Code |
| `Ctrl+L` | Clear terminal screen (keeps conversation history) |
| `Ctrl+O` | Toggle verbose output (shows detailed tool usage) |
| `Ctrl+R` | Reverse search through command history |
| `Ctrl+G` | Open current prompt in your default text editor |
| `Ctrl+B` | Background running tasks (press twice in tmux) |
| `Ctrl+F` | Kill all background agents (press twice within 3 seconds to confirm) |
| `Ctrl+T` | Toggle task list visibility |
| `Esc` + `Esc` | Rewind or summarize (same as `/rewind`) |
| `Shift+Tab` or `Alt+M` | Toggle permission modes (Auto-Accept, Plan, Normal) |

### Model & Thinking

| Shortcut | What it does |
|----------|-------------|
| `Option+P` (macOS) / `Alt+P` | Switch model without clearing prompt |
| `Option+T` (macOS) / `Alt+T` | Toggle extended thinking mode |

### Text Editing

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+K` | Delete to end of line |
| `Ctrl+U` | Delete entire line |
| `Ctrl+Y` | Paste deleted text |
| `Alt+B` / `Alt+F` | Move cursor back/forward one word |

### Multiline Input

| Method | How |
|--------|-----|
| Backslash | `\` then `Enter` (works everywhere) |
| Option+Enter | Default on macOS |
| Shift+Enter | Works in iTerm2, WezTerm, Ghostty, Kitty |
| Ctrl+J | Line feed character |
| Paste | Paste multi-line text directly |

### Quick Prefixes

| Prefix | What it does |
|--------|-------------|
| `/` | Open command and skill menu |
| `!` | Bash mode: run a shell command and add its output to the session |
| `@` | File path autocomplete: mention a file to add it to context |

## MCP Prompts as Commands

MCP servers can expose prompts that appear as slash commands using the format:

```text
/mcp__<server-name>__<prompt-name>
```

These are dynamically discovered from your connected MCP servers and appear in the `/` menu alongside built-in commands and skills.

## Notes

- Not all commands are visible to every user. Some depend on your platform, plan, or environment.
- `/desktop` only appears on macOS and Windows. `/upgrade` and `/privacy-settings` require Pro/Max plans.
- macOS users may need to configure Option/Alt as "Meta" in their terminal settings for Alt-key shortcuts to work.
- Command history is stored per working directory and resets when you run `/clear`.
