---
sidebar_position: 11
sidebar_label: MCP
description: Connect Codex to MCP servers with codex mcp add or config.toml, handle OAuth, control tool approval and timeouts, and use MCP tools from hooks.
keywords:
  [
    Codex MCP,
    Model Context Protocol,
    codex mcp add,
    mcp_servers,
    streamable HTTP,
    stdio server,
    codex mcp login,
    OAuth,
    MCP tool approval,
    app-server,
  ]
---

# MCP

MCP (Model Context Protocol) is the open standard that lets an AI coding agent call tools and read context from outside its own process: documentation search, a browser, Figma, Sentry, GitHub, your own internal services. Codex is an MCP client. You register servers once in `config.toml`, and the ChatGPT desktop app, the Codex CLI, and the IDE extension all share that configuration, so a server you add in the terminal is available in the app without further setup.

## How MCP works in Codex

- A **server** is a local process (stdio) or a remote endpoint (streamable HTTP) that exposes tools and optional server-wide `instructions`.
- Codex connects at startup, reads each server's tool list and `instructions`, and offers those tools to the model alongside its built-in ones.
- When the model calls an MCP tool, Codex checks the tool's approval mode and annotations, prompts you or the [Auto-review](./auto-review.md) reviewer if needed, runs the call, and returns the result into the conversation.

Supported server features:

| Transport           | Supports                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **stdio**           | Local command plus `args`, environment variables, working directory, optional remote executor placement                                                                                          |
| **Streamable HTTP** | Bearer token auth, OAuth (including CIMD and Dynamic Client Registration), ChatGPT session auth for trusted first-party servers, static and environment-sourced headers, a header helper command |

Codex reads the MCP `instructions` field returned during initialization and treats it as server-wide guidance. If you maintain a server, put cross-tool workflows, constraints, and rate limits there and keep the first 512 characters self-contained.

## Where configuration lives

| Location                    | Scope                       | Notes                                                                             |
| --------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `~/.codex/config.toml`      | You, all projects           | Default target of `codex mcp add`                                                 |
| `<repo>/.codex/config.toml` | This project                | Loaded only when the project is trusted; commit it to share servers with the team |
| Plugin manifest             | While the plugin is enabled | Transport is fixed by the plugin; you control enable state and tool policy        |
| Managed `requirements.toml` | Organization                | An `mcp_servers` allowlist that decides which servers may be enabled at all       |

There is no separate per-user-per-project "local" scope. Put personal servers in the user file and team servers in the project file, and keep secrets out of both by referencing environment variables.

## Adding servers from the CLI

A local stdio server. Everything after `--` is the launch command:

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
codex mcp add myserver --env API_KEY=your-key --env REGION=eu -- node ./mcp/server.js
```

A streamable HTTP server:

```bash
codex mcp add figma --url https://mcp.figma.com/mcp --bearer-token-env-var FIGMA_OAUTH_TOKEN
codex mcp add example --url https://mcp.example.com --oauth-client-id my-client
```

| `codex mcp add` flag               | Purpose                                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| `-- <command> [args...]`           | Launch command for a stdio server (mutually exclusive with `--url`) |
| `--env KEY=VALUE`                  | Environment variable for a stdio server (repeatable)                |
| `--url <https://...>`              | Register a streamable HTTP server                                   |
| `--bearer-token-env-var <ENV_VAR>` | Send the variable's value as a bearer token                         |
| `--oauth-client-id <CLIENT_ID>`    | Pre-registered OAuth client id (requires `--url`)                   |
| `--oauth-resource <RESOURCE>`      | RFC 8707 resource parameter for OAuth login (requires `--url`)      |

Manage what you have:

```bash
codex mcp list            # configured servers; add --json for machine output
codex mcp get <name>      # one server's configuration; --json prints the raw entry
codex mcp remove <name>   # delete the definition
codex mcp login <name>    # OAuth login for a streamable HTTP server
codex mcp logout <name>   # remove stored OAuth credentials
```

`login` and `logout` only work with streamable HTTP servers that support OAuth.

In the desktop app, use **Settings > MCP servers > Add server**, choose STDIO or Streamable HTTP, save, then **Restart**. In the IDE extension, open the gear menu, select **MCP servers**, add the server, then **Restart extension**.

## Configuring in config.toml

Each server is a `[mcp_servers.<name>]` table.

### stdio servers

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
env_vars = ["LOCAL_TOKEN"]          # forward these from your environment
cwd = "/path/to/run/from"           # optional

[mcp_servers.context7.env]
MY_ENV_VAR = "MY_ENV_VALUE"         # set explicitly
```

| Key                        | Meaning                                                                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `command` (required)       | Executable that starts the server                                                                                                   |
| `args`                     | Arguments                                                                                                                           |
| `env`                      | Environment variables set for the process                                                                                           |
| `env_vars`                 | Variables to allow and forward from Codex's environment. Entries can be strings or `{ name = "...", source = "local" \| "remote" }` |
| `cwd`                      | Working directory                                                                                                                   |
| `experimental_environment` | `remote` starts the stdio server through a remote executor environment when available                                               |

### Streamable HTTP servers

```toml
[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
bearer_token_env_var = "FIGMA_OAUTH_TOKEN"
http_headers = { "X-Figma-Region" = "us-east-1" }
env_http_headers = { "X-Team-Token" = "TEAM_TOKEN_ENV" }
```

| Key                                                            | Meaning                                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url` (required)                                               | Server endpoint                                                                                                                                                                                                                            |
| `auth`                                                         | Fallback after bearer tokens and headers: `oauth` (default, stored MCP OAuth credentials) or `chatgpt` (current ChatGPT session for the trusted first-party origin, then stored OAuth)                                                     |
| `bearer_token_env_var`                                         | Variable whose value goes into `Authorization`                                                                                                                                                                                             |
| `http_headers`                                                 | Static headers                                                                                                                                                                                                                             |
| `env_http_headers`                                             | Header name to environment variable name                                                                                                                                                                                                   |
| `http_headers_helper`                                          | Local command that prints a JSON object of headers. Cached per connection; refreshed once after a same-origin `401` or `403`. Explicit tokens and OAuth take precedence over a helper `Authorization` header. Local HTTP connections only. |
| `scopes`                                                       | OAuth scopes to request                                                                                                                                                                                                                    |
| `oauth_resource`                                               | RFC 8707 resource parameter                                                                                                                                                                                                                |
| `oauth.client_id`, `oauth.callback_url`, `oauth.callback_port` | Pre-registered OAuth client settings                                                                                                                                                                                                       |

If no credential source resolves, Codex can connect without authentication. Run `codex mcp login <name>` separately to start an OAuth login.

### Options for any server

```toml
[mcp_servers.chrome_devtools]
url = "http://localhost:3000/mcp"
enabled = true
required = false
startup_timeout_sec = 20
tool_timeout_sec = 45
enabled_tools = ["open", "screenshot"]
disabled_tools = ["screenshot"]       # applied after enabled_tools
default_tools_approval_mode = "prompt"

[mcp_servers.chrome_devtools.tools.open]
approval_mode = "approve"
output_token_limit = 30000
```

| Key                               | Default       | Meaning                                                                          |
| --------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| `enabled`                         | `true`        | `false` keeps the definition but does not start the server                       |
| `required`                        | `false`       | `true` fails startup or resume if this enabled server cannot initialize          |
| `startup_timeout_sec`             | `10`          | Time allowed for the server to start (`startup_timeout_ms` is an alias)          |
| `tool_timeout_sec`                | `60`          | Per-tool call timeout                                                            |
| `enabled_tools`                   | all           | Allow list of tool names                                                         |
| `disabled_tools`                  | none          | Deny list, applied after `enabled_tools`                                         |
| `default_tools_approval_mode`     |               | `auto`, `prompt`, `writes` (prompt for tools not marked read-only), or `approve` |
| `tools.<tool>.approval_mode`      |               | Per-tool override                                                                |
| `tools.<tool>.output_token_limit` | model default | Output budget for one tool, before the standard 20% serialization allowance      |

Top-level `mcp_optional_startup_grace_ms` (default `1000`) is how long Codex waits for optional servers while building the initial tool catalog. Set it to `0` to wait each server's full `startup_timeout_sec`. Required servers always use their own timeouts.

## OAuth login

```bash
codex mcp login sentry
codex mcp login sentry --scopes read,write
codex mcp login sentry --oauth-client-registration cimd   # or dcr; default auto
```

How registration and callbacks work:

- Codex chooses **CIMD** (Client ID Metadata Documents) automatically when the authorization server advertises `client_id_metadata_document_supported: true`, includes `none` in `token_endpoint_auth_methods_supported`, and the callback is a supported loopback URL. Otherwise it uses **Dynamic Client Registration**. A configured `oauth.client_id` always wins and skips registration. The `--oauth-client-registration` choice applies to that login only and is not stored.
- For CIMD, the metadata document is `https://chatgpt.com/oauth/codex/<callback_id>/client.json`, where `<callback_id>` is derived from the server URL. The redirect URI is `http://127.0.0.1:<port>/callback/<callback_id>`; the authorization server must accept a variable loopback port (RFC 8252 section 7.3).
- For a pre-registered client, `codex mcp add --url ... --oauth-client-id ...` prints the exact callback URL to register with your provider and stores it under `[mcp_servers.<name>.oauth]`. Register exactly what Codex prints.
- If the server advertises `scopes_supported`, Codex prefers those over the `scopes` in your config.
- Codex validates any returned `iss` before exchanging the code; a mismatch is a hard failure.

Global overrides, useful on a devbox or behind a proxy:

```toml
mcp_oauth_callback_port = 5555
mcp_oauth_callback_url = "https://devbox.example.internal/callback"
mcp_oauth_credentials_store = "keyring"   # auto | file | keyring
```

A port inside the callback URL does not select the listener port; set `mcp_oauth_callback_port` (or a server's `oauth.callback_port`) for that.

## Checking status in a session

```text
/mcp
/mcp verbose
```

`/mcp` lists the connected servers and their tools. `/mcp verbose` adds server diagnostics, which is the first place to look when a tool you expected is missing. Outside a session, `codex mcp list` and `codex mcp get <name> --json` show what is configured.

If a server fails to start and is not `required`, Codex continues without it after the optional-startup grace period. If it is `required`, the session does not start.

## Using MCP tools from hooks

Two integrations exist between [hooks](./hooks.md) and MCP:

**Match MCP tool calls in hooks.** `PreToolUse`, `PostToolUse`, and `PermissionRequest` see MCP calls under the name `mcp__<server>__<tool>`. A `PreToolUse` hook can deny or rewrite the arguments; `tool_input` is the argument object.

```toml
[[hooks.PreToolUse]]
matcher = "mcp__github__.*"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '"$(git rev-parse --show-toplevel)/.codex/hooks/github_policy.sh"'
```

**Call an MCP tool as a hook handler.** An `mcp_tool` handler sends templated arguments to a tool on an already-connected server:

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
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

MCP tool hooks reuse the existing connection, run synchronously, skip tool approval, and only block when the tool returns a blocking decision. `SessionStart` hooks can fire before a server is ready (they then do not block), and `SessionEnd` does not support MCP tool hooks.

## Plugin-provided servers

Plugins can bundle MCP servers. The plugin fixes the transport; your config controls the rest under `plugins.<plugin>.mcp_servers.<server>`:

```toml
[plugins."sample@test".mcp_servers.sample]
enabled = true
default_tools_approval_mode = "prompt"
enabled_tools = ["read", "search"]

[plugins."sample@test".mcp_servers.sample.tools.search]
approval_mode = "approve"
```

Plugin HTTP servers declare OAuth settings in `.mcp.json` with camelCase keys (`clientId`, `callbackUrl`, `callbackPort`) and follow the same callback rules as other servers. See [Plugins](./plugins.md).

## The removed Codex MCP server

Earlier Codex releases could run **as** an MCP server (`codex mcp-server` and the standalone `codex-mcp-server` binary) so other agents could drive Codex through MCP tool calls. Both have been removed. Integrations that launched either command must migrate before upgrading.

The replacement is the [Codex app server](https://learn.chatgpt.com/docs/app-server), started with `codex app-server`. It speaks its own JSON-RPC protocol over stdio, WebSocket, or a Unix socket and covers authentication, conversation history, approvals, and streamed events. It is **not** an MCP server or a drop-in replacement for an MCP client, so update the integration to the app-server protocol rather than swapping endpoints. The app-server command is experimental and not supported for production workloads.

This removal affects only _hosting_ Codex as a server. Connecting Codex _to_ external MCP servers, the subject of this page, is unchanged.

## Recommended servers for coding

The official Codex docs list these as common starting points:

| Server                                                                                  | What it gives Codex                                   | Transport     |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------- |
| [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp)                         | Search and read OpenAI developer docs                 | HTTP          |
| [Context7](https://github.com/upstash/context7)                                         | Current library documentation, reduces invented APIs  | stdio         |
| [Figma](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) | Read designs (local or remote server)                 | stdio or HTTP |
| [Playwright](https://www.npmjs.com/package/@playwright/mcp)                             | Drive and inspect a browser                           | stdio         |
| [Chrome DevTools](https://github.com/ChromeDevTools/chrome-devtools-mcp/)               | Control and inspect Chrome                            | stdio         |
| [Sentry](https://docs.sentry.io/product/sentry-mcp/#codex)                              | Read errors and logs                                  | HTTP          |
| [GitHub](https://github.com/github/github-mcp-server)                                   | Pull requests, issues, and everything `git` cannot do | HTTP or stdio |

Context7 is the one the Codex docs use as the worked example:

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
```

For the others, follow the linked project's install instructions for the exact command or URL, then register it with `codex mcp add`. A practical pattern is one documentation server (Context7 or the Docs MCP), one browser server (Playwright or Chrome DevTools), and one tracker or VCS server (GitHub, Sentry). Add more only when a task needs them: every connected server adds tool descriptions to the model's context.

## Security considerations

- **MCP traffic bypasses the command sandbox proxy.** The network proxy and domain rules in your [permissions](./permissions.md#network-access) filter commands running inside the sandbox, not MCP connections. Control servers through `mcp_servers` configuration and, for organizations, the managed allowlist.
- **Approval modes are your guardrail.** Use `default_tools_approval_mode = "writes"` or `"prompt"` on servers that can change external state, and `enabled_tools` to expose only what you need. Tools that advertise a destructive annotation always require approval unless they also advertise a read annotation. With Auto-review enabled, tool approvals route to the reviewer.
- **Keep secrets out of config files.** Use `bearer_token_env_var`, `env_http_headers`, or `env_vars` so the committed `.codex/config.toml` never contains tokens. OAuth credentials are stored in the MCP OAuth credentials store (`mcp_oauth_credentials_store`), not in `config.toml`.
- **Project servers only load in trusted projects.** A cloned repository cannot start a server on your machine until you trust its `.codex/` layer.
- **Managed allowlists.** In `requirements.toml`, an `mcp_servers` table with `identity = { command = "..." }` or `identity = { url = "..." }` entries enables a server only when its name and identity match; an empty table disables all MCP servers. Structured identities can pin the executable and each argument.
- **Fail closed where it matters.** Mark a compliance-critical server `required = true` so sessions do not silently run without it.
- **Read the server's `instructions`.** Codex feeds them to the model. Treat third-party server instructions as untrusted input, the same as any tool output.

## Compared with Claude Code

| Topic                         | Codex                                                                            | Claude Code                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Config file                   | `[mcp_servers.<name>]` in `~/.codex/config.toml` or `<repo>/.codex/config.toml`  | `.mcp.json` (project) or `~/.claude.json` (user, local)                      |
| Scopes                        | User and trusted project; shared across CLI, IDE, and desktop app                | Local, project, user                                                         |
| Add command                   | `codex mcp add <name> -- cmd` or `--url`                                         | `claude mcp add <name> -- cmd` or `--transport http`                         |
| Transports                    | stdio, streamable HTTP                                                           | stdio, HTTP, SSE (deprecated), WebSocket                                     |
| OAuth                         | `codex mcp login`, CIMD and DCR, pre-registered client ids, ChatGPT session auth | `claude mcp login`, browser or URL prompt flow                               |
| Per-tool control              | `enabled_tools`, `disabled_tools`, approval modes, output token limits per tool  | `mcp__server__tool` allow and deny permission rules, `MAX_MCP_OUTPUT_TOKENS` |
| Timeouts                      | `startup_timeout_sec`, `tool_timeout_sec`, `mcp_optional_startup_grace_ms`       | Not configured per server in the same way                                    |
| Status                        | `/mcp`, `/mcp verbose`, `codex mcp list`                                         | `/mcp`, `claude mcp list`                                                    |
| Hosting the agent as a server | Removed; use `codex app-server`                                                  | Not applicable                                                               |

See [Claude Code MCP Servers](../claude-code/mcp.md) for the Claude configuration and a longer catalog of general-purpose servers, most of which work unchanged with Codex once translated to `config.toml`.
