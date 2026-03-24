---
sidebar_position: 14
sidebar_label: tmux
description: tmux key bindings, session management, and pane navigation for Claude Code Agent Teams and terminal multiplexing.
keywords: [tmux, terminal multiplexer, key bindings, pane navigation, session management, split panes, Claude Code, Agent Teams]
---

# tmux

tmux is a free, open-source terminal multiplexer. It turns one terminal window into many by splitting it into panes and windows, each running independently. Claude Code uses tmux to display Agent Teams teammates side-by-side in split panes.

This page covers installation, session management, key bindings, and common Claude Code workflows.

## Installation

**macOS:**
```bash
brew install tmux
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install tmux
```

**Other Linux or Windows (WSL):** see the [tmux installation wiki](https://github.com/tmux/tmux/wiki/Installing).

## Core concepts

| Concept | What it is |
|---------|------------|
| **Session** | A top-level workspace. Survives terminal closes; you can detach and re-attach. |
| **Window** | A full-screen tab inside a session. A session can have many windows. |
| **Pane** | A split region inside a window. Each pane runs its own shell. |

## Key bindings

All tmux shortcuts start with the **prefix key**: `Ctrl+b` by default. Press the prefix and release it, then press the command key.

### Sessions

| Action | Key |
|--------|-----|
| Detach from session (keeps running) | `Ctrl+b d` |
| List and switch sessions | `Ctrl+b s` |
| Rename current session | `Ctrl+b $` |

### Windows

| Action | Key |
|--------|-----|
| Create new window | `Ctrl+b c` |
| Next window | `Ctrl+b n` |
| Previous window | `Ctrl+b p` |
| Go to window by number | `Ctrl+b 0`–`9` |
| Rename current window | `Ctrl+b ,` |
| Close current window | `Ctrl+b &` |

### Panes

| Action | Key |
|--------|-----|
| Split vertically (side by side) | `Ctrl+b %` |
| Split horizontally (top / bottom) | `Ctrl+b "` |
| Navigate to pane | `Ctrl+b ←` `↑` `→` `↓` |
| Zoom pane (toggle fullscreen) | `Ctrl+b z` |
| Show pane numbers | `Ctrl+b q` |
| Swap pane with next | `Ctrl+b {` or `Ctrl+b }` |
| Close current pane | `Ctrl+b x` |

### Scrolling and copy mode

By default the terminal output is not scrollable. Enter copy mode to scroll back through history.

| Action | Key |
|--------|-----|
| Enter scroll / copy mode | `Ctrl+b [` |
| Scroll up / down | Arrow keys or `Page Up` / `Page Down` |
| Search forward | `/` then type query |
| Search backward | `?` then type query |
| Exit scroll mode | `q` or `Esc` |

### Utilities

| Action | Key |
|--------|-----|
| List all key bindings | `Ctrl+b ?` |
| Enter command mode | `Ctrl+b :` |
| Clock | `Ctrl+b t` |

## Session management (CLI)

Run these commands in any terminal outside tmux:

```bash
# Start a new named session
tmux new-session -s my-session

# Attach to a running session
tmux attach -t my-session

# List all running sessions
tmux ls

# Kill a specific session
tmux kill-session -t my-session

# Kill all sessions
tmux kill-server
```

## Using tmux with Agent Teams

For Claude Code [Agent Teams](./agent-teams), start a named session before launching Claude:

```bash
tmux new-session -s claude-team
```

Then inside that session, run:

```bash
claude
```

Claude detects it is running inside tmux and displays teammates in split panes automatically when `teammateMode` is `"auto"` or `"tmux"`.

Add this alias to your shell config (`~/.zshrc` on macOS, `~/.bashrc` on Linux) for a one-command startup from any project directory:

```bash
alias claude-team='tmux new-session -s claude-team -c "$PWD" \; send-keys "claude" C-m'
```

Reload your shell config (`source ~/.zshrc`), then start Agent Teams with:

```bash
claude-team
```

See [Agent Teams](./agent-teams) for full configuration details, including `teammateMode` options and iTerm2 as an alternative to tmux.
