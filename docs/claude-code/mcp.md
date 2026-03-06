---
sidebar_position: 10
sidebar_label: MCP Servers
---

# MCP Servers

MCP (Model Context Protocol) is an open standard that lets AI coding tools connect to external services: file systems, databases, APIs, browsers, and more. Each MCP server exposes a set of tools the AI can call during a session, extending what it can do without you having to copy-paste content or context manually.

Claude Code has first-class MCP support. The same servers also work in Claude Desktop, Cursor, and any other MCP-compatible client.

## How MCP works

MCP follows a client-server model:

- **Server**: a local process or remote service that exposes tools, resources, and prompts
- **Client**: the AI tool (Claude Code, Claude Desktop, Cursor) that connects to the server and invokes its tools
- **Tools**: callable functions the server exposes (e.g. `search_web`, `query_database`, `screenshot`)
- **Resources**: data the server makes available as context (e.g. file trees, database schemas, API responses)

When you ask Claude to query a database, take a screenshot, or search the web, it calls the appropriate tool on the relevant MCP server. The server executes the action and returns the result directly into the conversation.

Servers can run locally (as a child process started by Claude Code) or remotely (connected via Server-Sent Events over HTTPS).

## Configuring MCPs in Claude Code

MCPs are defined in `settings.json`. Claude Code supports two levels:

| Level | File | Scope |
|---|---|---|
| Project | `.claude/settings.json` | This project only, shared via git |
| User | `~/.claude/settings.json` | Every project on your machine |

### Configuration format

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@scope/package-name", "optional-arg"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

For remote servers using Server-Sent Events:

```json
{
  "mcpServers": {
    "remote-server": {
      "type": "sse",
      "url": "https://your-server/sse",
      "headers": {
        "Authorization": "Bearer your-token"
      }
    }
  }
}
```

Multiple servers can be configured together:

```json
{
  "mcpServers": {
    "filesystem": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/projects"] },
    "github":     { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"], "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." } },
    "brave-search": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-brave-search"], "env": { "BRAVE_API_KEY": "..." } }
  }
}
```

### Verifying the connection

After adding a server, confirm it loaded and see what tools it exposes:

```text
/mcp
```

Claude Code lists all active servers and their available tools.

## Recommended daily-use servers

If you are new to MCP, start with these five servers. They cover the most common needs and work well together in a **Research, Debug, Document** workflow:

| Server | What it does | Workflow phase |
|--------|-------------|----------------|
| **Context7** | Fetches current library documentation to prevent hallucinated APIs | Research |
| **Playwright** | Browser automation for UI testing and interaction | Debug |
| **Claude in Chrome** | Connects to your actual Chrome browser for console, network, and DOM access | Debug |
| **DeepWiki** | Structured wiki-style documentation for any GitHub repository | Research |
| **Excalidraw** | Generates architecture diagrams and flowcharts from natural language | Document |

### Context7

Fetches up-to-date library documentation so Claude does not hallucinate outdated or non-existent APIs. Especially useful when working with fast-moving libraries.

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@context7/mcp-server"]
  }
}
```

### Excalidraw

Generates architecture diagrams, flowcharts, and system diagrams from natural language descriptions. Useful for documenting designs during planning phases.

```json
{
  "excalidraw": {
    "command": "npx",
    "args": ["-y", "@excalidraw/mcp-server"]
  }
}
```

### DeepWiki

Provides structured, wiki-style documentation for any public GitHub repository. Useful when you need to understand how an external dependency works without reading raw source code.

```json
{
  "deepwiki": {
    "command": "npx",
    "args": ["-y", "@deepwiki/mcp-server"]
  }
}
```

### Suggested workflow

Use these servers together in phases:

1. **Research**: use Context7 and DeepWiki to understand the libraries and patterns you will use
2. **Debug**: use Playwright or Claude in Chrome to test UI behavior, inspect console errors, and verify network requests
3. **Document**: use Excalidraw to generate diagrams of the system you built

This pattern keeps each phase focused and avoids overwhelming Claude with too many tools at once.

## All available MCP servers

Copy any configuration block below into your `settings.json` under the `mcpServers` key. Each entry is also available as a downloadable JSON file.

---

### Universal

These servers are useful in almost any project regardless of stack or team size.

#### filesystem

[Download filesystem.json](pathname:///mcps/filesystem.json): read and write files outside the current project directory

Gives Claude access to arbitrary directories on your machine. Useful when you need it to read a config file, reference documentation, or write output to a location outside the project root.

```json
{
  "filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/Users/yourname/projects",
      "/Users/yourname/documents"
    ]
  }
}
```

Key tools: `read_file`, `write_file`, `list_directory`, `move_file`, `search_files`

#### memory

[Download memory.json](pathname:///mcps/memory.json): persistent knowledge graph that survives across sessions

Lets Claude store and recall facts, decisions, and notes between separate sessions. Useful for ongoing projects where you want it to remember architectural decisions, your personal preferences, or recurring context without re-explaining every time.

```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"]
  }
}
```

Key tools: `create_entities`, `create_relations`, `search_nodes`, `open_nodes`, `add_observations`

#### fetch

[Download fetch.json](pathname:///mcps/fetch.json): HTTP requests and web page retrieval

Lets Claude fetch any URL and read the response: API documentation, a JSON endpoint, an HTML page, a raw file from GitHub. Useful when you want it to look something up without leaving the terminal. Requires [uv](https://docs.astral.sh/uv/): `pip install uv` or `brew install uv`.

```json
{
  "fetch": {
    "command": "uvx",
    "args": ["mcp-server-fetch"]
  }
}
```

Key tools: `fetch` (GET any URL, returns parsed text or raw content)

---

### Code & version control

For teams working with git and GitHub-hosted repositories.

#### git

[Download git.json](pathname:///mcps/git.json): deep git history, blame, log, and diff operations (requires `uv`)

Extends Claude's git awareness beyond what it can run via Bash. Provides structured access to commit history, blame annotations, and diffs, which is more token-efficient than parsing raw git output.

Requires [uv](https://docs.astral.sh/uv/): `pip install uv` or `brew install uv`.

```json
{
  "git": {
    "command": "uvx",
    "args": ["mcp-server-git", "--repository", "/path/to/your/repo"]
  }
}
```

Key tools: `git_log`, `git_diff`, `git_blame`, `git_show`, `git_status`, `git_commit`

#### github

[Download github.json](pathname:///mcps/github.json): GitHub API access for issues, PRs, workflows, and repositories

Lets Claude read and create issues, review and comment on pull requests, trigger workflows, and search across repositories. Requires a GitHub personal access token with appropriate scopes.

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
    }
  }
}
```

Key tools: `create_issue`, `list_issues`, `create_pull_request`, `list_pull_requests`, `get_file_contents`, `push_files`, `search_repositories`, `list_workflows`

Token scopes needed: `repo`, `workflow` (add `read:org` for organization repositories).

---

### Web & research

For workflows that require fetching live information, scraping, or visual inspection of web pages.

#### brave-search

[Download brave-search.json](pathname:///mcps/brave-search.json): real-time web search via the Brave Search API

Gives Claude live web search without opening a browser. Useful for looking up library documentation, checking for breaking changes in recent releases, or researching unfamiliar APIs. Requires a free [Brave Search API key](https://api.search.brave.com/).

```json
{
  "brave-search": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "your_brave_api_key_here"
    }
  }
}
```

Key tools: `brave_web_search` (returns titles, URLs, and snippets), `brave_local_search`

#### puppeteer

[Download puppeteer.json](pathname:///mcps/puppeteer.json): full browser automation and screenshot capture

Lets Claude control a Chromium browser: navigate to pages, take screenshots, click elements, fill forms, and extract content from JavaScript-rendered pages that plain HTTP fetching cannot read. Useful for visual debugging and testing.

```json
{
  "puppeteer": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
  }
}
```

Key tools: `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_fill`, `puppeteer_evaluate`, `puppeteer_select`

---

### Databases

For projects with relational databases. Both servers are read/write, so scope access to non-production databases or use read-only credentials when auditing.

#### sqlite

[Download sqlite.json](pathname:///mcps/sqlite.json): query and inspect local SQLite databases (requires `uv`)

Gives Claude direct access to a SQLite file. Useful for exploring a local development database, running ad-hoc queries, or generating migrations without switching to another tool.

Requires [uv](https://docs.astral.sh/uv/): `pip install uv` or `brew install uv`.

```json
{
  "sqlite": {
    "command": "uvx",
    "args": ["mcp-server-sqlite", "--db-path", "/path/to/your/database.db"]
  }
}
```

Key tools: `read_query` (SELECT), `write_query` (INSERT, UPDATE, DELETE), `create_table`, `list_tables`, `describe_table`

#### postgres

[Download postgres.json](pathname:///mcps/postgres.json): read-only access to a PostgreSQL database

Lets Claude inspect schemas, run SELECT queries, and reason about your data model. The official server runs in read-only mode by default, making it safe to point at a staging or production replica.

```json
{
  "postgres": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-postgres",
      "postgresql://localhost:5432/your_database"
    ]
  }
}
```

Replace the connection string with your actual database URL. To use credentials separately:
`postgresql://user:password@host:port/database`

Key tools: `query` (read-only SQL), `list_tables`, `describe_table`

---

### Productivity & collaboration

For teams using project management, documentation, and communication tools alongside their code.

#### notion

[Download notion.json](pathname:///mcps/notion.json): read and write Notion pages, databases, and blocks

Lets Claude read your Notion documentation and write new pages or database entries. Useful for keeping technical specs, ADRs, or meeting notes in sync with code changes. Requires a [Notion integration token](https://www.notion.so/my-integrations) with access to the relevant pages.

```json
{
  "notion": {
    "command": "npx",
    "args": ["-y", "@notionhq/notion-mcp-server"],
    "env": {
      "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ntn_your_token_here\", \"Notion-Version\": \"2022-06-28\"}"
    }
  }
}
```

Key tools: `notion_retrieve_page`, `notion_query_database`, `notion_create_page`, `notion_update_block`, `notion_search`

#### slack

[Download slack.json](pathname:///mcps/slack.json): post messages, read channels, and look up user information

Lets Claude read recent messages in channels and post updates. Useful for posting deployment summaries, PR notifications, or standup notes without leaving the terminal. Requires a Slack app with `channels:read`, `chat:write`, and `users:read` scopes.

```json
{
  "slack": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-slack"],
    "env": {
      "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
      "SLACK_TEAM_ID": "T0000000000"
    }
  }
}
```

Key tools: `slack_post_message`, `slack_list_channels`, `slack_get_channel_history`, `slack_reply_to_thread`, `slack_get_users`

#### linear

[Download linear.json](pathname:///mcps/linear.json): create and update Linear issues and cycles

Lets Claude create issues directly from code review findings, update issue status as work progresses, and look up what is planned in the current cycle. Requires a [Linear API key](https://linear.app/settings/api).

```json
{
  "linear": {
    "command": "npx",
    "args": ["-y", "linear-mcp-server"],
    "env": {
      "LINEAR_API_KEY": "lin_api_your_key_here"
    }
  }
}
```

Key tools: `create_issue`, `update_issue`, `list_issues`, `get_issue`, `list_teams`, `list_cycles`

#### google-drive

[Download google-drive.json](pathname:///mcps/google-drive.json): search and read files from Google Drive

Lets Claude search for and read documents, spreadsheets, and other files stored in Google Drive. Useful when your team keeps specs or runbooks in Drive alongside code. Requires a GCP OAuth2 credentials file and initial browser-based authorization.

```json
{
  "google-drive": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-gdrive"],
    "env": {
      "GDRIVE_CREDENTIALS_PATH": "/path/to/gcp-credentials.json",
      "GDRIVE_TOKEN_PATH": "/path/to/token.json"
    }
  }
}
```

Follow the [setup guide](https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive) to create a GCP project, enable the Drive API, and generate credentials.

Key tools: `search`, `read_file`

---

### DevOps & infrastructure

For teams managing containers, CI pipelines, and cloud resources alongside their application code.

#### docker

[Download docker.json](pathname:///mcps/docker.json): manage containers, images, volumes, and networks via the Docker socket

Lets Claude list running containers, inspect logs, start and stop services, and manage images. Useful for debugging container issues, generating Compose files, or automating local environment setup.

Requires Docker Desktop or Docker Engine running locally, with the `docker-mcp` CLI plugin installed (`~/.docker/cli-plugins/docker-mcp`).

```json
{
  "docker": {
    "command": "docker",
    "args": ["mcp", "gateway", "run"]
  }
}
```

Key tools: `list_containers`, `inspect_container`, `container_logs`, `run_container`, `stop_container`, `list_images`, `pull_image`, `list_volumes`

---

## MCP support in other tools

MCP is an open standard. While Claude Code was the first major AI coding tool to support it, most others have added support.

| Tool | MCP support | Configuration location | Notes |
|---|---|---|---|
| **Claude Code** | Full, stable | `.claude/settings.json` | First-class; multi-server, stdio and SSE |
| **Claude Desktop** | Full, stable | `claude_desktop_config.json` | Same servers, different config file path |
| **Cursor** | Yes (experimental) | Cursor settings UI or `mcp.json` | Supports stdio and SSE; enable in Settings > MCP |
| **Gemini CLI** | Yes | `settings.json` | Growing server compatibility |
| **Codex CLI** | Partial | CLI flags or config file | Tool call compatibility varies by server |
| **VS Code + Copilot** | Yes (GitHub Copilot agent mode) | `mcp.json` in workspace or user settings | Supported in agent mode only |

### Using MCP with Claude Desktop

Claude Desktop uses the same server packages but a different config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

The format is identical to Claude Code's `settings.json`. You can share MCP server configs between the two.

### Using MCP with Cursor

In Cursor, go to **Settings > MCP** and add server configurations through the UI, or place an `mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/projects"]
    }
  }
}
```

Not all MCP tools map cleanly to Cursor's agent model. Servers that expose many tools can slow down Cursor's context loading; prefer targeted single-purpose servers.

## Tips

- **Scope filesystem access carefully.** Only pass the directories the server actually needs. Giving access to `/` is a security risk if a prompt injection attack ever reaches Claude.
- **Use project-level config for team servers.** Commit `.claude/settings.json` with servers that every team member should have (GitHub, Linear, your database). Leave personal credentials out: use environment variables or `.env` files that are gitignored.
- **Check `/mcp` after adding a server.** It confirms the server started and shows which tools are available. If a server fails to start, Claude Code shows the error there.
- **Prefer read-only credentials for database servers.** Create a dedicated read-only database user for MCP access, especially for staging or production replicas.
- **Start with one or two servers.** Each server adds to Claude's context about available tools. Adding a dozen servers at once can make it harder for Claude to pick the right tool. Add servers as you need them.
