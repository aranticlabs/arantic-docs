---
sidebar_position: 8
---

# Mistral

Mistral offers a suite of AI coding tools, from a CLI agent to specialized code completion models and IDE integrations. Based in Europe, Mistral emphasizes data privacy and offers self-hosted deployment options.

## Mistral Vibe CLI

Mistral's terminal-based coding agent, similar to Claude Code and Codex CLI.

### Installation

One-liner (Linux/macOS):

```bash
curl -LsSf https://mistral.ai/vibe/install.sh | bash
```

Or via uv:

```bash
uv tool install mistral-vibe
```

Or via pip (requires Python 3.12+):

```bash
pip install mistral-vibe
```

### Authentication

Set your Mistral API key:

```bash
export MISTRAL_API_KEY=your-key-here
```

### Key features

- **Project-aware context**: reads your codebase, understands project structure, and makes changes across files
- **Git integration**: works with your git workflow, can create branches and commits
- **Subagents (2.0)**: delegates subtasks to specialized agents for parallel execution
- **Tool use**: can run shell commands, search the web, and interact with external services

## Codestral

Mistral's dedicated code completion model, optimized for low-latency suggestions across **80+ programming languages**. It powers inline completions in supported editors.

Key strengths:
- Fast response times for real-time autocomplete
- Fill-in-the-middle capability (completes code at the cursor position, not just at the end)
- Strong performance on Python, JavaScript, TypeScript, Java, C++, and Rust

## IDE integration

### VS Code

Install the **Mistral AI** extension from the VS Code marketplace. It provides:

- Inline code completions powered by Codestral
- A chat panel for longer interactions
- Context from open files and workspace

### JetBrains

The Mistral plugin is available for IntelliJ, PyCharm, WebStorm, and other JetBrains IDEs through the plugin marketplace.

## Enterprise features

Mistral offers deployment options for organizations with strict data requirements:

- **Self-hosted**: run Mistral models on your own infrastructure
- **VPC deployment**: dedicated instances within your cloud environment
- **On-premises**: fully air-gapped installations for regulated industries

## Tips

- Use Codestral in your IDE for fast completions alongside Mistral Vibe for larger tasks
- If data privacy is a primary concern, explore Mistral's self-hosted options
- The Vibe CLI's subagent feature (2.0) is useful for breaking down large tasks into parallel workstreams

## Limitations

- Requires a Mistral API key (no free tier for CLI usage)
- Smaller ecosystem and community compared to Claude Code, Copilot, or Cursor
- Codestral is specialized for code and may not perform as well on general reasoning tasks
