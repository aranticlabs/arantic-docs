---
sidebar_position: 14
sidebar_label: Parallel Agents & Worktrees
description: Run several Cursor agents at once with the Agents Window, isolate each one in a Git worktree, compare models with /best-of-n, and hand long tasks to the cloud.
keywords: [Cursor parallel agents, Agents Window, git worktrees, worktrees.json, best-of-n, cloud agents, background agents, multi-agent coding, /worktree, /in-cloud]
---

# Parallel Agents & Worktrees

Cursor lets you run more than one agent at the same time, each on its own task, its own Git checkout, and optionally its own cloud VM. The Agents Window is the interface built for this: a sidebar of running agents, a diffs view for reviewing and committing results, and one-click handoff between local and cloud. Worktrees are the isolation mechanism that keeps parallel agents from overwriting each other's files. This page covers how the pieces fit together, and when running agents in parallel actually saves time versus when it only multiplies cost.

## The Agents Window

The Agents Window is Cursor's agent-first interface. It is a separate view from the classic editor that puts agents, not files, at the center. You manage agents across repositories and environments (local, cloud, remote SSH) from one place, and switch back to the editor whenever you need the full IDE.

| Action | How |
|--------|-----|
| Open the Agents Window | `Cmd+Shift+P` (`Ctrl+Shift+P` on Windows/Linux) → **Open Agents Window** |
| Return to the classic IDE | `Cmd+Shift+P` → **Open IDE** |
| Search files without leaving the Agents Window | `Cmd+P` (file search) or `Cmd+Shift+F` (search all files) |
| Manage running agents | Sidebar; pin the chats you return to most so they stay at the top |

Both views can be open at the same time. You can also view and edit files inside the Agents Window; you do not have to switch back for a quick look.

### What is only available in the Agents Window

According to the official docs, these features live in the Agents Window rather than the editor:

- **Multi-workspace**: work with agents across all your projects from one place.
- **New diffs view**: review and commit changes and manage PRs without leaving Cursor.
- **Parallel agents**: run many agents in the cloud and work with them from your phone, the web, Slack, GitHub, and Linear.
- **Local/cloud handoff**: move an agent from cloud to local to iterate quickly, then push it back to the cloud so it keeps working on its own.
- **Cloud subagents**: hand a task to a cloud subagent with `/in-cloud`, or put a PR on `/autopilot`, so long-running work runs on its own VM and branch while you keep working locally.
- **UI-native worktrees**: start or move an agent into an isolated Git checkout. In the editor, the equivalent is the `/worktree` and `/best-of-n` commands described below.

### Agents Window or editor?

| You want to | Use |
|-------------|-----|
| Run and manage many agents at once, let agents write most of the code | Agents Window |
| Classic IDE with VS Code extensions and flexible screen splitting to see many files at once | Editor |
| Both | Keep both open and move between them |

The Agents Window is generally available with Cursor 3 (released April 2, 2026). Enterprise admins had a two-week rollout window after launch to control access within their organization; after that, all users have access by default.

## Running multiple agents in parallel

There are four distinct ways to get parallelism in Cursor. They are not interchangeable, so it helps to know which one you are reaching for.

| Mechanism | Where it runs | Isolation | Best for |
|-----------|---------------|-----------|----------|
| **Several agents in the Agents Window** | Local, cloud, or remote | Shared checkout unless you put each one in a worktree | Independent tasks you supervise side by side |
| **Subagents** (`/multitask`, "Build in Parallel", or asking the agent to run tasks in parallel) | Inside one agent session, each with its own context window | Shared checkout by default; ask for isolation to give each one its own worktree or cloud environment | Splitting one task into parallel pieces without crowding the main context |
| **Worktree runs** (`/worktree`, `/best-of-n`, `--worktree` in the CLI) | Local | Separate Git checkout per run | Risky or experimental changes, comparing models |
| **Cloud agents** (`/in-cloud`, `&` prefix in the CLI, **Cloud** toggle by the input) | Dedicated VM per agent | Own clone and branch | Long tasks you want to walk away from |

### Multitasking with subagents

Type `/multitask` to have Cursor run async subagents in parallel instead of queuing your requests one after the other. From a plan, click **Build in Parallel** and Cursor runs independent steps at once while keeping dependent steps in order.

Subagents share the parent agent's checkout by default. If several of them edit files at once, they can overwrite each other. Ask for isolation explicitly:

```text
Run a swarm of subagents to fix these five flaky tests, each in its own environment
```

Each subagent then gets its own branch, either as a local worktree with a separate working directory or as a cloud environment with a dedicated VM and clone. Changes stay on each subagent's branch until the parent merges the results. See [Subagents](./subagents.md) for the full model.

### Queueing versus steering

While an agent works you have two options that are easy to confuse with parallelism but are not:

- **Queue** a message (press Enter): it waits for the current task to finish, then runs. Drag to reorder queued messages.
- **Steer** the running agent (**Send now**, or `Cmd+Enter`): the message is delivered at the agent's next tool call and redirects the active turn without cutting off in-flight work.

Neither starts a second agent. For genuinely concurrent work, start another agent or delegate to subagents.

## Git worktrees in Cursor

A Git worktree is a second working directory attached to the same repository, checked out on its own branch. Cursor uses worktrees so that each agent (or each candidate run) gets its own files, dependencies, and changes while your main checkout stays untouched. Use them whenever you want to start several agents on the same repo without conflicts.

### Creating worktrees

| Surface | How | Notes |
|---------|-----|-------|
| Agents Window | Start an agent in a worktree, or move a running agent into one | Cursor creates a separate checkout; the agent continues the task inside it |
| Editor chat | `/worktree <task>` | The rest of that chat runs in a separate checkout |
| Editor chat | `/best-of-n <models> <task>` | One worktree per model run (see below) |
| CLI | `agent --worktree [name] "<task>"` or `-w` | Name is generated if omitted; add `--workspace <path>` to point at a specific repo root |

Example prompts:

```text
/worktree fix the failing auth tests and update the login copy
```

```bash
# Temporary worktree from the current repo, generated name
agent --worktree "upgrade the test runner and fix any broken snapshots"

# Named worktree from another repository
agent --workspace ~/src/my-app --worktree auth-fix "fix the flaky auth test and open a PR"
```

### Where worktrees live

The CLI creates worktrees under `~/.cursor/worktrees/<reponame>/<name>`, alongside worktrees created from the editor. To list every worktree Git knows about for the current repository:

```bash
git worktree list
```

### Setup scripts with `.cursor/worktrees.json`

A fresh worktree has none of your installed dependencies or local `.env` files. `.cursor/worktrees.json` tells Cursor how to prepare each new worktree. Cursor reads it when creating a worktree from the Agents Window, the editor, or the CLI, looking first in the worktree path and then in the project root.

| Key | Applies to | Precedence |
|-----|-----------|------------|
| `setup-worktree-unix` | macOS and Linux | Wins over `setup-worktree` on Unix |
| `setup-worktree-windows` | Windows | Wins over `setup-worktree` on Windows |
| `setup-worktree` | All operating systems | Generic fallback |

Each key accepts either an **array of shell commands** (run sequentially inside the worktree) or a **string path to a script file** relative to `.cursor/worktrees.json`. The environment variable `ROOT_WORKTREE_PATH` points at your main checkout, which is how you copy over untracked files like `.env`.

Node.js project:

```json
{
  "setup-worktree": [
    "npm ci",
    "cp $ROOT_WORKTREE_PATH/.env .env"
  ]
}
```

Project with database migrations:

```json
{
  "setup-worktree": [
    "npm ci",
    "cp $ROOT_WORKTREE_PATH/.env .env",
    "npm run db:migrate"
  ]
}
```

OS-specific scripts for anything more involved (place the scripts in `.cursor/` next to `worktrees.json`):

```json
{
  "setup-worktree-unix": "setup-worktree-unix.sh",
  "setup-worktree-windows": "setup-worktree-windows.ps1",
  "setup-worktree": [
    "echo 'Using generic fallback. For better support, define OS-specific scripts.'"
  ]
}
```

```bash
#!/bin/bash
# .cursor/setup-worktree-unix.sh
set -e
npm ci
cp "$ROOT_WORKTREE_PATH/.env" .env
npm run db:migrate
echo "Worktree setup complete!"
```

:::warning
Do not symlink `node_modules` or other dependency folders from the main checkout into the worktree. The official docs warn this can break the main worktree. If `npm ci` per worktree is too slow, switch to a fast package manager such as `bun`, `pnpm`, or `uv`.
:::

To debug a setup script, open the **Output** panel in the editor and select **Worktrees Setup**.

### Applying or merging results

Worktree runs never merge themselves back. When an agent finishes in a worktree you have three options:

| Option | How | When |
|--------|-----|------|
| Ship straight from the worktree | Ask the agent: `Commit and push these changes, then open a PR` | The branch is meant to become its own PR anyway |
| Bring changes into your main checkout | `/apply-worktree` | You want to test or continue the work locally before committing |
| Discard | `/delete-worktree` | The experiment did not pan out |

In the Agents Window, review the result in the diffs view, then keep working in the worktree, create a commit or PR from that checkout, or bring the result back into your main workspace.

### Automatic cleanup

Cursor (3.5 and later) prunes old worktrees on an interval so they do not eat your disk. Two machine-scoped settings control it:

```json
{
  "cursor.worktreeCleanupIntervalHours": 6,
  "cursor.worktreeMaxCount": 25
}
```

- `cursor.worktreeCleanupIntervalHours`: how often Cursor checks for old worktrees. If the last successful run is older than this when Cursor starts, it schedules a delayed catch-up cleanup.
- `cursor.worktreeMaxCount`: the maximum number of worktrees kept per machine (default 25). All workspaces count toward the same cap.

Cursor re-discovers the worktree root on every cleanup pass, so worktrees created outside the manager (via `/worktree` skills or plain `git worktree add`) are also eligible for deletion. If you have a worktree you need to keep long-term, commit and push its branch so the work survives cleanup.

## Best-of-N: same prompt, several models

`/best-of-n` runs one task across several models at once. Each run gets its own worktree, so the candidates stay isolated from each other and from your main checkout.

```text
/best-of-n sonnet,gpt,composer fix the flaky logout test
```

Use it to:

- Compare models on the same prompt before standardizing on one for a task type
- Try several approaches to a hard change and pick the cleanest
- Reduce the risk of committing a single model's blind spot on security-sensitive or tricky logic

`/best-of-n` compares runs only. It does not merge anything. After you pick a winner, commit and push from that worktree or use `/apply-worktree` to pull it into your main checkout, then `/delete-worktree` on the losers.

:::note
Best-of-N multiplies cost by the number of models. Three models on one task is roughly three times the tokens of one run. Reserve it for changes where a wrong answer is expensive to discover later.
:::

## Background and cloud agents

Background agents are agents that run for a long time without you watching. In Cursor these are **Cloud Agents**: each one runs on its own dedicated VM with your repository, dependencies, secrets, and network access, plans the task, edits code, runs commands, and tests its work over minutes or hours. Because the VM is sandboxed and isolated from your laptop, you can close the lid and check later.

| Start from | How |
|-----------|-----|
| Cursor desktop | Select **Cloud** by the agent input |
| A local agent session (Agents Window) | `/in-cloud`, then submit the task; it runs as a cloud subagent on its own VM and branch |
| A PR | `/autopilot` or the quick-action pill: a cloud subagent iterates until the PR is ready to merge |
| Cursor CLI | Prefix any message with `&` |
| Web or mobile | [cursor.com/agents](https://cursor.com/agents) |
| Slack, GitHub, Linear | Mention **@Cursor** |
| A schedule or event | Automations |

Cloud agents show their work: as they test changes they attach screenshots, videos, and logs to the pull request, so you can validate without checking out the branch. You can also take control of the agent's remote desktop to use what it built.

:::warning
**Move to Cloud** does not snapshot your uncommitted local changes. The cloud agent starts from a clean Git state on the remote repository, carrying over your conversation and context but not dirty files. Commit or stash before handing off if the agent needs your latest edits.
:::

Cloud subagents use the environment configured for your repo and your team's MCP servers from cursor.com/agents, not the ones in your local session. See [Cloud Agents & Automations](./cloud-agents.md) for setup, secrets, and network policy.

## When parallelism helps and when it does not

Running agents in parallel is not free. Each agent has its own context window and token spend, and each worktree costs an install and a merge.

**Parallelism helps when:**

- Workstreams are genuinely independent (API in one worktree, UI in another, tests in a third).
- A task runs long enough that waiting on it would idle you; hand it to the cloud and keep working.
- You want several perspectives on the same problem: `/best-of-n` for models, or parallel review subagents for security, performance, and correctness.
- One agent's context would overflow if it did all the work itself; splitting across agents keeps each context small and focused.

**Parallelism does not help when:**

- The task is small. One agent finishes most bug fixes and single-feature changes faster than coordinating several.
- Step 2 depends on step 1's output. Parallel agents cannot start on work that is not defined yet; use **Build in Parallel** from a plan so Cursor keeps dependent steps ordered.
- You are still exploring. Interactive back-and-forth with one agent beats supervising three when you do not yet know what needs doing.
- The agents would touch the same files. Without worktrees they overwrite each other; with worktrees you inherit a merge.

**Weak:**

```text
Spin up five agents to work on the checkout flow.
```

**Strong:**

```text
Three independent tasks, each in its own worktree:
1. /worktree add rate limiting to POST /api/checkout (backend only, no UI changes)
2. /worktree add the "order summary" panel to CheckoutPage.tsx, mock the API response
3. /worktree write integration tests for the existing checkout happy path
Do not touch shared files outside your task. I will merge the branches myself.
```

## Git hygiene for parallel work

- **One branch per agent.** Worktrees enforce this by construction; if you run agents in a shared checkout, insist on it in the prompt.
- **Commit at boundaries.** Ask each agent to commit when its slice is done so you can review branch by branch. Checkpoints are local and separate from Git; use them to undo an agent's wrong turn, not as version control.
- **Keep the main checkout clean.** Cloud handoff starts from the remote state, and worktree setup scripts copy from `ROOT_WORKTREE_PATH`. Uncommitted clutter in the root confuses both.
- **Merge deliberately.** `/apply-worktree` copies changes into your checkout; it does not resolve conflicts between two worktrees. Merge branches one at a time and run the test suite after each.
- **Scope the prompt.** Tell each agent which paths it owns and which it must not touch. Overlapping edits are the main source of merge pain.
- **Push before cleanup catches up.** Worktrees beyond `cursor.worktreeMaxCount` get pruned. Anything you want to keep should be on a pushed branch.
- **Put setup in `.cursor/worktrees.json`, commit it.** Every teammate's worktrees then come up ready to build and test.

## Cost and context tradeoffs

| Factor | Single agent | N parallel agents |
|--------|-------------|-------------------|
| Token usage | Baseline | Roughly N times over the same wall-clock period |
| Context per agent | Grows across the whole task | Stays focused on one slice |
| Risk of context compression losing detail | Higher on long tasks | Lower per agent |
| Wall-clock time for independent work | Sequential | Parallel |
| Merge and review overhead | None | One branch per agent |
| Disk and setup | None | One checkout plus dependency install per worktree |

Practical guidance:

- Use a faster, cheaper model for mechanical slices (searching, test scaffolding, mass renames) and a more capable model for the slice that needs reasoning. You can pick a model per agent.
- Prefer subagents to full agents when the pieces are short and belong to one task; the parent keeps the plan, the subagents keep the noise.
- Watch the context ring next to the prompt input. If a single agent is compressing history repeatedly, that is the signal to split the work, not before.
- For a task one agent finishes in a few turns, skip parallelism entirely.

## Compared with Claude Code

- Claude Code's [Agent Teams](../claude-code/agent-teams.md) is a lead agent that spawns teammates who coordinate through a shared task list and direct messaging, displayed in tmux or iTerm2 split panes. Cursor has no teammate-messaging model; parallel agents in the Agents Window are independent unless you use subagents, which report back to one parent.
- Cursor's Agents Window replaces the terminal multiplexer: side-by-side agents are a GUI sidebar, not tmux panes. See the Claude Code [tmux reference](../claude-code/tmux.md) for the terminal-based equivalent.
- Both tools use Git worktrees for isolation. Claude Code expects you to create them with `git worktree add` and point each session at a directory; Cursor creates them for you (`/worktree`, `--worktree`, or the Agents Window) and prepares them with `.cursor/worktrees.json`.
- `/best-of-n` (one prompt, several models, one worktree each) has no direct Claude Code equivalent. The closest is running several Claude Code sessions in separate worktrees by hand.
- Cursor's `/in-cloud`, `/autopilot`, and the `&` prefix hand work to a dedicated cloud VM and branch. Agent Teams teammates run as local processes on your machine.
- The cost lesson is identical: N agents cost roughly N times the tokens. Split only genuinely independent work.
