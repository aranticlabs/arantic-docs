---
sidebar_position: 3
---

# Skills (Custom Slash Commands)

Skills are reusable prompt templates that let you encode recurring tasks, team conventions, and workflows into short, invocable commands. Instead of re-typing the same instructions every session, you define them once and invoke them with a `/` prefix.

Claude Code has the most mature built-in support for skills. Other tools offer partial equivalents, which are covered in the [Using skills with other tools](#using-skills-with-other-tools) section below.

## How skills work in Claude Code

Claude Code treats any `.md` file inside `.claude/commands/` as a skill. The filename becomes the command name.

### Creating a skill

```bash
mkdir -p .claude/commands
```

Create a Markdown file with your prompt:

```markdown
# .claude/commands/review.md

Review the staged git changes and provide a concise summary of:
- What was changed and why
- Any potential bugs or regressions introduced
- Missing tests or edge cases
- Whether the commit message accurately describes the changes
```

Invoke it in Claude Code:

```text
/review
```

### Project-level vs. user-level skills

| Location | Scope | Use case |
|---|---|---|
| `.claude/commands/` | Project-specific, shared via git | Team workflows, project conventions |
| `~/.claude/commands/` | Personal, all projects | Your own recurring prompts |

Commit `.claude/commands/` to source control so the whole team benefits from shared skills.

### Parameterizing skills with `$ARGUMENTS`

Use the `$ARGUMENTS` placeholder to pass dynamic input at invocation time:

```markdown
# .claude/commands/explain.md

Explain the following code in plain language, suitable for a junior developer.
Focus on what it does, not how it works internally.

$ARGUMENTS
```

Invoke with:

```text
/explain src/auth/token.ts
```

Claude Code replaces `$ARGUMENTS` with everything you type after the command name.

### Practical examples

**Generate a pull request description:**

```markdown
# .claude/commands/pr-desc.md

Look at the diff between the current branch and main. Write a pull request description that includes:
- A one-sentence summary of the change
- A bullet list of what was changed and why
- Any migration steps or breaking changes
- Testing instructions

Keep it concise and use plain English.
```

**Enforce a code review checklist:**

```markdown
# .claude/commands/checklist.md

Review $ARGUMENTS against our team checklist:
- No `any` types in TypeScript
- All public functions have JSDoc comments
- Error paths are handled explicitly
- No hardcoded secrets or environment-specific values
- Unit tests cover the happy path and at least one failure path

Report each item as passed, failed, or not applicable.
```

**Scaffold a new API endpoint:**

```markdown
# .claude/commands/new-endpoint.md

Scaffold a new REST endpoint named $ARGUMENTS following our conventions:
- Route file in src/routes/
- Zod schema for request validation
- Service function in src/services/
- Unit test file with at least one passing and one failing test case
- Add the route to src/routes/index.ts
```

**Summarize recent changes for a standup:**

```markdown
# .claude/commands/standup.md

Look at all commits from the last 24 hours on the current branch.
Summarize what was done in 3-5 bullet points, written in first person,
suitable for a morning standup update. Be brief.
```

## Tips for writing effective skills

- **Be specific about output format.** If you want bullet points, say so. If you want a table, say so.
- **Include constraints.** Skills that say "keep it concise" or "no more than 5 items" produce more consistent results.
- **Use `$ARGUMENTS` for the variable part, not the whole prompt.** The skill should carry your stable instructions; arguments supply the target.
- **Version your skills in git.** Treat `.claude/commands/` like source code. Improve skills over time as you learn what produces better results.
- **Name skills for their action.** `review`, `explain`, `scaffold`, `standup` are easy to remember. Avoid generic names like `help` or `prompt`.

## Using skills with other tools

The concept of a persistent, invocable prompt template does not map identically to every tool. Here is how to get similar functionality in the most common alternatives.

### OpenAI Codex CLI

The Codex CLI (OpenAI's terminal-based coding agent) does not have a built-in slash command or skills system. You can approximate skills in two ways:

**Option 1: Shell aliases or wrapper scripts.** Create a shell function that prepends your standard instructions before sending to the CLI:

```bash
# ~/.bashrc or ~/.zshrc
codex-review() {
  codex "Review the staged git changes and summarize potential bugs, missing tests, and whether the commit message is accurate. $*"
}
```

**Option 2: A prompts directory with a loader script.** Store your templates as plain text files and source them at invocation:

```bash
#!/usr/bin/env bash
# ~/bin/codex-skill
SKILL_DIR="$HOME/.codex/skills"
SKILL="$1"; shift
PROMPT=$(cat "$SKILL_DIR/$SKILL.txt")
codex "${PROMPT} $*"
```

There is no native equivalent to project-level shared skills. Keep prompt files in your repository and use the loader script approach above as a team convention.

### Cursor

Cursor does not support custom `/` slash commands defined by you. Its slash commands (like `/edit` and `/explain`) are built-in and not extensible in the same way.

The closest alternatives in Cursor are:

**Notepads.** Notepads are persistent context blocks you can `@mention` in any Cursor chat. Store your reusable prompts there:

1. Open the Notepads panel
2. Create a notepad named "review-checklist" with your standard review prompt
3. In chat: `@review-checklist please review the selected code`

**`.cursorrules`.** For project-wide instructions that apply to every prompt automatically (without needing to invoke anything), add them to `.cursorrules` at the project root. This is less flexible than skills because it always applies, rather than being invoked on demand.

**Saved prompts in chat.** You can copy-paste from a shared `prompts/` directory in your repository. Less ergonomic, but functional for teams without extra tooling.

### Gemini CLI

The Gemini CLI (Google's terminal agent for Gemini models) supports a `GEMINI.md` file at the project root for persistent context, similar to Claude Code's `CLAUDE.md`. As of early 2026, it does not have a built-in slash command or skills system.

To replicate skills in Gemini CLI:

- Use shell functions or wrapper scripts (same pattern as Codex CLI above).
- Place your prompt templates in a `prompts/` directory in your repository and reference them explicitly:

```bash
gemini "$(cat prompts/review.md)"
```

Or define a shell helper:

```bash
gemini-skill() {
  local skill="$1"; shift
  gemini "$(cat ~/gemini-skills/$skill.md) $*"
}

gemini-skill review
```

You can use `GEMINI.md` to document the available skills and how to invoke them, so the model is aware of the convention even if it cannot auto-invoke them.

### Grok CLI

Grok (xAI) is available via API and through a CLI tool. Like Gemini CLI and Codex CLI, it does not have a built-in skills or custom slash command system.

The same shell wrapper approach applies:

```bash
grok-skill() {
  local skill="$1"; shift
  grok "$(cat ~/grok-skills/$skill.md) $*"
}
```

Grok supports system prompts through the API, which is useful if you are building a custom integration. For recurring prompts in direct CLI use, shell wrappers are the practical solution.

### Summary: skills support across tools

| Tool | Built-in skills / slash commands | Project-level sharing | Closest alternative |
|---|---|---|---|
| Claude Code | Yes (`.claude/commands/*.md`) | Yes (committed to git) | Native feature |
| Codex CLI | No | No | Shell wrappers + shared prompts dir |
| Cursor | No (built-ins only) | No | Notepads, `.cursorrules` |
| Gemini CLI | No | Via `GEMINI.md` (context only) | Shell wrappers + prompts dir |
| Grok CLI | No | No | Shell wrappers + prompts dir |

If your team relies heavily on shared, reusable prompts, Claude Code's native skills system is the most ergonomic option. For other tools, the pattern of storing prompts as files in your repository and loading them via shell scripts achieves a similar result with more manual setup.
