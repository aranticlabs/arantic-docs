---
sidebar_position: 14
sidebar_label: Debugging
---

# Debugging

When things are not working as expected:

- **Run `/doctor`** for diagnostics. It checks your installation, configuration, and common issues.
- **Use background terminal tasks** for processes that produce logs (dev servers, watchers). This gives Claude better visibility into what is happening.
- **Provide screenshots** when debugging visual issues. Claude Code can read images.
- **Check `/mcp`** to verify MCP server connections if external tools are not responding.

## Environment tips

- **Use a standalone terminal** (iTerm2, Alacritty, Windows Terminal) rather than your IDE's built-in terminal. IDE terminals can cause stability issues with long-running sessions.
- **Enable the status line** to monitor context usage, active model, and session cost at a glance.
- **Use `/fast` mode** for quick, straightforward tasks. It uses the same model but with faster output. Note that fast mode is billed to extra usage from the first token.
