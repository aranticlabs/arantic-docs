---
sidebar_position: 2
sidebar_label: Workflow
description: Build repeatable automated workflows for complex features using the Research-Plan-Implement methodology with custom skills, subagents, and agent teams.
keywords: [Claude Code pro workflow, RPI methodology, automated workflow, agent teams, skills, subagents, complex features, orchestration]
---

# Automated Feature Workflows

This guide covers how to build repeatable, automated workflows for complex features using custom skills, subagents, and agent teams. These patterns help you handle large features consistently and with less manual oversight.

If you're not yet comfortable with multi-step development, start with the [Intermediate Workflow](../intermediate/workflow) first.

## The Research-Plan-Implement (RPI) methodology

RPI is a structured approach to complex features. It splits the work into four phases, each with a clear deliverable and a go/no-go checkpoint before moving on.

| Phase | Goal | Deliverable | Checkpoint |
|-------|------|-------------|------------|
| **Describe** | Define requirements | Feature spec with acceptance criteria | "Is this what we're building?" |
| **Research** | Understand the codebase | Report on relevant files, patterns, constraints | "Do we understand the landscape?" |
| **Plan** | Design the implementation | Step-by-step plan with file list per step | "Is this the right approach?" |
| **Implement** | Write the code | Working feature with tests | "Does it pass all checks?" |

**Why phases matter:** Each checkpoint prevents wasted work. A misunderstanding caught in the Research phase costs minutes to fix. The same misunderstanding caught during Implementation costs hours.

The "Describe" phase is where a PRD shines. Instead of writing requirements inline, you can point Claude Code at a structured PRD document that covers vision, business logic, schema, and API specs. See the [PRD-Driven Development guide](../prd) for a 7-document template system that pairs well with RPI.

**Using RPI in practice:**

```text
Phase 1 - Describe: I need real-time notifications using WebSockets.
Users should see a notification bell with unread count. Clicking it shows
a dropdown with the 10 most recent notifications. Clicking a notification
marks it as read and navigates to the relevant page.

Research the codebase and tell me what exists that's relevant before we plan.
```

Review the research output, then:

```text
Good findings. Now create a detailed implementation plan. Break it into
steps with file lists. Flag any architectural decisions I need to make.
```

Review the plan, then:

```text
Go with option A for the WebSocket connection manager. Implement step 1.
```

For the full deep dive on RPI, see [Workflows & Orchestration](/claude-code/workflows).

## Automating RPI with custom skills

Instead of typing RPI prompts manually each time, turn each phase into a reusable slash command.

Create these files in your project:

**`.claude/skills/rpi-research/SKILL.md`**

```markdown
Research the codebase for implementing: $ARGUMENTS

Investigate:
1. Existing files and patterns relevant to this feature
2. Dependencies and packages already available
3. Test patterns used in similar features
4. Any constraints or conventions in CLAUDE.md

Output a structured research report with file paths and key findings.
Do not make any code changes.
```

**`.claude/skills/rpi-plan/SKILL.md`**

```markdown
Based on the research in this conversation, create an implementation plan for: $ARGUMENTS

For each step:
1. What will be built
2. Which files will be created or modified
3. Key decisions or trade-offs
4. How to verify the step is complete

Number the steps and estimate complexity (small/medium/large) for each.
Do not implement anything yet.
```

**`.claude/skills/rpi-implement/SKILL.md`**

```markdown
Implement step $ARGUMENTS from the plan in this conversation.

Follow these rules:
1. Only implement the specified step
2. Run tests after making changes
3. Show a summary of what was changed
4. Commit with a descriptive message

Stop after this step is complete. Do not proceed to the next step.
```

**Using the commands:**

```text
/rpi-research user notification system with WebSocket support
```

Review the research, then:

```text
/rpi-plan user notification system with WebSocket support
```

Review the plan, then implement step by step:

```text
/rpi-implement 1
```

For more on creating skills, see [Skills](/claude-code/skills).

## Subagent orchestration

Subagents let you delegate focused tasks to separate Claude instances that run within your session. The main session acts as an orchestrator, coordinating specialized subagents.

**The Skill-Agent pattern:**

Create skills that invoke focused subagents for specific roles:

**`.claude/skills/build-api/SKILL.md`**

```markdown
You are an API builder. Implement the following API endpoint: $ARGUMENTS

Follow project conventions from CLAUDE.md. Include:
- Route handler with input validation
- Service layer logic
- Error handling
- OpenAPI documentation comments
```

**`.claude/skills/write-tests/SKILL.md`**

```markdown
You are a test writer. Write comprehensive tests for: $ARGUMENTS

Follow existing test patterns. Include:
- Unit tests for business logic
- Integration tests for API endpoints
- Edge cases and error scenarios
```

Then orchestrate from your main session:

```text
/build-api POST /api/notifications - create notification with title, body, userId
```

After the API is built:

```text
/write-tests the notification API endpoints in src/routes/notifications.ts
```

**Key limitation:** Subagents cannot spawn their own subagents. Keep your orchestration flat: one main session delegating to focused subagents.

For the full subagent reference, see [Subagents](/claude-code/subagents).

## Agent teams for parallel work

When a feature has independent subtasks, you can run multiple Claude Code instances in parallel. Each works on a separate piece and you merge the results.

**When to use agent teams:**
- Subtasks are genuinely independent (no shared files)
- Each subtask is substantial enough to justify a separate session
- You want to speed up a large feature by parallelizing

**The tmux pattern:**

```bash
# Terminal 1: API layer
claude "Implement the notification API endpoints in src/routes/notifications.ts
with the service layer in src/services/notification.ts"

# Terminal 2: Frontend component
claude "Build the NotificationBell component in src/components/NotificationBell.tsx
with a dropdown showing recent notifications"

# Terminal 3: Database migration
claude "Create the Prisma migration for the notifications table
with fields: id, userId, title, body, read, createdAt"
```

**Git worktree isolation:**

For safer parallel work, use git worktrees so each agent works on a separate copy of the code:

```bash
# Create isolated worktrees
git worktree add ../project-api feature/notifications-api
git worktree add ../project-frontend feature/notifications-frontend

# Run Claude Code in each
cd ../project-api && claude "Implement notification API endpoints"
cd ../project-frontend && claude "Build NotificationBell component"

# Merge when done
git checkout main
git merge feature/notifications-api
git merge feature/notifications-frontend
```

This avoids conflicts when agents edit the same files. Merge conflicts, if any, are handled at the end.

For more on agent teams and coordination, see [Agent Teams](/claude-code/agent-teams).

## Hooks as guardrails

Hooks run deterministic commands at specific lifecycle events. They're ideal for checks that must always happen, regardless of the prompt.

**Common guardrail hooks in `.claude/settings.json`:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "npx prettier --write $CLAUDE_FILE_PATH"
      },
      {
        "matcher": "Edit|Write",
        "command": "npx eslint --fix $CLAUDE_FILE_PATH"
      }
    ],
    "TaskCompleted": [
      {
        "command": "npm test"
      }
    ]
  }
}
```

**Why hooks instead of instructions:** Instructions in CLAUDE.md ask Claude to format code or run tests. It usually does, but not always. Hooks guarantee it. Use hooks for anything that must happen every time: formatting, linting, security scans, test runs.

For the full hooks reference, see [Hooks](/claude-code/hooks).

## Choosing the right model

Different models excel at different tasks. Match the model to the job for the best cost-to-quality ratio.

| Task | Recommended model | Why |
|------|-------------------|-----|
| Architecture decisions | Opus | Best reasoning for complex trade-offs |
| Feature implementation | Sonnet | Fast, high-quality code generation |
| Mechanical refactoring | Haiku | Quick, cheap for repetitive changes |
| Test generation | Sonnet | Good balance of speed and coverage |
| Code review | Opus | Catches subtle issues |
| Documentation | Sonnet | Clean, well-structured output |

**Switch models during a session:**

```text
/model sonnet
```

**Set a default model for a skill** by adding to the command file:

```markdown
Use the sonnet model for this task.
```

## When to skip orchestration

Not every task needs RPI, subagents, or hooks. Use the simplest approach that works.

| Situation | Approach |
|-----------|----------|
| Quick fix (under 5 turns) | Direct prompt |
| Single-file change | Direct prompt |
| Small feature (1 to 3 files) | Plan mode |
| Medium feature (4 to 10 files) | RPI methodology |
| Large feature (10+ files) | RPI + subagents |
| Independent subtasks | Agent teams |

Over-engineering your workflow creates friction. Start simple and add structure only when the task demands it.

## Full example: real-time notifications with RPI

Here's an end-to-end walkthrough using RPI and subagents for a realistic feature.

**Phase 1: Describe**

```text
I need real-time notifications with WebSocket support.
Requirements:
- WebSocket server that pushes notifications to connected clients
- REST API for creating and listing notifications
- React component with bell icon and unread count
- Dropdown showing 10 most recent notifications
- Click to mark as read and navigate to relevant page
- Persist notifications in PostgreSQL via Prisma
```

**Phase 2: Research**

```text
/rpi-research real-time notification system with WebSockets
```

Claude Code reports back: existing WebSocket setup in `src/ws/`, Prisma patterns in `src/db/`, component patterns in `src/components/`, test setup in `vitest.config.ts`.

**Phase 3: Plan**

```text
/rpi-plan real-time notification system based on research findings
```

Claude Code produces a 6-step plan:
1. Database migration (small)
2. NotificationService (medium)
3. REST API endpoints (medium)
4. WebSocket integration (medium)
5. React NotificationBell component (medium)
6. Tests for all layers (large)

Review and approve the plan.

**Phase 4: Implement**

Steps 1 through 3 sequentially (they depend on each other):

```text
/rpi-implement 1
```

Review, commit. Then step 2, commit. Then step 3, commit.

Steps 4 and 5 in parallel (independent):

```bash
# Terminal 1
claude "Implement step 4 from the notification plan: WebSocket integration
in src/ws/notifications.ts using the existing WebSocket server setup"

# Terminal 2
claude "Implement step 5 from the notification plan: NotificationBell
component in src/components/NotificationBell.tsx"
```

Step 6 after merging:

```text
/rpi-implement 6
```

Run the full test suite, fix any failures, commit.

## Next steps

- Review the full [Workflows & Orchestration](/claude-code/workflows) reference for advanced patterns
- Set up [Hooks](/claude-code/hooks) for your project's specific guardrails
- Create a library of [Skills](/claude-code/skills) for your team's common tasks
- Explore [MCP Servers](/claude-code/mcp) for connecting Claude Code to external tools
