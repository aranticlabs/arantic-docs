---
sidebar_position: 5
sidebar_label: OpenAI Codex CLI
description: OpenAI Codex CLI is a terminal-based coding agent that reads your codebase, suggests changes, and executes commands locally using OpenAI models.
keywords: Codex CLI, OpenAI Codex, terminal coding agent, AI CLI, OpenAI, code generation, local AI agent, command line coding
---

# OpenAI Codex CLI

Codex CLI is OpenAI's terminal-based coding agent. It can read your codebase, suggest changes, and execute commands locally, powered by OpenAI's models.

## Installation

```bash
npm install -g @openai/codex
```

Or via Homebrew:

```bash
brew install --cask codex
```

## Starting Codex

Run it from inside your project directory:

```bash
codex
```

This starts an interactive terminal UI session. Codex can read your repository, make edits, and run commands as you iterate together. You can also pass a prompt directly:

```bash
codex "refactor the auth module to use dependency injection"
```

## Authentication

Codex requires either:

- A **ChatGPT Plus, Pro, Business, or Enterprise subscription** (uses your account login via browser OAuth)
- An **OpenAI API key** set via `OPENAI_API_KEY` environment variable

## Key features

### Local execution

Codex runs commands and applies changes on your local machine. It can read files, write code, and run shell commands within a sandboxed environment. You review and approve each action before it executes.

### Autonomy modes

Codex offers three operating modes that control how much it can do without asking:

- **Suggest**: read-only, proposes changes but applies nothing (default)
- **Auto Edit**: can write files automatically, but asks before running commands
- **Full Auto**: reads, writes, and runs commands without confirmation

### IDE and desktop integration

Beyond the CLI, Codex is available as:

- A **desktop app** for macOS (with Windows and Linux planned)
- An extension for **VS Code**, **Cursor**, and **Windsurf**

### Multi-model support

Codex defaults to `gpt-5.3-codex` but supports other OpenAI models. You can switch models with the `--model` flag or use the `/model` slash command during a session:

```bash
codex --model gpt-5.1-codex "refactor the auth module"
```

## Tips

- Start with **Suggest** mode until you're comfortable with how Codex interprets your instructions
- Use specific, scoped prompts for best results (e.g., "add input validation to the signup handler" rather than "improve the code")
- Codex works best with well-structured projects that have clear file organization

## Limitations

- Only supports OpenAI models (no Claude, Gemini, or open-source models)
- Requires a paid subscription or API key
- Newer than other CLI tools, so the ecosystem and documentation are still maturing
