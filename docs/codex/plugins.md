---
sidebar_position: 12
sidebar_label: Plugins
description: Codex plugins bundle skills, MCP servers, and hooks into installable packages shared through marketplaces and the universal ChatGPT and Codex plugin directory.
keywords:
  [
    Codex plugins,
    plugin marketplace,
    plugin.json,
    .agents/plugins/marketplace.json,
    plugin-creator,
    Codex Security plugin,
    MCP servers,
    skills bundle,
    workspace plugin management,
  ]
---

# Plugins

Plugins are the installable distribution unit for Codex. Where a [skill](./skills.md) is a folder you author and commit, a plugin packages one or more skills together with optional MCP servers, browser capabilities, and lifecycle hooks, and gives the bundle a name, a version, and install metadata. ChatGPT and Codex share one universal plugin directory, so a public plugin published once is discoverable from both products.

Plugins work in Codex in the ChatGPT desktop app and through the Codex CLI plugin browser. They are **not available in the IDE extension**.

## What a plugin contains

| Part                   | What it adds                                                                         | Notes                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skills**             | Reusable instructions Codex loads when a task matches                                | Invoked as `$plugin-name:skill-name` or implicitly                                                                                                                                          |
| **MCP servers**        | Tools and data from external systems (GitHub, Slack, Google Drive, your own service) | Define tools, enforce authentication, return structured data; may include custom UI in ChatGPT                                                                                              |
| **Browser extensions** | Browser capabilities a workflow needs                                                | Surface-specific                                                                                                                                                                            |
| **Hooks**              | Commands that run at configured lifecycle points in the Codex runtime                | Scripts must exist in the execution environment; installing on the web does not deploy them. Non-managed plugin hooks must be reviewed and trusted before they run. See [Hooks](./hooks.md) |

Plugin shapes, from the official architecture guide:

| Shape                 | Choose it when                                                               |
| --------------------- | ---------------------------------------------------------------------------- |
| Skills only           | Instructions plus the tools Codex already has are enough                     |
| MCP server only       | You need tools but no extra workflow guidance                                |
| Skills and MCP server | Skills should guide Codex through workflows that use your tools              |
| MCP server with UI    | Visual interaction (compare, edit, confirm) materially improves the workflow |

Start with the smallest shape and add parts later.

## Plugins vs skills vs MCP

|                | Skill                                               | MCP server                                        | Plugin                                                            |
| -------------- | --------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| What it is     | Folder with `SKILL.md`                              | A tool provider Codex connects to                 | Installable bundle of skills, MCP servers, hooks                  |
| Where it lives | `.agents/skills`, `~/.agents/skills`                | `config.toml` `[mcp_servers]`, or inside a plugin | Marketplace, installed into `~/.codex/plugins/cache`              |
| Shared via     | Git (commit the folder)                             | Config, or plugin                                 | Marketplace or the public directory                               |
| Versioned      | No                                                  | No                                                | Yes (`version` in the manifest)                                   |
| Best for       | Authoring and iterating on one workflow in one repo | Reaching external systems                         | Distributing a proven workflow across repos, teams, or the public |

Recommended order from the Codex customization guide: write `AGENTS.md` first, install an existing plugin if one covers the workflow, otherwise author a skill and package it as a plugin when you want to share it, add MCP when the workflow needs external systems, and add subagents last. See [MCP](./mcp.md) and [Subagents](./subagents.md).

## Browsing and installing plugins

### In the Codex CLI

```text
codex
/plugins
```

The plugin browser groups plugins by marketplace. Use the marketplace tabs to switch sources, open a plugin to inspect details, install or uninstall it, and press `Space` on an installed plugin to turn it on or off. **Start a new session** (`/new`) before using a freshly installed plugin's skills or tools.

The same operations are available as commands for scripts and dotfiles:

```bash
codex plugin add codex-security --marketplace openai-curated
codex plugin add my-plugin@team-plugins
codex plugin list
codex plugin list --available --json
codex plugin remove my-plugin@team-plugins
```

`--json` output includes `pluginId`, `name`, `marketplaceName`, `version`, `installed`, `enabled`, `source`, `installPolicy`, and `authPolicy`, which is useful for provisioning scripts.

### In the ChatGPT desktop app

Open the **Plugins** tab. The directory is organized as **OpenAI** (built by OpenAI), **your workspace** (provided by your workspace), and **Personal** (personal marketplaces, with **Created by me** and **Shared with me** sections). An **Installed** row lists what you already have. Select the plus button on a plugin to install it; if it bundles an MCP server you may be asked to connect and authenticate during install or on first use.

Plugins marked **Desktop only** require the desktop app (any plugin that declares MCP servers in `mcp.json` or `.mcp.json` is Desktop only).

### With an API key

If you sign in to Codex with an OpenAI API key you can still browse, install, and manage supported OpenAI-curated plugins in the CLI and desktop app. Some plugins are unavailable with API-key auth because their connection flows need OAuth capabilities the key path does not support.

### Using an installed plugin

- Describe the outcome and let Codex choose: "Run a Codex Security scan on this repository."
- Or invoke a bundled skill explicitly: `$codex-security:fix-finding`.
- Permissions still apply. When a plugin capability runs through a Codex host, the host's [sandbox and approval policy](./permissions.md) governs it, and external services use their own authentication.

### Removing a plugin

Open the plugin in a plugin browser and choose **Uninstall plugin**, or run `codex plugin remove`. Workspace-installed or default plugins may not offer uninstall; your admin controls those. Uninstalling removes the bundle from that environment; MCP connections made separately in ChatGPT stay connected until you disconnect them there.

## Plugin structure and manifest

A **portable Agent Plugins package** has `plugin.json` at its root. Skills are discovered from `skills/` and MCP servers from `mcp.json` automatically; the manifest does not list them.

```text
my-plugin/
├── plugin.json           # Portable manifest (identity + metadata)
├── mcp.json              # Optional: bundled MCP servers
├── skills/
│   └── release-prep/
│       └── SKILL.md
├── hooks/
│   └── hooks.json        # Optional: lifecycle hooks (discovered by default)
├── .app.json             # Optional: references to already-registered MCP servers (apps)
└── assets/               # Icons, screenshots
```

Minimal manifest:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "release-prep",
  "version": "1.0.0",
  "description": "Version bump, changelog, and tag workflow"
}
```

Optional root fields: `author` (`name`, `email`, `url`), `homepage`, `repository`, `license`, `keywords`. Use a stable kebab-case `name`; hosts use it as the identifier and as the skill namespace (`$release-prep:...`).

### OpenAI-specific metadata

Presentation, registered MCP server mappings, and hook settings go under `extensions.com.openai` in the root manifest:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "release-prep",
  "version": "1.0.0",
  "description": "Version bump, changelog, and tag workflow",
  "extensions": {
    "com.openai": {
      "apps": "./.app.json",
      "hooks": "./hooks/hooks.json",
      "interface": {
        "displayName": "Release Prep",
        "shortDescription": "Cut a release safely",
        "longDescription": "Bumps the version, drafts the changelog, and tags the build.",
        "developerName": "Platform team",
        "category": "Productivity",
        "capabilities": ["Read", "Write"],
        "defaultPrompt": ["Use Release Prep to cut a patch release."],
        "brandColor": "#10A37F",
        "composerIcon": "./assets/icon.png",
        "logo": "./assets/logo.png"
      }
    }
  }
}
```

A separate `.codex-plugin/plugin.json` is still accepted as a **compatibility overlay** when `extensions.com.openai` is absent (the `$plugin-creator` scaffold currently produces this layout). When the inline object exists it replaces the overlay entirely; the two are not merged. Claude-compatible `.claude-plugin/plugin.json` manifests are also accepted, but new packages should use the portable root format.

Path rules: keep `plugin.json`, `mcp.json`, and `skills/` at the plugin root; every path in the extension starts with `./`, is relative to the plugin root, and must stay inside it; store visual assets under `./assets/`.

### Bundled MCP servers

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "docs": {
      "type": "streamable-http",
      "url": "https://example.com/mcp"
    }
  }
}
```

Users can tune a plugin's MCP servers from their own `config.toml` without editing the plugin:

```toml
[plugins."release-prep".mcp_servers.docs]
enabled = true
default_tools_approval_mode = "prompt"
enabled_tools = ["search"]

[plugins."release-prep".mcp_servers.docs.tools.search]
approval_mode = "approve"
```

Approval modes are `auto`, `prompt`, `writes`, or `approve`; `disabled_tools` is a deny list applied after `enabled_tools`. For public submission the MCP endpoint must be a public HTTPS URL.

### Bundled hooks

Codex discovers `hooks/hooks.json` by default. Hook commands receive `PLUGIN_ROOT` (installed plugin root) and `PLUGIN_DATA` (writable data directory); `CLAUDE_PLUGIN_ROOT` and `CLAUDE_PLUGIN_DATA` are set too for compatibility with existing plugin hooks.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${PLUGIN_ROOT}/hooks/session_start.py",
            "statusMessage": "Loading plugin context"
          }
        ]
      }
    ]
  }
}
```

Installing or enabling a plugin does **not** trust its hooks. Codex skips plugin hooks until the user reviews and trusts the current definition (`/hooks` in the CLI). Managed hooks pushed through `requirements.toml` or MDM are the exception. Details in [Hooks](./hooks.md).

## Building a plugin

### With `$plugin-creator`

```text
$plugin-creator Create a plugin named release-prep. Include a skill that bumps the version, drafts a Keep a Changelog entry, and tags the build. Add it to a personal marketplace so I can test it locally.
```

The skill scaffolds the folder and a `.codex-plugin/plugin.json` compatibility manifest, and can add the plugin to a local marketplace. Afterwards: review the manifest, check each skill under `skills/`, restart Codex or the desktop app, install from your local marketplace, and test in a new conversation. If the plugin wraps an MCP server, build and test the server first, register it in ChatGPT developer mode, and give `$plugin-creator` the resulting `plugin_asdk_app...` ID.

### Manually

1. Create the folder and root `plugin.json` (see above).
2. Add `skills/<name>/SKILL.md` for each skill.
3. Add `mcp.json` if the plugin ships servers, and `hooks/hooks.json` if it ships hooks.
4. Add the plugin to a marketplace (next section).

### Local marketplaces

A marketplace is a JSON catalog of plugins. Local and repo marketplaces are how you test and distribute privately; they are separate from the public directory.

| Marketplace       | Path                                          | Plugins usually stored in |
| ----------------- | --------------------------------------------- | ------------------------- |
| Repo              | `$REPO_ROOT/.agents/plugins/marketplace.json` | `$REPO_ROOT/plugins/`     |
| Personal          | `~/.agents/plugins/marketplace.json`          | `~/.codex/plugins/`       |
| Legacy-compatible | `$REPO_ROOT/.claude-plugin/marketplace.json`  | as referenced             |

```json
{
  "name": "team-plugins",
  "interface": {"displayName": "Team plugins"},
  "plugins": [
    {
      "name": "release-prep",
      "source": {"source": "local", "path": "./plugins/release-prep"},
      "policy": {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
      "category": "Productivity"
    }
  ]
}
```

`source.path` is relative to the **marketplace root** (the repo root for a repo marketplace), not to `.agents/plugins/`. Entries can also use `source: "url"` for a plugin at a GitHub repository root or `source: "git-subdir"` with `url`, `path`, and `ref` for a plugin in a subdirectory. Installed plugins are cached under `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/` (`local` for local plugins).

Register a marketplace from the CLI instead of editing `config.toml`:

```bash
codex plugin marketplace add owner/repo
codex plugin marketplace add owner/repo@v1.2.0
codex plugin marketplace add https://github.com/example/plugins.git --sparse .agents/plugins
codex plugin marketplace add ./local-marketplace-root

codex plugin marketplace list
codex plugin marketplace upgrade
codex plugin marketplace remove team-plugins
```

The equivalent `config.toml` keys are `marketplaces.<name>.source_type` (`git` or `local`), `source`, `ref`, and `sparse_paths`. Admins can define marketplaces in system or cloud-managed `config.toml` using the same format.

### Enable or disable a plugin per repository

In the project's `.codex/config.toml`:

```toml
[plugins."release-prep@team-plugins"]
enabled = false
```

The key is `plugin-name@marketplace-name`. Project settings override user, cloud-managed, and system defaults for trusted projects, but they do not change the enabled state of workspace-managed plugins imported through **Admin > Plugins**.

### Publishing

- **To your ChatGPT workspace** (admins only): open ChatGPT Plugins, **Personal**, the plugin's menu, **Publish**, and choose roles. Workspace-published plugins stay inside the workspace boundary. Admins can block this with `features.plugin_sharing = false` in `requirements.toml`.
- **To the universal public directory**: submit through the OpenAI Platform submission flow, which reviews permissions, MCP checks, and test cases. See [Submit plugins](https://developers.openai.com/plugins/deploy/submission).

## Workspace and enterprise plugin management

### Import and sync a marketplace from GitHub

Workspace admins can import a marketplace repository and keep its plugins updated:

1. **Admin > Plugins > Add > Import marketplace**.
2. Enter the repository URL (public or private GitHub; repository URL only, no branch or folder).
3. Set **Path** if the marketplace lives in a subdirectory (for example `team-tools` for `team-tools/.agents/plugins/marketplace.json`).
4. Optionally pin a branch, tag, or commit.
5. Authorize GitHub access and review the import results.

Supported catalog files: `.agents/plugins/marketplace.json` (Codex), `.claude-plugin/marketplace.json` (Claude-compatible), or a standalone `.claude-plugin/plugin.json`. Entries may reference native plugins, Claude-compatible plugins, Agent Plugins 1.0 packages, or supported skill packages.

New marketplaces sync **daily**; use **Sync now** to refresh sooner. Sync adds new entries and updates existing plugins; an invalid update keeps the last working version. Removing an entry from the repo marks the workspace copy **No longer in source** rather than deleting it. Deleting the marketplace deletes all plugins imported from it. Sync uses the importing admin's GitHub connection; to transfer ownership, another admin re-imports the same source.

To move an existing uploaded plugin under GitHub management, add its `pluginId` next to `name` and `source` in the marketplace entry.

### Access policies and the capability chain

Import and sync do not set installation or authentication policies. Admins configure per plugin and per role:

- **Installation policy**: `AVAILABLE`, `INSTALLED_BY_DEFAULT`, or `NOT_AVAILABLE`.
- **Authentication**: `ON_INSTALL` or `ON_USE`.

A plugin spans several control layers, and making a plugin available does not grant access to the services it connects to:

| Layer                   | What it determines                            | Managed in                                        |
| ----------------------- | --------------------------------------------- | ------------------------------------------------- |
| Availability            | Whether the bundle is available to a role     | Workspace settings; CLI plugin browser for CLI    |
| Included skills         | Which instructions the plugin contributes     | The package and skill controls                    |
| MCP server access       | Whether users can use a server's capabilities | Workspace apps and roles                          |
| Actions and permissions | Which actions run and when Codex asks first   | Action control and app permissions per connection |
| Service authorization   | What the authenticated identity can reach     | The external service and its identity provider    |
| Runtime permissions     | What the agent may do with the tool or data   | Sandbox and approvals on the active surface       |

Rollout advice from the official guidance: start with a focused set of plugins tied to a business need, begin with read actions, record an owner and a removal contact per connected service, and test write actions with a least-privilege account before enabling them broadly. Eligible Enterprise admins can export a CSV of the public catalog (`public-plugins-security-review.csv`) to review plugin, MCP server, and skill metadata before enabling anything.

Managed local clients can pin plugin availability with `features.plugins` in `requirements.toml`, and define approved marketplaces in managed `config.toml`.

## Notable plugins for developers

- **[Codex Security](https://learn.chatgpt.com/docs/security/plugin)** (OpenAI-curated marketplace): scans code you own for vulnerabilities, validates plausible findings, and produces `report.md`, per-finding folders with proof-of-concept material, hardening proposals, and machine-readable `findings.json`, `coverage.json`, and `scan-manifest.json`. In the CLI: `/plugins`, install **Codex Security**, `/new`, then "Run a Codex Security scan on this repository." Skills include `$codex-security:security-diff-scan` for reviewing a revision range and `$codex-security:fix-finding` for a minimal patch plus regression test. The docs recommend `gpt-5.6-sol` with `xhigh` reasoning for scan quality. Findings can be exported to JSON, CSV, SARIF, or approval-gated Linear, GitHub, or Jira issues.
- **GitHub, Slack, Google Drive, Gmail**: OpenAI plugins that connect Codex to those services through MCP servers, used for PR context, channel summaries, and document retrieval.
- **Figma, Notion, Build web apps**: public examples in the [openai/plugins](https://github.com/openai/plugins) repository, useful as references for manifest layout and skill structure.
- **Curated skills** such as `gh-fix-ci`, `pdf`, and `linear` from [openai/skills](https://github.com/openai/skills) can be pulled locally with `$skill-installer` when you do not need a full plugin.
- **Apple Messages** (desktop app, macOS arm64 only): read and send Messages with per-send approval. Not available in the CLI.

## What works well

- Installing a plugin first when one covers the workflow, then adding a repo skill only for what is project-specific.
- A repo marketplace plus `[plugins."name@marketplace"]` in `.codex/config.toml` so a project's tooling is versioned with the project.
- Skills-only plugins for team conventions (review checklist, release flow, incident runbook) that several repositories share.
- Pairing a plugin's MCP server with `default_tools_approval_mode = "prompt"` and an `enabled_tools` allowlist until you trust its write actions.

## What to avoid

- **Treating install as trust.** Plugin hooks stay disabled until reviewed; MCP servers still need their own authentication; review the source before installing from a third-party marketplace.
- **Expecting plugins in the IDE extension.** Use the CLI or desktop app; skills committed under `.agents/skills` work everywhere.
- **Editing installed cache copies.** Change the plugin source, update the marketplace entry, and reinstall or refresh.
- **Renaming `.mcp.json` to `mcp.json`.** The portable format adds a transport `type` per server; convert the content.
- **Using `enabled = false` as a security boundary.** Marketplace refresh can still install or refresh files for a disabled plugin; use workspace policies or `features.plugins` to block.
- **Job-level secrets in CI plugin flows.** See the API-key guidance in [Automation](./automation.md).

## Compared with Claude Code

|                     | Codex                                                                                                                     | Claude Code                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Install command     | `/plugins` browser, `codex plugin add name@marketplace`                                                                   | `/plugin install name@marketplace`                                    |
| Manifest            | Root `plugin.json` (Agent Plugins schema) with `extensions.com.openai`; `.codex-plugin/plugin.json` compatibility overlay | `.claude-plugin/plugin.json`                                          |
| Marketplace catalog | `.agents/plugins/marketplace.json` (also reads `.claude-plugin/marketplace.json`)                                         | `.claude-plugin/marketplace.json`                                     |
| Components          | Skills, MCP servers, hooks, browser capabilities                                                                          | Skills, agents, hooks, MCP, LSP servers, monitors, binaries, settings |
| Bundled agents      | Not part of the plugin format; agents live in `.codex/agents`                                                             | `agents/` directory in the plugin                                     |
| Skill namespace     | `$plugin:skill`                                                                                                           | `/plugin:skill`                                                       |
| Per-repo enable     | `[plugins."name@marketplace"] enabled = true` in `.codex/config.toml`                                                     | `--scope project` install                                             |
| Public distribution | One universal directory shared with ChatGPT, submission review                                                            | Official and community marketplaces                                   |
| Enterprise import   | Admin GitHub marketplace import with daily sync and role policies                                                         | Managed settings                                                      |
| Cross-compatibility | Reads Claude-compatible manifests and marketplaces; sets `CLAUDE_PLUGIN_ROOT` for hooks                                   | Not applicable                                                        |

See [Claude Code Plugins](../claude-code/plugins.md) for the Claude Code side, and the [Codex overview](../tools/codex.md) for installation basics.
