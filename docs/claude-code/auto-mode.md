---
sidebar_position: 6
sidebar_label: Auto Mode
description: Use Claude Code auto mode for AI-driven permission decisions that automatically approve safe actions and block risky ones.
keywords: [Claude Code auto mode, enable-auto-mode, permission classifier, auto approve, safe actions, auto mode configuration, permission modes, Claude Code security]
---

# Auto Mode

Auto mode is a permission mode that uses a separate **classifier model** (configured server-side, independent of your session model) to evaluate each tool call before execution. Safe actions proceed automatically, risky ones get blocked. It sits between the default interactive mode (asks every time) and `--dangerously-skip-permissions` (no checks at all).

:::info Research Preview
Auto mode is a **research preview**. It reduces prompts but does not guarantee safety, so use it for tasks where you trust the general direction, not as a replacement for review on sensitive operations.
:::

## How to enable

Auto mode requires Claude Code v2.1.83 or later. Once your account meets the [requirements](#availability), enable it in one of these ways:

**Shift+Tab cycle:** When your account is eligible, `auto` appears in the permission mode cycle (after `plan`). Cycling to it shows an opt-in prompt the first time; accept it to start using auto mode.

**Persistent default via settings:** Set `defaultMode` in your **user** settings (`~/.claude/settings.json`):

```json
{
  "permissions": {
    "defaultMode": "auto"
  }
}
```

Claude Code ignores `defaultMode: "auto"` in project (`.claude/settings.json`) or local settings, so a repository cannot grant itself auto mode.

**VS Code / Desktop app:** Select Auto mode from the permission mode selector once your account is eligible. (The `claudeCode.initialPermissionMode` VS Code setting does not accept `auto`; use the `defaultMode` user setting to start in auto mode.)

**Bedrock / Vertex AI / Foundry:** Auto mode is off until you set `CLAUDE_CODE_ENABLE_AUTO_MODE=1` (requires v2.1.158 or later). Only Opus 4.7 and Opus 4.8 are supported on these providers.

**Team/Enterprise:** An admin must enable auto mode in Claude Code admin settings before individual users can access it.

## How it works

1. Before each tool call, a **classifier** (a server-configured model, independent of your `/model` selection) reviews the conversation context and proposed action.
2. **Safe actions** (file edits within the working directory, read-only operations) proceed automatically without prompting.
3. **Risky actions** (mass file deletions, data exfiltration attempts, malicious code execution, prompt injection patterns) get **blocked**, and Claude tries a different approach. This also covers destructive git commands such as `git reset --hard`, `git clean -fd`, and `git stash drop` when you did not ask to discard local work, and `terraform destroy` unless you asked for that specific stack.
4. Read-only actions and file edits in the working directory do **not** trigger a classifier call. Shell commands and network operations do. (Set `autoMode.classifyAllShell` to `true` to route every Bash and PowerShell command through the classifier instead.)

### Circuit breaker

If the classifier blocks an action **3 times in a row** or **20 times total** in one session, auto mode pauses and Claude reverts to prompting for each action. Approving the prompted action resumes auto mode. Any allowed action resets the consecutive counter, while the total counter persists for the session. These thresholds are not configurable. In non-interactive mode (`-p`), repeated blocks abort the session since there is no user to prompt.

## Comparison with other permission modes

| Mode | Flag | Behavior |
|------|------|----------|
| **default** | (none) | Asks for confirmation on every sensitive operation |
| **acceptEdits** | `--permission-mode acceptEdits` | Auto-approves file edits and common filesystem commands (`mkdir`, `touch`, `rm`, `mv`, `cp`, `sed`) in the working directory; other bash commands still prompt |
| **plan** | `--permission-mode plan` | Read-only; Claude can analyze but not make changes |
| **auto** | Shift+Tab cycle or `defaultMode: auto` | Classifier auto-approves safe actions, blocks risky ones |
| **bypassPermissions** | `--dangerously-skip-permissions` | Auto-approves everything; no safety checks (hooks still run) |
| **dontAsk** | `--permission-mode dontAsk` | Converts any permission prompt into a denial; only pre-approved tools run |

## Configuration

Auto mode behavior is customizable via four sections in your `autoMode` settings:

| Section | Purpose |
|---------|---------|
| `environment` | An array of plain-English strings describing your org: company name, source control orgs, cloud providers, trusted buckets, trusted domains, compliance constraints. Write entries as you would describe your infrastructure to a new engineer. |
| `hard_deny` | Unconditional security boundaries. These block even when the user explicitly asks, and cannot be overridden by an `allow` exception. |
| `soft_deny` | Destructive or risky actions that block unless the user's message specifically and directly describes that exact action, or an `allow` rule clears it. |
| `allow` | Exceptions that override matching `soft_deny` rules (no effect on `hard_deny`). |

### Configuration rules

- Setting `environment`, `hard_deny`, `soft_deny`, or `allow` without `"$defaults"` **replaces the entire default list** for that section. A `soft_deny` array without `"$defaults"` discards every built-in soft block (force push, `curl | bash`, production deploys); a `hard_deny` array without it discards the built-in data-exfiltration and auto-mode-bypass rules.
- Include the literal string `"$defaults"` anywhere in an array to splice in the built-in default rules at that position. This keeps the built-in protections while adding your own.
- Each section is evaluated independently, so setting `environment` alone leaves the default `hard_deny`, `soft_deny`, and `allow` lists intact.
- **Classifier precedence (first match wins):** `hard_deny` → `soft_deny` → `allow` (exceptions to `soft_deny`) → explicit user intent. If the user's message directly and specifically describes the exact action Claude is about to take, the classifier allows it even when a `soft_deny` rule matches. General requests (like "clean up the repo") do not count as explicit intent.
- The classifier is a second gate that runs *after* the [permissions system](./permissions.md). For actions that must never run regardless of intent, use `permissions.deny` in managed settings, which blocks before the classifier is consulted and cannot be overridden.

Use `claude auto-mode defaults` to print the built-in rules, and `claude auto-mode config` to see the effective configuration with your settings applied.

Set `autoMode.classifyAllShell` to `true` to send every Bash and PowerShell command through the classifier, rather than only the shell and network operations that are not already recognized as safe. When the classifier blocks an action, the denial reason is shown in the transcript, the denial toast, and `/permissions`.

### Example configuration

```json
{
  "autoMode": {
    "environment": [
      "$defaults",
      "Organization: Acme Corp. Primary use: software development",
      "Source control: github.com/acme-corp and all repos under it",
      "Cloud provider(s): AWS",
      "Trusted cloud buckets: s3://acme-build-artifacts",
      "Trusted internal domains: *.acme.internal, api.internal.acme.com"
    ],
    "allow": [
      "$defaults",
      "Run npm and node commands",
      "Read and write files in the project directory"
    ],
    "soft_deny": [
      "$defaults",
      "Delete more than 5 files at once",
      "Run commands that access production databases"
    ],
    "hard_deny": [
      "$defaults",
      "Never send repository contents to third-party code-review APIs"
    ]
  }
}
```

## CLI inspection commands

Use these subcommands to inspect and validate your auto mode configuration:

```bash
# Print built-in default rules
claude auto-mode defaults

# Show effective config (your settings where set, defaults otherwise)
claude auto-mode config

# Get AI feedback on your custom rules
claude auto-mode critique
```

## Availability

| Requirement | Detail |
|-------------|--------|
| **Plans** | All plans. On Team and Enterprise, an admin must enable it in Claude Code admin settings first. |
| **Models (Anthropic API)** | Claude Opus 4.6 or later, or Sonnet 4.6 |
| **Models (Bedrock / Vertex / Foundry)** | Opus 4.7 and Opus 4.8 only, with `CLAUDE_CODE_ENABLE_AUTO_MODE=1` set |
| **Not supported** | Sonnet 4.5, Opus 4.5, Haiku, and Claude 3 models on any provider |
| **Enterprise opt-out** | Admins can disable with `permissions.disableAutoMode: "disable"` in managed settings |

## Caveats

- **Token usage:** Auto mode may slightly increase token consumption, cost, and latency due to classifier calls on shell and network operations.
- **Not a hard sandbox:** The classifier uses in-context reasoning. Anthropic recommends using auto mode in **sandboxed environments** to limit potential damage.
- **Research preview:** Behavior and configuration options may change before general availability.
