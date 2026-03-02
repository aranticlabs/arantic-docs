---
sidebar_position: 1
---

# Quickstart

This section gets you from zero to a working AI-assisted development setup. Each guide is tailored to a specific role and stack — pick the one that matches you and skip the rest.

## Pick your persona

| Persona | Stack | Guide |
|---------|-------|-------|
| Web / frontend developer | React, TypeScript, JavaScript, Angular | [Web developer setup](./web) |
| Go backend developer | Go, REST, gRPC, CLI tools | [Go developer setup](./go) |
| .NET developer | C#, ASP.NET, WinForms, WPF, MAUI — Visual Studio | [.NET developer setup](./dotnet) |
| Firmware / embedded developer | C, C++, RTOS, microcontrollers | [Firmware developer setup](./firmware) |

---

## What everyone needs first

You need either a **Claude subscription** or an **Anthropic API key**. Pick one:

### Option A — Claude Pro or Max subscription (recommended for individuals)

Sign up at [claude.ai](https://claude.ai). Claude Code will use this subscription automatically — no separate API key configuration needed.

### Option B — Anthropic API key (teams, CI, automation)

Create an account at [console.anthropic.com](https://console.anthropic.com), generate an API key, and export it:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Add that line to your `~/.zshrc` or `~/.bashrc` so it persists across sessions.

---

## The two types of AI tools

All setups below use some combination of:

**In-editor tools** — completions and chat inline in your IDE, no terminal needed
- [GitHub Copilot](../tools/github-copilot) — VS Code, Visual Studio, JetBrains, Neovim; best for teams already on GitHub
- [Cursor](../tools/cursor) — a full IDE built around AI; deeper context awareness than Copilot

**Terminal / agentic tools** — multi-file tasks, full codebase access, autonomous execution
- [Claude Code](../tools/claude-code) — Anthropic's CLI; reads your files, runs commands, and iterates until a task is done

Most developers use both: an in-editor tool for moment-to-moment completions while typing, and Claude Code for larger tasks like refactoring a module, reviewing a PR, or generating a feature end-to-end.

See the [full tools overview](../tools/overview) to compare all options side by side.

---

## Quick comparison across personas

| | Web dev | Go dev | .NET dev | Firmware dev |
|---|---|---|---|---|
| Primary IDE | VS Code / Cursor | VS Code / GoLand | Visual Studio | VS Code / CLion |
| In-editor AI | Copilot or Cursor | Copilot or Cursor | GitHub Copilot | Copilot or Cursor |
| CLI / agentic | Claude Code | Claude Code | Optional | Claude Code |
| Terminal needed? | Yes | Yes | No (optional) | Yes |
| Key subagents | ux-reviewer, accessibility-auditor | security-auditor, api-contract-reviewer | — | memory-usage-auditor, misra-c-checker |
