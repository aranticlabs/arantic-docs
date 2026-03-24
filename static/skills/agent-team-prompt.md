---
name: agent-team-prompt
description: Generates a ready-to-paste Claude Code Agent Teams spawning prompt saved as a plain .txt file in .claude/prompts/. Use this skill whenever the user wants to create, build, write, or generate a prompt for spawning Claude Code agent teams, multi-agent workflows, teammate agents, or parallel agents. Trigger on phrases like "agent team prompt", "spawn agents", "create team prompt", "build agent team", "generate multi-agent prompt", "make a spawning prompt", "write a team prompt for my PRD", "set up an agent team". Also invoke proactively when the user has a PRD and mentions starting an agent team or coordinating parallel agents — even if they don't say "skill" or "prompt".
---

# Agent Team Prompt Generator

This skill interviews the user, reads their PRD (if available), and produces a finalized Claude Code Agent Teams spawning prompt saved as a plain `.txt` file in `.claude/prompts/` — ready to paste into the lead agent's first message.

User-supplied arguments (if any):
$ARGUMENTS

## References

Two files are bundled with this skill. Read both before generating the prompt:

- `references/sample-prompts.md` — canonical sample prompts in plain-text format, covering PRD implementation (new and existing apps), full-stack feature teams, code review teams, debugging teams, and research teams. Study the structure and tone of each.
- `references/prompt-rules.md` — model selection logic, signal/wait chain patterns, rules that work well, and things to avoid.

## Step 1: Find the PRD

Check `$ARGUMENTS` first:

- If a path was supplied (e.g. `docs/prd/user-auth/` or `docs/prd/feature-x/PRD-00-INDEX.md`), go directly to that location. Do not search elsewhere.
- If `$ARGUMENTS` is empty, search the project for PRD files in these locations: `docs/prd/`, `.claude/prd/`, and any `PRD*.md` files in the project root.
- If no PRD is found anywhere, that is fine — gather the information through the interview instead.

When PRD files are found, read the index file (`PRD-00-INDEX.md`) first to understand scope, then skim the relevant PRDs for tech stack, workstreams, and acceptance criteria. This lets you propose an informed team design without burdening the user with questions they shouldn't have to answer manually.

## Step 2: Interview the user

Ask all of these in a single message. Do not drip one question at a time — it wastes time and feels like a form.

1. Project type: new project (empty repo, no CLAUDE.md yet) or existing app with established patterns and an existing CLAUDE.md?
2. What to build or do — the feature, task, or goal. Skip if already clear from the PRD.
3. Preferred number of agents (suggest 4–6 as a starting range and explain the token cost tradeoff briefly).
4. Specific roles in mind, or should you propose roles based on the workstreams?
5. Lead model: opus (complex multi-phase coordination, strict gating logic) or sonnet (most everyday cases)?
6. Terminal mode: tmux split-pane (each agent in its own live pane) or in-process (all output in one window, cycle with Shift+arrow keys)?

If the PRD already answers some of these, skip those questions and mention what you inferred — it builds confidence.

## Step 3: Design the team

Use the PRD and user answers to design the agent team. Think through these four dimensions:

**Roles** — match workstreams, not org-chart titles. A full-stack web app naturally splits into: Init/Database, Domain/Business Logic, API, Frontend, QA. A review task splits into: Security, Performance, UX, Test Coverage. A debugging task gives each agent a different hypothesis to investigate in parallel. Roles should reflect genuinely independent work — if two things must happen sequentially and one is tiny, merge them into one agent.

**Models** — use opus for the lead and any agent doing architectural reasoning or complex decisions. Use sonnet for implementation agents. Use haiku for mechanical agents (file scanning, linting, running tests, grepping). Token cost scales directly with the number of agents and their model tier, so recommend haiku where the work is repetitive and rule-based.

**Signal chains** — define wait/signal dependencies only where there is a real dependency. Agents that can genuinely work in parallel should not wait for each other. Agents that need another's output (e.g., API agent needs the schema) should wait for a signal. Keep signal names short and descriptive: "schema-ready", "api-ready", "scaffold-ready".

**Rules block** — keep it short. Only include rules that actively change behavior. The following are almost always appropriate:
- No plan approval — write plans to .claude/plans/ instead (plan approval blocks the whole team)
- No commits or pushes — lead handles all git operations
- Handoffs use signals, no polling
- Agents read CLAUDE.md before coding (if one exists)
- Before signaling: re-read the checklist, verify every item, include a completion summary

If the user chose tmux mode, always include this as the first rule in the RULES block:
- Each agent gets its own tmux window/pane for isolated terminal sessions

Study `references/sample-prompts.md` to calibrate the right level of detail for the team type.

## Step 4: Write the .txt output file

Create `.claude/prompts/` if it does not exist, then save the prompt to `.claude/prompts/<descriptive-name>-team.txt`.

### Output format — critical

The file will be pasted directly into Claude Code, so it must be clean plain text with no markdown artifacts. The person pasting it should not have to clean anything up first.

Rules:
- Plain text only. No # headers. No **bold** or *italic*. No ``` fences. No > blockquotes.
- ALL-CAPS labels with a colon for the major sections: TASK:, AGENTS:, RULES:, LEAD:
- Indent agent entries and sub-items with two spaces or a leading dash
- One blank line between sections
- Each agent entry: "- Agent Name (model): what PRD docs it reads. What it waits for. What it signals."
- Each rule: one clear statement per line, starting with a dash

### Section structure

Adapt this template to the team type — omit sections that do not apply:

  TASK: [one or two sentences on what to build/do and where the PRD or spec lives]

  Read [what to read before spawning: CLAUDE.md, PRD-00-INDEX.md, relevant docs].

  AGENTS:
  - Agent Name (model): reads [docs]. Signals "x-ready".
  - Agent Name (model): reads [docs]. Waits for "x-ready". Signals "y-ready".
  - QA Agent (sonnet): reads [acceptance criteria doc]. Reviews each phase as signals arrive.

  RULES:
  - All agents read CLAUDE.md before coding
  - Before signaling: re-read checklist, verify every item, include completion summary with signal
  - Handoffs use signals, no polling
  - No plan approval — write plans to .claude/plans/ before implementing
  - No commits or pushes — lead handles all git operations
  - [Any task-specific rules, e.g. "read-only — do not make code changes"]

  LEAD (model): [how to coordinate — what to check after each signal, gate conditions, final verification step]

Notes on when to omit sections:
- Review teams: no signal chain (all agents work in parallel), no LEAD coordination block beyond "write a consolidated report"
- Debugging teams: no signal chain, agents share findings via messages and a shared file
- Research/planning teams: no signal chain, agents discuss and reach consensus

## Step 5: Confirm and advise

After saving the file, tell the user:

- The path to the saved file
- A brief summary of the team: roles, models, mode
- If tmux mode was chosen: remind them to run `tmux new-session -s claude-team` before launching claude, or use the `claude-team` alias if configured (alias: `tmux new-session -s claude-team -c "$PWD" \; send-keys "claude" C-m`)
- How to use it: copy the file contents and paste into Claude Code as the opening prompt for the lead agent
