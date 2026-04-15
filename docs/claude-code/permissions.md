---
sidebar_position: 5
sidebar_label: Permissions
description: Configure Claude Code's layered permission system to control which tools can run and which files can be accessed at project and user levels.
keywords: [Claude Code permissions, settings.json, allow list, deny list, tool permissions, file access control, security, permission levels, permission modes, bypassPermissions, acceptEdits]
---

# Permissions

Claude Code uses a layered permission system to control which tools can run and which files can be accessed.

## Permission modes

Claude Code supports several permission modes that change how much Claude prompts for approval. Switch modes mid-session with **Shift+Tab** (CLI) or the mode selector (VS Code, Desktop, Web), or set a persistent default in your settings.

| Mode | What runs without asking | Best for |
|------|-------------------------|----------|
| `default` | Read-only operations | Getting started, sensitive work |
| `acceptEdits` | Reads, file edits, and common filesystem commands (`mkdir`, `touch`, `mv`, `cp`, etc.) | Iterating on code you're reviewing |
| `plan` | Read-only (Claude analyzes but cannot modify files) | Exploring a codebase before changing it |
| `auto` | Everything, with background safety checks | Long tasks, reducing prompt fatigue |
| `dontAsk` | Only pre-approved tools | Locked-down CI and scripts |
| `bypassPermissions` | Everything except protected paths | Isolated containers and VMs only |

Set a default mode in your settings:

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

Or start a session in a specific mode:

```bash
claude --permission-mode plan
```

### acceptEdits mode

Automatically approves file edits and common filesystem commands within your working directory. Useful when you want to review changes in your editor after the fact rather than approving each edit inline.

### plan mode

Claude can read files and run shell commands to explore, but cannot edit source files. Enter plan mode with `/plan` or `Shift+Tab`, or start with `--permission-mode plan`.

### auto mode

Uses a classifier model to evaluate each tool call before execution. Safe actions proceed automatically, risky ones get blocked. See the [Auto Mode](./auto-mode) page for full details.

### dontAsk mode

Auto-denies every tool not explicitly allowed. Only actions matching your `permissions.allow` rules can execute. Designed for CI pipelines or restricted environments where you pre-define exactly what Claude may do.

### bypassPermissions mode

Disables permission prompts and safety checks so tool calls execute immediately. **Only use in isolated environments like containers or VMs.** Protected paths still prompt to prevent accidental corruption.

```bash
claude --permission-mode bypassPermissions
# or equivalently:
claude --dangerously-skip-permissions
```

Administrators can block this mode by setting `permissions.disableBypassPermissionsMode` to `"disable"` in managed settings.

## Permission levels

Permissions are configured in `.claude/settings.json` (project) or `~/.claude/settings.json` (user):

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm run *)",
      "Bash(npx prettier *)",
      "Edit(src/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Edit(.env*)"
    ]
  }
}
```

Rules are evaluated in order: **deny → ask → allow**. The first matching rule wins, so deny rules always take precedence.

## Permission rule syntax

Rules follow the format `Tool` or `Tool(specifier)`.

### Match all uses of a tool

Use just the tool name without parentheses to match every use:

| Rule | Effect |
|------|--------|
| `Bash` | All Bash commands |
| `Read` | All file reads |
| `Edit` | All file edits |
| `WebFetch` | All web fetch requests |

### Wildcard patterns

Bash rules support glob patterns with `*`, which can appear anywhere in the command:

| Pattern | What it allows |
|---------|----------------|
| `Bash(npm run *)` | Any npm script |
| `Bash(npx prettier *)` | Prettier formatting only |
| `Bash(git commit *)` | Any git commit command |
| `Bash(* --version)` | Any version check |

A space before `*` enforces a word boundary: `Bash(ls *)` matches `ls -la` but not `lsof`.

### Read and Edit path rules

Path rules for `Read` and `Edit` follow gitignore pattern types:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `//path` | Absolute path from filesystem root | `Read(//etc/hosts)` |
| `~/path` | Path from home directory | `Read(~/.zshrc)` |
| `/path` | Path relative to project root | `Edit(/src/**/*.ts)` |
| `path` or `./path` | Path relative to current directory | `Edit(src/**)` |

### MCP tool rules

```text
mcp__puppeteer          # All tools from the puppeteer server
mcp__puppeteer__*       # Same using wildcard syntax
mcp__puppeteer__navigate # One specific tool
```

### Agent (subagent) rules

```text
Agent(Explore)          # Matches the Explore subagent
Agent(Plan)             # Matches the Plan subagent
Agent(my-agent)         # Matches a custom subagent
```

## Working directories

By default, Claude has access to files in the directory where it was launched. Extend access with:

```bash
# At startup:
claude --add-dir /path/to/other/dir

# During a session:
/add-dir /path/to/other/dir
```

Or configure persistently in settings:

```json
{
  "additionalDirectories": ["/path/to/shared-config"]
}
```

## Managed settings

For organizations, administrators can deploy managed settings that cannot be overridden by user or project settings. Place these in the managed policy location for your OS and distribute via MDM or Group Policy.

Key managed-only settings:

| Setting | Effect |
|---------|--------|
| `permissions.disableBypassPermissionsMode: "disable"` | Prevents users from using bypassPermissions mode |
| `permissions.disableAutoMode: "disable"` | Prevents users from enabling auto mode |
| `allowManagedPermissionRulesOnly: true` | Only managed allow/ask/deny rules apply; user/project rules are ignored |

## Settings precedence

Permission rules follow this precedence order (higher overrides lower):

1. **Managed settings** (cannot be overridden)
2. **Command line arguments** (session-only overrides)
3. **Local project settings** (`.claude/settings.local.json`)
4. **Shared project settings** (`.claude/settings.json`)
5. **User settings** (`~/.claude/settings.json`)

If a tool is denied at any level, no other level can allow it.

## Sandbox mode

For additional OS-level isolation, use `/sandbox` or `--sandbox` to restrict what Bash commands can access at the filesystem and network level. Permissions and sandboxing are complementary: permissions control which tools Claude uses, sandboxing enforces OS-level restrictions on what those tools can reach.
