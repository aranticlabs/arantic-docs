---
sidebar_position: 1
sidebar_label: Setup
description: Configure Claude Code's full memory system, permissions, custom skills, subagents, MCP servers, and CLI flags for a customized intermediate workflow.
keywords: [Claude Code intermediate, memory system, permissions, skills, subagents, MCP servers, CLI flags, CLAUDE.md, configuration]
---

# Intermediate Setup

This guide assumes you have Claude Code installed with a basic CLAUDE.md. If not, complete the [Starter setup](../starter/setup) first.

Here you'll configure the full memory system, permissions, custom skills, subagents, MCP servers, and CLI flags to build a customized workflow.

## 1. Full memory system

Claude Code reads memory files at multiple levels. Set them up to give Claude Code the right context everywhere.

**User-level memory** (`~/.claude/CLAUDE.md`) applies to all your projects:

```markdown
# User preferences

- Always use TypeScript strict mode
- Prefer functional components over class components
- Use pnpm as package manager
- Write tests for all new functions
```

**Project rules** (`.claude/rules/`) let you organize project context into focused files:

```markdown
<!-- .claude/rules/api-conventions.md -->
- All API endpoints return { data, error } shape
- Use zod for request validation
- Authentication middleware is in src/middleware/auth.ts
- Rate limiting is configured per-route in src/config/routes.ts
```

Rules files are loaded automatically. Use them for domain-specific context that would clutter your main CLAUDE.md.

For the complete memory hierarchy and precedence rules, see [Memory](/claude-code/memory).

## 2. Configure permissions

Control what Claude Code can do without asking by editing `.claude/settings.json`:

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
      "Bash(git push*)"
    ]
  }
}
```

The `allow` list lets tools run without prompting. The `deny` list blocks them entirely. Everything else prompts for approval.

For full permission configuration and scoping, see [Permissions](/claude-code/permissions).

## 3. Create custom skills

Skills are reusable prompt templates stored as `SKILL.md` files under `.claude/skills/<name>/`. Create one:

```markdown
# .claude/skills/review/SKILL.md
Review the current git diff for:
1. Logic errors or bugs
2. Missing error handling
3. Security concerns (injection, auth bypass)
4. Performance issues

For each finding, state the file, line, issue, and suggested fix.
```

Use it in a session by typing `/review`. You can pass arguments with `$ARGUMENTS` in the template.

For more on creating and organizing skills, see [Skills](/claude-code/skills).

## 4. Use and create subagents

Claude Code has three built-in subagent types that handle subtasks without cluttering your main conversation:

- **Explore** for codebase research
- **Plan** for architectural design
- **General-purpose** for multi-step tasks

You can reference subagents in your skills:

```markdown
# .claude/skills/investigate/SKILL.md
Use a subagent to explore the codebase and find all usages of $ARGUMENTS.
Then summarize the patterns you find and suggest whether this API surface
can be simplified.
```

For details on how subagents work and how to use them effectively, see [Subagents](/claude-code/subagents).

## 5. CLI flags for scripting

These flags are useful when integrating Claude Code into scripts or custom workflows:

| Flag | Purpose | Example |
|------|---------|---------|
| `--print` / `-p` | Single response, no interactive session | `claude -p "Explain this error"` |
| `--continue` / `-c` | Resume the most recent session | `claude -c` |
| `--model` | Choose a specific model | `claude --model opus` |
| `--output-format` | Machine-readable output | `claude -p "List files" --output-format json` |
| `--allowedTools` | Restrict available tools | `claude -p "Read src/" --allowedTools Read,Glob` |
| `--max-turns` | Limit agentic rounds | `claude -p "Fix tests" --max-turns 10` |

For the complete flag reference, see [Flags](/claude-code/flags).

## 6. Add MCP servers

MCP (Model Context Protocol) servers connect Claude Code to external tools and data sources. Configure them in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

This gives Claude Code access to up-to-date library documentation through the Context7 server.

For more MCP server options and configuration, see [MCP Servers](/claude-code/mcp).

## 7. Install plugins

Plugins extend Claude Code with community-built capabilities. Browse and install them:

```text
/plugins
```

Follow the interactive prompts to search, preview, and install plugins.

For plugin management details, see [Plugins](/claude-code/plugins).

## 8. Your project structure

After completing this setup, your project should have these Claude Code files:

```text
your-project/
├── CLAUDE.md                          # Project-level memory
├── .claude/
│   ├── settings.json                  # Permissions + MCP servers
│   ├── skills/
│   │   └── review/
│   │       └── SKILL.md               # Custom skill
│   └── rules/
│       └── api-conventions.md         # Project rules
└── ~/.claude/
    └── CLAUDE.md                      # User-level memory (global)
```

## Next steps

Ready for full automation? Continue to the [Pro guide](../pro/setup) to set up hooks, agent teams, CI integration, and advanced workflows.
