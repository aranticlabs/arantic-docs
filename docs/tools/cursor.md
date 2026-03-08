---
sidebar_position: 4
sidebar_label: Cursor
description: Cursor is a VS Code fork with deep AI integration that can reference your entire codebase and reason across multiple files for complex edits.
keywords: [Cursor, AI code editor, VS Code fork, codebase AI, multi-file editing, Cursor AI, code completion, AI pair programming]
---

# Cursor

Cursor is a code editor built around AI. It's a fork of VS Code, so it supports all VS Code extensions, but with deeper AI integration than Copilot: it can reference your entire codebase and reason across multiple files.

## Installation

Download from [cursor.com](https://www.cursor.com). Import your VS Code settings and extensions on first launch.

## Key features

### Codebase-aware chat

Cursor indexes your entire repository. You can ask questions about code you haven't opened:

```text
Where is the database connection initialised?
Why does the OrderService depend on UserService?
Find all places where we call the payments API.
```

Reference specific files with `@filename` in the chat.

### Inline editing (Cmd+K)

Select code and press `Cmd+K` to edit it in place with an instruction:

```text
Add input validation using Zod
Rewrite this using async/await instead of callbacks
Extract this into a separate function
```

### Composer (multi-file editing)

Cursor's Composer lets you instruct AI to make changes across multiple files at once. It's useful for larger tasks like adding a new feature end-to-end.

### Project rules (AGENTS.md and .cursor/rules)

Cursor uses **AGENTS.md** at the project root as the main place for persistent, project-wide instructions (similar to `CLAUDE.md` for Claude Code). Use it for conventions that apply everywhere:

```markdown
- TypeScript only, strict mode
- Use Drizzle ORM for all database queries
- All API handlers must validate input with Zod
- Prefer named exports over default exports
```

For rules that apply only to certain files, use **`.cursor/rules/`**: add `.mdc` files with YAML frontmatter and glob patterns (e.g. `globs: src/components/**/*.tsx`). Create them via the Command Palette (**New Cursor Rule**) or manually.

An older option is a **`.cursorrules`** file at the project root; Cursor still reads it, but AGENTS.md is the cross-tool standard and is preferred.

## Cursor vs. Copilot

| | Cursor | Copilot |
|---|---|---|
| Codebase indexing | Full repository | Open files only |
| Editor | Standalone (VS Code fork) | Plugin for existing editors |
| Multi-file edits | Yes (Composer) | Limited |
| Rules file | `AGENTS.md`, `.cursor/rules/*.mdc` | No direct equivalent |
| Inline edit shortcut | `Cmd+K` | `Ctrl+I` |

## Tips

- Use `@codebase` in chat to explicitly search across all files
- Reference specific files and functions with `@filename` and `@function`
- Use Composer for new features; use inline edit (`Cmd+K`) for targeted changes
- Keep **AGENTS.md** (and `.cursor/rules` if you use them) updated as your project conventions evolve
