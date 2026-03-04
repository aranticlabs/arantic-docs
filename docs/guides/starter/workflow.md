---
sidebar_position: 2
sidebar_label: Workflow
---

# Your First Feature with Claude Code

This guide walks you through building a feature from scratch using Claude Code. You'll learn the basic loop that works for any task, from a one-line fix to a multi-file feature.

If you haven't set up Claude Code yet, complete the [Starter setup](./setup) first.

## The basic loop

Every feature follows the same five steps:

1. **Describe** what you want
2. **Plan** the approach
3. **Review** the plan
4. **Implement** the changes
5. **Test** and verify

For small tasks (renaming a variable, fixing a typo), you can skip straight to step 4. For anything that touches multiple files or changes behavior, start at step 1.

## Step 1: Describe clearly

The quality of your prompt directly affects the quality of the output. Give Claude Code enough context to understand what you want, where it should go, and how it should behave.

**Weak prompt:**

```text
Add favorites
```

**Strong prompt:**

```text
Add a "Mark as Favorite" button to each item card in src/components/ItemCard.tsx.
When clicked, it should toggle a heart icon and save the favorite status to localStorage.
The heart should be filled when favorited and outlined when not.
```

A strong prompt includes:
- **What** to build (a toggle button with a heart icon)
- **Where** it goes (which file and component)
- **How** it behaves (toggle, persist to localStorage, visual states)

For more prompting techniques, see [Prompting Basics](/prompting/basics).

## Step 2: Enter plan mode

Plan mode tells Claude Code to think through the approach before making any changes. This is your chance to catch misunderstandings before code gets written.

**Activate plan mode** in any of these ways:

| Method | How |
|--------|-----|
| Slash command | Type `/plan` before your prompt |
| Keyboard shortcut | Press `Shift+Tab` to toggle plan mode on |
| Inline | Start your message with "plan:" |

Example:

```text
/plan Add a "Mark as Favorite" button to each item card in src/components/ItemCard.tsx.
When clicked, it should toggle a heart icon and save the favorite status to localStorage.
```

Claude Code will respond with a structured plan listing the files it will modify, the approach it will take, and any decisions it needs your input on.

## Step 3: Review and refine

Read the plan carefully. While still in plan mode, you can ask follow-up questions or request changes:

```text
Use a star icon instead of a heart. Also add a FavoritesList component
that shows all favorited items.
```

Claude Code will revise its plan. Keep refining until you're satisfied with the approach. This is much faster than fixing code after the fact.

**Things to check in the plan:**
- Does it modify the right files?
- Does the approach match your project's patterns?
- Are there any missing edge cases?

## Step 4: Implement

Once you're happy with the plan, tell Claude Code to proceed:

```text
Looks good, go ahead and implement it.
```

Claude Code will start editing files and running commands. Watch the output as it works. If something looks wrong, press `Esc` to stop the current operation.

**During implementation:**
- Claude Code shows you each file it edits and each command it runs
- You can approve or deny individual tool calls depending on your [permission settings](/claude-code/permissions)
- If it goes off track, press `Esc` and redirect with a follow-up prompt

## Step 5: Test and verify

After implementation, ask Claude Code to verify its own work:

```text
Run the tests to make sure nothing is broken.
```

If your `CLAUDE.md` includes the test command (e.g., `Run tests with: npm test`), Claude Code already knows how to run them.

**Review the changes** before committing:

```text
Show me a summary of all the files you changed.
```

When you're satisfied:

```text
Commit these changes with a descriptive message.
```

## When to use plan mode

| Situation | Approach |
|-----------|----------|
| Quick fix (typo, rename, one-line change) | Direct prompt, no plan needed |
| Single-file feature | Direct prompt usually works, plan if unsure |
| Multi-file feature | Always use plan mode |
| Refactoring across files | Always use plan mode |
| Unfamiliar codebase | Always use plan mode |

## Full example: adding a "Mark as Favorite" button

Here's the complete flow for a concrete feature.

**Start the session:**

```bash
cd my-project
claude
```

**Enter plan mode and describe the feature:**

```text
/plan Add a "Mark as Favorite" button to the ItemCard component.
- File: src/components/ItemCard.tsx
- Toggle a star icon (filled when favorited, outlined when not)
- Store favorites in localStorage under the key "favorites" as an array of item IDs
- Add a FavoritesList component at src/components/FavoritesList.tsx that renders all favorited items
```

**Review the plan.** Claude Code responds with something like:

> I'll make changes in 3 files:
> 1. `src/components/ItemCard.tsx` - Add star toggle button with onClick handler
> 2. `src/components/FavoritesList.tsx` - New component to display favorited items
> 3. `src/hooks/useFavorites.ts` - Custom hook for localStorage read/write
>
> The `useFavorites` hook will handle persistence so both components share the same logic...

**Refine if needed:**

```text
Skip the custom hook. Just use localStorage directly in each component. Keep it simple.
```

**Approve and implement:**

```text
Good, implement it.
```

**Verify:**

```text
Run the tests and show me the diff for ItemCard.tsx.
```

**Commit:**

```text
Commit with the message "Add mark-as-favorite feature with localStorage persistence"
```

## Next steps

Once you're comfortable with the basic loop, move on to the [Intermediate Workflow](../intermediate/workflow) to learn how to break larger features into steps, manage context across longer sessions, and recover from mistakes.
