---
sidebar_position: 7
---

# Aider

Aider is an open-source AI pair programming tool that runs in your terminal. It connects to many different LLMs and integrates directly with git, automatically committing changes as it works.

## Installation

```bash
pip install aider-chat
```

Or using uv (recommended for faster installs):

```bash
uv tool install aider-chat
```

Or via pipx:

```bash
pipx install aider-chat
```

## Authentication

Aider does not bundle its own AI model. You provide API keys for the model you want to use:

```bash
export ANTHROPIC_API_KEY=sk-...   # for Claude
export OPENAI_API_KEY=sk-...      # for GPT models
export DEEPSEEK_API_KEY=sk-...    # for DeepSeek
```

For local models, connect via Ollama or any OpenAI-compatible API endpoint.

## Key features

### Git-native workflow

Aider automatically creates git commits for every change it makes, with descriptive commit messages. This gives you a clean history and makes it easy to review or revert any AI-generated change.

```bash
aider --auto-commits
```

### Model-agnostic

Aider supports **100+ LLMs** including Claude, GPT-4, DeepSeek, Gemini, Llama, and many others. Switch models on the fly:

```bash
aider --model claude-sonnet-4-20250514
aider --model gpt-4o
aider --model deepseek/deepseek-coder
aider --model ollama/llama3          # local model
```

### Codebase mapping

Aider builds a map of your entire repository using tree-sitter, understanding function signatures, class hierarchies, and file relationships. This helps it make targeted changes without needing to read every file into context.

### Voice-to-code

Aider supports voice input, letting you describe changes by speaking rather than typing. Useful for hands-free coding or when you want to explain a change conversationally.

### Watch mode

Run Aider in watch mode to monitor files for special comments. Add a `# ai: <instruction>` comment in your code, and Aider picks it up and acts on it:

```bash
aider --watch-files
```

## Tips

- Use `--auto-commits` to keep a clean git history of all AI changes
- Start with Claude or GPT-4 for best results; switch to DeepSeek or local models for cost savings
- Add files explicitly to the chat with `/add filename` so Aider knows which files to modify
- Use the `/undo` command to revert the last AI change if it's not what you wanted

## Limitations

- CLI-only: no GUI or IDE integration (though it works alongside any editor)
- Requires you to supply your own API keys and manage model costs separately
- Quality depends heavily on the underlying model you choose
