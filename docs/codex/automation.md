---
sidebar_position: 13
sidebar_label: Automation & Non-interactive Mode
description: Run Codex without a TUI using codex exec, the Codex SDK, the GitHub Action, and scheduled tasks, and compose skills, agents, and hooks into workflows.
keywords: [codex exec, non-interactive mode, Codex SDK, Codex GitHub Action, JSONL output, output schema, scheduled tasks, app server, CI automation, workflow orchestration]
---

# Automation & Non-interactive Mode

Everything Codex does interactively can also run from a script, a CI job, an application, or a schedule. `codex exec` is the non-interactive entry point; the Codex SDK wraps it for TypeScript and Python; the GitHub Action runs it inside a workflow with safer key handling; scheduled tasks run it on a timer from the ChatGPT desktop app or web. This page covers each surface and then shows how to compose [skills](./skills.md), [custom agents](./subagents.md), and [hooks](./hooks.md) into repeatable workflows.

## Building blocks

| Block | Role in automation | Where it lives |
|---|---|---|
| `AGENTS.md` | Always-on repo rules the automated run inherits | Repo root and nested folders ([AGENTS.md & Memories](./agents-md.md)) |
| Skill | Named procedure invoked with `$skill` in the prompt | `.agents/skills/<name>/SKILL.md` ([Skills](./skills.md)) |
| Custom agent | Isolated worker with its own model, effort, sandbox, tools | `.codex/agents/<name>.toml` ([Subagents](./subagents.md)) |
| Hook | Deterministic script on lifecycle events (`PreToolUse`, `Stop`, and so on) | `.codex/hooks.json` ([Hooks](./hooks.md)) |
| MCP server | External tools the run may call | `config.toml` or a plugin ([MCP](./mcp.md)) |
| `codex exec` | Runs one prompt to completion, prints the result | CLI |
| `codex review` | Non-interactive code review of a diff | CLI |
| Codex SDK | Threads and turns from TypeScript or Python | `@openai/codex-sdk`, `openai-codex` |
| GitHub Action | `codex exec` inside a workflow with an API-key proxy | `openai/codex-action@v1` |
| Scheduled tasks | Recurring unattended runs | ChatGPT desktop app or web |
| App server | JSON-RPC protocol for building your own client | `codex app-server` |

## `codex exec`

### Basics

```bash
codex exec "summarize the repository structure and list the top 5 risky areas"
```

- Progress streams to **stderr**; only the **final agent message** goes to **stdout**, so piping and redirection are clean.
- Codex must run inside a Git repository unless you pass `--skip-git-repo-check`.
- The default sandbox is **read-only**. Grant more only when the task needs it.
- `codex e` is a short alias.

```bash
codex exec "generate release notes for the last 10 commits" | tee release-notes.md
codex exec --ephemeral "triage this repository and suggest next steps"   # no session files on disk
```

### Flags

| Flag | Values | Purpose |
|---|---|---|
| `PROMPT` | string or `-` | The task. Use `-` to read the whole prompt from stdin |
| `--sandbox, -s` | `read-only`, `workspace-write`, `danger-full-access` | Sandbox for model-generated commands. Defaults to config (read-only for `exec`) |
| `--ask-for-approval, -a` | `on-request`, `never` | Global flag controlling approval pauses; non-interactive runs cannot answer a prompt |
| `--json` | boolean | Emit newline-delimited JSON events on stdout instead of formatted text |
| `--output-last-message, -o` | path | Write the final message to a file (still printed to stdout) |
| `--output-schema` | path | JSON Schema the final response must conform to |
| `--model, -m` | string | Override the configured model, for example `gpt-5.6-terra` |
| `--profile, -p` | string | Layer `$CODEX_HOME/<name>.config.toml` on top of the base config |
| `-c, --config` | `key=value` | Inline config override, repeatable (values parse as TOML) |
| `--cd, -C` | path | Workspace root for the run |
| `--add-dir` | path | Extra writable directories (prefer this over `danger-full-access`) |
| `--image, -i` | paths | Attach images to the first message |
| `--ephemeral` | boolean | Do not persist session rollout files |
| `--ignore-user-config` | boolean | Skip `$CODEX_HOME/config.toml` (auth still uses `CODEX_HOME`) |
| `--ignore-rules` | boolean | Skip user and project execpolicy `.rules` files |
| `--skip-git-repo-check` | boolean | Allow running outside a Git repository |
| `--strict-config` | boolean | Fail if `config.toml` has keys this version does not recognize |
| `--dangerously-bypass-approvals-and-sandbox`, `--yolo` | boolean | No approvals, no sandbox. Only inside an isolated runner |
| `--dangerously-bypass-hook-trust` | boolean | Run enabled hooks without persisted trust; only when you vet hook sources elsewhere |
| `--full-auto` | boolean | Deprecated; prints a warning. Use `--sandbox workspace-write` |
| `--color` | `always`, `never`, `auto` | ANSI color on stdout |
| `--oss`, `--local-provider` | `lmstudio`, `ollama` | Use a local open-source provider |

### Permissions and safety

```bash
codex exec --sandbox workspace-write "fix the failing unit tests"          # edits allowed inside the workspace
codex exec --sandbox danger-full-access "rebuild the docker image"         # only in a throwaway container
```

- Set the **least** sandbox the task needs. `danger-full-access` belongs in an isolated CI runner or container.
- Use `--ignore-user-config` and `--ignore-rules` in controlled environments so a developer's personal config or `.rules` files cannot change what the job does.
- If an enabled MCP server has `required = true` and fails to start, `codex exec` exits with an error instead of running without it.
- Non-interactive runs cannot answer approval prompts. An action that would need a fresh approval fails and the error is surfaced. Configure the sandbox so the task does not need one. Details: [Permissions & Sandbox](./permissions.md).

### Machine-readable output

**JSONL events** with `--json`: each line is one event. Event types include `thread.started`, `turn.started`, `turn.completed`, `turn.failed`, `item.*`, and `error`. Item types include agent messages, reasoning, command executions, file changes, MCP tool calls, web searches, and plan updates.

```bash
codex exec --json "summarize the repo structure" | jq
```

```jsonl
{"type":"thread.started","thread_id":"0199a213-81c0-7800-8aa1-bbab2a035a53"}
{"type":"turn.started"}
{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","status":"in_progress"}}
{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"Repo contains docs, sdk, and examples directories."}}
{"type":"turn.completed","usage":{"input_tokens":24763,"cached_input_tokens":24448,"output_tokens":122,"reasoning_output_tokens":0}}
```

**Final message to a file** with `-o`:

```bash
codex exec --json "review this change" -o review.md > events.jsonl
```

The official tip for CI: pair `--json` with `--output-last-message` so you get machine-readable progress and a natural-language summary from one run.

**Structured output** with `--output-schema`:

```json
{
  "type": "object",
  "properties": {
    "verdict": { "type": "string", "enum": ["pass", "fail"] },
    "findings": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["verdict", "findings"],
  "additionalProperties": false
}
```

```bash
codex exec "Review the diff against main for correctness. Return a verdict and findings." \
  --output-schema ./review-schema.json \
  -o ./review.json
```

### Stdin patterns

| Pattern | Command | When |
|---|---|---|
| Prompt plus stdin | `cmd \| codex exec "instruction"` | You know the instruction; piped content becomes context |
| Stdin is the prompt | `cmd \| codex exec -` | A script assembles the entire prompt |

```bash
npm test 2>&1 | codex exec "summarize the failing tests and propose the smallest likely fix" | tee test-summary.md
tail -n 200 app.log | codex exec "identify the likely root cause and suggest the next three debugging steps" > log-triage.md
gh run view 123456 --log | codex exec "summarize the failure in 5 bullets for the PR thread" | gh pr comment 789 --body-file -
cat prompt.txt | codex exec -
generate_prompt.sh | codex exec - --json > result.jsonl
```

### Resume a run

Two-stage pipelines can continue a previous session:

```bash
codex exec "review the change for race conditions"
codex exec resume --last "fix the race conditions you found"
codex exec resume 0199a213-81c0-7800-8aa1-bbab2a035a53 "now add a regression test"
```

`--last` picks the most recent session from the current working directory; add `--all` to search every directory. Resume accepts an optional follow-up prompt and `--image`.

### Exit codes

The official docs do not publish a full exit-code table for `codex exec`. What is documented: a required MCP server that fails to initialize makes `codex exec` exit with an error; `codex login status` exits `0` when credentials are present (useful as a pre-check); `codex apply` and `codex cloud exec` exit non-zero on failure. In scripts, treat any non-zero status as failure and inspect the `turn.failed` or `error` events in `--json` output for the reason:

```bash
if ! codex exec --json "..." > events.jsonl; then
  jq -c 'select(.type=="turn.failed" or .type=="error")' events.jsonl
  exit 1
fi
```

### `codex review`

For review-only jobs there is a dedicated non-interactive command. Choose exactly one target:

```bash
codex review --base main
codex review --uncommitted
codex review --commit 3f2a9c1 --title "Add retry to payment client"
echo "Focus on concurrency bugs only" | codex review -
```

See [Auto-review](./auto-review.md) for the interactive reviewer.

## Authentication in automation

- `codex exec` reuses saved CLI credentials by default. In CI, provide `CODEX_API_KEY` explicitly, **only for the Codex invocation**, never as a job-level environment variable in a job that runs repository-controlled code (build scripts, tests, and dependency hooks can read job-level variables).
- If your runner already receives short-lived workload tokens, use workload identity federation instead of a stored key.
- Running CI as a ChatGPT-managed Codex account (seeding `~/.codex/auth.json`) is possible but is an advanced path; treat that file like a password and never use it for public repositories.

```bash
CODEX_API_KEY="$OPENAI_KEY" codex exec --json "triage open bug reports"
```

## Scripting patterns

### Gate a pipeline on a structured verdict

```bash
#!/usr/bin/env bash
set -euo pipefail
codex exec "Review the diff against origin/main. Return verdict pass or fail plus findings." \
  --output-schema .codex/schemas/review.json -o review.json > /dev/null
if [ "$(jq -r .verdict review.json)" = "fail" ]; then
  jq -r '.findings[]' review.json
  exit 1
fi
```

### Release notes from a tag range

```bash
git log "$(git describe --tags --abbrev=0)..HEAD" --oneline --no-merges \
  | codex exec "Turn these commits into a Keep a Changelog section. Skip CI-only commits." \
  > CHANGELOG.new.md
```

### Invoke a skill and an agent non-interactively

Skills and custom agents defined in the repo are available to `codex exec` just as in the TUI:

```bash
codex exec --sandbox workspace-write \
  'Use $gen-tests on src/payments/retry.ts, then have code_reviewer check the new tests. Return one summary.'
```

### A reusable profile for CI

`~/.codex/ci.config.toml` (or a system-level config on the runner image):

```toml
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"
sandbox_mode = "workspace-write"
approval_policy = "never"

[agents]
max_concurrent_threads_per_session = 3
default_subagent_model = "gpt-5.6-luna"
```

```bash
codex exec --profile ci --ignore-rules "run the repository's lint and test commands and fix trivial failures"
```

## Codex SDK

Use the SDK when Codex should be a component of something else: a CI step with retries, an internal tool, or your own agent that delegates engineering work. For a full custom client (auth, history, approvals, streamed events) use the [app server](#app-server-protocol) instead.

### TypeScript

```bash
npm install @openai/codex-sdk
```

Requires Node.js 18+ and runs server-side; the SDK spawns the `codex` CLI and exchanges JSONL events with it.

```typescript
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread({
  workingDirectory: "/path/to/project",
  skipGitRepoCheck: false,
});

const plan = await thread.run("Make a plan to diagnose and fix the CI failures");
console.log(plan.finalResponse);

const fix = await thread.run("Implement the plan");   // same thread, same context
console.log(fix.items);
```

**Streaming** intermediate events:

```typescript
const { events } = await thread.runStreamed("Diagnose the test failure and propose a fix");
for await (const event of events) {
  if (event.type === "item.completed") console.log("item", event.item);
  if (event.type === "turn.completed") console.log("usage", event.usage);
}
```

**Structured output** per turn:

```typescript
const schema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    status: { type: "string", enum: ["ok", "action_required"] },
  },
  required: ["summary", "status"],
  additionalProperties: false,
} as const;

const turn = await thread.run("Summarize repository status", { outputSchema: schema });
const result = JSON.parse(turn.finalResponse);
```

You can generate the schema from Zod with `zod-to-json-schema` using `target: "openAi"`.

**Threads** persist in `~/.codex/sessions`. Resume one later by ID:

```typescript
const thread = codex.resumeThread(process.env.CODEX_THREAD_ID!);
await thread.run("Pick up where you left off");
```

**Configuration** is passed as flattened `--config` overrides, and you can pin the CLI's environment:

```typescript
const codex = new Codex({
  env: { PATH: "/usr/local/bin" },
  config: {
    sandbox_mode: "workspace-write",
    sandbox_workspace_write: { network_access: false },
  },
});
```

`CODEX_API_KEY` is injected by the SDK on top of the environment you provide. Images can be attached as `{ type: "local_image", path }` input entries.

### Python

```bash
pip install openai-codex
```

Python 3.10+. The Python SDK drives the local app-server over JSON-RPC and ships a pinned Codex runtime.

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(model="gpt-5.6-terra", sandbox=Sandbox.workspace_write)
    result = thread.run("Make the requested change.")
    review = thread.run("Review the diff only.", sandbox=Sandbox.read_only)
    print(review.final_response)
```

Sandbox presets: `Sandbox.read_only`, `Sandbox.workspace_write`, `Sandbox.full_access`. A sandbox passed to `run()` applies to that turn and later turns on the thread. `AsyncCodex` exists for async applications.

## GitHub Action

`openai/codex-action@v1` installs the CLI, starts a Responses API proxy so the API key never reaches shell steps, and runs `codex exec` with the permissions you set. Prefer it over installing Codex yourself in a workflow.

```yaml
name: Codex pull request review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  codex:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      final_message: ${{ steps.run_codex.outputs.final-message }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: refs/pull/${{ github.event.pull_request.number }}/merge
          fetch-depth: 0
          persist-credentials: false
      - name: Run Codex
        id: run_codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt-file: .github/codex/prompts/review.md
          sandbox: read-only
          output-file: codex-output.md

  post_feedback:
    runs-on: ubuntu-latest
    needs: codex
    if: needs.codex.outputs.final_message != ''
    permissions:
      pull-requests: write
    steps:
      - uses: actions/github-script@v7
        with:
          github-token: ${{ github.token }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: process.env.CODEX_FINAL_MESSAGE,
            });
        env:
          CODEX_FINAL_MESSAGE: ${{ needs.codex.outputs.final_message }}
```

| Input | Purpose |
|---|---|
| `prompt` or `prompt-file` | Inline task or a repo path (store prompts under `.github/codex/prompts/`); set exactly one |
| `codex-args` | Extra CLI flags as a JSON array or shell string (`["--ephemeral"]`, `--profile ci`, `--output-schema ...`) |
| `model`, `effort` | Agent configuration; empty means defaults |
| `sandbox` | `read-only`, `workspace-write`, `danger-full-access` |
| `output-file` | Save the final message for later steps or artifacts |
| `codex-version` | Pin a CLI release |
| `codex-home` | Shared Codex home to reuse config and MCP setup across steps |
| `safety-strategy` | `drop-sudo` (default, irreversible for the job), `unprivileged-user` (with `codex-user`), `unsafe` (required on Windows) |
| `allow-users`, `allow-bots` | Who may trigger the workflow beyond write collaborators |

The action's `final-message` output carries the last Codex message. The **autofix on CI failure** pattern from the official docs splits work into two jobs: the Codex job has `contents: read` only and uploads a `git diff` patch as an artifact; a second job with write permissions (but no API key) applies the patch and opens a PR. Keep Codex as the **last** step in its job so later steps do not inherit state changes.

## App server protocol

`codex app-server` is the interface behind the IDE extension and the desktop app. Build on it when you need a real client: authentication, conversation history, approval handling, and streamed events. For jobs and CI use the SDK.

- JSON-RPC 2.0 messages (without the `jsonrpc` header on the wire). Requests carry `method`, `params`, `id`; notifications omit `id`.
- Transports: `stdio` (default, JSONL), WebSocket (`--listen ws://IP:PORT`, experimental), Unix socket. `GET /readyz` and `/healthz` probes are served on WebSocket listeners.
- Core methods include `thread/start`, `turn/start`, and `turn/interrupt`; skills can be invoked in a turn by adding a `skill` input item alongside the `$skill` text. Per-turn overrides (model, effort, `cwd`, sandbox policy, `outputSchema`) are supported.
- Generate a TypeScript or JSON Schema bundle for your exact Codex version from the CLI.
- `codex mcp-server` has been removed; use the app server for those integrations.
- You can also point the CLI TUI at a remote app server: `codex --remote ws://127.0.0.1:4500`. See [Codex Cloud & Remote](./cloud.md).

## Scheduled tasks

Scheduled tasks run a saved prompt on a schedule in the background. They are created and managed in the **ChatGPT desktop app** (Codex or ChatGPT Work) or on ChatGPT web; the CLI and IDE extension do not have a scheduling UI, but they are the right place to develop and test the prompt or skill first.

Desktop app specifics:

- Tasks can run in the local project or in an isolated [worktree](./worktrees.md). Worktrees keep task changes away from unfinished local work; frequent schedules create many worktrees, so archive runs you no longer need.
- The machine must be on and the app running for tasks that need local files.
- Standalone tasks start a new chat per run; a task **inside a chat** returns to that chat with its context (useful for "check the PR every 10 minutes and fix new review feedback").
- Custom cadence via RFC 5545 recurrence rules, for example `RRULE:FREQ=MONTHLY;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0`.
- Invoke a skill explicitly in the task prompt with `$skill-name` so the run does not depend on implicit selection.
- Ask Codex to create or update a task for you; skills can create tasks too (a PR-babysitting skill can schedule its own follow-ups).

On the web, eligible plans can trigger tasks from **Gmail, Slack, or GitHub events** (for example pull request activity filtered by label). Event triggers are web and mobile only.

**Security model.** Scheduled tasks run unattended with your **default sandbox** and `approval_policy = "never"` when your organization allows it; otherwise they fall back to your permission mode's approval behavior. Start read-only or workspace-write, and use [rules](./permissions.md) to allowlist specific commands rather than granting full access. Admins can constrain this with `requirements.toml`.

Official example prompts include a daily AGENTS.md drift check, a 24-hour commit briefing per directory, and a `$recent-code-bugfix` skill that finds and fixes a bug from your own recent commits.

## Goal mode for long-running work

For long tasks inside an interactive session, `/goal` turns the prompt into a persistent objective with completion criteria; Codex keeps working toward it and pauses when it needs a decision. Write the goal as outcome, constraints, and verification ("compile in strict mode without explicit `any`, full test suite passes"). Goal mode does not widen permissions. It is the interactive counterpart to `codex exec`: use `/goal` when you are present, `codex exec` or a scheduled task when you are not.

## Composing a workflow: Research, Plan, Implement

The same building blocks Claude Code users compose in [Workflows & Orchestration](../claude-code/workflows.md) map onto Codex primitives. Below is a Research-Plan-Implement (RPI) setup using repo skills, a read-only explorer agent, a hook as a guardrail, and `codex exec` to chain the phases.

### Skills (`.agents/skills/`)

`.agents/skills/rpi-research/SKILL.md`:

```markdown
---
name: rpi-research
description: Research the feasibility of a proposed feature and write RESEARCH.md with a GO or NO-GO recommendation. Use when the user asks whether a feature is feasible, or before planning new work. Do not write implementation code.
---

1. Spawn the `explorer` agent to map the code paths, integration points, and existing patterns relevant to the feature. Wait for it.
2. Identify dependencies, technical risks, and an effort estimate (hours, days, weeks).
3. Write `RESEARCH.md` with sections: Existing code, Dependencies, Risks, Effort, Recommendation (GO or NO-GO with justification).
4. Do not modify any other file.
```

`.agents/skills/rpi-plan/SKILL.md`:

```markdown
---
name: rpi-plan
description: Turn RESEARCH.md into PLAN.md, REQUIREMENTS.md, and ARCHITECTURE.md. Use after research returns GO. Each plan step must be small enough for one Codex run.
---

1. Read `RESEARCH.md`. Stop with an explanation if the recommendation is NO-GO.
2. Write `PLAN.md` as a checklist of steps (`- [ ]`) with the files each step touches.
3. Write `REQUIREMENTS.md` with acceptance criteria per step.
4. Write `ARCHITECTURE.md` describing data flow and key decisions in text.
```

`.agents/skills/rpi-implement/SKILL.md`:

```markdown
---
name: rpi-implement
description: Implement the next unchecked step in PLAN.md, run tests, mark it done, and commit. Use when the user asks to continue the plan or implement the next step. Never skip ahead.
---

1. Read `PLAN.md`; take the first `- [ ]` step only.
2. Implement it. Run the relevant tests. Have `test_writer` add tests if the step has none.
3. Change `- [ ]` to `- [x]` for that step. Commit with a message naming the step.
4. If the step cannot be completed, explain why and stop.
```

### Agents (`.codex/agents/`)

Use the `explorer` and `test_writer` blueprints from [Subagents](./subagents.md): `explorer` is `read-only` on `gpt-5.6-luna`; `test_writer` is `workspace-write` on `gpt-5.6-terra`. Cap concurrency in `.codex/config.toml`:

```toml
[agents]
max_concurrent_threads_per_session = 3
```

### Guardrail hook (`.codex/hooks.json`)

A `PreToolUse` hook that blocks writes to migration files during implementation runs. The exact input and output schema is on the [Hooks](./hooks.md) page; the point here is that the check is deterministic and independent of the model's judgment.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/block_migrations.py\"",
            "statusMessage": "Checking migration policy"
          }
        ]
      }
    ]
  }
}
```

Hooks in a project `.codex/` layer must be reviewed and trusted (`/hooks`) before they run; in CI, either trust them in the runner image or pass `--dangerously-bypass-hook-trust` when the hook sources are vetted elsewhere.

### Driver script

```bash
#!/usr/bin/env bash
set -euo pipefail
feature="$1"

codex exec --sandbox workspace-write -o research.md \
  "Use \$rpi-research for: $feature" > /dev/null

if ! grep -q "GO" research.md || grep -q "NO-GO" research.md; then
  echo "Research says NO-GO; stopping."; exit 0
fi

codex exec resume --last "Use \$rpi-plan." > /dev/null

steps=$(grep -c '^- \[ \]' PLAN.md)
for _ in $(seq "$steps"); do
  codex exec resume --last --json "Use \$rpi-implement." > "implement-$RANDOM.jsonl"
done
```

Interactively, the same flow is three prompts: `$rpi-research ...`, `$rpi-plan`, then `$rpi-implement` repeated, with a human reading `RESEARCH.md` and `PLAN.md` between phases. The research phase is a good candidate for a scheduled task or a `codex exec` job; the implementation loop benefits from a human checkpoint after each plan step.

### Why this shape works

- Research and planning produce files, so each phase can be reviewed, versioned, and resumed.
- The explorer runs read-only in its own thread, so exploration noise never enters the planning context.
- Steps are sized for a single run, which keeps `codex exec` invocations short and resumable.
- The hook enforces the one rule that must never be broken, regardless of what the prompt says.

## Safety in CI

- **Least privilege**: default read-only; `workspace-write` only for jobs that must edit; `danger-full-access` and `--yolo` only in disposable containers.
- **Isolate config**: `--ignore-user-config`, `--ignore-rules`, and a dedicated `--profile` or `codex-home` so a developer's personal settings and `.rules` cannot alter a job.
- **Secrets**: never job-level `OPENAI_API_KEY` or `CODEX_API_KEY`; scope the variable to the Codex invocation or use the GitHub Action's proxy. Rotate keys if output or proxy logs may have leaked.
- **Untrusted input**: sanitize prompts built from PR titles, commit messages, or issue bodies; check for hidden text and HTML comments before feeding them to Codex.
- **Triggers**: restrict who can start Codex workflows (`allow-users`, `allow-bots`, trusted events).
- **Order**: run Codex last in its job; hand off patches as artifacts to a separate job with write permissions.
- **Hooks**: trust hook definitions deliberately; managed hooks via `requirements.toml` are the enterprise path.
- **Approvals**: assume none can be answered. Any action needing a fresh approval fails; design the sandbox and rules so the happy path never needs one.

## What to avoid

- `--full-auto` in new scripts (deprecated; use `--sandbox workspace-write`).
- Parsing formatted stdout. Use `--json` or `--output-schema`.
- One giant prompt for a multi-phase task. Chain `codex exec resume --last` or SDK turns so each phase is checkable.
- Expecting scheduled tasks in the CLI; develop there, schedule in the desktop app or web.
- Giving scheduled tasks full access. Use workspace-write plus rules.
- Letting parallel jobs write to the same checkout; use separate [worktrees](./worktrees.md).

## Compared with Claude Code

| | Codex | Claude Code |
|---|---|---|
| Non-interactive command | `codex exec "..."`, `codex e` | `claude -p "..."` (`--print`) |
| Structured stream | `--json` JSONL events (`thread.*`, `turn.*`, `item.*`) | `--output-format stream-json` |
| Final message to file | `-o`, `--output-last-message` | Redirect stdout |
| Schema-constrained output | `--output-schema file.json` | `--json-schema <schema>` |
| No session on disk | `--ephemeral` | `--no-session-persistence` |
| Resume | `codex exec resume --last`, by session ID | `--resume`, `--continue` |
| Skip personal config | `--ignore-user-config`, `--ignore-rules` | `--bare` |
| SDK | `@openai/codex-sdk` (TypeScript), `openai-codex` (Python) | See [Claude Code Flags](../claude-code/flags.md) for headless options |
| CI integration | `openai/codex-action@v1` with API-key proxy and `safety-strategy` | Claude GitHub Actions app via `/install-github-app` |
| Scheduled runs | Scheduled tasks in the ChatGPT desktop app or web (not CLI) | `/loop [interval]` inside a session; external schedulers otherwise |
| Workflow primitives | Skills (`$name`), TOML custom agents, hooks, `AGENTS.md` | Skills (`/name`), Markdown subagents, hooks, `CLAUDE.md` |
| Long-running interactive mode | `/goal` | Plan mode (`/plan`), background tasks |

See [Claude Code Workflows & Orchestration](../claude-code/workflows.md) for the Claude Code patterns this page mirrors, and [Claude Code Hooks](../claude-code/hooks.md) for the hook model on that side.
