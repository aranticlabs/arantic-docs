---
sidebar_position: 1
sidebar_label: Tools Overview
---

# Tools Overview

There are several AI tools useful for programming. They differ in how they integrate into your workflow, what models they use, and how much context they can handle.

## Categories

### Chat-based tools

You interact via a conversation interface. Good for explaining code, generating snippets, debugging, and thinking through designs.

- **Claude** (claude.ai): strong at reasoning, large context window, good at following complex instructions
- **ChatGPT** (chat.openai.com): GPT-4o, broad general knowledge, large plugin ecosystem
- **Gemini** (gemini.google.com): integrates with Google Workspace

### IDE-integrated tools

These work directly inside your editor and see your open files and cursor position.

- **[GitHub Copilot](/tools/github-copilot)**: available in VS Code, JetBrains, Neovim; inline completions and a chat panel
- **[Cursor](/tools/cursor)**: an IDE built around AI; deeper context awareness than Copilot
- **Mistral Code**: Codestral-powered completions for VS Code and JetBrains
- **Supermaven**: fast, focused on autocomplete speed

### CLI tools

These run in your terminal alongside your code and can read files, run commands, and interact with your codebase.

| Tool | Start command | Description |
|------|---------------|-------------|
| **[Claude Code](/guides/starter/setup)** | `claude` | Anthropic's CLI, full codebase access, agentic task execution |
| **[Codex CLI](/tools/codex)** | `codex` | OpenAI's terminal agent, defaults to gpt-5.3-codex |
| **[Gemini CLI](/tools/gemini-cli)** | `gemini` | Google's open-source CLI, 1M token context window, generous free tier |
| **[Aider](/tools/aider)** | `aider` | Open-source, model-agnostic pair programming with git-native workflow |
| **[Mistral Vibe](/tools/mistral)** | `vibe` | Mistral's CLI agent with subagent support and self-hosted options |
| **GitHub Copilot CLI** | `copilot` | GitHub's agentic terminal assistant with multi-model support |

### API-based

For building your own integrations or automating tasks in CI.

- **Anthropic API**: access to Claude programmatically
- **OpenAI API**: access to GPT models programmatically

## Choosing a tool

| Need | Recommended |
|---|---|
| Quick question or code snippet | Claude / ChatGPT |
| Inline autocomplete while coding | [Copilot](/tools/github-copilot), [Cursor](/tools/cursor), or Codestral |
| Multi-file tasks, refactoring, agentic workflows | [Claude Code](/guides/starter/setup), [Codex CLI](/tools/codex), or [Gemini CLI](/tools/gemini-cli) |
| Model-agnostic CLI with git integration | [Aider](/tools/aider) |
| Automating code review in CI | Anthropic API / OpenAI API |
| Working entirely inside VS Code | [Copilot](/tools/github-copilot) or [Cursor](/tools/cursor) |
| Data privacy and self-hosted deployment | [Mistral](/tools/mistral) |
| Free CLI tool with large context window | [Gemini CLI](/tools/gemini-cli) |

## Using multiple tools

Most developers use more than one tool. A common setup:

- **[Cursor](/tools/cursor), [Copilot](/tools/github-copilot), or Codestral** for moment-to-moment completions while typing
- **Claude or ChatGPT** for longer reasoning tasks and design discussions
- **[Claude Code](/guides/starter/setup), [Codex CLI](/tools/codex), or [Aider](/tools/aider)** for larger agentic tasks (refactoring a module, writing a feature end-to-end)
- **[Gemini CLI](/tools/gemini-cli)** for exploratory work on a free tier with a large context window
