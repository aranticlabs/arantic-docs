---
sidebar_position: 2
---

# Memory

When you use an AI coding tool, every new session starts with a blank slate. The model has no recollection of your project's conventions, past decisions, or the patterns your team follows. Memory solves this problem by giving agentic coding tools persistent context that carries over between sessions.

## What is memory?

Memory in agentic coding refers to structured files that provide an AI assistant with persistent context. Instead of repeating the same instructions every time you start a new conversation, you write them down once in a memory file, and the tool loads them automatically.

Think of it as onboarding documentation, but written for your AI assistant instead of a new team member.

## All memory files in Claude Code

Claude Code uses several memory files at different scopes. Here is the complete picture:

| File | Location | Scope | Committed to git? | Written by |
|------|----------|-------|-------------------|------------|
| **Managed policy** | `/etc/claude-code/CLAUDE.md` (Linux) | Organization-wide | N/A (deployed by IT) | Admins |
| **User CLAUDE.md** | `~/.claude/CLAUDE.md` | You, across all projects | N/A | You |
| **User rules** | `~/.claude/rules/*.md` | You, across all projects | N/A | You |
| **Project CLAUDE.md** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team (everyone on the project) | Yes | You |
| **Project rules** | `./.claude/rules/*.md` | Team (everyone on the project) | Yes | You |
| **Local CLAUDE.md** | `./CLAUDE.local.md` | You, this project only | No (auto-gitignored) | You |
| **Auto memory** | `~/.claude/projects/<project>/memory/MEMORY.md` | You, this project (machine-local) | No | Claude |
| **Auto memory topics** | `~/.claude/projects/<project>/memory/*.md` | You, this project (machine-local) | No | Claude |
| **Subagent memory** | `~/.claude/projects/<project>/subagents/<agent>/MEMORY.md` | Per subagent | No | Claude |

### Project CLAUDE.md

The main memory file for your project. Lives at the repository root as `CLAUDE.md` (or inside `.claude/CLAUDE.md`). Committed to git and shared with the whole team. This is where coding standards, build commands, architecture decisions, and guardrails go.

A well-structured CLAUDE.md is the single most impactful way to improve Claude Code's output, but bigger is not better. **Keep your CLAUDE.md under 60 lines.** Files over 150 lines degrade performance because they consume too much of the context window before the real work begins.

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

### CLAUDE.local.md

Personal, project-specific memory that is NOT committed to git. Lives at `./CLAUDE.local.md` in the project root. Claude Code auto-adds it to `.gitignore`.

This is for things that are specific to your local setup:

```markdown
# CLAUDE.local.md

- My local API runs at http://localhost:3000
- Use test database "dev_sarah" for integration tests
- Skip the deploy step, I do not have production credentials
```

### Rules directories

For more granular control, you can create topic-specific rule files:

- **Project rules**: `.claude/rules/*.md` (committed, shared with team)
- **User rules**: `~/.claude/rules/*.md` (personal, all projects)

Rules can optionally be scoped to specific file paths using frontmatter:

```markdown
# .claude/rules/api-design.md
---
paths:
  - "src/api/**/*.ts"
  - "api/**/*.{ts,tsx}"
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
- Enabled by default (toggle with `/memory` or set `"autoMemoryEnabled": false` in settings)
- Claude writes to this file when it learns something worth remembering: build commands, debugging insights, architecture patterns, workflow habits
- At session start, only the **first 200 lines** of `MEMORY.md` are loaded. Content beyond line 200 is still accessible if Claude reads the file on demand.
- When `MEMORY.md` grows large, Claude moves detailed notes into separate topic files like `debugging.md` or `api-conventions.md` in the same directory

You will see "Writing memory" or "Recalled memory" in the interface when Claude updates or reads auto memory.

### Managed policy

For enterprise deployments, admins can place a `CLAUDE.md` at an OS-specific path:

| OS | Path |
|----|------|
| Linux / WSL | `/etc/claude-code/CLAUDE.md` |
| macOS | `/Library/Application Support/ClaudeCode/CLAUDE.md` |
| Windows | `C:\Program Files\ClaudeCode\CLAUDE.md` |

This file cannot be excluded by users. It always loads first and is intended for organization-wide standards and security policies.

## Loading order and precedence

Claude Code loads memory files at session start in this order (later entries take precedence when rules conflict):

1. **Managed policy CLAUDE.md** (cannot be excluded)
2. **User rules** (`~/.claude/rules/*.md`)
3. **User CLAUDE.md** (`~/.claude/CLAUDE.md`)
4. **Ancestor CLAUDE.md files** (walking up the directory tree from your working directory)
5. **Project CLAUDE.md** (`./CLAUDE.md` or `./.claude/CLAUDE.md`)
6. **Local CLAUDE.md** (`./CLAUDE.local.md`)
7. **Project rules** (`.claude/rules/*.md`, unconditional ones)
8. **Auto memory** (`~/.claude/projects/<project>/memory/MEMORY.md`, first 200 lines)

Path-scoped rules and subdirectory CLAUDE.md files load on demand when Claude works with matching files.

**Practical example:**

```text
~/.claude/CLAUDE.md              # "Use 4-space indents"
./CLAUDE.md                      # "Use 2-space indents" (overrides user preference)
./CLAUDE.local.md                # "Local API at http://localhost:3000"
```

The project instruction wins for indentation because it is more specific.

## The /memory command

Type `/memory` in Claude Code to:

- See all CLAUDE.md and rules files currently loaded in your session
- Toggle auto memory on or off
- Open the auto memory folder
- Select any memory file to open it in your editor for manual editing

To save something to CLAUDE.md mid-session, you can also just ask Claude directly: "Add this to CLAUDE.md: always run tests before committing."

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

| Tool | Project memory | User memory |
|------|---------------|-------------|
| Claude Code | `CLAUDE.md` | `~/.claude/CLAUDE.md` |
| Cursor | `.cursorrules` | User settings |
| GitHub Copilot | `.github/copilot-instructions.md` | User settings |
| Windsurf | `.windsurfrules` | User settings |

## Excluding memory files

In large monorepos, you may want to exclude CLAUDE.md files from other teams. Use the `claudeMdExcludes` setting in `.claude/settings.local.json`:

```json
{
  "claudeMdExcludes": [
    "**/other-team/CLAUDE.md",
    "/home/user/monorepo/legacy/.claude/rules/**"
  ]
}
```

This accepts glob patterns matched against absolute file paths. Managed policy CLAUDE.md cannot be excluded.
