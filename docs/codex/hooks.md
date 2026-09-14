---
sidebar_position: 10
sidebar_label: Hooks
description: Codex hooks run shell commands or MCP tools at lifecycle events like PreToolUse, PostToolUse, and Stop for deterministic control independent of the model.
keywords:
  [
    Codex hooks,
    hooks.json,
    lifecycle hooks,
    PreToolUse,
    PostToolUse,
    PermissionRequest,
    Stop hook,
    SessionStart,
    MCP tool hooks,
    deterministic automation,
  ]
---

# Hooks

Hooks are scripts or MCP tool calls that Codex runs automatically at fixed points in the agent loop: before a command executes, after a patch is applied, when a turn ends, when the session compacts, and so on. Unlike instructions in `AGENTS.md` or [skills](./skills.md), which the model may or may not follow, hooks run the same way every time. Use them for the things that must never depend on model judgment: blocking dangerous commands, formatting, audit logging, notifications, and quality gates.

## Why hooks matter

- **Protected files and commands** should be blocked unconditionally, not only when the model remembers the rule.
- **Formatting and linting** should run after every edit, not when prompted.
- **Audit logging** should capture every shell command, including the ones the model considers unimportant.
- **Notifications** should fire when Codex needs you or finishes, so you can stop watching the terminal.
- **Quality gates** (tests, type checks) should hold the turn open until they pass.

Runtime behavior to keep in mind:

- Matching hooks from every source run; higher-precedence config layers add hooks, they do not replace lower ones.
- Multiple command hooks matching the same event launch concurrently, so one hook cannot stop another from starting.
- Non-managed hooks must be reviewed and trusted before they run (see [Trust](#review-and-trust-hooks)).

## Hook types

| Type       | What it does                                                             | Status             |
| ---------- | ------------------------------------------------------------------------ | ------------------ |
| `command`  | Runs a shell command with the event JSON on stdin                        | Supported          |
| `mcp_tool` | Calls a tool on an already-connected MCP server with templated arguments | Supported          |
| `prompt`   | Would evaluate an LLM prompt                                             | Parsed but skipped |
| `agent`    | Would spawn a subagent                                                   | Parsed but skipped |

Codex reads the same `hooks.json` shape as Claude Code, which is why `prompt` and `agent` parse without error, but only `command` and `mcp_tool` handlers execute.

## Lifecycle events

| Event               | Fires when                                                                           | Matcher filters                                   | Can block or steer?                                              |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------- |
| `SessionStart`      | Session starts or resumes, after `/clear`, or after compaction                       | `source`: `startup`, `resume`, `clear`, `compact` | Adds context; `continue: false` after `compact` ends the turn    |
| `SessionEnd`        | Main thread ends (close, archive, delete, or 30 minutes idle with no client)         | `reason`: currently only `other`                  | No, advisory only                                                |
| `UserPromptSubmit`  | You submit a prompt, before the model sees it                                        | Not supported                                     | Yes, can block the prompt                                        |
| `PreToolUse`        | Before a tool call runs (Bash, `apply_patch`, MCP tools, other local function tools) | Tool name                                         | Yes, deny or rewrite input                                       |
| `PermissionRequest` | Codex is about to ask you for approval                                               | Tool name                                         | Yes, allow or deny instead of prompting                          |
| `PostToolUse`       | After a tool produces output (including failed Bash commands)                        | Tool name                                         | Replaces the tool result with feedback; cannot undo side effects |
| `PreCompact`        | Before context compaction                                                            | `trigger`: `manual`, `auto`                       | `continue: false` stops compaction                               |
| `PostCompact`       | After context compaction                                                             | `trigger`: `manual`, `auto`                       | `continue: false` stops the turn                                 |
| `SubagentStart`     | A subagent starts                                                                    | `agent_type`                                      | Adds context; cannot stop the subagent                           |
| `SubagentStop`      | A subagent finishes                                                                  | `agent_type`                                      | Yes, can request continuation                                    |
| `Stop`              | Codex finishes a turn                                                                | Not supported                                     | Yes, can request continuation                                    |
| `Interrupt`         | You interrupt an active turn on the main thread                                      | Not supported                                     | No, advisory only; 1 to 3 second timeout                         |

`Interrupt` and `SessionEnd` do not run for subagents. Hosted tools such as `WebSearch` do not pass through the local hook path, so `PreToolUse` and `PostToolUse` never see them.

## Configuration

### Where hooks live

Codex discovers hooks next to each active config layer, either as a `hooks.json` file or as inline `[hooks]` tables in `config.toml`:

| Location                                            | Scope                       | Notes                                                                |
| --------------------------------------------------- | --------------------------- | -------------------------------------------------------------------- |
| `~/.codex/hooks.json`                               | You, all projects           | Loaded regardless of project trust                                   |
| `~/.codex/config.toml` (`[hooks]`)                  | You, all projects           | Same                                                                 |
| `<repo>/.codex/hooks.json`                          | This project                | Only when the project `.codex/` layer is trusted; commit it to share |
| `<repo>/.codex/config.toml` (`[hooks]`)             | This project                | Same                                                                 |
| Plugin `hooks/hooks.json` or manifest `hooks` entry | While the plugin is enabled | See [Plugins](./plugins.md)                                          |
| `[hooks]` in `requirements.toml`                    | Managed, organization-wide  | Cannot be disabled by users                                          |

If one layer has both `hooks.json` and inline `[hooks]`, Codex merges them and warns at startup. Pick one representation per layer.

### hooks.json shape

Three levels: an event, a matcher group, and one or more handlers.

```json
{
  "description": "Optional metadata for this file.",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py\"",
            "timeout": 30,
            "statusMessage": "Checking Bash command"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/stop_gate.py\"",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

The same thing inline in `config.toml`:

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"

[[hooks.Stop]]

[[hooks.Stop.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/stop_gate.py"'
timeout = 120
```

### Handler fields

| Field                                | Applies to | Meaning                                                                                                           |
| ------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `type`                               | both       | `command` or `mcp_tool`                                                                                           |
| `command`                            | command    | Shell command. Runs with the session `cwd` as working directory.                                                  |
| `commandWindows` / `command_windows` | command    | Windows-only override for `command`                                                                               |
| `timeout`                            | both       | Seconds. Default `600`. `SessionEnd` and `Interrupt` default to `1` and allow at most `3`.                        |
| `statusMessage`                      | both       | Text shown in the UI while the hook runs                                                                          |
| `async`                              | command    | `true` runs the hook in the background. `SessionEnd` always runs synchronously.                                   |
| `additionalContextLimit`             | command    | Approximate token threshold before `additionalContext` is spilled to disk. Default `2500`; `0` disables spilling. |
| `server`, `tool`, `input`            | mcp_tool   | Target server, tool name, and templated argument object                                                           |

### Matchers

`matcher` is a regex applied to the event's filter field. Omit it, or use `""` or `"*"`, to match everything. Examples: `Bash`, `^apply_patch$`, `Edit|Write`, `mcp__filesystem__read_file`, `mcp__filesystem__.*`, `startup|resume`, `manual|auto`.

Tool names you can match in `PreToolUse`, `PostToolUse`, and `PermissionRequest`:

| Tool path                  | Match as                                   | Notes                                               |
| -------------------------- | ------------------------------------------ | --------------------------------------------------- |
| Shell commands             | `Bash`                                     | Includes unified exec (`exec_command`)              |
| File edits                 | `apply_patch`, `Edit`, or `Write`          | Hook input still reports `tool_name: "apply_patch"` |
| MCP tools                  | `mcp__<server>__<tool>`                    | For example `mcp__filesystem__read_file`            |
| Other local function tools | Their function name, such as `update_plan` | `spawn_agent` also matches `Agent`                  |

Some specialized tool paths can opt out of the hook path, so treat tool hooks as a guardrail rather than a complete enforcement boundary. The sandbox and [rules](./permissions.md#rules-execpolicy) are the enforcement layer.

## Review and trust hooks

Before a non-managed hook can run, you must review and trust its exact definition. Codex records trust against a hash of the hook, so any edit marks it for review again and skips it until re-trusted. When hooks need review, Codex prints a startup warning telling you to open `/hooks`.

Use `/hooks` to inspect sources, review changed hooks, trust them, or disable individual non-managed hooks. Managed hooks (system, MDM, cloud, `requirements.toml`) are trusted by policy and cannot be disabled from the user hook browser. Plugin-bundled hooks also need trust; enabling a plugin does not trust its hooks.

For automation that has already vetted its hook sources, `codex --dangerously-bypass-hook-trust` runs enabled hooks without persisted trust for that invocation.

## How hooks communicate

### Input

Every command hook receives one JSON object on stdin. Shared fields:

| Field             | Type           | Meaning                                                                            |
| ----------------- | -------------- | ---------------------------------------------------------------------------------- |
| `session_id`      | string         | Session id (subagent hooks report the parent's id)                                 |
| `transcript_path` | string or null | Path to the session transcript (format not stable)                                 |
| `cwd`             | string         | Session working directory                                                          |
| `hook_event_name` | string         | Event name                                                                         |
| `model`           | string         | Active model slug (Codex extension)                                                |
| `turn_id`         | string         | Active turn id on turn-scoped events (Codex extension)                             |
| `permission_mode` | string         | `default`, `acceptEdits`, `plan`, `dontAsk`, or `bypassPermissions` on most events |

Event-specific fields: `tool_name`, `tool_use_id`, and `tool_input` on tool events (`tool_input.command` for Bash and `apply_patch`, the argument object for MCP and other tools); `tool_response` on `PostToolUse`; `prompt` on `UserPromptSubmit`; `source` on `SessionStart`; `trigger` on compaction events; `agent_id` and `agent_type` on subagent events; `stop_hook_active` and `last_assistant_message` on `Stop` and `SubagentStop`.

### Exit codes and output

| Exit code                 | Effect                                                                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`, no output            | Success, Codex continues                                                                                                                                                                                  |
| `0`, plain text on stdout | Added as developer context on `SessionStart`, `SubagentStart`, and `UserPromptSubmit`; ignored on tool and compaction events; **invalid** on `Stop`, `SubagentStop`, and `Interrupt` (those require JSON) |
| `0`, JSON on stdout       | Structured decision or context (see per-event shapes below)                                                                                                                                               |
| `2`, reason on stderr     | Blocks `PreToolUse` and `UserPromptSubmit`; provides feedback on `PostToolUse`; requests continuation on `Stop` and `SubagentStop`                                                                        |
| Other non-zero            | Reported as a hook failure; Codex continues                                                                                                                                                               |

Common JSON output fields on `SessionStart`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `SubagentStop`, and `Stop`:

```json
{
  "continue": true,
  "stopReason": "optional",
  "systemMessage": "optional warning shown in the UI",
  "suppressOutput": false
}
```

`PreToolUse` and `PermissionRequest` accept `systemMessage` only; returning `continue`, `stopReason`, or `suppressOutput` there marks the hook as failed and the tool call proceeds. `suppressOutput` is parsed everywhere but not yet implemented.

### Per-event output shapes

**PreToolUse**, deny:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked by hook."
  }
}
```

**PreToolUse**, allow with rewritten input (`command` string for Bash and `apply_patch`, replacement argument object for MCP and other tools):

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": {"command": "npm test -- --runInBand"}
  }
}
```

**PreToolUse**, add context without blocking: `hookSpecificOutput.additionalContext`. The legacy `{ "decision": "block", "reason": "..." }` shape also works. `permissionDecision: "ask"` is parsed but not supported yet.

**PermissionRequest**, decide instead of prompting:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {"behavior": "allow"}
  }
}
```

Use `{ "behavior": "deny", "message": "Blocked by repository policy." }` to deny. If several hooks decide, any `deny` wins; an `allow` skips the prompt; no decision means the normal prompt appears. Do not return `updatedInput`, `updatedPermissions`, or `interrupt` here; they fail closed today.

**PostToolUse**, replace the result with feedback:

```json
{
  "decision": "block",
  "reason": "The output needs review before continuing.",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "The command updated generated files."
  }
}
```

`block` does not undo anything; Codex replaces the tool result with your reason and continues the model from there. `continue: false` stops normal processing of the original result.

**Stop** and **SubagentStop**, keep going:

```json
{"decision": "block", "reason": "Run one more pass over the failing tests."}
```

For `Stop`, the reason becomes a new continuation prompt as if you had typed it. `continue: false` from any matching `Stop` hook takes precedence over continuation requests from others.

**UserPromptSubmit**, block a prompt: `{ "decision": "block", "reason": "..." }`. Add context with `hookSpecificOutput.additionalContext`.

**SessionStart**, inject context:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Load the workspace conventions before editing."
  }
}
```

### Large hook output

Codex caps each model-visible hook message at roughly 2,500 tokens. Larger `additionalContext` is written to `<temp_dir>/hook_outputs/<session_id>/<uuid>.txt` and the model receives a head-and-tail preview with the file path. Tune per handler with `additionalContextLimit`; `0` passes everything through. Because spilled output lands on disk, never emit secrets from a hook. Keep context short: several hooks and plugins adding context at once can degrade model performance.

### Background hooks

Set `"async": true` on a command hook to let Codex continue without waiting. Output is delivered at the next safe point (after the current model request and tool calls if a turn is active, otherwise at the next user turn). Background hooks **cannot** block, approve, rewrite, or continue anything; use them for logging, metrics, and notifications only. Limits: up to eight concurrent background hooks per session, completion order is not guaranteed, and unfinished hooks are cancelled when the session ends.

## Environment

Hook commands inherit Codex's environment and run with the session `cwd` as their working directory. Codex does not document a project-directory variable for hooks; for repo-local scripts, resolve the path from the git root instead of a relative `.codex/hooks/...` path, because Codex may have been started from a subdirectory:

```bash
"$(git rev-parse --show-toplevel)/.codex/hooks/my_hook.sh"
```

Plugin hooks additionally receive `PLUGIN_ROOT` and `PLUGIN_DATA`, plus `CLAUDE_PLUGIN_ROOT` and `CLAUDE_PLUGIN_DATA` for compatibility with hooks written for Claude Code plugins.

## Practical examples

The scripts below use `jq`; install it or port the logic to Python.

### Block dangerous shell commands

```bash
#!/usr/bin/env bash
# .codex/hooks/block_dangerous.sh
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')

for pattern in 'rm -rf /' 'rm -rf ~' 'git push --force' 'git reset --hard' 'DROP TABLE'; do
  if [[ "$CMD" == *"$pattern"* ]]; then
    echo "Blocked by hook: '$pattern' is not allowed. Ask the user first." >&2
    exit 2
  fi
done
exit 0
```

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$(git rev-parse --show-toplevel)/.codex/hooks/block_dangerous.sh\"",
            "statusMessage": "Checking command safety"
          }
        ]
      }
    ]
  }
}
```

This complements, but does not replace, a `forbidden` [prefix rule](./permissions.md#rules-execpolicy). Rules are evaluated on the parsed argument vector and enforced even where a tool path opts out of hooks; hooks can inspect arbitrary command text and add context.

### Format files after every edit

`apply_patch` reports the whole patch in `tool_input.command`, so the simplest reliable approach is to format whatever changed in the working tree:

```bash
#!/usr/bin/env bash
# .codex/hooks/format_changed.sh
cd "$(git rev-parse --show-toplevel)" || exit 0
FILES=$(git diff --name-only --diff-filter=ACM -- '*.ts' '*.tsx' '*.js' '*.json' '*.md')
[ -n "$FILES" ] && printf '%s\n' "$FILES" | xargs npx prettier --write >/dev/null 2>&1
exit 0
```

```toml
[[hooks.PostToolUse]]
matcher = "Edit|Write"

[[hooks.PostToolUse.hooks]]
type = "command"
command = '"$(git rev-parse --show-toplevel)/.codex/hooks/format_changed.sh"'
timeout = 60
statusMessage = "Formatting changed files"
```

Plain text on stdout is ignored for `PostToolUse`, so the formatter's own output is harmless, but keeping stdout quiet makes failures easier to spot.

### Run tests before Codex stops

`Stop` requires JSON on stdout. Check `stop_hook_active` so a second stop is allowed through instead of looping forever:

```bash
#!/usr/bin/env bash
# .codex/hooks/stop_gate.sh
INPUT=$(cat)
if [ "$(printf '%s' "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi
cd "$(git rev-parse --show-toplevel)" || exit 0
if ! OUTPUT=$(npm test 2>&1); then
  TAIL=$(printf '%s' "$OUTPUT" | tail -n 30)
  jq -n --arg reason "Tests failed. Fix them before finishing:
$TAIL" '{decision: "block", reason: $reason}'
  exit 0
fi
exit 0
```

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$(git rev-parse --show-toplevel)/.codex/hooks/stop_gate.sh\"",
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

The `reason` becomes the next prompt, so write it as an instruction to the model.

### Notify when a turn finishes

`Stop` hooks must not print plain text, so silence the notifier:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Codex finished a turn\" with title \"Codex\"' >/dev/null 2>&1; exit 0",
            "async": true,
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

On Linux replace the command with `notify-send 'Codex' 'Finished a turn' >/dev/null 2>&1; exit 0`. To be notified when Codex is _waiting_ for you, attach the same command to `PermissionRequest` without returning a decision; the normal prompt still appears.

### Auto-approve a known-safe escalation

Let `pnpm run lint` leave the sandbox without a prompt, and leave everything else to the normal approval flow:

```bash
#!/usr/bin/env bash
# .codex/hooks/permission_request.sh
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')
if [[ "$CMD" == "pnpm run lint"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PermissionRequest","decision":{"behavior":"allow"}}}'
fi
exit 0
```

Register it under `PermissionRequest` with `"matcher": "Bash"`. For most command prefixes a `prefix_rule` with `decision = "allow"` is the simpler tool; use a hook when the decision depends on something a prefix cannot express.

### Audit every shell command

```toml
[[hooks.PostToolUse]]
matcher = "^Bash$"

[[hooks.PostToolUse.hooks]]
type = "command"
command = "jq -c '{t: (now | todate), cwd: .cwd, cmd: .tool_input.command}' >> ~/.codex/command-log.jsonl"
async = true
```

### Re-inject context after compaction

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use pnpm, not npm. Run pnpm test before finishing. Current task: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

After compaction Codex runs matching `SessionStart` hooks before the next model request, including mid-turn automatic compaction.

### Block prompts that contain secrets

```bash
#!/usr/bin/env bash
# .codex/hooks/prompt_secret_scan.sh
INPUT=$(cat)
PROMPT=$(printf '%s' "$INPUT" | jq -r '.prompt // empty')
if printf '%s' "$PROMPT" | grep -Eq 'sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}'; then
  echo '{"decision":"block","reason":"The prompt appears to contain an API key. Remove it and try again."}'
  exit 0
fi
exit 0
```

Register under `UserPromptSubmit` (no matcher).

### Call an MCP tool from a hook

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "mcp_tool",
            "server": "scanner",
            "tool": "scan_patch",
            "input": {"patch": "${tool_input.command}"},
            "timeout": 30,
            "statusMessage": "Scanning edited files"
          }
        ]
      }
    ]
  }
}
```

`${field.nested}` placeholders read dotted paths from the event. A placeholder that fills a whole value keeps its JSON type; inside a longer string it is rendered as text. MCP tool hooks use an existing connection (they never start a server), run synchronously, do not request tool approval, and can block only when the tool returns a blocking decision. Errors and missing servers do not block. `SessionEnd` does not support MCP tool hooks. See [MCP](./mcp.md) for server setup.

### Managed hooks for an organization

```toml
# requirements.toml
allow_managed_hooks_only = true

[features]
hooks = true

[hooks]
managed_dir = "/enterprise/hooks"
windows_managed_dir = 'C:\enterprise\hooks'

[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = "python3 /enterprise/hooks/pre_tool_use_policy.py"
command_windows = 'py -3 C:\enterprise\hooks\pre_tool_use_policy.py'
timeout = 30
```

Codex enforces the configuration but does not distribute the scripts; deliver them with MDM. Pinning `features.hooks = true` keeps managed hooks running even for users who disabled hooks locally, and `allow_managed_hooks_only = true` skips user, project, session, and plugin hooks.

## Turning hooks off

```toml
[features]
hooks = false
```

`codex_hooks` is a deprecated alias. Admins can force the value either way in `requirements.toml`.

## Debugging hooks

- **Nothing runs.** Open `/hooks`. Untrusted or changed hooks are listed for review and skipped until trusted. Project hooks also do not load in untrusted projects, and `features.hooks = false` disables everything non-managed.
- **Test the script by hand.** Pipe a sample event into it and check the exit code and stdout:

  ```bash
  echo '{"hook_event_name":"PreToolUse","tool_name":"Bash","cwd":"'"$PWD"'","tool_input":{"command":"rm -rf /"}}' \
    | .codex/hooks/block_dangerous.sh; echo "exit=$?"
  ```

- **Hook marked failed.** You probably returned a field the event does not support (for example `continue` on `PreToolUse`), printed plain text on `Stop`, or exceeded the timeout. Codex reports the failure and continues.
- **Output disappeared.** Check `<temp_dir>/hook_outputs/<session_id>/` for spilled context, or raise `additionalContextLimit`.
- **Relative paths break.** Codex may start in a subdirectory; anchor paths with `git rev-parse --show-toplevel`.
- **Two copies of a hook.** A layer with both `hooks.json` and `[hooks]` merges them and warns. Keep one.
- **CI runs skip hooks.** Persisted trust does not exist on a fresh runner; use `--dangerously-bypass-hook-trust` only when the pipeline itself vets the hook files.

## Security notes

- Hooks run arbitrary commands with your user's permissions. Review project hooks in unfamiliar repositories before trusting them; that is what the trust flow is for.
- Hooks are a guardrail, not the boundary. Some tool paths can opt out of hooks, and hosted tools never pass through them. Enforce hard limits with the [sandbox and rules](./permissions.md).
- Do not emit secrets from hooks. Oversized output is written to disk, and `additionalContext` reaches the model.
- Background hooks cannot block. Any policy decision must be synchronous.
- Managed hooks cannot be disabled by users, so keep them fast and predictable; a slow `PreToolUse` hook delays every command for everyone.

## Compared with Claude Code

| Topic                      | Codex                                                                               | Claude Code                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Config location            | `hooks.json` or `[hooks]` in `config.toml`, next to `~/.codex/` or `<repo>/.codex/` | `hooks` key in `settings.json` at user, project, or local scope                             |
| Handler types              | `command`, `mcp_tool` (`prompt` and `agent` parsed but skipped)                     | `command`, `http`, `mcp_tool`, `prompt`, `agent`                                            |
| Event list                 | 12 events, including `PermissionRequest` and `Interrupt`                            | 30+ events, including `Notification`, `PostToolUseFailure`, `FileChanged`, `PreModelSwitch` |
| Trust model                | Explicit review and trust per hook hash via `/hooks`                                | Hooks in settings run without a separate trust step                                         |
| Project directory variable | None documented; use `git rev-parse --show-toplevel`                                | `$CLAUDE_PROJECT_DIR`                                                                       |
| Stop behavior              | `decision: "block"` reason becomes a new continuation prompt                        | `decision: "block"` keeps Claude working                                                    |
| Managed hooks              | `[hooks]` in `requirements.toml` with `allow_managed_hooks_only`                    | Managed settings                                                                            |

The wire format is deliberately close to Claude Code's, so most `PreToolUse`, `PostToolUse`, `Stop`, and `SessionStart` scripts port with little change. See [Claude Code Hooks](../claude-code/hooks.md) for the Claude details.
