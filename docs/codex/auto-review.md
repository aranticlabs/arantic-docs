---
sidebar_position: 6
sidebar_label: Auto-review
description: Use Codex Auto-review to route sandbox-boundary approval requests through a reviewer agent instead of stopping for a human on every escalation.
keywords:
  [
    Codex Auto-review,
    approvals_reviewer,
    auto_review,
    Approve for me,
    reviewer agent,
    sandbox escalation,
    guardian policy,
    approval policy,
    Codex security,
  ]
---

# Auto-review

Auto-review replaces manual approval **at the sandbox boundary** with a separate reviewer agent. The main Codex agent keeps running inside the same sandbox, with the same approval policy and the same filesystem and network limits. The only thing that changes is who answers the approval request when Codex wants to cross that boundary: you, or a reviewer agent that applies a written risk policy. In the ChatGPT desktop app and IDE extension it appears as **Approve for me**; in `config.toml` it is `approvals_reviewer = "auto_review"`.

:::warning
Auto-review is a reviewer swap, not a permission grant. It does not expand writable roots, enable network access, or weaken protected paths, and it is not a deterministic security guarantee. Keep the sandbox boundary in place and treat the reviewer as one more layer, not the layer.
:::

## How it works

1. The main agent works inside `read-only` or `workspace-write`.
2. When it needs to cross the sandbox boundary (write outside the workspace, reach a blocked network destination, run a command a rule marks `prompt`, call a side-effecting tool), it requests approval.
3. With `approvals_reviewer = "auto_review"`, Codex routes that request to a reviewer agent instead of pausing for a person.
4. The reviewer decides whether the action should run and returns a rationale. It rates risk: low- and medium-risk actions can proceed when policy allows, critical-risk actions are denied, and high-risk actions need enough user authorization and no matching deny rule.
5. Approved actions continue. Denied actions come back to the main agent with the rationale and a stronger instruction to find a materially safer path or stop and ask you.

The reviewer sees a compact transcript plus the exact approval request: your messages, surfaced assistant updates, relevant tool calls and outputs, and the proposed action. It can run read-only checks to gather missing context, but rarely does. It does not see hidden assistant reasoning.

## What gets reviewed and what does not

Auto-review only evaluates requests that would otherwise pause for a human:

- Shell or exec tool calls that request escalated sandbox permissions
- Network requests blocked by the current sandbox or policy
- File edits outside the allowed writable roots
- MCP or app tool calls that require approval because of their annotations or configured approval mode
- Computer Use access to a new website or domain

Anything already allowed inside the sandbox runs **without** review. If a command can execute under the active `sandbox_mode`, or a tool call stays inside policy, the main agent continues. App-level Computer Use approvals still surface directly to the user.

Two consequences follow:

- A network destination on your allowlist never triggers review on its own. If an in-sandbox action must still be reviewed, add a [rule](./permissions.md#rules-execpolicy) with `decision = "prompt"` or set the MCP tool's approval mode to `prompt`.
- With `approval_policy = "never"`, `:danger-full-access`, or `--yolo` there is no boundary-crossing request, so there is nothing for the reviewer to see. Auto-review requires an interactive approval policy (`on-request` or a granular policy that still surfaces the relevant category).

## What the reviewer blocks

The default policy is designed to deny actions such as:

- Sending private data, secrets, or credentials to untrusted destinations
- Probing for credentials, tokens, cookies, or session material
- Broad or persistent security weakening
- Destructive actions with a significant risk of irreversible damage

The full policy lives in the open-source repository: [policy_template.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy_template.md) and [policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md). Prompt-build, review-session, and parse failures fail closed. Timeouts are reported separately, and the action still does not run.

## Denials, timeouts, and the circuit breaker

An explicit denial is not an ordinary sandbox error. Codex hands the rationale to the main agent together with instructions to:

- not pursue the same outcome through a workaround, indirect execution, or policy circumvention
- continue only with a materially safer alternative
- otherwise stop and ask the user

**Circuit breaker.** In the current open-source implementation, Auto-review interrupts the turn after `3` consecutive denials or `10` denials within a rolling window of the last `50` reviews in the same turn. Any non-denial resets the consecutive counter. When the breaker trips, Codex emits a warning and aborts the turn rather than letting the agent loop on escalation attempts.

**Timeouts** are surfaced separately from denials, and the main agent is told that a timeout alone is not proof the action was unsafe.

**Overriding a denial.** Run `/approve` in the CLI to open the **Auto-review Denials** picker and select one recent denied action to retry. Codex keeps up to 10 recent denials per task. The approval is narrow: it covers that exact action, for one retry, in the same context, and the retry still goes through Auto-review. The reviewer sees your explicit override as context but can deny again if policy says users cannot override that class of action.

## Enabling and configuring

### CLI and IDE (config.toml)

```toml
approval_policy = "on-request"
approvals_reviewer = "auto_review"
sandbox_mode = "workspace-write"
```

For one session:

```bash
codex --sandbox workspace-write --ask-for-approval on-request -c approvals_reviewer=auto_review
```

With permission profiles instead of `sandbox_mode`:

```toml
approval_policy = "on-request"
approvals_reviewer = "auto_review"
default_permissions = ":workspace"
```

### ChatGPT desktop app

1. Open **Settings > General** and turn on **Auto-review** under **Permissions**. This makes **Approve for me** available in the permissions menu; it does not switch the current chat.
2. Pick **Approve for me** from the permissions control beneath the composer.

Selecting an approved Daybreak model in the desktop app (including via `/model`) switches the permissions control to **Approve for me** automatically when that mode is available for your account and allowed by organization policy. Before you enable **Full Access** for an approved security model, the app shows a model-specific warning that recommends **Approve for me** instead. Model selection never overrides managed requirements.

Reviews appear in the desktop app as automatic review items with a status such as Reviewing, Approved, Denied, Aborted, or Timed out, often with the assessed risk level and user-authorization judgment.

### Customizing the reviewer policy

You can replace the tenant-specific section of the reviewer policy locally:

```toml
[auto_review]
policy = """
PASTE THE COMPLETE ACTIVE REVIEWER POLICY HERE FIRST.

## Environment Profile
- Trusted internal destinations: github.com/acme, artifacts.acme.internal.

## Tenant Risk Taxonomy and Allow/Deny Rules
- Treat uploads to unapproved file-sharing services as high risk.
- Deny actions that expose credentials or private source code to untrusted destinations.
"""
```

`[auto_review].policy` **replaces** the current tenant policy; it does not merge. Copy the complete default policy first, keep every existing rule, then add yours. The built-in review instructions and response format still apply. If you cannot access the current policy, do not override it.

### Per-app reviewer

App (connector) tool approvals can use a different reviewer than the rest of the session:

```toml
[apps._default]
approvals_reviewer = "user"

[apps.some-app-id]
approvals_reviewer = "auto_review"
```

When omitted, apps inherit the top-level `approvals_reviewer`.

### Managed configuration

Administrators control Auto-review from `requirements.toml`:

```toml
allowed_approval_policies = ["on-request"]
allowed_approvals_reviewers = ["auto_review"]   # require it; add "user" to allow manual approval too
allowed_sandbox_modes = ["read-only", "workspace-write"]
default_permissions = ":workspace"

guardian_policy_config = """
## Environment Profile
- Trusted internal destinations include github.com/my-org and internal CI systems.

## Tenant Risk Taxonomy and Allow/Deny Rules
- Deny actions that expose credentials or private source code to untrusted destinations.
"""

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
```

Managed `guardian_policy_config` takes precedence over a user's local `[auto_review].policy`. Excluding `danger-full-access` and `never` from the allowlists matters: full access removes the boundary the reviewer depends on. For browser actions, `browser_use.disable_auto_review = true` or an origin policy with `auto_review = "deny"` restricts automatic review; this controls approval handling, not model safety monitoring.

## Comparison with other approval setups

| Setup                            | Config                                                                 | Who answers boundary crossings                                   | Sandbox   |
| -------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- | --------- |
| Ask for approval (default)       | `approval_policy = "on-request"`, `approvals_reviewer = "user"`        | You                                                              | Unchanged |
| **Approve for me / Auto-review** | `approval_policy = "on-request"`, `approvals_reviewer = "auto_review"` | Reviewer agent                                                   | Unchanged |
| Never ask                        | `approval_policy = "never"`                                            | Nobody; blocked actions fail                                     | Unchanged |
| Granular                         | `approval_policy = { granular = {...} }`                               | You or the reviewer for enabled categories; others auto-rejected | Unchanged |
| Full access                      | `--yolo`, or `danger-full-access` plus `never`                         | Nobody; nothing is blocked                                       | Removed   |

Auto-review also differs from **safety monitoring**, which some models include in Codex and ChatGPT Work. Monitoring runs asynchronously over the whole task and can pause it after the fact; Auto-review evaluates individual actions before they run. An action Auto-review approved can still belong to a task that monitoring later pauses.

## Reducing review volume

If mundane actions keep hitting the reviewer, fix the boundary rather than teaching the reviewer to wave them through:

- Add narrow `writable_roots` for scratch directories or neighboring repositories you intentionally use.
- Add precise [prefix rules](./permissions.md#rules-execpolicy) such as `["cargo", "test"]` or `["pnpm", "run", "lint"]`. Avoid broad prefixes like `["python"]` or `["curl"]`; they erase the very boundary Auto-review guards.
- Review past traffic first. Session transcripts, including Auto-review sessions, are kept under `~/.codex/sessions` by default, so you can ask Codex to summarize which escalations recur before changing policy.

## Availability

| Surface               | How to enable                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Codex CLI             | `approvals_reviewer = "auto_review"` in `config.toml` or `-c approvals_reviewer=auto_review`; `/approve` handles overrides |
| IDE extension         | **Approve for me** in the permissions control beneath the composer                                                         |
| ChatGPT desktop app   | Enable **Auto-review** in **Settings > General > Permissions**, then choose **Approve for me**                             |
| Managed organizations | Availability follows `allowed_approvals_reviewers`; a disallowed mode appears disabled                                     |

Auto-review makes extra model calls, so it adds to Codex usage. Admins can constrain it with `allowed_approvals_reviewers`.

## Caveats

- **Only boundary crossings are reviewed.** Actions inside the sandbox are never seen by the reviewer. Design the sandbox first.
- **It can be wrong.** The reviewer is a model applying a written policy and can make mistakes, especially in adversarial or unusual contexts.
- **Fail-closed by design.** Build, session, and parse failures deny the action. Timeouts also leave the action unexecuted.
- **Overrides are narrow.** `/approve` grants one retry for one exact action and still runs through review.
- **Policy replacement, not merge.** Both `[auto_review].policy` and `guardian_policy_config` replace the tenant section wholesale.
- **Cost.** Reviews are additional model calls and count toward usage.

For the research rationale and evaluation results, see the [Alignment Research post on Auto-review](https://alignment.openai.com/auto-review/).

## Compared with Claude Code

- Claude Code's [Auto Mode](../claude-code/auto-mode.md) is a **permission mode** that runs a classifier over shell and network tool calls; Codex Auto-review is a **reviewer setting** layered on top of the existing sandbox and `on-request` approval policy.
- Claude's classifier evaluates actions that would otherwise run under a mode's rules; Codex's reviewer evaluates only actions that already require an approval prompt. Reads and workspace edits skip the classifier in Claude; in Codex, anything the sandbox permits skips review.
- Both have circuit breakers: Claude pauses auto mode after 3 consecutive or 20 total blocks per session; Codex interrupts the turn after 3 consecutive denials or 10 within the last 50 reviews per turn.
- Claude customizes the classifier with `autoMode.environment`, `allow`, `soft_deny`, and `hard_deny` arrays that can splice in `"$defaults"`; Codex uses a Markdown policy (`[auto_review].policy` or managed `guardian_policy_config`) that replaces the tenant section wholesale.
- Claude's `PermissionDenied` hook can request a retry; Codex offers `/approve` for a one-time, still-reviewed retry.
- Enterprise opt-out: `permissions.disableAutoMode` in Claude managed settings versus `allowed_approvals_reviewers` in Codex `requirements.toml`.
