---
sidebar_position: 5
sidebar_label: OpenAI Codex
description: OpenAI Codex is a coding agent available as a CLI, IDE extension, desktop app, and cloud service that reads your codebase, edits files, and runs commands.
keywords: [Codex CLI, OpenAI Codex, terminal coding agent, AI CLI, OpenAI, code generation, local AI agent, Codex cloud, IDE extension]
---

# OpenAI Codex

Codex is OpenAI's coding agent. It reads your repository, proposes and applies edits, and runs commands inside a sandbox, with approval rules you control. It is available as a terminal CLI, an IDE extension, part of the ChatGPT desktop app, and as Codex cloud for delegated tasks.

This page covers installation and the basics. For the full deep-dive (AGENTS.md, sandbox and approvals, skills, subagents, hooks, MCP, `codex exec`, cloud), see the [Codex section](/codex).

## Installation

Standalone installer (macOS and Linux):

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
```

npm or Homebrew also work:

```bash
npm install -g @openai/codex
# or
brew install --cask codex
```

## Starting Codex

Run it from inside your project directory:

```bash
codex
```

This opens an interactive terminal session. Codex reads the repository, makes edits, and runs commands as you iterate. You can also pass the first prompt directly:

```bash
codex "refactor the auth module to use dependency injection"
```

For scripts and CI, use non-interactive mode:

```bash
codex exec "run the test suite and summarize failures"
```

See [Automation & Non-interactive Mode](../codex/automation.md) for output formats, exit handling, and CI patterns.

## Authentication

Run `codex login` (or just `codex`) and choose one of:

- **Sign in with ChatGPT**: uses your ChatGPT plan (Free, Go, Plus, Pro, Business, Edu, or Enterprise). Codex cloud requires this method.
- **API key**: usage-based billing through your OpenAI API organization.

The sign-in method also determines which admin controls and data-handling policies apply.

## Surfaces

| Surface | Best for | Notes |
|---------|----------|-------|
| **CLI** (`codex`) | Terminal workflows, scripting, CI | Full feature set: skills, subagents, hooks, MCP, `codex exec` |
| **IDE extension** | Editing with open files and selections as context | VS Code, Cursor, Windsurf; Xcode and JetBrains have their own Codex integrations |
| **ChatGPT desktop app** | Parallel chats, worktrees, long-running work | macOS, Windows, and Linux |
| **Codex cloud** | Delegated tasks in isolated environments, PR review | Started from the web, CLI (`codex cloud`), or IDE; results applied locally |

## Key concepts

### Sandbox and approvals

Codex runs commands inside an OS-level sandbox (Seatbelt on macOS, bubblewrap and seccomp on Linux, a native sandbox on Windows). Two settings control what it can do:

- `sandbox_mode`: `read-only`, `workspace-write`, or `danger-full-access`
- `approval_policy`: `on-request` (default), `never`, or a granular policy

Switch modes during a session with `/permissions`. Details: [Permissions & Sandbox](../codex/permissions.md) and [Auto-review](../codex/auto-review.md).

### AGENTS.md

Persistent project instructions live in `AGENTS.md` at the repository root (with optional nested files per directory and a personal `~/.codex/AGENTS.md`). This is the equivalent of `CLAUDE.md` for Claude Code. Details: [AGENTS.md & Memories](../codex/agents-md.md).

### Skills, subagents, hooks, plugins, MCP

Codex has native support for:

- [Skills](../codex/skills.md): `SKILL.md` folders in `.agents/skills/` or `~/.agents/skills/`, invoked explicitly or picked up automatically
- [Subagents](../codex/subagents.md): built-in and custom agents (`.codex/agents/*.toml`) that run focused work in their own context
- [Hooks](../codex/hooks.md): scripts or MCP tools that run at lifecycle events
- [Plugins](../codex/plugins.md): installable bundles of skills, MCP servers, and connectors
- [MCP](../codex/mcp.md): external tools via `codex mcp add` or `config.toml`

### Models and effort

Codex uses OpenAI models such as `gpt-5.6-sol`, `gpt-5.6-terra`, and `gpt-5.6-luna`, with `/model` to switch and adjustable reasoning effort:

```bash
codex --model gpt-5.6-terra
```

See [Managing Context](../codex/context.md) for effort levels, fast mode, and compaction.

## Tips

- Start in `read-only` or the default `workspace-write` with `on-request` approvals until you trust how Codex interprets your instructions
- Use specific, scoped prompts ("add input validation to the signup handler" rather than "improve the code")
- Create Git checkpoints before and after a task so you can revert
- Write an `AGENTS.md` before anything else; it is the highest-leverage configuration file

More: [Tips](../codex/tips.md).

## Limitations

- Only OpenAI models (no Claude, Gemini, or open-source models) unless you configure a custom `model_provider`
- Codex cloud requires ChatGPT sign-in; API-key users get local surfaces only
- Some features are marked experimental in the official docs and can change between releases

## Further reading

- [Codex deep-dive](/codex): all 16 pages
- [Claude Code](/claude-code) and [Cursor](/cursor) deep-dives for comparison
- [Official Codex documentation](https://developers.openai.com/codex/)
