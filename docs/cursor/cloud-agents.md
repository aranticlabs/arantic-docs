---
sidebar_position: 13
sidebar_label: Cloud Agents & Automations
description: Run Cursor agents unattended in cloud VMs, trigger them from schedules and events with Automations, and compose skills, subagents, and hooks into workflows.
keywords:
  [
    Cursor Cloud Agents,
    Cursor Automations,
    environment.json,
    Cloud Agent Builds,
    Cloud Agents API,
    Cursor SDK,
    self-hosted machines,
    Slack cursor agent,
    Linear cursor agent,
    agent workflows,
  ]
---

# Cloud Agents & Automations

Cloud Agents are Cursor agents that run in isolated virtual machines in Cursor's cloud instead of on your laptop. Each VM is a full development environment (cloned repositories, installed dependencies, secrets, startup services, network access), so an agent can build, test, click through the UI, and open a pull request without your machine being online. Automations put Cloud Agents on triggers: a cron schedule, a pull request event, a Slack message, a Linear issue, a webhook. Together with rules, skills, subagents, and hooks committed to the repository, they turn one-off prompts into repeatable, unattended workflows.

This page covers Cloud Agents (setup, builds, capabilities, security), Automations, the API, SDK, and self-hosted options, and then shows how to compose Cursor's primitives into a Research-Plan-Implement style workflow that runs safely without a human watching every step.

## Cloud Agents

### What they are

A Cloud Agent uses the same agent fundamentals as the editor, but the run moves through a cloud lifecycle:

1. **Start** from the web app, IDE, CLI, API, Slack, GitHub, Bitbucket, Linear, or mobile.
2. **Provision** an isolated VM and clone the authorized repositories.
3. **Run** code and tools inside the VM, streaming progress, output, and artifacts back.
4. **Persist** conversation state, metadata, and artifacts to Cursor-managed storage so the run can be reviewed and resumed.
5. **Hand off** by pushing a branch and opening a draft pull request for a human to review.
6. **Recycle** the VM on lifecycle timers once the run is idle.

Why teams use them:

- Run as many agents in parallel as you want, with no dependence on your local machine.
- Agents can build, test, and use the software they changed, including desktop and browser control (computer use).
- Multi-repo environments let one agent make coordinated changes across frontend, backend, infrastructure, or shared-library repositories and open PRs in each.
- Runs survive you closing your laptop; pick them up later from web, desktop, or phone.

Cloud Agents were formerly called Background Agents.

### Where you start them

| Surface             | How                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Cursor Desktop      | Select **Cloud** in the dropdown under the agent input; in the Agents Window, `/in-cloud` sends the next task to a cloud subagent |
| Cursor Web          | [cursor.com/agents](https://cursor.com/agents) on any device (on Android, install it as a PWA from Chrome)                        |
| Cursor for iOS      | Native iPhone and iPad app: start agents, follow them live, review and merge PRs, get push notifications                          |
| Slack               | Mention `@cursor` with a prompt                                                                                                   |
| GitHub or Bitbucket | Comment `@cursor` on a PR or issue (GitHub) or a PR (Bitbucket)                                                                   |
| Linear              | Delegate an issue to Cursor or mention `@Cursor` in a comment                                                                     |
| API and SDK         | `POST /v1/agents`, or `Agent.create({ cloud: ... })`                                                                              |

Before anyone can start a cloud agent, a Cursor account admin connects source control (GitHub Cloud or Enterprise Server, GitLab Cloud or Self-Hosted, Bitbucket Cloud, or Azure DevOps). Each user then connects their own Git account. Cloud Agents need a paid plan, and you set a spend limit the first time you use them; they are billed at API pricing for the selected model.

### Environment setup

Cursor's documentation is blunt about this: not configuring an environment for your cloud agents is like not giving your engineers a computer. An agent that can write code but cannot run tests or reach services cannot close the loop.

Two ways to configure an environment, both created from the Cloud Agents dashboard (**Environments**):

| Option                               | When to use                                                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Agent-driven setup** (recommended) | Cursor's agent installs dependencies, verifies the environment in a shared terminal you can watch, and creates the first Build, usually in under 10 minutes. Commit the result to `.cursor/environment.json` |
| **Dockerfile** (advanced)            | You need system packages, specific compiler versions, debuggers, or a different base image. Do not `COPY` the project; Cursor manages the workspace and checks out the right commit                          |

Cursor resolves the configuration for a repository or repo group in this order, first match wins:

1. `.cursor/environment.json` in the repository
2. A personal saved environment
3. A team saved environment

That gives predictable team defaults with per-user overrides for testing a new configuration before rolling it out.

#### `environment.json`

Commit `.cursor/environment.json` to keep the configuration in code. Snapshot-based:

```json
{
  "snapshot": "snapshot-20260212-00000000-0000-0000-0000-000000000000",
  "install": "npm install"
}
```

Dockerfile-based, referencing `.cursor/Dockerfile` and an install script:

```json
{
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },
  "install": "pnpm install && ./custom_script.sh",
  "start": "sudo service docker start",
  "terminals": [{"name": "web", "command": "pnpm dev"}]
}
```

Path behavior: `dockerfile` and `context` are relative to `.cursor`; omitting `context` defaults to `.cursor`, while `.`, `./`, and `..` are special-cased to mean the repository root. The `install` command runs from the project root. The full schema is published at `https://www.cursor.com/schemas/environment.schema.json`.

Three commands run at different phases:

| Command     | When it runs                   | Use it for                                                                                                               |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `install`   | During each Build              | Installing dependencies, generating code, compiling artifacts, warming disk caches. Must be idempotent and must complete |
| `start`     | At the start of each agent run | Starting Docker, databases, tunnels, and other services                                                                  |
| `terminals` | At the start of each agent run | App processes in `tmux` terminals shared between you and the agent                                                       |

Builds preserve disk state only. Running processes, exported shell variables, and in-memory caches do not survive into an agent run, so services belong in `start` or `terminals`, not `install`.

#### Secrets

Add secrets in the dashboard **Secrets** tab; they are injected as environment variables when an agent starts. Options that matter for unattended runs:

- **Environment-scoped secrets** apply only to agents using one environment (staging credentials, a repo group with different access).
- **Runtime Secrets** are redacted from the transcript, tool output, and commits and never reach the model.
- **Build secrets** are available during Builds for private registries; user secrets are only added at agent start and never become part of a shared snapshot.
- **AWS IAM roles**: set a `CURSOR_AWS_ASSUME_IAM_ROLE_ARN` secret and a trust policy with your team's external ID; Cursor sets `AWS_PROFILE=cursor-cloud-agent` and refreshes STS credentials.
- **OIDC tokens**: VMs can mint short-lived JWTs from a local socket to federate with AWS, GCP, Azure, or your own verifier without long-lived keys.
- **2FA logins**: store the TOTP secret and let the agent run `oathtool --totp -b "$TOTP_SECRET"`.

Secrets are injected at start; agents already running do not pick up new ones.

#### Cloud-specific instructions in `AGENTS.md`

Cloud agents read `AGENTS.md`. Add a dedicated section (Cursor suggests a title like `Cursor Cloud specific instructions`) for cloud-only setup and testing notes, and reference other files when it grows. See [Rules & AGENTS.md](./rules.md).

### Builds and snapshots

A **Build** is a bootable snapshot of a prepared environment. Cursor creates Builds ahead of runs so agents boot from a machine with repositories cloned and `install` already completed.

| Trigger              | When it runs                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Recurring            | On a regular schedule for every environment; skipped (in seconds, without running `install`) when nothing changed |
| Configuration change | When you save the environment configuration or change its secrets                                                 |
| Manual               | **Trigger build** in the Builds tab                                                                               |
| Agent-requested      | When an agent runs a test Build, for example during environment setup                                             |

What Builds give you:

- **Faster starts.** Clone and dependency work happen ahead of time; Cursor keeps pre-warmed copies of the active Build ready.
- **Reliable starts.** A failed Build never replaces the active one. Agents keep starting from the last successful Build while you debug.
- **Provenance.** Every run records the Build it started from, including the exact commit per repository.

Git freshness: default-branch runs start from the Build's recorded commit unless **Update stale builds** is on and the Build is older than the **Staleness threshold** (default 24 hours; `0` always pulls). Feature-branch runs start from the Build's disk and then check out the requested branch; if the branch changed dependencies, the agent gets your install command to refresh.

To debug a failed Build, open its logs in the **Builds** tab, or start an agent from the failed Build so it can inspect the machine in its failed state. The built-in Cursor Cloud MCP exposes `list-environment-builds`, `environment-build-logs`, `trigger-environment-build`, and `propose-environment-json` tools so you can delegate that investigation to an agent. Builds are included with Cloud Agents at no extra cost.

### Capabilities

| Capability                  | What it does                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Computer use**            | Each VM has a full desktop; the agent drives mouse and keyboard to start dev servers, open the browser, click through flows, and verify changes. Supported for Dockerfile repos on Debian/Ubuntu bases                                                                                                                                                                                                              |
| **Artifacts**               | Screenshots, videos, and log references attached to the PR. Opt in to embedding them in GitHub PR descriptions (**Allow posting artifacts to GitHub**); embedded artifacts use long unguessable public URLs because of GitHub's image proxy                                                                                                                                                                         |
| **Remote desktop control**  | Take over the agent's desktop to test the software yourself, then hand control back                                                                                                                                                                                                                                                                                                                                 |
| **MCP tools**               | Team and personal MCP servers over HTTP (recommended; credentials never enter the VM, calls are proxied) or stdio (runs inside the VM). SSE and `mcp-remote` are not supported. OAuth is per user                                                                                                                                                                                                                   |
| **Cursor Cloud MCP**        | Built-in diagnostics server: `run-info`, `environment-info`, `get-events`, `list-cloud-agents`, `batch-fetch-details`, Build tools, and environment setup actions. Non-admins only see their own runs                                                                                                                                                                                                               |
| **Subscriptions**           | The agent subscribes to an event source, ends its turn, and wakes when a matching event arrives as a follow-up in the same conversation: PR comments, reviews, and CI results (GitHub), thread replies and channel messages (Slack), issue changes (Linear), one-off or cron timers. Describe the wait in the prompt or use the built-in `/subscribe` skill. Bursts coalesce; a subscription lasts at most 180 days |
| **Automatic CI fixes**      | Cloud Agents try to fix failing GitHub Actions on PRs they created (Teams). They stop after a human commit, a follow-up message, a check already failing on the base, or 10 follow-ups. Toggle with `@cursor autofix off` / `on` on the PR                                                                                                                                                                          |
| **Hooks**                   | Command-based hooks from `.cursor/hooks.json` run in the cloud; see [Hooks in the cloud](#hooks-in-the-cloud)                                                                                                                                                                                                                                                                                                       |
| **Subagents**               | Built-in and custom [subagents](./subagents.md) work in Cloud Agents; MCP servers for cloud subagents come from the team configuration                                                                                                                                                                                                                                                                              |
| **Agent metadata and OIDC** | A local socket serves the agent ID, owner, current turn, and workspace as plain text, and mints OIDC tokens                                                                                                                                                                                                                                                                                                         |

Cloud Agents use a curated selection of models; you can pick the context window size for supported models. A larger window increases token usage.

### Hooks in the cloud

Cloud Agents run **command-based** hooks from `.cursor/hooks.json` in the repository; on Enterprise plans they also run team hooks and enterprise-managed hooks from the dashboard. Prompt-based hooks and user-level hooks (`~/.cursor/hooks.json`) are not available, because the VM has no access to your home directory and no auth wiring for prompt hooks.

| Runs in Cloud Agents                                                                                                                                                                                                                                        | Does not run                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `beforeShellExecution`, `afterShellExecution`, `beforeReadFile`, `afterFileEdit`, `preToolUse`, `postToolUse`, `postToolUseFailure`, `subagentStart`, `subagentStop`, `beforeSubmitPrompt`, `preCompact`, `afterAgentResponse`, `afterAgentThought`, `stop` | `sessionStart`, `sessionEnd`, `beforeMCPExecution`, `afterMCPExecution`, Tab hooks, `workspaceOpen` |

Hooks do not fire during early exploratory turns in a read-only environment; they start once the agent has a writable environment. Self-hosted workers run the same project hooks, and there `sessionStart` and `sessionEnd` fire when a session claims and releases the worker. See [Hooks](./hooks.md) for the configuration format.

### Sharing and follow-ups

Send an agent's URL to a teammate and they can open the run read-only: conversation, diff, and artifacts. They must be in the same Cursor team **and** have connected their own source control account with access to the repository; team membership alone is not enough. A team admin can enable **team follow-ups** so teammates can send follow-up messages and continue the work.

### Best practices

From Cursor's own guidance:

- **Set up the environment first.** Like a human developer, the agent does better work with a working environment.
- **Verify access.** Required secrets present (prefer OIDC over long-lived keys), egress allowlist covers what local development needs, and the repo is testable locally without unreachable external services. If a human cannot test it locally, neither can the agent.
- **Use skills and `AGENTS.md` to teach testing.** Cursor's own `AGENTS.md` lists how to run and debug the most-used services in its monorepo, and separate skills hold in-depth debugging procedures with clear "when to use" descriptions. Commit project skills, sync personal ones, or publish them to the team.
- **Use rules to enforce conventions** at user, team, and repo (`.cursor/rules/*.mdc`) level.
- **Give the agent tools** via MCP and custom CLIs, then **mold the tools to the agent**: Cursor built a custom CLI for running its microservices because models forgot arguments to raw `package.json` commands and got distracted by noisy build logs.

### Security overview

The controls that matter when an agent runs unattended:

| Area                 | What Cursor documents                                                                                                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Access**           | Agents reach code through the Cursor GitHub or GitLab App; access is inherited from the triggering user and never widened. Admins can lock Git organizations with Protected Git Scopes and exclude repos with a blocklist                                                          |
| **Isolation**        | Per-agent Firecracker-based microVMs in a separate AWS account from the rest of Cursor's production. Cursor employees do not have access to code in agent VMs                                                                                                                      |
| **Encryption**       | TLS 1.2+ in transit; AES-256 at rest with per-agent keys; Enterprise customer-managed keys (CMEK/BYOK)                                                                                                                                                                             |
| **Retention**        | Runtime workspace recycled after idle; VM snapshots deleted after 90 days of inactivity; conversation state kept until deleted (Delete Agent API, Enterprise retention policies)                                                                                                   |
| **Privacy**          | Runs use Privacy Mode; no training on code, prompts, or responses. Legacy Privacy Mode is not supported                                                                                                                                                                            |
| **Prompt injection** | Cloud Agents auto-run terminal commands, so contain the blast radius: network egress allowlists (lockable org-wide), Runtime Secrets redaction, `.cursorignore` for sensitive paths, draft PRs as the human-in-the-loop gate, and HSM-signed Ed25519 commits with a Verified badge |
| **Auditability**     | Session logs in the dashboard, attributed commits and PRs, Enterprise audit logs streamable to SIEM, webhook, or S3, and the Cursor Cloud MCP for run diagnostics                                                                                                                  |

Cursor's own framing: unattended agents in an isolated sandbox with egress restrictions can be tighter than a developer laptop with full internet and elevated privileges. Pair the controls with [hooks](./hooks.md) for policy enforcement and with [Bugbot & Agent Review](./review.md) to review agent output before it ships. See [Security & Run Modes](./permissions.md) for the local-side model.

### Mobile and web

Cursor for iOS runs on the same backend as cursor.com/agents and the desktop Agents Window. From a phone you can start agents on a Cloud machine, a Team Pool, or one of your My Machines, choose any cloud model (always at its maximum context window), follow the chat live and open subagent transcripts, review and merge PRs (squash, mark ready, update branch, auto-merge), attach photos or drawings in Design Mode, dictate prompts, pick MCP servers per run, and get push notifications and Live Activities for up to eight agents. Environments, secrets, MCP server management, automations, rules, and skills configuration stay on the web.

### Slack and Linear triggers

**Slack.** After an admin installs the Cursor app for Slack (Dashboard → Integrations), mention `@Cursor` with a prompt. Cursor detects the repository, model, base branch, or named environment from the message, recent activity, routing rules, channel defaults, and finally the default repository. Options can be natural or inline:

```text
@Cursor with opus, fix the login bug in backend-api
@Cursor env=Platform branch=dev model=opus autopr=false Fix the login bug
@Cursor pool=gpu retrain the embeddings model on the new dataset
```

| Option                          | Purpose                                                                    |
| ------------------------------- | -------------------------------------------------------------------------- |
| `repo`, `env`                   | Target repository or named multi-repo environment (`env` wins over `repo`) |
| `branch`, `model`               | Base branch and model                                                      |
| `autopr`                        | Enable or disable automatic PR creation                                    |
| `worker`, `pool`, `self_hosted` | Route to a My Machine, a Team Pool, or any of your pools                   |
| `channel`                       | Post agent updates in another channel                                      |

In a thread with an existing agent, `@Cursor [prompt]` adds a follow-up; `@Cursor agent [prompt]` forces a new agent. Agents read the whole thread for context, post status updates, and link the PR when done. `@Cursor settings` sets channel defaults; routing rules in the dashboard map keywords to repositories or environments. Only public channels are visible to Slack triggers for Automations.

**Linear.** Connect Linear from the dashboard (admin required). Assign an issue to **Cursor** or mention `@Cursor` in a comment; Cursor filters out non-development work automatically, shows live status in the issue, and opens a PR when done. Configure with `[repo=owner/repo] [branch=...] [model=...]` in the issue text, or with a `repo` label group whose child labels are `owner/repo`, applied to issues or projects. Linear triage rules can auto-delegate issues to Cursor (Linear currently requires a human assignee for rules to fire).

## Automations

Automations run Cloud Agents in the background on a schedule or in response to events. Think of them as the cron jobs and webhooks of your agent setup: no one types a prompt; the trigger does.

### Creating one

Create an automation in the Agents Window, at [cursor.com/automations](https://cursor.com/automations), from a template in the Cursor Marketplace, or by typing the built-in `/automate` skill in a local session and describing the workflow in plain language. Every path ends with the same five decisions:

1. **Trigger:** every hour, when a PR opens, when a Slack message arrives, and so on. An automation can have several triggers and runs when any fires.
2. **Prompt:** the instructions, written the way you would brief a cloud agent.
3. **Tools:** optional tools the agent may use, such as Send to Slack, Comment on Pull Request, or an MCP server.
4. **Repository:** none, one repository, or a multi-repo environment.
5. **Save and activate.**

The Automations page also hosts three Cursor-managed agents: Bugbot (PR review), Security Agents (vulnerability review and scanning), and PR Routing & Approval. See [Bugbot & Agent Review](./review.md).

### Triggers

| Source              | Triggers                                                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Schedule**        | Presets or a cron expression. May run with a delay but never early                                                                                                                                                                            |
| **GitHub**          | Core PR and push events (draft opened, PR opened, PR pushed, PR merged, push to branch, comment added) plus label changes, CI completed, issue comment, PR review comment, PR review submitted, review thread updated, workflow run completed |
| **GitLab**          | Core events plus label changed and MR approved                                                                                                                                                                                                |
| **Bitbucket Cloud** | Core events plus PR approved (no label or inline-comment triggers; Server and Data Center not supported)                                                                                                                                      |
| **Slack**           | New message in a public channel (top-level only unless you add a keyword or regex filter), emoji reaction, channel created                                                                                                                    |
| **Linear**          | Issue created, status changed, end of cycle                                                                                                                                                                                                   |
| **Sentry**          | Issue created, issue updated, any issue event                                                                                                                                                                                                 |
| **PagerDuty**       | Incident triggered, acknowledged, resolved, any incident event                                                                                                                                                                                |
| **Webhook**         | A private HTTP endpoint; POST to start a run. Save the automation first to get the URL and API key                                                                                                                                            |

PR triggers do not run on PRs from forks (the branch only exists on the fork, and running external code with the repo's permissions is unsafe); **PR merged** still runs from the merge commit. For Slack and cron triggers, Cursor defaults to no repository; source control triggers require one.

### Tools

| Tool                        | What it enables                                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pull request creation**   | On by default for repo-backed automations; opens PRs against the trigger's or environment's repos                                                                                                                                     |
| **Comment on pull request** | Top-level and inline comments; with approvals enabled, can approve, request changes, and dismiss reviews                                                                                                                              |
| **Request reviewers**       | Picks reviewers, using `git`, memory, and other tools to find domain experts                                                                                                                                                          |
| **Send to Slack**           | Post to a fixed channel or let the agent choose any public channel (grants read access to discover channels)                                                                                                                          |
| **Read Slack channels**     | Read-only access to public channels for extra context                                                                                                                                                                                 |
| **MCP server**              | Every tool the server exposes; only connect servers you trust with the automation's permissions                                                                                                                                       |
| **Memories**                | Persistent notes across runs of the same automation (`MEMORIES.md` by default), on by default, viewable and editable in the UI. Treat with caution when the automation handles untrusted input; a poisoned memory affects future runs |
| **Computer use**            | Included by default; ask for a screen recording after user-facing changes                                                                                                                                                             |

### Settings, permissions, and identity

- **Model:** choose per automation. Automations always use the model's maximum context window.
- **Repositories:** none (Slack, MCP, webhook, Linear, PagerDuty workflows that never edit code), single repository, or multi-repo environment.
- **Permissions and billing:** **Private** (you manage; billed to you), **Team Visible** (team can view; still your auth and your billing), **Team Owned** (admins manage; runs under the team's shared automations service account; billed to the team pool). Promoting to Team Owned changes the identity, so regenerate webhook API keys and reconfigure personal-OAuth MCPs afterward.
- **Identity on external services:** GitHub comments, approvals, and reviewer requests run as `cursor`; team-scoped automations open PRs as `cursor`, private ones as your GitHub account; Slack messages come from the Cursor bot.

### Writing automation prompts

Write them like instructions for a cloud agent run:

- Be specific about what to check, change, or produce.
- Reference the tools you enabled by name.
- Include decision rules for the different cases the trigger can produce.
- Set a quality bar for when to open a PR, comment, or do nothing.
- Describe the output format.

**Weak:**

```text
Look at new PRs and help out.
```

**Strong:**

```text
Trigger: Pull request opened (GitHub).

Review only the diff. Check for: missing tests for changed logic, unhandled
errors on new I/O paths, and any new dependency without a lockfile update.

If you find nothing above Medium severity, do nothing. Otherwise post ONE
top-level PR comment with findings grouped Critical / High / Medium, each with
file:line and a one-line fix. Never push commits. Never approve.
```

## Cloud Agents API and webhooks

The Cloud Agents API v1 (public beta) launches and manages cloud agents programmatically. It accepts Basic or Bearer auth with a user API key (Dashboard → API Keys) or a service account API key. The model splits work into a durable **agent** (conversation and workspace state) and per-prompt **runs**.

```bash
curl --request POST \
  --url https://api.cursor.com/v1/agents \
  -u YOUR_API_KEY: \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": { "text": "Add a README with setup instructions" },
    "model": { "id": "composer-2", "params": [{ "id": "fast", "value": "true" }] },
    "repos": [{ "url": "https://github.com/your-org/your-repo", "startingRef": "main" }],
    "autoCreatePR": true
  }'
```

Useful create-time fields: `mode` (`agent` or `plan`), `workOnCurrentBranch`, `autoCreatePR`, `skipReviewerRequest`, `envVars` (session-scoped, encrypted, beta), `mcpServers` (inline HTTP, SSE, or stdio definitions), `customSubagents` (up to 20, each with `name`, `description`, `prompt`, optional `model`), `env` (`cloud`, or `pool` / `machine` for self-hosted workers), and `agentId` for idempotent creates. Omit both `repos` and `env` for a no-repo agent.

Core endpoints:

| Endpoint                                                                | Purpose                                                                                                                            |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `POST /v1/agents`                                                       | Create an agent and enqueue its first run                                                                                          |
| `POST /v1/agents/{id}/runs`                                             | Follow-up prompt on an existing agent; one active run per agent (`409 agent_busy` otherwise); can override `mode` and `mcpServers` |
| `GET /v1/agents/{id}/runs/{runId}/stream`                               | Server-Sent Events: `status`, `assistant`, `thinking`, `tool_call`, `interaction_update`, `heartbeat`, `result`, `error`, `done`   |
| `POST /v1/agents/{id}/runs/{runId}/cancel`, `GET /v1/agents/{id}/usage` | Cancel a run; read token usage and cost                                                                                            |
| `GET /v1/agents/{id}/artifacts` and download                            | List and fetch screenshots, videos, and logs                                                                                       |
| Archive, unarchive, delete permanently                                  | Lifecycle; delete removes transcript and artifacts                                                                                 |
| Workers and pools                                                       | Register pools, list workers, watch and claim pending requests (self-hosted)                                                       |
| `GET /v1/models`, API key info, list repositories                       | Discovery                                                                                                                          |

**Webhooks.** The v1 API lists webhooks as coming soon; the legacy v0 API supports them. A webhook URL on agent creation receives HTTP POSTs for `statusChange` events when the agent reaches `ERROR` or `FINISHED`, with `X-Webhook-Signature` (`sha256=<hex>` HMAC-SHA256 over the raw body), `X-Webhook-ID`, `X-Webhook-Event`, and `User-Agent: Cursor-Agent-Webhook/1.0`. Verify the signature against the raw body, return 2xx quickly, expect retries on error responses, use HTTPS, and store raw payloads.

```json
{
  "event": "statusChange",
  "timestamp": "2024-01-15T10:30:00Z",
  "id": "bc_abc123",
  "status": "FINISHED",
  "source": {"repository": "https://github.com/your-org/your-repo", "ref": "main"},
  "target": {
    "url": "https://cursor.com/agents?id=bc_abc123",
    "branchName": "cursor/add-readme-1234",
    "prUrl": "https://github.com/your-org/your-repo/pull/1234"
  },
  "summary": "Added README.md with installation instructions"
}
```

For the v1 API, stream the run or poll `GET /v1/agents/{id}/runs/{runId}` instead of relying on webhooks. Rate limits and auth details are in the API overview.

## SDK

The Cursor SDK exposes the same agent that runs in the IDE, CLI, and web from your own code, with one interface over two runtimes: **local** (agent loop and filesystem in your process; inference is still Cursor-hosted) and **cloud** (Cursor-hosted VM with the repo cloned in). Run the built-in `/sdk` skill in Cursor to scaffold. End-to-end examples live in the [Cursor Cookbook](https://github.com/cursor/cookbook): CI auto-fix bots, bug triage workers, code-review passes, an agent kanban board.

TypeScript (`@cursor/sdk`, Node.js 22.13+):

```typescript
import {Agent} from '@cursor/sdk';

const agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: {id: 'composer-2.5'},
  cloud: {
    repos: [{url: 'https://github.com/your-org/your-repo', startingRef: 'main'}],
    autoCreatePR: true,
  },
});

const run = await agent.send('Add structured logging to the auth middleware');
for await (const event of run.stream()) {
  console.log(event);
}
```

Python (`cursor-sdk`, Python 3.10+):

```python
from cursor_sdk import Agent, CloudAgentOptions, CloudRepository

with Agent.create(
    model="composer-2.5",
    api_key="crsr_key",
    cloud=CloudAgentOptions(
        repos=[CloudRepository(url="https://github.com/your-org/your-repo", starting_ref="main")],
        auto_create_pr=True,
    ),
) as agent:
    print(agent.send("Add structured logging to the auth middleware").text())
```

Points that matter for automation:

- Authentication uses `CURSOR_API_KEY` (user or service account key). Billing follows the same pools and Privacy Mode as the IDE and shows under an SDK tag.
- Local runs approve tool calls automatically; there is no human-in-the-loop prompt. Gate with hooks (`beforeShellExecution`, `preToolUse`) or the sandbox option.
- Hooks are file-based only: commit `.cursor/hooks.json` to the repo the agent runs in. Cloud SDK agents load project hooks automatically (and team and enterprise hooks on Enterprise).
- MCP servers, subagents, and hooks resolve with the same precedence: per-send inline, then creation-time inline, then project files, then user files, then team or dashboard config.
- SDK-created cloud agents are hidden from the default agent list; use **Filter → Source → SDK** to see them. For other languages, the SDK Bridge exposes the same surface locally.

## Self-hosted machines

Self-Hosted Machines move tool execution (file edits, terminal commands, computer use, local MCP servers) to a machine you manage while Cursor still runs the agent loop, inference, and planning. Your team keeps using the same desktop, web, and mobile surfaces.

|             | My Machines                                                                                 | Team Pools                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **For**     | Personal workflows: a devbox, spare VM, or a machine with state you do not want to recreate | Shared capacity with service account auth and centrally managed images                                                            |
| **Plan**    | Personal credential (`agent login` or user API key)                                         | Cursor Enterprise, service account API key                                                                                        |
| **Routing** | Pick the machine per run; several agents can share it                                       | Register machines under a pool name; Cursor routes one agent per machine; a controller scales the pool                            |
| **Start**   | `agent worker start` after installing the CLI                                               | Same CLI, plus a worker controller or the Kubernetes template ([anysphere/k8s-workers](https://github.com/anysphere/k8s-workers)) |

Workers open a long-lived outbound HTTPS connection to `api2.cursor.sh` and `api2direct.cursor.sh` (and upload artifacts to an S3 bucket you can block); no inbound ports, public IPs, or VPN tunnels are needed. The full checkout and local credentials stay on your machine; file contents, terminal output, diffs, screenshots, and MCP results the agent needs are sent to Cursor. Use self-hosting when code or services are unreachable from outside your network, when you need special hardware (GPUs, Macs for iOS), or when your images do not fit a Cloud Agent Build. Otherwise Cursor recommends managed Cloud Agents with network allowlists and private connectivity (AWS PrivateLink, Cloudflare Tunnel, Tailscale in userspace mode). Personal skills are not copied to workers; keep skills in the repo or the worker image.

## Composing a repeatable workflow

Cursor gives you six primitives that all travel with the repository, which means the same workflow runs identically on your laptop, in a Cloud Agent, in an Automation, and from the SDK:

| Primitive                 | Location                           | Role in a workflow                                                                            |
| ------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| **Rules and `AGENTS.md`** | `.cursor/rules/*.mdc`, `AGENTS.md` | Always-on conventions, build and test commands, cloud-specific setup notes                    |
| **Skills**                | `.cursor/skills/<name>/SKILL.md`   | Named phases you can start with `/name`; each phase is a procedure with a defined output      |
| **Subagents**             | `.cursor/agents/*.md`              | Isolated workers for research, implementation, and verification; `readonly` where appropriate |
| **Hooks**                 | `.cursor/hooks.json`               | Deterministic guardrails and formatting that do not depend on the model remembering           |
| **Environment**           | `.cursor/environment.json`         | The machine the workflow runs on in the cloud                                                 |
| **Automations**           | Dashboard or `/automate`           | The trigger that starts the workflow without a person                                         |

### A Research-Plan-Implement workflow in Cursor primitives

The pattern separates _understanding_ from _deciding_ from _doing_, with artifacts and a human checkpoint between phases. Here it is with Cursor's building blocks.

**Phase 1: Research** (isolated, read-only). A skill that delegates to a read-only subagent so the exploration noise never reaches the main context:

```markdown
---
name: rpi-research
description: Researches feasibility of a proposed feature and writes RESEARCH.md. Use before planning any multi-file change.
disable-model-invocation: true
---

# Research

Delegate to the `researcher` subagent with the feature description from this
message. Then write `docs/rpi/RESEARCH.md` containing:

1. Existing code analysis: relevant files, patterns, integration points
2. Dependencies and compatibility with the current stack
3. Technical risks: complexity, performance, security
4. Effort estimate: small (hours), medium (days), large (weeks)
5. GO / NO-GO recommendation with justification

Do not write implementation code in this phase.
```

```markdown
---
name: researcher
description: Read-only codebase research for feasibility studies. Use when mapping how a feature would fit into the existing code.
model: inherit
readonly: true
---

Map the code paths relevant to the request. Return exact file paths, entry
points, existing patterns to reuse, and anything that would make the change
risky. Do not propose an implementation and do not edit files.
```

**Phase 2: Plan** (human checkpoint). Run in Plan mode so the agent drafts before it codes; from the API or SDK set `mode: "plan"` on the first run. The plan skill reads `RESEARCH.md` and produces `PLAN.md` with steps small enough to complete in one run, each with acceptance criteria. A person reviews the plan before anything is implemented. Locally, **Build in Parallel** on a plan runs independent steps at once while keeping dependent steps in order. See [Agent Modes](./modes.md).

**Phase 3: Implement** (one step per run, verified). The implement skill finds the first unchecked step in `PLAN.md`, implements it, runs the tests, marks the step done, and hands to a verifier:

```markdown
---
name: rpi-implement
description: Implements the next unchecked step from docs/rpi/PLAN.md and verifies it. Use to advance an approved plan.
disable-model-invocation: true
---

# Implement next step

1. Read `docs/rpi/PLAN.md`. Take the first step not marked `[x]`.
2. Implement it following the project rules. Run the relevant tests.
3. Delegate to the `verifier` subagent to confirm the step meets its acceptance criteria.
4. Only if verification passes, mark the step `[x]` and commit with a message naming the step.
5. Stop. Do not start the next step in this run.

If the step cannot be completed, explain why in PLAN.md under the step and stop.
```

**Guardrails as hooks.** Hooks run the same way on every step regardless of what the model decided, and command-based project hooks run in Cloud Agents:

```json
{
  "version": 1,
  "hooks": {
    "afterFileEdit": [{"command": ".cursor/hooks/format.sh"}],
    "beforeShellExecution": [
      {
        "command": ".cursor/hooks/block-destructive.sh",
        "matcher": "rm -rf|git push --force|drop table"
      }
    ],
    "subagentStop": [{"command": ".cursor/hooks/save-subagent-report.sh"}],
    "stop": [{"command": ".cursor/hooks/run-tests.sh", "loop_limit": 3}]
  }
}
```

**The trigger.** An Automation with a **Pull request label changed** trigger (label `rpi:approved`) and the prompt "Run `/rpi-implement` once. Push to the PR branch. Comment a summary of the step and its verification result." Each label application advances the plan by exactly one verified step, and the PR stays the human review surface. A **Push to branch** trigger on the PR branch, or a subscription to the PR's CI results, can pick up failures; the `/autopilot` built-in skill covers the merge-readiness loop once implementation is complete.

**Why this shape works in Cursor specifically:**

- Every artifact (`RESEARCH.md`, `PLAN.md`, hooks, skills, agents, environment) is in git, so Cloud Agents, Automations, SDK runs, and local sessions all see the same definitions.
- Read-only research and verification run as subagents, so the main run's context stays small enough to finish one step reliably.
- Hooks make formatting and destructive-command blocking independent of model judgment, including in the cloud.
- The environment and its Build are prepared ahead of time, so every run can actually execute the tests the verifier relies on.

### Other compositions

| Goal                    | Composition                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nightly codebase digest | Scheduled automation, no repository or one repository, Read Slack channels off, Send to Slack on, prompt asks for a short summary of merged PRs and open risks                             |
| Auto-triage failed CI   | GitHub **Workflow run completed** trigger, prompt investigates logs and either opens a fix PR or comments a diagnosis; a `verifier` subagent confirms the fix passes locally before the PR |
| Incident first response | PagerDuty **Incident triggered**, Sentry MCP connected, no repository, prompt gathers evidence and posts a structured summary to the incident channel; a human decides on changes          |
| Convention drift check  | Weekly schedule on one repository, a `readonly` reviewer subagent with the team's `.mdc` rules in context, PR comment tool only, quality bar "open a PR only for mechanical fixes"         |

## Safety in unattended runs

Unattended means nobody is there to say no to a bad command. Design for that:

- **Prefer draft PRs over direct pushes.** Keep `workOnCurrentBranch` false and let the PR be the gate. Never let an automation approve its own PRs unless a human has explicitly decided that is acceptable for a narrow class of changes.
- **Restrict egress.** Use **Default + allowlist** or **Allowlist only** for environments that hold real credentials, and lock the policy org-wide on Enterprise.
- **Redact what the model must not see.** Mark credentials as Runtime Secrets; add sensitive paths to `.cursorignore`.
- **Scope identity.** Use Team Owned automations with the shared service account for anything the team depends on; regenerate webhook keys and reconfigure MCP OAuth when promoting.
- **Block destructive commands with hooks, not prompts.** A `beforeShellExecution` hook with a matcher stops `rm -rf` and force pushes deterministically.
- **Treat memories and inbound content as untrusted.** Automation memories persist across runs and can be poisoned by malicious input; PR bodies, issue text, and Slack messages are prompt-injection vectors. Give the automation only the tools it needs and set a quality bar for "do nothing."
- **Bound the loop.** Use `loop_limit` on `stop` hooks, one plan step per run, and the built-in CI follow-up caps. Subscriptions expire after 180 days; do not rely on an agent waiting forever.
- **Review agent output with an agent.** Bugbot and Security Agents can review what Cloud Agents produce before a human spends time on it. See [Bugbot & Agent Review](./review.md).
- **Keep the environment testable.** If the verifier cannot run the tests in the VM, verification is theater. Check the Build logs before trusting a green run.

## Compared with Claude Code

| Topic                       | Cursor                                                                                                                              | Claude Code                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Unattended runtime          | Cloud Agents in Cursor-managed microVMs, or self-hosted workers; started from web, desktop, mobile, Slack, GitHub, Linear, API, SDK | Headless `claude -p` runs in your own CI or infrastructure, plus remote sessions                   |
| Event triggers              | Automations: cron, GitHub, GitLab, Bitbucket, Slack, Linear, Sentry, PagerDuty, webhooks                                            | Your CI system or scripts invoke Claude Code; hooks react to lifecycle events inside a session     |
| Environment definition      | `.cursor/environment.json` with Builds, snapshots, Dockerfiles, `install` / `start` / `terminals`                                   | Whatever the host CI or machine provides                                                           |
| Skills in workflows         | Plain `SKILL.md` procedures that delegate to subagents; no `context: fork`, arguments, or preloaded skills                          | Skills with `context: fork`, `$ARGUMENTS`, `allowed-tools`, and `skills:` preloaded into subagents |
| Deterministic guardrails    | `.cursor/hooks.json` command hooks run locally and in the cloud                                                                     | Hooks in `.claude/settings.json` with command, HTTP, MCP tool, prompt, and agent types             |
| Programmatic control        | Cloud Agents API v1 (agents and runs, SSE streaming), TypeScript and Python SDKs with local and cloud runtimes                      | Agent SDK and CLI flags                                                                            |
| Waiting for external events | Subscriptions (PR activity, CI, Slack, Linear, timers) wake the same conversation                                                   | Not a built-in concept; orchestrate from outside                                                   |

For the Claude Code side of composing skills, subagents, and hooks, see [Claude Code Workflows & Orchestration](../claude-code/workflows.md). For running several Cursor agents side by side locally, see [Parallel Agents & Worktrees](./parallel-agents.md), and for the general overview, [Cursor](../tools/cursor.md).
