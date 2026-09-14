---
sidebar_position: 5
sidebar_label: Security & Run Modes
description: Configure Cursor's Run Modes, Auto-review classifier, sandbox, allowlists, .cursorignore, and CLI permissions to control what the agent can do.
keywords:
  [
    Cursor security,
    Run Modes,
    Auto-review,
    Cursor sandbox,
    permissions.json,
    sandbox.json,
    cursorignore,
    terminal allowlist,
    MCP allowlist,
    Cursor enterprise controls,
  ]
---

# Security & Run Modes

Cursor's agent can edit files, run terminal commands, call MCP tools, and fetch web pages. Because models can hallucinate or be steered by prompt injection, Cursor ships with guardrails that require your approval for sensitive actions by default. **Run Modes** decide how much of that approval you delegate, the **sandbox** limits what a shell command can touch, and allowlists, `.cursorignore`, and team policies layer on top. This page covers all of those controls for the desktop app and the CLI.

## The default security model

Out of the box, Cursor applies these rules to first-party tools:

| Action                                                    | Default behavior                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Read files, search code                                   | No approval. Use `.cursorignore` to hide files from the agent.                                                                        |
| Edit workspace files                                      | No approval. Changes save to disk immediately, so use version control.                                                                |
| Edit configuration files (for example workspace settings) | Approval required                                                                                                                     |
| Run terminal commands                                     | Approval required, unless your Run Mode or allowlist says otherwise                                                                   |
| Call MCP tools                                            | The MCP connection needs approval, and each tool call needs approval unless allowlisted                                               |
| Network requests                                          | Only GitHub, direct link retrieval, and web search providers. The agent cannot make arbitrary network requests with default settings. |

:::warning
If your dev server has auto-reload enabled, agent edits can execute before you review them. Keep that in mind when running long-lived processes while the agent works.
:::

Cursor describes Run Modes, allowlists, and the Auto-review classifier as **best-effort guardrails, not a hard security boundary**. There is no security boundary between the agent and your user account: if you can delete a file, the agent can too (with approval by default). For real isolation, use the sandbox, hooks, file-system permissions, or Cloud Agents.

## Run Modes

Run Modes control how the agent runs shell commands, MCP tools, and Fetch calls, and when Cursor interrupts you for approval. Pick one in **Settings > Agents > Approvals & Execution**.

| Mode                                       | What runs without asking                                                                                                                                        | Sandbox                 | Classifier | Use it when                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| **Auto-review** (default since Cursor 3.6) | Allowlisted calls run immediately. Other shell commands run in the sandbox when possible. Anything that cannot be sandboxed goes to the Auto-review classifier. | Yes, for shell commands | Yes        | You want fewer prompts with a safety review before higher-risk calls. Cursor's recommended setup. |
| **Allowlist**                              | Only actions in your allowlist. With sandboxing enabled, supported shell commands can also run in the sandbox.                                                  | Optional                | No         | You want deterministic behavior with a small set of trusted repeat actions.                       |
| **Run Everything**                         | Every tool call.                                                                                                                                                | No                      | No         | You accept the risk and want zero prompts. Use only in disposable environments.                   |

Two older modes were retired in Cursor 3.5 (May 2026):

- **Ask Every Time** was deprecated. New users cannot choose it. Use **Allowlist** with an empty allowlist for the same behavior.
- **Run in Sandbox** was folded into **Allowlist** with sandboxing enabled.

Run Modes apply to local agents only. **Cloud Agents** run inside their own dedicated machine and never ask you to approve an action.

### How Auto-review works

For each shell, MCP, or Fetch call, Cursor checks in this order:

1. **Allowlisted?** Run immediately.
2. **Shell command that can run in the sandbox?** Run it sandboxed. A command "can run in the sandbox" when it works under the sandbox's file and network limits. Commands that need full system access (writes outside the workspace, privileged operations) cannot be sandboxed.
3. **Everything else** goes to the classifier, which returns allow or block based on safety and how well the call matches your intent.

When the classifier blocks a call, the agent can try a different approach. If the agent decides the action still makes sense, Cursor shows you an approval prompt instead of silently dropping it.

The classifier runs on a small Cursor-managed model, currently **Claude 4.5 Haiku** or **GPT-5.4 Mini**. On Enterprise plans, model access controls apply: if both of those models are blocked for your team, Auto-review is grayed out and members fall back to Allowlist. If that happens, enable at least one of them under **Team Settings > Models**, fully quit and reopen Cursor, then check Approvals & Execution again.

:::note
Auto-review is not a security boundary. The classifier can allow a call you would have blocked, or block one you would have allowed. Pair it with hooks and the sandbox for defense in depth.
:::

### Steering Auto-review with permissions.json

Auto-review needs no configuration to work. If there are actions you always want to review manually, describe them in plain English in `permissions.json`. The easiest way is to ask the agent: "I want every AWS CLI command to go through approval first," and it edits the file for you.

| Location                             | Scope                                                                |
| ------------------------------------ | -------------------------------------------------------------------- |
| `~/.cursor/permissions.json`         | All projects on your machine                                         |
| `<project>/.cursor/permissions.json` | One project. Commit it when the team should share the same guidance. |

If both files exist, Cursor **concatenates** the arrays in every field. The files are read on startup, re-read when they change, and accept JSONC (comments allowed).

```jsonc
{
  "autoRun": {
    "allow_instructions": ["Read-only inspections of build artifacts under ./dist are fine."],
    "block_instructions": [
      "Every AWS CLI command should go through approval first.",
      "Every command that modifies Kubernetes resources should go through approval first.",
    ],
  },
}
```

- `allow_instructions` describe call shapes the classifier should lean toward allowing. They still go through the safety check.
- `block_instructions` describe call shapes the classifier should lean toward blocking, so the agent picks another path or asks you.

`autoRun` only has an effect in **Auto-review** mode. Teams can define a global Auto-review configuration in the dashboard; when one exists, it takes priority and Cursor ignores the user-level and project-level files.

## Allowlists

Allowlists name the terminal commands and MCP tools that run without approval in any Run Mode. You can manage them in the Cursor Settings UI, or define them in `permissions.json`. When the file defines an allowlist, it **replaces** the in-app list for that type and the UI editor becomes read-only.

### Terminal allowlist format

Each entry is a command or command prefix. Matching is case-sensitive and uses prefix semantics.

| Pattern        | Matches                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `git`          | Any command starting with `git` (`git status`, `git diff`), but not `gitk`                             |
| `git status`   | Only `git status` and anything starting with `git status `                                             |
| `npm:install*` | `npm install`, `npm install express`, and so on. The `:` separates the base command from an args glob. |

### MCP allowlist format

Each entry is `server:tool`, matched case-insensitively, where `server` is the key from `mcp.json`. `*` matches any value and also works inside names (`my-server:list_*`). Entries without a `:` are ignored.

| Pattern              | Matches                            |
| -------------------- | ---------------------------------- |
| `github:*`           | All tools from the `github` server |
| `*:search`           | The `search` tool from any server  |
| `linear:list_issues` | Exactly that tool on that server   |
| `*:*`                | Every MCP tool (use with caution)  |

### Example

```jsonc
{
  "mcpAllowlist": ["github:*", "linear:*", "notion:search"],
  "terminalAllowlist": ["git", "npm", "cargo build", "cargo test"],
}
```

### Allowlist precedence

```text
team admin (dashboard)  >  permissions.json (per-user + per-repo)  >  IDE settings UI
```

- When a team admin controls Run Mode from the dashboard, neither `permissions.json` nor the IDE can add entries.
- `mcpAllowlist`, `terminalAllowlist`, and `autoRun` are independent. Define only `mcpAllowlist` in the file and the terminal allowlist stays under IDE control.
- If a key is present but evaluates to an empty array after concatenation, the effective allowlist is empty. Cursor does not fall back to the IDE list in that case.

Before Cursor 3.5, allowlists were not consulted in the deprecated Ask Every Time mode.

## Sandboxing

The sandbox runs terminal commands without giving them full machine access. A sandboxed command can work in your project but cannot freely read protected files, write outside approved paths, or reach arbitrary network destinations. Sandboxing is a layer on top of Run Modes: it decides _where_ a supported command runs, not whether the classifier is used.

| Access              | Default sandbox behavior                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Workspace files** | Read and write inside the workspace. `.cursorignore` can hide files from the agent.                             |
| **Protected paths** | `.git/config`, `.git/hooks`, `.vscode`, `.cursorignore`, and sensitive Cursor config files are write-protected. |
| **Network**         | Blocked by default, then opened by your network mode and `sandbox.json`.                                        |
| **Temporary files** | `/tmp` and platform temp directories are writable unless disabled.                                              |

Some commands need full system access and bypass the sandbox. Cursor indicates when a command runs outside the sandbox and asks for approval.

### How the sandbox works per OS

| Platform    | Mechanism                                                                                                                  | Requirements                                                                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **macOS**   | Seatbelt via `sandbox-exec`. A generated profile limits file, network, and process behavior for the whole subprocess tree. | Cursor v2.0 or later. No extra setup.                                                                                                                                                                           |
| **Linux**   | Landlock (filesystem) plus seccomp (blocks unsafe syscalls).                                                               | Kernel 6.2 or later with Landlock v3 (`CONFIG_SECURITY_LANDLOCK=y`) and unprivileged user namespaces enabled. If the kernel does not qualify, Cursor falls back to asking for approval before running commands. |
| **Windows** | Not described in the Run Modes documentation.                                                                              | See the [official page](https://cursor.com/docs/agent/security/run-modes) for current platform coverage.                                                                                                        |

**AppArmor on Linux (remote environments and CLI only).** The desktop package ships the required AppArmor profile. Remote environments and the standalone CLI do not. If sandbox creation fails with a user-namespace permissions error, install the package for your distribution and restart Cursor or the CLI session:

```bash
# Debian / Ubuntu
curl -fsSL https://downloads.cursor.com/lab/enterprise/cursor-sandbox-apparmor_0.6.0_all.deb -o cursor-sandbox-apparmor.deb
sudo dpkg -i cursor-sandbox-apparmor.deb

# RHEL / Fedora
curl -fsSL https://downloads.cursor.com/lab/enterprise/cursor-sandbox-apparmor-0.6.0-1.noarch.rpm -o cursor-sandbox-apparmor.rpm
sudo rpm -i cursor-sandbox-apparmor.rpm
```

### Environment variables inside the sandbox

Cursor injects these into every sandboxed child process:

| Variable                         | Platforms    | Meaning                                                                    |
| -------------------------------- | ------------ | -------------------------------------------------------------------------- |
| `CURSOR_SANDBOX`                 | macOS, Linux | `"seatbelt"` (macOS) or `"native"` (Linux) when running inside the sandbox |
| `CURSOR_ORIG_UID`                | macOS, Linux | UID of the user who launched Cursor, captured before namespace changes     |
| `CURSOR_ORIG_GID`                | macOS, Linux | GID of the user who launched Cursor                                        |
| `CURSOR_SANDBOX_LANDLOCK_STATUS` | Linux        | Active backend: `fully_enforced` (Landlock) or `bubblewrap` (fallback)     |

On Linux the sandbox remaps the process to UID 0 inside a user namespace, so `id -u` returns `0`. Scripts that need the real host identity (for example `docker run --user`) should read `CURSOR_ORIG_UID` and `CURSOR_ORIG_GID`:

```bash
docker run --rm \
  --user "${CURSOR_ORIG_UID:-$(id -u)}:${CURSOR_ORIG_GID:-$(id -g)}" \
  -v "$PWD:/work" -w /work \
  my-image build
```

The fallback keeps the command working outside the sandbox, where the variables are not set.

### Network access modes

| Mode                                  | Behavior                                                                                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **sandbox.json Only**                 | Network limited to domains in your `sandbox.json` allowlist. Cursor defaults are not added.                                                                                   |
| **sandbox.json + Defaults** (default) | Your allowlist plus Cursor's built-in defaults for common package managers and language tools (npm, PyPI, crates.io, Docker registries, GitHub, Maven, NuGet, and many more). |
| **Allow All**                         | All network access is allowed in the sandbox regardless of `sandbox.json`.                                                                                                    |

### sandbox.json

`permissions.json` steers which calls run automatically. `sandbox.json` controls what a sandboxed command can reach. You do not need either file to get started.

| Location                           | Scope          | Priority |
| ---------------------------------- | -------------- | -------- |
| `~/.cursor/sandbox.json`           | All workspaces | Lower    |
| `<workspace>/.cursor/sandbox.json` | One workspace  | Higher   |

Both files are merged with per-repo taking priority. Team-admin policies and Cursor's hardcoded rules layer on top, so local files cannot weaken those protections.

| Field                      | Type                  | Default                 | Description                                                                                     |
| -------------------------- | --------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `type`                     | string                | `"workspace_readwrite"` | `"workspace_readwrite"`, `"workspace_readonly"`, or `"insecure_none"` (disables the sandbox)    |
| `additionalReadwritePaths` | `string[]`            | `[]`                    | Extra read/write paths (only with `workspace_readwrite`)                                        |
| `additionalReadonlyPaths`  | `string[]`            | `[]`                    | Extra read-only paths                                                                           |
| `disableTmpWrite`          | boolean               | `false`                 | Remove default write access to `/tmp` and system temp dirs                                      |
| `enableSharedBuildCache`   | boolean               | `false`                 | Redirect npm, cargo, pip caches to a shared tmpdir so sandboxed and unsandboxed runs share them |
| `networkPolicy.default`    | `"allow"` or `"deny"` | `"deny"`                | Action when no rule matches                                                                     |
| `networkPolicy.allow`      | `string[]`            | `[]`                    | Exact domains, `*.wildcards`, or CIDR ranges                                                    |
| `networkPolicy.deny`       | `string[]`            | `[]`                    | Always wins over `allow`                                                                        |

Example for a full-stack project that installs packages, pulls images, and reads a shared design-tokens repo:

```json
{
  "networkPolicy": {
    "default": "deny",
    "allow": [
      "registry.npmjs.org",
      "registry.yarnpkg.com",
      "pypi.org",
      "files.pythonhosted.org",
      "*.docker.io",
      "ghcr.io"
    ],
    "deny": ["*.internal.corp.example.com"]
  },
  "additionalReadwritePaths": ["/home/me/.docker"],
  "additionalReadonlyPaths": ["/opt/shared/design-tokens"],
  "enableSharedBuildCache": true
}
```

Rules worth knowing:

- Private RFC 1918 ranges (`10.x`, `172.16.x`, `192.168.x`, `127.x`), IPv6 private ranges, and the cloud metadata endpoint `169.254.169.254` are blocked by default to prevent SSRF.
- URL paths are ignored; matching is domain/IP only.
- Policies merge as `per-user < per-repo < team-admin < hardcoded`. Paths are unioned, deny lists are unioned, a team-admin allowlist replaces the union, `"deny"` beats `"allow"` for the default, and restrictive booleans win when any source sets them.

### Always-protected paths

These are write-protected regardless of `sandbox.json`:

```text
.cursor/*.json, .cursor/**/*.json, .cursor/.workspace-trusted
.claude/*.json, .claude/**/*.json
.vscode/**
.code-workspace
.git/hooks/**, .git/config, .git/info/attributes
.cursorignore
```

The `.cursor` subdirectories `rules/`, `commands/`, `worktrees/`, `skills/`, and `agents/` remain writable. SSL certificate paths and `~/.ssh` are always readable.

## Other protections

These can require approval even when a Run Mode would otherwise run automatically:

| Protection                   | What it does                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| **Browser Protection**       | Prevents the agent from automatically running Browser tools                           |
| **File-Deletion Protection** | Prevents automatic file deletion, including `rm` commands                             |
| **External-File Protection** | Prevents automatic creation, modification, or deletion of files outside the workspace |

Keep them enabled. Cursor's own hardening guide recommends leaving all three on.

## File protection with .cursorignore

`.cursorignore` uses `.gitignore` syntax and lives in your project root. Files that match are blocked from Agent, Tab, Inline Edit, and `@` mention references, and excluded from context selection.

```text
# .cursorignore
dist/
*.min.js
**/credentials.json
internal-docs/**
!internal-docs/public/
```

What you get for free:

- Cursor respects `.gitignore` automatically. `.cursorignore` is for additional exclusions.
- A built-in default list already ignores `.env*`, `.git/`, lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, and others), binaries, media, archives, `node_modules/`, `__pycache__/`, `.venv/`, and most build caches. Override an entry with a `!` prefix.
- **Global ignore** patterns in user settings apply to every project. The list is empty by default; Cursor suggests `**/.env`, `**/.env.*`, `**/credentials.json`, `**/*.key`, `**/*.pem`, `**/id_rsa`.
- **Hierarchical Cursor Ignore** (Cursor Settings > Features > Editor, moving to Cursor Settings > Indexing > Ignore Files in Cursor 3.11) searches parent directories for `.cursorignore` files.

:::warning
`.cursorignore` is not a security boundary. Terminal commands and MCP tools run outside Cursor's file access controls and can still read ignored files. For real protection, use file system permissions (`chmod 600 .env`), keep highly sensitive repos off machines where Cursor runs, or use a `beforeReadFile` [hook](./hooks.md) with `failClosed: true`.
:::

Negation has the same limitation as gitignore: you cannot re-include a file whose parent directory was excluded with `*`. Exclude nested directories explicitly instead. Test patterns with `git check-ignore -v <file>`.

## Workspace trust

Cursor supports VS Code-style workspace trust but disables it by default. When enabled, new workspaces prompt you to choose normal or restricted mode. Restricted mode breaks AI features, so it is only useful for truly untrusted trees. Enable it in your user `settings.json`:

```json
"security.workspace.trust.enabled": true
```

Organizations can enforce this through MDM. Project hooks require a trusted workspace to run.

## CLI permissions

The Cursor CLI has its own permission system, separate from the desktop app's `permissions.json`. Rules live in `~/.cursor/cli-config.json` (global) or `<project>/.cursor/cli.json` (project). Only permissions can be set at the project level; every other CLI setting is global.

### Permission tokens

| Type        | Format                      | Examples                                                              |
| ----------- | --------------------------- | --------------------------------------------------------------------- |
| Shell       | `Shell(commandBase)`        | `Shell(ls)`, `Shell(git)`, `Shell(curl:*)`, `Shell(rm)` in `deny`     |
| File reads  | `Read(pathOrGlob)`          | `Read(src/**/*.ts)`, `Read(.env*)` in `deny`                          |
| File writes | `Write(pathOrGlob)`         | `Write(src/**)`, `Write(**/*.key)` in `deny`                          |
| Web fetch   | `WebFetch(domainOrPattern)` | `WebFetch(docs.github.com)`, `WebFetch(*.example.com)`, `WebFetch(*)` |
| MCP tools   | `Mcp(server:tool)`          | `Mcp(datadog:*)`, `Mcp(*:search)`, `Mcp(*:*)`                         |

Pattern rules: globs use `**`, `*`, and `?`; relative paths are scoped to the workspace; absolute paths can target files outside the project; `command:args` (for example `curl:*`) matches both command and arguments; **deny always beats allow**. Without a `WebFetch` allow entry, each fetch prompts for approval.

```json
{
  "version": 1,
  "editor": {"vimMode": false},
  "permissions": {
    "allow": [
      "Shell(ls)",
      "Shell(git)",
      "Shell(npm)",
      "Read(src/**/*.ts)",
      "Write(package.json)",
      "WebFetch(docs.github.com)",
      "Mcp(github:*)"
    ],
    "deny": ["Shell(rm)", "Read(.env*)", "Write(**/*.key)", "Write(**/.env*)"]
  }
}
```

### CLI approval and sandbox settings

| Setting or flag                                  | Effect                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `approvalMode` (config)                          | `allowlist`, `auto-review`, or `unrestricted`                                                                             |
| `sandbox.mode`, `sandbox.networkAccess` (config) | Sandbox mode and network setting for the CLI                                                                              |
| `-f, --force` (`--yolo` alias)                   | Force allow commands unless explicitly denied                                                                             |
| `--sandbox enabled` or `disabled`                | Override the sandbox for this run                                                                                         |
| `--approve-mcps`                                 | Automatically approve all MCP servers                                                                                     |
| `--trust`                                        | Trust the workspace without prompting (headless mode only)                                                                |
| `agent sandbox enable` / `disable` / `reset`     | Persist sandbox mode; `disable` switches to allowlist mode                                                                |
| `agent sandbox run <cmd>`                        | Run one command in the sandbox, with `--allow-paths`, `--readonly-paths`, `--blocked-patterns`, `--network`, `--sb-debug` |

Non-interactive mode (`-p` / `--print`) has full write and shell access. Use `permissions.allow`, `permissions.deny`, and `--force` to decide what runs without prompts in scripts and CI. The CLI sandbox on Linux needs the same AppArmor package as remote environments (see above). See [Cursor CLI](./cli.md) for the rest of the CLI surface.

## Team and enterprise controls

Admins configure these in the web dashboard. Team settings take precedence over individual and project configuration.

| Control                                                     | What it does                                                                                                                                       | Plan               |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Run Mode policy**                                         | Override which Run Modes members can pick; set the org baseline to Auto-review and enable sandboxing                                               | Teams / Enterprise |
| **Sandbox network rules**                                   | Central network allowlist for sandboxed terminal commands; replaces local allow lists                                                              | Teams / Enterprise |
| **Global Auto-review configuration**                        | Team `autoRun` instructions that override user and project `permissions.json`                                                                      | Teams / Enterprise |
| **MCP Allowlist**                                           | Approve servers by command pattern (stdio) or URL pattern (HTTP/SSE), restrict tools per server, set per-server network mode. See [MCP](./mcp.md). | Enterprise         |
| **Model access control**                                    | Choose which models are available; affects Auto-review availability and Cursor Router                                                              | Enterprise         |
| **.cursor Directory Protection**                            | Agents cannot modify or delete `.cursor/` or change rules and settings files without approval                                                      | Enterprise         |
| **Browser Controls**                                        | Allowlist of origins the browser tool may navigate to                                                                                              | Enterprise         |
| **Repository Blocklist**                                    | Cursor refuses to index or work with listed repositories                                                                                           | Enterprise         |
| **Hooks distribution**                                      | Enterprise and team hooks synced to all machines (every thirty minutes) or deployed via MDM. See [Hooks](./hooks.md).                              | Enterprise         |
| **Privacy Mode enforcement, BYOK restrictions, audit logs** | Data governance controls outside the scope of this page                                                                                            | Enterprise         |

MDM can also distribute `~/.cursor/permissions.json` to set a managed per-user MCP allowlist.

## What works well

- **Stay on Auto-review.** It removes most prompts while keeping a review step for risky calls. Add `block_instructions` for the handful of commands you always want to see (production deploys, cloud CLIs, migrations).
- **Allowlist your build loop.** Add `npm`, `pnpm`, `cargo build`, `cargo test`, `make`, `git status`, `git diff` and similar to `terminalAllowlist` in the project `permissions.json` so the whole team inherits them.
- **Commit `.cursor/permissions.json` and `.cursor/sandbox.json`.** They are meant to be shared. Keep personal preferences in `~/.cursor/`.
- **Layer deterministic controls over steering.** Rules, `autoRun` instructions, and allowlists nudge behavior. Hooks with `failClosed: true`, the sandbox, and file permissions enforce it.
- **Use `.cursorignore` for noise as well as secrets.** Excluding generated files and vendored code improves file discovery in large repos.

## What to avoid

- **Run Everything on your daily machine.** It disables the sandbox and the classifier. Reserve it for throwaway VMs and containers.
- **`Mcp(*:*)`, `*:*`, or `WebFetch(*)` in allow lists.** They pre-approve every tool or domain, including ones added later by a compromised dependency.
- **Treating `.cursorignore` as access control.** Shell and MCP tools ignore it.
- **`"type": "insecure_none"` in a committed `sandbox.json`.** It turns the sandbox off for everyone who clones the repo.
- **Blocking every small model on Enterprise.** If both Auto-review classifier models are blocked, Auto-review disappears and everyone drops to Allowlist.

## Compared with Claude Code

| Concern               | Cursor                                                                                                                                             | Claude Code                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Permission modes      | Three Run Modes: Auto-review, Allowlist, Run Everything                                                                                            | Six modes: Manual, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`          |
| AI-reviewed approvals | Auto-review classifier (Claude 4.5 Haiku or GPT-5.4 Mini), steered by plain-English `autoRun` instructions                                         | Auto mode classifier, steered by `environment`, `allow`, `soft_deny`, `hard_deny`         |
| Allow and deny rules  | Desktop: `permissions.json` allowlists only (no deny list; use hooks or `block_instructions`). CLI: `allow` and `deny` tokens in `cli-config.json` | `permissions.allow`, `ask`, `deny` in `settings.json`, evaluated deny then ask then allow |
| Rule syntax           | `Shell(git)`, `Read(glob)`, `Write(glob)`, `WebFetch(domain)`, `Mcp(server:tool)` (CLI)                                                            | `Bash(git *)`, `Read(path)`, `Edit(path)`, `WebFetch(domain:x)`, `mcp__server__tool`      |
| Sandbox               | Seatbelt (macOS) and Landlock plus seccomp (Linux), configured in `sandbox.json`, on by default in Auto-review                                     | `/sandbox` or `--sandbox`, opt-in                                                         |
| File exclusion        | `.cursorignore` plus default ignore list                                                                                                           | `Read`/`Edit` deny rules                                                                  |
| Org policy            | Team dashboard, MDM-distributed JSON files                                                                                                         | Managed settings via MDM or Group Policy                                                  |

See [Claude Code Permissions](../claude-code/permissions.md) and [Claude Code Auto Mode](../claude-code/auto-mode.md) for the other side of this table.
