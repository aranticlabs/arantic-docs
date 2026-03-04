---
sidebar_position: 4
sidebar_label: Permissions
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

## Sandbox mode

For additional isolation, use `/sandbox` to restrict file system access and network connections. This reduces permission prompts for trusted operations while keeping untrusted ones blocked.
