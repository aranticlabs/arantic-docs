---
sidebar_position: 9
sidebar_label: Subagents
description: Codex subagents run delegated work in parallel agent threads with their own model, reasoning effort, and sandbox, keeping noisy output out of the main chat.
keywords:
  [
    Codex subagents,
    custom agents,
    agent threads,
    .codex/agents,
    parallel agents,
    context isolation,
    model_reasoning_effort,
    agents.max_concurrent_threads_per_session,
    Codex CLI,
  ]
---

# Subagents

Subagents let Codex split a task into bounded pieces, run them in parallel agent threads, and bring back summaries instead of raw output. The main thread stays focused on requirements and decisions while exploration, test runs, log analysis, and reviews happen elsewhere. In local Codex clients you can also define **custom agents** with their own model, reasoning effort, sandbox, MCP servers, and instructions.

Subagent workflows are enabled by default in current Codex releases (CLI, IDE extension, and the ChatGPT desktop app) and appear as agent threads you can open and inspect.

## What is a subagent?

Codex uses three terms:

- **Subagent workflow**: Codex runs several agents in parallel and combines their results into one response.
- **Subagent**: a delegated agent Codex starts to handle one specific task.
- **Agent thread**: the thread where a subagent does its work. In the CLI you switch between threads with `/agent`; the desktop app and IDE show them as separate threads or in a background-agent panel.

Each subagent does its own model and tool work, so a subagent workflow consumes more tokens than a single-agent run doing the same work sequentially. The trade is more tokens for less context pollution and more parallelism.

### Why it helps

Even with large context windows, a main chat that fills up with exploration notes, test logs, and stack traces degrades. Codex's docs name two failure modes:

- **Context pollution**: useful information gets buried under intermediate output.
- **Context rot**: quality drops as the chat fills with less relevant detail.

Subagents move that noise off the main thread. The main agent keeps requirements, decisions, and final outputs; subagents return distilled findings.

Start with **read-heavy** parallel work: exploration, running tests, triage, summarizing large documents. Be careful with parallel **write-heavy** work; several agents editing the same tree at once create conflicts and coordination overhead.

## Built-in agents

Codex ships with three agent roles:

| Agent      | Purpose                                     |
| ---------- | ------------------------------------------- |
| `default`  | General-purpose fallback                    |
| `worker`   | Execution-focused: implementation and fixes |
| `explorer` | Read-heavy codebase exploration             |

Codex picks among these when you ask it to delegate. If you define a custom agent with the same `name` as a built-in (for example `explorer`), your definition takes precedence.

## Triggering subagents

Codex spawns subagents when you ask directly, or when an applicable `AGENTS.md` or [skill](./skills.md) instruction requests delegation. It does not proactively delegate on its own in local clients (ChatGPT Work with the Ultra intelligence level can).

Direct phrasing works: "spawn two agents", "delegate this in parallel", "use one agent per point". A good delegation prompt says how to split the work, whether to wait for all agents, and what to return:

```text
Review this branch with parallel subagents. Spawn one subagent for security risks, one for test gaps, and one for maintainability. Wait for all three, then summarize the findings by category with file references.
```

To target a specific custom agent, name it:

```text
Have pr_explorer map the affected code paths, then have reviewer look for real risks in those paths. Return one consolidated report.
```

Delegation from a skill:

```markdown
---
name: review-branch
description: Review the current branch against main with parallel subagents. Use when the user asks for a thorough review or a pre-merge check.
---

1. Spawn one `reviewer` agent per top-level package touched by `git diff main...HEAD --name-only`.
2. Give each agent only its package's file list.
3. Wait for all agents. Merge findings, remove duplicates, sort by severity.
4. Report with `file:line` references. Do not edit files.
```

Codex orchestrates the rest: spawning, routing follow-ups, waiting, and closing threads. When several agents run, Codex waits until all requested results are available before it responds.

## Defining custom agents

Custom agents are standalone **TOML** files, one agent per file:

| Location                 | Scope                                                          |
| ------------------------ | -------------------------------------------------------------- |
| `~/.codex/agents/*.toml` | Personal, all projects                                         |
| `.codex/agents/*.toml`   | Project, committed with the repo (loaded for trusted projects) |

Codex does not document a Markdown agent format; if you are coming from Claude Code's `.claude/agents/*.md`, the TOML file plays the same role.

Codex loads each file as a **configuration layer** for the spawned session. That means a custom agent can override anything a normal session config can (model, sandbox, MCP servers, skill enablement), which is more flexible than a fixed manifest but also heavier. The docs note the format may evolve.

### Required fields

| Field                    | Type   | Purpose                                                                                                                                                              |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                   | string | Identifier Codex uses when spawning or referring to the agent. The `name` field, not the filename, is the source of truth (matching them is the simplest convention) |
| `description`            | string | Guidance for when Codex should choose this agent. Write it as a usage hint                                                                                           |
| `developer_instructions` | string | The agent's core instructions (its system-level brief)                                                                                                               |

### Optional fields (any supported `config.toml` key)

| Field                    | Typical values                                                     | Notes                                                                                   |
| ------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `model`                  | `gpt-5.6`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.3-codex-spark`  | Overrides explicit spawn values and `[agents]` defaults                                 |
| `model_reasoning_effort` | `low`, `medium`, `high`, `xhigh`, `max`, `ultra` (model-dependent) | Set it whenever you set `model`, otherwise the previously resolved effort is kept       |
| `sandbox_mode`           | `read-only`, `workspace-write`, `danger-full-access`               | Tighten a reviewer or explorer to `read-only`                                           |
| `mcp_servers`            | `[mcp_servers.<name>]` tables                                      | Give an agent tools the parent does not have (docs server, browser devtools, log store) |
| `skills.config`          | `[[skills.config]]` entries                                        | Enable or disable specific skills for this agent                                        |

Settings the file omits (`sandbox_mode`, `mcp_servers`, `skills.config`, and so on) are inherited from the parent session.

### Example file

`.codex/agents/reviewer.toml`:

```toml
name = "reviewer"
description = "PR reviewer focused on correctness, security, and missing tests."
model = "gpt-5.6-terra"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = """
Review code like an owner.
Prioritize correctness, security, behavior regressions, and missing test coverage.
Lead with concrete findings, include reproduction steps when possible, and avoid style-only comments unless they hide a real bug.
"""
```

### Declaring agents in `config.toml` instead

You can also declare a role inline and point at a config layer:

```toml
[agents.docs_researcher]
description = "Documentation specialist that verifies APIs through the docs MCP server."
config_file = "agents/docs-researcher.toml"
```

Relative `config_file` paths resolve from the config file that declares the role. Scalar `[agents]` setting names (`enabled`, `max_concurrent_threads_per_session`, and so on) are reserved and cannot be used as role names.

## How model and effort are resolved

For each setting Codex resolves, in order:

1. An explicit value in the spawn request (for example you asked for `gpt-5.6-luna` in the prompt)
2. The `[agents]` default (`default_subagent_model`, `default_subagent_reasoning_effort`)
3. The parent session's value

Then, if the custom agent file sets `model` or `model_reasoning_effort`, the file wins. If a model is selected without an effort at any step, that model's default effort is used. A file that sets only `model` keeps the previously resolved effort, so set both when the model does not support that effort or you want a different one.

Model guidance from the official docs:

| Model           | Use for                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `gpt-5.6`       | Demanding agents: ambiguous, multi-step work with planning, tool use, and validation                                                         |
| `gpt-5.6-terra` | Speed and efficiency: exploration, read-heavy scans, large-file review, processing supporting documents; a good default for parallel workers |
| `gpt-5.6-luna`  | Fast, narrowly scoped, repeatable or high-volume work                                                                                        |

Reasoning effort: `medium` is the balanced default; `high` for agents that must trace complex logic or check edge cases (reviewers, security); `low` when speed matters most; `xhigh`, `max`, and `ultra` for the hardest work when the model supports them. Higher effort costs more time and tokens.

## Global settings and concurrency

All global knobs live under `[agents]` in `config.toml`:

| Key                                         | Type    | Default      | Purpose                                                                                                        |
| ------------------------------------------- | ------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `agents.enabled`                            | boolean | `true`       | Turn multi-agent tools on or off                                                                               |
| `agents.max_concurrent_threads_per_session` | number  | Codex-chosen | Cap on concurrently open spawned threads, excluding the primary thread. `agents.max_threads` is a legacy alias |
| `agents.default_subagent_model`             | string  | inherit      | Default model for spawned agents                                                                               |
| `agents.default_subagent_reasoning_effort`  | string  | inherit      | Default effort for spawned agents                                                                              |
| `agents.interrupt_message`                  | boolean | `true`       | Record a model-visible message when an agent turn is interrupted                                               |

Example project config (`.codex/config.toml`):

```toml
[agents]
max_concurrent_threads_per_session = 6
default_subagent_model = "gpt-5.6-terra"
default_subagent_reasoning_effort = "medium"
```

Under the hood the feature flag `features.multi_agent` (stable, on by default) exposes the tools `spawn_agent`, `send_input`, `resume_agent`, `wait_agent`, and `close_agent` to the model. Admins can pin it on or off for managed users in `requirements.toml`.

## Context isolation, sandbox, and approvals

- Each agent thread has its own context. The main thread receives only the summary the subagent returns.
- Subagents **inherit the parent's sandbox policy** and permission mode. Choose the mode for the parent turn before asking Codex to delegate.
- A custom agent file can **narrow** that for one agent, for example `sandbox_mode = "read-only"` for a reviewer.
- Live runtime overrides you set interactively (`/permissions` changes, `--yolo`) are reapplied to children even if the custom agent file sets different defaults.
- In the CLI, approval requests from inactive threads surface while you look at the main thread. The overlay shows the source thread; press `o` to open that thread before approving or rejecting.
- In non-interactive runs (`codex exec`, scheduled tasks), an action that needs a fresh approval fails and the error is returned to the parent workflow. Configure the sandbox up front; see [Automation](./automation.md).

Skills are not automatically shared with a subagent beyond what its config layer allows. Use `[[skills.config]]` in the agent file to disable skills it should not use, and put the essential procedure in `developer_instructions` or in the delegation prompt.

## Managing running subagents

| Surface       | Controls                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| CLI           | `/agent` switches between active agent threads; ask Codex in plain language to steer, stop, or close a subagent |
| IDE extension | Background-agent panel above the composer shows status, lets you stop all agents or open a thread               |
| Desktop app   | Open a subagent thread from the main-thread activity; ask Codex to steer, stop, or close                        |

## Cost

Every subagent is a separate model session with its own tool calls. Three parallel agents cost roughly three times the tokens of one sequential pass, plus the main thread's orchestration. Ways to keep it reasonable:

- Default spawned agents to `gpt-5.6-terra` or `gpt-5.6-luna` and reserve `gpt-5.6` for the agent that needs judgment.
- Cap `max_concurrent_threads_per_session`.
- Give each agent a narrow file list or scope so it does not re-explore the repository.
- Ask for **summaries with references**, not transcripts.

## Subagents vs skills vs AGENTS.md

| Need                                                                          | Use                                                  |
| ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| Rules for every task in the repo                                              | `AGENTS.md` ([AGENTS.md & Memories](./agents-md.md)) |
| A repeatable procedure that runs inside the current conversation              | [Skill](./skills.md)                                 |
| Work that should run in its own context with its own model, sandbox, or tools | Custom agent (this page)                             |
| A procedure that itself fans out to parallel workers                          | Skill whose steps tell Codex to spawn named agents   |
| Deterministic checks regardless of model decisions                            | [Hooks](./hooks.md)                                  |

Reach for a subagent when the work is noisy (tests, logs), read-heavy and parallel (exploration across packages), or needs different permissions (a read-only auditor, a browser-enabled debugger). Reach for a skill when you want guidance available in the main thread across many turns.

## Practical blueprints

Copy these into `.codex/agents/` (project) or `~/.codex/agents/` (personal). Names use underscores because that is the convention in the official examples; kebab-case filenames are fine.

### code_reviewer (read-only, high effort)

```toml
name = "code_reviewer"
description = "Read-only reviewer for correctness, security, and missing tests. Use for PR reviews, pre-merge checks, or when the user asks what could break."
model = "gpt-5.6-terra"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = """
You review code and never edit it.
Check for logic bugs, unhandled errors, injection and auth issues, behavior changes without tests.
Ignore formatting.
Return findings grouped by severity (Critical, High, Medium, Low) with file:line and a one-sentence fix each.
Finish with a two-sentence verdict.
"""
```

### test_writer (workspace-write, medium effort)

```toml
name = "test_writer"
description = "Writes and runs unit tests for a given file or function using the project's existing framework. Use when the user asks for tests or coverage."
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"
sandbox_mode = "workspace-write"
developer_instructions = """
Detect the existing test framework and match the style of two existing test files.
Cover the happy path, empty and null inputs, boundaries, and every error branch.
Run only the new tests. Fix failures in the tests, not in the code under test.
Report what is covered and what is intentionally not.
"""
```

### docs_writer (workspace-write, docs MCP server)

```toml
name = "docs_writer"
description = "Writes or updates developer documentation for changed code, verifying framework APIs through the docs MCP server. Use for README, API docs, and changelog updates."
model = "gpt-5.6-luna"
model_reasoning_effort = "medium"
sandbox_mode = "workspace-write"
developer_instructions = """
Document only public behavior. Match the existing tone and heading structure.
Verify any framework or API claim with the docs MCP server before writing it.
Do not change source code. Return the list of files you edited.
"""

[mcp_servers.openaiDeveloperDocs]
url = "https://developers.openai.com/mcp"
```

### explorer (read-only, fast)

```toml
name = "explorer"
description = "Read-only codebase explorer that maps execution paths and cites files and symbols before changes are proposed."
model = "gpt-5.6-luna"
model_reasoning_effort = "low"
sandbox_mode = "read-only"
developer_instructions = """
Stay in exploration mode.
Trace the real execution path, cite files and symbols, and do not propose fixes unless asked.
Prefer targeted search and file reads over broad scans.
Return a short map: entry points, key files, and open questions.
"""
```

Because this file is named `explorer`, it overrides the built-in `explorer` role.

### Putting them together

`.codex/config.toml`:

```toml
[agents]
max_concurrent_threads_per_session = 6
default_subagent_model = "gpt-5.6-terra"
```

Prompt:

```text
Investigate why the settings modal fails to save. Have explorer trace the responsible code path, code_reviewer list the likely defects in that path, and test_writer add a failing regression test for the top defect. Wait for all three and give me one report.
```

## What works well

- Narrow, opinionated agents: one job, a matching sandbox, instructions that stop drift into adjacent work.
- Read-only for anything that only needs to look (explorers, reviewers, auditors).
- A `description` written as a routing hint, so Codex picks the right agent when you name the outcome rather than the agent.
- Committing `.codex/agents/` so the whole team delegates to the same specialists.
- Pairing an agent with a purpose-built MCP server (docs, browser devtools, log search) instead of giving every server to the main session.

## What to avoid

- **Parallel writers on the same files.** Split by package or run implementation agents sequentially.
- **Delegating tiny tasks.** Spawning costs tokens and time; a one-file change is faster inline.
- **Broad mandates.** "Review, fix, test, and document" in one agent recreates the context problem you delegated to avoid.
- **Assuming approvals will be answered in CI.** Non-interactive runs fail actions that need a new approval. Set the sandbox up front.
- **Setting `model` without `model_reasoning_effort`.** You may inherit an effort the model does not support.
- **Expecting Markdown agent files.** Codex reads TOML under `.codex/agents/`.

## Compared with Claude Code

|                          | Codex                                                             | Claude Code                                                                       |
| ------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Definition format        | TOML, `.codex/agents/*.toml` and `~/.codex/agents/*.toml`         | Markdown with YAML frontmatter, `.claude/agents/*.md` and `~/.claude/agents/*.md` |
| Required fields          | `name`, `description`, `developer_instructions`                   | `name`, `description`                                                             |
| Built-ins                | `default`, `worker`, `explorer`                                   | Explore, Plan, General-purpose                                                    |
| Tool restriction         | Via `sandbox_mode`, `mcp_servers`, `skills.config` (config layer) | `tools` / `disallowedTools` allowlists                                            |
| Concurrency cap          | `agents.max_concurrent_threads_per_session`                       | Fixed limit; nesting depth via `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`             |
| Triggering               | Direct request, or `AGENTS.md`/skill instructions                 | Automatic based on `description`, `@agent-name` mention                           |
| Inspecting threads       | `/agent` in CLI, thread panels in app and IDE                     | `/tasks`, subagent panel                                                          |
| Peer-to-peer agent teams | Not documented; parallel subagents report to the main thread      | Agent Teams (experimental)                                                        |
| Preloaded skills         | Enable/disable via `skills.config` in the agent file              | `skills:` list injects full skill bodies                                          |

See [Claude Code Subagents](../claude-code/subagents.md) for the Claude Code side, and [Worktrees & Parallel Sessions](./worktrees.md) for running whole Codex sessions in parallel instead of subagents.
