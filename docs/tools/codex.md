---
sidebar_position: 5
---

# OpenAI Codex CLI

Codex CLI is OpenAI's terminal-based coding agent. It can read your codebase, suggest changes, and execute commands locally, powered by OpenAI's models (including GPT-4.1 and o3).

## Installation

```bash
npm install -g @openai/codex
```

Or via Homebrew:

```bash
brew install openai-codex
```

## Authentication

Codex requires either:

- A **ChatGPT Plus, Pro, or Team subscription** (uses your account login)
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

Codex defaults to `o4-mini` but supports other OpenAI models. You can switch models with the `--model` flag:

```bash
codex --model gpt-4.1 "refactor the auth module"
```

## Tips

- Start with **Suggest** mode until you're comfortable with how Codex interprets your instructions
- Use specific, scoped prompts for best results (e.g., "add input validation to the signup handler" rather than "improve the code")
- Codex works best with well-structured projects that have clear file organization

## Limitations

- Only supports OpenAI models (no Claude, Gemini, or open-source models)
- Requires a paid subscription or API key
- Newer than other CLI tools, so the ecosystem and documentation are still maturing
