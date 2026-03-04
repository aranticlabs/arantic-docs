---
sidebar_position: 1
sidebar_label: Claude Code
---

# Claude Code

Claude Code is Anthropic's official CLI for Claude. It runs in your terminal, reads your codebase, executes commands, and can handle multi-step programming tasks autonomously.

## Installation

```bash
npm install -g @anthropic-ai/claude-code
```

Requires Node.js 18+ and an Anthropic API key (or Claude Pro/Max subscription).

## Basic usage

Run it from inside your project directory:

```bash
claude
```

Claude Code automatically reads your project structure and can access any file in the working directory.

## Key capabilities

### Agentic task execution

Unlike chat tools, Claude Code can take actions: edit files, run tests, install packages, and iterate until a task is complete.

```text
Fix the failing tests in src/auth/ and make sure all other tests still pass.
```

### Full codebase context

Claude Code indexes your repository so you don't need to paste code manually. You can reference files by name:

```text
Refactor the UserService class to use dependency injection.
```

### Custom commands (slash commands)

You can define custom `/commands` in `.claude/commands/` as Markdown files. These become reusable prompts available in any session. See the [Skills](./skills) page for details.

### Hooks

Hooks are deterministic shell scripts that run outside the agentic loop in response to specific lifecycle events. Unlike prompts and instructions, hooks execute reliably every time the triggering event occurs.

**Common hook events:**

| Event | When it fires | Typical use |
|-------|---------------|-------------|
| `PreToolUse` | Before a tool is called | Block disallowed operations, validate inputs |
| `PostToolUse` | After a tool completes | Auto-format edited files, run linting |
| `SessionStart` | When a new session begins | Set up environment, display reminders |
| `TaskCompleted` | When a task finishes | Run tests, send notifications |

**Example: auto-format on save**

Configure in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "npx prettier --write $CLAUDE_FILE_PATH"
      }
    ]
  }
}
```

Hooks are useful for guardrails that must always run (formatting, linting, security checks) rather than relying on instructions that the model might skip.

### MCP servers

Claude Code supports the Model Context Protocol (MCP), allowing you to connect it to external tools: databases, APIs, internal systems. See the [MCP Servers](./mcp) page for configuration details.

## Learn more

- **[Memory](./memory)**: give Claude Code persistent project context with CLAUDE.md and other memory files
- **[Managing Context](./context)**: compaction, checkpointing, and context usage tips
- **[Permissions](./permissions)**: control which tools can run and which files can be accessed
- **[CLI Flags](./flags)**: full reference for all command-line flags
- **[Debugging](./debugging)**: troubleshooting and environment tips
- **[Tips](./tips)**: best practices for effective use
