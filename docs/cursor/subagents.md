---
sidebar_position: 9
sidebar_label: Subagents
description: Cursor subagents run delegated work in their own context window, with built-in Explore, Bash, and Browser agents and custom agents defined in .cursor/agents/.
keywords: [Cursor subagents, .cursor/agents, context isolation, parallel agents, Explore subagent, background subagents, custom subagent, cloud subagents, model per subagent, delegation]
---

# Subagents

Subagents are specialized assistants that Cursor's Agent delegates tasks to. Each one runs in its own context window, does a focused piece of work, and returns a result to the parent conversation. They are how Cursor keeps noisy operations (codebase search, long shell output, browser snapshots) out of your main context, runs independent workstreams in parallel, and applies specialist prompts and models to specific kinds of work. Subagents work in the editor, the [CLI](./cli.md), and [Cloud Agents](./cloud-agents.md).

## What is a subagent?

A subagent is a child agent launched by the main Agent inside the same session. It receives a prompt that the parent writes, works autonomously with its own tools, and hands back a final message. Four properties define it:

| Property | What it means |
|---|---|
| **Context isolation** | A clean context window. Intermediate output (search results, logs, DOM snapshots) stays inside the subagent; the parent sees only the summary |
| **Parallel execution** | Several subagents can run at once on different parts of the codebase |
| **Specialized expertise** | Custom prompt, optional model, and optional read-only restriction per subagent |
| **Reusability** | Custom subagents are Markdown files you can commit and reuse across projects |

Subagents start with no conversation history. The parent includes whatever context the subagent needs in the prompt it sends, so a subagent is only as well-briefed as that prompt.

### Foreground vs background

| Mode | Behavior | Best for |
|---|---|---|
| **Foreground** | Blocks until the subagent completes and returns the result immediately | Sequential steps where the parent needs the output before continuing |
| **Background** | Returns immediately; the subagent works independently and writes its state as it runs | Long-running tasks and parallel workstreams |

Background subagents write output to `~/.cursor/subagents/`, and the parent can read those files to check progress. Set `is_background: true` in a custom subagent's frontmatter to always run it in the background.

## Built-in subagents

Cursor ships three built-in subagents. They were added after analysis of conversations that hit context limits, and each one isolates a specific kind of noisy work. You do not configure them; Agent uses them automatically when appropriate.

| Subagent | Purpose | Why it is a subagent |
|---|---|---|
| **Explore** (`explore`) | Searches and analyzes the codebase | Exploration produces large intermediate output. Uses a faster model by default so it can run many parallel searches |
| **Bash** (`bash`) | Runs a series of shell commands | Command output is verbose. Isolating it keeps the parent focused on decisions, not logs |
| **Browser** (`browser`) | Controls a browser through MCP tools | Browser interactions produce noisy DOM snapshots and screenshots. The subagent filters them down to relevant results |

The design trade-offs behind these three carry over to your own subagents: isolate work that generates noise, use a cheaper or faster model when the task is mechanical, and tune the prompt and tools for one job.

:::note
The Cloud Agents API reserves additional built-in names (`explore`, `debug`, `shell`, `computerUse`, among others) that a custom subagent name cannot collide with. In the editor documentation, the three built-ins above are the ones described. Avoid all of those names for your custom subagents.
:::

## When to use subagents (and when not to)

| Use a subagent when... | Use a skill instead when... |
|---|---|
| You need context isolation for a long research task | The task is single-purpose (generate a changelog, format imports) |
| You want several workstreams to run in parallel | You want a quick, repeatable action |
| The task needs specialized expertise across many steps | The task completes in one shot |
| You want an independent verification of work | You do not need a separate context window |

If you catch yourself writing a subagent for "generate a changelog" or "format imports", write a [skill](./skills.md) instead. Subagents cost startup time and tokens; they pay off when isolation or parallelism matters.

## Defining custom subagents

### File locations

| Type | Location | Scope |
|---|---|---|
| **Project subagents** | `.cursor/agents/` | Current project only |
| | `.claude/agents/` | Current project (Claude Code compatibility) |
| | `.codex/agents/` | Current project (Codex compatibility) |
| **User subagents** | `~/.cursor/agents/` | All projects for the current user |
| | `~/.claude/agents/` | All projects (Claude Code compatibility) |
| | `~/.codex/agents/` | All projects (Codex compatibility) |

Project subagents take precedence over user subagents when names conflict. Among the compatibility folders, `.cursor/` wins over `.claude/` and `.codex/` for the same name. If your team already maintains `.claude/agents/`, Cursor reads it as is; the Cursor-specific fields below are simply ignored by other tools.

### File format

Each subagent is a Markdown file with YAML frontmatter followed by its system prompt:

```markdown
---
name: security-auditor
description: Security specialist. Use when implementing auth, payments, or handling sensitive data.
model: inherit
readonly: true
---

You are a security expert auditing code for vulnerabilities.

When invoked:
1. Identify security-sensitive code paths
2. Check for common vulnerabilities (injection, XSS, auth bypass)
3. Verify secrets are not hardcoded
4. Review input validation and sanitization

Report findings by severity:
- Critical (must fix before deploy)
- High (fix soon)
- Medium (address when possible)
```

### Frontmatter fields

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | No | Derived from filename | Display name and identifier. Lowercase letters and hyphens |
| `description` | string | No | none | Short description shown in Task tool hints. Agent reads this to decide when to delegate |
| `model` | string | No | `inherit` | `inherit` or a specific model ID, optionally with bracketed parameters. See [Model selection](#model-selection-per-subagent) |
| `readonly` | boolean | No | `false` | When `true`, the subagent runs with restricted write permissions: no file edits and no state-changing shell commands |
| `is_background` | boolean | No | `false` | When `true`, the subagent runs in the background without blocking the parent |

:::note
There is no `tools` allowlist in Cursor subagent frontmatter. Subagents inherit all tools from the parent, including MCP tools from configured servers. The one restriction knob is `readonly: true`, which is the right default for reviewers, auditors, and explorers. To limit specific tools or commands, use [hooks](./hooks.md) (for example `subagentStart` or `beforeShellExecution`) rather than frontmatter.
:::

### Creating a subagent

The quickest route is the built-in `/create-subagent` skill, or a plain request such as:

```text
Create a subagent file at .cursor/agents/verifier.md with YAML frontmatter
(name, description) followed by the prompt. The verifier subagent should
validate completed work, check that implementations are functional, run
tests, and report what passed vs what's incomplete.
```

Or write the file by hand in `.cursor/agents/` (project) or `~/.cursor/agents/` (user). Agent includes every custom subagent in its available tools; check the directory to see what is configured.

## Model selection per subagent

The `model` field has two forms:

| Value | Behavior |
|---|---|
| `inherit` | Same model as the parent agent (default) |
| A specific model ID | Exactly that model, regardless of the parent, for example `composer-2` or `gpt-5.6-sol`. See the [models reference](https://cursor.com/docs/models-and-pricing) for current IDs |

Use `inherit` when the subagent needs the same reasoning power as the parent. Pin a model when the job needs a particular model's strengths, or when a mechanical task should run on something cheaper.

### Model parameters

Append square brackets to a model ID to set per-model options as `id=value` pairs, comma-separated:

| Example | Behavior |
|---|---|
| `composer-2.5[]` | Pins the base model; empty brackets select the standard variant instead of the fast one |
| `composer-2.5[fast=false]` | Selects the standard (non-fast) variant explicitly |
| `claude-opus-5[effort=high]` | Sets reasoning effort to `high` |
| `claude-opus-5[context=300k]` | Sets the context window to 300k tokens |
| `claude-opus-5[effort=high,context=300k]` | Combines options |

Available options depend on the model and use the same `id=value` pairs as the SDK's model parameters.

```markdown
---
name: planner
description: Plans complex changes before implementation. Use before starting multi-file features.
model: claude-opus-5[effort=high]
readonly: true
---

Break the task into a clear, ordered implementation plan with file-level detail.
Do not edit files.
```

### When the configured model is not used

Cursor honors `model` unless one of these applies, in which case it falls back to a compatible model:

- Your team admin has blocked the specified model.
- You are on a legacy request-based plan, the model requires Max Mode, and Max Mode is off. On such plans without Max Mode, subagents run on Composer regardless of `model`.
- The model is not available on your plan.

If a subagent behaves unexpectedly, check plan and model settings before rewriting the prompt.

## Invoking subagents

### Implicit (automatic) delegation

Agent delegates on its own based on task complexity and scope, the descriptions of your custom subagents, and the current context and tools. Descriptions are the lever: phrases such as "use proactively" or "always use for" encourage automatic delegation.

**Weak:**

```yaml
description: Helps with code.
```

**Strong:**

```yaml
description: Test automation expert. Use proactively after code changes to run the affected tests and fix failures.
```

### Explicit invocation

Request a specific subagent with `/name` at the start of your prompt, or name it in plain language:

```text
/verifier confirm the auth flow is complete
/debugger investigate this error
/security-auditor review the payment module
```

```text
Use the verifier subagent to confirm the auth flow is complete.
Have the debugger subagent investigate this error.
Run the security-auditor subagent on the payment module.
```

### Parallel fan-out

Ask for parallel work and Agent sends multiple Task tool calls in one message, so the subagents run simultaneously:

```text
Review the API changes and update the documentation in parallel.
```

```text
In parallel: (1) find every caller of getUser, (2) list untested files under
src/billing, (3) summarize open TODO comments. Report the three results separately.
```

From a plan, **Build in Parallel** runs the independent steps at once while keeping dependent steps in order. Typing `/multitask` makes Cursor run async subagents in parallel instead of queuing your requests. For running whole agents side by side (rather than subagents inside one session), see [Parallel Agents & Worktrees](./parallel-agents.md).

### Isolated project copies

By default subagents share the parent's checkout, so several subagents editing at once can overwrite each other. Ask for isolation and each subagent gets its own copy of the project:

```text
Run a swarm of subagents to fix these five flaky tests, each in its own environment.
```

Each subagent then works on its own branch: an isolated Git worktree with a separate working directory on the same machine, or its own cloud environment with a dedicated VM and clone. Changes stay on each branch until the parent merges the results. This is subagent-level isolation within one session; to isolate an entire agent, use a worktree or hand the task to a cloud subagent.

### Cloud subagents

From a local session in the Agents Window you can hand work to a cloud subagent that runs on its own VM and branch while your local workspace stays clean:

- Type `/in-cloud` and the next task you submit runs as a cloud subagent.
- Use `/autopilot` (or the quick-action pill) to have a cloud subagent take over a pull request and iterate until it is merge-ready.

Cloud subagents use the [environment](./cloud-agents.md) configured for the repository and follow the same model and capability rules as other Cloud Agents. Their MCP servers come from the team configuration at cursor.com/agents, not from your local session.

### Resuming a subagent

Each subagent execution returns an agent ID. Pass it back to continue with full context preserved, which suits long tasks that span several invocations:

```text
Resume agent abc123 and analyze the remaining test failures.
```

Background subagents write their state as they run, so you can resume one after it completes.

### Nesting

Since Cursor 2.5, subagents can launch child subagents to form a tree of coordinated work. The main agent and its direct subagents can launch subagents; a subagent launched by another subagent cannot launch further ones. Nested launches also need Task tool access in the current mode, and hooks or tool policies can block spawning.

## Context isolation in practice

The point of a subagent is what does *not* come back. A codebase search that touches forty files, a test run that prints two thousand lines, a browser session with a dozen DOM snapshots: all of it stays in the child context, and the parent receives a few paragraphs. That keeps the main conversation readable and postpones context compression.

Two consequences to design for:

- **Brief the subagent fully.** It has no memory of your conversation. If it needs to know which branch, which failing test, or which convention applies, that must be in the prompt (or in project rules and skills it can read from the repo).
- **Ask for structured output.** Tell the subagent the shape of the report you want (passed/failed lists, findings grouped by severity, file paths and lines). The parent's next step is only as good as the summary it receives.

Cursor's documentation also suggests [hooks](./hooks.md) when subagents must produce structured output files consistently, since a `subagentStop` hook runs deterministically regardless of how the model phrased its final message.

## Cost considerations

| Benefit | Trade-off |
|---|---|
| Context isolation | Startup overhead: each subagent gathers its own context |
| Parallel execution | Higher token usage: several contexts running at once |
| Specialized focus | Latency: often slower than the main agent for simple tasks |

- Subagents consume tokens independently. Five in parallel use roughly five times the tokens of one agent.
- For quick, simple tasks the main agent is usually faster. Subagents shine for complex, long-running, or parallel work.
- The benefit is isolation, not speed. A subagent doing a trivial task starts cold and may be slower than doing it inline.
- Use a cheaper or faster model for mechanical work (search, test runs, formatting checks) and reserve the parent's model for judgment.

## Practical blueprints

Each blueprint below uses only documented frontmatter. Save them under `.cursor/agents/<name>.md` and commit the folder so the team shares them.

### Reviewer (read-only)

```markdown
---
name: code-reviewer
description: Reviews staged or recently changed code for bugs, security issues, and style problems. Use when the user asks for a review, says "review my changes", or before committing.
model: inherit
readonly: true
---

You are a careful, security-focused code reviewer. You only read files and run
read-only commands such as `git diff`; you never edit.

Check for logic bugs and off-by-one errors, OWASP top-10 issues, missing or
incorrect error handling, unhandled edge cases, and inconsistencies with the
surrounding code.

Report grouped by severity (Critical, High, Medium, Low). For each finding give
file, line, a one-sentence description, and a suggested fix. End with a short
overall summary.
```

### Test writer

```markdown
---
name: test-writer
description: Writes unit tests for a file or function using the project's existing test framework and style. Use when the user asks to add tests, cover a function, or improve coverage.
model: inherit
---

You write tests that match the repository's conventions.

1. Detect the framework and assertion style from existing tests.
2. Cover the happy path, edge cases (empty, null, boundary), and error paths.
3. Place the file where sibling tests live and follow their naming.
4. Run the new tests and fix them until they pass without changing the code under test.

Report: files created, number of tests, and anything you could not cover with a reason.
```

### Test runner (background)

```markdown
---
name: test-runner
description: Runs the relevant test suite and reports results. Use proactively after code changes or when the user asks whether tests pass.
model: inherit
readonly: true
is_background: true
---

Detect the test command from package.json, Makefile, pyproject, go.mod, or
similar. Run the tests for the changed packages first, then the full suite if
they pass.

Report status (PASSED, FAILED, ERROR), counts, and for each failure the test
name, file and line, and the exact message. Do not attempt to fix failing tests.
```

### Docs writer

```markdown
---
name: docs-writer
description: Writes or updates developer documentation for a module, endpoint, or change. Use when the user asks to document code, update the README, or write a changelog entry.
model: inherit
---

You write concise developer documentation that matches the existing docs style.

1. Read the code and any existing docs for the area.
2. Update or create the relevant Markdown (README section, docs page, or CHANGELOG entry).
3. Keep examples runnable and consistent with the actual API.

Do not modify source code. Report the files you changed and any open questions.
```

### Explorer (cheap, read-only)

```markdown
---
name: explorer
description: Fast read-only codebase research. Use when the user needs to find where something is implemented, trace a call chain, or map a feature before changing it.
model: composer-2.5[]
readonly: true
---

Search the codebase and return a compact map: relevant files with one line each
on what they do, the entry points, and how they connect. Include exact paths and
symbol names. Do not propose changes and do not edit anything.
```

### Verifier

```markdown
---
name: verifier
description: Validates completed work. Use after tasks are marked done to confirm implementations are functional.
readonly: true
---

You are a skeptical validator. Do not accept claims at face value.

1. Identify what was claimed to be completed.
2. Check that the implementation exists and works.
3. Run relevant tests or verification steps.
4. Look for edge cases that may have been missed.

Report what was verified and passed, what was claimed but incomplete or broken,
and the specific issues that need attention.
```

### Orchestrating them

For complex work, the parent coordinates specialists in sequence: a planner analyzes requirements and produces a plan, an implementer builds from it, and the verifier confirms the result matches. Each handoff should include structured output so the next subagent has clear context. Wrap a recurring sequence in a [skill](./skills.md) so you can start it with one `/command`; see [Cloud Agents & Automations](./cloud-agents.md) for turning such sequences into unattended workflows.

## What to avoid

- **Dozens of generic subagents.** Fifty agents described as "helps with coding" give Agent no signal about when to delegate and cost you maintenance. Start with two or three focused ones.
- **Vague descriptions.** "Use for general tasks" never triggers correctly. Write "Use when implementing authentication flows with OAuth providers."
- **Two-thousand-word prompts.** Long prompts make a subagent slower and harder to maintain, not smarter.
- **Duplicating a slash command.** Single-purpose, no-isolation tasks belong in a skill or command.
- **Parallel edits without isolation.** If several subagents will write files, ask for isolated environments or they will overwrite each other.
- **Expecting conversation memory.** Subagents start clean. Put the necessary context in the prompt.
- **Colliding with built-in names.** Do not name a custom subagent `explore`, `bash`, `browser`, `debug`, `shell`, or `computerUse`.

## Troubleshooting

| Symptom | What to check |
|---|---|
| Subagent never gets used | Make `description` specific and add "use proactively" or "always use for" phrasing; test by invoking it explicitly with `/name` |
| Wrong model is used | Team model restrictions, plan limitations, legacy Max Mode setting |
| Subagent fails | It returns an error status to the parent, which can retry, resume with more context, or handle it differently |
| Cannot see progress | Background subagents write to `~/.cursor/subagents/`; ask the parent to read those files |
| MCP tools missing in a cloud subagent | Cloud subagents use the team's MCP configuration at cursor.com/agents, not your local servers |
| Nested spawn does not happen | Depth limit reached, Task tool unavailable in the current mode, or a hook or tool policy blocked it |

## Compared with Claude Code

| Topic | Cursor | Claude Code |
|---|---|---|
| Built-ins | Explore, Bash, Browser (context-heavy operations) | Explore, Plan, General-purpose, and a catch-all `claude` agent |
| Definition files | `.cursor/agents/*.md`, `~/.cursor/agents/*.md`, plus `.claude/agents/` and `.codex/agents/` read for compatibility | `.claude/agents/*.md`, `~/.claude/agents/*.md`, `--agents` JSON, plugins, managed settings |
| Frontmatter | `name`, `description`, `model`, `readonly`, `is_background` | Larger surface: `tools`, `disallowedTools`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `isolation`, `effort`, and more |
| Tool restriction | `readonly: true` only; hooks for finer control | Per-tool allow and deny lists |
| Model syntax | Model ID with bracket parameters, e.g. `claude-opus-5[effort=high]` | Aliases (`sonnet`, `opus`, `haiku`) or full IDs, plus `effort` field |
| Isolation per subagent | Ask for isolated worktrees or cloud environments in the prompt | `isolation: worktree` in frontmatter |
| Cloud handoff | `/in-cloud`, `/autopilot`, cloud subagents on their own VM | No direct subagent equivalent |
| Nesting | Since Cursor 2.5, two levels below main | Configurable depth via `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` |
| Peer teams | No peer-to-peer agent teams; parallel agents run as separate sessions | Agent Teams (experimental) |

See [Claude Code Subagents](../claude-code/subagents.md) for the Claude Code details, and [Cursor](../tools/cursor.md) for the general tool overview.
