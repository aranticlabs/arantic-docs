---
sidebar_position: 5
sidebar_label: Permissions & Sandbox
description: Configure Codex sandbox modes, approval policies, writable roots, network access, execpolicy rules, permission profiles, and managed requirements.
keywords:
  [
    Codex permissions,
    Codex sandbox,
    sandbox_mode,
    approval_policy,
    workspace-write,
    danger-full-access,
    execpolicy rules,
    permission profiles,
    requirements.toml,
    Windows sandbox,
  ]
---

# Permissions & Sandbox

Codex controls what the agent can do with two separate layers: an OS-enforced **sandbox** that limits where commands can write and whether they can reach the network, and an **approval policy** that decides when Codex must stop and ask before crossing that boundary. Getting these two settings right is what lets you leave Codex working on its own without handing it your whole machine.

## Two layers, not one

| Layer                  | Question it answers                                          | Main setting         | CLI flag                            |
| ---------------------- | ------------------------------------------------------------ | -------------------- | ----------------------------------- |
| **Sandbox mode**       | What can commands technically touch (files, network)?        | `sandbox_mode`       | `--sandbox` / `-s`                  |
| **Approval policy**    | When does Codex pause and ask before acting?                 | `approval_policy`    | `--ask-for-approval` / `-a`         |
| **Approvals reviewer** | Who answers those approval prompts: you or a reviewer agent? | `approvals_reviewer` | `-c approvals_reviewer=auto_review` |

The sandbox applies to every spawned command, not just built-in file operations. If Codex runs `git`, a package manager, or a test runner, those processes inherit the same limits. Changing who reviews an approval never expands the sandbox.

Codex cloud is different: tasks run in isolated OpenAI-managed containers with a two-phase model (setup with network, then an offline agent phase unless you enable internet access). This page covers the local CLI, IDE extension, and ChatGPT desktop app.

## Sandbox modes

| Mode                 | What commands can do                                                                                 | Typical use                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `read-only`          | Read files and run commands that do not write. Edits and other writes need approval.                 | Exploring an unfamiliar or untracked folder, planning           |
| `workspace-write`    | Read anywhere the OS allows, write inside the workspace and temp directories, no network by default. | Default for local work in a git repository                      |
| `danger-full-access` | No filesystem or network restrictions.                                                               | Only inside a container or VM that already isolates the process |

Set a default in `~/.codex/config.toml`:

```toml
sandbox_mode = "workspace-write"
```

Or override per session:

```bash
codex --sandbox read-only
codex -s workspace-write
```

### What the workspace includes

In `workspace-write` mode the writable area is the current directory plus temporary directories such as `$TMPDIR` and `/tmp`. Run `/status` in a session to see the active writable roots.

Even inside a writable root, some paths stay read-only:

- `<root>/.git` (as a directory or a `gitdir:` pointer file, including the resolved git directory)
- `<root>/.agents` when it exists as a directory
- `<root>/.codex` when it exists as a directory

Protection is recursive. This is why `git commit` can still ask for approval in workspace-write mode: the command needs to write into `.git/`, which is outside the writable set. Use [rules](#rules-execpolicy) to allow or forbid such commands rather than widening the sandbox.

### Writable roots

Extend the writable area without dropping to full access:

```toml
[sandbox_workspace_write]
writable_roots = ["/Users/you/.pyenv/shims", "/Users/you/code/shared-lib"]
exclude_tmpdir_env_var = false  # set true to remove $TMPDIR from writable roots
exclude_slash_tmp = false       # set true to remove /tmp from writable roots
network_access = false          # opt in to outbound network
```

For a single session, `--add-dir <path>` (repeatable) grants write access to extra directories. The official guidance is to prefer `--add-dir` over `--sandbox danger-full-access` when Codex needs to touch a neighboring directory.

## Approval policies

| Policy                   | Behavior                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on-request`             | Codex works inside the sandbox and asks only when it needs to go beyond it (write outside the workspace, use the network, run a command blocked by a rule). Default for interactive work. |
| `never`                  | Codex never asks. It does its best within the sandbox and gives up or works around anything the sandbox blocks. Use for CI and scripts.                                                   |
| `{ granular = { ... } }` | Keep some prompt categories interactive and auto-reject the rest.                                                                                                                         |

```bash
codex --ask-for-approval on-request
codex -a never
```

### Granular approvals

A granular policy lets you decide per category whether a prompt may surface at all. Categories set to `false` fail closed without asking:

```toml
approval_policy = { granular = {
  sandbox_approval = true,      # sandbox escalation prompts
  rules = true,                 # prompts from execpolicy `prompt` rules
  mcp_elicitations = true,      # MCP elicitation prompts
  request_permissions = false,  # prompts from the request_permissions tool
  skill_approval = false        # skill-script approval prompts
} }
```

### Retired and deprecated values

`approval_policy = "untrusted"` is no longer supported and can prevent Codex from starting. `on-failure` is deprecated. If you want the stricter behavior where every command outside an allow rule needs approval, omit `approval_policy` and mark the project untrusted in your user config instead:

```toml
[projects."/path/to/project"]
trust_level = "untrusted"
```

Untrusted projects skip their project-local `.codex/` layer (config, hooks, rules). Setting `on-request` explicitly overrides the project-derived policy. Under managed configuration, `allowed_approval_policies` must still include `untrusted` for this derived behavior to be permitted.

### Who reviews approvals

```toml
approvals_reviewer = "user"         # default: prompts surface to you
# approvals_reviewer = "auto_review"  # eligible prompts go to a reviewer agent
```

`auto_review` only applies when approvals are interactive (`on-request` or granular). With `never` there is nothing to review. See [Auto-review](./auto-review.md).

## Common combinations

| Intent             | Flags or config                                                                             | Effect                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Auto (preset)      | no flags, or `--sandbox workspace-write --ask-for-approval on-request`                      | Read, edit, and run commands in the workspace; ask for anything outside it or on the network |
| Read-only browsing | `--sandbox read-only --ask-for-approval on-request`                                         | Read files and run non-writing commands; ask for anything else                               |
| Read-only CI       | `--sandbox read-only --ask-for-approval never`                                              | Read-only, never asks                                                                        |
| Auto-review        | `--sandbox workspace-write --ask-for-approval on-request -c approvals_reviewer=auto_review` | Same boundary as Auto; a reviewer agent answers eligible prompts                             |
| Full access        | `--dangerously-bypass-approvals-and-sandbox` (alias `--yolo`)                               | No sandbox, no approvals. Not recommended outside an isolated environment.                   |

For non-interactive runs use `codex exec --sandbox workspace-write`. The older `codex exec --full-auto` still works as a deprecated compatibility path and prints a warning.

Save presets as profile files and select them with `--profile`:

```toml
# ~/.codex/readonly_quiet.config.toml
approval_policy = "never"
sandbox_mode    = "read-only"
```

```bash
codex --profile readonly_quiet
```

### Defaults Codex picks for you

- In a version-controlled folder Codex recommends the Auto preset (workspace-write plus on-request).
- In a folder that is not under version control it recommends `read-only`.
- Depending on setup, Codex may start read-only until you trust the directory through the onboarding prompt or `/permissions`.

## Switching modes mid-session

| Action                                                                       | How                                                                         |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Change the approval preset or permission profile                             | `/permissions`, then pick `Auto`, `Read Only`, or a named profile           |
| See the active model, approval policy, and writable roots                    | `/status`                                                                   |
| Retry one action that Auto-review denied                                     | `/approve`                                                                  |
| Grant read access to a directory (native Windows only)                       | `/sandbox-add-read-dir C:\absolute\path`                                    |
| Set up the elevated Windows sandbox                                          | `/setup-default-sandbox` (appears only when the degraded sandbox is active) |
| Run a shell command yourself under the current sandbox and approval settings | prefix the line with `!`                                                    |

In the ChatGPT desktop app and the IDE extension, use the permissions control beneath the composer. Depending on your configuration it offers **Ask for approval**, **Approve for me** (Auto-review), **Full access**, and any named permission profiles. In the desktop app, modes other than Ask for approval must first be enabled under **Settings > General > Permissions**. Modes that managed configuration disallows appear disabled.

:::note
The current slash command is `/permissions`. Approvals that arrive during a turn let you approve once or for the session; the official guidance is to pick the narrowest scope that lets the task continue.
:::

## Network access

The default `workspace-write` sandbox has no outbound network. Enable it explicitly:

```toml
[sandbox_workspace_write]
network_access = true
```

That gives commands unrestricted direct network access. To constrain destinations, also turn on the network proxy feature and define domain rules:

```toml
[features.network_proxy]
enabled = true
domains = { "api.openai.com" = "allow", "*.github.com" = "allow", "tracking.example.com" = "deny" }
```

For a one-off session:

```bash
codex -c 'features.network_proxy=true' -c 'sandbox_workspace_write.network_access=true'
```

How the two settings interact:

| `network_access` | `network_proxy` | Result                                            |
| ---------------- | --------------- | ------------------------------------------------- |
| off              | any             | No network. The proxy does nothing.               |
| on               | off             | Direct, unrestricted outbound access              |
| on               | on              | Outbound traffic constrained by the domain policy |

### Domain rules

- Exact hosts match only themselves.
- `*.example.com` matches subdomains, not the apex.
- `**.example.com` matches apex and subdomains.
- `*` on its own allows any public host that is not denied. Treat it as broad access.
- `deny` always wins over `allow`. Global `*` is valid only for allow rules.
- With no `allow` entries, the active proxy blocks all external destinations.

Loopback, link-local, and private destinations are blocked by default (`allow_local_binding = false`). Add an exact `localhost` or IP literal allow rule for one local target, or set `allow_local_binding = true` for broader local access. Hostnames that resolve to private IPs stay blocked even when allowlisted, and failed or timed-out DNS lookups are blocked. This reduces but does not eliminate DNS rebinding risk.

Two settings deliberately widen the boundary and should stay off in normal development: `dangerously_allow_non_loopback_proxy` and `dangerously_allow_all_unix_sockets`.

### What the proxy does not filter

The command proxy filters scripts and subprocesses inside the sandbox. It does **not** filter web search, app or connector tool calls, MCP server connections, browser or Computer Use activity, Codex cloud tasks, or the client's own model and auth traffic. Each of those has its own controls (`web_search`, `mcp_servers`, feature flags, managed requirements).

Web search defaults to `cached` (an OpenAI-maintained index, no live fetch). Use `--search` or `web_search = "live"` for live browsing, `"indexed"` to gate external access through the index, or `"disabled"` to remove the tool. Under `--yolo` or another full-access setting, web search defaults to live.

## How the sandbox works on each OS

| Platform           | Mechanism                                                                         | Notes                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **macOS**          | Seatbelt via `sandbox-exec` with a profile matching the selected mode             | Works out of the box. If a policy cannot be enforced, Codex refuses to run the command rather than running it unsandboxed.                                  |
| **Linux**          | `bwrap` (bubblewrap) plus `seccomp`; Landlock remains as a compatibility fallback | Install `bubblewrap` with your package manager. Codex uses the first `bwrap` on `PATH`, otherwise a bundled helper that needs unprivileged user namespaces. |
| **WSL2**           | Same as Linux                                                                     | WSL1 was supported through Codex 0.114; from 0.115 the Linux sandbox moved to `bwrap`, so WSL1 no longer works.                                             |
| **Native Windows** | Windows sandbox in `elevated` or `unelevated` mode                                | Configured under `[windows]` in `config.toml`.                                                                                                              |

### Linux setup

```bash
sudo apt install bubblewrap   # Ubuntu/Debian
sudo dnf install bubblewrap   # Fedora
```

Codex warns at startup when `bwrap` is missing or cannot create a user namespace. On Ubuntu 24.04 you may need to load the `bwrap-userns-restrict` AppArmor profile:

```bash
sudo apt install apparmor-profiles apparmor-utils
sudo install -m 0644 /usr/share/apparmor/extra-profiles/bwrap-userns-restrict /etc/apparmor.d/bwrap-userns-restrict
sudo apparmor_parser -r /etc/apparmor.d/bwrap-userns-restrict
```

As a last resort, `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0` disables the restriction globally. Ubuntu 25.04 ships the profile in the `apparmor` package already.

### Windows

```toml
[windows]
sandbox = "elevated"             # preferred; or "unelevated" as fallback
# sandbox_private_desktop = true # default; set false only for compatibility
```

- `elevated` uses dedicated lower-privilege sandbox users, filesystem permission boundaries, and firewall rules. It needs an administrator-approved setup step (`/setup-default-sandbox`).
- `unelevated` runs commands with a restricted token derived from your user and ACL-based boundaries. It has weaker network isolation and cannot enforce every split read/write carveout, so unsupported policies are refused.
- Windows 11 is recommended; Windows 10 1809 or newer is best effort (ConPTY is required).
- Error `1385` means Windows policy denies the logon type the sandbox user needs. Diagnostics live in `CODEX_HOME/.sandbox/sandbox.log`. Never share `CODEX_HOME/.sandbox-secrets/`.

If you run the IDE extension on Windows and prefer Linux semantics, set `"chatgpt.runCodexInWindowsSubsystemForLinux": true` in VS Code settings to keep the agent inside WSL2.

### Containers and Dev Containers

Inside Docker, the Linux sandbox can fail if the host blocks the namespace, setuid `bwrap`, or `seccomp` operations. Either grant the container the capabilities `bwrap` needs, or treat the container as the security boundary and run `codex --sandbox danger-full-access` inside it so Codex does not try to build a second layer. OpenAI publishes a [secure devcontainer example](https://github.com/openai/codex/tree/main/.devcontainer) with an allowlist firewall, `bubblewrap`, and persistent mounts.

:::warning
Full access inside a container still exposes everything the container can see, including Codex credentials, to a malicious repository. Use that pattern only with trusted code.
:::

### Test the sandbox by hand

Run any command under the exact policy Codex would use:

```bash
codex sandbox macos --log-denials -- npm test
codex sandbox linux -- cargo build
codex sandbox windows -- pnpm lint
codex sandbox macos --permission-profile project-edit -- ./scripts/check.sh
```

`codex debug` is an alias, as are the platform names `seatbelt` and `landlock`. `--log-denials` (macOS) prints Seatbelt denials after the command exits, which is the fastest way to find out why a build fails only under Codex.

## Rules (execpolicy)

Rules decide which commands may run **outside** the sandbox: allow silently, prompt, or forbid. They are Starlark files with a `.rules` extension in a `rules/` folder next to an active config layer. Rules are experimental and may change.

| Location                         | Scope                                                                 |
| -------------------------------- | --------------------------------------------------------------------- |
| `~/.codex/rules/*.rules`         | You, all projects                                                     |
| `<repo>/.codex/rules/*.rules`    | This project, loaded only when the project `.codex/` layer is trusted |
| Team Config locations            | Organization-distributed                                              |
| `[rules]` in `requirements.toml` | Admin-enforced; `prompt` or `forbidden` only                          |

```python
# ~/.codex/rules/default.rules
prefix_rule(
    pattern = ["gh", "pr", "view"],
    decision = "prompt",
    justification = "Viewing PRs is allowed with approval",
    match = ["gh pr view 7888", "gh pr view --repo openai/codex"],
    not_match = ["gh pr --repo openai/codex view 7888"],
)

prefix_rule(
    pattern = ["pnpm", "run", ["lint", "test"]],
    decision = "allow",
)

prefix_rule(
    pattern = ["git", "push", "--force"],
    decision = "forbidden",
    justification = "Use a new branch instead of force-pushing.",
)
```

| Field                 | Meaning                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `pattern` (required)  | Argument-prefix list. Each element is a literal or a list of alternatives for that position.                                        |
| `decision`            | `allow` (default), `prompt`, or `forbidden`. When several rules match, the most restrictive wins: `forbidden` > `prompt` > `allow`. |
| `justification`       | Human-readable reason shown in prompts and rejections. For `forbidden`, suggest an alternative.                                     |
| `match` / `not_match` | Inline examples Codex validates when it loads the file.                                                                             |

Codex compares the command's argument vector (what `execvp` receives) against `pattern`. For `bash -lc "a && b"` style wrappers, Codex splits linear chains of plain words joined by `&&`, `||`, `;`, or `|` into separate commands and evaluates each one, so `git add . && rm -rf /` is never auto-allowed by a `git add` rule. Scripts with redirection, substitution, variables, wildcards, or control flow are not split and are evaluated as a single `bash -lc` invocation.

Test before saving:

```bash
codex execpolicy check --pretty --rules ~/.codex/rules/default.rules -- gh pr view 7888
```

Other behavior worth knowing:

- Choosing "allow for future runs" in the TUI writes a `prefix_rule` to `~/.codex/rules/default.rules`.
- With Smart approvals (the default) Codex may propose a `prefix_rule` during an escalation. Review the suggested prefix before accepting; broad prefixes like `["python"]` or `["curl"]` erase the boundary you are trying to keep.
- `codex exec --ignore-rules` skips user and project rules for one run.
- Restart Codex after editing rules files.

## Permission profiles (beta)

Permission profiles are a newer, single model that describes filesystem **and** network access together. They replace `sandbox_mode` plus `[sandbox_workspace_write]`; do not combine the two. If `sandbox_mode` appears in any loaded config, `--sandbox` is passed, or the selected profile file sets it, Codex uses the older settings and ignores `default_permissions`. Profiles work on macOS, Linux, WSL, and native Windows.

Built-in profiles: `:read-only`, `:workspace`, and `:danger-full-access`. Select one, or define your own:

```toml
default_permissions = "project-edit"

[features]
network_proxy = true

[permissions.project-edit]
description = "Project editing with OpenAI API access."
extends = ":workspace"

[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"

[permissions.project-edit.network]
enabled = true

[permissions.project-edit.network.domains]
"api.openai.com" = "allow"
```

| Concept               | Details                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Access values         | `read`, `write`, `deny`. More specific paths override broader ones; on the same path `deny` > `write` > `read`.                       |
| Path forms            | `:root`, `:minimal` (runtime paths common tools need), `:workspace_roots`, `:tmpdir`, `:slash_tmp`, absolute paths, `~/path`          |
| `extends`             | Start from `:read-only`, `:workspace`, or another named profile. `:danger-full-access` cannot be extended.                            |
| `workspace_roots`     | Extra directories that receive the `:workspace_roots` rules alongside the session root                                                |
| `glob_scan_max_depth` | Bounds pre-expansion of `**` deny-read globs on Linux, WSL, and Windows                                                               |
| `network.enabled`     | Grants command network access. Domain rules only apply when `features.network_proxy` (or managed `[experimental_network]`) is active. |

Extending `:workspace` keeps the workspace root's `.codex` directory read-only unless you override it. Layers compose: a system config and a user config can each add `workspace_roots` to the same profile name.

## Managed configuration

Administrators enforce constraints through `requirements.toml`, which users cannot override. Precedence from lowest to highest: system file (`/etc/codex/requirements.toml` on Unix, `%ProgramData%\OpenAI\Codex\requirements.toml` on Windows), cloud-managed requirements delivered on ChatGPT sign-in, legacy `managed_config.toml` fields, then macOS MDM (`com.openai.codex:requirements_toml_base64`). When a user setting conflicts, Codex falls back to a compatible value and notifies the user.

```toml
# Block --ask-for-approval never and full access (including --yolo)
allowed_approval_policies = ["untrusted", "on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
allowed_approvals_reviewers = ["user", "auto_review"]

# Permission-profile deployments (Codex 0.138.0 or later)
default_permissions = ":workspace"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
# ":danger-full-access" omitted, so it is denied

# Paths users can never read
[permissions.filesystem]
deny_read = ["/**/*.env", "~/.ssh"]

# Restrictive command rules (prompt or forbidden only)
[rules]
prefix_rules = [
  { pattern = [{ token = "rm" }], decision = "forbidden", justification = "Use git clean -fd instead." },
  { pattern = [{ token = "git" }, { any_of = ["push", "commit"] }], decision = "prompt" },
]

# Require the stronger Windows sandbox
[windows]
allowed_sandbox_implementations = ["elevated"]
```

Other managed keys that affect permissions: `guardian_policy_config` (Auto-review policy), `[experimental_network]` (centrally managed proxy and domain rules), `[[remote_sandbox_config]]` (different `allowed_sandbox_modes` per hostname pattern), `allowed_web_search_modes`, `allow_login_shell`, and an `mcp_servers` allowlist. When `deny_read` requirements are present, Codex rejects full-access permissions so it can enforce them.

`managed_config.toml` is the legacy mechanism for managed **defaults**: starting values users can change during a run, reapplied at next launch.

## Reference

### config.toml keys

| Key                                              | Values                                               | Purpose                                                      |
| ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| `sandbox_mode`                                   | `read-only`, `workspace-write`, `danger-full-access` | Sandbox policy                                               |
| `approval_policy`                                | `on-request`, `never`, `{ granular = {...} }`        | When Codex asks                                              |
| `approvals_reviewer`                             | `user`, `auto_review`                                | Who answers eligible prompts                                 |
| `sandbox_workspace_write.writable_roots`         | array of paths                                       | Extra writable directories                                   |
| `sandbox_workspace_write.network_access`         | bool                                                 | Outbound network in workspace-write                          |
| `sandbox_workspace_write.exclude_tmpdir_env_var` | bool                                                 | Drop `$TMPDIR` from writable roots                           |
| `sandbox_workspace_write.exclude_slash_tmp`      | bool                                                 | Drop `/tmp` from writable roots                              |
| `features.network_proxy`                         | bool or table                                        | Enforce domain rules on command traffic                      |
| `allow_login_shell`                              | bool                                                 | Allow login-shell semantics for shell tools (default `true`) |
| `windows.sandbox`                                | `elevated`, `unelevated`                             | Native Windows sandbox mode                                  |
| `windows.sandbox_private_desktop`                | bool                                                 | Private desktop for UI isolation (default `true`)            |
| `default_permissions`                            | profile name                                         | Active permission profile (beta)                             |
| `[permissions.<name>]`                           | table                                                | Custom permission profile                                    |
| `projects."<path>".trust_level`                  | `trusted`, `untrusted`                               | Project trust; untrusted skips `.codex/` layers              |
| `web_search`                                     | `cached`, `indexed`, `live`, `disabled`              | Web search tool mode                                         |

### CLI flags

| Flag                                                    | Purpose                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| `--sandbox`, `-s <mode>`                                | Sandbox policy for this run                                          |
| `--ask-for-approval`, `-a <policy>`                     | `on-request` or `never`                                              |
| `--add-dir <path>`                                      | Extra writable directory (repeatable)                                |
| `--dangerously-bypass-approvals-and-sandbox`, `--yolo`  | No sandbox, no approvals                                             |
| `--search`                                              | Live web search (`web_search = "live"`)                              |
| `-c key=value`                                          | Any config override, for example `-c approvals_reviewer=auto_review` |
| `--profile`, `-p <name>`                                | Layer `$CODEX_HOME/<name>.config.toml` on top of user config         |
| `codex exec --full-auto`                                | Deprecated alias for `--sandbox workspace-write`                     |
| `codex exec --ignore-rules`                             | Skip `.rules` files for one run                                      |
| `codex sandbox <os> [--permission-profile NAME] -- CMD` | Run a command under the Codex sandbox                                |
| `codex execpolicy check --rules FILE -- CMD`            | Evaluate rules against a command                                     |

See [CLI Flags & Configuration](./flags.md) for the full flag list and [Automation & Non-interactive Mode](./automation.md) for `codex exec` patterns.

## Compared with Claude Code

| Topic                         | Codex                                                                                       | Claude Code                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Primary control               | OS sandbox (`sandbox_mode`) plus approval policy                                            | Permission rules (`allow` / `ask` / `deny`) plus permission modes; sandbox is an extra layer |
| Per-command rules             | Starlark `prefix_rule` files matched on argument vectors; `allow`, `prompt`, `forbidden`    | `Bash(npm run *)` glob rules in `settings.json`                                              |
| Deterministic file protection | Read-only `.git`, `.codex`, `.agents`; permission-profile `deny` rules; managed `deny_read` | `Edit(.env*)` deny rules, protected paths                                                    |
| Switching modes               | `/permissions` picker; desktop and IDE permissions menu                                     | `Shift+Tab` cycle, `/permissions`, `--permission-mode`                                       |
| AI-reviewed approvals         | `approvals_reviewer = "auto_review"`                                                        | `auto` permission mode with a classifier                                                     |
| Enterprise lockdown           | `requirements.toml` allowlists, MDM, cloud-managed requirements                             | Managed settings, `disableBypassPermissionsMode`, `allowManagedPermissionRulesOnly`          |
| Full bypass                   | `--yolo`                                                                                    | `--dangerously-skip-permissions`                                                             |

Read [Claude Code Permissions](../claude-code/permissions.md) for the Claude side of this comparison.
