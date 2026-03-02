---
sidebar_position: 2
---

# Quickstart

Get AI-assisted coding working in your environment. Pick the guide that matches your stack; each one covers IDE setup, Claude Code, project context configuration, and relevant subagents.

## Pick your persona

| Persona | Stack | Setup guide |
|---------|-------|-------------|
| Web & backend developer | React, TypeScript, JavaScript, Angular, Go | [Web & backend setup](./setup/web-and-backend) |
| .NET developer | C#, ASP.NET, WinForms, WPF, MAUI (Visual Studio) | [.NET developer setup](./setup/dotnet) |
| Firmware / embedded developer | C, C++, RTOS, microcontrollers | [Firmware developer setup](./setup/firmware) |

---

## What everyone needs first

You need either a **Claude subscription** or an **Anthropic API key**:

**Claude Pro or Max** (recommended for individuals): sign up at [claude.ai](https://claude.ai). Claude Code uses this automatically, no extra configuration needed.

**Anthropic API key** (teams, CI, automation): create one at [console.anthropic.com](https://console.anthropic.com) and export it:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Add that line to your `~/.zshrc` or `~/.bashrc` to persist it across sessions.

---

## The two types of AI tools

**In-editor**: completions and chat inside your IDE, no terminal required
- [GitHub Copilot](./tools/github-copilot): VS Code, Visual Studio, JetBrains, Neovim
- [Cursor](./tools/cursor): a full IDE built around AI; deeper codebase context

**Agentic**: multi-file tasks, full codebase access, autonomous execution
- [Claude Code](./tools/claude-code): reads files, runs commands, iterates until a task is done

Most developers use both: an in-editor tool for moment-to-moment completions, and Claude Code for larger tasks like refactoring, writing a feature end-to-end, or running a review pass. See the [full tools overview](./tools/overview) for a side-by-side comparison.
