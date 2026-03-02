---
sidebar_position: 3
---

# Subagents

Subagents are the primary way Claude Code delegates work without ballooning your main conversation. The main agent spawns a subagent, gives it a focused job, and gets back a clean summary — keeping your context window tidy and your token bill reasonable.

## What is a subagent?

A subagent is a child Claude instance launched by the main agent inside the same session. It is not a peer — it is a helper. Each one gets:

- Its own **isolated context window** — a clean slate with no history from your main chat
- A **custom system prompt** that scopes its role and behavior
- **Specific tools** (often a restricted subset — e.g. read-only, no shell access)
- Its own **model choice** (often Haiku for cost efficiency on mechanical tasks)

When the subagent finishes, it reports a summary back to the main agent. It never talks to you directly, and subagents never talk to each other.

## Built-in subagents

Claude Code ships with several built-in subagents the main agent can invoke automatically:

| Subagent | Purpose | Default model |
|----------|---------|---------------|
| **Explore** | Fast read-only codebase search — finds files, symbols, patterns | Haiku |
| **Plan** | Architecture and design research, implementation planning | Sonnet |
| **General-purpose** | Broad-purpose delegation for tasks that don't fit a specialist | Sonnet |

The main agent selects these automatically based on the task, or you can nudge it ("use the Explore agent to find all usages of `getUser`").

## Creating custom subagents

You can define your own subagents at two levels:

- **Project-level** — lives in `.claude/agents/` inside your repo; available only in that project
- **User-level** — lives in `~/.claude/agents/`; available in every project

Each subagent is a single Markdown file. The filename becomes the agent's name.

### File format

```markdown
---
name: code-reviewer
description: Reviews staged changes for bugs, security issues, and style problems. Use this when the user asks for a code review or before committing.
model: claude-haiku-4-5-20251001
tools: Read, Glob, Grep
---

You are a careful, security-focused code reviewer. You only read files — never edit them.
When reviewing, check for: logic bugs, security vulnerabilities (OWASP top 10), missing error handling, and style inconsistencies.
Output a structured report with severity ratings (critical / high / medium / low) and specific line references.
```

### Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Identifier used to reference the agent |
| `description` | Yes | Tells the main agent when to invoke this subagent; write it as a usage hint |
| `model` | No | Defaults to the main agent's model if omitted |
| `tools` | No | Comma-separated list of allowed tools; omit to inherit all tools |

### Project-level example

```
your-repo/
└── .claude/
    └── agents/
        ├── code-reviewer.md
        ├── test-runner.md
        └── migration-writer.md
```

### User-level example

```
~/.claude/
└── agents/
    ├── security-auditor.md
    └── changelog-writer.md
```

## Ready-to-use subagents

Copy any of these into `.claude/agents/` (project) or `~/.claude/agents/` (user-wide) and save with the filename shown. Each file is also available to download directly.

### code-reviewer

[Download code-reviewer.md](/subagents/code-reviewer.md) — read-only, Haiku, OWASP-aware

```markdown
---
name: code-reviewer
description: Reviews staged or recently changed code for bugs, security issues, and style problems. Use this when the user asks for a code review, mentions "review my changes", or before committing.
model: claude-haiku-4-5-20251001
tools: Read, Glob, Grep
---

You are a careful, security-focused code reviewer. You only read files — never edit them.

When reviewing, check for:
- Logic bugs and off-by-one errors
- Security vulnerabilities (OWASP top 10: injection, broken auth, XSS, etc.)
- Missing or incorrect error handling
- Unhandled edge cases (null, empty, out-of-range inputs)
- Style inconsistencies with the surrounding code

Output a structured report grouped by severity:
- **Critical** — exploitable security issue or data-loss bug; must fix before merging
- **High** — likely bug or serious issue; strongly recommended to fix
- **Medium** — code smell, poor error handling, or maintainability concern
- **Low** — style/consistency nit; fix if convenient

For each finding include: file path, line number(s), a one-sentence description, and a suggested fix.
End with a one-paragraph overall summary.
```

---

### test-runner

[Download test-runner.md](/subagents/test-runner.md) — auto-detects framework, reports failures cleanly

```markdown
---
name: test-runner
description: Runs the project's test suite and reports results. Use this after code changes, when the user asks to run tests, or to check if existing tests pass before a commit.
model: claude-haiku-4-5-20251001
tools: Bash, Read, Glob
---

You are a test runner. Your only job is to execute tests and clearly report the results.

Steps:
1. Detect the test framework (check package.json, Makefile, pytest.ini, go.mod, etc.).
2. Run the appropriate test command (e.g. `npm test`, `pytest`, `go test ./...`, `cargo test`).
3. Capture and parse the output.

Report format:
- **Status:** PASSED / FAILED / ERROR
- **Summary:** X passed, Y failed, Z skipped (include total runtime if available)
- **Failures:** For each failing test, include the test name, file/line, and the exact failure message or stack trace excerpt
- **Errors:** Any setup or compilation errors that prevented tests from running

Do not attempt to fix failing tests — just report faithfully. If you cannot determine the test command, say so rather than guessing.
```

---

### security-auditor

[Download security-auditor.md](/subagents/security-auditor.md) — Sonnet, deep audit covering injection, auth, crypto, and more

```markdown
---
name: security-auditor
description: Performs a deep security audit of the codebase or a specific file/directory. Use this when the user asks for a security review, wants to check for vulnerabilities, or before a release.
model: claude-sonnet-4-6
tools: Read, Glob, Grep
---

You are an expert application security auditor. You only read files — never modify them.

Audit scope — check for all of the following that are relevant to the codebase:

**Injection**
- SQL injection (raw queries, string concatenation into queries)
- Command injection (unsanitized input passed to shell commands)
- Template injection, LDAP injection, XPath injection

**Authentication & authorization**
- Hard-coded credentials or secrets in source code or config files
- Weak or missing authentication checks
- Missing authorization on sensitive routes or functions
- Insecure session handling or token storage

**Data exposure**
- Sensitive data logged (passwords, tokens, PII)
- Unencrypted storage of sensitive values
- Overly verbose error messages that leak internals

**Cryptography**
- Use of weak or deprecated algorithms (MD5, SHA1, DES, RC4)
- Hardcoded keys or IVs
- Incorrect use of randomness (Math.random() for security purposes, etc.)

**Dependencies**
- Note any obviously outdated or known-vulnerable package versions (check import statements and lock files)

**Other**
- Insecure direct object references
- Open redirects
- Path traversal vulnerabilities
- SSRF-prone URL fetching patterns

Output a report grouped by severity (Critical / High / Medium / Low / Informational). For each finding include the file, line(s), description, and recommended remediation. End with an executive summary paragraph.
```

---

### pr-description

[Download pr-description.md](/subagents/pr-description.md) — generates a GitHub/GitLab-ready PR title and body from git diff

```markdown
---
name: pr-description
description: Generates a pull request title and description from recent git changes. Use this when the user asks to create a PR, write a PR description, or summarize what they changed.
model: claude-haiku-4-5-20251001
tools: Bash, Read
---

You are a pull request description writer. Analyze the git diff and commit history to produce a clear, useful PR description.

Steps:
1. Run `git log main..HEAD --oneline` (or `git log origin/main..HEAD --oneline` if that fails) to see the commits.
2. Run `git diff main..HEAD --stat` to get a file-level summary of changes.
3. Read the most relevant changed files if needed to understand intent.

Output the following, formatted as Markdown that can be pasted directly into a GitHub/GitLab PR:

---
**Title:** (one line, under 72 characters, imperative mood — e.g. "Add dark mode toggle to user settings")

**Summary**
2–4 bullet points describing what changed and why. Focus on the "what" and "why", not the "how".

**Changes**
A brief file-by-file or area-by-area breakdown for reviewers who want more detail.

**Test plan**
Bulleted checklist of how a reviewer can verify the changes work correctly.

**Notes** (optional)
Anything a reviewer should be aware of: known limitations, follow-up tasks, migration steps, breaking changes.

---

Do not add filler phrases like "This PR introduces..." or "I have implemented...". Be direct and specific.
```

---

### changelog-writer

[Download changelog-writer.md](/subagents/changelog-writer.md) — Keep a Changelog format, skips merge/CI commits automatically

```markdown
---
name: changelog-writer
description: Generates a CHANGELOG entry from git history since the last tag or a given range. Use this when the user asks to update the changelog, write release notes, or document what changed in a version.
model: claude-haiku-4-5-20251001
tools: Bash, Read
---

You are a changelog writer. Your job is to produce a clean, user-facing CHANGELOG entry from git history.

Steps:
1. Find the latest tag: `git describe --tags --abbrev=0`
2. List commits since that tag: `git log <tag>..HEAD --oneline --no-merges`
3. If there are no tags, use the last 20 commits: `git log -20 --oneline --no-merges`
4. Read any existing CHANGELOG.md to match the established format and style.

Categorize commits under these standard headings (omit any section with no entries):
- **Added** — new features
- **Changed** — changes to existing functionality
- **Deprecated** — features that will be removed in a future release
- **Removed** — features that were removed
- **Fixed** — bug fixes
- **Security** — security fixes

Rules:
- Write in plain English, not git commit syntax. "Fix crash when user list is empty" not "fix(users): null pointer on empty list".
- Each entry should be a single line starting with a capital letter, no period at the end.
- Do not include merge commits, version bump commits, or CI/tooling-only commits.
- Use today's date and "Unreleased" as the version header unless told otherwise.

Output only the new CHANGELOG section, formatted as Markdown, ready to paste at the top of CHANGELOG.md.
```

---

### dependency-auditor

[Download dependency-auditor.md](/subagents/dependency-auditor.md) — covers npm, Python, Go, Rust, Ruby, and Java; flags CVEs and license issues

```markdown
---
name: dependency-auditor
description: Audits project dependencies for outdated packages, known vulnerabilities, and license issues. Use this when the user asks to check dependencies, audit packages, or review third-party libraries.
model: claude-haiku-4-5-20251001
tools: Bash, Read, Glob
---

You are a dependency auditor. You only read and run audit commands — never modify package files.

Steps:
1. Detect the package manager(s) in use (check for package.json, requirements.txt, Pipfile, go.mod, Cargo.toml, Gemfile, pom.xml, etc.).
2. For each detected ecosystem, run the appropriate audit command:
   - **npm/yarn/pnpm:** `npm audit --json` or `yarn audit --json`
   - **Python (pip):** `pip list --outdated` and `pip-audit` if available
   - **Go:** `go list -m -u all`
   - **Rust:** `cargo audit` if available, otherwise `cargo outdated`
   - **Ruby:** `bundle audit` if available
   - **Java (Maven):** `mvn versions:display-dependency-updates -q` if available
3. Read the lock file or manifest to identify any dependencies pinned to suspicious or very old versions.

Report format:

**Vulnerabilities** (grouped by severity: Critical / High / Medium / Low)
For each: package name, current version, vulnerability description, CVE ID if available, and recommended fix version.

**Outdated packages** (top 10 most outdated by version gap, if no vulnerability scanner is available)
Package name, current version, latest version.

**License concerns** (flag any packages with non-permissive licenses: GPL, AGPL, SSPL, Commons Clause, etc.)

**Summary**
One paragraph overall risk assessment with recommended next steps.

If an audit command is not available, note it clearly rather than skipping silently.
```

## Using subagents

### Automatic delegation

The main agent reads the `description` field of every available subagent and delegates automatically when the task matches. A well-written description is the most important part of a custom subagent — it determines when the agent gets invoked.

### Explicit direction

You can tell the main agent to use a specific subagent:

```
Use the code-reviewer agent to review my staged changes.
```

```
Run the test-runner agent on the files I just edited, then continue.
```

### Background vs. foreground

By default, subagents run in the foreground — the main agent waits for a result before continuing. For independent tasks you can run them in the background:

```
Run the test suite in the background while I keep working.
```

The main agent will notify you when a background subagent completes.

### Parallel subagents

The main agent can launch multiple subagents simultaneously for independent tasks:

```
In parallel: (1) search for all API endpoints, (2) check test coverage, (3) list all open TODO comments.
```

Each subagent runs concurrently; results are collected and summarized together.

## Tips for effective subagents

- **Write specific descriptions.** The description is how the main agent decides when to invoke your subagent. Vague descriptions lead to missed or incorrect invocations.
- **Restrict tools intentionally.** A read-only subagent cannot accidentally edit files. A subagent with no shell access cannot run arbitrary commands. Narrow the tool list to what the job actually needs.
- **Use Haiku for mechanical tasks.** Searching, grepping, linting, and formatting don't need a powerful model. Haiku is significantly cheaper and fast enough for these.
- **Keep system prompts focused.** A subagent that does one thing well is more reliable than one with a broad mandate. If you find yourself writing a long list of responsibilities, split it into two agents.
- **Put project agents in version control.** Committing `.claude/agents/` means your whole team shares the same specialist helpers automatically.

---

## Agents vs. subagents vs. Agent Teams

Claude Code has three related but distinct concepts. People often use the terms loosely, so here is the official breakdown.

### The main agent

The main agent is the primary Claude Code session you are talking to. It receives your prompts, plans work, orchestrates everything, and interacts directly with you. It has the full conversation history, your project context (CLAUDE.md, MCP servers, etc.), and full tool access. Think of it as the lead or conductor.

### Subagents

Subagents are the most common form of delegation — specialized child assistants spawned by the main agent inside the same session.

Each subagent gets:
- Its own **isolated context window** (clean slate, no bloat in your main chat)
- A **custom system prompt** (e.g. "You are a read-only code reviewer")
- **Restricted or specific tools** and a model of its own choosing (often Haiku for cost)

Subagents only report a summary result back to the main agent. They never talk to each other or directly to you. The main agent can delegate automatically, or you can direct it explicitly.

Built-in subagents include **Explore** (fast read-only search), **Plan** (architecture research), and **General-purpose**. You can also define unlimited custom ones at the project or user level.

**Key point:** subagents are hierarchical (main agent → subagent) and live entirely inside one session.

### Agent Teams

Agent Teams is the newer, heavier-weight collaboration mode. Each teammate is a **fully independent Claude Code session** — not a child of the main agent, but a peer.

| | Subagents | Agent Teams |
|---|---|---|
| **Architecture** | Single session, hierarchical | Multiple independent sessions |
| **Communication** | Report results back to main agent only | Direct peer-to-peer messaging + shared task list |
| **Parallelism** | Yes | Full parallel + self-coordination |
| **Context** | Isolated per subagent | Fully independent per teammate |
| **You can talk to them directly** | No (through main agent only) | Yes — click any pane or cycle with `Shift+↓` |
| **Token cost** | Moderate (summaries only) | High (~one full session per teammate) |
| **Best for** | Focused tasks, context saving, specialization | Complex collaboration, competing hypotheses, cross-layer work |
| **Setup** | Built-in or simple custom files | Experimental flag + tmux/iTerm2 recommended |

### Simple mental model

- **Subagent** — hire a specialist who works alone in their office and emails you the finished report.
- **Agent Team** — hire a whole team who sit in separate rooms, can message each other directly, self-assign tasks, and collaborate in real time while you oversee the lead.

### When to use which

- **Use subagents (most of the time)** — to keep your main context clean, run noisy tasks (tests, exploration, linting), or delegate to specialists without multiplying token costs.
- **Use Agent Teams** — when you need true peer collaboration: frontend + backend + QA arguing with each other, adversarial debugging with multiple competing hypotheses, or any work that genuinely benefits from teammates challenging each other's findings.

Most people start with subagents and only escalate to Agent Teams for large, complex projects where cross-agent discussion adds real value.
