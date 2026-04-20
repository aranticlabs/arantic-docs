---
sidebar_position: 4
sidebar_label: Managing Context
description: Learn how to manage Claude Code's context window effectively by using /compact proactively and structuring sessions to maintain output quality.
keywords: [Claude Code context, context window, /compact, context management, token usage, session management, context limit, compaction, extended thinking, effort level, adaptive reasoning]
---

# Managing Context

Claude Code's output quality degrades as the context window fills up. Understanding and managing context usage is critical for long sessions.

## The compaction threshold

When context usage grows large, Claude Code's responses become less focused and more prone to errors. **Run `/compact` proactively when you reach roughly 50% context usage.** Do not wait for the automatic compaction, which triggers much later and may already be past the point of optimal performance.

## Practical tips

- **Check context usage** with the status line or `/cost` command to see how much of the window you have used
- **Start new sessions** for unrelated tasks instead of reusing a long-running session
- **Size subtasks** so each one can complete well within 50% of available context
- **Use subagents** for noisy tasks (large searches, exploring unfamiliar code) so the main context stays clean

## Checkpointing

Claude Code automatically tracks file edits with git-based checkpoints. If something goes wrong, you can rewind to a previous state:

- Press `Esc` twice to undo the last set of changes
- Use `/rewind` to go back to a specific checkpoint

This makes it safe to let Claude Code try ambitious changes: you can always roll back.

## Extended thinking

Claude Code enables extended thinking by default, giving Claude space to reason through complex problems before responding. Thinking is most valuable for architectural decisions, challenging bugs, multi-step planning, and tradeoff analysis.

### Effort levels

On supported models (Sonnet 4.6, Opus 4.6, Opus 4.7), thinking uses **adaptive reasoning**: the model dynamically allocates thinking tokens based on your effort level and the task at hand. This means Claude responds faster to routine prompts and reserves deeper thinking for steps that benefit from it.

| Way to adjust | How |
|---------------|-----|
| `/effort [level]` | Set session effort: `low`, `medium`, or `high` |
| `--effort <level>` | Set effort at startup via CLI flag |
| `CLAUDE_CODE_EFFORT_LEVEL` | Set effort via environment variable |
| `Option+T` (macOS) / `Alt+T` | Toggle thinking on or off for the current session |
| `/config` | Set a global default across all projects |
| `ultrathink` in prompt | Adds an in-context instruction for deeper reasoning on that turn (does not change your effort level setting) |

### Viewing thinking

Press `Ctrl+O` to toggle verbose mode. Claude's internal reasoning appears as gray italic text. In interactive mode, thinking is collapsed by default; set `showThinkingSummaries: true` in `settings.json` to expand it.

### Limiting thinking tokens

Use the `MAX_THINKING_TOKENS` environment variable to cap the thinking budget. On models with adaptive reasoning, only `0` applies unless you also set `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1` to revert to a fixed budget.
