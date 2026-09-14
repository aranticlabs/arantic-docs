---
sidebar_position: 6
sidebar_label: Agent Modes
description: How Cursor's Agent, Plan, Ask, Debug, and Design modes differ, how to switch between them, and how to pick models, Auto with Cursor Router, and Max Mode.
keywords: [Cursor agent modes, Plan Mode, Ask Mode, Debug Mode, Design Mode, Custom Modes, Cursor Router, Auto model, Max Mode, Cursor model selection]
---

# Agent Modes

Cursor's agent has one chat surface but several modes that change what it is allowed to do and how it approaches a task. **Agent** builds, **Plan** designs before building, **Ask** answers without editing, **Debug** collects runtime evidence before fixing, and **Design** lets you point at a running UI instead of describing it. Picking the right mode up front saves more time than any prompt trick, because each mode changes the agent's tools and process, not just its instructions.

## Mode overview

| Mode | Edits files? | What it is for | How to enter |
|------|--------------|----------------|--------------|
| **Agent** | Yes | Default. Complete tasks end to end: search, edit, run commands, use the browser | Cmd+I opens the panel; Agent is the default |
| **Plan** | Not until you click Build | Research the codebase, ask clarifying questions, produce an editable plan | Shift+Tab to rotate, mode picker, or `/plan` and `--plan` in the CLI |
| **Ask** | No | Read-only exploration and explanation | Shift+Tab, mode picker, or `/ask` and `--mode=ask` in the CLI |
| **Debug** | Yes, instrumentation first, then a targeted fix | Root-cause bugs using hypotheses, log statements, and captured runtime data | Shift+Tab or mode picker in the desktop app |
| **Design** | Yes | Direct the agent visually from the built-in browser: click elements, draw, speak | Cmd+Shift+D inside the Agents Window browser |
| **Custom Mode** | Depends on the skill | Keep a skill (checklist, playbook) active on every turn | Pick a skill from `/` and press Option+Enter (Mac) or Alt+Enter (Windows) |

## Agent mode

Agent is the default. It combines three things: the system prompt and your [rules](./rules.md), a tool set (file search, read, edit, shell, web search, browser, image generation, clarifying questions), and the model you pick. Cursor tunes instructions and tools per model, and there is no limit on the number of tool calls in a task.

Things that make Agent mode productive:

- **Checkpoints.** Agent snapshots modified files before significant changes. Click a checkpoint in the chat timeline to preview, then restore to revert files (messages stay). Checkpoints are local and separate from git; use git for anything permanent.
- **Queued messages.** While the agent works, press Enter to queue the next instruction (drag to reorder), or Cmd+Enter to send immediately. On cursor.com/agents and in the Agents Window you can also **Send now** to steer the active turn at the agent's next tool call without cutting off in-flight work.
- **`/goal`.** By default the agent treats every message as a new job. `/goal fix all flaky tests and make CI green` gives it a long-lived objective it keeps working toward. In the CLI, Ctrl+C pauses the goal. Pair a goal with a Custom Mode or the built-in `/loop` skill for recurring check-ins. `/goal` is rolling out; if you do not see it, try a new chat.
- **Clarifying questions.** The agent can ask a question and keep reading files or making edits while it waits for your answer.

**Weak:**

```text
Make the auth better.
```

**Strong:**

```text
In src/auth/session.ts, sessions never expire because refreshSession() resets
expiresAt on every read. Change it to only extend on writes, add a unit test in
src/auth/session.test.ts that proves a read after 30 minutes returns 401, and
run npm test. Do not touch the token signing code.
```

## Plan Mode

Plan Mode creates a reviewable implementation plan before any code is written. Cursor also suggests it automatically when your prompt contains keywords that indicate a complex task.

### How it works

1. The agent asks clarifying questions to understand the requirements.
2. It researches your codebase to gather context. MCP tools are available here too.
3. It writes a comprehensive implementation plan.
4. You review and edit the plan, either through chat or by editing the plan file directly.
5. Click **Build** when you are ready. The agent switches to building and implements the plan.

### Plan files

The plan opens as a virtual file you can read and edit. Plans are saved in your **home directory** by default. Click **Save to workspace** to move a plan into the repo for future reference, team sharing, or documentation. A saved plan is a good artifact to attach to a PR or to hand to another agent later.

### Starting over from a plan

When the build does not match what you wanted, resist the urge to patch it with follow-up prompts. Instead:

1. Click **Revert** (bottom right of a previous chat message) and confirm to roll your files back to that point.
2. Refine the plan to be more specific about what you need.
3. Run it again.

Cursor's guidance: for larger changes, spend the extra time on a precise, well-scoped plan. Figuring out *what* to change is the hard part; with clear instructions, implementation can be delegated.

### When to use Plan Mode

Good fit:

- Complex features with several valid approaches
- Tasks that touch many files or systems
- Unclear requirements where you need to explore before understanding scope
- Architectural decisions where you want to review the approach before code exists

Skip it for quick changes and tasks you have done many times.

### Plan Mode in the CLI

```bash
agent --plan "add rate limiting to the public API"
agent --mode=plan
# inside a session:
/plan
```

Shift+Tab rotates Agent, Plan, and Ask in the CLI as well.

### Plan Mode and the cloud

The Plan Mode documentation does not describe a dedicated plan-to-cloud handoff. What is documented: in the CLI, prefix any message with `&` to push the conversation to a Cloud Agent and pick it up later at cursor.com/agents, and the Agents Window lets you move an agent between local and cloud. A practical pattern is to finish the plan locally, save it to the workspace, then hand the build step to a Cloud Agent with the plan file as context. See [Cloud Agents & Automations](./cloud-agents.md).

**Weak:**

```text
Plan the migration.
```

**Strong:**

```text
Plan a migration from our hand-rolled JWT auth to Auth.js. Constraints: keep the
existing /api/login endpoint working for the mobile app for two releases, no
downtime, Postgres stays the session store. List every file you expect to touch,
the order of PRs, and the rollback step for each PR. Ask me before assuming
anything about the mobile client.
```

## Ask Mode

Ask Mode is read-only. The agent searches and reads the codebase and answers questions without making edits. Use it when you want to understand code before changing it:

- "How does the authentication flow work?"
- "Where is the database connection configured?"
- "Explain the relationship between these two modules."

Switch with Shift+Tab or the mode picker; in the CLI use `/ask` or start with `--mode=ask`. For questions that lead to code changes, switch back to Agent. In the CLI, the docs also note that a plain instruction like "do not write any code" in Agent mode works when you want a quick read-only answer without switching.

**Weak:**

```text
What does this do?
```

**Strong:**

```text
Trace a request from the /checkout route handler to the payment provider call.
List each function in order with its file path, and point out where retries and
idempotency keys are (or are not) handled.
```

## Debug Mode

Debug Mode is for bugs that are hard to reproduce or understand. Instead of guessing at a fix from reading code, the agent gathers **runtime evidence** first.

### How it works

1. **Explore and hypothesize.** The agent reads the relevant files and generates multiple hypotheses about the root cause.
2. **Add instrumentation.** It inserts log statements that send data to a local debug server running in a Cursor extension.
3. **Reproduce the bug.** It gives you specific reproduction steps and waits for you to run them. This keeps a human in the loop and captures real behavior.
4. **Analyze logs.** It reviews the collected logs to identify the actual cause.
5. **Make a targeted fix.** Usually a few lines, aimed at the root cause.
6. **Verify and clean up.** You re-run the reproduction steps; once confirmed, the agent removes all instrumentation.

### When to use it

- Bugs you can reproduce but cannot explain from the code
- Race conditions and timing issues
- Performance problems and memory leaks that need runtime profiling
- Regressions where something used to work

### Tips

- Include error messages, stack traces, and exact reproduction steps. Better context produces better instrumentation.
- Follow the agent's reproduction steps exactly so the logs capture the real issue.
- Reproduce more than once for flaky problems such as race conditions.
- State expected versus actual behavior explicitly.

Debug Mode is documented for the desktop app (mode picker or Shift+Tab). The CLI `--mode` flag only lists `plan` and `ask`.

**Weak:**

```text
The cart total is sometimes wrong, fix it.
```

**Strong:**

```text
Expected: cart total equals the sum of line items after the coupon is applied.
Actual: about 1 in 10 page loads shows the pre-coupon total. Repro: add two
items, apply SAVE10, refresh /cart quickly twice. Stack trace from Sentry is
pasted below. I suspect a race between the coupon fetch and the totals
computation in useCartTotals().
```

## Design Mode

Design Mode lets you direct the agent with visual prompts from the browser inside the [Agents Window](./parallel-agents.md). Toggle it with **Cmd+Shift+D** while the browser is open; the same shortcut turns it off.

### Ways to direct the agent

- **Select an element.** Click anything in the running app. The agent receives the element and its code, so you can prompt against exactly what you see.
- **Select multiple elements.** Reference two components and ask the agent to make one match the other, remove duplicated content, or adjust a group together.
- **Draw on the page.** Circle or box a region. The annotation sits over a frozen frame of the viewport, so the agent sees the exact page state you reacted to.
- **Narrate by voice.** The mic stays available while agents run, so you can queue the next change without waiting.

| Action | Shortcut |
|--------|----------|
| Toggle Design Mode | Cmd+Shift+D |
| Select an area | Shift+drag |
| Add element to chat | Cmd+L |
| Add element to input | Option+click |

### What the agent sees

Picking an element adds two signals: **element identity** (xpath, component, attributes, computed styles, and props from the fiber tree) so it can find the right source, and **a screenshot** for spatial context. Because edits are dispatched as you notice them, you can send several small changes in a row and manage multiple subagents at once while the app hot-reloads. Cursor recommends a fast, UI-strong model here and names **Composer 2.5**.

**Weak:**

```text
Make the header look nicer.
```

**Strong (with the header element selected and the sidebar element also selected):**

```text
Match the header's padding and background token to the selected sidebar.
Keep the logo size. Use the existing --surface-2 variable, do not add new CSS
variables.
```

## Custom Modes

A Custom Mode keeps a [skill](./skills.md) in context on every turn until you exit the mode. This is different from invoking a skill with `/skill-name` and Enter, which attaches it to one message and fades as the conversation moves on.

- Type `/`, pick the skill, and press **Option+Enter** (Mac) or **Alt+Enter** (Windows), or choose **Use as Mode** from the skill entry.
- Any skill with a valid frontmatter block can back a mode. Optional `icon` and `color` frontmatter fields style the mode badge.
- Custom Modes are available in the Agents Window and the CLI.

They suit skills that describe *how to work* rather than a one-shot task: a code-review checklist you want applied to every file, or a team `/tdd` playbook for an entire feature. Combine with `/goal` when you want a long-running objective executed under a specific playbook.

## Switching modes

| Where | How |
|-------|-----|
| Desktop chat input | **Shift+Tab** rotates modes; the mode picker dropdown selects one directly |
| Desktop, Plan Mode | Cursor auto-suggests Plan when the prompt looks complex |
| Agents Window browser | **Cmd+Shift+D** toggles Design Mode |
| CLI | **Shift+Tab** rotates Agent, Plan, Ask; `/plan` and `/ask` switch; `--mode plan`, `--mode ask`, or `--plan` set the starting mode |
| Skill as mode | Option+Enter (Mac) or Alt+Enter (Windows) from the `/` menu; exit the mode to return to normal |

Mode is per conversation. Switching to Ask after an Agent turn does not undo edits; use checkpoints or git for that.

## Model selection

Use the model picker at the top of the chat input to change models, or press **Cmd+/** to cycle through them. The change applies to the current conversation going forward, so you can let a fast model do exploration and switch to a more capable one for implementation. Set a default in **Cursor Settings > Models**. In the CLI, use `/model <name>` or `--model <name>`, and `agent models` or `--list-models` to see what your account can use.

Cursor's own guidance: faster models for quick edits and routine tasks, more capable models for complex reasoning and multi-file refactoring. As of the current model docs, Cursor's first-party pool is **Grok 4.6**, **Grok 4.5**, and **Composer 2.5**; third-party options include Claude Opus 5, Claude Sonnet 5, Claude Fable 5.1, GPT-5.5, GPT-5.6 Sol, Gemini 3.1 Pro, and others. Availability depends on your plan and region, and Enterprise admins can restrict the list.

### Auto and Cursor Router

**Auto** hands model choice to **Cursor Router**, a classifier that routes each request by task type and complexity: simple requests go to fast, efficient models and complex work goes to frontier models, aiming for the cheapest model that produces comparable quality. The reference docs state that Cursor Router is currently available on Teams and Enterprise plans.

Open the model picker, select **Auto**, and pick an option under **Optimize For**:

| Mode | Behavior |
|------|----------|
| **Cost** | The previous Auto routing logic. Optimizes token spend. |
| **Balance** | Optimizes for intelligence, speed, and cost. Default for new users. |
| **Intelligence** | Routes to the most capable models for harder tasks. Recommended for complex, multi-step work. |

Facts worth knowing:

- You cannot hand-pick which model handles a request; routing is data-driven and the pool changes over time. The current routing pool is GPT-5.5, Claude Opus 5, Grok 4.5, and Claude Fable 5.1.
- **Grok 4.5 is required.** The router needs a strong, cost-efficient model in the pool; blocking it on Enterprise disables the router. Blocking both GPT-5.5 and Claude Opus 5 also disables it.
- All Auto modes bill at the list price of the model each request is routed to. Third-party models also incur the Cursor Token Rate on Teams and Enterprise.
- Balance and Intelligence consume usage limits faster than Cost.
- The routed model is **hidden by default** so you judge results on merit. Admins can switch it to Displayed.
- Admins can turn the router on or off (Enterprise has it off by default), disable up to two optimization modes, and **Impose Auto**: *Soft* defaults each new chat to Auto, *Hard* locks the model picker to Auto.
- From the SDK, Cursor Router is model id `auto-smart` with parameter `optimize_for` set to `cost`, `balanced`, or `intelligence`.

### Max Mode

Max Mode exists only on **legacy request-based plans**. It extends a model's context window beyond the default limit and bills at the model's API rate plus 20%. Toggle it in the model selector; the setting persists across conversations, and models that require Max Mode enable it automatically when selected. Several third-party models are marked "Requires Max Mode on legacy request-based plans" in the pricing table. On current plans the toggle does not apply. The CLI stores the preference as `maxMode` in `cli-config.json`.

## When to use which mode

| Situation | Mode |
|-----------|------|
| You know exactly what to build and it is small | Agent |
| The change spans many files or has several valid designs | Plan, then Build |
| You need to understand code before touching it | Ask |
| Something is broken and reading the code has not explained why | Debug |
| The change is visual and you are looking at the running app | Design |
| You want a checklist or playbook applied on every turn | Custom Mode |
| The task is long, well specified, and you do not need to watch | Agent with `/goal`, or hand off to a Cloud Agent |

A common sequence for a feature: Ask to orient, Plan to design, Build, Debug if something regresses, Design to polish the UI.

## What works well

- **Let Plan Mode ask questions.** Answer them precisely; each answer removes a branch the agent would otherwise guess at.
- **Save plans to the workspace** for anything you might revisit. They double as design docs and as context for later sessions or Cloud Agents.
- **Give Debug Mode a reproduction, not a theory.** It is built to test hypotheses against runtime data; your job is the repro.
- **Switch models mid-conversation.** Explore with a fast model, then move to Intelligence or a frontier model for the implementation turn.
- **Use Custom Modes for standards.** A review checklist as a mode is more reliable than repeating it in every prompt.

## What to avoid

- **Fixing a bad build with follow-ups.** Revert, refine the plan, rerun. Cursor's docs are explicit that this is usually faster and cleaner.
- **Ask Mode for anything you want changed.** It will describe the change and stop.
- **Expecting Debug Mode in headless runs.** It needs you to reproduce the bug interactively.
- **Blocking models without checking the router.** On Enterprise, removing Grok 4.5 silently disables Auto for everyone.
- **Assuming Max Mode is available.** It only exists on legacy request-based plans.

## Compared with Claude Code

| Concern | Cursor | Claude Code |
|---------|--------|-------------|
| Read-only planning | Plan Mode with an editable plan file and a Build button | `plan` permission mode (`/plan`, Shift+Tab, `--permission-mode plan`) |
| Read-only Q&A | Ask Mode | No separate mode; use plan mode or ask in prose |
| Runtime-evidence debugging | Debug Mode with hypotheses, instrumentation, and a local debug server | No dedicated mode; you prompt Claude to add logging and run it |
| Visual UI direction | Design Mode in the Agents Window browser | No equivalent; use screenshots or a browser MCP |
| Persistent playbook | Custom Mode backed by a skill | Skills, output styles, and CLAUDE.md instructions |
| Automatic model routing | Auto via Cursor Router (Cost, Balance, Intelligence) | Pick a model with `/model`; no router |
| Auto-approval mode | Run Modes are a separate axis, see [Security & Run Modes](./permissions.md) | Permission modes and auto mode combine model and approval, see [Auto Mode](../claude-code/auto-mode.md) |

See [Claude Code Commands](../claude-code/commands.md) for the plan mode shortcuts on that side.
