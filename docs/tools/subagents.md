---
sidebar_position: 3
---

# Subagents

Subagents are the primary way Claude Code delegates work without ballooning your main conversation. The main agent spawns a subagent, gives it a focused job, and gets back a clean summary — keeping your context window tidy and your token bill reasonable.

## What is a subagent?

A subagent is a child Claude instance launched by the main agent inside the same session. It is not a peer — it is a helper. Each one gets:

- Its own **isolated context window** — a clean slate with no history from your main chat
- A **custom system prompt** that scopes its role and behavior
- **Specific tools** (often a restricted subset — e.g. read-only, no shell access)
- Its own **model choice** (often Haiku for cost efficiency on mechanical tasks)

When the subagent finishes, it reports a summary back to the main agent. It never talks to you directly, and subagents never talk to each other.

## Built-in subagents

Claude Code ships with several built-in subagents the main agent can invoke automatically:

| Subagent | Purpose | Default model |
|----------|---------|---------------|
| **Explore** | Fast read-only codebase search — finds files, symbols, patterns | Haiku |
| **Plan** | Architecture and design research, implementation planning | Sonnet |
| **General-purpose** | Broad-purpose delegation for tasks that don't fit a specialist | Sonnet |

The main agent selects these automatically based on the task, or you can nudge it ("use the Explore agent to find all usages of `getUser`").

## Creating custom subagents

You can define your own subagents at two levels:

- **Project-level** — lives in `.claude/agents/` inside your repo; available only in that project
- **User-level** — lives in `~/.claude/agents/`; available in every project

Each subagent is a single Markdown file. The filename becomes the agent's name.

### File format

```markdown
---
name: code-reviewer
description: Reviews staged changes for bugs, security issues, and style problems. Use this when the user asks for a code review or before committing.
model: claude-haiku-4-5-20251001
tools: Read, Glob, Grep
---

You are a careful, security-focused code reviewer. You only read files — never edit them.
When reviewing, check for: logic bugs, security vulnerabilities (OWASP top 10), missing error handling, and style inconsistencies.
Output a structured report with severity ratings (critical / high / medium / low) and specific line references.
```

### Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Identifier used to reference the agent |
| `description` | Yes | Tells the main agent when to invoke this subagent; write it as a usage hint |
| `model` | No | Defaults to the main agent's model if omitted |
| `tools` | No | Comma-separated list of allowed tools; omit to inherit all tools |

### Project-level example

```
your-repo/
└── .claude/
    └── agents/
        ├── code-reviewer.md
        ├── test-runner.md
        └── migration-writer.md
```

### User-level example

```
~/.claude/
└── agents/
    ├── security-auditor.md
    └── changelog-writer.md
```

## Using subagents

### Automatic delegation

The main agent reads the `description` field of every available subagent and delegates automatically when the task matches. A well-written description is the most important part of a custom subagent — it determines when the agent gets invoked.

### Explicit direction

You can tell the main agent to use a specific subagent:

```
Use the code-reviewer agent to review my staged changes.
```

```
Run the test-runner agent on the files I just edited, then continue.
```

### Background vs. foreground

By default, subagents run in the foreground — the main agent waits for a result before continuing. For independent tasks you can run them in the background:

```
Run the test suite in the background while I keep working.
```

The main agent will notify you when a background subagent completes.

### Parallel subagents

The main agent can launch multiple subagents simultaneously for independent tasks:

```
In parallel: (1) search for all API endpoints, (2) check test coverage, (3) list all open TODO comments.
```

Each subagent runs concurrently; results are collected and summarized together.

## Tips for effective subagents

- **Write specific descriptions.** The description is how the main agent decides when to invoke your subagent. Vague descriptions lead to missed or incorrect invocations.
- **Restrict tools intentionally.** A read-only subagent cannot accidentally edit files. A subagent with no shell access cannot run arbitrary commands. Narrow the tool list to what the job actually needs.
- **Use Haiku for mechanical tasks.** Searching, grepping, linting, and formatting don't need a powerful model. Haiku is significantly cheaper and fast enough for these.
- **Keep system prompts focused.** A subagent that does one thing well is more reliable than one with a broad mandate. If you find yourself writing a long list of responsibilities, split it into two agents.
- **Put project agents in version control.** Committing `.claude/agents/` means your whole team shares the same specialist helpers automatically.

---

## Agents vs. subagents vs. Agent Teams

Claude Code has three related but distinct concepts. People often use the terms loosely, so here is the official breakdown.

### The main agent

The main agent is the primary Claude Code session you are talking to. It receives your prompts, plans work, orchestrates everything, and interacts directly with you. It has the full conversation history, your project context (CLAUDE.md, MCP servers, etc.), and full tool access. Think of it as the lead or conductor.

### Subagents

Subagents are the most common form of delegation — specialized child assistants spawned by the main agent inside the same session.

Each subagent gets:
- Its own **isolated context window** (clean slate, no bloat in your main chat)
- A **custom system prompt** (e.g. "You are a read-only code reviewer")
- **Restricted or specific tools** and a model of its own choosing (often Haiku for cost)

Subagents only report a summary result back to the main agent. They never talk to each other or directly to you. The main agent can delegate automatically, or you can direct it explicitly.

Built-in subagents include **Explore** (fast read-only search), **Plan** (architecture research), and **General-purpose**. You can also define unlimited custom ones at the project or user level.

**Key point:** subagents are hierarchical (main agent → subagent) and live entirely inside one session.

### Agent Teams

Agent Teams is the newer, heavier-weight collaboration mode. Each teammate is a **fully independent Claude Code session** — not a child of the main agent, but a peer.

| | Subagents | Agent Teams |
|---|---|---|
| **Architecture** | Single session, hierarchical | Multiple independent sessions |
| **Communication** | Report results back to main agent only | Direct peer-to-peer messaging + shared task list |
| **Parallelism** | Yes | Full parallel + self-coordination |
| **Context** | Isolated per subagent | Fully independent per teammate |
| **You can talk to them directly** | No (through main agent only) | Yes — click any pane or cycle with `Shift+↓` |
| **Token cost** | Moderate (summaries only) | High (~one full session per teammate) |
| **Best for** | Focused tasks, context saving, specialization | Complex collaboration, competing hypotheses, cross-layer work |
| **Setup** | Built-in or simple custom files | Experimental flag + tmux/iTerm2 recommended |

### Simple mental model

- **Subagent** — hire a specialist who works alone in their office and emails you the finished report.
- **Agent Team** — hire a whole team who sit in separate rooms, can message each other directly, self-assign tasks, and collaborate in real time while you oversee the lead.

### When to use which

- **Use subagents (most of the time)** — to keep your main context clean, run noisy tasks (tests, exploration, linting), or delegate to specialists without multiplying token costs.
- **Use Agent Teams** — when you need true peer collaboration: frontend + backend + QA arguing with each other, adversarial debugging with multiple competing hypotheses, or any work that genuinely benefits from teammates challenging each other's findings.

Most people start with subagents and only escalate to Agent Teams for large, complex projects where cross-agent discussion adds real value.
