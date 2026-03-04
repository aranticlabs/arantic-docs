---
sidebar_position: 2
---

# CLAUDE.md

Create a `CLAUDE.md` file at the root of your project to give Claude Code persistent context: coding conventions, project structure, commands to run, things to avoid.

```markdown
# Project conventions
- TypeScript strict mode, no `any`
- All API routes must have Zod validation
- Run `npm test` before committing
- Never modify migration files
```

## Keep it short

A well-structured CLAUDE.md is the single most impactful way to improve Claude Code's output, but bigger is not better. **Keep your CLAUDE.md under 60 lines.** Files over 150 lines degrade performance because they consume too much of the context window before the real work begins.

Focus on what matters most:
- Build and test commands
- Non-obvious coding conventions
- Files and directories that should not be modified
- Architecture decisions that affect every task

Leave out anything Claude can figure out by reading the code itself (language, framework, obvious patterns).

## Monorepo strategy

In monorepos, use multiple CLAUDE.md files instead of one large root file:

```text
repo/
├── CLAUDE.md              # Shared conventions (formatting, git workflow, CI)
├── packages/
│   ├── frontend/
│   │   └── CLAUDE.md      # React/TypeScript rules, component patterns
│   └── backend/
│       └── CLAUDE.md      # Go conventions, API patterns, database rules
```

Claude Code loads these hierarchically:
- **Ancestor loading**: walks upward from the working directory at startup, always loading parent CLAUDE.md files
- **Descendant loading**: lazy-loads subdirectory CLAUDE.md files when files in those directories are accessed

This means the root file's rules apply everywhere, while component-specific rules only load when relevant, saving context.

## Personal preferences with CLAUDE.local.md

For personal preferences that should not be shared with the team, create a `CLAUDE.local.md` file (add it to `.gitignore`):

```markdown
# My preferences
- Use verbose variable names
- Add comments explaining complex logic
- Always show me the diff before committing
```

:::note
Claude Code loads `CLAUDE.local.md` automatically at session start, the same way it loads `CLAUDE.md`. You do not need to reference it from `CLAUDE.md`. Just place the file in the same directory (typically the project root) and it will be picked up. The only setup required is adding `CLAUDE.local.md` to your `.gitignore` so it stays out of version control.
:::
