---
sidebar_position: 1
sidebar_label: Setup
---

# Starter Setup

This guide takes you from zero to a working Claude Code setup in about 15 minutes. Each step includes a brief explanation, a command or config, and a link to the full reference page.

## 1. Prerequisites

You need:

- **Node.js 18+** installed (`node --version` to check)
- **An Anthropic API key** or a **Claude Pro/Max subscription**
- **A git repository** to work in (Claude Code works best inside git repos)

## 2. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Verify the installation:

```bash
claude --version
```

## 3. Authenticate

**With a Claude subscription (Pro/Max):**

```bash
claude
# Follow the browser-based OAuth flow when prompted
```

**With an API key:**

```bash
export ANTHROPIC_API_KEY=sk-ant-...
claude
```

## 4. Start your first session

Navigate to your project and launch Claude Code:

```bash
cd your-project
claude
```

Try a simple task to see it in action:

```text
Explain the structure of this project and list the main entry points.
```

Claude Code reads your project files automatically. You don't need to paste code.

## 5. Essential commands

These commands work inside any Claude Code session:

| Command | What it does |
|---------|-------------|
| `/help` | Show available commands |
| `/plan` | Enter plan mode (think before acting) |
| `/compact` | Summarize conversation to free context |
| `/clear` | Reset the session entirely |
| `/doctor` | Diagnose environment issues |
| `/cost` | Show token usage for the session |
| `/model` | Switch between available models |
| `Esc` | Cancel the current response |

For the complete command reference, see [Commands](/claude-code/commands).

## 6. Create your CLAUDE.md

A `CLAUDE.md` file gives Claude Code persistent context about your project. Create one in your project root:

```markdown
# Project: my-app

- TypeScript + React project
- Uses pnpm for package management
- Run tests with: pnpm test
- Run linting with: pnpm lint
- Follow existing code style and naming conventions
```

Keep it short and factual. Claude Code reads this file at the start of every session.

For the full memory system (user-level, project-level, rules), see [Memory](/claude-code/memory).

## 7. Use plan mode

For complex tasks, ask Claude Code to plan before it acts:

```text
/plan Refactor the authentication module to use JWT tokens instead of session cookies
```

Claude Code will outline its approach and wait for your approval before making changes. This is especially useful for multi-file changes where you want to review the strategy first.

For more on plan mode and other effective techniques, see [Tips](/claude-code/tips).

## 8. Debug with /doctor

If something isn't working, run the built-in diagnostic:

```text
/doctor
```

This checks your Node.js version, API key, git status, and other common issues.

For more troubleshooting tips, see [Debugging](/claude-code/debugging).

## 9. Best practices

- **Be specific in your prompts.** "Fix the login bug where users get a 403 after password reset" works better than "fix the login bug."
- **Let Claude Code run tests.** Tell it how to run your test suite in CLAUDE.md, then ask it to verify its own changes.
- **Use plan mode for big changes.** Review the plan before Claude Code starts editing files.
- **Commit often.** Claude Code works well with small, incremental changes rather than one massive refactor.
- **Review diffs before accepting.** Use your normal code review process on Claude Code's output.

## Next steps

Ready to customize your setup? Continue to the [Intermediate guide](../intermediate/setup) to configure permissions, create custom skills, add MCP servers, and more.
