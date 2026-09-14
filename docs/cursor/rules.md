---
sidebar_position: 2
sidebar_label: Rules & AGENTS.md
description: How Cursor's rules, AGENTS.md, user rules, and team rules give Agent persistent project context, and which mechanism to use for which job.
keywords: [Cursor rules, AGENTS.md, .cursor/rules, mdc files, alwaysApply, globs, user rules, team rules, .cursorrules, persistent context]
---

# Rules & AGENTS.md

Language models keep no memory between requests. Every new Agent conversation in Cursor starts from zero unless you give it durable instructions. Rules are Cursor's mechanism for that: Markdown files (and dashboard-managed text) that Cursor inserts at the start of the model context so Agent follows your conventions, commands, and guardrails without being told each time.

Cursor has four rule types and two ways to write them on disk. This page covers all of them, how they load, and what belongs in each.

## All persistent-instruction mechanisms in Cursor

| Mechanism | Location | Scope | Committed to git? | Managed by |
|-----------|----------|-------|-------------------|------------|
| **Team Rules** | Cursor dashboard (Team and Enterprise plans) | Everyone in the team, all repositories | N/A (stored on Cursor servers) | Team admins |
| **Project Rules** | `.cursor/rules/*.mdc` | Everyone working in the repo | Yes | You |
| **AGENTS.md** | `./AGENTS.md` and any subdirectory | Everyone working in the repo (nested files scope to their directory) | Yes | You |
| **CLAUDE.md** | `./CLAUDE.md` | Everyone working in the repo, always applied | Yes | You |
| **User Rules** | Cursor Settings > Rules (Customize > Rules) | You, all projects, synced with your account | N/A | You |
| **User rule files** | `~/.cursor/rules` (`%USERPROFILE%\.cursor\rules` on Windows) | You, all projects, this machine only (no sync) | N/A | You |
| **Legacy `.cursorrules`** | `./.cursorrules` | Everyone working in the repo | Yes | You (deprecated) |

Rules apply to Agent (Chat) only. They do not affect Tab completion, Inline Edit (`Cmd+K`), or Bugbot PR reviews. Within Agent they apply in every mode: Agent, Ask, Plan, and Debug.

## Project rules (`.cursor/rules/`)

Project rules are `.mdc` files in `.cursor/rules/`. Each file is Markdown with a YAML frontmatter block that controls when the rule is included. The extension matters: a plain `.md` file in `.cursor/rules/` is ignored because it has no frontmatter. If you want plain Markdown, use `AGENTS.md` instead.

```text
.cursor/rules/
  react-patterns.mdc       # Recognized as a project rule
  api-guidelines.md        # Ignored (wrong extension)
  frontend/                # Subfolders work, but a flat layout is simpler
    components.mdc
```

Cursor identifies rules by their full path, so two files with the same name in different folders both apply if their conditions match. There is no override by filename.

### Frontmatter fields and rule types

Three frontmatter fields decide when a rule is loaded:

| Field | Type | Meaning |
|-------|------|---------|
| `alwaysApply` | boolean | `true` includes the rule in every conversation and ignores the other two fields |
| `globs` | string | Comma-separated file patterns; the rule attaches when a matching file is in context |
| `description` | string | Shown to Agent so it can decide whether to pull the rule in |

The rule editor exposes these as four rule types. Under the hood they are just combinations of the fields:

| Rule type (editor label) | `alwaysApply` | `description` | `globs` | Behavior |
|--------------------------|---------------|---------------|---------|----------|
| **Always Apply** | `true` | ignored | ignored | Included in every chat session |
| **Apply to Specific Files** | `false` | optional | provided | Auto-attached when a matching file is in context |
| **Apply Intelligently** | `false` | provided | omitted | Agent reads the description and pulls the rule in when relevant |
| **Apply Manually** | `false` | omitted | omitted | Included only when you `@`-mention the rule in chat |

Older Cursor documentation and community material call these Always, Auto Attached, Agent Requested, and Manual. The behavior is the same.

**Always applied:**

```markdown
---
alwaysApply: true
---

- All source files must include the company copyright header
- Never modify generated files in the `dist/` or `build/` directories
- When unsure about implementation details, read the relevant source files before proposing changes
```

**Auto-attached by file pattern:**

```markdown
---
globs: src/components/**/*.tsx
alwaysApply: false
---

- Use named exports, not default exports
- Co-locate styles in a module CSS file next to the component
- Keep components under 200 lines; extract subcomponents into the same directory
```

**Agent-selected based on description:**

```markdown
---
description: RPC service conventions and patterns for the backend
alwaysApply: false
---

- Define each service in its own file under `src/services/`
- Validate inputs at the service boundary before passing data to internal functions
- Return structured error objects with `code` and `message`, never throw raw strings
```

**Manual (only via `@`-mention):**

```markdown
---
alwaysApply: false
---

- Every database migration must have both `up` and `down` functions
- Never alter a column type in place. Add a new column, backfill, then drop the old one in a separate migration

@migration-template.sql
```

### Glob patterns

Separate multiple patterns with commas.

| Pattern | Matches |
|---------|---------|
| `*.ts` | All `.ts` files in the root |
| `**/*.ts` | All `.ts` files in any directory |
| `src/**` | Everything under `src/` |
| `src/**/*.tsx` | All `.tsx` files anywhere under `src/` |
| `docs/**/*.md, docs/**/*.mdx` | `.md` and `.mdx` files under `docs/` |
| `tailwind.config.*` | `tailwind.config` with any extension |

### Referencing files from a rule

Write `@path/to/file` on its own line inside the rule body to include that file's contents in context when the rule loads. This is the recommended way to ship templates and canonical examples: the rule stays short and does not go stale when the referenced code changes.

## AGENTS.md

`AGENTS.md` is a plain Markdown file with no frontmatter. Put it in the project root and Cursor picks it up automatically. It is the right choice when you want readable instructions without per-file scoping, and it is the shared format that other coding agents read too.

```markdown
# Project Instructions

## Code Style
- Use TypeScript for all new files
- Prefer functional components in React
- Use snake_case for database columns

## Architecture
- Follow the repository pattern
- Keep business logic in service layers
```

### Nested AGENTS.md

Cursor supports `AGENTS.md` in subdirectories. A nested file applies when Agent works with files in that directory or its children. Instructions are combined with parent files, and the more specific file takes precedence on conflicts.

```text
project/
  AGENTS.md              # Global instructions
  frontend/
    AGENTS.md            # Frontend-specific instructions
    components/
      AGENTS.md          # Component-specific instructions
  backend/
    AGENTS.md            # Backend-specific instructions
```

### CLAUDE.md

Cursor reads `CLAUDE.md` in the project root the same way it reads `AGENTS.md`. One difference: `CLAUDE.md` is always applied to every conversation regardless of any `alwaysApply` frontmatter. If you need conditional rules, use `.cursor/rules/`. The CLI also reads both `AGENTS.md` and `CLAUDE.md` at the project root and applies them alongside `.cursor/rules`.

## User Rules

User Rules are global preferences that apply in every project. Set them in **Customize > Rules** (also reachable through Cursor Settings). They are stored on your Cursor account and sync when you sign in on another machine. Use them for communication style and personal conventions, not project facts:

```text
Reply in a concise style. Avoid unnecessary repetition or filler language.
Prefer table-driven tests. Explain reasoning before proposing large changes.
```

Cursor also loads user rule files from `~/.cursor/rules` on the local machine. Unlike account-level User Rules, these do not sync between devices. Neither User Rules nor Team Rules are included in profile exports.

User Rules are used by Agent (Chat) only. They are not applied to Inline Edit (`Cmd+K`).

## Team Rules

Team and Enterprise plans can define rules for the whole organization from the [Cursor dashboard](https://cursor.com/dashboard/team-content). Team Rules are free-form text (no `.mdc` folder structure) and sync automatically to every member across all repositories.

| Option | Effect |
|--------|--------|
| **Enable this rule immediately** | Active on creation; unchecked saves it as a draft |
| **Enforce this rule** | Required for all members; cannot be turned off in Customize |
| **Glob pattern** (for example `**/*.py`) | Rule applies only when matching files are in context; without a glob it applies to every conversation |

Non-enforced Team Rules are on by default but members can disable them under **Team Rules** in Customize. Enforced rules are sometimes used for internal compliance workflows; treat them as guidance for the model, not as a security control.

## Legacy `.cursorrules`

A `.cursorrules` file in the project root still works but is deprecated. To migrate:

1. Create a new rule (command palette, **New Cursor Rule**)
2. Copy the `.cursorrules` content into it
3. Set the type to **Always Apply** (matches the old behavior)
4. Delete `.cursorrules`

If you want the simplest possible replacement, moving the content into `AGENTS.md` also works.

## Memories

Cursor's current documentation does not describe an automatic, tool-written memory store comparable to Claude Code's auto memory. Everything Agent knows between sessions comes from the rule mechanisms on this page plus what you attach explicitly. Two features cover part of the gap:

- **Conversation search as an agent tool**: Agent can query your past conversations on its own when it needs context from something discussed earlier.
- **`@Chats`** and side chats let you pull a previous conversation into the current one by hand.

If you want Agent to "remember" a decision, write it into a rule or `AGENTS.md`. You can ask Agent to do that for you: "Add a rule that all API handlers must validate input with Zod."

## Loading and precedence

Rules are included at the start of the model context. All applicable rules are merged; when guidance conflicts, earlier sources win:

1. **Team Rules** (dashboard; enforced or enabled)
2. **Project Rules** (`.cursor/rules/*.mdc`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`)
3. **User Rules** (account settings and `~/.cursor/rules`)

Within project rules, which files load depends on rule type:

- `alwaysApply: true` rules, `CLAUDE.md`, and the root `AGENTS.md` load in every conversation
- `globs` rules attach when a matching file is in context
- `description` rules are offered to Agent, which decides whether to fetch them (Agent has a **Fetch Rules** tool for exactly this)
- Manual rules load only when `@`-mentioned
- Nested `AGENTS.md` files load when Agent works in their directory, with the most specific file taking precedence

Check what actually landed in a conversation by clicking the context ring next to the prompt input. The breakdown tray shows a **Rules** category with the token cost of project and user rules in the current prompt.

## Creating rules

| Method | How |
|--------|-----|
| `/create-rule` in chat | Type `/create-rule` in Agent and describe the rule. Agent writes the `.mdc` file with correct frontmatter into `.cursor/rules/` |
| Command palette | `Cmd+Shift+P` (`Ctrl+Shift+P`), search **New Cursor Rule**, name the file, pick the type from the dropdown |
| Customize sidebar | **Customize > Rules > Add Rule**. This view also lists every rule and whether it is active |
| Ask Agent | "Create a rule that..." works in any conversation |
| Cursor CLI | `agent generate-rule` (alias `agent rule`) walks through prompts and writes the file |
| Remote rule (GitHub) | **Add Rule > Remote Rule (Github)**, paste a repo URL. Cursor scans for `.mdc` files and syncs them into `.cursor/rules/imported/<repoName>/`, preserving relative paths |

:::note
Older Cursor versions offered a `/Generate Cursor Rules` chat command. The current documentation lists `/create-rule` and the **New Cursor Rule** palette command instead.
:::

You can also tag `@cursor` on a GitHub issue or pull request and ask it to update a rule when Agent made a mistake.

## What to put in rules

Good rules are focused, actionable, and scoped. Cursor's own guidance: keep each rule under 500 lines, split large rules into composable files, reference files instead of pasting their contents, and write rules the way you would write clear internal docs.

**Effective content:**

```markdown
---
alwaysApply: true
---

# Commands
- Tests: npm test
- Lint: npm run lint
- Type check: npm run typecheck

# Conventions
- TypeScript strict mode, never `any`
- All API endpoints validate input with Zod schemas
- Migrations live in src/db/migrations/; never edit an existing one

# Architecture
- Business logic in src/domain/, never import from src/infrastructure/ there
- Use Result<T, E> for error handling, do not throw
```

**What to avoid:**

- **Copying an entire style guide.** Use a linter. Agent already knows common conventions.
- **Documenting every command.** Agent knows npm, git, pytest, and the like. Document only project-specific ones.
- **Edge cases that rarely apply.** Keep rules to patterns you hit often.
- **Duplicating what the code already shows.** Point to a canonical example file with `@` instead.
- **Vague guidance.** "Write clean code" gives the model nothing to act on.

Start small. Add a rule when you notice Agent making the same mistake more than once, and update the rule when it makes a new one.

### Constraints, not aspirations

**Weak:**

```text
Write high-quality, maintainable, well-tested code.
```

**Strong:**

```text
Keep functions under 30 lines. Extract helpers for repeated logic.
Never build SQL with string concatenation; use the query builder in src/db/query.ts.
Every new endpoint gets a test in tests/api/ that covers the 400 and 404 paths.
```

### Pick the right type

| Situation | Use |
|-----------|-----|
| Build commands, repo-wide conventions | `AGENTS.md` or an **Always Apply** rule |
| Rules for one part of the codebase (`src/api/**`, `*.tsx`) | **Apply to Specific Files** with `globs` |
| Knowledge Agent should reach for only when relevant (a migration playbook, a release checklist) | **Apply Intelligently** with a clear `description` |
| Templates you invoke on demand | **Apply Manually**, then `@rule-name` in chat |
| Personal tone and style | User Rules |
| Organization-wide standards | Team Rules (enforced if they must not be disabled) |

:::tip
"Apply Intelligently" rules that are really reusable workflows are often better as [Skills](./skills.md). Cursor ships `/migrate-to-skills`, which converts dynamic rules (`alwaysApply: false`, no `globs`) and legacy slash commands into skills.
:::

## Monorepo strategy

Use nested `AGENTS.md` files or `globs`-scoped rules so package-specific guidance loads only when Agent works in that package:

```text
repo/
├── AGENTS.md                        # Shared: git workflow, CI, formatting
├── .cursor/rules/
│   ├── frontend.mdc                 # globs: packages/frontend/**
│   └── backend.mdc                  # globs: packages/backend/**
├── packages/
│   ├── frontend/
│   │   └── AGENTS.md                # React/TypeScript conventions
│   └── backend/
│       └── AGENTS.md                # Go conventions, API patterns
```

Both approaches work; nested `AGENTS.md` is easier to read and is picked up by other agents, while `globs` rules give you finer file-type control (for example `**/*.test.ts` across every package). Use `.cursorignore` to keep irrelevant packages out of context entirely; see [Managing Context](./context.md).

## Sharing conventions across tools

If your team uses several AI coding tools, keep one canonical instruction file and point the others at it. `AGENTS.md` is the natural choice because Cursor, Codex, and others read it natively, and Claude Code can import it:

| Tool | Reads natively | Bridge |
|------|----------------|--------|
| Cursor | `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*.mdc` | none needed |
| Claude Code | `CLAUDE.md` | `CLAUDE.md` containing `@AGENTS.md`, or a symlink |
| OpenAI Codex | `AGENTS.md` | none needed |
| GitHub Copilot | `.github/copilot-instructions.md` | reference `AGENTS.md` from it |

Put Cursor-only behavior (globs-scoped rules, manual template rules) in `.cursor/rules/` and keep `AGENTS.md` tool-neutral.

## Troubleshooting

**A rule is not applied.** Check the type. An **Apply Intelligently** rule needs a `description`. An **Apply to Specific Files** rule needs a `globs` pattern that matches a file currently in context. A `.md` file in `.cursor/rules/` is ignored; rename it to `.mdc`.

**Rules seem ignored in Tab or Inline Edit.** Expected. Rules apply to Agent only.

**A rule from another folder with the same name interferes.** Rules are identified by full path and all matching rules apply. Rename or tighten the `globs`.

## Compared with Claude Code

| Topic | Cursor | Claude Code |
|-------|--------|-------------|
| Primary project file | `AGENTS.md` (plain) or `.cursor/rules/*.mdc` (frontmatter) | `CLAUDE.md`, with `@file` imports |
| Path-scoped rules | `globs:` in `.mdc` frontmatter | `paths:` in `.claude/rules/*.md` frontmatter |
| Model-selected rules | **Apply Intelligently** via `description` | No direct equivalent; skills fill this role |
| Personal, uncommitted project notes | No `AGENTS.local.md` equivalent; use User Rules | `CLAUDE.local.md` |
| Org-wide rules | Team Rules in the dashboard, optionally enforced | Managed policy `CLAUDE.md` |
| Auto memory written by the tool | Not documented | `~/.claude/projects/<project>/memory/` |
| Precedence on conflict | Team > Project > User | Later, more specific files win (project over user) |

See [Claude Code Memory](../claude-code/memory.md) for the Claude Code side, and the [Cursor overview](../tools/cursor.md) for a general introduction to the tool.
