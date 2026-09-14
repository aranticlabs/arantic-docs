---
sidebar_position: 11
sidebar_label: MCP
description: Connect Cursor to external tools with MCP servers via mcp.json, stdio and HTTP transports, OAuth, install links, tool approval, and enterprise allowlists.
keywords: [Cursor MCP, mcp.json, Model Context Protocol, MCP servers Cursor, stdio transport, Streamable HTTP, MCP OAuth, MCP install link, MCP allowlist, MCP security]
---

# MCP

MCP (Model Context Protocol) is the open standard that lets Cursor's agent call tools exposed by external servers: issue trackers, databases, browsers, documentation indexes, internal APIs. Instead of pasting a Linear ticket or a schema into the chat, you connect the server once and the agent queries it when relevant. Cursor supports MCP in the desktop app, the Agents Window, the CLI, and Cloud Agents, and the same `mcpServers` format works in Claude Code and other MCP clients.

## How MCP works in Cursor

An MCP server exposes capabilities over the protocol. Cursor connects as a client, lists what the server offers, and lets the agent call it. Servers can be written in any language that can print to stdout or serve an HTTP endpoint.

### Transports

| Transport | Runs | Deployment | Users | Configured with | Auth |
|-----------|------|------------|-------|-----------------|------|
| **stdio** | Locally, as a child process Cursor manages | You install it | Single user | `command` and `args` | Manual (env vars) |
| **SSE** | Local or remote | Deployed as a server | Multiple users | `url` to an SSE endpoint | OAuth |
| **Streamable HTTP** | Local or remote | Deployed as a server | Multiple users | `url` to an HTTP endpoint | OAuth |

Both remote transports are supported. The MCP specification has moved to Streamable HTTP, so use it for new servers when the provider offers it.

### Protocol features Cursor supports

| Feature | What it gives you |
|---------|-------------------|
| **Tools** | Functions the model can call |
| **Prompts** | Templated messages and workflows the server provides for users |
| **Resources** | Structured data sources the agent can read and reference |
| **Roots** | Server-initiated inquiries into URI or filesystem boundaries |
| **Elicitation** | Server-initiated requests for more information from the user |
| **Apps (extension)** | Interactive UI returned by tools, rendered in chat. Falls back to normal tool output where UI cannot render. |

## Installing servers

### One-click from the Marketplace

Open **Customize** in the sidebar, click **MCPs**, browse or search, and click **Add to Cursor**. Follow the OAuth prompt if the server needs it. Official plugins in the [Cursor Marketplace](https://cursor.com/marketplace) are manually reviewed before listing; community servers are indexed at [cursor.directory](https://cursor.directory). Team admins can distribute servers through a team marketplace, and those appear in Customize alongside your personal and workspace servers.

### Install links

Anyone can share a server as a deeplink. It carries the same JSON you would put in `mcp.json`, base64-encoded:

```text
cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_ENCODED_CONFIG
```

| Part | Meaning |
|------|---------|
| `cursor://anysphere.cursor-deeplink` | Protocol scheme and handler |
| `/mcp/install` | Path |
| `name` | Server name (the key in `mcpServers`) |
| `config` | Base64 of `JSON.stringify(<server config>)` |

To generate one: take the single server's config object, `JSON.stringify` it, base64-encode it, and substitute the two placeholders. Clicking the link opens Cursor, which prompts before installing; deeplinks never execute anything automatically. Swap the scheme for `https://cursor.com/link/` to get a web link that redirects to cursor.com. Deeplink URLs are capped at 8,000 characters. For anything bigger than one server, use a [plugin](./plugins.md).

### mcp.json

For custom or private servers, write the config yourself.

| File | Scope | Share it? |
|------|-------|-----------|
| `<project>/.cursor/mcp.json` | This project | Yes, commit it so teammates get the same tools |
| `~/.cursor/mcp.json` | Every project on your machine | No, personal |

Both files are merged. If the same server name appears in both, the project-level entry wins. Save the file and restart Cursor (or let it reload) to pick up changes.

**Local stdio server:**

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${env:DATABASE_URL}"
      ]
    }
  }
}
```

**Remote server with a bearer token:**

```json
{
  "mcpServers": {
    "internal-docs": {
      "url": "https://mcp.internal.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${env:INTERNAL_DOCS_TOKEN}"
      }
    }
  }
}
```

### stdio fields

| Field | Required | Description | Examples |
|-------|----------|-------------|----------|
| `type` | Yes | `"stdio"` | |
| `command` | Yes | Executable on your PATH or a full path | `npx`, `node`, `python`, `docker` |
| `args` | No | Arguments array | `["server.py", "--port", "3000"]` |
| `env` | No | Environment variables for the server | `{"API_KEY": "${env:API_KEY}"}` |
| `envFile` | No | Path to an env file to load more variables. **stdio only.** | `".env"`, `"${workspaceFolder}/.env"` |

Remote (HTTP/SSE) servers do not support `envFile`; use interpolation from your shell environment instead.

### Config interpolation

Cursor resolves variables in `command`, `args`, `env`, `url`, `headers`, and `auth`:

| Syntax | Resolves to |
|--------|-------------|
| `${env:NAME}` | Environment variable `NAME` |
| `${userHome}` | Your home directory |
| `${workspaceFolder}` | The folder containing `.cursor/mcp.json` |
| `${workspaceFolderBasename}` | Name of that folder |
| `${pathSeparator}` or `${/}` | OS path separator |

```json
{
  "mcpServers": {
    "local-tools": {
      "command": "python",
      "args": ["${workspaceFolder}/tools/mcp_server.py"],
      "env": {
        "API_KEY": "${env:API_KEY}"
      }
    }
  }
}
```

Environment variables come from the process that launched Cursor. If you set them in your shell profile, restart Cursor after changing them.

### OAuth

Cursor supports OAuth for remote servers that require it. Most servers use dynamic client registration and just work after **Add to Cursor**. When a provider gives you a fixed client ID, requires a whitelisted redirect URL (Figma and Linear are cited examples), or does not support dynamic registration, add a static `auth` block to the `url` entry:

```json
{
  "mcpServers": {
    "oauth-server": {
      "url": "https://api.example.com/mcp",
      "auth": {
        "CLIENT_ID": "${env:MCP_CLIENT_ID}",
        "CLIENT_SECRET": "${env:MCP_CLIENT_SECRET}",
        "scopes": ["read", "write"]
      }
    }
  }
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `CLIENT_ID` | Yes | OAuth 2.0 client ID |
| `CLIENT_SECRET` | No | Only for confidential clients |
| `scopes` | No | If omitted, Cursor discovers `scopes_supported` from `/.well-known/oauth-authorization-server` |

Register these redirect URLs with the provider (both if users authenticate from web and desktop):

```text
https://www.cursor.com/agents/mcp/oauth/callback   # web and Cloud Agents
http://localhost:8787/callback                     # desktop app
```

The server is identified through the OAuth `state` parameter, so the same two URLs serve every MCP server. In the CLI, run `agent mcp login <identifier>` to complete the flow for a server defined in either `mcp.json`.

### Extension API

Extensions can register servers programmatically with `vscode.cursor.mcp.registerServer()`, which avoids editing `mcp.json`. This is aimed at enterprise and automated setup.

## Using MCP tools in chat

The agent picks up tools listed under **Available Tools** and uses them when relevant, including in [Plan Mode](./modes.md). Ask for a tool by name or describe what you need. Cursor shows each call in chat with expandable arguments and responses. Servers can return images (base64), which Cursor attaches to the chat for vision-capable models.

### Enabling and disabling

- **Servers:** Open **Customize**, find the server, and use the toggle. Disabled servers do not load or appear in chat. Useful for troubleshooting and for reducing tool clutter.
- **Individual tools:** Click the tool name in the tools list at the top of the chat panel to toggle it.
- **CLI:** `agent mcp list` shows servers and status, `agent mcp list-tools <identifier>` lists a server's tools and argument names, `agent mcp enable <identifier>` adds a server to the local approved list, `agent mcp disable <identifier>` stops it from loading or prompting.

Every connected server adds its instructions and tool catalog to the context window. The context ring next to the prompt input has an **MCP** segment showing how much. See [Managing Context](./context.md).

### Tool approval and Run Modes

By default Cursor asks before running any MCP tool; click the arrow next to the tool name to inspect the arguments. Approval follows the same [Run Modes](./permissions.md) as terminal commands:

| Run Mode | MCP behavior |
|----------|--------------|
| **Auto-review** (default) | Allowlisted tools run immediately; everything else goes to the safety classifier, which allows, asks the agent to try another approach, or prompts you |
| **Allowlist** | Only allowlisted tools run without a prompt |
| **Run Everything** | Every tool call runs |

Pre-approve tools in `permissions.json` with `server:tool` entries, where `server` is the key from `mcp.json`:

```jsonc
// ~/.cursor/permissions.json or <project>/.cursor/permissions.json
{
  "mcpAllowlist": [
    "github:*",
    "linear:list_issues",
    "linear:get_issue",
    "notion:search"
  ]
}
```

Wildcards work in either half and inside names (`linear:list_*`). When the file defines `mcpAllowlist`, the in-app MCP allowlist becomes read-only. For plain-English steering of the classifier (for example "ask before any MCP tool that writes to Jira"), use `autoRun.block_instructions` in the same file.

In the CLI, the equivalent is `Mcp(server:tool)` tokens in `cli-config.json`, and `--approve-mcps` auto-approves all configured servers for a run.

### Gating MCP with hooks

`beforeMCPExecution` receives `tool_name`, `tool_input`, and `mcp_server_name`, and can return `allow`, `deny`, or `ask`. `afterMCPExecution` receives the full result for auditing. Set `failClosed: true` on security hooks. See [Hooks](./hooks.md).

## Team and enterprise controls

Distribution and policy are configured separately.

### Distributing servers (Teams and Enterprise)

Configure shared **Team MCP servers** under **Dashboard > Integrations & MCP**. They are available to Cloud Agents. Select **Add to Team Marketplace** to make the same servers installable in the Agents Window, IDE, and CLI; Cursor links them to the Default team marketplace without interrupting Cloud Agent access. Linking does not install or enable a server for everyone: admins still control marketplace access and installation modes, and each developer may need to authenticate with the provider.

### MCP Allowlist (Enterprise)

Under **Team Settings > MCP Configuration**, admins define which servers and tools members may run. Allowlisting approves a configuration; it does not distribute or install it.

| Entry type | Matches against | Examples |
|------------|-----------------|----------|
| **Command** (stdio) | The full launch string: `command` plus all `args` joined with spaces. Shells often resolve `npx` to a full path, so lead with `*`. | `*npx -y @acme/mcp-tool@latest`, `*npx -y @acme/*`, `*python */scripts/mcp-server.py*` |
| **URL** (HTTP/SSE) | The server URL | `https://mcp.acme.com/sse`, `https://*.acme.com/*`, `https://mcp.acme.com/*` |

Per server, admins can also set:

- **Tool controls:** list the tools that may run; leave empty to allow all tools from that server.
- **Network mode** for stdio servers, which run in a sandbox: **Allow all**, **Allowlist** (only listed destinations), **Deny all** (no outbound access), or **No sandbox**. Remote servers are restricted to their URL entry pattern.
- **User MCP extensions:** allow members to add servers outside admin patterns, with a **User MCP Network Denylist** to block specific destinations for those.

When an allowlist is active, servers that match no entry are blocked. The effective MCP auto-run allowlist resolves in this order, with higher sources **replacing** lower ones rather than merging:

1. Team dashboard or other admin-controlled settings
2. `~/.cursor/permissions.json` (can be pushed via MDM)
3. The editor settings allowlist and inline **Add to allowlist**

## Debugging

- **Logs:** Output panel (Cmd+Shift+U on Mac, Ctrl+Shift+U on Windows/Linux), select **MCP Logs**. Shows initialization, tool calls, connection and auth errors, and crashes.
- **Toggle or re-add:** Turn the server off and on in Customize, or remove and re-add it.
- **Environment variables:** If the server depends on variables from your shell profile, make sure Cursor inherits them; restart Cursor after profile changes.
- **Updating npm servers:** Remove the server, run `npm cache clean --force`, re-add it. For custom servers, update the files and restart Cursor.
- **Crashes and timeouts:** Cursor shows an error in chat and marks the call failed. Other servers keep working; failures are isolated per server.
- **CLI:** `agent mcp list` and `agent mcp list-tools <identifier>` are the fastest way to confirm a server starts and what it exposes.

## Servers worth starting with

Cursor's docs point to the Marketplace for vetted servers and to two worked integrations: the Xcode integration (builds, tests, SwiftUI previews, Apple documentation search for Xcode 26.3+) and the web development guide, which combines Linear, Figma, and browser tools. Beyond those, the servers that pay off fastest for coding work are the same ones covered on the [Claude Code MCP page](../claude-code/mcp.md), and their `mcpServers` blocks drop into Cursor's `mcp.json` unchanged:

| Need | Server type | Why |
|------|-------------|-----|
| Current library docs instead of hallucinated APIs | Documentation index (for example Context7) | Cuts the most common class of wrong code |
| Repo-level understanding of a dependency | DeepWiki-style wiki server | Cheaper than reading vendored source |
| Issues and PRs | GitHub or GitLab server | Lets the agent read the ticket and open the PR itself |
| Planning and tickets | Linear, Jira, or Notion server | Keeps specs and status in the loop |
| UI verification | Browser or Playwright server | Complements Cursor's built-in browser and Design Mode |
| Database inspection | Postgres or SQLite server with read-only credentials | Lets the agent see real schemas |

Start with one or two. Each server's tool catalog costs context on every turn.

## Security

MCP servers are written by third parties, not Cursor, and they execute code and reach external services on your behalf. Cursor's guidance:

- **Verify the source.** Install only from developers and repositories you trust. Marketplace listings are reviewed; `cursor.directory` entries are community-submitted.
- **Review permissions.** Understand what data and APIs the server touches before enabling it.
- **Limit API keys.** Use restricted keys with the minimum scopes, and keep them in environment variables, never hardcoded in a committed `mcp.json`.
- **Audit code** for critical integrations.
- **Run sensitive servers locally over stdio** and consider isolated environments for them.
- **Remember `.cursorignore` does not apply to MCP tools.** A filesystem server can read files the agent otherwise cannot. Scope its arguments narrowly.
- **Keep approval on.** Auto-review plus a short `mcpAllowlist` is the intended balance. `*:*` pre-approves every future tool from every server.

## What works well

- Commit `.cursor/mcp.json` with `${env:...}` placeholders so the team shares servers without sharing secrets.
- Match allowlist and hook rules on the server key (`linear:*`, `mcp_server_name`), not on launch commands or URLs, which vary by machine.
- Disable servers you are not using today. It saves context and removes tools the agent might pick wrongly.
- Use a team marketplace for anything more than one person needs; it handles distribution, auth prompts, and updates.

## What to avoid

- Hardcoding tokens in `mcp.json`, especially the project-level file.
- Adding a dozen servers at once. The agent chooses tools less reliably as the catalog grows.
- Pointing a filesystem or database server at production or at `/`.
- Assuming the Enterprise allowlist installs anything. It only approves; users or the marketplace still install.

## Compared with Claude Code

| Concern | Cursor | Claude Code |
|---------|--------|-------------|
| Config files | `.cursor/mcp.json` (project) and `~/.cursor/mcp.json` (global), merged with project winning | `.mcp.json` (project) and `~/.claude.json` (user and local scopes) |
| Adding servers | Customize UI, Marketplace one-click, install deeplinks, `mcp.json` | `claude mcp add` CLI, `.mcp.json` |
| Transports | stdio, SSE, Streamable HTTP | stdio, HTTP, SSE (deprecated), WebSocket |
| Interpolation | `${env:NAME}`, `${workspaceFolder}`, `${userHome}`, and others | `${VAR}` and `${VAR:-default}` |
| OAuth | Dynamic registration plus static `auth` block; `agent mcp login` in CLI | `/mcp` panel or `claude mcp login` |
| Per-tool approval | Run Modes plus `mcpAllowlist` in `permissions.json`; `Mcp(server:tool)` in the CLI | `mcp__server__tool` allow/ask/deny rules |
| Enterprise policy | Dashboard MCP Allowlist with per-server tool and network controls, MDM-pushed `permissions.json` | Managed settings deny rules such as `mcp__*` |
| MCP hooks | `beforeMCPExecution` and `afterMCPExecution` | `PreToolUse` and `PostToolUse` with `mcp__` matchers, plus `mcp_tool` hook type |

See [Claude Code MCP Servers](../claude-code/mcp.md) for the server catalog and Claude-side configuration.
