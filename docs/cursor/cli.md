---
sidebar_position: 7
sidebar_label: Cursor CLI
description: Reference for the Cursor CLI (agent) covering install, auth, every flag and subcommand, headless and CI usage, output formats, Shell Mode, ACP, and config.
keywords: [Cursor CLI, agent command, cursor-agent, headless mode, --print, output-format, stream-json, cli-config.json, GitHub Actions, ACP]
---

# Cursor CLI

The Cursor CLI runs the same Agent as the editor in your terminal, as the `agent` command. Use it interactively when you would rather stay in a shell, or in print mode from scripts, cron jobs, and CI. It reads the same `.cursor/rules`, `AGENTS.md`, and `mcp.json` as the IDE, so a project configured for Cursor is already configured for the CLI.

This page is the flag-and-subcommand reference. For slash commands and keyboard shortcuts inside an interactive session, see [Commands & Shortcuts](./commands.md).

## Installation

```bash
# macOS, Linux, WSL
curl https://cursor.com/install -fsS | bash

# Windows (native, PowerShell)
irm 'https://cursor.com/install?win32=true' | iex

# Verify
agent --version
```

The installer puts the binary under `~/.local/bin`. Add it to your `PATH` if it is not already:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc   # or ~/.bashrc
source ~/.zshrc
```

The CLI auto-updates by default. Force an update with `agent update` or `/update` inside a session. The `channel` field in `cli-config.json` selects the release channel.

## Authentication

| Method | How | Use for |
|--------|-----|---------|
| Browser login | `agent login` opens a browser and stores credentials locally | Your own machine |
| API key (env) | `export CURSOR_API_KEY=...` | Scripts, CI |
| API key (flag) | `agent --api-key <key> "..."` | One-off runs |
| Auth token | `--auth-token` or `CURSOR_AUTH_TOKEN` | ACP clients and advanced integrations |

Generate a user API key in the [Cursor dashboard under API Keys](https://cursor.com/dashboard/api). `agent status` (alias `agent whoami`) shows whether you are signed in, which account, and the endpoint; `agent logout` clears stored credentials. If the browser cannot open (SSH sessions, containers), run `NO_OPEN_BROWSER=1 agent login` and open the printed URL yourself.

## Interactive usage

```bash
agent                                   # start a session
agent "refactor the auth module to use JWT tokens"   # start with a prompt
agent --plan "add rate limiting to the public API"   # start in Plan mode
agent --mode=ask "how does the retry logic work?"    # read-only Ask mode
```

Inside a session:

- `Shift+Tab` rotates between Agent, Plan, and Ask. `/plan`, `/ask`, and `/debug` switch directly.
- Before running a terminal command the CLI asks you to approve (`y`) or reject (`n`). Press `Tab` on the prompt to add the command to your allowlist.
- Pressing `Enter` while the agent works steers the run at a safe boundary; pressing `Enter` again interrupts.
- `Ctrl+R` opens the change review. `i` adds follow-up instructions; arrows scroll and switch files.
- `@` attaches files and folders, `/summarize` frees context, `&` at the start of a message hands the task to a Cloud Agent.
- Pick a skill from the `/` menu and press `Option+Enter` to keep it active as a Custom Mode for the rest of the session.

The CLI supports the same rules, MCP servers (`.cursor/mcp.json`, `~/.cursor/mcp.json`), hooks, skills, and subagents as the editor.

## Subcommands

| Command | Purpose |
|---------|---------|
| `agent [prompt...]` | Start interactive Agent mode (default) |
| `agent login` / `logout` | Sign in or out |
| `agent status` (`whoami`) | Authentication status; `--format json` available |
| `agent about` | Version, system, and account info; `--format json` available |
| `agent models` | List models available to this account |
| `agent ls` | Open previous chats and resume one |
| `agent resume` | Resume the most recent chat |
| `agent create-chat` | Create an empty chat and print its ID (for scripting) |
| `agent generate-rule` (`rule`) | Generate a Cursor rule through interactive prompts |
| `agent mcp <subcommand>` | Manage MCP servers (below) |
| `agent sandbox <subcommand>` | Configure the sandbox or run one command inside it |
| `agent worker <subcommand>` | Start a private cloud worker in your own environment |
| `agent acp` | Start an ACP server over stdio (hidden from default help) |
| `agent install-shell-integration` / `uninstall-shell-integration` | Add or remove shell integration in `~/.zshrc` |
| `agent update` | Update the CLI |
| `agent help [command]` | Help for any command |

### MCP subcommands

| Subcommand | Purpose |
|------------|---------|
| `agent mcp list` | List configured servers and their status |
| `agent mcp list-tools <identifier>` | List a server's tools and argument names |
| `agent mcp login <identifier>` | Authenticate with a server from `.cursor/mcp.json` or `~/.cursor/mcp.json` |
| `agent mcp enable <identifier>` | Add a server to the local approved list |
| `agent mcp disable <identifier>` | Stop a server from loading or prompting |

### Sandbox subcommands

| Subcommand | Purpose |
|------------|---------|
| `agent sandbox enable` / `disable` | Turn sandboxed command execution on or off (off means allowlist mode) |
| `agent sandbox reset` | Restore sandbox defaults |
| `agent sandbox run <cmd> [args...]` | Run one command in a sandbox with workspace read/write. Options: `--allow-paths`, `--readonly-paths`, `--blocked-patterns`, `--network` (default `false`), `--sb-debug` |

See [Security & Run Modes](./permissions.md) for how the sandbox and approval modes relate.

## Global flags

All flags work with any command unless noted.

### Session

| Flag | Purpose |
|------|---------|
| `--resume [chatId]` | Resume a chat by ID; without an ID opens the picker |
| `--continue` | Continue the previous session (alias for `--resume=-1`) |
| `--workspace <path>` | Repository root to use instead of the current directory |
| `-w, --worktree [name]` | Run in a new Git worktree under `~/.cursor/worktrees/<reponame>/<name>`; a name is generated if omitted |
| `--worktree-base <branch>` | Branch or ref to base the worktree on (default: current `HEAD`) |
| `--skip-worktree-setup` | Skip setup scripts from `.cursor/worktrees.json` |

```bash
# Isolated worktree with a generated name
agent --worktree "upgrade the test runner and fix any broken snapshots"

# Named worktree in another repository
agent --workspace ~/src/my-app --worktree auth-fix "fix the flaky auth test and open a PR"
```

Worktrees created by the CLI follow the same retention and cleanup rules as editor worktrees. See [Parallel Agents & Worktrees](./parallel-agents.md).

### Model and mode

| Flag | Purpose |
|------|---------|
| `--model <model>` | Model to use (for example `--model gpt-5`); `agent models` lists valid IDs |
| `--list-models` | Print available models and exit |
| `--mode <mode>` | `plan` or `ask`; Agent mode is the default when omitted |
| `--plan` | Shorthand for `--mode=plan` |

### Permissions and trust

| Flag | Purpose |
|------|---------|
| `-f, --force` | Allow commands unless explicitly denied; required for the agent to write files in print mode |
| `--yolo` | Alias for `--force` |
| `--sandbox <mode>` | `enabled` or `disabled` |
| `--approve-mcps` | Auto-approve all configured MCP servers |
| `--trust` | Trust the workspace without prompting (headless only) |

:::warning
`--force` removes the approval step for shell commands and file writes. Pair it with a `permissions.deny` list (below) and, in CI, with a workspace that contains no credentials you would not want an agent to read. Deny rules still apply under `--force`.
:::

### Headless and output

| Flag | Purpose |
|------|---------|
| `-p, --print` | Print mode: run non-interactively and print the response. Has access to all tools, including write and shell. Inferred automatically when stdout is not a TTY or stdin is piped |
| `--output-format <format>` | `text` (default), `json`, or `stream-json`. Only valid with `--print` |
| `--stream-partial-output` | Emit character-level text deltas; only with `--print --output-format stream-json` |

### Authentication, network, plugins

| Flag | Purpose |
|------|---------|
| `--api-key <key>` | API key (or `CURSOR_API_KEY`) |
| `-H, --header <header>` | Add a custom header to agent requests (`Name: Value`, repeatable) |
| `--plugin-dir <path>` | Load a local plugin directory (repeatable) |
| `-v, --version` | Print version |
| `-h, --help` | Help |

The ACP docs additionally show `-e <endpoint>` (API endpoint) and `-k` (a TLS option) on the root command, for example `agent -e https://api2.cursor.sh acp`. They are not in the main parameters table, so check `agent --help` before relying on them.

## Headless mode

Print mode is how you script the agent. Without `--force`, changes are only proposed and files are left untouched, which makes a dry run safe:

```bash
export CURSOR_API_KEY=...

# Ask a question, get only the final answer
agent -p "What does this codebase do?"

# Propose changes without applying them
agent -p "Add JSDoc comments to src/index.ts"

# Apply changes
agent -p --force "Add JSDoc comments to src/index.ts"

# Batch
find src -name '*.js' | while read -r file; do
  agent -p --force "Add comprehensive JSDoc comments to $file"
done
```

Reference files, including images, by path in the prompt; the agent reads them with its tools:

```bash
agent -p "Compare these screenshots and list visual differences: ./before.png ./after.png"
```

`thinking` events are never emitted in print mode, in any output format.

### Output formats

**`text`** (default): only the final assistant message, no tool summaries. Best when you want one answer.

**`json`**: one JSON object on success, nothing well-formed on failure (non-zero exit, error on stderr).

```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 1234,
  "duration_api_ms": 1234,
  "result": "<full assistant text>",
  "session_id": "<uuid>",
  "request_id": "<optional request id>"
}
```

```bash
agent -p --output-format json "Summarize the open TODOs in this repo" | jq -r '.result'
```

**`stream-json`**: newline-delimited JSON, one event per line, ending in a `result` event on success. Event types:

| `type` | When | Key fields |
|--------|------|------------|
| `system` / `init` | Once at start | `cwd`, `model`, `session_id`, `apiKeySource` (`env`, `flag`, `login`), `permissionMode` |
| `user` | Your prompt | `message.content[].text` |
| `assistant` | Once per complete assistant message between tool calls | `message.content[].text` |
| `tool_call` / `started` | A tool begins | `call_id`, `tool_call.readToolCall.args`, `tool_call.writeToolCall.args`, or `tool_call.function` for other tools |
| `tool_call` / `completed` | A tool finishes | Same `call_id`, plus `result.success` (for reads: `content`, `totalLines`; for writes: `path`, `linesCreated`, `fileSize`) |
| `result` / `success` | End | `result`, `duration_ms`, `session_id`, `request_id` |

With `--stream-partial-output`, `assistant` events become deltas. Three kinds arrive and only one carries new text:

| `timestamp_ms` | `model_call_id` | Meaning | Do |
|----------------|-----------------|---------|----|
| present | absent | Streaming delta with new text | Append `message.content[].text` |
| present | present | Buffered flush before a tool call (duplicate) | Skip |
| absent | absent | Final flush at end of turn (duplicate) | Skip |

```bash
agent -p --force --output-format stream-json --stream-partial-output \
  "Analyze this project and write a summary to analysis.md" |
while IFS= read -r line; do
  type=$(jq -r '.type // empty' <<<"$line")
  case "$type" in
    tool_call)
      path=$(jq -r '.tool_call.writeToolCall.args.path // .tool_call.readToolCall.args.path // empty' <<<"$line")
      [ -n "$path" ] && echo "$(jq -r .subtype <<<"$line") $path" ;;
    result)
      echo "done in $(jq -r .duration_ms <<<"$line") ms" ;;
  esac
done
```

Consumers should ignore unknown fields; Cursor adds fields over time in a backward-compatible way. Use `call_id` to correlate start and completion events.

## CI and GitHub Actions

```yaml
- name: Install Cursor CLI
  run: |
    curl https://cursor.com/install -fsS | bash
    echo "$HOME/.cursor/bin" >> $GITHUB_PATH

- name: Run Cursor Agent
  env:
    CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
  run: |
    agent -p "Your prompt here" --model gpt-5
```

Store the key with `gh secret set CURSOR_API_KEY --repo OWNER/REPO --body "$CURSOR_API_KEY"` (or `--org ORG --visibility all` for every repo). Windows runners use the PowerShell installer. Any CI system works as long as it can run a shell, set environment variables, and reach Cursor's API.

Cursor documents two autonomy levels and recommends the second for production:

**Full autonomy.** The agent creates branches, commits, pushes, and comments on PRs itself. Simple, but you are trusting the model with every side effect.

**Restricted autonomy.** The agent only edits files; deterministic steps handle git and GitHub:

```yaml
- name: Generate docs updates (restricted)
  env:
    CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
  run: |
    agent -p --force "IMPORTANT: Do NOT create branches, commit, push, or post PR comments.
    Only modify files in the working directory. A later workflow step handles publishing."

- name: Publish docs branch (deterministic)
  run: |
    git checkout -B "docs/${{ github.head_ref }}"
    git add -A
    git commit -m "docs: update for PR"
    git push origin "docs/${{ github.head_ref }}"

- name: Post PR comment (deterministic)
  run: gh pr comment ${{ github.event.pull_request.number }} --body "Docs updated"
```

Enforce the restriction at the CLI level rather than relying on the prompt, with a project-level `.cursor/cli.json`:

```json
{
  "permissions": {
    "allow": ["Read(**/*.md)", "Write(docs/**/*)", "Shell(grep)", "Shell(find)"],
    "deny": ["Shell(git)", "Shell(gh)", "Write(.env*)", "Write(package.json)"]
  }
}
```

## Shell Mode

`/shell <command>` (aliases `/sh`, `/run`) runs a command from inside the conversation and shows the output there. Commands run in your login shell (`$SHELL`, zsh or bash) with the CLI's working directory and environment.

- Each command runs independently: `cd` does not persist, so use `cd subdir && npm test`.
- Commands time out after 30 seconds (not configurable). Servers, watchers, and interactive prompts are not supported.
- Large output is truncated; `Ctrl+O` expands it.
- Commands are checked against your permissions and team policy first. Approve once, or press `Tab` to add to the allowlist. Commands with redirection cannot be allowlisted inline.
- Leave Shell Mode with `Escape` on an empty input, `Backspace` on empty input, or `Ctrl+C`.

Good for status checks, quick builds, and inspecting the environment while the agent's own context stays focused on the task.

## ACP: using Cursor's agent from other editors

`agent acp` starts Cursor CLI as an **Agent Client Protocol** server: JSON-RPC 2.0 over stdio, one newline-delimited message per line. The client writes to stdin, Cursor writes responses and notifications to stdout, logs go to stderr. It is hidden from default help because it is meant for integrations, not everyday use.

Typical flow: `initialize` > `authenticate` (`methodId: "cursor_login"`) > `session/new` or `session/load` > `session/prompt` > handle `session/update` while output streams > answer `session/request_permission` with `allow-once`, `allow-always`, or `reject-once` > optionally `session/cancel`. If the client never answers permission requests, tool execution blocks.

Sessions support the same `agent`, `plan`, and `ask` modes. MCP servers from project- or user-level `.cursor/mcp.json` work; team-level MCP servers from the dashboard do not in ACP mode. Pre-authenticate with `agent login`, `--api-key`, or `--auth-token`.

Cursor adds extension methods for richer clients:

| Method | Type | Purpose |
|--------|------|---------|
| `cursor/ask_question` | Blocking | Multiple-choice questions the user must answer |
| `cursor/create_plan` | Blocking | Plan approval before building |
| `cursor/update_todos` | Notification | Todo list updates |
| `cursor/task` | Notification | Subagent task completion |
| `cursor/generate_image` | Notification | Generated image output |

Documented integrations: JetBrains IDEs (see Cursor's [JetBrains guide](https://cursor.com/docs/integrations/jetbrains)), Neovim through [avante.nvim](https://github.com/yetone/avante.nvim), Zed by spawning `agent acp`, and any editor that can spawn a process and speak JSON-RPC over stdio. The [ACP page](https://cursor.com/docs/cli/acp) includes a minimal Node.js client.

## Configuration file

| Scope | Path | What can be set |
|-------|------|-----------------|
| Global | `~/.cursor/cli-config.json` (`$env:USERPROFILE\.cursor\cli-config.json` on Windows) | Everything |
| Project | `<project>/.cursor/cli.json` | Permissions only |

Override the location with `CURSOR_CONFIG_DIR`, or `XDG_CONFIG_HOME` on Linux/BSD (`$XDG_CONFIG_HOME/cursor/cli-config.json`). The file is plain JSON without comments; the CLI self-repairs missing fields and backs up a corrupted file as `.bad` before recreating it.

### Schema

Required:

| Field | Type | Meaning |
|-------|------|---------|
| `version` | number | Schema version, currently `1` |
| `editor.vimMode` | boolean | Vim keybindings in the input (default `false`) |
| `permissions.allow` | string[] | Permitted operations |
| `permissions.deny` | string[] | Forbidden operations; deny wins over allow |

Optional:

| Field | Type | Meaning |
|-------|------|---------|
| `approvalMode` | string | `allowlist`, `auto-review`, or `unrestricted` (see [Security & Run Modes](./permissions.md)) |
| `sandbox.mode`, `sandbox.networkAccess` | string | Sandbox override and network setting |
| `model` | object | Selected model |
| `maxMode` | boolean | Persisted Max Mode preference (legacy plans) |
| `channel` | string | Release channel for updates |
| `notifications` | boolean | Terminal notification when the agent finishes or needs input |
| `hints` | boolean | Show hints while the agent works |
| `rewind` | boolean | Enable `/rewind` |
| `suggestNextPrompt` | boolean | Suggest a follow-up prompt after each turn |
| `display.showLineNumbers` | boolean | Line numbers in code blocks |
| `display.showThinkingBlocks` | boolean | Render thinking blocks when available |
| `display.showStatusIndicators` | boolean | Terminal title status indicators |
| `display.showStatusLineRunningTime` | boolean | Elapsed time in the status line |
| `network.useHttp1ForAgent` | boolean | HTTP/1.1 with SSE instead of HTTP/2, for proxies such as Zscaler |
| `attribution.attributeCommitsToAgent` | boolean | Add a "Made with Cursor" trailer to agent commits (default `true`) |
| `attribution.attributePRsToAgent` | boolean | Add a "Made with Cursor" footer to agent PRs (default `true`) |
| `hasChangedDefaultModel` | boolean | CLI-managed; do not edit |

`/config` edits settings interactively, and the built-in `/update-cli-config` skill can make changes for you.

### Permission tokens

| Token | Controls | Examples |
|-------|----------|----------|
| `Shell(commandBase)` | Shell commands by first token; `command:args` and globs supported | `Shell(git)`, `Shell(curl:*)`, deny `Shell(rm)` |
| `Read(pathOrGlob)` | File reads | `Read(src/**/*.ts)`, deny `Read(.env*)` |
| `Write(pathOrGlob)` | File writes | `Write(src/**)`, deny `Write(**/*.key)` |
| `WebFetch(domainOrPattern)` | Web fetch tool by domain; unlisted domains prompt | `WebFetch(docs.github.com)`, `WebFetch(*.example.com)` |
| `Mcp(server:tool)` | MCP tools by server (from `mcp.json`) and tool name | `Mcp(datadog:*)`, `Mcp(*:search)` |

Relative paths are scoped to the workspace; absolute paths can target files outside it. Deny rules take precedence over allow.

```json
{
  "version": 1,
  "editor": { "vimMode": false },
  "approvalMode": "allowlist",
  "permissions": {
    "allow": ["Shell(git)", "Shell(npm)", "Read(src/**)", "Write(src/**)", "WebFetch(docs.github.com)"],
    "deny": ["Shell(rm)", "Read(.env*)", "Write(**/.env*)", "Write(**/*.key)"]
  },
  "display": { "showThinkingBlocks": true }
}
```

### Proxies

```bash
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
export NODE_USE_ENV_PROXY=1
export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca-cert.pem   # if the proxy inspects TLS
```

If the proxy does not support HTTP/2 bidirectional streaming, set `network.useHttp1ForAgent` to `true`.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `CURSOR_API_KEY` | API key for non-interactive auth |
| `CURSOR_AUTH_TOKEN` | Auth token alternative, used by ACP clients |
| `CURSOR_CONFIG_DIR` | Custom configuration directory |
| `XDG_CONFIG_HOME` | Linux/BSD config root (`cursor/cli-config.json` inside it) |
| `NO_OPEN_BROWSER` | Set to `1` to print the login URL instead of opening a browser |
| `COLORFGBG` | Force the CLI theme (`15;0` dark, `0;15` light) |
| `HTTP_PROXY`, `HTTPS_PROXY`, `NODE_USE_ENV_PROXY`, `NODE_EXTRA_CA_CERTS` | Proxy configuration |
| `CURSOR_WORKER_LABELS_FILE` | Labels file for `agent worker` |

## SDK

When a shell pipeline is not enough, the Cursor SDK calls the same agent from code. `@cursor/sdk` (TypeScript, Node.js 22.13+) and `cursor-sdk` (Python) share one interface over two runtimes: **local** (agent loop and file access in your process, inference still hosted) and **cloud** (an isolated VM with your repo cloned in). The runtime is chosen by passing `local` or `cloud` to `Agent.create()`, with the same `CURSOR_API_KEY` for both.

```typescript
import { Agent } from "@cursor/sdk";

const agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: "composer-2.5" },
  local: { cwd: process.cwd() },
});

const run = await agent.send("Summarize what this repository does");
for await (const event of run.stream()) {
  console.log(event);
}
```

```bash
npm install @cursor/sdk      # TypeScript
pip install cursor-sdk       # Python
```

The default local agent approves tool calls automatically; gate them with SDK hooks (`beforeShellExecution`, `preToolUse`) or `local.sandboxOptions.enabled: true`. Run the `/sdk` skill inside Cursor for guided setup. For the REST API behind cloud runs, and for Automations, see [Cloud Agents & Automations](./cloud-agents.md).

## Compared with Claude Code

| Topic | Cursor CLI (`agent`) | Claude Code (`claude`) |
|-------|----------------------|------------------------|
| Headless run | `agent -p "..."` (`--force` to write files) | `claude -p "..."` |
| Structured output | `--output-format text\|json\|stream-json`, `--stream-partial-output` | `--output-format text\|json\|stream-json`, `--json-schema` |
| Resume | `--resume [id]`, `--continue`, `agent ls`, `agent resume` | `--resume [id]`, `--continue`, `-n <name>` |
| Permissions | `permissions.allow` / `deny` tokens in `cli-config.json` or `.cursor/cli.json`; `--force`, `--sandbox` | `--permission-mode`, `--allowedTools`, `--disallowedTools`, `--dangerously-skip-permissions` |
| Modes | `--mode plan\|ask`, `--plan` | `--permission-mode plan` |
| Worktrees | `-w, --worktree [name]`, `--worktree-base` | `--worktree [name]`, `--tmux` |
| Other editors | ACP server (`agent acp`) | IDE integrations (`/ide`) |
| Programmatic | `@cursor/sdk`, `cursor-sdk` | Agent SDK |

See [Claude Code CLI Flags](../claude-code/flags.md) for the Claude Code side.
