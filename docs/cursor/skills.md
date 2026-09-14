---
sidebar_position: 8
sidebar_label: Skills
description: Cursor skills are SKILL.md folders that package workflows, scripts, and references the agent loads on demand, following the open Agent Skills standard.
keywords:
  [
    Cursor skills,
    SKILL.md,
    Agent Skills standard,
    .cursor/skills,
    create-skill,
    migrate-to-skills,
    Custom Modes,
    progressive disclosure,
    skills vs rules,
    team skills,
  ]
---

# Skills

Skills are folders with a `SKILL.md` file that teach Cursor's Agent how to perform a specific kind of task: deploying to staging, running a security audit, following your team's TDD playbook. Cursor discovers them at startup, shows their descriptions to the model, and loads the full instructions only when a skill is relevant or when you invoke it with `/skill-name`. Because skills are plain files, they live in git, travel with the repository, and work with any agent that implements the [Agent Skills](https://agentskills.io) open standard.

This page covers what skills are in Cursor, where they live, the `SKILL.md` format, how they are discovered and invoked, how to create and migrate them, how teams distribute them, and how they compare with Claude Code skills.

## What are skills?

Cursor's documentation describes skills with four properties:

| Property               | Meaning in practice                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portable**           | A skill written for Cursor works in any agent that supports the Agent Skills standard (and Cursor reads skills written for Claude Code and Codex) |
| **Version-controlled** | Skills are files. Commit them, review them in PRs, or install them from a GitHub repository                                                       |
| **Actionable**         | A skill can ship scripts, templates, and reference documents that the agent runs or reads with its tools                                          |
| **Progressive**        | Only the description is always in context; the body and supporting files load when needed                                                         |

A skill is different from a rule. Rules are short, persistent guidance ("use TypeScript for all new files") that Cursor injects at the start of the context. Skills are longer procedures ("deploy to staging: run tests, build, deploy, verify") that stay dormant until they match. See [Skills vs rules](#skills-vs-rules) below and the [Rules & AGENTS.md](./rules.md) page.

## Skill directories and scopes

Cursor loads skills automatically from these locations:

| Location                                | Scope                                                            | Committed to git? |
| --------------------------------------- | ---------------------------------------------------------------- | ----------------- |
| `.cursor/skills/`                       | Project (this repository)                                        | Yes               |
| `.agents/skills/`                       | Project (vendor-neutral folder)                                  | Yes               |
| `~/.cursor/skills/`                     | User, all projects on this machine                               | No                |
| `~/.agents/skills/`                     | User, all projects on this machine (vendor-neutral)              | No                |
| `.claude/skills/`, `.codex/skills/`     | Project (compatibility with Claude Code and Codex)               | Yes               |
| `~/.claude/skills/`, `~/.codex/skills/` | User (compatibility with Claude Code and Codex)                  | No                |
| Built-in skills                         | Managed by Cursor, appear alongside your own                     | N/A               |
| Plugin skills                           | Installed with a [plugin](./plugins.md) at user or project scope | Via the plugin    |

Two practical consequences:

- If your team already maintains `.claude/skills/` for Claude Code, Cursor picks those up without copying. Use `.agents/skills/` when you want one folder that several tools read.
- User-level skills stay on your machine. They are **not** copied to Cloud Agents, remote SSH sessions in the Agents Window, or self-hosted workers unless you sync them (see [Personal skills and Cloud Agents](#personal-skills-and-cloud-agents)). On self-hosted workers, keep skills in the repository or bake them into the worker image.

### Folder layout

Each skill is a folder that contains a `SKILL.md` file. Optional subfolders hold scripts, references, and assets:

```text
.cursor/
└── skills/
    └── deploy-app/
        ├── SKILL.md
        ├── scripts/
        │   ├── deploy.sh
        │   └── validate.py
        ├── references/
        │   └── REFERENCE.md
        └── assets/
            └── config-template.json
```

| Directory     | Purpose                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `scripts/`    | Executable code the agent runs (any language the environment can execute) |
| `references/` | Additional documentation loaded on demand                                 |
| `assets/`     | Static resources such as templates, images, or data files                 |

### Nested and category folders

Cursor walks the skills root recursively, so you can group skills by category, team, or domain. The category folder is purely organizational; the skill's identity comes from the folder that directly contains `SKILL.md`:

```text
.cursor/skills/
├── shipping/
│   ├── land-it/SKILL.md              # invoked as /land-it
│   └── careful-merge-conflicts/SKILL.md
├── debugging/
│   └── using-datadog-mcp/SKILL.md
└── workflow/
    └── tdd/SKILL.md                  # invoked as /tdd
```

### Monorepo scoping

A `.cursor/skills/` (or `.agents/skills/`) folder anywhere inside the repository is discovered, and skills in a nested project directory are automatically scoped to files inside that directory:

```text
my-monorepo/
├── .cursor/skills/              # repo-wide skills, available everywhere
│   └── land-it/SKILL.md
└── apps/
    └── web/
        └── .cursor/skills/      # only surfaced when working under apps/web/
            └── deploy-web/SKILL.md
```

You do not need to set `paths` on a nested skill; the directory placement does the scoping.

## SKILL.md format

Every skill is a Markdown file with YAML frontmatter followed by the instructions:

```markdown
---
name: my-skill
description: Short description of what this skill does and when to use it.
---

# My Skill

Detailed instructions for the agent.

## When to Use

- Use this skill when...
- This skill is helpful for...

## Instructions

- Step-by-step guidance for the agent
- Domain-specific conventions
- Best practices and patterns
- Use the ask questions tool if you need to clarify requirements with the user
```

### Frontmatter fields

| Field                      | Required | Description                                                                                                                                                                                                                    |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                     | Yes      | Skill identifier. Lowercase letters, numbers, and hyphens only. Must match the parent folder name                                                                                                                              |
| `description`              | Yes      | What the skill does and when to use it. The agent reads this to decide relevance, so it is the main tuning knob                                                                                                                |
| `paths`                    | No       | Glob patterns that scope the skill to matching files. Accepts a list or a comma-separated string. When set, the skill is only surfaced while the agent reads or edits matching files                                           |
| `disable-model-invocation` | No       | When `true`, the skill is only included when you type `/skill-name`. The agent never applies it on its own                                                                                                                     |
| `icon`                     | No       | Icon shown on the badge when the skill runs as a Custom Mode. Defaults to a lightning icon. Names come from Cursor's icon set (`code`, `terminal`, `bug`, `git-branch`, `book-open`, `beaker`, `shield`, `rocket`, and others) |
| `color`                    | No       | Badge color as a Custom Mode: `default`, `green`, `cyan`, `blue`, `purple`, `magenta`, `orange`, `yellow`, `red`, or `brand`                                                                                                   |
| `metadata`                 | No       | Arbitrary key-value mapping for your own tooling                                                                                                                                                                               |

The legacy `globs` field is still accepted as a fallback for older skills; new skills should use `paths`.

:::note
Cursor's skill frontmatter is deliberately small. There is no `allowed-tools`, `model`, `context: fork`, `arguments`, or `hooks` field, and no `$ARGUMENTS` substitution or inline shell injection in the skill body. If you need a different model or an isolated context, delegate to a [subagent](./subagents.md) from within the skill's instructions instead.
:::

### Scoping a skill to files with `paths`

```markdown
---
name: react-component-patterns
description: Conventions for writing React components in this codebase.
paths:
  - '**/*.tsx'
  - 'packages/ui/**/*.ts'
---

# React component patterns

- Named exports only, no default exports
- Co-locate the module CSS file next to the component
- Keep components under 200 lines; extract subcomponents into the same directory
```

A single comma-separated string also works: `paths: "**/*.py, scripts/**/*.py"`. Leave `paths` unset for a skill that should be available regardless of which files are open.

## Discovery and invocation

When Cursor starts, it discovers skills from all the directories above and presents their names and descriptions to the Agent. Skill descriptions are part of the system context, and the context breakdown tray (click the context ring next to the prompt input) shows a **Skills** category so you can see what they cost.

There are four ways a skill enters a conversation:

| Method            | How                                                                                                             | Lifetime                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Automatic**     | The agent decides the skill is relevant based on `description` (and `paths`, if set)                            | Loaded for the task at hand                                    |
| **Slash command** | Type `/` in the chat input, search the skill name, press Enter                                                  | Attaches to one message and fades as the conversation moves on |
| **Custom Mode**   | Pick the skill from the `/` menu and press Option+Enter (Mac) or Alt+Enter (Windows), or select **Use as Mode** | Stays in context on every turn until you exit the mode         |
| **@ mention**     | Type `@` and select the skill to attach it as context                                                           | One message                                                    |

Set `disable-model-invocation: true` when a skill has side effects (deploying, publishing, sending messages) and should only ever run because a human typed `/skill-name`. This makes the skill behave like a traditional slash command.

### Using a skill as a Custom Mode

A one-message `/skill` is right for one-shot tasks. For skills that describe _how to work_ rather than _what to do once_ (a code-review checklist, a TDD playbook, a migration procedure you will follow across many files), use the skill as a Custom Mode. An active mode shows a badge in the chat input, and the skill stays in context for as long as the agent works, even across hours-long sessions. Custom Modes are available in the Agents Window and the [CLI](./cli.md).

```markdown
---
name: tdd
description: Test-driven development playbook for this repo. Use when implementing features test-first.
icon: beaker
color: green
---

# TDD playbook

1. Write a failing test that describes the behavior. Run it and confirm it fails for the right reason.
2. Write the minimum implementation to make it pass.
3. Refactor with the test green. Run the full suite for the touched package.
4. Repeat. Never write production code without a failing test first.
```

### Built-in Cursor skills

Cursor ships a set of built-in skills that are managed by Cursor and appear alongside your own. Run any of them by typing `/` and selecting the name; the agent may also use some of them automatically when your request clearly matches.

| Skill                     | What it does                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `/automate`               | Creates Cursor Automations triggered by schedules, Slack messages, GitHub events, and other sources |
| `/autopilot`              | Monitors a pull request and addresses feedback, conflicts, failing checks, and follow-up work       |
| `/canvas`                 | Creates interactive React artifacts that render alongside the conversation                          |
| `/create-hook`            | Creates Cursor hooks and updates `hooks.json` for agent lifecycle events                            |
| `/create-rule`            | Creates Cursor rules with the appropriate scope and instructions                                    |
| `/create-skill`           | Creates Agent Skills, including their structure and `SKILL.md` files                                |
| `/create-subagent`        | Creates custom subagents with focused roles and delegation instructions                             |
| `/cursor-blame`           | Investigates AI-authored changes and the prompts that produced them                                 |
| `/loop`                   | Runs a prompt or skill repeatedly at a specified interval                                           |
| `/migrate-to-skills`      | Converts eligible dynamic rules and slash commands into Agent Skills                                |
| `/review`                 | Selects and runs the appropriate code-review agent                                                  |
| `/review-bugbot`          | Reviews code for likely bugs and regressions with Bugbot                                            |
| `/review-security`        | Reviews code for security vulnerabilities with Security Review                                      |
| `/sdk`                    | Helps you build applications and integrations with the Cursor SDK                                   |
| `/shell`                  | Runs the provided text as a literal shell command                                                   |
| `/split-to-prs`           | Splits large changes into smaller pull requests                                                     |
| `/statusline`             | Configures the Cursor CLI status line                                                               |
| `/update-cli-config`      | Updates Cursor CLI settings in `~/.cursor/cli-config.json`                                          |
| `/update-cursor-settings` | Finds and updates the appropriate Cursor or VS Code setting                                         |

The built-in skills are a good model for your own: each has a narrow purpose and a description that says exactly when it applies. The [Commands & Shortcuts](./commands.md) page covers the rest of the `/` menu.

## Progressive disclosure

Skills are designed so that the agent pays for detail only when it needs it:

1. **Always in context:** the `name` and `description` of every discovered skill.
2. **Loaded when relevant or invoked:** the body of `SKILL.md`.
3. **Loaded when the body points at them:** files under `references/` and `assets/`.
4. **Executed, not read:** scripts under `scripts/`. The agent pays tokens for what the script prints, not for its source.

Keep `SKILL.md` focused on the procedure and move long reference material (API tables, style guides, schema dumps) into `references/`. Tell the agent in the body which reference to open and when.

**Weak:** a 900-line `SKILL.md` that inlines the whole internal API guide.

**Strong:**

```markdown
---
name: internal-api-client
description: Use when calling or extending the internal Orders API from application code.
---

# Internal Orders API

Follow the steps below. Open `references/endpoints.md` only when you need the
exact request or response shape for an endpoint; do not read it up front.

1. Find the existing client in `src/api/orders/`.
2. Add new calls next to similar ones and reuse the shared error mapper.
3. Run `scripts/check-contract.sh` and paste the summary into your final message.
```

### Including scripts

Reference scripts with paths relative to the skill root. The agent reads the instructions and runs the referenced scripts when the skill is used:

```markdown
---
name: deploy-app
description: Deploy the application to staging or production. Use when deploying code or when the user mentions deployment, releases, or environments.
disable-model-invocation: true
---

# Deploy App

## Pre-deployment validation

Run `python scripts/validate.py` and stop if it reports any failure.

## Usage

Run `scripts/deploy.sh <environment>` where `<environment>` is `staging` or `production`.
Never run the production deploy without the user confirming in this conversation.
```

Scripts can be written in any language the agent's environment can execute. Make them self-contained, print clear error messages, and exit non-zero on failure so the agent notices.

## Creating skills

### With the built-in `/create-skill`

Type `/create-skill` in Agent chat and describe what you want. The built-in skill walks through naming, structure, and saving the new `SKILL.md` in your skills directory (for a project skill, `.cursor/skills/<name>/`). You can also tell it to convert an existing rule: `/create-skill turn @my-rule into a skill`.

### Manually

```bash
mkdir -p .cursor/skills/review-migration
```

Then create `.cursor/skills/review-migration/SKILL.md`:

```markdown
---
name: review-migration
description: Reviews a database migration for reversibility, locking risk, and data safety. Use when a PR or diff touches migrations.
paths:
  - 'db/migrations/**'
  - '**/migrations/**/*.sql'
---

# Migration review

Check every migration in scope for:

1. A working `down` (or documented reason it cannot be reversed).
2. Column type changes done in-place. Flag them; the pattern is add, backfill, swap, drop.
3. Long-running statements without a lock timeout on large tables.
4. Missing indexes for new foreign keys.

Report findings grouped by severity (blocking, should-fix, nit) with file and line.
```

Verify it appears under **Customize → Skills** in the sidebar. Skills you add from a project or plugin show up in the **Agent Decides** section, next to rules.

### Writing good descriptions

The `description` is the only thing the agent sees before deciding to load a skill. Matching is semantic, so it has to overlap the way people actually phrase requests.

**Weak:**

```yaml
description: Helper for tests.
```

**Strong:**

```yaml
description: Generates unit tests that match the existing framework and style. Use when the user asks to "add tests", "cover this function", or "write specs" for a file or module.
```

Put the primary use case first, then add two or three trigger phrases people say out loud. If a skill never fires, add the wording you used to the description rather than lengthening the body.

## Migrating rules and commands to skills

Cursor 2.4 added a built-in `/migrate-to-skills` skill that converts existing artifacts into skills:

| Source                                                                           | Converted? | Result                                                                         |
| -------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| Dynamic rules (`alwaysApply: false` or unset, no `globs`, "Apply Intelligently") | Yes        | Standard skill with `name` and `description`                                   |
| Slash commands (user-level and workspace-level)                                  | Yes        | Skill with `disable-model-invocation: true`, preserving explicit-only behavior |
| Rules with `alwaysApply: true`                                                   | No         | Keep as rules; they are always-on by design                                    |
| Rules with `globs`                                                               | No         | Keep as rules (or rewrite by hand as a skill with `paths`)                     |
| User rules (settings, not files)                                                 | No         | Not on the file system                                                         |

To migrate:

1. Type `/migrate-to-skills` in Agent chat.
2. The agent identifies eligible rules and commands and converts them.
3. Review the generated skills in `.cursor/skills/` and delete the originals you no longer need.

### Skills vs rules

Keep this split in mind when deciding where new guidance belongs:

|                 | Rules                                                         | Skills                                                               |
| --------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Purpose**     | Short coding guidelines and constraints                       | Multi-step workflows and procedures                                  |
| **Length**      | A few lines to a few hundred lines                            | Often longer, with detailed steps and supporting files               |
| **How applied** | Included as context in every (or every matching) conversation | Loaded when relevant, or invoked with `/skill-name` or `@skill-name` |
| **Example**     | "Use TypeScript for all new files"                            | "Deploy to staging: run tests, build, deploy, verify"                |
| **File**        | `.cursor/rules/*.mdc`, `AGENTS.md`                            | `.cursor/skills/<name>/SKILL.md`                                     |

Use a rule when a short instruction is enough. Use a skill when the agent needs a detailed, repeatable process. See [Rules & AGENTS.md](./rules.md) for the rule side.

## Team distribution

There are three ways to get a skill to other people, and they are not interchangeable:

| Method                              | Who gets it                                                                 | How                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Commit to the repo**              | Everyone who clones, plus Cloud Agents and self-hosted workers on that repo | Put skills in `.cursor/skills/` (or `.agents/skills/`) and commit              |
| **Publish to the team marketplace** | Teammates who choose to install it (Teams and Enterprise)                   | **Customize → Skills**, open a personal skill, choose **Publish**              |
| **Ship in a plugin**                | Anyone who installs the plugin                                              | Bundle skills in an Agent Plugin or Cursor Plugin; see [Plugins](./plugins.md) |

### Publishing a personal skill

On Teams and Enterprise plans, members can publish a skill from `~/.cursor/skills/` to the team's **Default** marketplace. Cursor packs the skill into a plugin, stores a copy in a repository hosted for your team, and lists it in the marketplace. After publishing:

- Installs are opt-in. Teammates find and install the skill themselves; the author gets it automatically.
- Use **Sync changes** to push updates and **Unpublish** to take it back to your machine.
- One skill becomes one plugin, named after the skill. Other skills it references are not bundled.
- Admins can turn off **Allow Members to Publish** in **Dashboard → Plugins → Default marketplace → Marketplace Settings**. When off, only admins publish; existing published skills stay available.

### Installing skills from GitHub

To import skills from a repository you have access to, open **Customize** in the sidebar, go to **Rules**, click **Add Rule**, select **Remote Rule (GitHub)**, and paste the repository URL. Review the imported files before relying on them; a skill from a third-party repo is code your agent will follow.

### Personal skills and Cloud Agents

Personal skills in `~/.cursor/skills/` run only on your machine until you sync them:

1. Open **Settings → Agents**.
2. Under **Context and Tools**, turn on **Sync Skills for Cloud Agents** and confirm.

Cursor copies the contents of `~/.cursor/skills/` so your [Cloud Agents](./cloud-agents.md) can use them. Synced skills stay private to you. Only `~/.cursor/skills/` syncs; project skills, `~/.agents/skills/`, and other local files are not copied. Turn sync off in the same place and Cursor moves the skills back to your machine.

On Teams and Enterprise, admins control sync under **Team Settings → Security & Identity → Sync Skills for Cloud Agents**. When the team setting is on, each member still chooses; when it is off, nobody can sync.

## Examples for development teams

The skills below use only documented Cursor frontmatter and follow the progressive-disclosure layout. Copy them into `.cursor/skills/<name>/SKILL.md`.

### PR description

```markdown
---
name: pr-desc
description: Writes a pull request title and description from the branch diff. Use when the user asks for a PR description, PR summary, or to "write up these changes".
disable-model-invocation: true
---

# PR description

1. Run `git log main..HEAD --oneline` and `git diff main..HEAD --stat`.
2. Read the most relevant changed files if the intent is unclear.
3. Output Markdown ready to paste into GitHub:
   - Title: one line, under 72 characters, imperative mood
   - Summary: 2 to 4 bullets on what changed and why
   - Changes: file-by-file or area-by-area notes for reviewers
   - Test plan: checklist a reviewer can follow

Do not add filler such as "This PR introduces". Be direct.
```

### API review with a reference file

```text
.cursor/skills/api-review/
├── SKILL.md
└── references/
    └── http-conventions.md
```

```markdown
---
name: api-review
description: Reviews REST route handlers for validation, HTTP semantics, auth, and consistency. Use when reviewing API routes, controllers, or endpoint changes.
paths:
  - 'src/routes/**'
  - 'src/api/**'
---

# API review

Check every handler in scope for input validation, correct methods and status
codes, auth on protected routes, and consistent naming and pagination. When you
need the exact status code or header rule, open `references/http-conventions.md`.

Report findings grouped by category with file, route, line, and suggested fix.
```

### Environment check with a script

```markdown
---
name: env-check
description: Audits environment variable usage for missing .env.example entries, committed secrets, and unvalidated reads. Use when the user asks about env vars, secrets, or configuration hygiene.
---

# Environment check

Run `scripts/scan-env.sh` and use its output as the source of truth. Do not
re-implement the scan by reading files yourself.

Then report:

- Variables read in code but missing from `.env.example`
- Values that look like committed secrets
- Variables read without validation or a fallback
```

### Keeping a playbook active as a mode

```markdown
---
name: incident-triage
description: Structured triage for production incidents. Use when investigating an outage, alert, or error spike.
icon: shield
color: red
---

# Incident triage

Work in this order and keep a running timeline in your replies:

1. Establish impact and start time from logs and dashboards.
2. Find the most recent deploy or config change in the window.
3. Form one hypothesis at a time; verify before moving on.
4. Propose the smallest safe mitigation first, then the fix.
```

Use it as a Custom Mode (Option+Enter or Alt+Enter) so the procedure stays active while you move between services.

## What to avoid

- **Copying entire style guides into a skill.** Use a linter and keep the skill about the procedure. The agent already knows common conventions.
- **Vague descriptions.** "Helps with deployments" gives the agent nothing to match on. Name the task and the trigger phrases.
- **A `name` that does not match the folder.** Cursor requires them to match; mismatches are a common reason a skill does not load.
- **Skills that should be rules.** If it fits in three lines and should apply to every conversation, it belongs in `.cursor/rules/` or `AGENTS.md`.
- **Skills that should be subagents.** If the work needs an isolated context or a different model, write a [subagent](./subagents.md) and have the skill delegate to it.
- **Assuming personal skills exist in the cloud.** Cloud Agents and self-hosted workers only see committed project skills and skills you have explicitly synced.
- **Putting `SKILL.md` directly in the skills root.** The file must sit inside its own named folder; the filename must be exactly `SKILL.md`.
- **Trusting imported skills blindly.** Read a GitHub-imported or community skill before enabling it; it can instruct the agent to run scripts.

## Troubleshooting

| Symptom                                         | Check                                                                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Skill never triggers                            | Improve `description` with the wording you actually use; check `paths` does not exclude the files you are working on |
| Skill does not appear in **Customize → Skills** | Folder layout (`<root>/<name>/SKILL.md`), exact filename, `name` matches folder, valid YAML frontmatter              |
| Skill fires for the wrong tasks                 | Narrow the description; add `paths`; or set `disable-model-invocation: true` and invoke it explicitly                |
| Skill missing in a Cloud Agent                  | Personal skills are not synced by default; commit the skill or turn on **Sync Skills for Cloud Agents**              |
| Skill missing on a self-hosted worker           | Only repo skills (or skills baked into the worker image) are available there                                         |
| Script fails at runtime                         | Execute permission (`chmod +x`), dependencies installed in the agent's environment, forward slashes in paths         |

## Compared with Claude Code

| Topic                         | Cursor                                                                                                                                        | Claude Code                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Location                      | `.cursor/skills/`, `.agents/skills/`, `~/.cursor/skills/`, `~/.agents/skills/`, plus `.claude/skills/` and `.codex/skills/` for compatibility | `.claude/skills/`, `~/.claude/skills/`, plugins, enterprise settings                                                  |
| Frontmatter                   | `name`, `description`, `paths`, `disable-model-invocation`, `icon`, `color`, `metadata`                                                       | Larger surface: `allowed-tools`, `model`, `effort`, `context: fork`, `agent`, `arguments`, `hooks`, `paths`, and more |
| Arguments and shell injection | Not documented; write the task in the chat message after `/skill`                                                                             | `$ARGUMENTS`, named arguments, `` !`command` `` injection                                                             |
| Session-long activation       | Custom Modes (Option+Enter / Alt+Enter) keep a skill in context every turn                                                                    | Skills merge into the conversation when matched or invoked                                                            |
| Preloading into subagents     | No `skills` field on subagents; repeat the guidance in the subagent prompt                                                                    | `skills:` list in agent frontmatter injects full skill bodies at startup                                              |
| Migration tooling             | `/migrate-to-skills` converts dynamic rules and commands                                                                                      | `/import` and `/init` pull in other tools' configuration                                                              |
| Sharing                       | Commit to repo, publish to team marketplace, or bundle in a plugin                                                                            | Commit to repo, plugins and marketplaces, enterprise-managed settings                                                 |
| Validation                    | Check **Customize → Skills**; no CLI validator documented                                                                                     | `claude plugin validate`, `/skill-doctor`                                                                             |

For the Claude Code side, see [Claude Code Skills](../claude-code/skills.md). For the general Cursor overview, see [Cursor](../tools/cursor.md).
