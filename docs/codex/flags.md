---
sidebar_position: 7
sidebar_label: CLI Flags & Configuration
description: Reference for Codex CLI global flags, subcommands, config.toml locations and precedence, profiles, model providers, and environment variables.
keywords:
  [
    Codex CLI flags,
    codex exec,
    codex resume,
    config.toml,
    Codex profiles,
    model_provider,
    CODEX_HOME,
    --sandbox,
    Codex environment variables,
    Codex configuration,
  ]
---

# CLI Flags & Configuration

The `codex` command takes a small set of global flags that also propagate to most subcommands, and everything else lives in `config.toml`. This page groups the documented flags by purpose, lists the subcommands, explains where configuration files live and how they layer, and ends with the environment variables Codex reads. Most defaults come from `~/.codex/config.toml`; `-c key=value` overrides win for a single invocation.

For the interactive session commands, see [Slash Commands & Shortcuts](./commands.md). For headless and CI usage of `codex exec`, see [Automation & Non-interactive Mode](./automation.md).

## Global flags

These apply to the base `codex` command and, unless noted, to `codex exec`, `codex resume`, `codex fork`, and `codex review`.

### Session and working directory

| Flag                                | Purpose                                                                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROMPT`                            | Optional first instruction (`codex "Explain this repo"`). Omit to open the TUI empty.                                                                |
| `--cd <path>` / `-C`                | Set the working directory before Codex starts. Also decides which `AGENTS.md` chain and `.codex/` layers load.                                       |
| `--add-dir <path>`                  | Grant an additional directory write access alongside the workspace. Repeatable. Prefer this over `--sandbox danger-full-access`.                     |
| `--no-alt-screen`                   | Disable the TUI alternate screen for this run to keep terminal scrollback (overrides `tui.alternate_screen`).                                        |
| `--remote <url>`                    | Connect the TUI to an app server over `ws://`, `wss://`, or `unix://`. Supported by `codex`, `resume`, `fork`, `archive`, `delete`, and `unarchive`. |
| `--remote-auth-token-env <ENV_VAR>` | Read a bearer token from this variable when connecting with `--remote`. Tokens are only sent over `wss://` or local `ws://`.                         |

### Model and search

| Flag                                | Purpose                                                                                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--model <name>` / `-m`             | Override the configured model for this run (for example `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.6-sol`).                                     |
| `--oss`                             | Use a local open source provider (LM Studio or Ollama). The TUI prompts for the provider if none is configured; `codex exec` errors instead. |
| `--local-provider lmstudio\|ollama` | Choose the local provider for `--oss` on this run, overriding `oss_provider`.                                                                |
| `--search`                          | Enable live web search (`web_search = "live"`) instead of the default cached index.                                                          |
| `--image <path[,path...]>` / `-i`   | Attach one or more images to the first prompt. Repeat the flag or separate paths with commas.                                                |

Reasoning effort has no dedicated flag; use `-c model_reasoning_effort=high` or a profile. See [Managing Context](./context.md).

### Approvals and sandbox

| Flag                                                    | Purpose                                                                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `--ask-for-approval <policy>` / `-a`                    | `on-request` (Codex asks when it needs to leave the sandbox) or `never` (no prompts; for non-interactive runs).    |
| `--sandbox <mode>` / `-s`                               | `read-only`, `workspace-write`, or `danger-full-access` for model-generated shell commands.                        |
| `--dangerously-bypass-approvals-and-sandbox` / `--yolo` | No sandbox, no approvals. Only inside an externally hardened environment such as a disposable container.           |
| `--dangerously-bypass-hook-trust`                       | Run enabled hooks without persisted hook trust for this invocation. For automation that already vets hook sources. |

The recommended low-friction local setup is `codex --sandbox workspace-write --ask-for-approval on-request`, which is also the **Auto** preset. `--full-auto` still works on `codex exec` but is deprecated and prints a warning; use `--sandbox workspace-write` instead. Full details are on the [Permissions & Sandbox](./permissions.md) page.

:::warning
`--yolo` removes the enforceable boundary that approvals and [Auto-review](./auto-review.md) depend on. Managed organizations can disallow it through `requirements.toml`. On a development machine, reach for `--add-dir` or `sandbox_workspace_write.network_access = true` before considering it.
:::

### Configuration overrides

| Flag                                         | Purpose                                                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--config <key=value>` / `-c`                | Override any `config.toml` key for this run. Repeatable. Values are parsed as TOML, falling back to a literal string. |
| `--profile <name>` / `-p`                    | Layer `~/.codex/<name>.config.toml` on top of the base user config.                                                   |
| `--enable <feature>` / `--disable <feature>` | Force a feature flag on or off (equivalent to `-c features.<name>=true` or `=false`). Repeatable.                     |
| `--strict-config`                            | Fail when `config.toml` contains keys this Codex version does not recognize. Useful in CI to catch typos.             |

```bash
# Dedicated flag beats generic override when one exists
codex --model gpt-5.6-terra

# Generic override: the value is TOML, so strings need quotes
codex --config model='"gpt-5.6-terra"'
codex -c sandbox_workspace_write.network_access=true
codex -c 'shell_environment_policy.include_only=["PATH","HOME"]'
codex -c mcp_servers.context7.enabled=false
```

## Subcommands

| Command                                           | Maturity     | Purpose                                                                                                |
| ------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `codex`                                           | Stable       | Launch the interactive TUI                                                                             |
| `codex exec` (`codex e`)                          | Stable       | Run non-interactively; stream text or JSONL; `codex exec resume` continues a run                       |
| `codex resume`                                    | Stable       | Resume a saved interactive session                                                                     |
| `codex fork`                                      | Stable       | Fork a saved session into a new chat                                                                   |
| `codex archive` / `codex unarchive`               | Stable       | Hide or restore a saved session without deleting it                                                    |
| `codex delete`                                    | Stable       | Permanently delete a saved session                                                                     |
| `codex review`                                    | Stable       | Non-interactive code review of uncommitted changes, a base branch diff, or a commit                    |
| `codex login` / `codex logout`                    | Stable       | Authenticate (ChatGPT OAuth, device code, API key, or access token) or clear credentials               |
| `codex mcp`                                       | Stable       | List, add, get, remove, and OAuth-authenticate MCP servers in `config.toml`                            |
| `codex plugin` / `codex plugin marketplace`       | Stable       | Install and manage plugins and marketplace sources                                                     |
| `codex features`                                  | Stable       | List feature flags or persistently enable/disable one (does not accept `--profile`)                    |
| `codex completion`                                | Stable       | Generate shell completions (`bash`, `zsh`, `fish`, `power-shell`, `elvish`)                            |
| `codex doctor`                                    | Stable       | Diagnostic report on installation, config, auth, runtime, Git, terminal, app-server, and thread health |
| `codex sandbox`                                   | Stable       | Run any command under the same macOS Seatbelt, Linux Landlock, or Windows sandbox Codex uses           |
| `codex update`                                    | Stable       | Self-update when the installed release supports it                                                     |
| `codex app`                                       | Stable       | Open the ChatGPT desktop app on macOS or Windows, optionally on a workspace path                       |
| `codex apply` (`codex a`)                         | Stable       | Apply the latest diff from a Codex cloud chat to the local tree                                        |
| `codex cloud` (`codex cloud-tasks`)               | Experimental | Browse, submit (`cloud exec`), or list (`cloud list`) cloud chats                                      |
| `codex execpolicy`                                | Experimental | Check execpolicy `.rules` files against a command                                                      |
| `codex remote-control`                            | Experimental | Start, stop, or pair the local app-server daemon for remote control                                    |
| `codex app-server`                                | Experimental | Run the app server over stdio, WebSocket, or Unix socket for custom clients                            |
| `codex debug models` / `codex debug prompt-input` | Experimental | Dump the model catalog, or the exact model-visible prompt input as JSON                                |

`codex mcp-server` and the standalone `codex-mcp-server` binary have been removed; use the app server instead.

### codex exec

Headless runs for scripts and CI. The [Automation](./automation.md) page covers patterns in depth; the flags are:

| Flag                                  | Purpose                                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PROMPT` or `-`                       | The task. Pass `-` to read the prompt from stdin.                                                                                                            |
| `--json`                              | Emit newline-delimited JSON events instead of formatted text.                                                                                                |
| `--output-last-message <path>` / `-o` | Write the final assistant message to a file. Pair with `--json` in CI.                                                                                       |
| `--output-schema <path>`              | JSON Schema the final response must match.                                                                                                                   |
| `--ephemeral`                         | Do not persist session files to disk.                                                                                                                        |
| `--skip-git-repo-check`               | Allow running outside a Git repository.                                                                                                                      |
| `--ignore-user-config`                | Skip `$CODEX_HOME/config.toml` (auth still uses `CODEX_HOME`).                                                                                               |
| `--ignore-rules`                      | Skip user and project execpolicy `.rules` files.                                                                                                             |
| `--color always\|never\|auto`         | Control ANSI color on stdout.                                                                                                                                |
| `--full-auto`                         | Deprecated alias for `--sandbox workspace-write`; prints a warning.                                                                                          |
| `resume [SESSION_ID] [PROMPT]`        | Continue a previous exec session; `--last` picks the most recent in this directory, `--all` searches every directory, `-i` attaches images to the follow-up. |

`--cd`, `--model`, `--oss`, `--local-provider`, `--image`, `--profile`, `--sandbox`, `--yolo`, `--dangerously-bypass-hook-trust`, and `-c` work as they do on `codex`.

```bash
codex exec --sandbox workspace-write -m gpt-5.6-terra \
  --json -o /tmp/summary.md "Run the test suite and fix any failures"
```

### codex resume and codex fork

| Flag                        | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `SESSION_ID`                | UUID or session name to resume or fork                                  |
| `--last`                    | Skip the picker and use the most recent chat from this directory        |
| `--all`                     | Include sessions from other directories                                 |
| `--include-non-interactive` | `resume` only: include `codex exec` sessions in the picker and `--last` |

Both accept the global flags, so `codex resume --last -m gpt-5.6-sol` reopens the last chat on a different model. If the saved directory differs from the current one, Codex asks which to use unless `tui.resume_cwd` is set.

### codex review

| Flag              | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| `--uncommitted`   | Review staged, unstaged, and untracked changes           |
| `--base <branch>` | Review against a base branch                             |
| `--commit <SHA>`  | Review a single commit; `--title` sets the summary title |
| `PROMPT` or `-`   | Custom review instructions (stdin with `-`)              |

Exactly one target (or a custom prompt) is allowed per run.

### codex login

| Flag                  | Purpose                                                                             |
| --------------------- | ----------------------------------------------------------------------------------- |
| (none)                | Browser-based ChatGPT OAuth                                                         |
| `--device-auth`       | OAuth device-code flow for headless machines                                        |
| `--with-api-key`      | Read an API key from stdin: `printenv OPENAI_API_KEY \| codex login --with-api-key` |
| `--with-access-token` | Read a ChatGPT or Codex access token from stdin                                     |
| `status`              | Print the auth mode; exit code `0` when logged in                                   |

### codex mcp

```bash
codex mcp add docs -- npx -y @upstash/context7-mcp       # stdio server
codex mcp add linear --url https://mcp.linear.app/mcp     # streamable HTTP
codex mcp login linear --scopes read,write                # OAuth (HTTP servers only)
codex mcp list --json
codex mcp get docs
codex mcp remove docs
```

`add` also takes `--env KEY=VALUE` (stdio), `--bearer-token-env-var`, `--oauth-client-id`, and `--oauth-resource` (HTTP). See [MCP](./mcp.md).

### codex cloud

`codex cloud` opens an interactive picker. `codex cloud exec --env <ENV_ID> [--attempts 1-4] "task"` submits work directly, and `codex cloud list [--env <ENV_ID>] [--limit 1-20] [--cursor <c>] [--json]` returns recent chats. `codex apply <TASK_ID>` pulls a finished chat's diff into your tree and exits non-zero if `git apply` fails. See [Codex Cloud & Remote](./cloud.md).

### codex sandbox

Run a command under Codex's own sandbox to debug denials: `codex sandbox -- npm test`. Options include `--permission-profile <NAME>` / `-P` to apply a named permissions profile, `--cd`, `--config`, `--profile`, `--include-managed-config`, and on macOS `--log-denials` and `--allow-unix-socket <path>`.

## Configuration: config.toml

### Where it lives

| File                                                | Scope                                     | Notes                                                                                |
| --------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `~/.codex/config.toml`                              | Your defaults for every project           | `CODEX_HOME` changes the directory                                                   |
| `~/.codex/<name>.config.toml`                       | A named profile                           | Selected with `--profile <name>`                                                     |
| `<repo>/.codex/config.toml` (and in subdirectories) | Project overrides                         | Loaded only when the project is trusted; closest file to your working directory wins |
| `/etc/codex/config.toml`                            | System-wide defaults (Unix)               | Below user config                                                                    |
| Cloud-managed `config.toml`                         | Workspace defaults from your organization | Delivered for the signed-in workspace                                                |
| `requirements.toml`                                 | Admin-enforced constraints                | Not overridable by users                                                             |

Other state under `CODEX_HOME`: `auth.json` (if using file credential storage), `history.jsonl`, `memories/`, `themes/`, `log/`, `skills`, and the standalone package cache.

### Precedence

Highest first:

1. CLI flags and `-c` / `--config` overrides
2. Project `.codex/config.toml` files, root to working directory (closest wins; trusted projects only)
3. The profile selected with `--profile`
4. `~/.codex/config.toml`
5. Cloud-managed defaults
6. `/etc/codex/config.toml`
7. Built-in defaults

Marking a project untrusted (`projects."<path>".trust_level = "untrusted"`) skips every project `.codex/` layer, including project hooks and rules. Project files also cannot set credential- or provider-related keys (`openai_base_url`, `chatgpt_base_url`, `model_provider`, `model_providers`, `notify`, `profile`, `profiles`, `otel`, and a few more); Codex ignores them with a startup warning. Run `/debug-config` in the TUI to see the resolved layers.

### Key options

```toml
# ~/.codex/config.toml

# Model
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"       # minimal | low | medium | high | xhigh
model_provider = "openai"               # id from [model_providers]; default openai
review_model = "gpt-5.6-sol"            # optional override for /review and codex review
personality = "pragmatic"               # none | friendly | pragmatic
service_tier = "fast"                   # Fast mode default (with [features] fast_mode = true)

# Approvals and sandbox
approval_policy = "on-request"          # on-request | never | { granular = { ... } }
approvals_reviewer = "user"             # or "auto_review"
sandbox_mode = "workspace-write"        # read-only | workspace-write | danger-full-access

[sandbox_workspace_write]
writable_roots = ["/Users/me/.pyenv/shims"]
network_access = false

# Discovery and instructions
project_doc_max_bytes = 32768
project_doc_fallback_filenames = [".agents.md"]
project_root_markers = [".git"]

# Web search: cached (default) | indexed | live | disabled
web_search = "cached"

# Notifications: external program that receives a JSON payload
notify = ["python3", "/Users/me/.codex/notify.py"]

# Logging
log_dir = "/Users/me/.codex/log"        # setting it also enables codex-tui.log

[features]
memories = false
fast_mode = true

[history]
persistence = "save-all"                # or "none"
max_bytes = 104857600

[tui]
theme = "catppuccin-mocha"
notifications = ["agent-turn-complete", "approval-requested"]
alternate_screen = "auto"
resume_cwd = "current"
```

Named permission profiles (`default_permissions = ":workspace"` with built-ins `:read-only`, `:workspace`, `:danger-full-access`, or custom `[permissions.<name>]` tables) are an alternative to `sandbox_mode`; do not combine the two. See [Permissions & Sandbox](./permissions.md).

### Feature flags

Toggle optional features under `[features]`, with `codex features enable <name>` / `disable <name>` (persistent), or `--enable` / `--disable` (one run). Commonly used flags:

| Key              | Default                 | Purpose                                                   |
| ---------------- | ----------------------- | --------------------------------------------------------- |
| `hooks`          | `true`                  | Lifecycle hooks from `hooks.json` or inline `[hooks]`     |
| `multi_agent`    | `true`                  | Subagent collaboration tools                              |
| `goals`          | `true`                  | Persisted goals and automatic continuation                |
| `fast_mode`      | `true`                  | Fast tier selection and `service_tier = "fast"`           |
| `memories`       | `false`                 | Local memories (experimental)                             |
| `personality`    | `true`                  | Personality controls                                      |
| `apps`           | `true`                  | App (connector) integrations                              |
| `remote_plugin`  | `true`                  | Remote plugin catalog                                     |
| `unified_exec`   | `true` (except Windows) | PTY-backed exec tool with background terminals            |
| `shell_snapshot` | `true`                  | Snapshot the shell environment to speed repeated commands |

`codex features list` shows every known flag, its maturity, and its effective state.

### Profiles

A profile is a separate TOML file layered above your user config and below project config, so it only needs the values that differ:

```toml
# ~/.codex/ci.config.toml
approval_policy = "never"
sandbox_mode = "read-only"
model_reasoning_effort = "low"
hide_agent_reasoning = true
```

```bash
codex --profile ci
codex exec --profile ci "Summarize failing tests"
```

Profile names may contain letters, numbers, hyphens, and underscores. Since Codex 0.134.0, `[profiles.<name>]` tables inside `config.toml` and the top-level `profile = "..."` selector are no longer read; move them into `~/.codex/<name>.config.toml`.

### Model providers

`model_provider` selects an entry from `[model_providers]`. The built-in IDs `openai`, `ollama`, `lmstudio`, and `amazon-bedrock` are reserved. To point the built-in OpenAI provider at a proxy or data-residency endpoint, set `openai_base_url` rather than defining a new provider.

```toml
model = "gpt-5.6-terra"
model_provider = "proxy"

[model_providers.proxy]
name = "OpenAI via LLM proxy"
base_url = "https://proxy.example.com/v1"
env_key = "OPENAI_API_KEY"              # variable that holds the API key
wire_api = "responses"                  # Chat Completions support is deprecated

[model_providers.azure]
name = "Azure"
base_url = "https://YOUR_PROJECT.openai.azure.com/openai"
env_key = "AZURE_OPENAI_API_KEY"
query_params = { api-version = "2025-04-01-preview" }
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000
```

For local models, `oss_provider = "ollama"` (or `"lmstudio"`) sets the default for `--oss`. For Bedrock, set `model_provider = "amazon-bedrock"` with `[model_providers.amazon-bedrock.aws] profile` and `region`. Providers also support `http_headers`, `env_http_headers`, and a command-backed `[model_providers.<id>.auth]` block that fetches bearer tokens from a credential helper.

### Other useful keys

| Key                                                                                              | Purpose                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `developer_instructions`                                                                         | Extra instructions injected before the `AGENTS.md` chain                                                               |
| `model_instructions_file`                                                                        | Replace Codex's built-in base instructions (renamed from `experimental_instructions_file`)                             |
| `model_context_window`, `model_auto_compact_token_limit`                                         | Context and compaction tuning; see [Managing Context](./context.md)                                                    |
| `hide_agent_reasoning`, `show_raw_agent_reasoning`, `model_reasoning_summary`, `model_verbosity` | Reasoning display and response length                                                                                  |
| `shell_environment_policy`                                                                       | Which environment variables spawned commands inherit (`inherit`, `filters`, `include_only`, `ignore_default_excludes`) |
| `file_opener`                                                                                    | URI scheme for clickable file citations (`vscode` default)                                                             |
| `cli_auth_credentials_store`                                                                     | `file`, `keyring`, `auto`, or `ephemeral`                                                                              |
| `check_for_update_on_startup`                                                                    | Disable only when updates are centrally managed                                                                        |
| `sqlite_home`                                                                                    | Where SQLite-backed runtime state lives                                                                                |
| `[mcp_servers.<id>]`                                                                             | `command` (stdio) or `url` (HTTP), `enabled`, and more; see [MCP](./mcp.md)                                            |
| `[hooks]`                                                                                        | Inline hook definitions; see [Hooks](./hooks.md)                                                                       |
| `[agents]`                                                                                       | Subagent roles; see [Subagents](./subagents.md)                                                                        |
| `[windows] sandbox`                                                                              | `elevated` (recommended) or `unelevated` on native Windows                                                             |

The complete key list is in the [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference), and an annotated [sample config](https://learn.chatgpt.com/docs/config-file/config-sample) shows every section with defaults.

## Environment variables

Codex uses `config.toml` for durable settings and environment variables for shell-scoped overrides, secrets, installer behavior, and diagnostics.

| Variable                                                                                      | Purpose                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_HOME`                                                                                  | Root for config, auth, logs, sessions, skills, and memories (default `~/.codex`). The directory must already exist.                                                           |
| `CODEX_SQLITE_HOME`                                                                           | Location of SQLite-backed state; the `sqlite_home` config key takes precedence.                                                                                               |
| `CODEX_API_KEY`                                                                               | API key for non-interactive processes (`codex exec`, `codex review`, the TypeScript SDK). Set it inline per job rather than job-wide when running repository-controlled code. |
| `CODEX_ACCESS_TOKEN`                                                                          | ChatGPT or Codex access token for trusted automation; pipe to `codex login --with-access-token` to persist.                                                                   |
| `CODEX_CA_CERTIFICATE`                                                                        | PEM CA bundle for corporate TLS interception; takes precedence over `SSL_CERT_FILE`.                                                                                          |
| `SSL_CERT_FILE`                                                                               | Fallback PEM CA bundle.                                                                                                                                                       |
| `OPENAI_FEDERATION_RULE_ID`, `OPENAI_IDENTITY_TOKEN_FILE`, `OPENAI_WORKLOAD_IDENTITY_CONTEXT` | Workload identity federation for CI runners.                                                                                                                                  |
| `CODEX_NON_INTERACTIVE`                                                                       | `1`, `true`, or `yes` skips prompts in the standalone install scripts.                                                                                                        |
| `CODEX_INSTALL_DIR`                                                                           | Where the installer places the `codex` binary (default `~/.local/bin`; `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin` on Windows).                                                |
| `RUST_LOG`                                                                                    | Log filter for the CLI and app-server (`error`, `warn`, `info`, `debug`, `trace`, or targeted filters such as `codex_core=debug`). `codex exec` defaults to `error`.          |
| `VISUAL` / `EDITOR`                                                                           | Editor opened by `Ctrl+G` in the composer.                                                                                                                                    |

Provider API keys are not fixed variables: each `[model_providers.<id>]` names its own via `env_key`. Which variables spawned commands see is governed separately by `shell_environment_policy`.

```bash
# Plaintext TUI log for one debugging session
RUST_LOG=debug codex -c log_dir=./.codex-log
tail -F ./.codex-log/codex-tui.log

# Separate Codex home for an automation user
CODEX_HOME=$(pwd)/.codex codex exec "List active instruction sources"
```

## Compared with Claude Code

| Topic                      | Codex                                                    | Claude Code                                                             |
| -------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Config format              | TOML (`~/.codex/config.toml`, `.codex/config.toml`)      | JSON (`settings.json` at user, project, local, and managed scopes)      |
| One-off override           | `-c key=value` (TOML values)                             | `--settings <path or JSON>`                                             |
| Named profiles             | `--profile <name>` reading `~/.codex/<name>.config.toml` | No profiles; use separate settings files with `--settings`              |
| Permission flags           | `--sandbox` + `--ask-for-approval`, `--yolo`             | `--permission-mode`, `--allowedTools`, `--dangerously-skip-permissions` |
| Headless                   | `codex exec` with `--json`, `-o`, `--output-schema`      | `claude -p` with `--output-format`, `--json-schema`                     |
| Resume                     | `codex resume [--last\|--all]`, `codex fork`             | `--continue`, `--resume`, `--fork-session`                              |
| Extra directories          | `--add-dir`                                              | `--add-dir`                                                             |
| Models via other providers | `[model_providers]`, `--oss`, Bedrock, Azure             | Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry        |
| Disable customizations     | `codex exec --ignore-user-config`, `--ignore-rules`      | `--bare`, `--safe-mode`                                                 |
| Home directory             | `CODEX_HOME`                                             | `~/.claude`                                                             |

See [Claude Code CLI Flags](../claude-code/flags.md) for the Claude Code list.
