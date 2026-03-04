---
sidebar_position: 6
---

# Gemini CLI

Gemini CLI is Google's open-source terminal agent for coding tasks. It connects to Google's Gemini models and offers a generous free tier, making it accessible for individual developers and small teams.

## Installation

```bash
npm install -g @google/gemini-cli
```

Or run directly without installing:

```bash
npx @google/gemini-cli
```

## Starting Gemini CLI

Run it from inside your project directory:

```bash
gemini
```

This launches an interactive session where you can have ongoing conversations with the AI. You can also pass a prompt directly for one-off queries:

```bash
gemini -p "explain the authentication flow in this project"
```

## Authentication

Three options:

- **Google OAuth** (default): sign in with your Google account for free-tier access
- **API key**: set `GEMINI_API_KEY` for direct API access
- **Vertex AI**: use Google Cloud credentials for enterprise deployments

## Key features

### Large context window

Gemini CLI supports up to **1 million tokens** of context, allowing it to process large codebases in a single session without losing track of earlier files.

### Free tier

With Google OAuth login, you get:

- 60 requests per minute
- 1,000 requests per day

This is enough for most individual development workflows without needing a paid plan.

### Google Search grounding

Gemini can search the web during a session to find documentation, API references, or solutions. This keeps its responses current without relying solely on training data.

### MCP support

Gemini CLI supports the **Model Context Protocol (MCP)**, so you can connect it to external tools and data sources using the same server ecosystem as Claude Code.

### Project context files

Gemini reads `GEMINI.md` files (similar to `CLAUDE.md`) for project-specific instructions. It also respects `AGENTS.md` as a cross-tool standard.

## Tips

- Use `GEMINI.md` at your project root to set conventions and constraints
- For large refactoring tasks, the 1M context window helps Gemini keep track of dependencies across files
- Combine with the free tier for low-cost experimentation before committing to a paid plan

## Limitations

- Execution speed can be slower than other CLI tools, especially for complex multi-step tasks
- Can be unreliable on tasks that require precise, multi-file coordination
- Limited to Google's Gemini models (no support for Claude, GPT, or open-source models)
