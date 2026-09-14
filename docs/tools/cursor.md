---
sidebar_position: 4
sidebar_label: Cursor
description: Cursor is an AI coding agent and editor (VS Code fork) with Agent, Plan, Ask, and Debug modes, a terminal CLI, cloud agents, and Bugbot PR review.
keywords: [Cursor, AI code editor, VS Code fork, Cursor Agent, Cursor CLI, multi-file editing, Plan Mode, cloud agents, Bugbot, AI pair programming]
---

# Cursor

Cursor is a coding agent wrapped in an editor. The editor is a fork of VS Code, so your extensions, keybindings, and settings carry over, but the core of the product is Agent: it searches your repository, plans and edits across files, runs commands, drives a browser, and reviews its own changes. The same agent is available as a terminal CLI (`agent`), as Cloud Agents that run in isolated environments, and as Bugbot for pull request review.

This page covers installation and the basics. For the full deep-dive (rules, agent modes, CLI, skills, subagents, hooks, MCP, plugins, cloud agents, parallel agents, Bugbot), see the [Cursor section](/cursor).

## Installation

Download the desktop app from [cursor.com/downloads](https://cursor.com/downloads) (macOS 12+, Windows 10+, Linux via apt, yum, or AppImage). Import your VS Code settings and extensions on first launch.

Install the CLI separately:

```bash
curl https://cursor.com/install -fsS | bash
```

Windows (PowerShell):

```powershell
irm 'https://cursor.com/install?win32=true' | iex
```

See [Cursor CLI](../cursor/cli.md) for authentication, flags, headless mode, and CI usage.

## First steps

1. Open a project folder and press `Cmd+I` to open Agent
2. Ask it to explain the codebase: "Explain this codebase. Point me to the main entry points and anything I should read before making changes."
3. Ask for one small, safe change, review the diff, and run your project's checks
4. Press `Shift+Tab` to switch to **Plan Mode** for anything that spans multiple files

## Agent modes

| Mode | Edits files? | Use it for |
|------|--------------|------------|
| **Agent** | Yes | Default: end-to-end tasks with search, edits, terminal, and browser |
| **Plan** | Not until you approve | Research, clarifying questions, and an editable plan before code |
| **Ask** | No | Read-only exploration and explanation |
| **Debug** | Instrumentation first, then a fix | Root-causing bugs with hypotheses and runtime evidence |
| **Design** | Yes | Directing the agent visually from the built-in browser |

Details: [Agent Modes](../cursor/modes.md).

## Persistent instructions

Cursor reads several kinds of project instructions:

- **`AGENTS.md`** at the repo root (and nested in subdirectories): plain Markdown, the cross-tool standard, the simplest choice
- **`.cursor/rules/*.mdc`**: rules with YAML frontmatter (`description`, `globs`, `alwaysApply`) so they can attach automatically to matching files or be requested by the agent
- **User Rules** in settings for personal preferences across all projects
- **Team Rules** managed from the dashboard on Teams and Enterprise plans

The older `.cursorrules` file still works but is deprecated. Details: [Rules & AGENTS.md](../cursor/rules.md).

## Skills, subagents, hooks, plugins, MCP

Cursor has native support for:

- [Skills](../cursor/skills.md): `SKILL.md` folders in `.cursor/skills/` or `~/.cursor/skills/`, invoked with `/skill-name` or picked up automatically
- [Subagents](../cursor/subagents.md): built-in (Explore, Bash, Browser) and custom agents in `.cursor/agents/*.md`
- [Hooks](../cursor/hooks.md): `hooks.json` scripts that run at lifecycle events (before shell execution, after file edit, on stop, and more)
- [Plugins](../cursor/plugins.md): marketplace bundles of rules, skills, MCP servers, subagents, and hooks
- [MCP](../cursor/mcp.md): external tools via `.cursor/mcp.json` or `~/.cursor/mcp.json`

## Editing shortcuts

| Shortcut | What it does |
|----------|-------------|
| `Cmd+I` | Open or toggle the Agent panel |
| `Cmd+K` | Inline Edit on the current selection (or the terminal prompt bar) |
| `Cmd+L` with a selection | Add the selection to a new chat |
| `Tab` | Accept a Tab completion |
| `Shift+Tab` | Rotate Agent modes |
| `Cmd+E` | Toggle the Agent layout |

Full reference: [Commands & Shortcuts](../cursor/commands.md).

## Cursor vs. Copilot

| | Cursor | Copilot |
|---|---|---|
| Codebase search | Repository-wide (Instant Grep, Explore subagent) | Open files plus workspace search |
| Editor | Standalone (VS Code fork) | Plugin for existing editors |
| Multi-file agent edits | Yes (Agent, Plan Mode) | Yes (agent mode), less configurable |
| Instructions files | `AGENTS.md`, `.cursor/rules/*.mdc` | `.github/copilot-instructions.md` |
| Inline edit shortcut | `Cmd+K` | `Ctrl+I` |
| Terminal CLI | Yes (`agent`) | Yes (Copilot CLI) |

## Tips

- Use Plan Mode for anything that touches more than a couple of files; approve the plan before code is written
- Keep `AGENTS.md` short and concrete; move file-specific guidance into `.cursor/rules/*.mdc` with `globs`
- Use `@` to attach files, folders, terminals, past chats, and diffs rather than pasting code
- Run several agents in parallel from the Agents Window with worktrees when tasks are independent

More: [Tips](../cursor/tips.md).

## Further reading

- [Cursor deep-dive](/cursor): all 16 pages
- [Claude Code](/claude-code) and [Codex](/codex) deep-dives for comparison
- [Official Cursor documentation](https://cursor.com/docs)
