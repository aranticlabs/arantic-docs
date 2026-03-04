---
sidebar_position: 4
---

# Plugins

Plugins are installable packages that extend Claude Code with additional skills, agents, hooks, and tool integrations. Where a skill is a single reusable prompt you keep in your project, a plugin bundles multiple components together into a versioned, shareable unit that can be discovered and installed from a marketplace.

## Plugins vs. skills vs. standalone config

All three mechanisms add capabilities to Claude Code, but they serve different scopes:

| | Standalone (`.claude/`) | Skills | Plugins |
|---|---|---|---|
| Skill command names | `/skill-name` | `/skill-name` | `/plugin-name:skill-name` |
| Scope | One project | One project | Any project |
| Distribution | Manual copy | Manual copy | Marketplace install |
| Versioning | Not tracked | Not tracked | Semantic versioning |
| Best for | Personal experiments, project conventions | Reusable prompt templates | Shared team tooling, community distribution |

Use standalone config and skills for things that are specific to a project or your own workflow. Use plugins when you want to share capabilities across projects, distribute to your team, or publish to the community.

## Installing plugins

Plugins are installed via the `/plugin` command. The official Anthropic marketplace is available by default.

```bash
# Install a plugin from the official marketplace
/plugin install skill-creator@claude-plugins-official

# Browse available plugins interactively
/plugin
```

By default plugins install at user scope (available in all your projects). You can also install at project scope so the plugin is tracked in version control and shared with your team:

```bash
/plugin install formatter@claude-plugins-official --scope project
```

### Managing installed plugins

```bash
/plugin uninstall plugin-name@marketplace
/plugin enable plugin-name@marketplace
/plugin disable plugin-name@marketplace
/plugin update plugin-name@marketplace
```

### Adding more marketplaces

The official Anthropic marketplace comes pre-configured. You can add others, including private or self-hosted ones:

```bash
# GitHub repository
/plugin marketplace add your-org/your-plugins

# Git URL (GitLab, Bitbucket, etc.)
/plugin marketplace add https://gitlab.com/company/plugins.git

# Local path (useful during development)
/plugin marketplace add ./my-local-marketplace
```

## Types of plugins

### Language intelligence (LSP)

LSP plugins connect Claude Code to a language server, giving it real-time access to type information, go-to-definition, find-references, and live diagnostics for a specific language. Available for C/C++, C#, Go, Java, Kotlin, Lua, PHP, Python, Rust, Swift, and TypeScript.

These require the corresponding language server binary to be installed separately on your system.

### External service integrations (MCP)

Integration plugins connect Claude Code to external tools and services via the Model Context Protocol. Claude can then call those services directly as tools during a session.

Available integrations include:

- **Source control:** GitHub, GitLab
- **Project management:** Atlassian (Jira + Confluence), Asana, Linear, Notion
- **Design:** Figma
- **Infrastructure:** Vercel, Firebase, Supabase
- **Communication:** Slack
- **Monitoring:** Sentry

### Development workflow plugins

Workflow plugins bundle agents, skills, and hooks for specific development tasks. Examples from the official marketplace:

- `commit-commands`: Git commit workflow skills
- `pr-review-toolkit`: Pull request review agents
- `plugin-dev`: Toolkit for building your own plugins
- `skill-creator`: Create, refine, and benchmark new skills (see also [GitHub Repos](../resources/github-repos))

### Output style plugins

Output style plugins adjust how Claude formats and presents its responses. For example, `explanatory-output-style` adds educational context to responses, and `learning-output-style` turns interactions into a more guided learning experience.

## What a plugin contains

A plugin is a directory with a `plugin.json` manifest inside a `.claude-plugin/` folder. Beyond the manifest, it can include any combination of:

- **Skills** (`skills/`): Prompt templates Claude loads when invoked
- **Agents** (`agents/`): Subagent definitions with specialized roles and preloaded skills
- **Hooks** (`hooks/hooks.json`): Event handlers that run on Claude Code lifecycle events (tool use, session start/end, etc.)
- **MCP server config** (`.mcp.json`): External service connections that start automatically when the plugin is enabled
- **LSP server config** (`.lsp.json`): Language server connections for code intelligence

A minimal plugin needs only the manifest. You add components based on what the plugin should do.

## Recommended plugins for AI coding

These are the most practical plugins from the official marketplace for day-to-day AI-assisted development. Install at user scope unless your whole team should share the same setup.

### Code quality and review

**[`code-review`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review)**

Adds review agents and skills that analyse code for bugs, security issues, and style problems. A good complement to the built-in review skills if you want more opinionated or structured output.

```bash
/plugin install code-review@claude-plugins-official
```

**[`code-simplifier`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier)**

Identifies over-engineered code and suggests simpler alternatives. Useful after an AI coding session where Claude may have written more code than necessary to solve the problem.

```bash
/plugin install code-simplifier@claude-plugins-official
```

**[`security-guidance`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance)**

Adds security-focused agents that check for common vulnerabilities (injection, auth issues, secrets in code) and explain how to fix them. Worth installing on any project that handles user data or external input.

```bash
/plugin install security-guidance@claude-plugins-official
```

**[`pr-review-toolkit`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/pr-review-toolkit)**

Bundles pull request review agents that summarise diffs, flag regressions, and generate review comments in a structured format. Useful if you use Claude Code to assist with code reviews.

```bash
/plugin install pr-review-toolkit@claude-plugins-official
```

### Git workflow

**[`commit-commands`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/commit-commands)**

Adds skills for writing commit messages, checking staged diffs before committing, and enforcing commit conventions. Reduces the back-and-forth of asking Claude to write a commit message manually each time.

```bash
/plugin install commit-commands@claude-plugins-official
```

**[`hookify`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/hookify)**

Connects Claude Code to Git hooks so you can trigger skills or agents automatically on pre-commit, post-commit, or push events. For example, run a security check before every commit without invoking it manually.

```bash
/plugin install hookify@claude-plugins-official
```

### Language intelligence

Install the LSP plugin for your primary language. Each one connects Claude Code to the language's official language server, giving it access to real-time diagnostics, type information, and cross-file references.

| Language | Plugin | Language server |
|---|---|---|
| TypeScript / JavaScript | [`typescript-lsp`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/typescript-lsp) | [typescript-language-server](https://github.com/typescript-language-server/typescript-language-server) |
| Python | [`pyright-lsp`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/pyright-lsp) | [Pyright](https://github.com/microsoft/pyright) |
| Go | [`gopls-lsp`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/gopls-lsp) | [gopls](https://pkg.go.dev/golang.org/x/tools/gopls) |
| Rust | [`rust-analyzer-lsp`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/rust-analyzer-lsp) | [rust-analyzer](https://rust-analyzer.github.io/) |
| C# | [`csharp-lsp`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/csharp-lsp) | [csharp-language-server](https://github.com/razzmatazz/csharp-language-server) |

```bash
/plugin install typescript-lsp@claude-plugins-official
/plugin install pyright-lsp@claude-plugins-official
/plugin install gopls-lsp@claude-plugins-official
/plugin install rust-analyzer-lsp@claude-plugins-official
/plugin install csharp-lsp@claude-plugins-official
```

Each LSP plugin requires the corresponding language server binary to be installed on your system first. Check the plugin README for setup instructions.

### Feature development

**[`feature-dev`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev)**

A workflow plugin for structured feature development. Provides agents that help plan, scaffold, implement, and verify a feature end-to-end rather than handling each step ad hoc.

```bash
/plugin install feature-dev@claude-plugins-official
```

**[`ralph-loop`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop)**

Implements an iterative development loop where Claude proposes a solution, evaluates it, and refines it autonomously before presenting the result. Based on the [Ralph Wiggum Loop](https://ghuntley.com/ralph/) pattern for reducing back-and-forth on complex tasks.

```bash
/plugin install ralph-loop@claude-plugins-official
```

### External service integrations

**[`github`](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/github)** / **[`gitlab`](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/gitlab)**

Let Claude Code interact with your repository directly: read issues, create pull requests, post comments, trigger workflows. Install whichever matches your source control host.

```bash
/plugin install github@claude-plugins-official
/plugin install gitlab@claude-plugins-official
```

**[`playwright`](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/playwright)**

Adds browser automation tools so Claude can write, run, and debug end-to-end tests using Playwright. Useful if you want Claude to verify UI behaviour as part of a feature implementation.

```bash
/plugin install playwright@claude-plugins-official
```

**[`linear`](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/linear)** / **[`supabase`](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/supabase)** / **[`firebase`](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/firebase)**

Service-specific integrations for teams already using these platforms. Linear lets Claude read and update issues; Supabase and Firebase give Claude access to your backend services during development.

```bash
/plugin install linear@claude-plugins-official
/plugin install supabase@claude-plugins-official
/plugin install firebase@claude-plugins-official
```

### Skill management

**[`skill-creator`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/skill-creator)**

Helps you build and evaluate new skills. Useful once you outgrow the ready-to-use skills and want to create project-specific or team-specific ones. See also the [GitHub Repos](../resources/github-repos) page for the source.

```bash
/plugin install skill-creator@claude-plugins-official
```

## Creating a plugin

The quickest way to get started is to use the `plugin-dev` or `skill-creator` plugins from the official marketplace, which provide scaffolding and evaluation tooling. You can also test a plugin directory locally without installing it:

```bash
claude --plugin-dir ./my-plugin
```

The [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) repository on GitHub is the best reference for structure and conventions. The internal plugins developed by Anthropic follow the same specification that community plugins use.

To submit a plugin to the official marketplace, use the submission form at [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit).
