---
sidebar_position: 3
---

# GitHub Copilot

GitHub Copilot is an AI coding assistant integrated directly into your editor. It provides inline completions as you type and a chat panel for longer interactions.

## Where it works

- **VS Code** - most feature-complete integration
- **JetBrains IDEs** (IntelliJ, WebStorm, PyCharm, etc.)
- **Neovim** - via plugin
- **GitHub.com** - code review suggestions in pull requests
- **Terminal** - Copilot CLI for shell commands

## Key features

### Inline completions

As you type, Copilot suggests completions ranging from a single token to an entire function. Accept with `Tab`, cycle alternatives with `Alt+]`.

Works best when:
- You have good type annotations and function signatures
- The file has existing examples of the pattern you're following
- Your function name and parameter names are descriptive

### Copilot Chat

A chat panel inside VS Code where you can ask questions with direct access to your open files and selected code.

Useful slash commands in Copilot Chat:

| Command | What it does |
|---|---|
| `/explain` | Explains selected code in plain English |
| `/fix` | Suggests a fix for selected code or an error |
| `/tests` | Generates unit tests for selected code |
| `/doc` | Generates documentation comments |

### Copilot CLI

Install separately:

```bash
npm install -g @githubnext/github-copilot-cli
```

Explains shell commands and suggests commands from plain English:

```bash
github-copilot-cli what-the-shell "find all .ts files modified in the last 7 days"
```

## Tips for better completions

- **Write a descriptive comment first** - Copilot uses comments as intent signals
- **Name things clearly** - `getUserByEmail` tells Copilot more than `getData`
- **Use type annotations** - TypeScript types guide completions significantly
- **Open related files** - Copilot uses open tabs as context

## Limitations

- Limited to the currently open files and selected code (no full codebase indexing by default)
- Multi-step or cross-file tasks are better handled by Claude Code
- May suggest deprecated APIs or patterns that don't match your codebase style
