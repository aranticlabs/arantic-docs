---
sidebar_position: 7
---

# Memory

When you use an AI coding tool, every new session starts with a blank slate. The model has no recollection of your project's conventions, past decisions, or the patterns your team follows. Memory solves this problem by giving agentic coding tools persistent context that carries over between sessions.

## What is memory?

Memory in agentic coding refers to structured files or configuration that provide an AI assistant with project-specific, user-specific, or organization-wide context. Instead of repeating the same instructions every time you start a new conversation, you write them down once in a memory file, and the tool loads them automatically.

Think of it as onboarding documentation, but written for your AI assistant instead of a new team member.

## Why memory matters

Without memory, every session requires you to re-explain:

- What language, framework, and conventions your project uses
- Which files should never be modified
- How to run tests and what linters to use
- Architectural patterns and naming conventions
- What the AI should avoid doing

This repetition wastes time and leads to inconsistent results. A well-maintained memory file makes the AI behave like a team member who already knows how your project works.

## Types of memory

### Project memory

Project memory lives in your repository and applies to everyone (human or AI) working on the project. It typically covers coding standards, project structure, build commands, and guardrails.

**Examples across tools:**

| Tool | File | Scope |
|------|------|-------|
| Claude Code | `CLAUDE.md` | Root of repository |
| Cursor | `.cursorrules` | Root of repository |
| GitHub Copilot | `.github/copilot-instructions.md` | Root of repository |
| Windsurf | `.windsurfrules` | Root of repository |

Because project memory is checked into version control, it stays in sync with the codebase and gets reviewed like any other code change.

### User memory

User memory applies to a specific developer across all their projects. It captures personal preferences like preferred language style, editor keybindings, or default frameworks.

In Claude Code, user-level memory is stored in `~/.claude/CLAUDE.md`. This file is loaded alongside any project-level `CLAUDE.md` but applies globally to all sessions for that user.

### Session memory

Session memory is the context that accumulates within a single conversation. Every message you send, every file the AI reads, and every command it runs becomes part of the working context. Session memory is ephemeral: it disappears when the conversation ends.

Some tools extend session memory by allowing the AI to write notes or summaries that persist. In Claude Code, the `/memory` command lets you save key decisions or context to your `CLAUDE.md` file mid-session so it carries forward.

## What to put in a memory file

A good memory file is concise, specific, and actionable. Focus on information the AI cannot infer from the code itself.

**Effective content:**

```markdown
# Project conventions
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

## Memory hierarchy

When multiple memory files exist, tools typically merge them with a defined precedence. In Claude Code, the loading order is:

1. **Enterprise policy** (organization-wide, managed by admins)
2. **User memory** (`~/.claude/CLAUDE.md`)
3. **Project root memory** (`CLAUDE.md` at the repository root)
4. **Nested memory** (`CLAUDE.md` files in subdirectories, applying when working in those paths)

More specific memory takes precedence when rules conflict. A project-level instruction to "use tabs" overrides a user-level preference for spaces when working in that project.

## Keeping memory files effective

### Start small and iterate

Begin with only the rules that matter most. After a few sessions, notice where the AI makes mistakes or asks redundant questions, then add instructions that address those gaps.

### Be explicit about commands

AI tools can run shell commands but have no way to guess your project's specific workflow. Always include the exact commands for testing, building, linting, and deploying.

```markdown
# Commands
- Run all tests: pytest tests/ -v
- Run single test: pytest tests/test_auth.py -v -k "test_login"
- Format code: black src/ tests/
- Check types: mypy src/
```

### Use constraints, not aspirations

Write instructions the AI can follow mechanically. Compare:

**Weak:**
```text
Write high-quality, maintainable code.
```

**Strong:**
```text
Keep functions under 30 lines. Extract helper functions for repeated logic.
Never use string concatenation for SQL queries.
```

### Review memory like code

Memory files shape every AI interaction in your project. Treat changes to them with the same care as changes to your linter configuration or CI pipeline. Include them in pull request reviews, especially when they add new constraints or change established patterns.

## Memory across tools

If your team uses multiple AI coding tools, keep the core conventions in one canonical location (such as a `CONVENTIONS.md` file) and reference it from each tool's memory file. This avoids drift between different memory files that cover the same ground.

```markdown
# CLAUDE.md
Read and follow the conventions in CONVENTIONS.md at the repository root.
```

This approach keeps your standards centralized while letting each tool's memory file add tool-specific instructions (like which slash commands to use or which MCP servers to connect).
