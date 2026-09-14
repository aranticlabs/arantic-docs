---
sidebar_position: 4
sidebar_label: Managing Context
description: How to manage the Codex context window with compaction, reasoning effort, Fast mode, goals, session resume and fork, image inputs, and reasoning display.
keywords: [Codex context window, /compact, auto compaction, model_reasoning_effort, Codex fast mode, codex resume, /goal, image inputs, hide_agent_reasoning, Codex context management]
---

# Managing Context

Even with large context windows, model output degrades as a chat fills with exploration notes, test logs, stack traces, and command output. OpenAI's docs call this context pollution (useful information gets buried) and context rot (quality drops as the chat grows). Managing context in Codex means compacting at the right time, choosing the right reasoning effort and speed for the task, keeping one chat per coherent unit of work, and offloading noisy work to subagents.

## Watching context usage

| Where | What you see |
|-------|--------------|
| `/status` | Active model, approval policy, writable roots, and token usage including remaining context capacity |
| Footer status line | Configure with `/statusline`: items include model, model+reasoning, context stats, rate limits, git branch, token counters, session id, and directory |
| `/usage [daily\|weekly\|cumulative]` | ChatGPT account token activity and rate-limit windows (not the current context window) |
| IDE `/status` | Chat ID, context usage, and rate limits |

If you want the context figure visible at all times, run `/statusline` once and enable the context stats item; the choice persists to `tui.status_line` in `config.toml`.

## Compaction

### Manual: /compact

After a long exchange, type `/compact`. Codex replaces earlier turns with a concise summary, freeing context while keeping key details. Use it after a big investigation or test run, before starting the next sub-task in the same chat.

### Automatic compaction

Codex also compacts automatically when the chat approaches a model-specific token threshold. Three `config.toml` keys tune this:

| Key | Purpose |
|-----|---------|
| `model_auto_compact_token_limit` | Token threshold that triggers automatic compaction. Unset uses the model default. |
| `model_auto_compact_token_limit_scope` | `total` (default) counts the full active context; `body_after_prefix` counts only growth after the carried compaction-window prefix. |
| `model_context_window` | Override the context window size Codex assumes for the active model (useful with custom providers). |

```toml
# ~/.codex/config.toml
model_auto_compact_token_limit = 64000
model_context_window = 128000
```

Two more keys customize the summary itself: `compact_prompt` (inline override of the compaction prompt) and `experimental_compact_prompt_file` (load it from a file). Compaction also fires `PreCompact` and `PostCompact` [hooks](./hooks.md) with a `trigger` of `manual` or `auto`, so you can log or react to it.

:::tip
Do not wait for automatic compaction if quality is already slipping. Run `/compact` proactively at natural boundaries: after a plan is agreed, after a large test run, or before switching to a different part of the task.
:::

### Experimental context management

On supported clients, users signed in with ChatGPT Plus or Pro can opt into experimental context management for GPT-6 Astra. Instead of repeatedly compressing the chat into a single summary, Codex keeps notes across context windows and can search earlier messages and tool results from the same task. It is off by default and not available with Business, Enterprise, or API-key sign-in at launch:

```toml
[features.context_management]
experimental_mode = true
```

Start a new task after enabling it.

### What else consumes context

- **Instruction files.** The `AGENTS.md` chain is capped by `project_doc_max_bytes` (32 KiB by default). See [AGENTS.md & Memories](./agents-md.md).
- **Skills catalog.** The initial list of skill names, descriptions, and paths uses at most 2% of the model's context window (or 8,000 characters when the window is unknown), and explicit `skills.max_context_tokens` values are capped at 10,000 tokens. Codex shortens descriptions first and may omit skills with a warning.
- **Tool output.** `tool_output_token_limit` sets the token budget kept per tool or function output in history.

## Reasoning effort

Higher reasoning effort improves results on complex tasks but takes longer and uses more tokens. Start with the default and raise it when a task needs deeper planning, analysis, or checking.

### Levels

Codex CLI exposes `minimal`, `low`, `medium`, `high`, and `xhigh` (`xhigh` is model-dependent). The desktop app and IDE label these Light, Medium, High, and Extra High. Guidance from the models page:

- **Low / Light**: quick, well-scoped tasks
- **Medium**: balances speed and depth for tasks that need some planning
- **High / Extra High**: difficult work with multiple steps, sources, or tradeoffs

There is no exact mapping between GPT-5.5 and GPT-5.6 effort levels; retry a familiar task at a lower setting and adjust.

### How to set it

| Way to adjust | How |
|---------------|-----|
| `/model` | Pick the model and, when available, the reasoning effort for the current chat |
| `config.toml` | `model_reasoning_effort = "high"` as your default |
| One run | `codex -c model_reasoning_effort=high` or `codex exec -c model_reasoning_effort=low "..."` |
| Profile | Put `model_reasoning_effort` in `~/.codex/<name>.config.toml` and select it with `--profile <name>` (see [CLI Flags & Configuration](./flags.md)) |
| Plan mode | `plan_mode_reasoning_effort` overrides the effort used only while planning (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`) |
| IDE extension | `/reasoning` in the composer, or the model switcher below it |
| Managed defaults | Admins can set `[models.new_thread] model_reasoning_effort` as a default for new threads; an explicit `--model`, `--config`, or `--profile` override makes Codex ignore it |

```toml
# ~/.codex/config.toml
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"
plan_mode_reasoning_effort = "high"
```

### Max, Ultra, and Codex-Spark

- **Max** gives the selected model more time to reason on a single task. Use it for the hardest problems, when depth matters more than speed. Enable it in the desktop app settings if it is not shown.
- **Ultra** uses [subagents](./subagents.md) to work on separate parts of a complex task in parallel. Choose it when the work divides into meaningful pieces. Turn on **Ultra in model picker slider** under **Settings > Configuration** in the desktop app if it is missing. Most tasks do not need Max or Ultra.
- **GPT-5.3-Codex-Spark** is a separate, less capable model optimized for near-instant iteration with its own usage limits (research preview for ChatGPT Pro). It is a model choice, not an effort level.

## Speed: Fast mode

Fast mode speeds up a supported model in exchange for higher credit consumption:

- GPT-5.6, GPT-5.5, and GPT-5.4: about 1.5x faster. GPT-5.6 and GPT-5.5 consume credits at 2.5x the Standard rate; GPT-5.4 at 2x.
- GPT-6 Astra Fast mode consumes credits at 2.5x where available.

| Control | How |
|---------|-----|
| Toggle in the TUI | `/fast on`, `/fast off`, `/fast status` (only shown when the model catalog exposes a Fast tier) |
| Persist the default | `service_tier = "fast"` plus `[features] fast_mode = true` in `config.toml` |
| Show it in the footer | Add the Fast mode item via `/statusline` |

Fast mode is a ChatGPT credit feature available in the CLI, IDE extension, and desktop app when you sign in with ChatGPT. With an API key, Codex bills API token pricing instead: `fast` maps to the API's `priority` service tier, which for GPT-5.6 costs 2x the Standard API rate.

## Long-running work

For work that spans many steps, give Codex an outcome, constraints, and a definition of done, then keep related work in the same chat so it can decide the next step with full context.

### Goal mode

`/goal <objective>` sets a persistent target that Codex keeps working toward across turns (the goal text becomes both the first prompt and the completion criteria). Manage it with `/goal` (view), `/goal edit`, `/goal pause`, `/goal resume`, and `/goal clear`. Objectives are limited to 4,000 characters; for longer specs, put the details in a file and point the goal at it. Goals are controlled by the `goals` feature flag (on by default).

If the outcome is still fuzzy, start with `/plan`, ask Codex to interview you and turn the result into a goal with measurable success criteria, then start the refined goal with `/goal`.

**Weak:**
```text
Migrate the codebase to TypeScript.
```

**Strong:**
```text
Migrate this codebase from JavaScript to TypeScript. Preserve existing behavior,
compile in strict mode without explicit `any` types, and make the full test suite pass.
```

| Goal element | Include |
|--------------|---------|
| **Outcome** | The result you want, not just the activity |
| **Constraints** | Required tools, boundaries, compatibility needs, approaches to avoid |
| **Verification** | Tests, measurements, or review criteria that prove completion |

### Steering a running turn

- Press `Enter` while Codex is working to inject instructions into the current turn.
- Press `Tab` to queue a follow-up prompt, slash command, or shell command for the next turn.
- Use `/side` for a status recap or explanation without interrupting the main chat.

Starting a goal does not widen access: the same sandbox and approval policy apply, and Codex pauses when it needs a decision. With [Auto-review](./auto-review.md), a separate reviewer can evaluate eligible requests without expanding those boundaries.

### Parallel goals

Each chat keeps its own context, results, and goal. Run several concurrently, but never let two chats edit the same files. Use [worktrees](./worktrees.md) to give parallel coding chats separate checkouts.

## Sessions: new, resume, fork

The docs' rule of thumb: **one chat per coherent unit of work**. Staying in the same chat preserves the reasoning trail while the work is still the same problem; using one chat for an entire project leads to bloated context and worse results. Fork only when the work truly branches.

| Action | In the TUI | From the shell |
|--------|-----------|----------------|
| Start fresh | `/new [name]` (keeps the screen) or `/clear [name]` (clears it) | `codex` |
| Resume a saved chat | `/resume` (picker) | `codex resume` (picker), `codex resume --last`, `codex resume <SESSION_ID or name>`; add `--all` to include other directories, `--include-non-interactive` to include `codex exec` sessions |
| Branch without losing the original | `/fork` (current chat) | `codex fork` (picker), `codex fork --last` |
| Rewind to an earlier point | `Esc` `Esc` with an empty composer to edit a previous message and fork from there | |
| Quick aside | `/side [prompt]` | |
| Clean up | `/archive`, `/delete` | `codex archive <SESSION>`, `codex unarchive <SESSION>`, `codex delete <SESSION>` |
| Continue a headless run | | `codex exec resume --last "follow-up"` |

`codex resume` and `codex fork` accept the same global flags as `codex`, including `--model` and sandbox overrides. When your current directory differs from the session's saved directory, Codex asks which to use; set `tui.resume_cwd = "current"` or `"session"` to skip the prompt (an explicit `--cd` wins).

Session transcripts persist under `CODEX_HOME` by default. Set `[history] persistence = "none"` to disable local history, or cap it with `history.max_bytes`. Use `codex exec --ephemeral` for automation runs that should leave no session files.

### Offload noisy work to subagents

Keep the main chat for requirements, decisions, and final output. Delegate exploration, test runs, log triage, and summarization to [subagents](./subagents.md), which return distilled findings instead of raw output. Start with read-heavy tasks; be careful with parallel write-heavy work.

## Image inputs

Add images when the task depends on visual context: an error screenshot, a design, an architecture diagram, an existing asset.

```bash
codex -i screenshot.png "Explain this error and suggest the smallest fix"
codex --image before.png,after.png "Compare these states and list the regressions"
codex exec -i mockup.png "Implement this layout in src/components/Card.tsx"
```

- Separate multiple paths with commas or repeat `--image`. PNG and JPEG are accepted.
- In the interactive composer, paste an image directly. In the IDE extension, hold `Shift` while dragging an image into the composer so the extension accepts the drop.
- `codex exec resume -i <path>` attaches images to a follow-up prompt.

Write the prompt around the image: name what it shows, point at the region that matters, and state the output and constraints.

**Weak:**
```text
Fix this.
```

**Strong:**
```text
Compare this checkout screen with the design. Fix spacing and typography only;
do not change behavior. Verify the result with a new screenshot.
```

## Reasoning display

Codex streams reasoning summaries into the transcript. Control how much you see:

| Key | Values | Effect |
|-----|--------|--------|
| `model_reasoning_summary` | `auto`, `concise`, `detailed`, `none` | Summary detail, or disable summaries |
| `hide_agent_reasoning` | `true` / `false` | Suppress reasoning events in the TUI and `codex exec` output (useful for CI logs) |
| `show_raw_agent_reasoning` | `true` / `false` | Surface raw reasoning content when the model emits it (some models and providers, such as `gpt-oss`, emit none) |
| `model_supports_reasoning_summaries` | `true` / `false` | Force Codex to send or not send reasoning metadata |
| `model_verbosity` | `low`, `medium`, `high` | Response length for GPT-5 family models on the Responses API |

```toml
# Quiet CI output
hide_agent_reasoning = true
model_verbosity = "low"
```

Use `/statusline` to add the model+reasoning item if you want the current effort visible in the footer.

## Practical checklist

- Check `/status` before a big step; compact if context is well past half.
- Start a new chat (`/new`) for unrelated work rather than reusing a long session.
- Use `/plan` first, then `/goal`, for multi-step tasks with a verifiable end state.
- Pick the lowest effort that produces the result; raise it for planning-heavy or tradeoff-heavy steps.
- Turn on Fast mode for iterative, low-risk edits when speed matters more than credits.
- Send subagents to do the reading and testing; keep the main chat for decisions.
- Attach images for anything visual instead of describing it.

## Compared with Claude Code

| Topic | Codex | Claude Code |
|-------|-------|-------------|
| Usage view | `/status` and footer via `/statusline` | `/context` grid and `/cost` |
| Manual compaction | `/compact` (no custom instructions argument documented) | `/compact [instructions]` |
| Auto compaction tuning | `model_auto_compact_token_limit`, `_scope`, `compact_prompt`; `PreCompact` / `PostCompact` hooks | Automatic at a late threshold; `PreCompact` / `PostCompact` hooks |
| Effort | `/model` picker or `model_reasoning_effort` (`minimal` to `xhigh`) | `/effort`, `--effort`, `CLAUDE_CODE_EFFORT_LEVEL` (`low` to `max`) |
| Faster output | `/fast`, `service_tier = "fast"` | `/fast` |
| Rewind | `Esc` `Esc` edits a previous message and forks; no file checkpoints documented | `/rewind` restores conversation and file state |
| Long tasks | `/goal` with pause, resume, edit | `/goal` |
| Aside | `/side` (alias `/btw`) | `/btw` |
| Thinking display | `model_reasoning_summary`, `hide_agent_reasoning`, `show_raw_agent_reasoning` | `Ctrl+O` verbose toggle, `showThinkingSummaries` |

See [Claude Code Managing Context](../claude-code/context.md) for the Claude Code details.
