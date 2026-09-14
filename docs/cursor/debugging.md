---
sidebar_position: 16
sidebar_label: Debugging
description: Troubleshoot Cursor when the agent stalls, Tab stops, installs fail, or proxies block AI features, and learn where logs and request IDs live for bug reports.
keywords:
  [
    Cursor troubleshooting,
    Cursor debugging,
    request ID,
    Developer Tools,
    Output panel,
    HTTP compatibility mode,
    .cursorignore,
    reindex,
    Cursor CLI logs,
    extension conflicts,
  ]
---

# Debugging

This page is about debugging Cursor itself: an agent that stalls or ignores files, Tab going quiet, a blank window on launch, AI features dying behind a corporate proxy. For using the agent to debug _your_ code, see Debug Mode in [Agent Modes](./modes.md), which instruments your program and reasons from runtime logs. The pattern below is the same each time: collect the request ID or logs first, then change one thing at a time.

## Where the evidence lives

| You need                                     | Where to find it                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| Request ID for a bad agent response          | **...** menu at the bottom of the response → **Copy Request ID**              |
| Console errors                               | **Help** > **Toggle Developer Tools**                                         |
| Extension host output                        | `Cmd/Ctrl+Shift+P` → **Output**, pick **Extension Host** from the dropdown    |
| Worktree setup output                        | Output panel → **Worktrees Setup**                                            |
| Exported logs (Main, Window, Extension Host) | `Cmd/Ctrl+Shift+P` → **Developer: Export Logs...**                            |
| Cursor version                               | **Cursor** > **About Cursor** (macOS) or **Help** > **About** (Windows/Linux) |
| Network diagnostics                          | **Cursor Settings** > **Network** > **Run Diagnostics**                       |
| CLI debug log path                           | `/logs` inside `agent` (also copies the path to the clipboard)                |
| CLI version, system, account info            | `agent about` or `/about`                                                     |
| Bugbot logs and request ID                   | Comment `cursor review verbose=true` on the PR                                |

## Agent issues

**Poor or inconsistent results.** The official accuracy checklist: be specific about expected behavior and constraints; use Plan mode for tasks touching many files; start a new chat when you finish a feature or switch tasks; put patterns you want followed every time in `.cursor/rules/` ([Rules & AGENTS.md](./rules.md)); type `@` plus a file or folder name for targeted context.

**The agent does not see my files.**

1. Check `.cursorignore` in the project root. Listed files are blocked from the agent, codebase search, and `@` mentions.
2. Check `.gitignore`; its patterns can also hide files from discovery.
3. Reindex: command palette → **Reindex**.
4. Attach the file directly with `@filename`.

**Undoing agent changes.** Hover a previous message and click **Restore Checkpoint** to roll back everything after that point. Checkpoints are local and separate from Git; they revert files but keep the conversation.

**Terminal commands behave differently.** Cursor sets `CI=1` when running commands through the agent. If your project branches on it, unset it, or add a rule so the agent always does:

```bash
unset CI && your-command-here
```

```markdown
When running terminal commands, prefix with `unset CI &&` if the command's behavior changes in CI environments.
```

**"Agent Execution Timed Out".** The extension host did not start within 60 seconds (also seen as "Timeout waiting for EverythingProvider" in network diagnostics). Collect logs before changing anything: **Developer: Export Logs...** with Main, Window, and Extension Host selected, plus a screenshot of **Output → Extension Host** (an empty panel is itself a strong signal). Share those with your OS and Cursor version. On managed machines, endpoint security software (antivirus, EDR) is a known cause; IT can apply the exclusions from the [Endpoint Security Configuration](https://cursor.com/docs/enterprise/endpoint-security) page.

**MCP servers not responding.** See [MCP](./mcp.md). In the CLI, `agent mcp list` shows configured servers and their status.

**Cloud attachments rejected.** At cursor.com/agents, documents and images are capped at 4 MB per file and videos at 15 MB. Trim logs to the relevant range, or attach from Cursor desktop where limits can differ. For Self-Hosted Machines, `agent worker debug` prints a preflight report (`--json` for machine-readable output). See [Cloud Agents & Automations](./cloud-agents.md).

## Tab issues

| Symptom                        | Check                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| No suggestions at all          | Free (Hobby) has a monthly Tab allowance that pauses when used up; Tab needs a connection; run **Cursor: Attempt Update** if the build is old |
| Stopped on a corporate network | Some networks block HTTP/2. **Cursor Settings** > **HTTP Compatibility Mode** > enable (HTTP/1.1), then restart                               |
| Weak suggestions in a new file | Tab reads recent edits and surrounding code; make a few manual edits first                                                                    |
| Fighting another tool          | See Extension conflicts; other AI completion extensions are the usual cause                                                                   |
| Slow                           | Check connection speed, disable unused extensions; VPNs and proxies add latency                                                               |
| Noisy in Markdown or JSON      | Click the **Tab** status indicator (bottom-right) and disable it per file extension                                                           |

## Install, startup, and update

- **Blank screen on startup**: quit and relaunch; on macOS reinstall from [cursor.com/download](https://cursor.com/download); on Windows run as administrator; or run **Clear Editor History** from the command palette.
- **Updating**: `Cmd/Ctrl+Shift+P` → **Cursor: Attempt Update**, restart when prompted. Channels are **Stable** (default) and **Early Access** (pre-release); switch in **Cursor Settings**.
- **macOS "Cursor is damaged"**: a macOS issue, not a bad download. Quit, force-quit leftover processes in Activity Monitor, wait a minute, reopen. If it persists, trash Cursor, empty the Trash, re-download; then restart the Mac.
- **Disk space**: remove unused extensions and run **Clear Editor History**; both also reclaim cached data.

## Network, proxy, VPN, and SSH

Start with **Cursor Settings** > **Network** > **Run Diagnostics**.

- **Proxy blocks AI features**: Cursor streams over HTTP/2, which some corporate proxies (Zscaler is the named example) block. Set **HTTP Compatibility Mode** to **HTTP/1.1** and restart.
- **Firewall allowlist**: `*.cursor.sh` (includes `authenticate.cursor.sh` and `authenticator.cursor.sh`), `*.cursor-cdn.com`, `*.cursorapi.com` (includes `marketplace.cursorapi.com`), and both `*.cursorvm.com` and `*.*.cursorvm.com`. Full list and connectivity tests: [network configuration](https://cursor.com/docs/enterprise/network-configuration).
- **Remote SSH**: AI requests originate on your local machine, so check local internet first; make sure the remote is not out of memory or CPU; add keep-alives if the session drops; restart Cursor after reconnecting to clear stale processes.

  ```text
  Host your-server
    ServerAliveInterval 60
    ServerAliveCountMax 3
  ```

- **DNS errors after disconnecting a VPN**: fully restart Cursor (not Reload Window) to drop inherited environment variables. Then confirm the resolver reverted: `scutil --dns` on macOS, `/etc/resolv.conf` on Linux.
- **"Suspicious activity"**: a security block that VPNs sometimes trigger. Turn the VPN off; then start a new chat, wait a few minutes, or sign in with Google or GitHub instead.

## Extension conflicts and performance

1. Command palette → **Disable All Installed Extensions**, or launch with `cursor --disable-extensions`.
2. Check whether the issue is gone.
3. Re-enable one at a time until it returns. Extensions that supply their own AI completions or intercept shortcuts (other AI assistants above all) are the usual culprits. Disable one from the Extensions panel (`Cmd/Ctrl+Shift+X`) → **Disable**.

High CPU, memory, or input delay usually traces to the same extensions or to indexing. Add generated folders to `.cursorignore` so they are skipped:

```text
dist/
build/
.next/
```

## Reporting bugs

Post on [forum.cursor.com](https://forum.cursor.com) with: Cursor version and OS, steps to reproduce, expected versus actual behavior, screenshots or recordings for visual issues, console errors from **Help** > **Toggle Developer Tools**, and the **request ID** (conversation → **...** → **Copy Request ID**). Request IDs are lookup keys with no meaning outside Cursor's backend, so they are not confidential.

| Privacy setting     | Support can see                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Privacy Mode** on | Which model was used, whether tool failures occurred (not which tools), backend failures unrelated to your prompt or code   |
| **Share Data** on   | The full conversation, tool calls including failures, and the context given to the agent (system prompt, rules, git status) |

Privacy Mode is per request and not retroactive. Connectivity issues can usually be debugged with it on. For unexpected agent behavior, the documented steps are: temporarily enable **Share Data**, reproduce, copy the new request ID, send it, then switch back to **Privacy Mode**.

## CLI troubleshooting

There is no `doctor` command in the Cursor CLI. The documented equivalents:

| Task                          | Command                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Confirm the install           | `agent --version`                                                                   |
| Version, system, account info | `agent about` (or `/about` in a session)                                            |
| Auth state                    | `agent status` or `agent whoami` (`--format json` available)                        |
| Re-authenticate               | `agent logout` then `agent login`                                                   |
| Update                        | `agent update` or `/update`; the CLI also auto-updates by default                   |
| Debug log path                | `/logs` in a session                                                                |
| MCP servers and status        | `agent mcp list`                                                                    |
| Self-hosted worker preflight  | `agent worker debug [--json]`                                                       |
| Sandbox debugging             | `agent sandbox run --sb-debug ...` writes logs to a temp folder and prints the path |

- **`agent: command not found`**: add `~/.local/bin` to `PATH` and reload the shell.
- **Config errors**: `mv ~/.cursor/cli-config.json ~/.cursor/cli-config.json.bad` and restart; the CLI backs up corrupt files as `.bad` and recreates them.
- **Proxy**: set `HTTP_PROXY`, `HTTPS_PROXY`, and `NODE_USE_ENV_PROXY=1`; add `NODE_EXTRA_CA_CERTS=/path/to/corporate-ca-cert.pem` for TLS-inspecting proxies; set `"network": { "useHttp1ForAgent": true }` in `cli-config.json` if HTTP/2 streaming is blocked.
- **Shift+Enter does nothing**: tmux and some terminals swallow it. `Ctrl+J` inserts a newline everywhere, including over SSH; `/setup-terminal` configures keybindings automatically.

See [Cursor CLI](./cli.md).

## Environment tips

- **Fully restart, do not reload**, after network changes. Reload Window keeps inherited environment variables.
- **Set the agent's terminal profile**: `Cmd/Ctrl+Shift+P` → **Terminal: Select Default Profile**. By default the agent takes the first available profile.
- **Keep `.cursorignore` current** as build outputs grow; it speeds indexing and sharpens agent focus ([Managing Context](./context.md)).
- **Watch the context ring** next to the prompt. Near full means the agent works from summaries; start a new chat for the next task.
- **Attach evidence, not descriptions.** Paste screenshots (`Cmd+V`) and use `@Terminals` for real error output. Stay on the **Stable** channel unless you need an Early Access feature.

## Compared with Claude Code

- Claude Code has `/doctor` for installation and configuration diagnostics; Cursor's nearest equivalents are **Run Diagnostics** under Settings > Network for the editor and `agent about` / `agent status` for the CLI. See [Claude Code Debugging](../claude-code/debugging.md).
- Cursor's bug-report workflow centers on the request ID from the **...** menu and **Toggle Developer Tools** console errors, with Privacy Mode explicitly limiting what support can reconstruct.
- Claude Code recommends a standalone terminal over an IDE terminal for stability; in Cursor the agent lives in the editor, so the analogous advice is picking the right default terminal profile and ruling out extensions with `--disable-extensions`.
- Cursor's Debug Mode (instrument, reproduce, analyze logs) targets your application; Claude Code's guidance is to run log-producing processes as background terminal tasks so it can read them.
