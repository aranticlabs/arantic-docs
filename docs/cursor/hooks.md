---
sidebar_position: 10
sidebar_label: Hooks
description: Cursor hooks are scripts in hooks.json that run at agent lifecycle events to format, audit, block, or modify what the agent does, independent of model judgment.
keywords:
  [
    Cursor hooks,
    hooks.json,
    beforeShellExecution,
    afterFileEdit,
    beforeSubmitPrompt,
    beforeMCPExecution,
    preToolUse,
    stop hook,
    failClosed,
    deterministic automation,
  ]
---

# Hooks

Hooks are scripts that Cursor runs at defined points in the agent loop. They receive JSON on stdin describing what is about to happen (or just happened) and can respond with JSON on stdout to allow, deny, ask, or modify the action. Unlike [rules](./rules.md) and [skills](./skills.md), which steer the model, hooks are **deterministic**: they run every time the event fires, regardless of what the model decides. Cursor's own security guidance treats hooks as the primary enforcement layer alongside Run Modes and the sandbox.

## Why hooks matter

Some things should never depend on the model remembering to do them:

- **Formatting** after every edit, not only when the agent thinks of it
- **Secret scanning** on prompts before they leave your machine and on files before the model reads them
- **Blocking** raw `git push`, production `kubectl apply`, or database `DROP` statements
- **Audit logging** of every shell command and MCP call
- **Loop control**: keep an agent iterating until a goal is met, with a hard cap
- **Session setup**: inject environment variables or context when a conversation starts

Cursor also supports loading hooks written for Claude Code, so an existing `.claude/settings.json` hook set can run unchanged (see [Third-party hooks](#third-party-hooks) below).

## Hook events

Cursor groups hooks into three categories by what triggers them.

### Agent hooks (Agent chat and Cmd+K)

| Event                  | When it fires                                                      | Can block or modify?                                                |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `sessionStart`         | A new conversation is created                                      | No (fire-and-forget), but can return `env` and `additional_context` |
| `sessionEnd`           | A conversation ends                                                | No                                                                  |
| `preToolUse`           | Before any tool call (Shell, Read, Write, Grep, Delete, Task, MCP) | Yes: `allow` or `deny`, plus `updated_input`                        |
| `postToolUse`          | After a tool call succeeds                                         | Can add `additional_context`; for MCP tools can replace output      |
| `postToolUseFailure`   | A tool fails, times out, or is denied                              | No                                                                  |
| `subagentStart`        | Before a subagent (Task tool) spawns                               | Yes: `allow` or `deny`                                              |
| `subagentStop`         | A subagent completes, errors, or aborts                            | Can return `followup_message`                                       |
| `beforeShellExecution` | Before a terminal command runs                                     | Yes: `allow`, `deny`, or `ask`                                      |
| `afterShellExecution`  | After a terminal command, with its output                          | No                                                                  |
| `beforeMCPExecution`   | Before an MCP tool runs                                            | Yes: `allow`, `deny`, or `ask`                                      |
| `afterMCPExecution`    | After an MCP tool, with its result                                 | No                                                                  |
| `beforeReadFile`       | Before the agent reads a file (content included)                   | Yes: `allow` or `deny`                                              |
| `afterFileEdit`        | After the agent edits a file                                       | No                                                                  |
| `beforeSubmitPrompt`   | After you press send, before the request leaves                    | Yes: `continue: false` blocks                                       |
| `preCompact`           | Before context compaction                                          | No (observational), can show a `user_message`                       |
| `stop`                 | The agent loop ends                                                | Can return `followup_message` to keep iterating                     |
| `afterAgentResponse`   | After an assistant message completes                               | No                                                                  |
| `afterAgentThought`    | After a thinking block completes                                   | No                                                                  |

### Tab hooks (inline completions)

| Event               | When it fires                                       | Can block?             |
| ------------------- | --------------------------------------------------- | ---------------------- |
| `beforeTabFileRead` | Before Tab reads a file                             | Yes: `allow` or `deny` |
| `afterTabFileEdit`  | After Tab edits a file, with line and column ranges | No                     |

Tab hooks let you apply a different policy to autonomous completions than to user-directed agent work.

### App lifecycle hooks

| Event           | When it fires                                                                                                               | Output                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `workspaceOpen` | Cursor opens a workspace, and on every workspace folder change. Skipped with zero folders. Runs in the desktop app and CLI. | `pluginPaths`: extra plugin directories to load for this workspace |

## Configuration

### Where hooks live

| Scope                                    | Location                                                                                                                               | Working directory for relative paths | Priority |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------- |
| **Enterprise** (MDM, system-wide)        | macOS `/Library/Application Support/Cursor/hooks.json`, Linux/WSL `/etc/cursor/hooks.json`, Windows `C:\ProgramData\Cursor\hooks.json` | Enterprise config directory          | Highest  |
| **Team** (Enterprise, cloud-distributed) | Configured in the web dashboard, synced to members every thirty minutes                                                                | Managed hooks directory              | 2        |
| **Project**                              | `<project>/.cursor/hooks.json`, committed with the repo                                                                                | **Project root**                     | 3        |
| **User**                                 | `~/.cursor/hooks.json`                                                                                                                 | `~/.cursor/`                         | Lowest   |

All matching hooks from every source run. When responses conflict, the higher-priority source wins during merge. Project hooks only run in a trusted workspace. Cursor watches `hooks.json` files and reloads on save.

:::tip
The working directory differs by scope, and this is the most common setup mistake. In a **project** hooks file, write `.cursor/hooks/format.sh`. In a **user** hooks file, write `./hooks/format.sh` (relative to `~/.cursor/`). Or use absolute paths.
:::

### Basic structure

```json
{
  "version": 1,
  "hooks": {
    "afterFileEdit": [{"command": ".cursor/hooks/format.sh"}],
    "beforeShellExecution": [
      {
        "command": ".cursor/hooks/approve-network.sh",
        "timeout": 30,
        "matcher": "curl|wget|nc "
      }
    ],
    "stop": [{"command": ".cursor/hooks/check-done.sh", "loop_limit": 10}]
  }
}
```

### Per-hook options

| Option       | Type                      | Default          | Description                                                                                                                           |
| ------------ | ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `command`    | string                    | required         | Shell string, absolute path, or path relative to the scope's working directory                                                        |
| `type`       | `"command"` or `"prompt"` | `"command"`      | Execution type (see below)                                                                                                            |
| `timeout`    | number                    | platform default | Seconds before the hook is killed                                                                                                     |
| `loop_limit` | number or `null`          | `5`              | Max auto follow-ups for `stop` and `subagentStop` per script. `null` removes the cap. Default is `null` for Claude Code-format hooks. |
| `failClosed` | boolean                   | `false`          | When `true`, a crash, timeout, or invalid JSON **blocks** the action instead of allowing it. Recommended for security hooks.          |
| `matcher`    | string                    | none             | Regex filter on the hook-specific match target                                                                                        |

### Matchers

What the matcher is compared against depends on the event:

| Event                                             | Matcher target                                                                      | Example             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------- |
| `preToolUse`, `postToolUse`, `postToolUseFailure` | Tool type: `Shell`, `Read`, `Write`, `Grep`, `Delete`, `Task`, or `MCP:<tool_name>` | `"Shell\|Write"`    |
| `subagentStart`, `subagentStop`                   | Subagent type: `generalPurpose`, `explore`, `shell`, and others                     | `"explore\|shell"`  |
| `beforeShellExecution`, `afterShellExecution`     | Full shell command string                                                           | `"curl\|wget\|nc "` |
| `beforeReadFile`                                  | Tool type: `Read`, `TabRead`, and others                                            | `"Read"`            |
| `afterFileEdit`                                   | Tool type: `Write`, `TabWrite`, and others                                          | `"Write"`           |
| `beforeSubmitPrompt`                              | The literal value `UserPromptSubmit`                                                |                     |
| `stop`                                            | The literal value `Stop`                                                            |                     |
| `afterAgentResponse`                              | The literal value `AgentResponse`                                                   |                     |
| `afterAgentThought`                               | The literal value `AgentThought`                                                    |                     |

Without a matcher, the hook fires on every occurrence of the event.

## Hook types

### Command hooks

The default. Cursor spawns your command, writes the event JSON to stdin, and reads JSON from stdout.

**Exit codes:**

| Exit code | Effect                                                                                |
| --------- | ------------------------------------------------------------------------------------- |
| `0`       | Success. Cursor uses the JSON output.                                                 |
| `2`       | Block the action. Equivalent to `"permission": "deny"`. Matches Claude Code behavior. |
| Other     | Hook failed. The action proceeds (fail-open) unless `failClosed: true`.               |

### Prompt hooks

Prompt hooks ask a fast LLM to evaluate a natural-language condition instead of running a script. They are convenient for policy checks you do not want to code, but they inherit model unpredictability, so do not rely on them for hard security boundaries.

```json
{
  "hooks": {
    "beforeShellExecution": [
      {
        "type": "prompt",
        "prompt": "Does this command look safe to execute? Only allow read-only operations.",
        "timeout": 10
      }
    ]
  }
}
```

- The model returns `{ ok: boolean, reason?: string }`.
- `$ARGUMENTS` in the prompt is replaced with the hook input JSON; if absent, the input is appended.
- An optional `model` field overrides the default model.
- Cloud Agents run command hooks only; prompt hooks are not available there.

## Input and output

### Common input fields

Every hook receives these in addition to its event-specific fields:

```json
{
  "conversation_id": "string",
  "generation_id": "string",
  "model": "string",
  "model_id": "string",
  "model_params": [{"id": "string", "value": "string"}],
  "hook_event_name": "string",
  "cursor_version": "string",
  "workspace_roots": ["<path>"],
  "user_email": "string | null",
  "transcript_path": "string | null"
}
```

`conversation_id` is stable across turns; `generation_id` changes with every user message. `workspace_roots` normally has one entry but can have several in multi-root workspaces. `workspaceOpen` omits the conversation, generation, model, and transcript fields because it runs outside any session.

### Permission decisions

Hooks that gate an action return a `permission` field:

| Value     | Meaning                                                                         | Supported on                                                                                                                   |
| --------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `"allow"` | Proceed                                                                         | All gating hooks                                                                                                               |
| `"deny"`  | Block; `user_message` is shown to you, `agent_message` is fed back to the agent | All gating hooks                                                                                                               |
| `"ask"`   | Show the normal approval prompt                                                 | `beforeShellExecution`, `beforeMCPExecution`. Accepted but not enforced on `preToolUse`; treated as `deny` on `subagentStart`. |

`beforeSubmitPrompt` uses `continue: true | false` instead. `preToolUse` can also return `updated_input` to rewrite the tool call (for example turning `npm install` into `npm ci`).

### Event payloads worth knowing

**`beforeShellExecution`** input has `command`, `cwd`, and `sandbox` (whether it will run sandboxed). Output is `permission`, `user_message`, `agent_message`.

**`beforeMCPExecution`** input has `tool_name`, `tool_input` (a JSON string), `mcp_server_name` (the key from `mcp.json`), plus `url` and `mcp_server_url` for HTTP/SSE servers or `command` for stdio servers. Match on `mcp_server_name`, not `command`, because launch strings vary between installs and HTTP servers have no `command` at all. A hook that allows unknown calls should treat a missing or unexpected `mcp_server_name` as a deny.

**`preToolUse`** input has `tool_name`, `tool_input`, `tool_use_id`, `cwd`, model fields, and `agent_message`. **`postToolUse`** adds `tool_output` (a JSON-stringified result, not raw terminal text) and `duration` in ms, and can return `additional_context` or, for MCP tools, `updated_mcp_tool_output`.

**`beforeReadFile`** input has `file_path`, the full `content`, and `attachments` (`type: "file" | "rule"`). This is where secret redaction belongs.

**`afterFileEdit`** input has `file_path` and `edits` as `[{ old_string, new_string }]`. `afterTabFileEdit` adds `range`, `old_line`, and `new_line` per edit.

**`beforeSubmitPrompt`** input has `prompt` and `attachments`. Output is `continue` and `user_message`.

**`stop`** input has `status` (`completed`, `aborted`, `error`) and `loop_count`. Return a non-empty `followup_message` and Cursor submits it as the next user message. The default cap is 5 follow-ups per script (`loop_limit`).

**`subagentStart`** input includes `subagent_type`, `task`, `subagent_model`, `is_parallel_worker`, and `git_branch`. **`subagentStop`** includes `status`, `summary`, `duration_ms`, `modified_files`, `loop_count`, and `agent_transcript_path`, and can return `followup_message` (only consumed when `status` is `completed`).

**`sessionStart`** input has `session_id`, `is_background_agent`, and `composer_mode` (`agent`, `ask`, `edit`). Output `env` sets variables available to all later hooks in the session; `additional_context` is added to the initial system context. `continue: false` is accepted but does not block session creation.

**`preCompact`** input includes `trigger` (`auto` or `manual`), `context_usage_percent`, `context_tokens`, `context_window_size`, `message_count`, `messages_to_compact`, and `is_first_compaction`.

### Environment variables

| Variable                 | Description                                           | Present                |
| ------------------------ | ----------------------------------------------------- | ---------------------- |
| `CURSOR_PROJECT_DIR`     | Workspace root                                        | Always                 |
| `CURSOR_VERSION`         | Cursor version                                        | Always                 |
| `CURSOR_USER_EMAIL`      | Authenticated user email                              | If logged in           |
| `CURSOR_TRANSCRIPT_PATH` | Conversation transcript path                          | If transcripts enabled |
| `CURSOR_CODE_REMOTE`     | `"true"` in a remote workspace                        | Remote workspaces      |
| `CLAUDE_PROJECT_DIR`     | Alias for the project dir (Claude Code compatibility) | Always                 |

Variables returned from a `sessionStart` hook's `env` are passed to every later hook in that session.

## Practical examples

The examples use project-scope paths (`.cursor/hooks/...`). Make each script executable with `chmod +x`.

### Format after every edit

```json
{
  "version": 1,
  "hooks": {
    "afterFileEdit": [{"command": ".cursor/hooks/format.sh", "matcher": "Write"}]
  }
}
```

```bash
#!/bin/bash
# .cursor/hooks/format.sh
input=$(cat)
file=$(echo "$input" | jq -r '.file_path')
case "$file" in
  *.ts|*.tsx|*.js|*.json|*.md) npx prettier --write "$file" >/dev/null 2>&1 ;;
  *.py) ruff format "$file" >/dev/null 2>&1 ;;
esac
exit 0
```

### Block secrets before the model reads them

```json
{
  "version": 1,
  "hooks": {
    "beforeReadFile": [{"command": ".cursor/hooks/redact-secrets.sh", "failClosed": true}]
  }
}
```

```bash
#!/bin/bash
# .cursor/hooks/redact-secrets.sh
input=$(cat)
content=$(echo "$input" | jq -r '.content')
path=$(echo "$input" | jq -r '.file_path')

if echo "$content" | grep -qE 'gh[ps]_[A-Za-z0-9]{36}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA|OPENSSH) PRIVATE KEY-----'; then
  cat << EOF
{
  "permission": "deny",
  "user_message": "Blocked read of $path: file appears to contain a secret."
}
EOF
  exit 0
fi

echo '{ "permission": "allow" }'
```

`failClosed: true` matters here: if `jq` is missing or the script crashes, the read is blocked instead of silently allowed.

### Gate risky shell commands

Deny raw `git push`, ask before anything touching production, allow the rest:

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [{"command": ".cursor/hooks/guard-shell.sh", "failClosed": true}]
  }
}
```

```bash
#!/bin/bash
# .cursor/hooks/guard-shell.sh
input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

if [[ "$command" =~ git[[:space:]]+push ]]; then
  cat << EOF
{
  "permission": "deny",
  "user_message": "git push is blocked by a hook. Open a PR instead.",
  "agent_message": "Do not push directly. Commit locally and tell the user the branch is ready for a PR."
}
EOF
elif [[ "$command" =~ (prod|production) ]] || [[ "$command" =~ ^sudo ]]; then
  cat << EOF
{
  "permission": "ask",
  "user_message": "This command references production or uses sudo. Review before running."
}
EOF
else
  echo '{ "permission": "allow" }'
fi
```

The `"ask"` decision hands the command to the normal approval prompt even if your Run Mode would otherwise auto-run it.

### Scan prompts before they leave the machine

```json
{
  "version": 1,
  "hooks": {
    "beforeSubmitPrompt": [{"command": ".cursor/hooks/scan-prompt.sh"}]
  }
}
```

```bash
#!/bin/bash
# .cursor/hooks/scan-prompt.sh
input=$(cat)
prompt=$(echo "$input" | jq -r '.prompt')

if echo "$prompt" | grep -qE 'api[_-]?key.*[A-Za-z0-9]{32}'; then
  cat << EOF
{
  "continue": false,
  "user_message": "Prompt contains what looks like an API key. Remove it and try again."
}
EOF
  exit 0
fi

echo '{ "continue": true }'
```

### Audit every shell and MCP call

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [{"command": ".cursor/hooks/audit.sh"}],
    "afterShellExecution": [{"command": ".cursor/hooks/audit.sh"}],
    "beforeMCPExecution": [{"command": ".cursor/hooks/audit.sh"}],
    "afterMCPExecution": [{"command": ".cursor/hooks/audit.sh"}],
    "afterFileEdit": [{"command": ".cursor/hooks/audit.sh"}]
  }
}
```

```bash
#!/bin/bash
# .cursor/hooks/audit.sh
json_input=$(cat)
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
mkdir -p "$HOME/.cursor/logs"
echo "[$timestamp] $json_input" >> "$HOME/.cursor/logs/agent-audit.log"
exit 0
```

Because every payload includes `hook_event_name`, `conversation_id`, and `user_email`, one script can serve all events and you can filter later with `jq`.

### Notify when the agent finishes

```json
{
  "version": 1,
  "hooks": {
    "stop": [{"command": ".cursor/hooks/notify.sh"}]
  }
}
```

```bash
#!/bin/bash
# .cursor/hooks/notify.sh (macOS)
input=$(cat)
status=$(echo "$input" | jq -r '.status')
osascript -e "display notification \"Agent finished with status: $status\" with title \"Cursor\""
echo '{}'
```

On Linux, replace the `osascript` line with `notify-send "Cursor" "Agent finished: $status"`.

### Keep iterating until tests pass

A `stop` hook can push the agent back to work. The `loop_count` field and `loop_limit` option keep it from running forever.

```json
{
  "version": 1,
  "hooks": {
    "stop": [{"command": ".cursor/hooks/until-green.sh", "loop_limit": 3}]
  }
}
```

```bash
#!/bin/bash
# .cursor/hooks/until-green.sh
input=$(cat)
status=$(echo "$input" | jq -r '.status')
[ "$status" = "completed" ] || { echo '{}'; exit 0; }

if ! npm test --silent >/tmp/cursor-test.log 2>&1; then
  tail -n 40 /tmp/cursor-test.log \
    | jq -Rs '{ followup_message: ("Tests are still failing. Fix them. Output:\n" + .) }'
else
  echo '{}'
fi
```

### Inject context at session start

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [{"command": ".cursor/hooks/session-init.sh"}]
  }
}
```

```bash
#!/bin/bash
# .cursor/hooks/session-init.sh
cat > /dev/null
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
cat << EOF
{
  "env": { "NODE_ENV": "development" },
  "additional_context": "Current branch: $branch. Run 'npm test' before declaring work done. Never edit files under db/migrations/."
}
EOF
```

### Rewrite a tool call

`preToolUse` can change the input before the tool runs:

```bash
#!/bin/bash
# .cursor/hooks/prefer-ci.sh
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // empty')
if [ "$cmd" = "npm install" ]; then
  echo '{ "permission": "allow", "updated_input": { "command": "npm ci" } }'
else
  echo '{ "permission": "allow" }'
fi
```

Register it with `"matcher": "Shell"` under `preToolUse`.

### Hooks in other languages

Anything that reads stdin and prints JSON works. The official docs include a Bun/TypeScript `stop` hook that tracks failure counts on disk and posts telemetry, and a Python `beforeShellExecution` hook that parses Kubernetes manifests with PyYAML before `kubectl apply`. Pick TypeScript when you need typed JSON and HTTP calls; pick Python when you need rich parsing libraries.

## Debugging hooks

- **Hooks tab in Customize** lists configured hooks. The **Hooks output channel** shows executions and errors.
- Cursor reloads `hooks.json` on save. If a hook still does not load, restart Cursor.
- Check the working directory: project hooks resolve relative to the project root, user hooks relative to `~/.cursor/`.
- Log to a file from inside the script (`echo "$input" >> /tmp/hooks.log`) while developing. Remove or gate it afterwards.
- Remember `tool_output` in `postToolUse` is a JSON string, not raw terminal text, so parse it with `jq -r '.tool_output | fromjson'`.
- Exit code `2` blocks; any other non-zero exit is fail-open unless `failClosed` is set. If a security hook appears to "not work," check whether it is crashing.

## Cloud Agents

Cloud Agents run **command-based project hooks** from `.cursor/hooks.json` in your repo, and on Enterprise also team and enterprise-managed hooks. User hooks (`~/.cursor/hooks.json`) are not available because the VM has no access to your home directory. Hooks do not run during the read-only exploratory turns some Cloud Agents start with; they begin once the environment is writable.

Supported in the cloud: `beforeShellExecution`, `afterShellExecution`, `beforeReadFile`, `afterFileEdit`, `preToolUse`, `postToolUse`, `postToolUseFailure`, `subagentStart`, `subagentStop`, `beforeSubmitPrompt`, `preCompact`, `afterAgentResponse`, `afterAgentThought`, `stop`.

Not available: `sessionStart`, `sessionEnd`, `beforeMCPExecution`, `afterMCPExecution`, Tab hooks, and `workspaceOpen`. Self-hosted workers do fire `sessionStart` and `sessionEnd` when a session claims and releases the worker. See [Cloud Agents & Automations](./cloud-agents.md).

## Team distribution

| Method                 | How                                                                                                                                     | Plan       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Project hooks**      | Commit `.cursor/hooks.json` and `.cursor/hooks/`. Loads for everyone in a trusted workspace and for Cloud Agents.                       | All        |
| **MDM**                | Push `hooks.json` and scripts to `~/.cursor/` or the system-wide paths above. Your IT team owns deployment; Cursor does not manage MDM. | All        |
| **Cloud distribution** | Configure in the web dashboard. Synced to every member every thirty minutes, with OS targeting for platform-specific hooks.             | Enterprise |

Cursor's hardening guide recommends distributing hooks for enforcement and logging and setting `failClosed` on the critical ones.

## Third-party hooks

Cursor can load Claude Code hooks from `.claude/settings.local.json`, `.claude/settings.json`, and `~/.claude/settings.json` when **Include third-party Plugins, Skills, and other configs** is enabled under Cursor Settings > Rules, Skills, Subagents. Claude event names (`PreToolUse`, `PostToolUse`, `Stop`) are mapped to Cursor equivalents, and both the nested `hookSpecificOutput` response format and Cursor's flat format are accepted. Native Cursor hooks take priority over Claude-format hooks in the merge order. Full details: [Third Party Hooks](https://cursor.com/docs/reference/third-party-hooks).

## Partner integrations

Vendors have shipped hook-based integrations for MCP governance (MintMCP, Oasis Security, Runlayer), code security (Corridor, Semgrep), dependency scanning (Endor Labs), agent safety (Snyk Evo Agent Guard), and secrets management (1Password). If you need DLP or SIEM integration, calling your existing vendor's API from a `beforeSubmitPrompt`, `beforeReadFile`, or `afterFileEdit` hook is the documented pattern.

## Security notes

- Hooks are code that runs with your user's privileges every time the event fires. Review project hooks in repos you clone, exactly as you would a `postinstall` script. Project hooks only run in trusted workspaces for this reason.
- Use `failClosed: true` on any hook that exists to block something. The default is fail-open.
- Prefer `beforeReadFile` and `beforeSubmitPrompt` for secret protection; `.cursorignore` does not cover shell and MCP tools (see [Security & Run Modes](./permissions.md)).
- Match MCP calls on `mcp_server_name`. Launch strings and URLs are not stable identifiers.
- Hooks see file contents, prompts, and command output. If a hook forwards data to an external service, that service now holds your code. Treat hook endpoints as sensitive infrastructure.
- Prompt hooks are convenient but non-deterministic. Use command hooks for anything security-critical.

## What works well

- Start with two hooks: a formatter on `afterFileEdit` and an audit logger on `beforeShellExecution`. Add gating hooks as you find commands you never want auto-run.
- Keep scripts small and put logic in one shared script per concern; one `audit.sh` can serve every event.
- Test scripts by piping sample JSON: `echo '{"command":"git push"}' | .cursor/hooks/guard-shell.sh`.
- Use `agent_message` on deny to tell the agent what to do instead. A bare deny makes it retry variations.

## What to avoid

- `./hooks/x.sh` in a project `hooks.json` (it resolves to `<project>/hooks/x.sh`, which does not exist).
- `stop` hooks without a `loop_limit` that fits the task. The default cap of 5 is a safety net, not a design.
- Returning non-JSON on stdout (for example a stray `echo` for debugging). Cursor treats invalid JSON as a failure.
- Slow hooks on hot paths. `beforeReadFile` fires on every file read; a 2-second scanner makes the agent feel broken. Set a `timeout`.
- Assuming user hooks apply in Cloud Agents. Put shared policy in the project file.

## Compared with Claude Code

| Concern                  | Cursor                                                                         | Claude Code                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Config file              | `hooks.json` (`.cursor/` or `~/.cursor/`), plus enterprise paths and dashboard | `hooks` key inside `settings.json` at user, project, local, or managed scope                                                          |
| Event naming             | camelCase: `beforeShellExecution`, `afterFileEdit`, `stop`                     | PascalCase: `PreToolUse`, `PostToolUse`, `Stop`, plus many more (`SessionStart`, `Notification`, `PreCompact`, `WorktreeCreate`, ...) |
| Hook types               | `command` and `prompt`                                                         | `command`, `http`, `mcp_tool`, `prompt`, `agent`                                                                                      |
| Decision output          | Flat: `permission`, `user_message`, `agent_message`, `updated_input`           | Nested `hookSpecificOutput.permissionDecision`, or exit code 2                                                                        |
| Exit code 2 blocks       | Yes (for compatibility)                                                        | Yes                                                                                                                                   |
| Fail-closed option       | `failClosed: true` per hook                                                    | Not a per-hook flag; blocking depends on exit code                                                                                    |
| Loop control             | `loop_limit` on `stop` and `subagentStop`, `followup_message`                  | `stop_hook_active` field to break loops manually                                                                                      |
| Cross-tool compatibility | Loads Claude Code hooks from `.claude/settings*.json`                          | Does not load Cursor hooks                                                                                                            |
| Tab / inline completions | Dedicated `beforeTabFileRead` and `afterTabFileEdit`                           | Not applicable                                                                                                                        |

See [Claude Code Hooks](../claude-code/hooks.md) for the full Claude Code event list and examples.
