---
sidebar_position: 6
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
| `--fork-session` | Branch off from a resumed session without modifying the original (use with `--resume` or `--continue`) |
| `--from-pr [number]` | Start a session from a GitHub pull request |
| `--session-id <uuid>` | Use a specific session ID (must be a valid UUID) |

## Model and effort

| Flag | Purpose |
|------|---------|
| `--model sonnet` | Use a specific model (aliases like `sonnet`, `opus`, or full model IDs) |
| `--fallback-model <model>` | Automatic fallback when the primary model is overloaded (headless mode only) |
| `--effort <level>` | Set reasoning depth: `low`, `medium`, or `high` |
| `--max-budget-usd 5` | Set a spending cap for the session (headless mode only) |
| `--max-turns 20` | Limit the number of agentic turns |

## Permissions and tool control

| Flag | Purpose |
|------|---------|
| `--permission-mode <mode>` | Permission mode: `default`, `acceptEdits`, `plan`, `bypassPermissions`, `dontAsk` |
| `--allowedTools <tools>` | Allow specific tools (e.g. `"Bash(git:*) Edit Read"`) |
| `--disallowedTools <tools>` | Deny specific tools (e.g. `"Bash(rm:*)"`) |
| `--tools <tools>` | Restrict the available tool set entirely (`""` to disable all, `"default"` for all) |
| `--dangerously-skip-permissions` | Bypass all permission checks (sandboxed environments only) |

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

## System prompts

| Flag | Purpose |
|------|---------|
| `--system-prompt <prompt>` | Replace the default system prompt entirely |
| `--append-system-prompt <prompt>` | Append instructions to the default system prompt |

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
| `CLAUDE_CODE_EFFORT_LEVEL` | Set effort level: `high`, `medium`, or `low` |
| `MAX_THINKING_TOKENS` | Control how many tokens the model uses for reasoning |
