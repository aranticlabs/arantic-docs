---
sidebar_position: 2
---

# Claude Code

Claude Code is Anthropic's official CLI for Claude. It runs in your terminal, reads your codebase, executes commands, and can handle multi-step programming tasks autonomously.

## Installation

```bash
npm install -g @anthropic-ai/claude-code
```

Requires Node.js 18+ and an Anthropic API key (or Claude Pro/Max subscription).

## Basic usage

Run it from inside your project directory:

```bash
claude
```

Claude Code automatically reads your project structure and can access any file in the working directory.

## Key capabilities

### Agentic task execution

Unlike chat tools, Claude Code can take actions: edit files, run tests, install packages, and iterate until a task is complete.

```
Fix the failing tests in src/auth/ and make sure all other tests still pass.
```

### Full codebase context

Claude Code indexes your repository so you don't need to paste code manually. You can reference files by name:

```
Refactor the UserService class to use dependency injection.
```

### Custom commands (slash commands)

You can define custom `/commands` in `.claude/commands/` as Markdown files. These become reusable prompts available in any session.

### Hooks

Hooks run shell commands automatically in response to events (e.g. before a file is edited, after a tool is used). Useful for enforcing linting, running tests, or logging actions.

### MCP servers

Claude Code supports the Model Context Protocol (MCP), allowing you to connect it to external tools: databases, APIs, internal systems.

## CLAUDE.md

Create a `CLAUDE.md` file at the root of your project to give Claude Code persistent context - coding conventions, project structure, commands to run, things to avoid.

```markdown
# Project conventions
- TypeScript strict mode, no `any`
- All API routes must have Zod validation
- Run `npm test` before committing
- Never modify migration files
```

## Tips

- **Be specific** - tell it exactly what you want and what constraints to respect
- **Review changes** - use `/diff` or check git diff before accepting edits
- **Scope tasks** - break large tasks into smaller steps for better results
- **Use CLAUDE.md** - persistent context saves you from repeating yourself every session
