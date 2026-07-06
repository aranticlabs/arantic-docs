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
| `bypassPermissions` | Everything, including protected paths | Isolated containers and VMs only |

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

Disables permission prompts and safety checks so tool calls execute immediately. **Only use in isolated environments like containers or VMs.** As of v2.1.126 this also bypasses writes to protected paths. Explicit `ask` rules still force a prompt, and removals targeting the filesystem root or home directory (`rm -rf /`, `rm -rf ~`) still prompt as a circuit breaker against model error.

```bash
claude --permission-mode bypassPermissions
# or equivalently:
claude --dangerously-skip-permissions
```

On Linux and macOS, Claude Code refuses to start in this mode when running as root or under `sudo` (the check is skipped inside a recognized sandbox). Administrators can block this mode by setting `permissions.disableBypassPermissionsMode` to `"disable"` in managed settings.

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
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Edit(.env*)"
    ]
  }
}
```

Rules are evaluated in order: **deny → ask → allow**. The first matching rule wins, so deny rules always take precedence. The `ask` array prompts for confirmation before executing matching tool calls, even in modes that would otherwise auto-approve them.

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

### Match by input parameter

Deny and ask rules can match a tool's top-level input parameter with the `Tool(param:value)` syntax (requires Claude Code v2.1.178 or later). The rule matches when Claude calls the tool with that parameter set to that exact value:

| Rule | Matches |
|------|---------|
| `Agent(model:opus)` | Subagent spawns that request the Opus model tier |
| `Agent(isolation:worktree)` | Subagent spawns that request a git worktree |
| `Bash(run_in_background:true)` | Bash calls that run in the background |

The value accepts `*` as a wildcard, so `Agent(isolation:*)` matches any explicit isolation value. Each rule names one parameter; to gate on two parameters, write two separate rules. Parameter matching only applies to `deny` and `ask` rules; allow rules continue to use each tool's own specifier syntax.

### Tool name wildcards

Deny and ask rules also accept a glob in the tool-name position. `"*"` matches every tool, and `"mcp__*"` matches every MCP tool across all servers, which is the simplest way to deny a whole class of tools at once:

```json
{
  "permissions": {
    "deny": ["mcp__*"]
  }
}
```

Allow rules accept a tool-name glob only after a literal `mcp__<server>__` prefix (for example `mcp__github__get_*`); an unanchored allow glob like `"*"` is skipped with a warning. A deny or ask rule whose tool name matches no known tool produces a startup warning to catch typos.

### Read and Edit path rules

Path rules for `Read` and `Edit` follow gitignore pattern types:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `//path` | Absolute path from filesystem root | `Read(//etc/hosts)` |
| `~/path` | Path from home directory | `Read(~/.zshrc)` |
| `/path` | Path relative to project root | `Edit(/src/**/*.ts)` |
| `path` or `./path` | Path relative to current directory | `Edit(src/**)` |

### PowerShell rules

On Windows, Claude Code uses PowerShell alongside Bash. PowerShell rules follow the same syntax as Bash rules:

```json
{
  "permissions": {
    "allow": [
      "PowerShell(Get-ChildItem *)",
      "PowerShell(git commit *)"
    ],
    "deny": [
      "PowerShell(Remove-Item *)"
    ]
  }
}
```

Matching is case-insensitive and common aliases are canonicalized, so `PowerShell(Get-ChildItem *)` also matches `gci`, `ls`, and `dir`. A bare `PowerShell` or `PowerShell(*)` matches every PowerShell command.

### Built-in read-only commands

Claude Code recognizes a set of Bash commands as read-only and runs them without a permission prompt in every mode. These include `ls`, `cat`, `echo`, `pwd`, `head`, `tail`, `grep`, `find`, `wc`, `which`, `diff`, `stat`, `du`, `cd`, and read-only forms of `git`. This set is not configurable; to require a prompt for any of these, add an `ask` or `deny` rule for it.

Unquoted glob patterns are permitted for commands whose every flag is read-only, so `ls *.ts` and `wc -l src/*.py` run without a prompt. Commands with write-capable or exec-capable flags still prompt when an unquoted glob is present.

A `cd` into a path inside your working directory or an additional directory is also read-only. A compound command like `cd packages/api && ls` runs without a prompt when each part qualifies on its own.

### MCP tool rules

```text
mcp__puppeteer          # All tools from the puppeteer server
mcp__puppeteer__*       # Same using wildcard syntax
mcp__puppeteer__navigate # One specific tool
```

### Agent (subagent) rules

Use `Agent(AgentName)` rules to control which subagents Claude can use:

```text
Agent(Explore)          # Matches the Explore subagent
Agent(Plan)             # Matches the Plan subagent
Agent(my-agent)         # Matches a custom subagent
```

Add these to the `deny` array in your settings or use the `--disallowedTools` CLI flag to disable specific agents:

```json
{
  "permissions": {
    "deny": ["Agent(Explore)"]
  }
}
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

To change the session's primary working directory rather than adding another, use the `/cd` command (v2.1.169 or later). Unlike `/add-dir`, it relocates the session and loads the new directory's `CLAUDE.md`. Restrict where `/cd` can move with `Cd(<path>)` deny or allow rules; a bare `Cd` deny rule disables the command entirely.

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

For additional OS-level isolation, use `/sandbox` or `--sandbox` to restrict what Bash commands can access at the filesystem and network level.

Permissions and sandboxing are complementary security layers:

- **Permissions** control which tools Claude Code can use and which files or domains it can access. They apply to all tools (Bash, Read, Edit, WebFetch, MCP, and others).
- **Sandboxing** provides OS-level enforcement that restricts Bash commands and their child processes. It applies only to Bash, but does so at the OS level regardless of what Claude decides.

Use both for defense-in-depth: permission deny rules block Claude from even attempting restricted actions, while sandbox restrictions catch anything that slips through (such as prompt injection bypassing Claude's judgment).
