---
sidebar_position: 8
sidebar_label: Skills
description: Codex skills are SKILL.md folders that package reusable workflows, scripts, and references Codex loads on demand via $skill mentions or implicit matching.
keywords: [Codex skills, SKILL.md, agent skills standard, .agents/skills, skill-creator, progressive disclosure, Record and Replay, custom prompts deprecated, Codex CLI]
---

# Skills

Skills are folders with a `SKILL.md` file that give Codex a repeatable way to do a specific kind of work: a release checklist, a review routine, a migration procedure, a documentation standard. Codex reads only the skill name and description up front and loads the full instructions when the skill is needed, so you can keep many playbooks available without paying for them in every turn. Skills build on the open [Agent Skills standard](https://agentskills.io), which is the same format Claude Code and other agents use.

Skills replace Codex custom prompts, which are deprecated (see [Custom prompts are deprecated](#custom-prompts-are-deprecated)).

## What is a skill?

A skill is a directory. The only required file is `SKILL.md`, which combines YAML frontmatter (`name` and `description`) with Markdown instructions. Optional sub-folders hold scripts, reference material, templates, and UI metadata:

```text
my-skill/
├── SKILL.md            # Required: frontmatter + instructions
├── scripts/            # Optional: executable code Codex runs during the workflow
├── references/         # Optional: documentation Codex reads only when needed
├── assets/             # Optional: templates, examples, icons
└── agents/
    └── openai.yaml     # Optional: display metadata, invocation policy, tool dependencies
```

A minimal `SKILL.md`:

```markdown
---
name: commit
description: Stage and commit changes in semantic groups. Use when the user wants to commit, organize commits, or clean up a branch before pushing.
---

1. Do not run `git add .`. Stage files in logical groups by purpose.
2. Group into separate commits: feat, test, docs, refactor, chore.
3. Write concise commit messages that match the change scope.
4. Keep each commit focused and reviewable.
```

Skills are the authoring format. When you want to distribute a skill beyond one repository, or bundle it with MCP servers, you package it in a [plugin](./plugins.md). Standalone skills work in the ChatGPT desktop app, Codex CLI, and the IDE extension.

## How Codex discovers and invokes skills

### Progressive disclosure

Codex uses three loading stages so skills cost almost nothing until they are used:

1. **Catalog**: at session start Codex sees each skill's `name`, `description`, and file path.
2. **Instructions**: when a skill is selected, Codex reads the full `SKILL.md`.
3. **Resources**: Codex opens files under `references/` or runs `scripts/` only when the instructions call for them.

The catalog has a budget: at most 2% of the model's context window, or 8,000 characters when the window size is unknown. When many skills are installed, Codex shortens descriptions first; for very large sets it may omit skills from the list and print a warning. You can raise the budget with `skills.max_context_tokens` in `config.toml` (explicit values are capped at 10,000 tokens). The budget applies only to the catalog; a selected skill's `SKILL.md` is always read in full.

### Explicit vs implicit invocation

| Method | How | When to use |
|---|---|---|
| Explicit `$` mention | Type `$` in the CLI or IDE composer and pick a skill, or write `$skill-name` in the prompt | You know which workflow you want; side-effecting workflows (deploy, publish) |
| `/skills` command | Run `/skills` in the CLI to list and select skills | Browsing what is installed |
| Plugin skill | `$plugin-name:skill-name` (for example `$codex-security:fix-finding`) | Skill shipped inside an installed plugin |
| Implicit | Codex picks a skill because your request matches its `description` | Everyday use; requires a well-written description |
| In ChatGPT | `@skill-name` | Same skills surfaced through the ChatGPT desktop app |

Implicit matching depends entirely on the `description`. Front-load the key use case and trigger words so the skill still matches when Codex shortens descriptions to fit the catalog budget.

You can turn implicit invocation off per skill with `policy.allow_implicit_invocation: false` in `agents/openai.yaml` (see [Optional metadata](#optional-metadata-agentsopenaiyaml)). Explicit `$skill` still works.

Codex detects skill changes automatically. If an edit or a newly installed skill does not appear, restart Codex.

## Where Codex loads skills

Codex reads skills from repository, user, admin, and system locations. For repositories it scans `.agents/skills` in **every directory from the current working directory up to the repository root**, so a monorepo can keep service-specific skills next to the service and shared skills at the root.

| Scope | Location | Suggested use |
|---|---|---|
| `REPO` | `$CWD/.agents/skills` | Skills relevant to the folder where you launched Codex (a microservice, a module) |
| `REPO` | `$CWD/../.agents/skills` (any parent folder) | Skills for a shared area of a nested repository |
| `REPO` | `$REPO_ROOT/.agents/skills` | Root skills available to everyone working in the repository |
| `USER` | `$HOME/.agents/skills` | Your personal skills, available in every repository |
| `ADMIN` | `/etc/codex/skills` | Machine or container-wide defaults: SDK scripts, automation, admin-curated skills |
| `SYSTEM` | Bundled with Codex | Built-ins such as `$skill-creator`, `$skill-installer`, `$plugin-creator`, and the plan skill |
| Plugin | Installed plugin bundle | Skills shipped with a plugin, invoked as `$plugin:skill` |

Notes:

- Codex follows symlinked skill folders, so you can link a shared skills repository into `~/.agents/skills`.
- If two skills share the same `name`, Codex does **not** merge them or apply a precedence rule; both appear in selectors. Give skills distinct names across scopes.
- Repo skills live under `.agents/`, not `.codex/`. The `.codex/` folder holds `config.toml`, `agents/`, `hooks.json`, and `rules/`.

:::tip
Commit `.agents/skills/` to source control. That is the whole sharing mechanism for team skills: a teammate clones the repository and the skills are there.
:::

### Enable or disable a skill without deleting it

Add `[[skills.config]]` entries to `~/.codex/config.toml` (or a project `.codex/config.toml`):

```toml
[[skills.config]]
path = "/Users/me/.agents/skills/docs-editor/SKILL.md"
enabled = false
```

Restart Codex after editing `config.toml`. The same key can be set inside a [custom agent file](./subagents.md) so a subagent sees a different skill set than the parent session.

## SKILL.md frontmatter

The Agent Skills standard keeps frontmatter small. Codex requires two fields:

| Field | Required | Purpose |
|---|---|---|
| `name` | Yes | Identifier used for `$name` invocation. Keep it lowercase, kebab-case, and unique across your scopes |
| `description` | Yes | Tells Codex exactly when the skill should and should not trigger. This is the primary tuning knob for implicit invocation |

Everything else (display name, icon, invocation policy, dependencies) lives in `agents/openai.yaml`, not in `SKILL.md`. Codex does not document Claude-style frontmatter keys such as `allowed-tools`, `context: fork`, `argument-hint`, or `$ARGUMENTS` substitution for skills; if you port a Claude Code skill, move tool restrictions to a [custom agent](./subagents.md) and pass arguments as plain text after the `$skill` mention.

**Weak description:**

```yaml
description: Helps with releases.
```

**Strong description:**

```yaml
description: Prepare a release from the current branch. Use when the user asks to cut a release, bump the version, write release notes, or tag a build. Do not use for hotfix branches; use $hotfix instead.
```

### Optional metadata: `agents/openai.yaml`

```yaml
interface:
  display_name: "Release Prep"
  short_description: "Version bump, changelog, and tag"
  icon_small: "./assets/small-logo.svg"
  icon_large: "./assets/large-logo.png"
  brand_color: "#3B82F6"
  default_prompt: "Prepare a release for the current branch"

policy:
  allow_implicit_invocation: false

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```

- `interface` controls how the skill appears in the ChatGPT desktop app skills picker.
- `policy.allow_implicit_invocation` defaults to `true`. Set it to `false` for workflows that should only run when someone types `$skill-name`.
- `dependencies.tools` declares MCP servers the skill needs. With `features.skill_mcp_dependency_install` (on by default) Codex can prompt to install and wire a missing server automatically. This is how a skill and an [MCP server](./mcp.md) are paired: the skill describes the workflow and names the tools, the server provides them.

## Scripts, references, and assets

- **`scripts/`**: CLI scripts Codex runs as part of the workflow (seed data, run a validator, normalize a file). In the instructions, tell Codex to **run** the script, not to read and paraphrase it. You pay tokens for the script's output, not its source. Prefer instructions over scripts unless you need deterministic behavior or external tooling.
- **`references/`**: longer documentation (API notes, style guides, decision records). Point to specific files from `SKILL.md` so Codex opens only what the current step needs.
- **`assets/`**: templates, example outputs, icons.

Keep `SKILL.md` itself short and imperative: explicit inputs, numbered steps, explicit outputs, and a verification step. Push detail into `references/`.

## Creating skills

### With `$skill-creator`

The bundled creator interviews you and writes the folder:

```text
$skill-creator Create a skill that reviews a pull request for missing tests and unhandled errors, then posts a summary as a PR comment with gh.
```

It asks what the skill does, when it should trigger, and whether it should stay instruction-only or include scripts (instruction-only is the default).

### Manually

```bash
mkdir -p .agents/skills/review-pr
```

Then write `.agents/skills/review-pr/SKILL.md` with `name`, `description`, and the steps. Codex picks the new skill up automatically; restart if it does not appear.

### With Record & Replay

Record & Replay (macOS, ChatGPT desktop app, requires Computer Use to be available and enabled) lets you **demonstrate** a workflow instead of describing it. Open **Plugins**, choose **+** then **Record a skill**, approve the recording, perform the task on your Mac, and stop when done. Codex inspects the captured steps and drafts a skill that states when to use the workflow, what inputs vary, the steps, and how to verify the result.

Good candidates: filing an expense, configuring an issue in a tracker with the right fields, publishing a build to an internal portal, downloading a recurring report. Tips from the official guidance:

- Keep the demonstration short and complete; stop when the task is done, not during unrelated cleanup.
- State the goal and the inputs that will vary before you start recording.
- Use realistic inputs but never secrets.
- After recording, edit the draft to call out hidden preferences (naming conventions, field defaults, decision points).

If your organization sets `[features].computer_use = false` in `requirements.toml`, Record & Replay is unavailable too.

### Installing curated skills

Use the bundled installer to pull curated skills into your local setup:

```text
$skill-installer linear
```

You can also ask the installer to fetch skills from another GitHub repository. The official [openai/skills](https://github.com/openai/skills) repository holds curated examples such as `gh-fix-ci`, `pdf`, and `linear`. Use `$skill-installer` for personal experimentation; for team distribution prefer committed `.agents/skills/` or a [plugin](./plugins.md).

## Custom prompts are deprecated

Before skills, Codex had **custom prompts**: Markdown files in `~/.codex/prompts/` invoked as `/prompts:name` with `$1`..`$9`, `$ARGUMENTS`, and `$NAME=value` placeholders. They still load, but they are deprecated. Skills are the replacement because they can be shared through the repository, invoked implicitly, and carry scripts and references.

| Custom prompt (deprecated) | Skill (current) |
|---|---|
| `~/.codex/prompts/draftpr.md` | `.agents/skills/draftpr/SKILL.md` (repo) or `~/.agents/skills/draftpr/SKILL.md` (user) |
| Invoked as `/prompts:draftpr` | Invoked as `$draftpr` or picked implicitly |
| Frontmatter `description`, `argument-hint` | Frontmatter `name`, `description` |
| `$1`, `$ARGUMENTS`, `$FILES=...` substitution | No documented substitution; write the instructions to read the user's request and ask for missing inputs |
| Explicit invocation only | Explicit or implicit |
| Local to your machine | Committed with the repo, or packaged in a plugin |
| Restart required after edits | Changes detected automatically |

**Before** (`~/.codex/prompts/draftpr.md`):

```markdown
---
description: Prep a branch, commit, and open a draft PR
argument-hint: [FILES=<paths>] [PR_TITLE="<title>"]
---

Create a branch named `dev/<feature_name>` for this work.
If files are specified, stage them first: $FILES.
Commit the staged changes with a clear message.
Open a draft PR on the same branch. Use $PR_TITLE when supplied.
```

**After** (`.agents/skills/draftpr/SKILL.md`):

```markdown
---
name: draftpr
description: Create a dev/ branch, commit the requested files, and open a draft PR. Use when the user asks to open a draft PR, push work for early feedback, or stage a branch for review.
---

1. Ask which files to include if the user did not name them; otherwise stage only those files.
2. Create a branch named `dev/<feature-name>` derived from the change.
3. Commit with a message that describes the change scope.
4. Open a draft PR with `gh pr create --draft`. Use the title the user gave; otherwise write a concise one.
5. Report the branch name and PR URL.
```

## Skills vs other customization layers

Codex has several complementary ways to shape behavior. Putting content in the wrong layer either wastes context or makes the guidance unreachable.

| | `AGENTS.md` | Skills | Custom agents | Hooks | MCP |
|---|---|---|---|---|---|
| Loaded | Every turn, up front | Catalog up front; body on demand | When spawned | On lifecycle events | Tool list up front; calls on demand |
| Driven by | Always on | Request matches description, or `$skill` | Delegation request | Deterministic event | Model tool call |
| Best for | Repo rules, build and test commands, routing guidance | Repeatable procedures, domain playbooks, helper scripts | Isolated work with its own model, sandbox, tools | Guardrails, logging, policy checks | External systems (issue trackers, docs, browsers) |
| Shared via | Repo | Repo (`.agents/skills`) or plugin | Repo (`.codex/agents`) | Repo (`.codex/hooks.json`) or plugin | `config.toml`, plugin |
| Page | [AGENTS.md & Memories](./agents-md.md) | This page | [Subagents](./subagents.md) | [Hooks](./hooks.md) | [MCP](./mcp.md) |

Rules of thumb:

- If it must apply to every task in the repo (never touch migrations, run `make lint`), it belongs in `AGENTS.md`. Keep that file small.
- If it is a procedure you run sometimes (release, review, scaffold), make it a skill.
- If the procedure is noisy or needs different permissions, have the skill tell Codex to delegate to a [custom agent](./subagents.md).
- If it must happen every time regardless of what the model decides (format on save, block secrets), use a [hook](./hooks.md).

Skills can request delegation. Codex follows `AGENTS.md` or skill instructions that ask for subagents, so a skill can say "spawn one `reviewer` agent per changed package and wait for all of them".

## Distributing skills

| Method | Reach | Notes |
|---|---|---|
| Commit `.agents/skills/` | Everyone who clones the repo | Simplest. Nested folders scope skills to parts of a monorepo |
| `~/.agents/skills/` | Just you, all repos | Personal habits and preferences |
| `/etc/codex/skills` | Every user on a machine or container image | Good for CI images and shared dev containers |
| Plugin | Any project, any surface that supports plugins | Bundle several skills, MCP servers, and hooks; install from a marketplace. See [Plugins](./plugins.md) |
| ChatGPT workspace skill | Workspace members | Managed through ChatGPT workspace permissions |

### Enterprise skill controls (summary)

Skills have three separate distribution models with separate administration boundaries:

- **ChatGPT workspace skills** are governed by workspace skill permissions and lifecycle controls.
- **Local filesystem skills** (repo, user, admin, system locations) are governed by filesystem distribution, local client configuration, and runtime permissions (sandbox and approvals).
- **Plugins** are governed by plugin availability and installation controls, plus the separate controls for each bundled capability (MCP server access, app permissions).

Moving a skill between these paths does not transfer ownership, sharing, or connector authorization. Admins who want to enforce skills or block features use `requirements.toml` and managed `config.toml`; see [Permissions & Sandbox](./permissions.md) and [CLI Flags & Configuration](./flags.md).

## Examples of good skills for development teams

Each example goes in `.agents/skills/<name>/SKILL.md`. Adjust commands to your stack.

### review-pr

```markdown
---
name: review-pr
description: Review the current branch against main for bugs, security risks, and missing tests. Use when the user asks for a code review, a PR review, or "what could break here". Read-only; never edit files.
---

1. Run `git diff main...HEAD --stat` and read every changed file.
2. For each file, look for logic errors, unhandled errors, injection risks, and behavior changes without tests.
3. Do not comment on formatting.
4. Report findings grouped by severity (Critical, High, Medium, Low) with `file:line` and a one-sentence fix.
5. End with a two-sentence overall verdict.
```

### gen-tests

```markdown
---
name: gen-tests
description: Write unit tests for a file or function using the project's existing test framework and style. Use when the user asks for tests, coverage, or "add tests for X".
---

1. Detect the test framework from `package.json`, `pyproject.toml`, `*.csproj`, or existing test files. Never introduce a new framework.
2. Read two existing test files to match naming, fixtures, and assertion style.
3. Cover: happy path, empty and null inputs, boundaries, and each error branch.
4. Run only the new test file. Fix failures in the tests, not in the code under test, unless the user asked for a fix.
5. Summarize what is covered and what is intentionally not.
```

### release-notes (with a script)

```markdown
---
name: release-notes
description: Generate a CHANGELOG entry from commits since the last tag in Keep a Changelog format. Use when the user asks for release notes, a changelog, or "what changed since the last release".
---

1. Run `scripts/commits-since-tag.sh` and use its output as the only source of commits. Do not run `git log` yourself.
2. Group entries under Added, Changed, Fixed, Removed, Security. Skip merge, version-bump, and CI-only commits.
3. Write entries in plain English, one line each, capitalized, no trailing period.
4. Print the new section only, ready to paste at the top of CHANGELOG.md.
```

```bash
#!/usr/bin/env bash
# .agents/skills/release-notes/scripts/commits-since-tag.sh
set -euo pipefail
tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$tag" ]; then
  git log "$tag..HEAD" --oneline --no-merges
else
  git log -30 --oneline --no-merges
fi
```

### migration-check (nested, backend only)

Place it at `services/api/.agents/skills/migration-check/SKILL.md` so it only appears when Codex is launched inside `services/api` or below:

```markdown
---
name: migration-check
description: Validate a new database migration for reversibility, locking risk, and data backfill safety before it is committed. Use when the user adds or edits a migration file.
---

1. Identify the new migration under `migrations/`.
2. Check: has a down migration; no `ALTER TABLE` on tables listed in `references/large-tables.md` without `CONCURRENTLY`; no data backfill in the same transaction as a schema change.
3. Run `make migrate-dry-run` and include its output.
4. Return PASS or FAIL with the exact line that fails each rule.
```

### Conventions skill with implicit invocation disabled

A skill that only makes sense when a human asks for it explicitly, such as a deploy checklist:

```yaml
# .agents/skills/deploy-staging/agents/openai.yaml
policy:
  allow_implicit_invocation: false
```

## What works well

- One job per skill. Split "review and fix and test" into three skills that can call for delegation.
- Descriptions that name the trigger phrases your team actually types, plus explicit "do not use for" boundaries.
- Imperative, numbered steps with a verification step at the end.
- Scripts for anything that must be identical every time (parsing, validation, environment checks).
- Nested `.agents/skills` folders in monorepos so the catalog stays small in each service.
- Testing implicit triggering: type three realistic requests and confirm the right skill loads; then adjust the description.

## What to avoid

- **Overlapping descriptions.** Two skills that both claim "review code" make implicit selection unreliable. Narrow each one.
- **Duplicate names across scopes.** Codex shows both and does not pick a winner.
- **Long `SKILL.md` bodies.** Move detail into `references/` so only the needed part is read.
- **Using skills as always-on rules.** If it must apply to every task, it belongs in `AGENTS.md`.
- **Relying on prompt substitution.** `$1` and `$ARGUMENTS` are custom-prompt features; skills should read the request and ask for missing inputs.
- **Putting secrets in skill files or recordings.** Skills are committed and shared.
- **Expecting `.codex/skills` to work.** Repo and user skills are discovered under `.agents/skills` and `~/.agents/skills`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Skill never triggers implicitly | Description too vague or missing trigger words | Rewrite the description; test with realistic prompts |
| Skill not listed in `/skills` | Wrong folder (for example `.codex/skills`), file not named `SKILL.md`, or missing `name`/`description` | Move to `.agents/skills/<name>/SKILL.md`; fix frontmatter; restart Codex |
| Description appears truncated | Catalog budget reached | Shorten low-value descriptions, raise `skills.max_context_tokens` (max 10,000), or disable unused skills with `[[skills.config]]` |
| Two entries with the same name | Same `name` in different scopes | Rename one; Codex does not merge or prioritize |
| Plugin skill missing | Session started before install | Start a new session; check the plugin is enabled in `/plugins` |
| Script fails | Not executable or dependency missing | `chmod +x`, document requirements in `SKILL.md` |
| Record & Replay not visible | Not on macOS, Computer Use disabled, or `computer_use = false` in `requirements.toml` | Check the desktop app settings or ask your admin |

## Compared with Claude Code

Both tools implement the Agent Skills standard, so a `SKILL.md` folder is largely portable. The differences are in locations, frontmatter, and invocation.

| | Codex | Claude Code |
|---|---|---|
| Repo location | `.agents/skills/<name>/SKILL.md`, scanned from CWD up to repo root | `.claude/skills/<name>/SKILL.md` |
| User location | `~/.agents/skills` | `~/.claude/skills` |
| Explicit invocation | `$skill-name`, `/skills` | `/skill-name` |
| Frontmatter | `name`, `description`; extras in `agents/openai.yaml` | Many keys: `allowed-tools`, `context: fork`, `model`, `arguments`, `disable-model-invocation`, and more |
| Disable implicit use | `policy.allow_implicit_invocation: false` in `openai.yaml` | `disable-model-invocation: true` in frontmatter |
| Argument substitution | Not documented for skills | `$ARGUMENTS`, `$0`, named `arguments` |
| Same-name conflicts | Both shown, no precedence | Enterprise > personal > project > plugin |
| Catalog budget | 2% of context (or 8,000 chars), cap 10,000 tokens via `skills.max_context_tokens` | 1% of context by default via `skillListingBudgetFraction` |
| Skill creation helpers | `$skill-creator`, `$skill-installer`, Record & Replay | `skill-creator` plugin, `claude plugin validate` |
| Preload into subagents | Set `skills.config` in the agent's TOML to enable or disable skills for that agent | `skills:` list in agent frontmatter injects full bodies |

See [Claude Code Skills](../claude-code/skills.md) for the Claude Code side, and the [Codex overview](../tools/codex.md) for installation and basics.
