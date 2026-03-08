---
sidebar_position: 2
sidebar_label: Workflow
description: Build larger multi-file features with Claude Code by breaking work into steps, managing context windows, and recovering from mistakes effectively.
keywords: Claude Code intermediate workflow, multi-step features, context management, multi-file development, Claude Code recovery, AI development
---

# Multi-Step Feature Development

This guide covers how to build larger features that span multiple files and require several rounds of implementation. You'll learn to break work into steps, manage context, and recover from mistakes.

If you're new to Claude Code, start with the [Starter Workflow](../starter/workflow) first.

## Breaking features into steps

When a feature is too large for a single prompt, ask Claude Code to decompose it into numbered steps:

```text
/plan I need to add a user notifications system. Break this into numbered steps,
and list which files each step will create or modify.
```

Claude Code will respond with a structured breakdown:

> 1. **Database schema** - Add notifications table migration (`src/db/migrations/...`)
> 2. **Service layer** - Create NotificationService (`src/services/notification.ts`)
> 3. **API endpoints** - Add GET/POST/PATCH routes (`src/routes/notifications.ts`)
> 4. **Frontend component** - Build NotificationBell (`src/components/NotificationBell.tsx`)
> 5. **Tests** - Unit tests for service, integration tests for API

This gives you a roadmap. Implement one step at a time, reviewing between each.

For complex features, consider writing a PRD before you start coding. A structured specification gives Claude Code the full context upfront and produces better results on the first pass. See the [PRD-Driven Development guide](../prd) for templates and workflow.

## Using CLAUDE.md to skip repetition

Without a CLAUDE.md, you repeat context every session:

**Without CLAUDE.md:**

```text
This is a TypeScript Express project using Prisma ORM with PostgreSQL.
Tests use Vitest. Run them with pnpm test. The API follows RESTful
conventions and returns { data, error } shapes. Please add a
notifications endpoint.
```

**With CLAUDE.md:**

```text
Add a notifications endpoint following our API conventions.
```

Claude Code already knows the stack, test runner, and conventions from your CLAUDE.md. Update it whenever you establish a new pattern. See [Memory](/claude-code/memory) for the full memory system.

## Working step by step

After getting your plan, implement one step at a time:

```text
Let's start with step 1: the database migration.
```

After Claude Code completes each step:

1. **Review the changes** in your editor or ask Claude to show the diff
2. **Run tests** if applicable to that step
3. **Ask questions** if something looks off
4. **Move to the next step** only when you're satisfied

```text
Step 1 looks good. Move on to step 2: the NotificationService.
```

This gives you natural checkpoints. If step 3 goes wrong, you only need to undo step 3, not the entire feature.

## Context management

Claude Code has a finite context window. Long sessions that generate a lot of code and output will eventually hit limits. Here's how to manage it.

**Use `/compact` to summarize the conversation:**

```text
/compact
```

This replaces the full conversation history with a summary, freeing up context for more work. Use it after completing a major step or when Claude Code starts repeating itself or losing track.

**Check usage with `/cost`:**

```text
/cost
```

This shows token usage for the current session. If you're past 50% of the context window, consider compacting or starting a new session for the next step.

**The 50% rule:** If you've used more than half your context on steps 1 through 3, compact before starting step 4. This keeps Claude Code's responses sharp for the remaining work.

For more detail on context management, see [Managing Context](/claude-code/context).

## Committing between steps

Commit after each completed step. This creates rollback points if a later step breaks something.

**The pattern:**

1. Complete a step
2. Review the changes
3. Commit with a descriptive message
4. Start the next step

```text
Commit the migration changes with "Add notifications table migration"
```

If step 4 introduces a bug, you can revert to the step 3 commit without losing earlier work.

## Session continuity

Not every feature fits in a single sitting. Here's how to manage sessions.

**Starting fresh for a new task:**

```text
/clear
```

This resets the conversation. Use it when switching to an unrelated task within the same session.

**Resuming a previous session:**

```bash
claude -c
```

This continues your most recent conversation. Claude Code picks up where you left off, with the full conversation history intact.

**When to start a new session vs. resume:**
- **Resume** when you're continuing the same feature and need the previous context
- **New session** when you're starting a different task, or when the previous session's context is mostly irrelevant

## Recovering from mistakes

Things will go wrong. Here's your toolkit for undoing them.

**Cancel the current operation:**

Press `Esc` once to stop Claude Code mid-response. Use this when you see it heading in the wrong direction.

**Undo the last change:**

Press `Esc` twice quickly to undo Claude Code's most recent edit. This reverts the file changes without losing the conversation.

**Rewind to a checkpoint:**

```text
/rewind
```

This shows you a list of conversation checkpoints. Pick one to roll back to that point in the conversation, undoing all changes made after it.

**Git reset as a last resort:**

If Claude Code has made multiple changes and you want to start over:

```text
Show me which files you've changed this session.
```

Then use your normal git workflow (`git checkout -- file`, `git stash`, etc.) to revert specific files.

## Full example: adding an API endpoint

Here's a realistic five-step walkthrough for adding a notification system.

**Step 1: Plan the feature**

```text
/plan Add a notifications API with these requirements:
- GET /api/notifications - list notifications for the authenticated user
- PATCH /api/notifications/:id/read - mark a notification as read
- POST /api/notifications - create a notification (internal use only)
- Include pagination for the GET endpoint
- Add Vitest tests for the service layer
Break this into steps.
```

**Step 2: Implement the database layer**

```text
Start with step 1: create the Prisma migration for the notifications table.
Include fields: id, userId, title, body, read (boolean), createdAt.
```

Review, test, commit:

```text
Run npx prisma migrate dev to apply the migration.
Commit with "Add notifications table schema"
```

**Step 3: Build the service layer**

```text
Step 2: create NotificationService in src/services/notification.ts.
Follow the patterns in UserService for consistency.
```

Review, commit:

```text
Commit with "Add NotificationService with CRUD operations"
```

**Step 4: Add API routes**

```text
Step 3: add the API routes in src/routes/notifications.ts.
Include pagination on the GET endpoint using our existing pagination helper.
```

At this point, context usage is getting high:

```text
/cost
```

If over 50%, compact before continuing:

```text
/compact
```

Then commit:

```text
Commit with "Add notification API endpoints with pagination"
```

**Step 5: Write tests**

```text
Step 4: write Vitest tests for NotificationService.
Cover: creating notifications, listing with pagination, marking as read.
Follow the test patterns in src/services/__tests__/user.test.ts.
```

Run tests, fix any failures, commit:

```text
Run pnpm test to verify everything passes.
Commit with "Add notification service tests"
```

## Next steps

Ready for automation? The [Pro Workflow](../pro/workflow) covers the Research-Plan-Implement methodology, custom slash commands for repeatable workflows, subagent orchestration, and agent teams for parallel work.
