---
sidebar_position: 2
sidebar_label: AGENTS.md & Memories
description: How Codex loads AGENTS.md instruction files across global, project, and nested scopes, and how local Memories carry context between chats.
keywords: [Codex AGENTS.md, AGENTS.override.md, Codex memories, project instructions, persistent context, project_doc_max_bytes, Codex customization, CODEX_HOME, codex init, codex import]
---

# AGENTS.md & Memories

Every Codex session starts without knowledge of your build commands, conventions, or past decisions. Codex closes that gap in two ways. `AGENTS.md` files are instructions you write once and Codex reads before doing any work, layered from a global file down to the directory you are working in. Memories are an optional, machine-local recall layer that Codex generates itself from earlier chats. This page covers where each lives, how they load, and what belongs in them.

## What is AGENTS.md?

`AGENTS.md` is a plain Markdown file that gives Codex durable guidance. It is the same open convention used by other coding agents (see [agents.md](https://agents.md)), so a single file can serve several tools. Codex reads the instruction chain at startup (once per `codex exec` run, and once per launched TUI session) and places it in the prompt before your first message.

Think of it as onboarding documentation written for the agent rather than for a new hire: build and test commands, review expectations, repository conventions, and directory-specific rules.

## All instruction files in Codex

| File | Location | Scope | Committed to git? | Written by |
|------|----------|-------|-------------------|------------|
| **Global AGENTS.md** | `~/.codex/AGENTS.md` (or `$CODEX_HOME/AGENTS.md`) | You, across all repositories | N/A | You |
| **Global override** | `~/.codex/AGENTS.override.md` | You, temporarily replaces the global file | N/A | You |
| **Project AGENTS.md** | `<repo>/AGENTS.md` | Team (everyone on the project) | Yes | You (or `/init`) |
| **Nested AGENTS.md** | `<repo>/services/payments/AGENTS.md` | Team, that directory and below | Yes | You |
| **Nested override** | `<repo>/services/payments/AGENTS.override.md` | Replaces the `AGENTS.md` in the same directory | Usually not | You |
| **Fallback filenames** | Any name listed in `project_doc_fallback_filenames` | Same as `AGENTS.md` at that level | Yes | You |
| **Memories** | `~/.codex/memories/` | You, this machine | No | Codex |

Two configuration keys also inject instructions without an `AGENTS.md` file. `developer_instructions` adds extra instructions before the `AGENTS.md` chain, and `model_instructions_file` replaces Codex's built-in base instructions entirely. Both live in `config.toml` and are meant for advanced setups; for day-to-day guidance use `AGENTS.md`.

## How Codex discovers instructions

Codex builds one instruction chain per run, in this order:

1. **Global scope.** In your Codex home directory (`~/.codex` unless `CODEX_HOME` is set), Codex reads `AGENTS.override.md` if it exists. Otherwise it reads `AGENTS.md`. Only the first non-empty file at this level is used.
2. **Project scope.** Starting at the project root (normally the Git root, configurable with `project_root_markers`), Codex walks **down** to your current working directory. In each directory along that path it checks for `AGENTS.override.md`, then `AGENTS.md`, then any names in `project_doc_fallback_filenames`. At most one file per directory is included.
3. **Merge order.** Files are concatenated from the root down, separated by blank lines. Files closer to your working directory appear later in the prompt, so their guidance overrides earlier files when rules conflict.

If Codex cannot find a project root, it checks only the current directory. Empty files are skipped. Codex stops adding files once the combined size reaches `project_doc_max_bytes` (32 KiB by default).

:::warning
Codex walks from the root **down to the directory you started in** and stops there. It does not lazily load `AGENTS.md` files from subdirectories below your working directory when it touches files there. If you start Codex at the repo root, a file in `services/payments/AGENTS.md` is never loaded. Start Codex closer to the work (`codex --cd services/payments`) or keep the rules you need in the root file.
:::

### Practical example

```text
~/.codex/AGENTS.md                        # "Prefer pnpm. Ask before adding dependencies."
repo/AGENTS.md                            # "Run npm run lint before opening a PR."
repo/services/payments/AGENTS.md          # Ignored: an override exists in this directory
repo/services/payments/AGENTS.override.md # "Use make test-payments instead of npm test."
```

Running `codex --cd services/payments` loads the global file first, the repository root second, and the payments override last. The override wins for the test command because it appears last in the combined prompt.

## Global guidance

Use the global file for how Codex should communicate with you and for defaults you want in every repository. Keep team and codebase rules in the repository so they travel with the code.

```markdown
# ~/.codex/AGENTS.md

## Working agreements

- Always run `npm test` after modifying JavaScript files.
- Prefer `pnpm` when installing dependencies.
- Ask for confirmation before adding new production dependencies.
```

The desktop app's "custom instructions" (under **Settings > Personalization**) are stored in this same global `AGENTS.md`, so the CLI, IDE extension, and desktop app share one file.

Use `~/.codex/AGENTS.override.md` when you need a temporary global override without deleting the base file. Delete the override to restore the shared guidance.

## Project instructions

Add an `AGENTS.md` at the repository root for setup and conventions everyone should follow:

```markdown
# AGENTS.md

## Repository expectations

- Run `npm run lint` before opening a pull request.
- Document public utilities in `docs/` when you change behavior.
```

### Monorepo strategy

Split guidance by directory and place each rule as close as possible to the code it governs:

```text
repo/
├── AGENTS.md                    # Shared: formatting, git workflow, CI commands
└── services/
    ├── payments/
    │   └── AGENTS.override.md   # Payments-only test and security rules
    └── search/
        └── AGENTS.md            # Search service conventions
```

Because Codex loads the chain from the root down to your working directory, the root file applies everywhere while service files load only when you start Codex inside (or below) that service. Nested files also keep you under the 32 KiB cap: a large monolithic root file is truncated, whereas several small nested files each load in full.

### Code review rules

Codex code review in GitHub reads a `## Code Review Rules` section from the `AGENTS.md` closest to the code under review. Put repository-wide checks at the root and service-specific checks in nested files:

```markdown
## Code Review Rules

### Experiment cohorts

- Do not filter treatment comparisons on post-exposure behavior, including conversion or retention.
  Safe path: build cohorts from assignment or exposure; report conversion as an outcome.
```

Keep review rules short, explain the behavior to flag and the safe alternative, and leave formatting and lint checks to CI.

## Size limits and fallback filenames

Both discovery knobs live in `~/.codex/config.toml`:

```toml
# ~/.codex/config.toml
project_doc_max_bytes = 65536
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```

| Key | Default | What it does |
|-----|---------|--------------|
| `project_doc_max_bytes` | 32 KiB | Combined byte limit for the instruction chain. Codex stops adding files once the limit is reached. |
| `project_doc_fallback_filenames` | none | Extra filenames to treat as instruction files when a directory has no `AGENTS.override.md` or `AGENTS.md`. |
| `project_root_markers` | `[".git"]` | Filenames that mark the project root when Codex walks upward. Set to `[]` to treat the current directory as the root. |

With the fallback list above, each directory is checked in this order: `AGENTS.override.md`, `AGENTS.md`, `TEAM_GUIDE.md`, `.agents.md`. Names not on the list are ignored. Restart Codex after changing the configuration.

## What to put in AGENTS.md

Start with only the instructions that matter, and treat the file as a feedback loop: when Codex makes a wrong assumption about your codebase, correct it and ask Codex to update `AGENTS.md` so the fix persists.

**Effective content:**

```markdown
# AGENTS.md

## Commands
- Tests: npm test
- Lint: npm run lint
- Type check: npm run typecheck

## Conventions
- Use TypeScript strict mode, never use `any`
- All API endpoints must validate input with Zod
- Database migrations are in src/db/migrations/, never modify existing ones

## Routing
- Start in src/domain/ for business logic; ignore legacy/ unless asked
```

**When to add a rule:**

- **Repeated mistakes**: Codex makes the same wrong call twice.
- **Too much reading**: Codex finds the right files but reads far more than needed. Add routing guidance about which directories to prioritize.
- **Recurring PR feedback**: you leave the same review comment more than once.
- **From GitHub**: in a pull request comment, tag `@codex add this to AGENTS.md` to delegate the update to a cloud chat.

**What to avoid:**

- Restating what Codex can read from `package.json`, the lockfile, or the code itself
- Long documents that bury the important rules and push you toward the 32 KiB cap
- Vague guidance the agent cannot act on

### Use constraints, not aspirations

**Weak:**
```text
Write high-quality, maintainable code and follow best practices.
```

**Strong:**
```text
Keep functions under 30 lines. Extract helpers for repeated logic.
Never build SQL with string concatenation; use the query builder in src/db/query.ts.
Run `npm run typecheck` before reporting a task as done.
```

Pair `AGENTS.md` with tooling that enforces the same rules (pre-commit hooks, linters, type checkers). Instructions steer the agent; tooling catches what slips through. See [Hooks](./hooks.md) for Codex lifecycle hooks that run deterministically.

## Generating AGENTS.md with /init

Run `/init` inside an interactive session to generate an `AGENTS.md` scaffold in the current directory. Review and edit the result before committing it; the scaffold is a starting point, not a finished document. `/init` is also available in the IDE extension.

## Verifying what loaded

- `codex --ask-for-approval never "Summarize the current instructions."` from the repository root. Codex should echo global and project guidance in precedence order.
- `codex --cd subdir --ask-for-approval never "Show which instruction files are active."` to confirm a nested override replaced broader rules.
- `codex debug prompt-input` prints the exact model-visible prompt input as JSON, which is the most direct way to see the merged chain.
- `codex -c log_dir=./.codex-log` enables the plaintext TUI log at `./.codex-log/codex-tui.log`, which records instruction discovery.

There is no cache to clear. Codex rebuilds the chain on every run and at the start of every TUI session, so restarting Codex in the target directory picks up edits.

### Troubleshooting discovery

| Symptom | Check |
|---------|-------|
| Nothing loads | Confirm you are in the intended repository (`/status` in the TUI shows the writable roots) and that the files are not empty. |
| Wrong guidance appears | Look for an `AGENTS.override.md` higher in the tree or in your Codex home; rename or remove it. |
| Fallback names ignored | Verify the spelling in `project_doc_fallback_filenames`, then restart Codex. |
| Instructions truncated | Raise `project_doc_max_bytes` or split the file across nested directories. |
| Edits have no effect | Run `echo $CODEX_HOME`. A non-default value points Codex at a different home directory. |

## Memories

Memories let Codex carry useful context from earlier chats into future ones: stable preferences, recurring workflows, and project context you would otherwise repeat. They are a recall layer, not a rule system. Anything that must always apply belongs in `AGENTS.md` or checked-in documentation.

### How local memories work

- Memories are **off by default**. Enable them with `[features] memories = true` in `config.toml` (or **Settings > Personalization > Enable memories** in the desktop app).
- After a chat has been idle long enough, Codex extracts useful context from it in the background. Active and short-lived sessions are skipped, so memories may not update immediately when a chat ends.
- Codex redacts secrets from generated memory fields, but you should still review the files before sharing your Codex home directory.
- Memory generation is skipped when your remaining Codex rate limit is below a configurable threshold, so it does not spend quota when you are near a limit.

ChatGPT on the web uses ChatGPT memory instead; the local memory store described here applies to Codex CLI, the IDE extension, and the desktop app.

### Where memories are stored

```text
~/.codex/memories/    # Summaries, durable entries, recent inputs, and supporting evidence
```

Treat these files as generated state. Inspect them when troubleshooting, but do not rely on hand-editing them as your primary control. Use `/memories` and the configuration keys below instead.

### Controlling memories

| Control | What it does |
|---------|--------------|
| `/memories` (CLI, IDE, desktop app) | Choose whether the **current chat** may use existing memories and whether it may become an input for future memories. Chat-level choices do not change global settings. |
| `[features] memories = true` | Turn the feature on globally. |
| `memories.use_memories` | `false` stops Codex from injecting existing memories into new sessions (default `true`). |
| `memories.generate_memories` | `false` stops new chats from becoming memory-generation inputs (default `true`). |
| `memories.disable_on_external_context` | `true` excludes chats that used MCP tools, web search, or tool search from memory generation (default `false`). The older `memories.no_memories_if_mcp_or_web_search` key is accepted as an alias. |
| `memories.min_rate_limit_remaining_percent` | Minimum remaining rate-limit percentage before generation runs (default `25`). |
| `memories.min_rollout_idle_hours` | How long a chat must be idle before it is considered (default `6`, range 1 to 48). |
| `memories.max_rollout_age_days` | Maximum chat age considered for generation (default `30`, max 90). |
| `memories.max_rollouts_per_startup` | Chats processed per startup pass (default `16`, max 128). |
| `memories.max_raw_memories_for_consolidation` | Recent raw memories kept for global consolidation (default `256`, max 4096). |
| `memories.max_unused_days` | Days since last use before a memory drops out of consolidation (default `30`). |
| `memories.extract_model` / `memories.consolidation_model` | Override the models used for per-chat extraction and global consolidation. |

```toml
# ~/.codex/config.toml
[features]
memories = true

[memories]
disable_on_external_context = true
min_rate_limit_remaining_percent = 40
```

## Importing from Claude Code or Cursor

If you already have a Claude Code or Cursor setup, run `/import` in a local CLI session, choose the source agent, and select which items to bring over. Codex leaves the original setup untouched.

| Imported item | Destination in Codex |
|---------------|----------------------|
| Instruction files (such as `CLAUDE.md`) | `AGENTS.md` |
| `settings.json` | `config.toml` |
| Skills and slash commands | Skills |
| Plugins | Plugins |
| MCP server configuration | Codex MCP configuration |
| Hooks | Codex hooks |
| Subagents | Codex subagents |
| Project memories from Claude Code | Memories |
| Chats from the last 30 days (up to 50) | Local chats |

`/import` is unavailable while a task is running, in remote sessions, and while connected to a local app-server daemon. After importing, review tool restrictions in imported skills and agents, MCP servers with custom authentication (you may need to sign in again), hooks whose behavior may differ, and prompt templates that relied on arguments or shell interpolation. The desktop app offers the same flow under **Settings > Import**, and can additionally import from Claude Cowork and keep imported work in sync.

## Sharing instructions across tools

Because `AGENTS.md` is an open convention, the simplest cross-tool setup is to make it the canonical file and point other tools at it. Claude Code reads `CLAUDE.md`, so a one-line import keeps both in sync:

```markdown
@AGENTS.md
```

See [Claude Code Memory](../claude-code/memory.md) for the import syntax. Cursor also reads `AGENTS.md` natively, so the same root file can serve all three tools; see the [Cursor overview](../tools/cursor.md).

## Managed configuration

Codex does not document an organization-wide `AGENTS.md` that admins deploy to every machine. What is documented for managed environments is configuration: a system-level `/etc/codex/config.toml`, cloud-managed `config.toml` defaults delivered to a signed-in workspace, and an enforced `requirements.toml` that constrains approval policies, sandbox modes, and similar settings. Since `developer_instructions` and `model_instructions_file` are `config.toml` keys, they are the closest documented route to centrally supplied instructions. See [Managed configuration](https://learn.chatgpt.com/docs/enterprise/managed-configuration) and [CLI Flags & Configuration](./flags.md) for the precedence order.

## Compared with Claude Code

| Topic | Codex | Claude Code |
|-------|-------|-------------|
| Project file | `AGENTS.md` (plus `AGENTS.override.md` and configurable fallbacks) | `CLAUDE.md` (imports `AGENTS.md` with `@AGENTS.md`) |
| User file | `~/.codex/AGENTS.md` | `~/.claude/CLAUDE.md` |
| Personal, uncommitted project notes | No documented equivalent of `CLAUDE.local.md`; use a gitignored `AGENTS.override.md` | `CLAUDE.local.md` (auto-gitignored) |
| Nested files | Loaded from the root down to your **working directory** only | Ancestors at startup, descendants lazily when files are touched |
| Path-scoped rules | Not documented for `AGENTS.md`; place rules in the nearest directory instead | `.claude/rules/*.md` with `paths:` frontmatter |
| Size limit | `project_doc_max_bytes`, 32 KiB combined by default | Up to 4 MiB per file; auto memory index capped at 200 lines / 25 KB |
| Agent-written memory | Memories, off by default, under `~/.codex/memories/` | Auto memory, on by default, under `~/.claude/projects/<project>/memory/` |
| Import from other tools | `/import` (Claude Code, Cursor) | `/import` (Codex, Gemini CLI) and `/init` |

See [Claude Code Memory](../claude-code/memory.md) for the full Claude Code picture.
