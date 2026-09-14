---
sidebar_position: 15
sidebar_label: Worktrees & Parallel Sessions
description: Run several Codex chats side by side using Git worktrees, local environment setup scripts, handoff between Local and Worktree, and multiple CLI terminals.
keywords: [Codex worktrees, git worktree, parallel sessions, local environments, setup scripts, handoff, .worktreeinclude, tmux, parallel agents, ChatGPT desktop app]
---

# Worktrees & Parallel Sessions

A single Codex chat edits one checkout. The moment you want a second chat working on the same repository, the two will overwrite each other's files unless they have separate working directories. Codex solves this with Git worktrees: each chat can get its own checkout, sharing the same `.git` metadata, so chats run in parallel without disturbing your local setup. This page covers how Codex creates and manages worktrees, how to prepare them with setup scripts, how to move work back, and how to run several chats at once from the desktop app or the CLI.

## What a worktree is

A [Git worktree](https://git-scm.com/docs/git-worktree) is a second checkout of your repository. Every worktree has its own copy of every file, but they all share the same commits, branches, and other metadata in `.git`. That lets you work on several branches at the same time in different directories.

Codex terminology:

| Term | Meaning |
|------|---------|
| **Local** (local checkout) | The repository directory you opened as a project |
| **Worktree** | A Git worktree that Codex created from your local checkout |
| **Handoff** | The flow that moves a chat (and its Git state) between Local and Worktree, or between hosts |

Worktrees only work in projects that are inside a Git repository.

## How Codex manages worktrees

| Aspect | Behavior |
|--------|----------|
| Location | `$CODEX_HOME/worktrees` by default (`~/.codex/worktrees`). Change it under **Settings > Worktrees > Worktree root** in the desktop app |
| Starting commit | The `HEAD` of the branch you select when starting the chat |
| Uncommitted local changes | If you pick a branch with local changes, Codex applies the uncommitted changes to the worktree as well |
| Branch state | **Detached HEAD**. Codex does not create a branch, so it can spin up many worktrees without polluting your branch list |
| Lifetime | **Codex-managed** worktrees are lightweight and disposable, typically dedicated to one chat. **Permanent** worktrees (created from a project's three-dot menu in the sidebar) live as their own project, are never auto-deleted, and can host multiple chats |
| Cleanup | Codex keeps the most recent **15** managed worktrees by default. Change the limit or disable automatic deletion in settings |
| Protection from cleanup | A worktree is not auto-deleted while a pinned chat is tied to it, the chat is still running, or it is a permanent worktree |
| Deletion triggers | Archiving the associated chat, or Codex trimming older worktrees to stay within the limit |
| Snapshots | Before deleting a managed worktree, Codex saves a snapshot. Reopening the chat later offers to restore it |

Each chat keeps the same associated worktree over time. If you hand a chat to Local and back, Codex returns it to the same worktree.

## Starting a chat in a worktree

In the ChatGPT desktop app (select **Codex** in the ChatGPT dropdown first):

1. In the new chat view, select **Worktree** under the composer, or type `/worktree`.
2. Optionally choose a **local environment** to run its setup script in the new worktree.
3. Choose the starting branch below the composer: `main`, a feature branch, or your current branch including unstaged changes.
4. Submit the prompt. Codex creates the worktree and starts working in detached HEAD state.
5. When the work is done, either keep working on the worktree or hand the chat off to Local.

The IDE extension exposes the same `/local`, `/worktree`, and `/cloud` targets. The CLI does not have a worktree picker; you create worktrees yourself (see below).

:::tip
Picked the wrong target? Cancel the run and press the up arrow in the composer to recover your prompt.
:::

## Local environments: setup scripts and actions

A fresh worktree only contains files that are checked into Git. Dependencies, build output, and ignored config files are missing. **Local environments** fix this. They are configured in the desktop app settings and stored in the `.codex` folder at the root of your project, so you can commit them and share them with your team.

Local environments are only available in Codex inside the ChatGPT desktop app.

### Setup scripts

Setup scripts run automatically when Codex creates a new worktree at the start of a chat. Use them to install dependencies or build:

```bash
npm install
npm run build
```

If setup differs by platform, define separate scripts for macOS, Windows, and Linux to override the default.

### Actions

Actions are common tasks (start the dev server, run the tests) that appear in the desktop app top bar and run in the integrated terminal. Define one script per action, optionally per platform, and pick an icon. Example "Run" action for a Node.js project:

```bash
npm start
```

Actions are for things you do repeatedly. For one-off debugging, use the integrated terminal directly.

### Built-in Git tools

Alongside each local project and worktree, the desktop app shows a diff pane where you can add inline comments for Codex, stage or revert hunks and files, commit, push a branch, and create a pull request. Anything not exposed there is available from the integrated terminal.

## Copying ignored files with .worktreeinclude

Worktrees start from a Git checkout, so tracked files are present but ignored files (`.env`, local secrets) are not. Add a `.worktreeinclude` file at the repository root listing ignored paths or `.gitignore`-style patterns to copy into each new **managed** worktree:

```text
# .worktreeinclude
.env
.env.local
config/secrets.json
```

Rules:

- Only ignored files that match are copied; untracked-but-not-ignored files are not
- Do not list tracked files
- Source symlinks are skipped and existing files in the new checkout are never overwritten
- An ignored `AGENTS.override.md` is copied automatically without listing it
- This applies to local desktop-app managed worktrees only, not to remote worktrees or worktrees you create by hand

Because handoff uses Git operations, ignored files also do not move with a chat unless `.worktreeinclude` copies them.

## Handoff between Local and Worktree

Think of Local as the foreground and Worktree as the background. Handoff moves a chat between them, and Codex performs the Git operations needed to do that safely.

The constraint that makes handoff necessary: **Git allows a branch to be checked out in only one worktree at a time.** If a branch is checked out on a worktree, you cannot check it out in your local checkout too.

### Option 1: stay on the worktree

Works best when the worktree is fully usable, for example because a setup script installed dependencies.

1. Select **Create branch here** in the chat header to turn the detached HEAD into a branch.
2. Commit, push, and open a pull request, all from the app's Git tools or the integrated terminal.
3. Use the **Open** button in the header to open your IDE on the worktree directory.

Remember that once you create a branch on a worktree, no other checkout (including Local) can check it out.

### Option 2: hand the chat off to Local

Use this when you want the changes in your usual IDE window, need your existing dev server, or can only run one instance of the app.

1. Select **Hand off** in the chat header.
2. Choose **Local**.

Codex moves the chat and the code into your local checkout. The reverse also works: hand a Local chat to a worktree to free up the foreground while Codex keeps working in the background.

### The branch limitation in practice

If you create `feature/a` on a worktree and then try `git checkout feature/a` locally:

```text
fatal: 'feature/a' is already used by worktree at '<WORKTREE_PATH>'
```

Either check out a different branch on the worktree first, or (simpler) use Handoff to move the chat to Local instead of trying to have the branch in two places.

### Handoff between hosts

Handoff also moves a chat between your local computer and a connected SSH host: select the current run location in the chat footer, pick the destination host, and Codex creates or reuses a worktree there. Handoff to a Codex cloud environment is not supported. Details are in [Codex Cloud & Remote](./cloud.md).

## Running several chats in parallel

### In the desktop app

The desktop app is built around multiple concurrent chats:

- Start each independent task as its own chat, with **Worktree** as the target so chats never share a working directory
- Pin the chats you care about, and use **Activity** (the bell in the sidebar, `Cmd+Option+U` on macOS or `Ctrl+Alt+U` on Windows) to see which chats are unread, running, or waiting for input
- Enable desktop notifications for turn completion and approval requests in **Settings**, or use a desktop pet to see chat status while working in other apps
- Turn on **Prevent sleep while running** so a long chat does not stop when your Mac sleeps
- Use `/goal` in each chat for long multi-step work; every chat keeps its own goal, context, and results. The official guidance is to run chats concurrently but never let two chats change the same files
- Scheduled tasks can run on dedicated background worktrees so they do not collide with your foreground work (see [Automation & Non-interactive Mode](./automation.md))

**Codex Micro** is a small physical keyboard (a limited-run collaboration with Work Louder) that pairs with the desktop app. Its six Agent Keys each follow a chat and light up with its status (white idle, blue thinking, green complete with unread update, amber needs input, red error); pressing a key switches to that chat. Command Keys approve or decline the current request, fork the chat, toggle Fast mode, dictate, and send. It is a convenience for people who run many chats at once, not a requirement.

### In the CLI

The CLI has no worktree picker, so you manage the checkouts with Git and run one `codex` per terminal:

```bash
# From your main checkout, create one worktree per task on its own branch
git worktree add ../app-api feature/api-endpoints
git worktree add ../app-ui feature/ui-components

# Terminal 1
cd ../app-api && codex

# Terminal 2
cd ../app-ui && codex
```

Each session has its own transcript, context window, and sandbox rooted in its own directory. Things that help:

- Start each session with a focused prompt and a clear "done when", and let it run; check back using notifications (`tui.notifications` or an external `notify` program in `config.toml`, see [Debugging](./debugging.md))
- `codex resume` picks up the most recent session in the current directory (`--last`), so each worktree resumes its own chat
- `codex fork` or `/fork` branches a chat when two approaches diverge, without losing the original transcript
- `/agent` (or `/subagents`) switches between agent threads inside one session when Codex has spawned subagents; that is the lighter alternative to separate sessions for bounded work (see [Subagents](./subagents.md))
- Copy ignored files by hand (`cp ../app/.env .`) since `.worktreeinclude` only applies to desktop-app managed worktrees
- The worktree directory must be inside a trusted project for `.codex/config.toml`, project hooks, and project rules to load

### tmux for CLI sessions

If you run several CLI sessions, a terminal multiplexer keeps them in one window and lets you detach and re-attach:

```bash
tmux new-session -s codex-parallel
# Ctrl+b %  to split side by side, then run `codex` in each pane
# Ctrl+b d  to detach; tmux attach -t codex-parallel to come back
```

Codex has no built-in tmux integration; this is plain terminal multiplexing. Key bindings, session commands, and copy mode are documented on the [tmux](../claude-code/tmux.md) page.

## Merging results back

| Where the work is | How to bring it together |
|-------------------|--------------------------|
| Desktop-app worktree | **Create branch here**, commit, push, open a PR; or **Hand off** to Local and commit there |
| CLI worktree you created | Commit on its branch, then `git merge` or rebase in the main checkout, or open a PR |
| Cloud chat | Open a PR from the chat, or `codex apply TASK_ID` locally (see [Codex Cloud & Remote](./cloud.md)) |

When you are done with a hand-made worktree:

```bash
git worktree remove ../app-api
git branch -d feature/api-endpoints   # after it is merged
git worktree prune
```

Codex-managed worktrees are cleaned up by the app according to the limit described above.

**Before:** two chats, both on Local, editing `src/auth/` at the same time. The second chat's edits silently overwrite the first's, and `/diff` shows a mix of both.

**After:** chat A on Local implements the API on `feature/api`, chat B on a worktree builds the UI against the planned interface. Each `/review` sees only its own changes. When both finish, you merge two clean branches.

## When not to parallelize

Parallel chats add coordination cost. Skip them when:

- **The task is small.** One chat finishes a bug fix or a single-feature change faster than you can split it
- **The steps depend on each other.** If the UI needs the API's final shape, running them at once produces rework
- **You are still exploring.** Interactive back-and-forth in one chat beats coordinating several when you do not yet know what to build
- **Both tasks touch the same files.** Two worktrees do not help if you will spend the time resolving merge conflicts
- **The workflow is not yet reliable.** The official best-practices guide warns against running live tasks on the same files without worktrees and against scheduling work before it works manually

The best-practices guide's rule is one chat per coherent unit of work. Parallelize independent units; keep dependent steps in the same chat so the reasoning trail stays intact.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Code does not run on a worktree | Dependencies or ignored files are missing. Add a local environment setup script, list ignored files in `.worktreeinclude`, or hand the chat off to Local |
| Teammate's shared local environment is not picked up | The `.codex` folder must be at the root of the project you opened. In a monorepo, open the directory that contains `.codex` |
| Scheduled tasks created many worktrees | Archive runs you no longer need; avoid pinning runs unless you want to keep their worktrees |
| `fatal: '<branch>' is already used by worktree` | The branch is checked out elsewhere. Check out another branch there, or use Handoff |
| Chat exists but its worktree directory is gone | Codex saved a snapshot before deletion; open the chat and choose to restore |
| Lost the prompt after cancelling worktree creation | Press the up arrow in the composer |

## Compared with Claude Code

| Topic | Codex | Claude Code |
|-------|-------|-------------|
| Built-in worktree management | Desktop app creates, tracks, snapshots, and cleans up worktrees per chat; handoff moves work between checkouts | Worktrees are created by hand (`git worktree add`) and assigned to teammates; `WorktreeCreate` and `WorktreeRemove` hooks exist |
| Multi-agent display | Separate chats in the desktop app sidebar, or separate terminals; Codex Micro as optional hardware | [Agent Teams](../claude-code/agent-teams.md) render teammates in tmux or iTerm2 split panes, or in-process with `Shift+Up/Down` |
| tmux | Not integrated; use it as a generic multiplexer | Detected automatically when `teammateMode` is `auto` or `tmux`; see [tmux](../claude-code/tmux.md) |
| Coordinating agents | Independent chats; subagents within one session via `/agent` | Shared task list and direct teammate messaging inside one orchestration |
| Cost model | Each chat has its own context and token usage | Each teammate is a full session; a five-agent team uses roughly five times the tokens |
| When to skip it | One chat per coherent outcome; parallelize only independent work | Same guidance: vanilla sessions outperform teams for small or sequential tasks |
