---
sidebar_position: 1
---

# Tools Overview

There are several AI tools useful for programming. They differ in how they integrate into your workflow, what models they use, and how much context they can handle.

## Categories

### Chat-based tools

You interact via a conversation interface. Good for explaining code, generating snippets, debugging, and thinking through designs.

- **Claude** (claude.ai) — strong at reasoning, large context window, good at following complex instructions
- **ChatGPT** (chat.openai.com) — GPT-4o, broad general knowledge, large plugin ecosystem
- **Gemini** (gemini.google.com) — integrates with Google Workspace

### IDE-integrated tools

These work directly inside your editor and see your open files and cursor position.

- **GitHub Copilot** — available in VS Code, JetBrains, Neovim; inline completions and a chat panel
- **Cursor** — an IDE built around AI; deeper context awareness than Copilot
- **Supermaven** — fast, focused on autocomplete speed

### CLI tools

These run in your terminal alongside your code and can read files, run commands, and interact with your codebase.

- **Claude Code** — Anthropic's CLI, full codebase access, agentic task execution
- **GitHub Copilot CLI** — explains and suggests shell commands

### API-based

For building your own integrations or automating tasks in CI.

- **Anthropic API** — access to Claude programmatically
- **OpenAI API** — access to GPT models programmatically

## Choosing a tool

| Need | Recommended |
|---|---|
| Quick question or code snippet | Claude / ChatGPT |
| Inline autocomplete while coding | Copilot or Cursor |
| Multi-file tasks, refactoring, agentic workflows | Claude Code |
| Automating code review in CI | Anthropic API / OpenAI API |
| Working entirely inside VS Code | Copilot or Cursor |

## Using multiple tools

Most developers use more than one tool. A common setup:

- **Cursor or Copilot** for moment-to-moment completions while typing
- **Claude or ChatGPT** for longer reasoning tasks and design discussions
- **Claude Code** for larger agentic tasks (refactoring a module, writing a feature end-to-end)
