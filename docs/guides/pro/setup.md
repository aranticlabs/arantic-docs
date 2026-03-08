---
sidebar_position: 1
sidebar_label: Setup
description: Set up Claude Code hooks, agent teams, CI/headless integration, and advanced workflow patterns for professional-grade automated development.
keywords: Claude Code pro, hooks, agent teams, CI integration, headless mode, advanced setup, automation, parallel agents, professional workflow
---

# Pro Setup

This guide assumes you have completed the [Intermediate setup](../intermediate/setup) with permissions, skills, MCP servers, and subagents configured.

Here you'll set up hooks for deterministic automation, agent teams for parallel work, CI/headless integration, and advanced workflow patterns.

## 1. Hooks

Hooks run shell commands automatically in response to Claude Code lifecycle events. Unlike instructions, hooks execute deterministically every time.

**Example: auto-format files after every edit**

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "npx prettier --write $CLAUDE_FILE_PATH"
      }
    ]
  }
}
```

**Example: run linting after task completion**

```json
{
  "hooks": {
    "TaskCompleted": [
      {
        "command": "npm run lint -- --fix"
      }
    ]
  }
}
```

For all hook events and configuration options, see [Hooks](/claude-code/hooks).

## 2. Workflow patterns

The Skill-Agent pattern combines custom skills with subagents for complex multi-step tasks:

```markdown
# .claude/skills/feature/SKILL.md
Implement the feature described below. Follow these steps:

1. Use a Plan subagent to design the approach
2. Create the implementation
3. Use a subagent to write tests for the new code
4. Run the full test suite and fix any failures
5. Create a git commit with a descriptive message

Feature: $ARGUMENTS
```

This creates a repeatable workflow you invoke with `/feature add user avatar uploads`.

For more workflow patterns and orchestration strategies, see [Workflows](/claude-code/workflows).

## 3. Agent teams

Run multiple Claude Code instances in parallel using tmux for large tasks:

```bash
# Create a tmux session with split panes
tmux new-session -d -s team
tmux split-window -h -t team
tmux split-window -v -t team

# Send different tasks to each pane
tmux send-keys -t team:0.0 'claude -p "Write unit tests for src/auth/"' Enter
tmux send-keys -t team:0.1 'claude -p "Write unit tests for src/api/"' Enter
tmux send-keys -t team:0.2 'claude -p "Write unit tests for src/utils/"' Enter

# Attach to watch progress
tmux attach -t team
```

Each instance gets its own context and can work on independent parts of the codebase simultaneously.

For team patterns, coordination strategies, and worktree isolation, see [Agent Teams](/claude-code/agent-teams).

## 4. Git worktrees

When running multiple agents that edit files, use git worktrees to prevent conflicts:

```bash
# Create isolated worktrees for parallel work
git worktree add .claude/worktrees/auth -b feature/auth-refactor
git worktree add .claude/worktrees/api -b feature/api-tests

# Run agents in separate worktrees
cd .claude/worktrees/auth && claude -p "Refactor auth to use JWT" &
cd .claude/worktrees/api && claude -p "Add integration tests for API" &
```

Each worktree is a full copy of your repo on its own branch. Merge results back when done.

For more on worktree patterns, see [Agent Teams](/claude-code/agent-teams).

## 5. Headless and CI integration

Use `--print` mode to run Claude Code in non-interactive environments like CI pipelines:

```bash
# Single-shot query
claude -p "Summarize the changes in this PR" --output-format json

# With tool restrictions for safety
claude -p "Review src/ for security issues" \
  --allowedTools Read,Glob,Grep \
  --output-format json
```

**GitHub Actions example:**

```yaml
- name: AI Code Review
  run: |
    npm install -g @anthropic-ai/claude-code
    claude -p "Review the diff for this PR and list any concerns" \
      --allowedTools Read,Glob,Grep \
      --output-format json > review.json
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

For all CLI flags and output formats, see [Flags](/claude-code/flags).

## 6. Advanced MCP configuration

Connect multiple MCP servers for a rich tool ecosystem:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    },
    "remote-tools": {
      "type": "sse",
      "url": "https://mcp.example.com/sse"
    }
  }
}
```

Remote SSE servers are useful for shared team tools hosted on internal infrastructure.

For server types, authentication, and troubleshooting, see [MCP Servers](/claude-code/mcp).

## 7. Create custom plugins

Plugins are packaged extensions that can be shared with your team or the community. A plugin directory looks like this:

```text
my-plugin/
├── plugin.json          # Plugin metadata and configuration
├── commands/
│   └── analyze.md       # Skills bundled with the plugin
└── rules/
    └── conventions.md   # Rules bundled with the plugin
```

For the plugin specification and publishing process, see [Plugins](/claude-code/plugins).

## 8. Performance optimization

**Model selection:** Use `--model` to choose the right model for the task. Use faster models for simple queries, more capable models for complex reasoning.

**Context management:** Long sessions accumulate context. Use these strategies:

- `/compact` to summarize and free up context when the conversation grows large
- `/clear` to start fresh when switching to an unrelated task
- `context: fork` in subagent calls to give subagents a clean context window

**Targeted file access:** Guide Claude Code to the right files by being specific in your prompts. "Fix the bug in `src/auth/token.ts`" is faster than "Fix the auth bug."

For more context management strategies, see [Managing Context](/claude-code/context).

## 9. Complete settings.json

Here's a full `.claude/settings.json` combining permissions, hooks, and MCP servers:

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm run test*)",
      "Bash(npm run lint*)",
      "Bash(npx prettier*)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(git push --force*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "npx prettier --write $CLAUDE_FILE_PATH"
      }
    ],
    "TaskCompleted": [
      {
        "command": "npm run lint -- --fix"
      }
    ]
  },
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

## 10. Complete project structure

A fully configured pro setup looks like this:

```text
your-project/
├── CLAUDE.md                              # Project memory
├── .claude/
│   ├── settings.json                      # Permissions + hooks + MCP
│   ├── commands/
│   │   ├── review.md                      # Code review skill
│   │   └── feature.md                     # Feature workflow skill
│   ├── rules/
│   │   ├── api-conventions.md             # API patterns
│   │   └── testing-standards.md           # Test requirements
│   └── plugins/
│       └── my-plugin/                     # Custom plugin
│           ├── plugin.json
│           ├── commands/
│           │   └── analyze.md
│           └── rules/
│               └── conventions.md
├── .github/
│   └── workflows/
│       └── ai-review.yml                  # CI integration
└── ~/.claude/
    └── CLAUDE.md                          # User-level memory (global)
```

With this setup, Claude Code auto-formats your files, respects your permission boundaries, has access to external tools via MCP, and can run in CI for automated reviews. You have reusable workflows for common tasks and can scale to parallel agent teams when needed.
