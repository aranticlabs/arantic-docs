---
sidebar_position: 17
sidebar_label: Tips
description: Concise Cursor tips grouped by theme, covering prompting, context, modes, review, rules and skills, parallel work, and model choice, from the official docs.
keywords: [Cursor tips, Cursor best practices, prompting Cursor agent, at-mentions, plan mode, context window, Cursor rules, Cursor skills, parallel agents, model selection]
---

# Tips

Short, practical habits for getting good results from Cursor's agent. Each bullet traces back to the official prompting guide, the agent help pages, the Cloud Agent best practices, or the first-project walkthrough. Deeper treatment of each theme lives on the linked pages.

## Prompting

- **State the goal and the constraints, not the steps.** "Add rate limiting to `POST /api/checkout`, 10 requests per minute per user, return 429 with a `Retry-After` header, no changes to the UI" beats "make checkout safer."
- **Include expected behavior.** The agent verifies against what you said should happen; if you did not say, it guesses.
- **Say "do not write any code"** when you want analysis or a plan. It is the simplest way to keep the agent from editing files while you think.
- **Paste, do not transcribe.** Drag an image or `Cmd+V` a screenshot of the error, the mockup, or the stack trace. Vision-capable models read it directly.
- **Ground the prompt in real files and patterns.** Point at an existing component or endpoint to copy from; the output matches your codebase instead of a generic template.
- **Steer instead of restarting.** While the agent works, type a follow-up and **Send now** (or `Cmd+Enter`). It is delivered at the next tool call without cutting off in-flight work. Press Enter alone to queue it for after the turn.
- **Give long objectives a `/goal`.** `/goal fix all flaky tests and make CI green` keeps the agent working toward one outcome across many turns instead of treating each message as a fresh job.
- **Try voice for long descriptions.** Click the microphone, speak the file and function names, and review the transcription before sending.

## Context

- **Use `@` when you know which files matter; skip it when you do not.** `@auth.ts`, `@src/components/` (type `/` after a folder to go deeper). If you are unsure, let the agent search; it is good at it.
- **Attach the right kind of context.** `@Terminals` for command output, `@Chats` for a past conversation, `@Commit (Diff of Working State)` for uncommitted changes, `@Branch (Diff with Main)` for the whole branch, `@Browser` for what the built-in browser sees.
- **Watch the context ring** next to the prompt. Click it for a breakdown by system prompt, tools, rules, skills, MCP, subagents, summarized conversation, and conversation. When the ring fills, Cursor compresses older turns into summaries.
- **Start a new chat per task.** The official troubleshooting advice for accuracy is to start fresh when you finish a feature or switch tasks.
- **Keep `.cursorignore` current.** Generated folders (`dist/`, `build/`, `.next/`) waste index time and pollute search results. Files listed there are hidden from the agent, codebase search, and `@` mentions, so check it first when the agent cannot see a file.
- **Reindex after big moves.** Command palette → **Reindex** when the agent keeps referencing files that no longer exist.
- **Trim MCP and tool sprawl.** Every connected server's tool catalog occupies context on every turn. Disconnect what the current project does not need.

See [Managing Context](./context.md).

## Modes

- **Plan first for anything touching many files.** Plan Mode (`Shift+Tab` to rotate) asks clarifying questions, researches the codebase, and produces an editable plan before any code is written.
- **Fix the plan, not the code.** If the build did not match what you wanted, revert, sharpen the plan, and run it again. The docs call this faster and cleaner than patching a half-built result through follow-ups.
- **Save plans to the workspace** when they are worth sharing or documenting; by default they land in your home directory.
- **Build in Parallel from a plan.** Independent steps run at once; dependent steps stay ordered.
- **Ask Mode for reading, Agent Mode for writing.** Ask explores without editing, which is what you want during code review or onboarding.
- **Debug Mode for bugs you can reproduce but cannot explain.** It instruments your code, asks you to reproduce, and reasons from the logs instead of guessing at fixes. Describe expected versus actual behavior precisely and follow its reproduction steps exactly.
- **Turn a skill into a Custom Mode** (`Option+Enter` / `Alt+Enter` from the `/` menu, or **Use as Mode**) when it describes *how* to work, like a review checklist or `/tdd`. It stays in context on every turn until you exit.
- **Skip planning for routine changes.** For quick edits and tasks you have done many times, jumping straight to Agent is fine.

See [Agent Modes](./modes.md).

## Review

- **Review as it works, not only at the end.** Edits apply live; the diff view lets you reject individual changes.
- **Use checkpoints for wrong turns, Git for history.** **Restore Checkpoint** rolls files back to a point in the chat; it is local and separate from Git.
- **Run `/agent-review` before you commit** and `/review-bugbot` before you push. The patch-ID sync means Bugbot will not re-review (or re-bill) an identical diff on the PR.
- **Let the agent prove it.** Ask for the test run, the screenshot, or the browser check in the same task. Cloud agents attach these artifacts to the PR by default; local agents will if you ask.
- **End with a PR.** "Commit and push these changes, then open a PR" is a normal final instruction, and it moves review into the tool your team already uses.
- **Read the request ID trail when something is off.** **...** → **Copy Request ID** is what support needs; keep it with your notes on a bad response.

See [Bugbot & Agent Review](./review.md).

## Rules and skills

- **Rules for conventions, skills for procedures.** Rules in `.cursor/rules/` apply every time the agent works in matching files; skills are invoked with `/` for a repeatable task or playbook.
- **Three rule levels, three audiences.** User rules (Cursor Settings) for you everywhere; team rules (dashboard) for org-wide conventions; repo rules (`.cursor/rules/*.mdc`) for this project. Cloud Agents read all three.
- **Think "smart but low-context colleague."** The Cloud Agent best-practices page frames it this way: the agent does the right thing when it has the context a new hire would need, such as how to run and debug each service.
- **Put runbooks in skills, commit them.** Cursor's own `AGENTS.md` lists how to run and debug its most-used microservices, with skills holding the deep details and clear instructions on when to use each.
- **Bugbot ignores `.cursor/rules/`.** Review rules go in `.cursor/BUGBOT.md`; agent rules go in `.cursor/rules/`. They are separate on purpose.
- **Teach conventions inline.** On a PR, `@cursor remember [fact]` saves a learned rule for future reviews.
- **Build tools the agent is good at using.** If a model keeps forgetting arguments to a `package.json` script or gets lost in noisy build logs, wrap the command in a small CLI with clean output. Iterate on the tool based on how the agent actually uses it.
- **Unset `CI` when it changes behavior.** The agent sets `CI=1` for terminal commands; a rule saying `prefix with unset CI &&` fixes projects that branch on it.

See [Rules & AGENTS.md](./rules.md) and [Skills](./skills.md).

## Parallel work

- **Hand long tasks to the cloud.** Select **Cloud** by the input, type `/in-cloud`, or prefix a CLI message with `&`. Close the laptop; the agent finishes on its own VM and opens a PR.
- **Commit or stash before moving to the cloud.** The cloud agent starts from the remote Git state and does not carry your dirty files.
- **`/worktree` for risky changes.** The rest of the chat runs in a separate checkout; `/apply-worktree` brings it back, `/delete-worktree` throws it away.
- **`/best-of-n sonnet,gpt,composer <task>`** when the cost of a wrong answer is high. Compare the candidates, apply one, delete the rest.
- **Commit `.cursor/worktrees.json`.** Setup commands (`npm ci`, copy `.env` from `$ROOT_WORKTREE_PATH`, migrations) make every worktree build-ready for the whole team.
- **Isolate subagents that edit files.** Ask for "each in its own environment" or they share one checkout and overwrite each other.
- **Split only independent work.** N agents cost roughly N times the tokens. Sequential steps and small tasks are faster with one agent.
- **Pin the long-running chats** in the Agents Window sidebar so they stay on top while you switch between agents.

See [Parallel Agents & Worktrees](./parallel-agents.md) and [Cloud Agents & Automations](./cloud-agents.md).

## Models

- **Faster models for exploration and routine edits, more capable models for reasoning and multi-file refactors.** That is the official split; the model picker (or `Cmd /` to cycle) applies from the next message onward, so switch mid-conversation when the phase changes.
- **Set a default in Cursor Settings > Models**, then override per task rather than per message.
- **Understand the two usage pools.** Cursor's own models (Grok 4.6, Grok 4.5, Composer 2.5) draw from a pool with significantly more included usage; third-party models draw from the Other Models pool at API rates. On Teams and Enterprise, Auto routes among them by your optimization mode (Cost, Balance, Intelligence).
- **Compare before you standardize.** `/best-of-n` on a representative task tells you more about which model fits your codebase than a benchmark table does.
- **Match Bugbot effort to risk.** Low for docs and config repos, High for auth and payments, Smart to let Cursor decide per PR.
- **Check the model when quality drops.** A bad response is sometimes a fast model on a hard problem; the request's model is visible to support even in Privacy Mode.

## Compared with Claude Code

- The core advice is the same as the [Claude Code Tips](../claude-code/tips.md): be specific, review changes, scope tasks, keep persistent context in a rules file, commit often, plan before complex work.
- Cursor's persistent context is `.cursor/rules/*.mdc` plus `AGENTS.md` (the Cursor CLI also reads `CLAUDE.md`); Claude Code reads `CLAUDE.md` and `.claude/rules/`, and can pull in `AGENTS.md` with an `@AGENTS.md` import. A shared `AGENTS.md` is the least-duplication option for mixed teams; see [Claude Code Memory](../claude-code/memory.md).
- Cursor surfaces context usage as a ring in the prompt box with a category breakdown; Claude Code uses `/context` and the status line.
- Cursor's `/best-of-n`, `/worktree`, and `/in-cloud` are one-word entry points to isolation and parallelism that Claude Code reaches through manual `git worktree add` and Agent Teams.
- Checkpoints (Cursor) and `/rewind` (Claude Code) both roll back agent edits outside Git; neither replaces a commit.
