---
sidebar_position: 9
sidebar_label: Hooks
description: Hooks are shell commands and HTTP requests that run deterministically at specific Claude Code lifecycle events, providing reliable automation independent of AI judgment.
keywords: [Claude Code hooks, lifecycle hooks, shell commands, deterministic automation, formatting, file protection, pre-tool hooks, post-tool hooks]
---

# Hooks

Hooks are user-defined shell commands, HTTP requests, or LLM prompts that execute automatically at specific points in Claude Code's lifecycle. Unlike skills (which are AI-driven and flexible), hooks provide **deterministic control**: they always run the same way, every time, without relying on the LLM to decide whether to execute them.

## Why hooks matter

Claude Code is powerful, but some tasks should never depend on AI judgment:

- **Formatting** should happen on every file write, not just when Claude remembers to run Prettier
- **Protected files** (`.env`, lock files) should be blocked from edits unconditionally
- **Linting** should run after every code change, not when prompted
- **Audit logging** should capture every command, not just the ones Claude considers important
- **Notifications** should fire when Claude needs input, so you do not have to watch the terminal

Hooks solve this by letting you define rules that execute automatically at the right moment in Claude Code's lifecycle.

## Hook types

Claude Code supports five types of hooks:

| Type | What it does | Best for |
|------|-------------|----------|
| **command** | Runs a shell command | File operations, linting, formatting, scripts |
| **http** | Sends a POST request to a URL | External integrations, logging services, webhooks |
| **mcp_tool** | Calls a tool on a connected MCP server | Delegating to external tools already configured in MCP |
| **prompt** | Evaluates a single LLM prompt | Judgment-based checks (is this code safe?) |
| **agent** | Spawns a subagent with tool access | Complex verification (run tests, check coverage) |

## Lifecycle events

Hooks attach to lifecycle events. Each event fires at a specific moment during a Claude Code session:

| Event | When it fires | Supports all types? |
|-------|---------------|---------------------|
| **SessionStart** | Session begins or resumes. Matcher values: `startup`, `resume`, `clear`, `compact` | Command only |
| **UserPromptSubmit** | User submits a prompt, before Claude processes it | All |
| **UserPromptExpansion** | A slash command is expanded before Claude sees the prompt. Matcher: command name | All |
| **PreToolUse** | Before a tool call executes (can block it) | All |
| **PermissionRequest** | When a permission dialog appears | All |
| **PermissionDenied** | When auto mode classifier denies a tool call. Return `retry: true` to allow retry | All |
| **PostToolUse** | After a tool call succeeds | All |
| **PostToolUseFailure** | After a tool call fails | All |
| **PostToolBatch** | After a batch of parallel tool calls completes | All |
| **Notification** | When Claude Code sends a notification. Matcher values: `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` | Command only |
| **SubagentStart** | A subagent spawns. Matcher values: agent type names (e.g. `Explore`, `Plan`) | All |
| **SubagentStop** | A subagent finishes | All |
| **Stop** | Claude finishes responding (not on user interrupt) | All |
| **StopFailure** | A turn ends due to an API error. Matcher values: `rate_limit`, `authentication_failed` | All |
| **TaskCreated** | A task is created | All |
| **TaskCompleted** | A task is marked as completed | All |
| **InstructionsLoaded** | A CLAUDE.md or `.claude/rules/` file is loaded. Matcher values: `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact` | All |
| **FileChanged** | A watched file changes on disk. Matcher: literal filename or glob pattern | Command only |
| **CwdChanged** | Working directory changes | Command only |
| **PreCompact** | Before context compaction. Matcher values: `manual`, `auto` | Command only |
| **PostCompact** | After context compaction | Command only |
| **Elicitation** | An MCP server requests user input | All |
| **ElicitationResult** | Result of an MCP elicitation | All |
| **ConfigChange** | A config file changes during the session. Matcher values: `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills` | Command only |
| **WorktreeCreate** | A git worktree is created | Command only |
| **WorktreeRemove** | A git worktree is removed | Command only |
| **TeammateIdle** | An agent team teammate is about to go idle | Command only |
| **SessionEnd** | Session terminates. Matcher values: `clear`, `logout`, `prompt_input_exit` | Command only |

## Configuration

### Where hooks live

Hooks can be defined at different scopes:

| Location | Scope | Shareable with team? |
|----------|-------|----------------------|
| `~/.claude/settings.json` | All your projects (user-level) | No |
| `.claude/settings.json` | Current project | Yes (commit it) |
| `.claude/settings.local.json` | Current project, local only | No (gitignored) |
| Skill or agent frontmatter | Active while that component runs | Yes |

### Basic structure

Hooks are defined in the `hooks` key of a settings file:

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "optional_pattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-shell-command"
          }
        ]
      }
    ]
  }
}
```

### Matchers

Matchers filter when a hook fires. Without a matcher, the hook fires on every occurrence of its event.

**Tool-based events** (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`) match on tool names:

```json
{ "matcher": "Bash" }
{ "matcher": "Edit|Write" }
{ "matcher": "mcp__github__.*" }
```

**SessionStart** matches on how the session started: `startup`, `resume`, `clear`, `compact`

**Notification** matches on notification type: `permission_prompt`, `idle_prompt`, `auth_success`

**SubagentStart/SubagentStop** match on agent type: `Explore`, `Plan`, or custom agent names

Matchers are case-sensitive and support regex syntax. Use `|` to match multiple patterns.

## Practical examples

### Auto-format code after every edit

Run Prettier automatically whenever Claude writes or edits a file:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write 2>/dev/null"
          }
        ]
      }
    ]
  }
}
```

### Block edits to protected files

Prevent Claude from modifying sensitive files like `.env`, lock files, or the `.git/` directory:

```bash
#!/bin/bash
# .claude/hooks/protect-files.sh
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED=(".env" "package-lock.json" ".git/" "yarn.lock")

for pattern in "${PROTECTED[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: cannot modify $FILE_PATH (matches protected pattern '$pattern')" >&2
    exit 2
  fi
done
exit 0
```

Register it in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

### Desktop notifications when Claude needs input

Stop watching the terminal. Get a system notification when Claude needs your attention:

**Linux:**

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Permission needed'"
          }
        ]
      }
    ]
  }
}
```

**macOS:**

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Permission needed\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

### Log all Bash commands for auditing

Keep a record of every shell command Claude runs:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
          }
        ]
      }
    ]
  }
}
```

### Re-inject context after compaction

When Claude's context fills up and gets compacted, important instructions can be lost. Use a `SessionStart` hook with the `compact` matcher to re-inject critical context:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: Use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

### Enforce quality gates before stopping

Use an agent-based hook to verify tests pass before Claude considers its work done:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Run the test suite and verify all tests pass. If tests fail, report what needs fixing. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

### Delegate to an MCP tool

Call a connected MCP server tool from a hook. Variable substitution with `${tool_input.field}` injects values from the hook's JSON input:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "mcp_tool",
            "server": "security-scanner",
            "tool": "scan_file",
            "input": {
              "file_path": "${tool_input.file_path}"
            }
          }
        ]
      }
    ]
  }
}
```

### Send events to an external service

POST tool usage data to a monitoring endpoint via HTTP:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "https://monitoring.example.com/api/claude-events",
            "headers": {
              "Authorization": "Bearer $AUTH_TOKEN",
              "Content-Type": "application/json"
            },
            "allowedEnvVars": ["AUTH_TOKEN"]
          }
        ]
      }
    ]
  }
}
```

### Run tests asynchronously after file changes

Start the test suite in the background so Claude keeps working while tests run:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/run-tests.sh",
            "async": true,
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

### Persist environment variables across a session

Use `CLAUDE_ENV_FILE` in `SessionStart` or `CwdChanged` hooks to inject environment variables that persist for the rest of the session:

```bash
#!/bin/bash
# Set up environment at session start
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
fi
exit 0
```

## How hooks communicate

Hook scripts receive JSON input via stdin and communicate results through exit codes and stdout/stderr.

### Input data

Every hook receives common fields:

```json
{
  "session_id": "abc123",
  "cwd": "/path/to/project",
  "hook_event_name": "PreToolUse"
}
```

Tool-related events add `tool_name`, `tool_input`, and (for `PostToolUse`) `tool_output`.

Parse input in your scripts with `jq`:

```bash
#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
```

### Exit codes

| Exit code | Effect |
|-----------|--------|
| **0** | Action proceeds. Stdout is added to Claude's context. |
| **2** | Action blocked. Stderr is sent to Claude as feedback. |
| **Other** | Action proceeds. Output is logged but not shown to Claude. |

### Structured JSON output

For finer control, return JSON on stdout (with exit 0):

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use rg instead of grep for better performance"
  }
}
```

Valid `permissionDecision` values for `PreToolUse`:
- `"allow"`: bypass the permission prompt and let the tool run
- `"deny"`: block the tool call and send the reason to Claude
- `"ask"`: show the normal permission prompt to the user
- `"defer"`: pause execution for external processing (non-interactive mode only); resume with `claude -p --resume <session-id>`

## Hooks in skills and agents

Hooks can be scoped to specific skills or agents by adding them to the frontmatter:

```yaml
# .claude/skills/deploy/SKILL.md
---
name: deploy
description: Deploy the application
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: "command"
          command: "echo 'Deploy hook: validating command' >&2"
---

Deploy instructions here...
```

These hooks only run while that skill or agent is active.

## Hooks vs. skills

| | Hooks | Skills |
|-|-------|--------|
| **Execution** | Automatic on lifecycle events | Claude decides when to use (or user invokes with `/`) |
| **Determinism** | Always runs the same way | AI-driven, flexible |
| **Can block actions** | Yes (exit code 2 or `permissionDecision: deny`) | No |
| **Tool access** | Limited to stdin/stdout | Full tool access |
| **Best for** | Formatting, linting, protection, notifications, auditing | Instructions, conventions, reusable tasks |

**Rule of thumb:** if it should happen every time without exception, use a hook. If it requires judgment or flexibility, use a skill.

## Common pitfalls

**Shell profile interference.** If your `.bashrc` or `.zshrc` contains unconditional `echo` statements, they prepend to hook output and break JSON parsing. Wrap them in an interactive-shell check:

```bash
if [[ $- == *i* ]]; then
  echo "Only in interactive shells"
fi
```

**Stop hook infinite loops.** If a `Stop` hook blocks Claude from stopping, Claude will keep working, trigger the hook again, get blocked again, and loop forever. Always check the `stop_hook_active` field:

```bash
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # Allow Claude to stop on second attempt
fi
# Your validation logic here
```

**Case-sensitive matchers.** `bash` will not match `Bash`. Tool names are capitalized.

**Relative paths.** Always use `"$CLAUDE_PROJECT_DIR"` or absolute paths. Relative paths may not resolve correctly from the hook's working directory.

**Async hooks cannot control flow.** Since they run in the background, fields like `permissionDecision` and `decision` are ignored. Use async hooks only for logging, notifications, or background tasks.

For async hooks where you want to wake Claude back up when the background job finishes (for example, to report a build failure), use `"asyncRewake": true`. Claude Code wakes the session on exit code 2 and shows the hook's stderr as a system reminder:

```json
{
  "type": "command",
  "command": ".claude/hooks/build-and-report.sh",
  "async": true,
  "asyncRewake": true
}
```

**Run a hook only once per session.** Set `"once": true` in a hook handler inside skill or agent frontmatter to prevent it from firing on every event after the first:

```yaml
hooks:
  SessionStart:
    - hooks:
        - type: command
          command: echo "Setup complete"
          once: true
```

**Exit 2 with JSON.** When you exit with code 2, Claude Code ignores any JSON output. Use exit 0 with structured JSON for fine-grained control, or exit 2 with stderr for simple blocking.
