---
sidebar_position: 15
sidebar_label: Bugbot & Agent Review
description: Use Agent Review for in-editor review of local changes and Bugbot for automated PR review, with BUGBOT.md rules, effort levels, Autofix, and Security Agents.
keywords:
  [
    Cursor Bugbot,
    Agent Review,
    AI code review,
    pull request review,
    BUGBOT.md,
    review rules,
    Bugbot Autofix,
    Security Agents,
    PR routing,
    /review-bugbot,
  ]
---

# Bugbot & Agent Review

Cursor has two review layers. **Agent Review** runs a dedicated code review on your local changes from inside Cursor, before anything leaves your machine. **Bugbot** reviews pull requests on GitHub, GitLab, Bitbucket, or Azure DevOps, leaves inline comments with explanations and fix suggestions, and can hand fixes straight back to Cursor. Both read the same `.cursor/BUGBOT.md` rule files, so one set of review instructions covers the whole path from working tree to merged PR. Security Agents and PR Routing & Approval extend the same pipeline for teams.

## Agent Review (local changes)

Agent Review is the in-editor review. It looks at the diff you have produced locally and reports issues in the agent window.

### Setup

1. Open **Cursor Settings**
2. Go to **Agents**
3. Find **Agent Review** and configure your preferences

Starting in Cursor 3.11, the setting moves to **Git & PRs** > **Pull Requests**. You can leave it manual or have it run automatically after every commit.

### Three ways to run it

| Trigger                               | What it reviews                                     | When to use                                                                 |
| ------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| **Automatic** (enabled in settings)   | Runs after every commit                             | You want a gate on every commit without thinking about it                   |
| `/agent-review` in the agent input    | The current changes, on demand                      | You finished a chunk of agent work and want a second look before committing |
| **Source Control tab** → Agent Review | All local changes compared against your main branch | Catching issues across the full branch, not only the latest edit            |

### Review depth

| Depth     | Speed | Cost | Best for                                                |
| --------- | ----- | ---- | ------------------------------------------------------- |
| **Quick** | Fast  | Low  | Small diffs, formatting changes, a fast sanity check    |
| **Deep**  | Slow  | High | Complex logic, security-sensitive code, large refactors |

Agent Review reads repository rules from `BUGBOT.md` files, so anything you write for Bugbot (below) also shapes local reviews.

### Related in-agent review skills

Two further skills run a review from the agent input before you push, available in Cursor 3.7+ and at [cursor.com/agents](https://cursor.com/agents) (CLI support is listed as coming soon):

| Skill              | Runs                                         |
| ------------------ | -------------------------------------------- |
| `/review-bugbot`   | A Bugbot review of your branch               |
| `/review-security` | A Security Agent review of your branch       |
| `/review`          | The general review entry point covering both |

By default these review every change relative to the base branch, committed and uncommitted. Ask for uncommitted changes only when you want narrower feedback. They compare against your default base branch; if yours is not the default, name it in the prompt.

`/review-bugbot` stores the Git patch ID of the diff it reviewed. When Bugbot on your SCM later sees a PR with the same patch ID, it skips the remote review and leaves a comment saying it already reviewed that diff. Run `/review-bugbot`, fix what it finds, open the PR, and you are not billed twice for the same code.

## Bugbot (pull request review)

Bugbot analyzes PR diffs and leaves comments with explanations and fix suggestions. It runs automatically on each PR update or when triggered manually.

### How it comments

- **Automatic reviews** on every PR update (by default only the changes since the last Bugbot review; see Incremental reviews below).
- **Manual trigger**: comment `cursor review` or `bugbot run` on any PR.
- **Reads existing PR comments** (top-level and inline) as context, so it does not duplicate what a human reviewer already said and can build on prior feedback.
- **Fix in Cursor** links open the issue directly in Cursor; **Fix in Web** links open it at [cursor.com/agents](https://cursor.com/agents).
- Each finding carries a severity (`high`, `medium`, and so on) and can be marked resolved.

### Setup

1. Go to the [Cursor dashboard](https://cursor.com/dashboard/integrations), open the **Integrations** tab, and connect your repository provider: GitHub (including Enterprise Server), GitLab (including Self-Hosted), Bitbucket (including Data Center), or Azure DevOps Services.
2. Follow the provider setup flow.
3. Open [Bugbot in Automations](https://cursor.com/automations/from-cursor/bugbot) and enable it on specific repositories.

On individual plans Bugbot runs only on PRs you author. On Team and Enterprise plans it runs for all contributors to enabled repositories, regardless of team membership.

### CI check statuses

Bugbot publishes a status per review run: a check named `Cursor Bugbot` on GitHub, a build status with key `cursor-bugbot` on Bitbucket, and a status with context `cursor-bugbot/review` on Azure DevOps.

| Conclusion | Meaning                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| `success`  | No issues found and no unresolved Bugbot comments from earlier runs                                                       |
| `neutral`  | Issues found (the default when Bugbot reports findings), or the run was cancelled by a newer commit, or an internal error |
| `failure`  | Issues found and the check is configured to fail on unresolved issues                                                     |

:::warning
Requiring the `Cursor Bugbot` check in branch protection only guarantees Bugbot _ran_. Findings default to `neutral`, which does not block a merge. If fail-on-unresolved-issues is available for your organization, enable it so unresolved findings produce `failure`. Bugbot never emits `skipped`.
:::

When Autofix is enabled, GitHub may show a separate `Cursor Bugbot Autofix` check that only uses `success` or `neutral`.

### Settings

| Setting                         | Scope                                | Effect                                                                                                                 |
| ------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Enable per repository           | Individual, Team, Enterprise         | Turns Bugbot on or off for a repo                                                                                      |
| Allow/deny lists for reviewers  | Team, Enterprise admins              | Controls who can consume Bugbot                                                                                        |
| **Run only when mentioned**     | Personal override                    | Skips automatic runs; `cursor review` / `bugbot run` still work                                                        |
| **Run only once** per PR        | Personal or installation             | Reviews the first push, skips subsequent commits                                                                       |
| **Enable reviews on draft PRs** | Personal override (Team, Enterprise) | Includes drafts in automatic reviews                                                                                   |
| **Incremental Review**          | Automations                          | On by default: review only changes since the previous Bugbot review. Turn off to review the full PR diff on every push |
| **Effort level**                | Automations (usage-based plans)      | Low, Default, High, or Smart (see below)                                                                               |

Team members can override installation defaults for their own PRs.

### Effort levels

Effort controls how long Bugbot reasons per review. Higher effort can find more bugs at more cost and time. Effort levels are available only on usage-based Bugbot plans.

| Level       | Tradeoff                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Low**     | Optimizes for cost, quality close to Default; cheaper but slower                                |
| **Default** | Optimizes for efficiency and speed; may find fewer bugs                                         |
| **High**    | More reasoning time; more expensive and slower, may find more bugs                              |
| **Smart**   | You describe in natural language when to use Low, Default, or High, and Cursor picks per review |

### Autofix

Bugbot Autofix spawns a Cloud Agent to fix the bugs a review found, pushes the fix, and comments on the original PR with the results.

| Mode                                | Behavior                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------- |
| **Use Installation Default**        | Follow the organization setting                                             |
| **Off**                             | No automatic fixes; use the manual **Fix in Cursor** / **Fix in Web** links |
| **Create New Branch** (recommended) | Push fixes to a new branch                                                  |
| **Commit to Existing Branch**       | Push fixes to the PR branch, capped at 3 attempts per PR to prevent loops   |

Autofix uses your **Default agent model** from Settings → Models (falling back to the team default, then the system default). It requires on-demand usage pricing and storage enabled (not Legacy Privacy Mode), and is billed as Cloud Agent usage at your plan rates.

### Billing (brief)

Bugbot moved from per-seat to usage-based billing with the May 2026 pricing update. Per the help center, an average run costs between $1.00 and $1.50 depending on PR size and complexity.

- **Individual plans**: Bugbot bills first from included usage, then from on-demand usage if enabled. If on-demand is off, Bugbot pauses until the next cycle.
- **Teams**: reviews are charged from on-demand usage, which you enable in the dashboard.
- Existing customers moved at their first renewal after June 8, 2026, or could migrate early for pro-rated credit.

Dry-run API reviews (analysis without posting) are billed like normal reviews. Check the [pricing page](https://cursor.com/pricing#bugbot) for current rates.

### Troubleshooting Bugbot

1. Comment `cursor review verbose=true` or `bugbot run verbose=true` on the PR. Bugbot posts detailed logs, a table of which rules loaded (flagging any truncated or omitted), and a request ID.
2. Check that Bugbot has repository access in Automations.
3. Verify the provider integration is installed and enabled for that repository.

Include the request ID when reporting to support.

## Writing review rules

Bugbot and Agent Review are guided by three rule sources, merged into one review-rules block per run in this order: **Team Rules → project `.cursor/BUGBOT.md` (including nested files) → learned rules → manual rules**.

| Source            | Where                                 | Who edits                                                                                   | Scope                                                            |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Team rules**    | Bugbot Automations dashboard          | Team admins                                                                                 | Every enabled repository in the team                             |
| **Project rules** | `.cursor/BUGBOT.md` files in the repo | Anyone with commit access                                                                   | Root file always; nested files when reviewing files beneath them |
| **Learned rules** | Bugbot repository rules dashboard     | Generated from your team's GitHub activity, or taught inline with `@cursor remember [fact]` | Per repository, optional path globs                              |
| **Manual rules**  | Bugbot repository rules dashboard     | You, per repository                                                                         | Optional path globs such as `src/components/**`                  |

:::note
Cursor project rules (`*.mdc` files in `.cursor/rules/`) do **not** apply to Bugbot runs. If you want a coding convention enforced in review, it has to live in `.cursor/BUGBOT.md` or in the Automations dashboard. See [Rules & AGENTS.md](./rules.md) for how `.cursor/rules/` shapes the agent itself.
:::

### `.cursor/BUGBOT.md` layout

Bugbot always includes the root `.cursor/BUGBOT.md`, then adds any further `BUGBOT.md` files it finds while walking upward from each changed file:

```text
project/
  .cursor/BUGBOT.md          # Always included (project-wide rules)
  backend/
    .cursor/BUGBOT.md        # Included when reviewing backend files
    api/
      .cursor/BUGBOT.md      # Included when reviewing API files
  frontend/
    .cursor/BUGBOT.md        # Included when reviewing frontend files
```

### Limits

- Each rule is truncated at 30,000 characters.
- All rules combined are capped at 100,000 characters per review; beyond that some rules may be omitted. Required team rules are prioritized over non-required ones.
- `bugbot run verbose=true` shows exactly which rules made it into a run.

### What good rules look like

Write rules as conditions and actions the reviewer can check mechanically. The official examples follow the pattern "if the diff matches X, then add a Bug with this title and body, label it, and optionally suggest a fix."

**Weak:**

```text
Make sure code is secure and well tested.
```

**Strong:**

```text
If the PR modifies files in {server/**, api/**, backend/**} and there are no changes in {**/*.test.*, **/__tests__/**, tests/**}, then:
- Add a blocking Bug titled "Missing tests for backend changes"
- Body: "This PR modifies backend code but includes no accompanying tests. Please add or update tests."
- Apply label "quality"
```

**Strong (security):**

```text
If any changed file contains the string pattern /\beval\s*\(|\bexec\s*\(/i, then:
- Add a blocking Bug with title "Dangerous dynamic execution" and body:
  "Usage of eval/exec was found. Replace with safe alternatives or justify with a detailed comment and tests."
- Assign the Bug to the PR author.
- Apply label "security".
```

**Strong (style, non-blocking, with an auto-resolve condition):**

```text
If any changed file contains /(?:^|\s)(TODO|FIXME)(?:\s*:|\s+)/, then:
- Add a non-blocking Bug titled "TODO/FIXME comment found"
- Body: "Replace TODO/FIXME with a tracked issue reference, e.g., `TODO(#1234): ...`, or remove it."
- If the TODO already references an issue pattern /#\d+|[A-Z]+-\d+/, mark the Bug as resolved automatically.
```

A practical starting `.cursor/BUGBOT.md`:

```markdown
# Review rules

## Always check

- Every new API endpoint validates its input with the shared schema helpers in src/validation/.
- Database migrations in src/db/migrations/ are never edited after they are merged; flag any modification as blocking.
- No secrets or tokens in source. Flag anything matching /(api[_-]?key|secret|token)\s*[:=]\s*["'][^"']+["']/i as blocking.

## Do not flag

- Formatting-only changes covered by Prettier.
- Generated files under src/generated/.
```

### Rule analytics

Each rule in the dashboard reports **Issues found**, **PRs reviewed**, **Accepted issues**, and **Acceptance rate**. A rule with a low acceptance rate is generating noise: tighten its condition or delete it.

## Security Agents (brief)

Security Agents are Cursor-managed agents that scan for security bugs and vulnerabilities. They run on the Automations platform and require Cloud Agents; the docs note Security Agents require a team or enterprise plan.

| Agent                     | Trigger                               | Purpose                                                                       |
| ------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| **Security Reviewer**     | Git-based triggers (PR and MR events) | Catch vulnerabilities during code review, before merge                        |
| **Vulnerability Scanner** | Cron schedule                         | Scan the codebase at rest for pre-existing issues and things PR review missed |

Each agent has built-in security checks you can toggle, custom instructions for project-specific expectations, and tools or MCPs (at least one is required) for routing findings to Slack, an issue tracker, or another system. Usage is charged to the team pool under a shared service account, so it does not affect any individual's usage. Analytics track vulnerabilities found, issues fixed, and resolution rate. Configure them in [Automations](https://cursor.com/automations/from-cursor/security), or run one locally with `/review-security`.

## PR Routing & Approval (brief)

**PR Routing & Approval** (documented at the `approval-agents` URL in the official docs) assigns reviewers based on code ownership and commit history and can approve low-risk PRs when your criteria are met. It does not replace a full code review.

Key behavior from the official docs:

- **AI reviewer awareness**: with Bugbot Review Context or Security Review Context enabled, it waits for those checks and uses their findings. If either reports findings that need human review, it will not approve.
- **Risk scoring**: enable **Use Risk Score** and set **Maximum Risk Threshold**; PRs above the threshold are never auto-approved.
- **Policy files**: for each changed file it looks for `APPROVAL_POLICY.md` (exact basename only) in that directory and every ancestor. The closest file wins for files beneath it. An optional `.cursor/approval-policies/ROUTING.md` (a YAML list of `product`, `boundary`, `policies` entries) routes areas to policies.
- **Tamper protection**: if a PR changes a policy or routing file, the agent uses the base-branch version and never lets the PR relax its own review requirements.
- **Precedence**: applicable policy files override the custom prompt, risk thresholds, and reviewer guidance. Conflicts resolve to the more specific policy, or the stricter one when specificity is unclear.
- Triggers are PR opened, PR pushed/updated, and PR commented (regex match). At least one primary action (**Request Reviewers** or **Approve PR**) must be enabled. Non-admin team members can view but not edit.

Configure it in [Automations](https://cursor.com/automations/from-cursor/pr-routing-and-approval).

## What works well

- **Review locally first.** `/agent-review` or `/review-bugbot` before you push means fewer round trips on the PR and, thanks to patch-ID sync, no duplicate Bugbot charge for the same diff.
- **Put conventions in `.cursor/BUGBOT.md`, commit it.** It travels with the repo, applies to Agent Review and Bugbot, and nested files keep backend rules out of frontend reviews.
- **Write rules as condition → action.** Include the path globs, the regex if there is one, the title, whether it blocks, and the label.
- **Use `@cursor remember`** when a reviewer explains a convention in a PR thread. It becomes a learned rule without a dashboard trip.
- **Match effort to risk.** Low for docs and config repos, High for payment or auth code, Smart when one repo mixes both.
- **Enable fail-on-unresolved-issues** if you rely on branch protection. Otherwise the check is informational.
- **Prefer Autofix to a new branch.** The PR author reviews the fix like any other change, and the 3-attempt cap on commit-to-existing-branch mode never comes into play.
- **Watch acceptance rate.** Rules below a sensible threshold are costing review attention; rewrite or retire them.

## What to avoid

- **Expecting `.cursor/rules/*.mdc` to affect reviews.** It does not. Agent rules and review rules are separate files on purpose.
- **Treating `neutral` as a pass.** It is Bugbot's default when it _finds_ issues.
- **Dumping a style guide into `BUGBOT.md`.** Rules are truncated at 30,000 characters each and 100,000 combined. Long prose crowds out the rules that matter and may be omitted silently. Run `verbose=true` to check.
- **Letting Bugbot be the only reviewer.** PR Routing & Approval explicitly does not replace human review, and Bugbot findings are suggestions with a severity, not a verdict.
- **Commit-to-existing-branch Autofix on shared branches.** Fixes land on the branch without a review step. Use **Create New Branch**.
- **Running Bugbot with Incremental Review off on huge PRs.** You pay for the full diff on every push. Keep incremental on unless a review missed context from earlier commits.

## Compared with Claude Code

| Concern                            | Cursor                                                                          | Claude Code                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Local review of your changes       | `/agent-review` (Quick or Deep), `/review-bugbot`, `/review-security`           | `/code-review [level] [--fix] [--comment]` and `/security-review`, see [Commands](../claude-code/commands.md)            |
| Hosted PR review bot               | Bugbot on GitHub, GitLab, Bitbucket, Azure DevOps; comments, CI status, Autofix | `/code-review --comment` posts findings as GitHub PR comments; `/code-review ultra` runs a deep multi-agent cloud review |
| Review rules file                  | `.cursor/BUGBOT.md` (root plus nested), team rules, learned rules               | Project `CLAUDE.md`, `.claude/rules/`, and reviewer [subagents](../claude-code/subagents.md) such as `code-reviewer`     |
| Fix a finding in the editor        | **Fix in Cursor** / **Fix in Web** links, or Autofix via Cloud Agent            | `/code-review --fix` applies findings in the current session                                                             |
| Security scanning at rest          | Security Agents: Vulnerability Scanner on a cron                                | No built-in scheduled scanner; `/security-review` is on-demand per branch                                                |
| Reviewer routing and auto-approval | PR Routing & Approval with `APPROVAL_POLICY.md`                                 | Not a Claude Code feature                                                                                                |
| Billing                            | Usage-based per review (roughly $1.00 to $1.50 per average run)                 | Part of your Claude Code usage; `ultra` includes 3 free runs on Pro/Max                                                  |
