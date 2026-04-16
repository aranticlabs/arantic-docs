---
sidebar_position: 13
sidebar_label: Agent Teams
description: Agent Teams is a Claude Code feature that lets a lead agent spawn and coordinate multiple specialized agents working in parallel via a shared task list.
keywords: [Claude Code agent teams, parallel agents, multi-agent, tmux, agent coordination, task list, experimental feature, split pane]
---

# Agent Teams

Agent Teams is an experimental Claude Code feature that lets a lead agent spawn and coordinate multiple specialized teammate agents working in parallel. Teammates communicate through a shared task list and direct messaging, and can optionally be displayed side-by-side in split panes (via tmux or iTerm2).

Not sure whether you need Agent Teams or just subagents? See [Agents vs. subagents vs. Agent Teams](./subagents#agents-vs-subagents-vs-agent-teams).

## Do you need tmux?

**Short answer: no.** Agent Teams works perfectly fine without tmux or any extra tools. But most people who try both modes end up preferring split-pane mode for any serious work.

### The two modes compared

| Mode | How teammates appear | See all agents at once? | Best for |
|------|----------------------|------------------------|----------|
| **In-process** (default, no extra tools required) | All output in one terminal window; cycle between agents with `Shift+↑/↓` | No | Quick experiments, small teams (2–3 agents) |
| **Split-pane** (tmux or iTerm2) | Each teammate gets its own live visible pane | Yes; full command-center view | Regular use, 3+ teammates |

The official Claude Code docs state: *"Split-pane mode requires tmux or iTerm2… The default is `auto` which uses split panes if you're already running inside a tmux session, and in-process otherwise."*

### Recommendation

- **Just exploring Agent Teams?** Skip any extra setup. The default in-process mode works great.
- **Using Agent Teams regularly** (especially 4+ teammates on real projects)? Set up split-pane mode. Watching your AI team work in parallel panes is a significant productivity boost.

### Platform support for split-pane mode

macOS and Linux are the primary supported platforms. Split-pane mode works best there and is where most Agent Teams users run it.

| Platform | Split-pane option | Notes |
|----------|-------------------|-------|
| macOS | tmux **or** iTerm2 | Recommended: two solid options, pick whichever you already use |
| Linux | tmux | Recommended: install via your package manager |
| Windows (WSL) | tmux inside WSL | Works, but requires WSL |
| Windows (native) | Not yet supported | Use in-process mode; [Windows Terminal split-pane support is a requested feature](https://github.com/anthropics/claude-code/issues/24384) |

## What is tmux?

tmux is a free, open-source terminal multiplexer. It turns one terminal window into many by splitting it into panes running different things simultaneously: for example, a server in one pane, tests in another, logs in a third. You can also detach a session (close the window while everything keeps running) and re-attach later.

See the [tmux Reference](./tmux) page for key bindings, session management commands, and pane navigation shortcuts.

<img src="/img/docs/tmux-multi-agents.png" alt="Agent Teams tmux" />


## One-time setup (split-pane mode)

The steps below apply to **macOS and Linux** (the recommended platforms). Windows users without WSL can skip this section. In-process mode works out of the box; just set `"teammateMode": "in-process"` in Step B.

### Step A: Install a split-pane tool

#### Option 1: tmux (macOS, Linux, Windows via WSL) (recommended)

**macOS:**
```bash
brew install tmux
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install tmux
```

**Other Linux or Windows (WSL):** see the [tmux installation wiki](https://github.com/tmux/tmux/wiki/Installing).

#### Option 2: iTerm2 (macOS only)

If you already use iTerm2 as your terminal, you can use it instead of tmux:

1. Install the [`it2` CLI](https://github.com/mkusaka/it2):
   ```bash
   brew install it2
   ```
2. Enable the Python API in iTerm2: **Settings → General → Magic → Enable Python API**

That's it. Claude Code will detect iTerm2 automatically when `teammateMode` is set to `"tmux"` or `"auto"`.

### Step B: Configure Claude Code

Create or edit `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "teammateMode": "auto"
}
```

`teammateMode` options:
- `"auto"`: recommended; uses split panes if already inside tmux, otherwise falls back to in-process
- `"tmux"`: always use split-pane mode (auto-detects tmux or iTerm2)
- `"in-process"`: always use in-process mode (no extra tools needed)

To force a mode for a single session without editing `settings.json`:
```bash
claude --teammate-mode in-process
```

### Step C: Start a tmux session (split-pane mode only)

Skip this step if you want to use in-process mode. For split-pane mode, run this before launching Claude:

```bash
tmux new-session -s claude-team
```

Then inside tmux, run:

```bash
claude
```

Your main session becomes the lead agent. Teammates automatically appear in split panes. With `"auto"` mode, Claude detects that it's running inside tmux and switches to split-pane mode automatically.


:::note Pro tip

Add this alias to your shell config to start the tmux session and launch Claude in one command:

- macOS (default): `~/.zshrc`
- Linux / older macOS: `~/.bashrc`

```bash
alias claude-team='tmux new-session -s claude-team -c "$PWD" \; send-keys "claude" C-m'
```

After saving the file, reload it (`source ~/.zshrc` or `source ~/.bashrc`), then start Agent Teams from any project directory with:

```bash
claude-team
```

:::

## Prompts for common workflows

Paste these into the lead agent to spin up a pre-configured team.

### Full-stack feature team (5 agents)

```
Create an agent team for building: "User profile dashboard with dark mode toggle and real-time activity feed".

Spawn 5 teammates:
- Architect – overall design + coordination
- Backend – API routes, database models, auth
- Frontend – React components, Tailwind, state management
- QA – unit + integration tests, edge cases
- Security – finds flaws, security issues, performance problems

Rules:
- Teammates message each other directly when they need info
- Architect coordinates and has final say on design decisions
- NO plan approval required — proceed autonomously
- Write plans to .claude/plans/ before implementing
- Security and QA review AFTER implementation, not before
- Summarize all changes when complete
```

> **Why no plan approval?** Adding "require plan approval" causes every agent to pause in plan mode and wait for a human response before continuing. Since you can switch between agents in the tmux session but each one is blocked, the whole team stalls. Writing plans to `.claude/plans/` captures the planning artifact without blocking execution.

### Code review / refactor team (4 agents)

```
Create a review team for the current changes / this PR / the whole src/ folder.

Spawn 4 teammates:
- Security Reviewer
- Performance & Scalability Reviewer
- UX & Accessibility Reviewer
- Test Coverage & Reliability Reviewer

Rules:
- Do NOT make any code changes — read and analyze only
- Discuss findings with each other via messages
- Use the shared task list
- When finished, write a consolidated review to .claude/review.md with severity ratings and suggested fixes
```

> **Lighter alternative:** If peer discussion isn't needed, the individual [security-auditor, ux-reviewer, accessibility-auditor, and api-contract-reviewer](./subagents#web--backend) subagents cover the same ground with much lower token overhead.

### Parallel debugging team (5 agents)

```
Users are reporting [describe bug]. Spawn 5 teammates, each with a different hypothesis:

1. Race condition in async code
2. Missing error handling / edge case
3. State management bug
4. Dependency version mismatch
5. Frontend/backend contract mismatch

Have them investigate in parallel, message each other to share evidence, and debate/disprove each other's theories. Update a shared "Findings.md" file with the winning conclusion.
```

### Research & planning team (4 agents)

```
We need to decide how to implement [feature]. Create a research team with:
- Product/Requirements teammate
- Architecture teammate
- Alternatives & Tradeoffs teammate
- Cost & Complexity teammate

Let them discuss and reach consensus on the best approach. Output a final decision document with pros/cons and recommended stack.
```


### PRD implementation: New project (5–6 agents)

> Use when starting from an empty (or near-empty) directory. No existing codebase, no CLAUDE.md. Pairs with the [PRD-Driven Development](../guides/prd.md) workflow.

```
Implement the new app defined in docs/prd/[app-name]/.

Read the PRD index first, then technical notes and shared components
to understand the app, tech stack, and directory structure.

Spawn 5 teammates (optionally 6):

- Init + Database Agent (sonnet) — reads technical notes, schema, shared components, and checklist docs.
  Initializes the project, creates directory structure, generates CLAUDE.md,
  then implements schema and seed data. Signals "scaffold-ready".

- Domain Agent (opus) — reads domain and shared components docs.
  Waits for "scaffold-ready". Signals "domain-ready".

- API Agent (sonnet) — reads API and shared components docs.
  Waits for "domain-ready". Signals "api-ready".

- Frontend Agent (sonnet) — reads frontend, API, and shared components docs.
  Waits for "api-ready". Signals "frontend-ready".

- QA Agent (sonnet) — reads acceptance criteria and test cases, plus checklist docs.
  Reviews each phase as it completes (does not wait until the end).
  Reports gaps to lead after each signal.
  Writes tests after "api-ready" and "frontend-ready".

Optional for complex UI:
- UI Agent (sonnet) — reads UI (wireframes, components, interactions).
  Waits for "scaffold-ready", works in parallel with backend agents.
  Signals "ui-ready". Frontend Agent then waits for both "api-ready" and "ui-ready".

Rules:
- Each agent gets its own tmux window/pane for isolated terminal sessions
- All agents read CLAUDE.md (after Init creates it) + their PRD docs before coding
- Before signaling: re-read your phase checklist, verify every item, include a completion summary
- Ensure consistency across all layers (DB, domain, API, frontend)
- Handoffs use signals, no polling
- Flag PRD gaps to lead, no plan approval needed
- Never commit or push - lead handles all git operations

Lead (opus): coordinate using the phase checklist.
After each signal:
- Compare agent summary + QA report against checklist
- Ensure completeness across all layers
- Send agent back if items are missing
- Next phase proceeds only when all checklist items are verified complete

Final verification:
- Confirm all acceptance criteria are met
- Confirm all implementation phases are complete
- Verify full flow works end-to-end
- Summarize completed work and deviations
```

> **How the pipeline flows:** Init + Database Agent runs first and generates CLAUDE.md. Domain, API, and Frontend agents chain in sequence. QA reviews each phase incrementally as signals arrive rather than waiting until the end — the lead gates each transition by cross-checking the agent summary and QA review against PRD-07. For complex UI, add the optional UI Agent running in parallel with backend agents.

### PRD implementation: Existing app (5–6 agents)

> Use when adding a feature to an app that already exists — CLAUDE.md, directory structure, and patterns are established. Pairs with the [PRD-Driven Development](../guides/prd.md) workflow.

```
Implement the feature defined in docs/prd/[feature-name]/.

Read CLAUDE.md, the PRD index, and shared components sections.
Review the existing app code before spawning — use subagents and tools
(search, grep, file listing) to explore the codebase efficiently rather
than reading files sequentially in the main context.

Spawn 5 teammates (optionally 6):

- Database Agent (sonnet) — reads schema and shared components docs.
  Additive only. Signals "schema-ready".

- Domain Agent (opus) — reads domain and shared components docs.
  Waits for "schema-ready". Signals "domain-ready".

- API Agent (sonnet) — reads API and shared components docs.
  Waits for "domain-ready". Extends existing router (no parallel routes).
  Signals "api-ready".

- Frontend Agent (sonnet) — reads frontend, API, and shared components docs.
  Waits for "api-ready". Extends existing navigation and UI patterns.
  Signals "frontend-ready".

- QA Agent (sonnet) — reads acceptance criteria and test cases, plus checklist docs.
  Reviews each phase as it completes (does not wait until the end).
  Reports gaps to lead after each signal.
  Writes tests after "api-ready" and "frontend-ready".
  Runs existing tests to confirm no regressions.

Optional for complex UI:
- UI Agent (sonnet) — reads UI (wireframes, components, interactions).
  Waits for "schema-ready", works in parallel with backend agents.
  Signals "ui-ready". Frontend Agent then waits for both "api-ready" and "ui-ready".

Rules:
- Each agent gets its own tmux window/pane for isolated terminal sessions
- All agents read CLAUDE.md + their PRD docs before coding
- When reviewing existing code: use subagents and tools to explore the codebase efficiently — do not read files one-by-one in main context
- Always extend existing patterns, do not introduce duplicate logic or parallel implementations
- Changes must be additive and must not break existing functionality
- If regressions occur: signal "blocked" and report affected areas
- Before signaling: re-read your phase checklist, verify every item, include a completion summary
- No modifications outside feature scope without lead approval
- Handoffs use signals, no polling
- Flag PRD gaps to lead, no plan approval needed

Lead (opus): coordinate using the phase checklist.
After each signal: compare agent summary + QA review against checklist.
Ensure no regressions and no gaps across DB, domain, API, and frontend.
Send agent back if items are missing. Next phase proceeds only when complete.
After all done: verify all acceptance criteria and the end-to-end
verification checklist. Summarize completed work, deviations,
and modified files.
```

> **How the pipeline flows:** Database Agent runs first with additive-only schema changes. Domain, API, and Frontend agents chain in sequence. QA reviews each phase incrementally as signals arrive — the lead gates each transition by cross-checking the agent summary and QA review against PRD-07. Agents use subagents and tools for codebase exploration rather than reading files sequentially. For complex UI, add the optional UI Agent running in parallel with backend agents.

## Useful commands while the team is running

| Action | How |
|--------|-----|
| Talk to a specific teammate (tmux) | Click that pane |
| Talk to a specific teammate (in-process) | Cycle with `Shift+↑` / `Shift+↓` |
| Toggle the shared task list | `Ctrl+T` |
| Pause before proceeding | Tell the lead: "Wait for your teammates to complete their tasks before proceeding" |
| Shut everything down | Tell the lead: "Clean up the team" |

## Git worktrees for parallel agents

When multiple agents edit the same codebase, they can conflict with each other. Git worktrees solve this by giving each agent an isolated copy of the repository on its own branch.

### How it works

A git worktree creates a separate working directory linked to the same repository. Each agent works in its own directory on its own branch, so file edits never collide:

```bash
# Create worktrees for each agent's branch
git worktree add ../feature-api feature/api-endpoints
git worktree add ../feature-ui feature/ui-components
git worktree add ../feature-tests feature/test-coverage
```

Each agent runs in its own worktree directory. When all agents finish, merge the branches back.

### Agent Teams + worktrees

When using Agent Teams with split-pane mode, you can assign each teammate a worktree:

```text
Create a team of 3 agents. Each agent should work in its own git worktree:
- Backend agent: ../feature-api branch
- Frontend agent: ../feature-ui branch
- Test agent: ../feature-tests branch

Coordinate through the shared task list. When all agents complete their tasks,
I will merge the branches manually.
```

This combination gives you parallel execution with full file isolation, eliminating the risk of agents overwriting each other's changes.

## When NOT to use Agent Teams

Agent Teams adds real overhead. Skip it when:

- **The task is straightforward.** A single Claude Code session handles most bug fixes, refactors, and single-feature implementations better than a team. Vanilla Claude Code outperforms orchestrated workflows for smaller tasks.
- **The work is sequential.** If step 2 depends entirely on step 1's output, parallelizing adds cost without saving time.
- **You are exploring or debugging.** Interactive back-and-forth with one agent is more efficient than coordinating a team when you do not yet know what needs to be done.
- **Context is cheap.** If your task fits comfortably in a single context window, the overhead of multiple agents is wasted.

Use Agent Teams when you have genuinely independent workstreams (frontend + backend + tests), need multiple perspectives simultaneously (parallel code review), or when a single agent's context window would overflow from the scope of work.

## Tips

- **Start small**: 3-5 teammates max; token cost scales with every agent.
- **Right model for the job**: use Haiku for simple/mechanical tasks, Sonnet or Opus for complex reasoning.
- **Plans without blocking**: instead of "require plan approval", tell agents to write plans to `.claude/plans/` first. You get the artifact without every agent stalling in plan mode waiting for input.
- **Two-session workflow**: for very large projects, run one tmux session for a research team and a separate one for the implementation team.
- **Use git worktrees** for file isolation when agents edit overlapping parts of the codebase.

## Token cost vs. context isolation

Running a team is more expensive than a single agent. Each teammate is an independent Claude session with its own context window, so a 5-agent team can consume roughly 5× the tokens of one agent working alone over the same wall-clock time.

The trade-off is real: **more agents = more tokens, but safer context per agent.**

| Factor | Single agent | 5-agent team |
|--------|-------------|--------------|
| Token usage | Lower | ~5× higher |
| Context per agent | Grows large over time | Stays small and focused |
| Risk of context overload | Higher on long tasks | Lower (each agent sees only its slice) |
| Parallel throughput | Sequential | Parallel |

**Practical guidance:**
- Use Haiku for teammates doing mechanical work (searching, linting, testing). Reserve Sonnet/Opus for the agents that need to reason deeply.
- Avoid spawning agents just to parallelize; only split work that is genuinely independent.
- For a quick task that one agent can finish in a few turns, skip Agent Teams entirely. [Parallel subagents](./subagents#parallel-subagents) are the lighter option if you still need some concurrency.
