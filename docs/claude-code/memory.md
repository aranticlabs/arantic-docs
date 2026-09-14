---
sidebar_position: 2
sidebar_label: Memory
description: Learn how Claude Code's memory files provide persistent context across sessions, eliminating the need to repeat project conventions every time.
keywords:
  [
    Claude Code memory,
    CLAUDE.md,
    persistent context,
    memory files,
    AI context,
    project conventions,
    session memory,
    agentic coding,
  ]
---

# Memory

When you use an AI coding tool, every new session starts with a blank slate. The model has no recollection of your project's conventions, past decisions, or the patterns your team follows. Memory solves this problem by giving agentic coding tools persistent context that carries over between sessions.

## What is memory?

Memory in agentic coding refers to structured files that provide an AI assistant with persistent context. Instead of repeating the same instructions every time you start a new conversation, you write them down once in a memory file, and the tool loads them automatically.

Think of it as onboarding documentation, but written for your AI assistant instead of a new team member.

## All memory files in Claude Code

Claude Code uses several memory files at different scopes. Here is the complete picture:

| File                   | Location                                                                   | Scope                             | Committed to git?    | Written by |
| ---------------------- | -------------------------------------------------------------------------- | --------------------------------- | -------------------- | ---------- |
| **Managed policy**     | `/etc/claude-code/CLAUDE.md` (Linux)                                       | Organization-wide                 | N/A (deployed by IT) | Admins     |
| **User CLAUDE.md**     | `~/.claude/CLAUDE.md`                                                      | You, across all projects          | N/A                  | You        |
| **User rules**         | `~/.claude/rules/*.md`                                                     | You, across all projects          | N/A                  | You        |
| **Project CLAUDE.md**  | `./CLAUDE.md` or `./.claude/CLAUDE.md`                                     | Team (everyone on the project)    | Yes                  | You        |
| **Project rules**      | `./.claude/rules/*.md`                                                     | Team (everyone on the project)    | Yes                  | You        |
| **Local CLAUDE.md**    | `./CLAUDE.local.md`                                                        | You, this project only            | No (auto-gitignored) | You        |
| **Auto memory**        | `~/.claude/projects/<project>/memory/MEMORY.md`                            | You, this project (machine-local) | No                   | Claude     |
| **Auto memory topics** | `~/.claude/projects/<project>/memory/*.md`                                 | You, this project (machine-local) | No                   | Claude     |
| **Subagent memory**    | Separate per-subagent directory (enabled with the subagent `memory` field) | Per subagent                      | No                   | Claude     |

### Project CLAUDE.md

The main memory file for your project. Lives at the repository root as `CLAUDE.md` (or inside `.claude/CLAUDE.md`). Committed to git and shared with the whole team. This is where coding standards, build commands, architecture decisions, and guardrails go.

A well-structured CLAUDE.md is the single most impactful way to improve Claude Code's output, but bigger is not better. **Target under 200 lines per CLAUDE.md file.** Longer files consume more context and reduce how consistently Claude follows them. If your instructions are growing large, split them using imports or `.claude/rules/` files.

:::tip
Block-level HTML comments (`<!-- like this -->`) in CLAUDE.md files are stripped before the content is injected into Claude's context. Use them to leave notes for human maintainers without spending context tokens. Comments inside code blocks are preserved.
:::

Focus on what matters most:

- Build and test commands
- Non-obvious coding conventions
- Files and directories that should not be modified
- Architecture decisions that affect every task

Leave out anything Claude can figure out by reading the code itself (language, framework, obvious patterns).

```markdown
# CLAUDE.md

## Commands

- Tests: npm test
- Lint: npm run lint
- Type check: npm run typecheck

## Conventions

- Use TypeScript strict mode, never use `any`
- All API endpoints must validate input with Zod
- Database migrations are in src/db/migrations/, never modify existing ones
```

#### Monorepo strategy

In monorepos, use multiple CLAUDE.md files instead of one large root file:

```text
repo/
├── CLAUDE.md              # Shared conventions (formatting, git workflow, CI)
├── packages/
│   ├── frontend/
│   │   └── CLAUDE.md      # React/TypeScript rules, component patterns
│   └── backend/
│       └── CLAUDE.md      # Go conventions, API patterns, database rules
```

Claude Code loads these hierarchically:

- **Ancestor loading**: walks upward from the working directory at startup, always loading parent CLAUDE.md files
- **Descendant loading**: lazy-loads subdirectory CLAUDE.md files when files in those directories are accessed

This means the root file's rules apply everywhere, while component-specific rules only load when relevant, saving context.

### User CLAUDE.md

Your personal preferences that apply to every project. Lives at `~/.claude/CLAUDE.md`. Not tied to any repository.

Use this for things like:

```markdown
# ~/.claude/CLAUDE.md

- I prefer functional programming patterns over class-based OOP
- Always explain your reasoning before making changes
- Use British English in comments and documentation
- When writing tests, prefer table-driven test patterns
```

### AGENTS.md

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them:

```markdown
@AGENTS.md

## Claude Code

Use plan mode for changes under `src/billing/`.
```

A symlink also works if you don't need Claude-specific additions:

```bash
ln -s AGENTS.md CLAUDE.md
```

Running `/init` reads Cursor rules (`.cursor/rules/` or `.cursorrules`) and Copilot rules (`.github/copilot-instructions.md`) and incorporates the relevant parts into the generated `CLAUDE.md`. With `CLAUDE_CODE_NEW_INIT=1` set, `/init` also reads `AGENTS.md`, `.devin/rules/`, `.windsurf/rules/` (or `.windsurfrules`), and `.clinerules`.

You can also run `/import` (requires v2.1.213 or later) to bring another coding agent's configuration into Claude Code. It appends a one-time copy of instruction files such as `AGENTS.md` to the matching `CLAUDE.md` and carries over MCP servers, commands, subagents, and skills.

### CLAUDE.local.md

Personal, project-specific memory that is NOT committed to git. Lives at `./CLAUDE.local.md` in the project root. Claude Code auto-adds it to `.gitignore`.

This is for things that are specific to your local setup:

```markdown
# CLAUDE.local.md

- My local API runs at http://localhost:3000
- Use test database "dev_sarah" for integration tests
- Skip the deploy step, I do not have production credentials
```

### Importing files into CLAUDE.md

CLAUDE.md files can import additional files using `@path/to/file` syntax anywhere in the body. Imported files are loaded into context at session start alongside the CLAUDE.md that references them:

```markdown
# CLAUDE.md

See @README for project overview and @package.json for available npm commands.

# Additional Instructions

- git workflow @docs/git-instructions.md
```

Both relative and absolute paths work. Relative paths resolve from the file containing the import. Imported files can recursively import other files, up to a maximum depth of four hops.

Import parsing skips Markdown code spans and fenced code blocks. To mention a path without importing it, wrap it in backticks: `` `@README` `` stays literal, while `@README` outside backticks imports the file.

:::warning
An import in a project-level memory file is treated as external when its path resolves outside your working directory (for example, a `@~/`-home import). The first time Claude Code encounters external imports in a project, it shows a one-time approval dialog listing the files; if you decline, those imports stay disabled. User-scope files such as `~/.claude/CLAUDE.md` are trusted without the dialog (except in Cowork sessions on your desktop).
:::

Block-level HTML comments (`<!-- ... -->`) in CLAUDE.md files are stripped before the content is loaded into context. Use them to leave maintainer notes without consuming tokens. Comments inside code blocks are preserved.

### Rules directories

For more granular control, you can create topic-specific rule files:

- **Project rules**: `.claude/rules/*.md` (committed, shared with team)
- **User rules**: `~/.claude/rules/*.md` (personal, all projects)

Rules can optionally be scoped to specific file paths using frontmatter:

```markdown
# .claude/rules/api-design.md

---

paths:

- "src/api/\*_/_.ts"
- "api/\*_/_.{ts,tsx}"

---

# API rules

- All endpoints must include input validation
- Use standard error response format
- Return 201 for creation, 204 for deletion
```

Path-scoped rules only load when Claude works with files matching those patterns. This saves context for unrelated work.

### Auto memory

Claude Code can automatically save notes between sessions. This is stored locally (not in your repo) at:

```text
~/.claude/projects/<project>/memory/MEMORY.md
```

**How it works:**

- Enabled by default (toggle with `/memory` or set `"autoMemoryEnabled": false` in settings). Disable via environment variable: `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`
- As it works, Claude saves four kinds of notes and records the kind in a `type` frontmatter field:
  - `user`: your role, expertise, and working preferences
  - `feedback`: corrections you give Claude and approaches you confirm
  - `project`: ongoing work, deadlines, and decisions Claude can't derive from the code or git history
  - `reference`: where to find information outside the project, such as an issue tracker or dashboard
- Claude deliberately **skips anything it can derive from the codebase** (architecture, file paths, debugging fixes) and anything your CLAUDE.md files already say. It doesn't save something every session; it decides what would be useful in a future conversation.
- At session start, only the **first 200 lines or 25 KB** of `MEMORY.md` are loaded (whichever limit is reached first). Content beyond that threshold is still accessible if Claude reads the file on demand. (By contrast, Claude Code loads a `CLAUDE.md` file of up to 4 MiB in full and skips a larger one.)
- `MEMORY.md` is an index with one line per memory. Claude keeps it concise by moving each memory into its own topic file named after that memory.

To store auto memory in a custom location, set `autoMemoryDirectory` in your `settings.json`. It is read from any settings scope (user, project, local, policy, or `--settings`):

```json
{
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

The value must be an absolute path or start with `~/`. All worktrees and subdirectories within the same git repository share one auto memory directory. Auto memory is machine-local and not shared across cloud environments. You will see messages like "Saved 2 memories" or "Recalled 2 memories" in the interface when Claude updates or reads auto memory.

The auto memory directory contains a `MEMORY.md` index and one topic file per memory:

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md           # Index, one line per memory, loaded into every session
├── user_role.md        # One memory
└── feedback_testing.md # One memory
```

### Managed policy

For enterprise deployments, admins can place a `CLAUDE.md` at an OS-specific path:

| OS          | Path                                                |
| ----------- | --------------------------------------------------- |
| Linux / WSL | `/etc/claude-code/CLAUDE.md`                        |
| macOS       | `/Library/Application Support/ClaudeCode/CLAUDE.md` |
| Windows     | `C:\Program Files\ClaudeCode\CLAUDE.md`             |

This file cannot be excluded by users. It always loads first and is intended for organization-wide standards and security policies.

Alternatively, organizations can put managed CLAUDE.md content directly inside `managed-settings.json` using the `claudeMd` key, rather than deploying a separate file. This setting is only honored from managed or policy settings sources, not from user or project settings:

```json
{
  "claudeMd": "Always run `make lint` before committing.\nNever push directly to main."
}
```

## Loading order and precedence

Claude Code loads memory files at session start in this order (later entries take precedence when rules conflict):

1. **Managed policy CLAUDE.md** (cannot be excluded)
2. **User rules** (`~/.claude/rules/*.md`)
3. **User CLAUDE.md** (`~/.claude/CLAUDE.md`)
4. **Ancestor CLAUDE.md files** (walking up the directory tree from your working directory)
5. **Project CLAUDE.md** (`./CLAUDE.md` or `./.claude/CLAUDE.md`)
6. **Local CLAUDE.md** (`./CLAUDE.local.md`)
7. **Project rules** (`.claude/rules/*.md`, unconditional ones)
8. **Auto memory** (`~/.claude/projects/<project>/memory/MEMORY.md`, first 200 lines or 25 KB)

Path-scoped rules and subdirectory CLAUDE.md files load on demand when Claude works with matching files.

By default, CLAUDE.md files from directories added with `--add-dir` are **not** loaded. To load them, set the environment variable `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`:

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared-config
```

**Practical example:**

```text
~/.claude/CLAUDE.md              # "Use 4-space indents"
./CLAUDE.md                      # "Use 2-space indents" (overrides user preference)
./CLAUDE.local.md                # "Local API at http://localhost:3000"
```

The project instruction wins for indentation because it is more specific.

## Generating a CLAUDE.md with /init

Run `/init` in any project to generate a starter `CLAUDE.md` automatically. Claude analyzes your codebase and creates a file with build commands, test instructions, and project conventions it discovers. If a `CLAUDE.md` already exists, `/init` suggests improvements rather than overwriting it.

Set `CLAUDE_CODE_NEW_INIT=1` to enable an interactive multi-phase flow: `/init` asks which artifacts to set up (CLAUDE.md files, skills, and hooks), explores your codebase with a subagent, fills in gaps via follow-up questions, and presents a reviewable proposal before writing any files.

## The /memory command

Type `/memory` in Claude Code to:

- List your CLAUDE.md, CLAUDE.local.md, and rules file locations across user and project scopes (including user and project CLAUDE.md entries for files that don't exist yet)
- Toggle auto memory on or off
- Open the auto memory folder
- Select any memory file to open it in your editor for manual editing (selecting one that doesn't exist yet creates it first)

To check which files actually loaded into the current session, run `/context` and look under **Memory files**.

To save something to CLAUDE.md mid-session, you can also just ask Claude directly: "Add this to CLAUDE.md: always run tests before committing."

## Which file should I use?

With several memory files available, it helps to know which one fits your situation. The key questions are: **who writes it** (you or Claude) and **who should it apply to** (the team or just you)?

### You write it: CLAUDE.md and rules

These files contain instructions and constraints you define. Claude reads them but never modifies them.

| What you want                                                                   | Use this file                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Team coding standards, build commands, architecture rules                       | **Project CLAUDE.md** (`./CLAUDE.md`)                              |
| Rules that only apply to specific file paths                                    | **Project rules** (`.claude/rules/*.md` with `paths:` frontmatter) |
| Your personal style preferences across all projects                             | **User CLAUDE.md** (`~/.claude/CLAUDE.md`)                         |
| Your personal rules scoped to specific file types                               | **User rules** (`~/.claude/rules/*.md`)                            |
| Your local environment details for one project (URLs, credentials, local paths) | **CLAUDE.local.md** (`./CLAUDE.local.md`)                          |

### Claude writes it: auto memory

Auto memory (`~/.claude/projects/<project>/memory/MEMORY.md`) is the opposite: Claude writes it, you can read and edit it. This is where Claude stores learnings across sessions: your role and working preferences, corrections you give it, and project context it can't derive from the code. Claude skips anything it can figure out from the codebase itself.

You do not need to manage auto memory actively. It builds up naturally as you work. If Claude keeps forgetting something between sessions, check whether auto memory is enabled (`/memory`).

### Quick decision guide

**"My whole team should follow this rule"** -> Project CLAUDE.md or project rules

**"I personally prefer this style"** -> User CLAUDE.md (`~/.claude/CLAUDE.md`)

**"This only matters on my local machine"** -> CLAUDE.local.md

**"Claude figured this out and should remember it"** -> Auto memory (happens automatically)

**"This rule only applies to API files"** -> Project rules with `paths:` frontmatter

## What to put in memory files

A good memory file is concise, specific, and actionable. Focus on information the AI cannot infer from the code itself.

**Effective content:**

```markdown
# Conventions

- Use TypeScript strict mode, never use `any`
- All API endpoints must validate input with Zod schemas
- Database migrations are in src/db/migrations/, never modify existing ones
- Run `npm test` before committing, all tests must pass

# Architecture

- Backend follows hexagonal architecture (ports and adapters)
- Business logic lives in src/domain/, never import from src/infrastructure/ there
- Use Result<T, E> pattern for error handling, do not throw exceptions

# Commands

- Tests: npm test
- Lint: npm run lint
- Type check: npm run typecheck
- Build: npm run build
```

**What to avoid:**

- Duplicating information already obvious from the codebase (e.g., "this project uses React" when `package.json` clearly shows it)
- Overly long documents that dilute the important rules
- Vague guidance like "write clean code" that the AI cannot act on concretely

## Use constraints, not aspirations

Write instructions the AI can follow mechanically:

**Weak:**

```text
Write high-quality, maintainable code.
```

**Strong:**

```text
Keep functions under 30 lines. Extract helper functions for repeated logic.
Never use string concatenation for SQL queries.
```

## Memory across tools

If your team uses multiple AI coding tools, keep the core conventions in one canonical location (such as a `CONVENTIONS.md` file) and reference it from each tool's memory file. This avoids drift between different memory files that cover the same ground.

```markdown
# CLAUDE.md

Read and follow the conventions in CONVENTIONS.md at the repository root.
```

**Memory file equivalents across tools:**

| Tool           | Project memory                                                                   | User memory            |
| -------------- | -------------------------------------------------------------------------------- | ---------------------- |
| Claude Code    | `CLAUDE.md`                                                                      | `~/.claude/CLAUDE.md`  |
| Codex          | `AGENTS.md` (see [AGENTS.md & Memories](../codex/agents-md.md))                  | `~/.codex/AGENTS.md`   |
| Cursor         | `AGENTS.md`, `.cursor/rules/*.mdc` (see [Rules & AGENTS.md](../cursor/rules.md)) | User Rules in settings |
| GitHub Copilot | `.github/copilot-instructions.md`                                                | User settings          |
| Windsurf       | `.windsurfrules`                                                                 | User settings          |

## Excluding memory files

In large monorepos, you may want to exclude CLAUDE.md files from other teams. Use the `claudeMdExcludes` setting in `.claude/settings.local.json`:

```json
{
  "claudeMdExcludes": ["**/other-team/CLAUDE.md", "/home/user/monorepo/legacy/.claude/rules/**"]
}
```

This accepts glob patterns matched against absolute file paths. The setting can be configured at any settings layer (user, project, local, or managed policy) and arrays merge across layers. Managed policy CLAUDE.md files cannot be excluded, ensuring organization-wide instructions always apply.
