---
sidebar_position: 17
sidebar_label: Tips
description: Practical Codex tips grouped by theme, covering prompting, scoping, reviewing, AGENTS.md, approvals, parallel work, and model and reasoning effort choices.
keywords: [Codex tips, best practices, prompting, AGENTS.md, plan mode, reasoning effort, approvals, worktrees, code review, productivity]
---

# Tips

Codex is strong enough to produce useful results from an imperfect prompt, but the habits below make results reliable, especially in large codebases and higher-stakes tasks. They are drawn from the official best-practices, prompting, and long-running-work guides.

## Prompting

- **Include four things** in any non-trivial prompt: the **goal**, the **context** (files, docs, errors, examples; `@` mention files), the **constraints** (architecture, conventions, safety), and **done when** (tests pass, behavior changes, bug no longer reproduces).
- **Describe the result, not the steps.** Leave Codex room to search, compare, and adjust unless the process itself matters.
- **Give a reproduction recipe for bugs**, not a description. Numbered repro steps and the suspected files matter more than prose.
- **Ask for a final check** on important work: "confirm every test case maps to a requirement" or "flag anything you could not verify".
- **Iterate with follow-ups** instead of restarting. While Codex works, press `Enter` to steer the current turn or `Tab` to queue a message for the next one.
- **Set one or two boundaries that prevent real problems** ("do not change the API shape", "keep the fix minimal"). You do not need to control every step.
- **Use dictation** in the desktop app (`Ctrl+Shift+D`) when explaining context is faster than typing it.

**Weak:**

```text
Fix the save bug on the settings page.
```

**Strong:**

```text
Bug: clicking Save on /settings shows "Saved" but the change does not persist.
Repro: npm run dev, open /settings, toggle "Enable alerts", Save, refresh: toggle resets.
Constraints: do not change the API shape; keep the fix minimal; add a regression test.
Done when: the repro no longer reproduces and the test suite passes.
Start by reproducing locally, then propose a patch and run checks.
```

## Scoping and planning

- **Plan first for complex or ambiguous work.** Toggle plan mode with `/plan` (or `Shift+Tab`) so Codex gathers context and asks questions before editing.
- **Ask Codex to interview you** when you have a fuzzy idea: tell it to challenge your assumptions and turn the idea into something concrete before writing code.
- **Use `/goal` for multi-step work.** The goal text becomes both the first prompt and the completion criteria; include outcome, constraints, and verification.
- **One chat per coherent unit of work.** Staying in the same chat preserves the reasoning trail; fork (`/fork`) only when the work truly branches. One chat for a whole project bloats context and degrades results.
- **Compact long chats** with `/compact` when earlier context is no longer needed. Codex also compacts automatically.
- **Offload bounded work to subagents** (exploration, tests, triage) so the main agent stays on the core problem. Switch threads with `/agent`. See [Subagents](./subagents.md).
- **Do not skip planning on multi-step tasks** and do not treat Codex as something to watch step by step; run it in parallel with your own work.

## Reviewing

- **Let Codex see its own work.** Tell it (or `AGENTS.md`) how to run build, test, lint, and type checks, then ask it to run them and confirm the result before you accept.
- **Use `/review`** after Codex finishes: against a base branch, on uncommitted changes, on a commit, or with custom instructions. Follow up with `/diff` for the exact file changes, then re-run `/review` after fixes.
- **Leave inline comments** in the desktop app's review pane; line-specific feedback produces more precise fixes than a general instruction. Then send a message such as "Address the inline comments and keep the scope minimal."
- **Stage what you accept, revert what you do not**, per hunk or per file, before committing.
- **Keep a `code_review.md`** with your team's review checklist and reference it from `AGENTS.md` so reviews stay consistent across contributors.
- **Turn on Codex code review for PRs** if you use GitHub or GitLab; add `## Code Review Rules` to `AGENTS.md` for repository-specific checks. See [Codex Cloud & Remote](./cloud.md).
- **Always review answers and diffs.** Codex can make mistakes; review rules do not replace tests, branch protections, or required approvals.

## AGENTS.md

- **Scaffold with `/init`**, then edit it to match how your team actually builds, tests, reviews, and ships.
- **Cover the essentials:** repo layout, how to run the project, build/test/lint commands, conventions and PR expectations, do-not rules, and what "done" means.
- **Short and accurate beats long and vague.** Start with the basics and add rules only after you notice repeated mistakes.
- **Layer it:** `~/.codex/AGENTS.md` for personal defaults, a repo-level file for shared standards, nested files in subdirectories for local rules. The closest file wins.
- **Split when it grows:** keep the main file concise and reference task-specific Markdown files for planning, review, or architecture.
- **Run a retrospective** when Codex makes the same mistake twice, and turn the lesson into an `AGENTS.md` rule.
- **Move durable rules out of prompts** and into `AGENTS.md` or a skill; repeating them in every prompt is a common mistake. See [AGENTS.md & Memories](./agents-md.md).

## Approvals and sandbox

- **Start with the defaults.** Keep approvals and sandboxing tight, then loosen only for trusted repos or specific workflows once the need is clear.
- **Do not grant full access before you understand the workflow.** Prefer `--add-dir` for extra write access over `--sandbox danger-full-access`.
- **Change permissions mid-session with `/permissions`** instead of restarting.
- **Many quality problems are setup problems:** wrong working directory, missing write access, wrong model defaults, missing tools or connectors. Check `/status` first.
- **Use rules for specific exceptions** rather than broadening the sandbox for everything. See [Permissions & Sandbox](./permissions.md).
- **Keep cloud internet access off** unless a task needs it, and restrict domains and HTTP methods when you turn it on.

## Configuration

- **Personal defaults in `~/.codex/config.toml`, repo behavior in `.codex/config.toml`, CLI flags only for one-offs.** All surfaces (CLI, IDE, desktop app) share the same layers.
- **Use profiles** (`~/.codex/<name>.config.toml`, `--profile <name>`) for alternate setups such as a deep-review configuration.
- **Add MCP servers only when they unlock a real workflow.** Start with one or two that remove a manual loop, then expand. See [MCP](./mcp.md).
- **Turn repeated prompts into skills.** If you keep reusing the same prompt or correcting the same workflow, make it a `SKILL.md`, scoped to one job, with a description that says what it does and when to use it. Start with `$skill-creator`. See [Skills](./skills.md).
- **Schedule only stable workflows.** Skills define the method, scheduled tasks define the schedule. Make it reliable manually first. See [Automation & Non-interactive Mode](./automation.md).

## Parallel work

- **Never let two live chats edit the same files.** Use a worktree per chat, or the Cloud target, for anything that runs alongside your foreground work. See [Worktrees & Parallel Sessions](./worktrees.md).
- **Compare attempts** by running a cloud task with several attempts and picking the best diff.
- **Plan locally, execute remotely:** design the approach where Codex can see the whole codebase, then delegate implementation milestones to the cloud.
- **Use notifications and Activity view** to know when a chat needs input instead of polling it.
- **Keep the host awake** (**Prevent sleep while running**) for long local or Remote-controlled sessions.

## Models and reasoning effort

- **Match effort to difficulty:** low for fast, well-scoped tasks; medium or high for complex changes and debugging; extra high for long, agentic, reasoning-heavy work. Change it with `/model` or `/reasoning` and confirm with `/status`.
- **Test what works for your workflow.** Different users and tasks work best with different settings.
- **Use `/fast`** when a Fast service tier is available and latency matters more than depth.
- **Set `review_model`** in `config.toml` if you want reviews to run on a different model from the working session.
- **Watch context usage** with `/status` or a `/statusline` field; compact or start a new chat before quality drops.

## Compared with Claude Code

- Both tools reward the same fundamentals: specific prompts, small scoped tasks, plan mode before complex changes, and reviewing diffs before accepting. See [Claude Code Tips](../claude-code/tips.md).
- Codex's persistent guidance file is `AGENTS.md` (layered user, repo, subdirectory); Claude Code's is `CLAUDE.md` with `.claude/rules/`. Claude Code can import `AGENTS.md` so both read one source of truth.
- Codex adds `/goal` for long-running work with built-in completion criteria, and the Cloud target for background execution; Claude Code relies on Agent Teams and subagents for parallelism.
- Both expose reasoning depth as a knob: `/reasoning` (or the effort picker in `/model`) in Codex, `/effort` in Claude Code.
