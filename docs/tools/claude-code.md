---
sidebar_position: 2
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

## CLAUDE.md

Create a `CLAUDE.md` file at the root of your project to give Claude Code persistent context: coding conventions, project structure, commands to run, things to avoid.

```markdown
# Project conventions
- TypeScript strict mode, no `any`
- All API routes must have Zod validation
- Run `npm test` before committing
- Never modify migration files
```

### Keep it short

A well-structured CLAUDE.md is the single most impactful way to improve Claude Code's output, but bigger is not better. **Keep your CLAUDE.md under 60 lines.** Files over 150 lines degrade performance because they consume too much of the context window before the real work begins.

Focus on what matters most:
- Build and test commands
- Non-obvious coding conventions
- Files and directories that should not be modified
- Architecture decisions that affect every task

Leave out anything Claude can figure out by reading the code itself (language, framework, obvious patterns).

### Monorepo strategy

In monorepos, use multiple CLAUDE.md files instead of one large root file:

```text
repo/
├── CLAUDE.md              # Shared conventions (formatting, git workflow, CI)
├── packages/
│   ├── frontend/
│   │   └── CLAUDE.md      # React/TypeScript rules, component patterns
│   └── backend/
│       └── CLAUDE.md      # Go conventions, API patterns, database rules
```

Claude Code loads these hierarchically:
- **Ancestor loading**: walks upward from the working directory at startup, always loading parent CLAUDE.md files
- **Descendant loading**: lazy-loads subdirectory CLAUDE.md files when files in those directories are accessed

This means the root file's rules apply everywhere, while component-specific rules only load when relevant, saving context.

### Personal preferences with CLAUDE.local.md

For personal preferences that should not be shared with the team, create a `CLAUDE.local.md` file (add it to `.gitignore`):

```markdown
# My preferences
- Use verbose variable names
- Add comments explaining complex logic
- Always show me the diff before committing
```

:::note
Claude Code loads `CLAUDE.local.md` automatically at session start, the same way it loads `CLAUDE.md`. You do not need to reference it from `CLAUDE.md`. Just place the file in the same directory (typically the project root) and it will be picked up. The only setup required is adding `CLAUDE.local.md` to your `.gitignore` so it stays out of version control.
:::

## Managing context

Claude Code's output quality degrades as the context window fills up. Understanding and managing context usage is critical for long sessions.

### The compaction threshold

When context usage grows large, Claude Code's responses become less focused and more prone to errors. **Run `/compact` proactively when you reach roughly 50% context usage.** Do not wait for the automatic compaction, which triggers much later and may already be past the point of optimal performance.

### Practical tips

- **Check context usage** with the status line or `/cost` command to see how much of the window you have used
- **Start new sessions** for unrelated tasks instead of reusing a long-running session
- **Size subtasks** so each one can complete well within 50% of available context
- **Use subagents** for noisy tasks (large searches, exploring unfamiliar code) so the main context stays clean

### Checkpointing

Claude Code automatically tracks file edits with git-based checkpoints. If something goes wrong, you can rewind to a previous state:

- Press `Esc` twice to undo the last set of changes
- Use `/rewind` to go back to a specific checkpoint

This makes it safe to let Claude Code try ambitious changes: you can always roll back.

## Permissions and security

Claude Code uses a layered permission system to control which tools can run and which files can be accessed.

### Permission levels

Permissions are configured in `.claude/settings.json` (project) or `~/.claude/settings.json` (user):

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm run *)",
      "Bash(npx prettier *)",
      "Edit(src/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Edit(.env*)"
    ]
  }
}
```

### Wildcard syntax

Use wildcard patterns to grant scoped permissions without blanket access. This is much safer than `dangerously-skip-permissions`:

| Pattern | What it allows |
|---------|----------------|
| `Bash(npm run *)` | Any npm script |
| `Bash(npx prettier *)` | Prettier formatting only |
| `Edit(src/**)` | Editing any file under src/ |
| `Edit(docs/**)` | Editing any file under docs/ |
| `Read` | Reading any file (no restriction) |

### Sandbox mode

For additional isolation, use `/sandbox` to restrict file system access and network connections. This reduces permission prompts for trusted operations while keeping untrusted ones blocked.

## CLI flags

### Session management

| Flag | Purpose |
|------|---------|
| `--continue` | Resume the most recent session |
| `--resume [id]` | Resume a specific session by ID, or open a picker |
| `--fork-session` | Branch off from a resumed session without modifying the original (use with `--resume` or `--continue`) |
| `--from-pr [number]` | Start a session from a GitHub pull request |
| `--session-id <uuid>` | Use a specific session ID (must be a valid UUID) |

### Model and effort

| Flag | Purpose |
|------|---------|
| `--model sonnet` | Use a specific model (aliases like `sonnet`, `opus`, or full model IDs) |
| `--fallback-model <model>` | Automatic fallback when the primary model is overloaded (headless mode only) |
| `--effort <level>` | Set reasoning depth: `low`, `medium`, or `high` |
| `--max-budget-usd 5` | Set a spending cap for the session (headless mode only) |
| `--max-turns 20` | Limit the number of agentic turns |

### Permissions and tool control

| Flag | Purpose |
|------|---------|
| `--permission-mode <mode>` | Permission mode: `default`, `acceptEdits`, `plan`, `bypassPermissions`, `dontAsk` |
| `--allowedTools <tools>` | Allow specific tools (e.g. `"Bash(git:*) Edit Read"`) |
| `--disallowedTools <tools>` | Deny specific tools (e.g. `"Bash(rm:*)"`) |
| `--tools <tools>` | Restrict the available tool set entirely (`""` to disable all, `"default"` for all) |
| `--dangerously-skip-permissions` | Bypass all permission checks (sandboxed environments only) |

### Headless and scripting

| Flag | Purpose |
|------|---------|
| `--print "prompt"` | Run a single prompt in headless mode (no interactive session) |
| `--output-format <format>` | Output format with `--print`: `text`, `json`, or `stream-json` |
| `--input-format <format>` | Input format with `--print`: `text` or `stream-json` |
| `--json-schema <schema>` | Enforce structured output with a JSON Schema |
| `--no-session-persistence` | Do not save the session to disk (headless mode only) |

### System prompts

| Flag | Purpose |
|------|---------|
| `--system-prompt <prompt>` | Replace the default system prompt entirely |
| `--append-system-prompt <prompt>` | Append instructions to the default system prompt |

### Agents and plugins

| Flag | Purpose |
|------|---------|
| `--agent <agent>` | Use a named agent for the session |
| `--agents <json>` | Define custom agents inline as JSON |
| `--plugin-dir <paths>` | Load plugins from directories for this session |

### MCP servers

| Flag | Purpose |
|------|---------|
| `--mcp-config <config>` | Load MCP servers from a JSON file or string |
| `--strict-mcp-config` | Only use MCP servers from `--mcp-config`, ignore all other config |

### Files and directories

| Flag | Purpose |
|------|---------|
| `--add-dir <directories>` | Grant tool access to directories outside the working directory |
| `--worktree [name]` | Create a new git worktree for isolated work |
| `--tmux` | Create a tmux session for the worktree (requires `--worktree`) |

### Debug

| Flag | Purpose |
|------|---------|
| `--debug [filter]` | Enable debug mode with optional category filtering (e.g. `"api,hooks"`) |
| `--verbose` | Enable verbose output |

### Key environment variables

| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_EFFORT_LEVEL` | Set effort level: `high`, `medium`, or `low` |
| `MAX_THINKING_TOKENS` | Control how many tokens the model uses for reasoning |

## Debugging Claude Code

When things are not working as expected:

- **Run `/doctor`** for diagnostics. It checks your installation, configuration, and common issues.
- **Use background terminal tasks** for processes that produce logs (dev servers, watchers). This gives Claude better visibility into what is happening.
- **Provide screenshots** when debugging visual issues. Claude Code can read images.
- **Check `/mcp`** to verify MCP server connections if external tools are not responding.

## Environment tips

- **Use a standalone terminal** (iTerm2, Alacritty, Windows Terminal) rather than your IDE's built-in terminal. IDE terminals can cause stability issues with long-running sessions.
- **Enable the status line** to monitor context usage, active model, and session cost at a glance.
- **Use `/fast` mode** for quick, straightforward tasks. It uses the same model but with faster output. Note that fast mode is billed to extra usage from the first token.

## Tips

- **Be specific**: tell Claude exactly what you want and what constraints to respect
- **Review changes**: use `/diff` or check git diff before accepting edits
- **Scope tasks**: break large tasks into smaller steps for better results
- **Use CLAUDE.md**: persistent context saves you from repeating yourself every session
- **Commit frequently**: commit after each completed task so you have rollback points
- **Start with plan mode**: for complex tasks, use plan mode first to agree on the approach before any code is written
