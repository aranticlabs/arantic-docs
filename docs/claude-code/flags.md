---
sidebar_position: 7
sidebar_label: CLI Flags
description: Complete reference for Claude Code CLI flags covering session management, model selection, output formatting, and headless/CI mode options.
keywords: [Claude Code CLI flags, command line options, --continue, --resume, --model, headless mode, CI integration, CLI reference]
---

# CLI Flags

## Session management

| Flag | Purpose |
|------|---------|
| `--continue` | Resume the most recent session |
| `--resume [id]` | Resume a specific session by ID, or open a picker |
| `-n <name>` / `--name <name>` | Name the session for easy retrieval later (e.g. `claude -n auth-refactor`) |
| `--fork-session` | Branch off from a resumed session without modifying the original (use with `--resume` or `--continue`) |
| `--from-pr [number]` | Start a session from a GitHub pull request |
| `--teleport` | Pull a session started on the web or iOS app into the local terminal |
| `--session-id <uuid>` | Use a specific session ID (must be a valid UUID) |

## Model and effort

| Flag | Purpose |
|------|---------|
| `--model sonnet` | Use a specific model (aliases like `sonnet`, `opus`, or full model IDs) |
| `--fallback-model <model>` | Automatic fallback when the primary model is overloaded (headless mode only) |
| `--effort <level>` | Set reasoning depth: `low`, `medium`, `high`, `xhigh`, or `max`. Available levels depend on the model. |
| `--max-budget-usd 5` | Set a spending cap for the session (headless mode only) |
| `--max-turns 20` | Limit the number of agentic turns |

## Permissions and tool control

| Flag | Purpose |
|------|---------|
| `--permission-mode <mode>` | Permission mode: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` |
| `--allowedTools <tools>` | Allow specific tools (e.g. `"Bash(git:*) Edit Read"`) |
| `--disallowedTools <tools>` | Deny specific tools (e.g. `"Bash(rm:*)"`) |
| `--tools <tools>` | Restrict the available tool set entirely (`""` to disable all, `"default"` for all) |
| `--dangerously-skip-permissions` | Bypass all permission checks (sandboxed environments only). Equivalent to `--permission-mode bypassPermissions` |
| `--allow-dangerously-skip-permissions` | Add `bypassPermissions` to the Shift+Tab mode cycle without starting in it |

:::warning
**`--dangerously-skip-permissions` disables all safety prompts.** Claude Code will read, write, and execute anything without asking. Only use this inside a fully sandboxed environment with no internet access and no access to sensitive data (e.g. a disposable Docker container or CI job). Never use it on your main development machine. Prefer scoped `--allowedTools` rules to grant exactly the access you need instead.
:::

## Headless and scripting

| Flag | Purpose |
|------|---------|
| `--print "prompt"` | Run a single prompt in headless mode (no interactive session) |
| `--output-format <format>` | Output format with `--print`: `text`, `json`, or `stream-json` |
| `--input-format <format>` | Input format with `--print`: `text` or `stream-json` |
| `--json-schema <schema>` | Enforce structured output with a JSON Schema |
| `--no-session-persistence` | Do not save the session to disk (headless mode only) |
| `--bare` | Minimal mode: skip auto-discovery of hooks, skills, plugins, MCP servers, auto memory, and CLAUDE.md. Faster starts for scripted calls. |

## Background agents

| Flag | Purpose |
|------|---------|
| `--bg` | Start the session as a background agent and return immediately. Prints the session ID and management commands. |
| `--exec` | Run a shell command as a background job instead of starting a Claude session. Use with `--bg`. |

## System prompts

| Flag | Purpose |
|------|---------|
| `--system-prompt <prompt>` | Replace the default system prompt entirely |
| `--system-prompt-file <path>` | Replace the default system prompt with contents of a file |
| `--append-system-prompt <prompt>` | Append instructions to the default system prompt |
| `--append-system-prompt-file <path>` | Append file contents to the default system prompt |

`--system-prompt` and `--system-prompt-file` are mutually exclusive. Append flags can be combined with either replacement flag. Use an append flag to preserve Claude's default coding assistant identity while adding extra rules; use a replacement flag when the identity or permission model differs from Claude Code's defaults.

## Agents and plugins

| Flag | Purpose |
|------|---------|
| `--agent <agent>` | Use a named agent for the session |
| `--agents <json>` | Define custom agents inline as JSON |
| `--plugin-dir <paths>` | Load plugins from directories for this session |

## MCP servers

| Flag | Purpose |
|------|---------|
| `--mcp-config <config>` | Load MCP servers from a JSON file or string |
| `--strict-mcp-config` | Only use MCP servers from `--mcp-config`, ignore all other config |

## Files and directories

| Flag | Purpose |
|------|---------|
| `--add-dir <directories>` | Grant tool access to directories outside the working directory |
| `--worktree [name]` | Create a new git worktree for isolated work |
| `--tmux` | Create a tmux session for the worktree (requires `--worktree`) |

## Debug

| Flag | Purpose |
|------|---------|
| `--debug [filter]` | Enable debug mode with optional category filtering (e.g. `"api,hooks"`) |
| `--verbose` | Enable verbose output |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_EFFORT_LEVEL` | Set effort level: `low`, `medium`, `high`, `xhigh`, or `max` |
| `MAX_THINKING_TOKENS` | Control how many tokens the model uses for reasoning (set to `0` to disable thinking) |
| `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` | Set to `1` to revert to a fixed thinking token budget instead of adaptive reasoning (applies to Sonnet 4.6 and Opus 4.6 only) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Set to `1` to disable auto memory globally |
| `ANTHROPIC_MODEL` | Override the default model for all sessions |
