---
sidebar_position: 4
---

# Cursor

Cursor is a code editor built around AI. It's a fork of VS Code, so it supports all VS Code extensions, but with deeper AI integration than Copilot: it can reference your entire codebase and reason across multiple files.

## Installation

Download from [cursor.com](https://www.cursor.com). Import your VS Code settings and extensions on first launch.

## Key features

### Codebase-aware chat

Cursor indexes your entire repository. You can ask questions about code you haven't opened:

```
Where is the database connection initialised?
Why does the OrderService depend on UserService?
Find all places where we call the payments API.
```

Reference specific files with `@filename` in the chat.

### Inline editing (Cmd+K)

Select code and press `Cmd+K` to edit it in place with an instruction:

```
Add input validation using Zod
Rewrite this using async/await instead of callbacks
Extract this into a separate function
```

### Composer (multi-file editing)

Cursor's Composer lets you instruct AI to make changes across multiple files at once. It's useful for larger tasks like adding a new feature end-to-end.

### `.cursorrules`

Create a `.cursorrules` file at the project root to give Cursor persistent instructions (similar to `CLAUDE.md` for Claude Code):

```
- TypeScript only, strict mode
- Use Drizzle ORM for all database queries
- All API handlers must validate input with Zod
- Prefer named exports over default exports
```

## Cursor vs. Copilot

| | Cursor | Copilot |
|---|---|---|
| Codebase indexing | Full repository | Open files only |
| Editor | Standalone (VS Code fork) | Plugin for existing editors |
| Multi-file edits | Yes (Composer) | Limited |
| Rules file | `.cursorrules` | No direct equivalent |
| Inline edit shortcut | `Cmd+K` | `Ctrl+I` |

## Tips

- Use `@codebase` in chat to explicitly search across all files
- Reference specific files and functions with `@filename` and `@function`
- Use Composer for new features; use inline edit (`Cmd+K`) for targeted changes
- Keep `.cursorrules` updated as your project conventions evolve
