---
sidebar_position: 5
sidebar_label: Permissions
description: Configure Claude Code's layered permission system to control which tools can run and which files can be accessed at project and user levels.
keywords: [Claude Code permissions, settings.json, allow list, deny list, tool permissions, file access control, security, permission levels]
---

# Permissions

Claude Code uses a layered permission system to control which tools can run and which files can be accessed.

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

## Wildcard syntax

Use wildcard patterns to grant scoped permissions without blanket access. This is much safer than `dangerously-skip-permissions`:

| Pattern | What it allows |
|---------|----------------|
| `Bash(npm run *)` | Any npm script |
| `Bash(npx prettier *)` | Prettier formatting only |
| `Edit(src/**)` | Editing any file under src/ |
| `Edit(docs/**)` | Editing any file under docs/ |
| `Read` | Reading any file (no restriction) |

## Auto mode

For a middle ground between manual confirmations and skipping permissions entirely, use [auto mode](/claude-code/auto-mode). A classifier model evaluates each tool call and automatically approves safe actions while blocking risky ones. Enable it with:

```bash
claude --enable-auto-mode
```

See the [Auto Mode](/claude-code/auto-mode) page for full configuration details.

## Sandbox mode

For additional isolation, use `/sandbox` to restrict file system access and network connections. This reduces permission prompts for trusted operations while keeping untrusted ones blocked.
