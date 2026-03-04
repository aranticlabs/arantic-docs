---
sidebar_position: 3
sidebar_label: Managing Context
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
