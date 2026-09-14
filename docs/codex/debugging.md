---
sidebar_position: 16
sidebar_label: Debugging
description: Troubleshoot Codex with codex doctor, /status, /debug-config, RUST_LOG, log locations, and fixes for login, sandbox, MCP, Windows, WSL, and network issues.
keywords: [Codex troubleshooting, codex doctor, /status, /debug-config, RUST_LOG, Codex logs, sandbox denied, MCP not connecting, Windows sandbox, WSL]
---

# Debugging

When Codex misbehaves, the cause is usually one of a small number of things: stale credentials, a sandbox boundary, an MCP server that failed to start, a Windows or WSL setup issue, or a network proxy. This page lists the diagnostic commands, where logs live, and the documented fixes for the common cases.

## First checks

| Command | What it tells you |
|---------|-------------------|
| `codex --version` | Installed CLI version. The desktop app bundles its own Codex; compare with `/Applications/Codex.app/Contents/Resources/codex --version` on macOS when a feature works in one surface but not the other |
| `codex doctor` | A local diagnostic report covering installation, configuration, authentication, runtime, Git, terminal, app-server, and thread inventory. Run it before filing an issue |
| `codex login status` | Active authentication method; exits `0` when credentials are present |
| `/status` | Active model, approval policy, writable roots, and token usage. With a remote TUI it also shows the remote address and server version |
| `/debug-config` | Config layers in precedence order, on/off state, and policy sources (`allowed_approval_policies`, `allowed_sandbox_modes`, `mcp_servers`, `rules`, `experimental_network`). Use it when an effective setting differs from what `config.toml` says |
| `/mcp` and `/mcp verbose` | Which MCP servers and tools are available; `verbose` adds server diagnostics |
| `/ps` | Background terminals and their recent output |
| `codex features` | Feature flags currently enabled or disabled in `config.toml` |

## Where logs live

| Location | Contents |
|----------|----------|
| `$CODEX_HOME` (default `~/.codex`) | Root for config, auth, logs, sessions, skills, and package metadata |
| `$CODEX_HOME/sessions` | Session transcripts |
| `$CODEX_HOME/archived_sessions` | Archived transcripts |
| `~/Library/Logs/com.openai.codex/YYYY/MM/DD` | Desktop app logs on macOS |
| `<log_dir>/codex-tui.log` | Plaintext TUI log, **opt-in** via `log_dir` (see below) |
| `<log_dir>/codex-login.log` | Written by direct `codex login` runs; use it for browser or device-code login failures |
| `CODEX_HOME/.sandbox/sandbox.log` | Windows sandbox log; attach it to Windows sandbox reports |
| `history.jsonl` | Prompt history when history persistence is enabled |

Review logs before sharing them; transcripts can contain source code and secrets. Never send the contents of `CODEX_HOME/.sandbox-secrets/`.

### Verbose logging with RUST_LOG

`RUST_LOG` controls Rust log filtering for the CLI and app server. It accepts `error`, `warn`, `info`, `debug`, `trace`, or targeted filters such as `codex_core=debug,codex_tui=debug`. The interactive CLI writes diagnostics to bounded local stores by default; a plaintext log file requires `log_dir`:

```bash
RUST_LOG=debug codex -c log_dir=./.codex-log
tail -F ./.codex-log/codex-tui.log
```

`codex exec` defaults to `error` output and prints messages inline instead of writing a TUI log.

## Common issues

### Login and authentication

- **Browser login never completes (headless, remote, or blocked localhost callback).** Use device code auth: `codex login --device-auth`, or choose **Sign in with Device Code** in the login UI. It must be enabled in your ChatGPT security settings or by a workspace admin. Fallbacks: copy `~/.codex/auth.json` from a machine where login worked, or forward the localhost callback over SSH.
- **Corporate TLS proxy or private root CA.** Set `CODEX_CA_CERTIFICATE=/path/to/root-ca.pem` before `codex login`. It applies to login, HTTPS, and WebSocket traffic and takes precedence over `SSL_CERT_FILE`.
- **Signed out unexpectedly.** The CLI and IDE extension share cached login details; logging out of one logs out the other. `codex logout` clears both API key and ChatGPT credentials.
- **`codex login` is rejected.** When the process selects workload identity, Codex refuses `codex login` and `codex logout` because the environment controls authentication.
- **CI needs credentials.** Use `CODEX_API_KEY` for `codex exec` or pipe a key: `printenv OPENAI_API_KEY | codex login --with-api-key`. Treat `auth.json` like a password.

### Sandbox denials

- A command that failed because it tried to write outside the workspace or reach the network is working as designed. Check `/status` for the writable roots and approval policy, then either approve the escalation when prompted or widen the boundary deliberately (`--add-dir` rather than `--sandbox danger-full-access`). See [Permissions & Sandbox](./permissions.md).
- **Linux and WSL2:** the sandbox needs `bubblewrap`. Install `bwrap` with your package manager; if Codex warns it cannot create a user namespace on Ubuntu 24.04, load the `bwrap-userns-restrict` AppArmor profile as documented in the sandbox guide.
- **macOS asks about Music, Downloads, or Desktop.** macOS itself prompts when Codex reads protected home folders. Approve or keep the task inside the project.
- **Auto-review denied an action.** `/approve` allows one retry of a recent automatic-review denial. See [Auto-review](./auto-review.md).

### MCP servers not connecting

- Run `codex mcp list` to confirm the server is configured, then `/mcp verbose` inside a session for startup diagnostics.
- Servers get `startup_timeout_sec = 10` and `tool_timeout_sec = 60` by default. Slow servers need higher values in `[mcp_servers.<name>]`. Optional servers only get `mcp_optional_startup_grace_ms` (1000 ms) while the initial tool catalog is built; set it to `0` to wait the full startup timeout, or mark the server `required = true` so startup fails loudly instead of silently dropping it.
- OAuth servers need `codex mcp login <server-name>`; `login` and `logout` only work for streamable HTTP servers that support OAuth.
- Project-scoped `.codex/config.toml` (including its MCP entries) loads only when the project is trusted. `/debug-config` shows whether the layer is on.
- In the IDE extension, select **Restart extension** after adding a server. See [MCP](./mcp.md).

### Windows (native sandbox)

- Codex uses the native Windows sandbox in PowerShell, in `elevated` (preferred) or `unelevated` (fallback) mode, set under `[windows] sandbox = "elevated"` in `config.toml`. Run `/setup-default-sandbox` to retry the elevated setup.
- **Setup failed:** a declined UAC prompt or enterprise policy blocking local user creation, firewall rules, or logon rights. Retry and approve the prompt, ask IT about the policies, or use `unelevated` meanwhile.
- **Error 1385:** Windows is denying the logon type the sandbox user needs. Ask IT to grant the required logon rights, use `unelevated` in the meantime, and send `CODEX_HOME/.sandbox/sandbox.log` with your Windows version.
- **Folders writable by Everyone:** remove `Everyone` write access from the listed folders and re-run setup.
- **Command cannot read a directory:** `/sandbox-add-read-dir C:\absolute\path` grants read access for the session.
- **Sandboxed commands cannot reach the network:** check whether the task was meant to run offline; restart Codex; if it persists, collect the sandbox log.
- **IDE extension installed but unresponsive:** install Visual Studio Build Tools (C++ workload) and the VC++ Redistributable, for example `winget install --id Microsoft.VisualStudio.2022.BuildTools -e`, then fully restart VS Code.
- Windows 11 is recommended; Windows 10 needs version 1809 or newer (ConPTY). `winget` must be available.

### WSL

- WSL1 is not supported since Codex `0.115` (the Linux sandbox moved to `bubblewrap`). Use WSL2.
- Keep repositories under the Linux home (`~/code/...`), not `/mnt/c/...`, for speed and fewer permission or symlink issues. Update WSL with `wsl --update` then `wsl --shutdown` if large repos feel slow.
- **VS Code in WSL cannot find codex:** verify with `which codex` inside WSL and reinstall there (`curl -fsSL https://chatgpt.com/codex/install.sh | sh`). Confirm the green `WSL: <distro>` badge and Linux paths in the integrated terminal.
- To browse a WSL repo from Windows, type `\\wsl$` in Explorer or the file picker.

### Network and cloud

- Cloud environments block agent-phase internet by default and route all traffic through an HTTP/HTTPS proxy. If a dependency install fails only in the agent phase, enable agent internet access for that environment or move the install into the setup script. See [Codex Cloud & Remote](./cloud.md).
- Remote connections should never expose the app server on a public network; use a VPN or mesh network to reach machines outside your LAN.

### Desktop app

- **Chat appears stuck:** check for a pending approval, run `git status` in the integrated terminal, or start a new chat with a smaller prompt.
- **Integrated terminal stuck:** close it, reopen with `` Ctrl+` ``, run `pwd` or `git status`. If it stays stuck, wait for active chats to finish and restart the app.
- **Files you did not edit appear in the review pane:** the pane reflects Git state, not only Codex edits. Switch to **Last turn** to see just the latest turn.
- **Code does not run on a worktree, or a teammate's `.codex` environment is not picked up:** see [Worktrees & Parallel Sessions](./worktrees.md).

## Notifications

Stop watching the terminal and let Codex tell you when a turn finishes or an approval is waiting.

| Surface | Setting |
|---------|---------|
| Desktop app | **Settings**: turn-completion alerts (never, only in background, always) plus separate toggles for permission and question notifications. **Activity** view (`Cmd+Option+U` / `Ctrl+Alt+U`) lists unread, running, and waiting chats |
| CLI | `tui.notifications` (optionally filtered to `agent-turn-complete` and `approval-requested`), `tui.notification_method` (`auto`, `osc9`, `bel`), and `tui.notification_condition` (`unfocused` or `always`) in `config.toml` |
| CLI and IDE | `notify = ["python3", "/path/to/notify.py"]` runs an external program on `agent-turn-complete` with a JSON argument containing `thread-id`, `turn-id`, `cwd`, `input-messages`, and `last-assistant-message`. `notify` must live in the user-level `config.toml`; project configs cannot set it |
| Web | **Settings > Notifications** for push, email, or SMS channels |

## Reporting problems

1. Type `/feedback` in the CLI, IDE, or desktop app. You can include logs or the current session; you receive a session ID to share.
2. Search [existing issues](https://github.com/openai/codex/issues) on the Codex GitHub repository, then open a new one with the session ID, `codex --version`, and (for Windows sandbox issues) `sandbox.log`.

## Environment tips

- Use a standalone terminal for long CLI sessions, and use the `!` prefix to run a quick shell command under the current sandbox without leaving the chat.
- `/statusline` adds model, context, limits, Git, and token fields to the TUI footer so you notice context pressure before it becomes a problem.
- Keep `RUST_LOG` at its default unless you are actively debugging; `debug` and `trace` are noisy.
- Set `CODEX_HOME` only to an existing directory; Codex does not create it.
- When a feature works in the CLI but not the desktop app (or vice versa), compare versions first. Experimental features often land in the CLI first.

## Compared with Claude Code

- Codex's `codex doctor` covers the same ground as Claude Code's `/doctor` ([Claude Code Debugging](../claude-code/debugging.md)), and adds `/debug-config` for config-layer precedence.
- Both expose MCP status with `/mcp`; Codex adds `/mcp verbose` and the `codex mcp list` CLI command.
- Codex logs live under `~/.codex` (and `~/Library/Logs/com.openai.codex` for the desktop app); verbosity is controlled by `RUST_LOG` plus an opt-in `log_dir`.
- Codex has a native Windows sandbox with its own troubleshooting surface (`/setup-default-sandbox`, `/sandbox-add-read-dir`, `sandbox.log`); Claude Code's split-pane Agent Teams mode requires WSL on Windows.
- Both support external notifications: Codex via `notify` and `tui.notifications`, Claude Code via `Notification` hooks ([Claude Code Hooks](../claude-code/hooks.md)).
