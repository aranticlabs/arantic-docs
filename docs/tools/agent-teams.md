---
sidebar_position: 3
---

# Agent Teams

Agent Teams is an experimental Claude Code feature that lets a lead agent spawn and coordinate multiple specialized teammate agents working in parallel. Teammates communicate through a shared task list and direct messaging, and can optionally be displayed side-by-side in tmux split panes.

## Do you need tmux?

**Short answer: no.** Agent Teams works perfectly fine without tmux. But most people who try both modes end up preferring tmux for any serious work.

### The two modes compared

| Mode | How teammates appear | See all agents at once? | Best for |
|------|----------------------|------------------------|----------|
| **In-process** (default, no tmux required) | All output in one terminal window; cycle between agents with `Shift+↑/↓` | No | Quick experiments, small teams (2–3 agents) |
| **tmux split-pane** | Each teammate gets its own live visible pane | Yes — full command-center view | Regular use, 3+ teammates |

The official Claude Code docs state: *"Split-pane mode requires tmux or iTerm2… The default is `auto` which uses split panes if you're already running inside a tmux session, and in-process otherwise."*

### Recommendation

- **Just exploring Agent Teams?** Skip tmux — use the default in-process mode. It works great.
- **Using Agent Teams regularly** (especially 4+ teammates on real projects)? Install tmux. Watching your AI team work in parallel panes is a significant productivity boost.

## What is tmux?

tmux is a free, open-source terminal multiplexer. It turns one terminal window into many by splitting it into panes running different things simultaneously — for example, a server in one pane, tests in another, logs in a third. You can also detach a session (close the window while everything keeps running) and re-attach later.

## One-time setup (2 minutes)

### Step A: Install tmux

**macOS (recommended):**
```bash
brew install tmux
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install tmux
```

**Other Linux or Windows (WSL):** see the [tmux installation wiki](https://github.com/tmux/tmux/wiki/Installing).

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
- `"auto"` — recommended; uses split panes if already inside tmux, otherwise falls back to in-process
- `"tmux"` — always use tmux split panes
- `"in-process"` — always use in-process mode (no tmux needed)

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

**Pro tip:** Add this alias to `~/.zshrc` or `~/.bashrc` to do both steps at once:

```bash
alias claude-team='tmux new-session -s claude-team -c "$PWD" \; send-keys "claude" C-m'
```

## Prompts for common workflows

Paste these into the lead agent to spin up a pre-configured team.

### Full-stack feature team (5 agents)

```
Create an agent team for building a complete new feature: "User profile dashboard with dark mode toggle and real-time activity feed".

Spawn 5 teammates:
- Lead Architect (Opus) – overall design + coordination
- Backend Specialist (Sonnet) – API routes, database models, auth
- Frontend Specialist (Sonnet) – React components, Tailwind, state management
- Testing & QA (Haiku) – unit + integration tests, edge cases
- Devil's Advocate / Security (Sonnet) – finds flaws, security issues, performance problems

Use the shared task list. Teammates must message each other when they need info (e.g. "Backend: what is the exact API contract?"). Require plan approval from me before any code changes. When everyone is done, summarize the complete implementation plan and files changed.
```

### Code review / refactor team (4 agents)

```
Create a review team for the current changes / this PR / the whole src/ folder.

Spawn 4 teammates:
- Security Reviewer
- Performance & Scalability Reviewer
- UX & Accessibility Reviewer
- Test Coverage & Reliability Reviewer

Have them discuss findings with each other via messages. Use the shared task list. When finished, create a consolidated review document with severity ratings and suggested fixes. Only make changes after I approve the final plan.
```

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

## Useful commands while the team is running

| Action | How |
|--------|-----|
| Talk to a specific teammate (tmux) | Click that pane |
| Talk to a specific teammate (in-process) | Cycle with `Shift+↑` / `Shift+↓` |
| Toggle the shared task list | `Ctrl+T` |
| Pause before proceeding | Tell the lead: "Wait for your teammates to complete their tasks before proceeding" |
| Shut everything down | Tell the lead: "Clean up the team" |

## Tips

- **Start small** — 3–5 teammates max; token cost scales with every agent.
- **Right model for the job** — use Haiku for simple/mechanical tasks, Sonnet or Opus for complex reasoning.
- **Require plan approval** — always add "Require plan approval before any code changes" to prevent surprise edits.
- **Two-session workflow** — for very large projects, run one tmux session for a research team and a separate one for the implementation team.
