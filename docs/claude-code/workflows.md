---
sidebar_position: 12
sidebar_label: Workflows & Orchestration
description: Compose Claude Code skills, subagents, and hooks into structured orchestration patterns for complex, multi-step automated development tasks.
keywords: [Claude Code workflows, orchestration, automation patterns, skills, subagents, hooks, multi-step tasks, workflow composition]
---

# Workflows & Orchestration

Claude Code's skills, subagents, and hooks can be composed into structured workflows that go far beyond single-prompt interactions. This page covers orchestration patterns for organizing complex, multi-step tasks.

## Core building blocks

Before diving into patterns, it helps to understand the three building blocks Claude Code provides for automation:

| Building block | Purpose | Location |
|----------------|---------|----------|
| **Skill** | Reusable instructions, knowledge, or task definitions invoked via `/skill-name` or automatically by Claude | `.claude/skills/<name>/SKILL.md` |
| **Subagent** | Focused agent with its own context, tools, and optional preloaded skills | `.claude/agents/<name>.md` |
| **Hook** | Deterministic shell command that runs in response to lifecycle events (not AI-driven) | `.claude/settings.json` |

### Skills

Skills are the primary extension mechanism in Claude Code. Each skill is a directory containing a `SKILL.md` file with YAML frontmatter:

```markdown
# .claude/skills/rest-conventions/SKILL.md
---
name: rest-conventions
description: REST API conventions for this project
user-invocable: false
---

- Routes go in src/routes/
- Service logic goes in src/services/
- All request bodies validated with Zod
- Use camelCase for JSON fields
- Return 201 for creation, 204 for deletion
- Wrap all handlers in try/catch with consistent error shape
```

Key frontmatter fields for skills:

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Identifier (lowercase, hyphens, max 64 chars) |
| `description` | string | Tells Claude when to use this skill |
| `user-invocable` | boolean | Whether it shows in the `/` menu |
| `disable-model-invocation` | boolean | Prevent Claude from invoking automatically |
| `allowed-tools` | string | Comma-separated tool names Claude can use |
| `model` | string | `sonnet`, `opus`, `haiku`, or `inherit` |
| `context` | string | Set to `fork` to run in an isolated subagent |
| `agent` | string | Agent type when using `context: fork` (`Explore`, `Plan`, `general-purpose`) |

Skills support `$ARGUMENTS` for user input:

```markdown
# .claude/skills/fix-issue/SKILL.md
---
name: fix-issue
description: Fix a GitHub issue by number
user-invocable: true
allowed-tools: Read, Edit, Grep, Glob, Bash
---

Fix GitHub issue $ARGUMENTS following our coding standards.
```

Invoked as: `/fix-issue 123`

### Subagents

Subagents are specialized agents with their own isolated context window, system prompt, and tool access. Define them in `.claude/agents/`:

```markdown
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Reviews code changes for quality, security, and conventions
tools: Read, Grep, Glob
model: sonnet
skills:
  - rest-conventions
  - error-handling-patterns
---

You are a senior code reviewer. Analyze the provided code changes and report:
1. Bugs or logic errors
2. Security concerns
3. Convention violations
4. Suggestions for improvement
```

Key frontmatter fields for subagents:

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Unique identifier |
| `description` | string | When Claude should delegate to this agent (required) |
| `tools` | string | Comma-separated allowed tools |
| `model` | string | `sonnet`, `opus`, `haiku`, or `inherit` |
| `skills` | array | Skills to preload into context: `["skill-1", "skill-2"]` |
| `maxTurns` | number | Max agentic turns before stopping |
| `isolation` | string | Set to `worktree` for git worktree isolation |
| `background` | boolean | Always run as a background task |

**Important limitations:**
- Subagents cannot spawn other subagents (no nesting)
- Maximum 10 concurrent subagents
- Use the main conversation to chain subagents sequentially

### Hooks

Hooks are deterministic shell commands triggered by lifecycle events. Unlike skills (which are AI-driven), hooks always execute the same way:

```json
// In .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "echo 'File about to be written'"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "command": "./scripts/check-lint.sh"
      }
    ]
  }
}
```

Use hooks for tasks that must happen consistently: linting after edits, format checking, security scans, or notifications.

## Preloaded vs. directly invoked skills

This distinction matters for orchestration:

**Preloaded skills** are listed in a subagent's `skills` frontmatter. Their full content is injected into the agent's context at startup. The agent does not "call" them; it simply has the knowledge.

```yaml
# .claude/agents/api-builder.md
---
name: api-builder
skills:
  - rest-conventions
  - error-handling-patterns
---
Build API endpoints following our conventions.
```

**Directly invoked skills** are called explicitly via the Skill tool during execution. They run independently and produce their own output.

```markdown
# In any prompt:
Use the Skill tool to invoke "generate-tests" for each new endpoint.
```

**Skills with `context: fork`** run as isolated subagents. This is a powerful middle ground: the skill's content becomes the agent's task, running in its own context window.

```markdown
# .claude/skills/deep-research/SKILL.md
---
name: deep-research
description: Thorough codebase research with isolated context
context: fork
agent: Explore
model: sonnet
---

Research $ARGUMENTS thoroughly:
1. Find all relevant files and patterns
2. Analyze dependencies and integration points
3. Produce a summary of findings
```

**When to use which:**
- **Preload** domain knowledge, coding conventions, and reference material the agent needs throughout its work
- **Directly invoke** skills that produce independent artifacts (test files, documentation, reports)
- **Use `context: fork`** for tasks that need deep, isolated exploration without polluting the main context

## The Skill-Agent orchestration pattern

The most effective way to structure complex workflows combines skills and subagents. A user-invocable skill orchestrates the overall flow, while subagents handle focused subtasks.

### Example: feature scaffolding workflow

**Orchestrating skill** (`.claude/skills/scaffold-feature/SKILL.md`):

```markdown
---
name: scaffold-feature
description: Scaffold a new feature with API, tests, and docs
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill, Agent
---

Ask the user for the feature name and a one-sentence description.

1. Use the "api-builder" agent to create the API endpoint and service layer.
2. Once the API is built, use the "test-writer" agent to generate tests for the new code.
3. Use the Skill tool to invoke "generate-docs" on each new file.
4. Summarize what was created.
```

**Subagent** (`.claude/agents/api-builder.md`):

```markdown
---
name: api-builder
description: Builds API endpoints following project conventions
model: sonnet
tools: Read, Write, Edit, Glob, Grep, Bash
skills:
  - rest-conventions
---

Build the requested API endpoint following our REST conventions.
Create the route handler, service function, and Zod validation schema.
```

**Knowledge skill** (`.claude/skills/rest-conventions/SKILL.md`):

```markdown
---
name: rest-conventions
description: REST API conventions for this project
user-invocable: false
disable-model-invocation: true
---

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

Before committing to implementation, investigate feasibility. Create a skill for this:

```markdown
# .claude/skills/rpi-research/SKILL.md
---
name: rpi-research
description: Research feasibility for a planned feature
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, WebSearch, WebFetch
context: fork
agent: Explore
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
# .claude/skills/rpi-plan/SKILL.md
---
name: rpi-plan
description: Create an implementation plan from research findings
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
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
# .claude/skills/rpi-implement/SKILL.md
---
name: rpi-implement
description: Implement the next step from the plan
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
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

### Keep skills and agents focused

A skill that tries to do everything will hit context limits and produce worse results than one that delegates to focused subagents.

**Too broad:**
```markdown
Read the codebase, design the API, write the code, write tests, write docs,
and deploy to staging.
```

**Better:**
```markdown
1. Use the "architect" agent to design the API
2. Use the "implementer" agent to build it
3. Use the "test-writer" agent for coverage
4. Summarize results
```

### Size tasks for the context window

A single agent should complete its work within roughly 50% of the available context. If a task is too large, break it into sequential steps or parallel agents.

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

Set the model in frontmatter:

```yaml
---
model: haiku
---
```

### Use `context: fork` for exploration

When a skill needs to do deep research or exploration, run it in a forked context so it does not consume the main conversation's context window:

```yaml
---
context: fork
agent: Explore
---
```

### Combine hooks with skills for guardrails

Use hooks for deterministic checks (linting, formatting) and skills for AI-driven tasks. For example, a `PostToolUse` hook can run a linter after every file write, while a skill handles the creative work of generating code.

### When to skip orchestration

Vanilla Claude Code, with no skills or agents, is often the right choice for:

- Quick bug fixes
- Single-file changes
- Exploratory questions about the codebase
- Tasks that take fewer than 5 turns

Adding orchestration to a simple task adds overhead without improving results. Use structured workflows when the task genuinely involves multiple phases, roles, or deliverables.
