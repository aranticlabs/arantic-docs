---
sidebar_position: 12
sidebar_label: Plugins
description: Cursor plugins bundle rules, skills, subagents, commands, MCP servers, and hooks into packages installed from the Cursor Marketplace or a team marketplace.
keywords:
  [
    Cursor plugins,
    Cursor Marketplace,
    Agent Plugins standard,
    .cursor-plugin/plugin.json,
    team marketplace,
    plugin manifest,
    marketplace security,
    plugin variables,
    publish plugin,
    cursor.directory,
  ]
---

# Plugins

Plugins package rules, skills, subagents, commands, MCP servers, and hooks into a single distributable bundle. Where a skill is one `SKILL.md` folder and a rule is one `.mdc` file, a plugin is the unit you install, version, and share: from the public Cursor Marketplace, from a private team marketplace, or from a local folder while you develop it. Cursor supports both its own plugin format and the vendor-neutral [Agent Plugins](https://agent-plugins.org) open standard.

## Plugins vs skills vs rules vs MCP

|                     | Rules                                           | Skills                                         | MCP servers                                  | Plugins                                                   |
| ------------------- | ----------------------------------------------- | ---------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- |
| **What it is**      | Persistent instructions (`.mdc`, `AGENTS.md`)   | On-demand procedures (`SKILL.md` folders)      | Connections to external tools and data       | A bundle of any of the others                             |
| **Unit of sharing** | File in the repo, or team rule in the dashboard | Folder in the repo, published skill, or plugin | `mcp.json` entry, team MCP server, or plugin | Git repository with a manifest                            |
| **Install path**    | Copy into `.cursor/rules/`                      | Copy into `.cursor/skills/`                    | Add to MCP config                            | **Customize → Install**, choose scope                     |
| **Versioning**      | Git history                                     | Git history                                    | Git history                                  | Semantic `version` in the manifest, re-indexed on refresh |
| **Best for**        | Project conventions                             | Repeatable workflows                           | Tool access                                  | Team tooling, community distribution, one-click setup     |

Use rules, skills, and MCP configuration directly when they belong to one project. Use a plugin when the same set should be installed across projects, distributed to a team with access controls, or published to the community. See [Rules & AGENTS.md](./rules.md), [Skills](./skills.md), and [MCP](./mcp.md) for the individual components.

## Two plugin formats

Cursor loads plugins in two formats, identified by where the manifest lives:

| Format                            | Manifest                         | Components                                                     |
| --------------------------------- | -------------------------------- | -------------------------------------------------------------- |
| **Agent Plugins** (open standard) | `plugin.json` at the plugin root | Skills, MCP servers                                            |
| **Cursor Plugins**                | `.cursor-plugin/plugin.json`     | Skills, MCP servers, rules, agents, commands, hooks, variables |

A plugin that conforms to the [Agent Plugins specification](https://github.com/agentplugins/agent-plugins-spec) loads in Cursor without changes, so a plugin written for another agent works here. Cursor Plugins are developed in parallel with the standard and add the Cursor-specific components (rules, agents, commands, hooks, and dashboard-managed variables). Cursor detects the format from the manifest, so installing either is the same flow.

Choose Agent Plugins when you want portable skills and MCP servers that other tools can also load. Choose Cursor Plugins when you need rules, subagents, commands, hooks, or variables.

## What a plugin contains

| Component       | Available in   | Description                                              |
| --------------- | -------------- | -------------------------------------------------------- |
| **Rules**       | Cursor Plugins | Persistent guidance and coding standards as `.mdc` files |
| **Skills**      | Both formats   | `SKILL.md` folders the agent loads when relevant         |
| **Agents**      | Cursor Plugins | Custom subagent definitions (Markdown with frontmatter)  |
| **Commands**    | Cursor Plugins | Agent-executable command files invoked with `/`          |
| **MCP servers** | Both formats   | `mcp.json` server definitions                            |
| **Hooks**       | Cursor Plugins | `hooks/hooks.json` automation triggered by agent events  |

Cursor Plugins can also ship **canvases**: shared setup templates a team opens from an installed plugin in Customize. Cursor's own examples are the Hex Canvas (data visualizations) and the Atlassian Canvas (a live view of Jira and Confluence items).

### Structure

An Agent Plugin:

```text
my-plugin/
├── plugin.json            # Required: Agent Plugins manifest
├── skills/
│   └── code-reviewer/
│       └── SKILL.md
└── mcp.json               # MCP server definitions
```

A Cursor Plugin:

```text
my-plugin/
├── .cursor-plugin/
│   └── plugin.json        # Required: Cursor Plugin manifest
├── rules/
│   ├── coding-standards.mdc
│   └── review-checklist.mdc
├── skills/
│   └── code-reviewer/
│       └── SKILL.md
├── agents/
│   └── security-reviewer.md
├── commands/
│   └── deploy.md
├── hooks/
│   └── hooks.json
├── mcp.json
├── assets/
│   └── logo.svg
├── scripts/
│   └── format-code.py
└── README.md
```

### Manifests

Agent Plugins require the standard's schema identifier:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-plugin",
  "description": "Portable code review tools",
  "version": "1.0.0",
  "author": {"name": "Your Name"}
}
```

A Cursor Plugin manifest only requires `name`:

```json
{
  "name": "enterprise-plugin",
  "version": "1.2.0",
  "description": "Enterprise development tools with security scanning and compliance checks",
  "author": {"name": "ACME DevTools", "email": "devtools@acme.com"},
  "keywords": ["enterprise", "security", "compliance"],
  "logo": "assets/logo.svg"
}
```

Cursor Plugin manifest fields:

| Field                                   | Type                     | Description                                                                                           |
| --------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `name`                                  | string                   | **Required.** Lowercase kebab-case (alphanumerics, hyphens, periods); must start and end alphanumeric |
| `description`                           | string                   | Brief plugin description                                                                              |
| `version`                               | string                   | Semantic version, e.g. `1.0.0`                                                                        |
| `author`                                | object                   | `name` (required), `email` (optional)                                                                 |
| `homepage`, `repository`                | string                   | URLs                                                                                                  |
| `license`                               | string                   | License identifier, e.g. `MIT`                                                                        |
| `keywords`                              | array                    | Tags for discovery                                                                                    |
| `logo`                                  | string                   | Relative path committed to the repo (preferred) or absolute URL                                       |
| `rules`, `agents`, `skills`, `commands` | string or array          | Explicit paths; replaces folder discovery for that component                                          |
| `hooks`                                 | string or object         | Path to hooks config, or inline config                                                                |
| `mcpServers`                            | string, object, or array | Path to MCP config, inline config, or an array; overrides default `mcp.json` discovery                |
| `variables`                             | object                   | JSON Schema declaring variable names users set in the dashboard                                       |

### Component discovery

When the manifest does not name a path, Cursor discovers components from default folders:

| Component   | Default location          | Discovered as                                                                               |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| Skills      | `skills/`                 | Each subdirectory containing `SKILL.md`                                                     |
| Rules       | `rules/`                  | All `.md`, `.mdc`, `.markdown` files                                                        |
| Agents      | `agents/`                 | All `.md`, `.mdc`, `.markdown` files                                                        |
| Commands    | `commands/`               | All `.md`, `.mdc`, `.markdown`, `.txt` files                                                |
| Hooks       | `hooks/hooks.json`        | Parsed for hook event names                                                                 |
| MCP servers | `mcp.json`                | Parsed for server entries                                                                   |
| Root skill  | `SKILL.md` at plugin root | Single-skill plugin (only when there is no `skills/` folder and no manifest `skills` field) |

If a manifest field is set (for example `"skills": "./my-skills/"`), it replaces discovery for that component; the default folder is not also scanned.

### Variables (secrets without secrets in the repo)

Cursor Plugins can declare **variables**: the names and types of user-supplied configuration such as an API token for an HTTP MCP server. The plugin ships only the schema and `${VAR}` placeholders. Team admins set the values in the dashboard under **Plugins → Configure**, at install time or later.

```json
{
  "name": "example-plugin",
  "variables": {
    "type": "object",
    "properties": {
      "API_TOKEN": {
        "type": "string",
        "title": "API token",
        "description": "Bearer token for the example HTTP MCP"
      }
    },
    "required": ["API_TOKEN"]
  }
}
```

```json
{
  "mcpServers": {
    "example-api": {
      "url": "https://mcp.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

The top level must be `{ "type": "object", "properties": { ... } }`, and only a fixed set of JSON Schema keywords is accepted (`type`, `title`, `description`, `default`, `enum`, `const`, `properties`, `required`, `items`, and common length and numeric constraints). `${VAR}` here is a plugin variable placeholder, not a shell `${env:...}` reference. Plugin-managed MCP config is read-only in the dashboard.

:::warning
Never commit secret values into a plugin repository. Declare every `${VAR}` used in `mcp.json` in the manifest's `variables` schema; the submission checklist requires it.
:::

### Component formats inside a plugin

Components use the same formats as their standalone versions:

- **Rules** (`rules/*.mdc`): frontmatter with `description`, `alwaysApply`, and optional `globs`. See [Rules & AGENTS.md](./rules.md).
- **Skills** (`skills/<name>/SKILL.md`): frontmatter with `name` and `description`. See [Skills](./skills.md).
- **Agents** (`agents/*.md`): frontmatter with `name` and `description`, then the prompt. See [Subagents](./subagents.md).
- **Commands** (`commands/*.md`): optional frontmatter with `name` and `description`, then the steps. See [Commands & Shortcuts](./commands.md).
- **Hooks** (`hooks/hooks.json`): the same `hooks` object as `.cursor/hooks.json`, with agent events such as `afterFileEdit`, `beforeShellExecution`, and `sessionEnd`, Tab events, and `workspaceOpen`. Scripts referenced by hooks live in the plugin (for example under `scripts/`). See [Hooks](./hooks.md).

```json
{
  "hooks": {
    "afterFileEdit": [{"command": "./scripts/format-code.sh"}],
    "beforeShellExecution": [{"command": "./scripts/validate-shell.sh", "matcher": "rm|curl|wget"}],
    "sessionEnd": [{"command": "./scripts/audit.sh"}]
  }
}
```

## The marketplace and installing

### Cursor Marketplace

The [Cursor Marketplace](https://cursor.com/marketplace) lists official plugins. Plugins are distributed as Git repositories, must be open source, and are manually reviewed before listing and before every update. For community plugins and MCP servers, Cursor points to [cursor.directory](https://cursor.directory).

### Installing

1. Open **Customize** in the sidebar (or browse the marketplace on the web and search by keyword inside Cursor).
2. Find the plugin.
3. Select **Install** and choose **project** or **user** scope.

Cursor detects Agent Plugin or Cursor Plugin format from the manifest; the flow is identical. Installed plugins work across Cursor desktop, web, and the [CLI](./cli.md).

### Managing installed plugins

**Customize** is the single place for plugins, MCP servers, rules, skills, subagents, commands, and hooks. Filter by **user**, **workspace**, or **team** scope to see what is active where.

- **MCP servers**: toggle personal and team-distributed servers on or off. Disabled servers do not load or appear in chat.
- **Rules**: switch each rule between **Always**, **Agent Decides**, and **Manual**.
- **Skills**: appear in the **Agent Decides** section; invoke manually with `/skill-name`.

Customize also shows a **leaderboard** of the most-installed plugins, skills, and MCPs across your team and the community, with one-click install.

### MCP install links

Share an MCP server configuration as a deeplink that opens Cursor and offers to install it:

```text
cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_ENCODED_CONFIG
```

See [MCP](./mcp.md) for generating these links.

### Loading plugins per workspace with `workspaceOpen`

A `workspaceOpen` hook can return plugin paths to load when a workspace opens. Use this when the set of plugins depends on the repository itself (for example, a monorepo that ships its own plugin folder). See [Hooks](./hooks.md) for the hook contract.

## Team marketplaces

Team marketplaces are private marketplaces for Teams and Enterprise plans. They distribute both Agent Plugins and Cursor Plugins with the same access and installation controls.

| Plan       | Team marketplaces                                           |
| ---------- | ----------------------------------------------------------- |
| Teams      | Up to 1                                                     |
| Enterprise | Unlimited, plus admin-only creation and additional controls |

Manage them under **Dashboard → Plugins**. On Enterprise plans, only admins can add team marketplaces.

### Adding a marketplace from a repository

1. Go to **Dashboard → Plugins**.
2. In **Team Marketplaces**, click **Add Marketplace**.
3. Create a marketplace from scratch, or use **Import from Repo** for a GitHub repository.
4. Add and review plugins with **Add to Marketplace**.
5. Under **Marketplace Settings**, set **Marketplace Access**, optionally enable **Auto Refresh**, and save.

A ready-made example to try: [fieldsphere/cursor-team-marketplace-template](https://github.com/fieldsphere/cursor-team-marketplace-template).

### Keeping plugins up to date

Plugins imported from GitHub are indexed at import time. Refresh them:

- **Automatically**: turn on **Enable Auto Refresh**. Cursor re-indexes when changes are pushed to the tracked branch (requires the Cursor GitHub App on the repository). Re-indexing happens at most once every 10 minutes, batching rapid pushes to the latest commit. For marketplaces created with **Import from Repo**, Auto Refresh re-reads the full manifest, so new plugins are picked up. For marketplaces where plugins were added individually, Auto Refresh only updates existing plugins; re-import the repository URL to pick up new ones.
- **Manually**: click **Refresh**.

### Marketplace access and installation modes

Team marketplaces are visible to the whole team by default. Under **Marketplace Settings → Marketplace Access**, admins can restrict a marketplace to selected Organization Groups; only members of the marketplace's team who belong to a selected group get access, and team admins always keep access. Organization Groups can sync membership from your identity provider through SCIM.

For each plugin, choose how it reaches that audience:

| Mode            | Behavior                                                |
| --------------- | ------------------------------------------------------- |
| **Default Off** | Developers can find the plugin and choose to install it |
| **Default On**  | Installed by default; developers can opt out            |
| **Required**    | Always installed and cannot be uninstalled              |

Developers see team marketplace plugins in **Customize**, install Default Off plugins from there, and can install and configure marketplace MCP servers for the Agents Window, IDE, and CLI.

### The Default team marketplace

The **Default** team marketplace connects shared plugins and Team MCP servers across Cursor. Admins can add Team MCP servers that Cloud Agents already use and make the same servers installable for teammates in the Agents Window, IDE, and CLI. Adding a server to the Default marketplace does not install or enable it for anyone; installation modes and marketplace access still apply, and each developer may need to authenticate with the MCP provider.

To link existing standalone Team MCP servers: **Dashboard → Integrations & MCP → Team MCP Servers → Add to Team Marketplace**, then review the Default marketplace under **Dashboard → Plugins**.

:::warning
Removing a linked MCP plugin from the marketplace, or deleting the marketplace, can delete the Team MCP server for both local users and Cloud Agents. Read the confirmation message before continuing.
:::

### Publishing a skill to the team

On Teams and Enterprise, members can publish a personal skill from `~/.cursor/skills/` to the Default marketplace: **Customize → Skills**, open the skill, choose **Publish**. Cursor packs it into a one-skill plugin named after the skill, stores a copy in a team-hosted repository, and lists it. Installs are opt-in for teammates; the author gets it automatically and can **Sync changes** or **Unpublish**. Admins can turn **Allow Members to Publish** off under **Dashboard → Plugins → Default marketplace → Marketplace Settings** (on by default). See [Skills](./skills.md#team-distribution) for the full skill-sharing picture.

## Creating and publishing a plugin

### Create

1. Start from the [Cursor Plugin template repository](https://github.com/cursor/plugin-template), or follow the [Agent Plugins authoring guide](https://agent-plugins.org/plugin-authors) for a standard plugin.
2. Add the manifest: root `plugin.json` (Agent Plugin) or `.cursor-plugin/plugin.json` (Cursor Plugin).
3. Add components in their default folders or point to them from the manifest.
4. Commit a logo and reference it by relative path; relative paths resolve to `raw.githubusercontent.com` URLs at the indexed commit.
5. Write a `README.md` that documents usage and configuration.

### Test locally

Before publishing, put either plugin format in `~/.cursor/plugins/local`:

```bash
mkdir -p ~/.cursor/plugins/local
ln -s /path/to/my-plugin ~/.cursor/plugins/local/my-plugin
```

Then restart Cursor or run **Developer: Reload Window**, and confirm the expected rules, skills, or MCP servers appear in **Customize**. A symlink lets you iterate in your plugin repository without copying.

Local plugin imports are subject to a team setting on Teams and Enterprise: **Dashboard → Settings → Security & Identity → Marketplace and Plugins → Allow Local Plugin Imports** (off by default on Enterprise). If a marketplace plugin with the same name is installed, the marketplace install takes precedence over the local copy.

### Multi-plugin repositories

One repository can hold several Cursor Plugins with a marketplace manifest at `.cursor-plugin/marketplace.json`:

```json
{
  "name": "my-marketplace",
  "owner": {"name": "Your Org", "email": "plugins@yourorg.com"},
  "metadata": {"description": "A collection of developer tool plugins"},
  "plugins": [
    {"name": "plugin-one", "source": "plugin-one", "description": "First plugin"},
    {"name": "plugin-two", "source": "plugin-two", "description": "Second plugin"}
  ]
}
```

`name`, `owner`, and `plugins` (max 500 entries) are required. For each entry, Cursor looks for `<source>/.cursor-plugin/plugin.json`, merges it with the marketplace entry (manifest values win), then runs component discovery inside that folder. `metadata.pluginRoot` prefixes all plugin sources.

```text
my-plugins/
├── .cursor-plugin/
│   └── marketplace.json
├── eslint-rules/
│   ├── .cursor-plugin/plugin.json
│   └── rules/
│       ├── prefer-const.mdc
│       └── no-any.mdc
└── docker/
    ├── .cursor-plugin/plugin.json
    ├── skills/
    │   ├── containerize-app/SKILL.md
    │   └── setup-docker-compose/SKILL.md
    └── mcp.json
```

### Submit to the Cursor Marketplace

1. Push the plugin to a **public** Git repository.
2. Submit the repository link at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).
3. Wait for the Cursor team's review.

Submission checklist from the reference:

- Valid root `plugin.json` or `.cursor-plugin/plugin.json`
- Unique lowercase kebab-case `name`
- `description` that clearly explains the purpose
- All components have valid files and frontmatter
- Logo committed and referenced by relative path (if provided)
- `README.md` documents usage and configuration
- Agent Plugins conform to the Agent Plugins schemas
- Cursor Plugins declare every `${VAR}` from `mcp.json` in the manifest `variables` schema
- All manifest paths are relative and valid (no `..`, no absolute paths)
- Tested locally
- Multi-plugin repositories have `.cursor-plugin/marketplace.json` at the root with unique names

For private distribution, skip the public submission and add the repository as a team marketplace instead.

## Marketplace security

What Cursor documents about the risk model:

- **Manual review.** Every marketplace plugin is reviewed for security, data handling, and quality before listing. Updates are not pulled automatically from source; each update is reviewed before it is published.
- **Open source only.** All marketplace plugins must be open source so you and the community can inspect them. Cursor recommends reading a plugin's source before installing.
- **Lightweight by design.** Plugins are largely Markdown plus supporting files such as templates and scripts. No binaries are shipped.
- **MCP governance carries over.** Plugins respect your MCP allowlist and blocklist. A plugin containing a blocked MCP server installs normally, but the blocked server cannot make calls. Existing policies apply without extra configuration.
- **Removal and maintenance.** Plugins found to pose a risk are removed immediately while the issue is resolved. Authors are expected to respond to reported security or stability issues or risk delisting.
- **Curated listing.** Cursor works with a small group of trusted partners and plans to open submissions more broadly as vetting matures.
- **Reporting.** Send concerns to [security-reports@cursor.com](mailto:security-reports@cursor.com).

Installation is still at the user's discretion and risk; a plugin is third-party software.

### Team and enterprise controls summary

| Control                     | Where                                                    | Effect                                                                     |
| --------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| Team marketplaces           | Dashboard → Plugins                                      | Private distribution; Teams get 1, Enterprise unlimited                    |
| Marketplace Access          | Marketplace Settings                                     | Restrict a marketplace to Organization Groups (SCIM-synced)                |
| Installation modes          | Per plugin                                               | Default Off, Default On, or Required                                       |
| Allow Members to Publish    | Default marketplace settings                             | Whether non-admins can publish personal skills                             |
| Allow Local Plugin Imports  | Settings → Security & Identity → Marketplace and Plugins | Whether `~/.cursor/plugins/local` is loaded (off by default on Enterprise) |
| MCP allowlist and blocklist | MCP configuration                                        | Applies to plugin-bundled MCP servers                                      |
| Plugin variables            | Plugins → Configure                                      | Admins supply secret values; repos hold only placeholders                  |

## What works well

- **One plugin per concern.** A `security-review` plugin with a rule, a reviewer subagent, and a `/review-security`-style skill is easier to adopt than a "team-everything" bundle.
- **Required for the non-negotiables, Default On for the useful.** Make the compliance plugin Required; leave productivity plugins opt-out.
- **Variables for every credential.** Ship `${VAR}` placeholders and let admins fill values once in the dashboard.
- **Auto Refresh on the team marketplace.** Push to the tracked branch and everyone gets the update within the refresh window.
- **Symlinked local development.** Iterate in your plugin repo, reload the window, verify in Customize, then push.

## What to avoid

- **Secrets in the repository.** Marketplace plugins must be public and open source; even team marketplaces should hold only placeholders.
- **Duplicating components that already exist in the repo.** If a rule lives in `.cursor/rules/`, do not also ship it in a plugin; you will get it twice.
- **Deleting a linked MCP plugin casually.** It can remove the Team MCP server for Cloud Agents as well.
- **Assuming a published skill is installed for the team.** Publishing is opt-in for teammates unless an admin changes the installation mode.
- **Absolute or `..` paths in the manifest.** They fail the submission checklist and break resolution.

## Compared with Claude Code

| Topic               | Cursor                                                                                                                             | Claude Code                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Manifest            | `plugin.json` at root (Agent Plugins) or `.cursor-plugin/plugin.json` (Cursor Plugins)                                             | `.claude-plugin/plugin.json`                                                                       |
| Components          | Rules, skills, agents, commands, MCP servers, hooks, variables, canvases                                                           | Skills, agents, hooks, MCP servers, LSP servers, monitors, executables, default settings           |
| Install             | **Customize → Install**, project or user scope; no slash command                                                                   | `/plugin install name@marketplace`, `--scope project`                                              |
| Marketplaces        | Public Cursor Marketplace (curated, reviewed), team marketplaces (Teams: 1, Enterprise: unlimited), cursor.directory for community | Official marketplace plus any Git repo, URL, or local path added with `/plugin marketplace add`    |
| Multi-plugin repos  | `.cursor-plugin/marketplace.json`                                                                                                  | `.claude-plugin/marketplace.json`                                                                  |
| Secrets             | `variables` schema with `${VAR}` placeholders, values set in the dashboard                                                         | Environment variables such as `${CLAUDE_PLUGIN_ROOT}` for paths; no dashboard-managed secret store |
| Local testing       | `~/.cursor/plugins/local` (symlink friendly), gated by Allow Local Plugin Imports                                                  | `claude --plugin-dir ./my-plugin`, `claude plugin validate`                                        |
| Enterprise controls | Installation modes (Default Off / On / Required), Organization Group access, SCIM, member publishing toggle                        | Managed settings for enterprise-wide plugins                                                       |
| Open standard       | Agent Plugins (agent-plugins.org) supported alongside the Cursor format                                                            | Agent Skills spec for skills; plugin format is Claude Code specific                                |

See [Claude Code Plugins](../claude-code/plugins.md) for the Claude Code details, and [Cursor](../tools/cursor.md) for the general tool overview.
