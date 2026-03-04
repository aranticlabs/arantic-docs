---
sidebar_position: 5
---

# Workflows & Orchestration

Claude Code's commands, subagents, and skills can be composed into structured workflows that go far beyond single-prompt interactions. This page covers orchestration patterns for organizing complex, multi-step tasks.

## The Command-Agent-Skill pattern

The most effective way to structure complex Claude Code workflows is the **Command-Agent-Skill** pattern. Each layer has a distinct role:

| Layer | Role | Where it lives |
|-------|------|----------------|
| **Command** | Entry point for the user; orchestrates the overall flow | `.claude/commands/` |
| **Agent** | Executes a specific task with its own tools and preloaded knowledge | `.claude/agents/` |
| **Skill** | Reusable knowledge bundle or independent output generator | `.claude/skills/` or `.claude/commands/` |

### How the layers connect

1. **The user invokes a command** (`/my-workflow`). The command prompt describes the overall task, gathers any user input, and delegates subtasks to agents.
2. **The command spawns one or more agents.** Each agent has a focused responsibility (data fetching, code generation, review) and can have skills preloaded into its context via the `skills` frontmatter field.
3. **Agents call skills when needed.** A skill can either be preloaded (injected as background knowledge at agent startup) or directly invoked (called via the Skill tool to produce independent output).

### Preloaded vs. directly invoked skills

This distinction is important and often misunderstood:

**Preloaded skills** are specified in an agent's frontmatter. Their full content is injected into the agent's context when it starts. The agent doesn't "call" them; it simply knows the information.

```yaml
# .claude/agents/api-builder.md
---
name: api-builder
skills: ["rest-conventions", "error-handling-patterns"]
---
Build API endpoints following our conventions.
```

**Directly invoked skills** are called explicitly during execution using the Skill tool. They run independently and produce their own output.

```markdown
# In a command or agent prompt:
Use the Skill tool to invoke the "generate-tests" skill for each new endpoint.
```

**When to use which:**
- **Preload** domain knowledge, coding conventions, and reference material the agent needs throughout its work
- **Directly invoke** skills that produce independent artifacts (test files, documentation, reports)

### Example: feature scaffolding workflow

Here is a concrete example showing all three layers working together:

**Command** (`.claude/commands/scaffold-feature.md`):

```markdown
---
description: Scaffold a new feature with API, tests, and docs
allowed-tools: ["Task", "Skill"]
---

Ask the user for the feature name and a one-sentence description.

1. Spawn the "api-builder" agent to create the API endpoint and service layer.
2. Once the API is built, spawn the "test-writer" agent to generate tests for the new code.
3. Use the Skill tool to invoke "doc-this" on each new file.
4. Summarize what was created.
```

**Agent** (`.claude/agents/api-builder.md`):

```markdown
---
name: api-builder
description: Builds API endpoints following project conventions
model: sonnet
tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"]
skills: ["rest-conventions"]
---

Build the requested API endpoint following our REST conventions.
Create the route handler, service function, and Zod validation schema.
```

**Skill** (`.claude/commands/rest-conventions.md`):

```markdown
# REST conventions

- Routes go in src/routes/
- Service logic goes in src/services/
- All request bodies validated with Zod
- Use camelCase for JSON fields
- Return 201 for creation, 204 for deletion
- Wrap all handlers in try/catch with consistent error shape
```

## The Research-Plan-Implement (RPI) workflow

RPI is a structured development methodology that breaks feature work into distinct phases, each with its own deliverables and go/no-go checkpoints.

### The four phases

#### Phase 1: Describe

Articulate what you want to build. Write a clear requirement description and let Claude generate an initial plan.

```text
I want to add real-time notifications to our dashboard. Users should see
a notification bell with unread count, and clicking it shows recent
notifications. Notifications come from our existing webhook system.
```

#### Phase 2: Research

Before committing to implementation, investigate feasibility. Create a command for this:

```markdown
# .claude/commands/rpi-research.md
---
description: Research feasibility for a planned feature
allowed-tools: ["Read", "Glob", "Grep", "Bash", "WebSearch", "WebFetch"]
---

Research the feasibility of implementing the following feature:

$ARGUMENTS

Produce a RESEARCH.md file containing:
1. **Existing code analysis**: relevant files, patterns, and integration points
2. **Dependencies**: libraries needed, compatibility with current stack
3. **Technical risks**: complexity, performance concerns, security implications
4. **Effort estimate**: small (hours), medium (days), large (weeks)
5. **GO / NO-GO recommendation** with justification

Do not write any implementation code. Focus only on research.
```

Invoke it:

```text
/rpi-research Add real-time notifications to the dashboard
```

#### Phase 3: Plan

If the research phase returns GO, generate detailed implementation artifacts:

```markdown
# .claude/commands/rpi-plan.md
---
description: Create an implementation plan from research findings
allowed-tools: ["Read", "Glob", "Grep", "Write"]
---

Read RESEARCH.md and create an implementation plan.

Produce these documents:
1. **PLAN.md**: step-by-step implementation roadmap with file-level detail
2. **REQUIREMENTS.md**: acceptance criteria for each piece of functionality
3. **ARCHITECTURE.md**: technical design decisions, data flow, component diagram (as text)

Each step in PLAN.md should be small enough to complete within a single Claude Code session.
```

#### Phase 4: Implement

Work through the plan step by step, committing after each completed step:

```markdown
# .claude/commands/rpi-implement.md
---
description: Implement the next step from the plan
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"]
---

Read PLAN.md. Find the first incomplete step (not marked with [x]).

Implement that step:
1. Write the code changes
2. Run relevant tests
3. Mark the step as complete in PLAN.md: change `[ ]` to `[x]`
4. Commit with a descriptive message

If a step cannot be completed, explain why and suggest how to unblock it.
Do not skip ahead to other steps.
```

### Why RPI works

- **Prevents wasted effort**: the research phase catches blockers before you write code
- **Keeps sessions focused**: each implementation step fits within a single context window
- **Creates documentation naturally**: RESEARCH.md, PLAN.md, and REQUIREMENTS.md are useful artifacts even after the feature ships
- **Supports human checkpoints**: you review the research verdict and plan before any code is written

## Workflow design tips

### Keep commands thin

Commands should orchestrate, not implement. A command that tries to do everything itself will hit context limits and produce worse results than one that delegates to focused agents.

**Too thick:**
```markdown
Read the codebase, design the API, write the code, write tests, write docs,
and deploy to staging.
```

**Better:**
```markdown
1. Spawn "architect" agent to design the API
2. Spawn "implementer" agent with the design
3. Spawn "test-writer" agent for the new code
4. Summarize results
```

### Size tasks for the context window

A single agent or command should complete its work within roughly 50% of the available context. If a task is too large, break it into sequential steps or parallel agents.

### Use human checkpoints for risky operations

For workflows that modify infrastructure, deploy code, or make irreversible changes, build in explicit approval gates:

```markdown
Present the deployment plan to the user and wait for explicit approval
before proceeding. Do not auto-approve.
```

### Commit between phases

Each phase or significant step should end with a git commit. This creates natural rollback points and makes it easier to review incremental progress.

### Match model to task

Not every step needs the most capable (and expensive) model:

| Task type | Recommended model |
|-----------|-------------------|
| Architecture decisions, complex reasoning | Opus |
| Code generation, standard implementation | Sonnet |
| Mechanical tasks (formatting, search, simple edits) | Haiku |

Set the model per agent in its frontmatter:

```yaml
---
model: haiku
---
```

Or per command:

```yaml
---
model: sonnet
---
```

### When to skip orchestration

Vanilla Claude Code, with no commands or agents, is often the right choice for:

- Quick bug fixes
- Single-file changes
- Exploratory questions about the codebase
- Tasks that take fewer than 5 turns

Adding orchestration to a simple task adds overhead without improving results. Use structured workflows when the task genuinely involves multiple phases, roles, or deliverables.
