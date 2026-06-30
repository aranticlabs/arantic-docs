---
sidebar_position: 6
sidebar_label: Auto Mode
description: Use Claude Code auto mode for AI-driven permission decisions that automatically approve safe actions and block risky ones.
keywords: [Claude Code auto mode, enable-auto-mode, permission classifier, auto approve, safe actions, auto mode configuration, permission modes, Claude Code security]
---

# Auto Mode

Auto mode is a permission mode that uses a separate **classifier model** to evaluate each tool call before execution. Safe actions proceed automatically, risky ones get blocked. It sits between the default interactive mode (asks every time) and `--dangerously-skip-permissions` (no checks at all). Requires Claude Code v2.1.83 or later.

:::info Research Preview
Auto mode is a **research preview**. It reduces prompts but does not guarantee safety, so behavior and configuration options may change before general availability. Use it for tasks where you trust the general direction, not as a replacement for review on sensitive operations.
:::

## How to enable

Auto mode appears in the **Shift+Tab** permission-mode cycle once your account meets the [availability requirements](#availability). The first time you cycle to it, Claude Code shows an opt-in prompt; accept it to activate auto mode, or select **No, don't ask again** to remove it from the cycle.

```text
default → acceptEdits → plan → auto
```

**Persistent default via settings:** set `defaultMode` in your **user** settings (`~/.claude/settings.json`):

```json
{
  "permissions": {
    "defaultMode": "auto"
  }
}
```

As of v2.1.142, Claude Code ignores `defaultMode: "auto"` in project and local settings (`.claude/settings.json`, `.claude/settings.local.json`) so a repository cannot grant itself auto mode. Set it in user settings instead.

**VS Code / Desktop app:** Enable auto mode in Settings → Claude Code, then select it from the permission mode dropdown.

**Team/Enterprise:** An admin must enable auto mode in [Claude Code admin settings](https://claude.ai/admin-settings/claude-code) before individual users can access it.

**Bedrock / Vertex AI / Foundry:** Auto mode is off until you set the `CLAUDE_CODE_ENABLE_AUTO_MODE` environment variable to `1` (Claude Code v2.1.158 or later). See [Availability](#availability).

## How it works

1. Before each tool call, a **classifier** (a server-configured model, independent of your `/model` selection) reviews the conversation context and proposed action.
2. **Safe actions** (file edits within the working directory, read-only operations) proceed automatically without prompting.
3. **Risky actions** (mass file deletions, data exfiltration attempts, malicious code execution, prompt injection patterns) get **blocked**, and Claude tries a different approach.
4. Read-only actions and file edits in the working directory do **not** trigger a classifier call. Shell commands and network operations do.

### Circuit breaker

If the classifier blocks an action **3 times in a row** or **20 times total** in one session, auto mode pauses and Claude reverts to prompting for each action. Approving the prompted action resumes auto mode. Any allowed action resets the consecutive counter, while the total counter persists for the session. These thresholds are not configurable. In non-interactive mode (`-p`), repeated blocks abort the session since there is no user to prompt.

## Comparison with other permission modes

| Mode | Flag | Behavior |
|------|------|----------|
| **default** | (none) | Asks for confirmation on every sensitive operation |
| **acceptEdits** | `--permission-mode acceptEdits` | Auto-approves file edits and common filesystem commands (`mkdir`, `touch`, `rm`, `mv`, `cp`, `sed`) in the working directory; other bash commands still prompt |
| **plan** | `--permission-mode plan` | Read-only; Claude can analyze but not make changes |
| **auto** | `--permission-mode auto` | Classifier auto-approves safe actions, blocks risky ones |
| **bypassPermissions** | `--dangerously-skip-permissions` | Auto-approves everything; no safety checks (hooks still run) |
| **dontAsk** | `--permission-mode dontAsk` | Converts any permission prompt into a denial; only pre-approved tools run |

## Configuration

Auto mode behavior is customizable via four sections in your settings:

| Section | Purpose |
|---------|---------|
| `environment` | An array of plain-English strings describing your org: company name, source control orgs, cloud providers, trusted buckets, trusted domains, compliance constraints. Write entries as you would describe your infrastructure to a new engineer. |
| `hard_deny` | Unconditional security boundaries. These block even when user intent or an `allow` rule matches (replaces the entire default list if set). |
| `soft_deny` | Destructive actions the classifier should block unless the user's message specifically and directly describes that exact action (replaces the entire default list if set) |
| `allow` | Exceptions that override matching `soft_deny` rules (replaces the entire default list if set) |

### Configuration rules

- Setting any of `environment`, `hard_deny`, `soft_deny`, or `allow` **replaces the entire default list** for that section unless you include `"$defaults"` in the array.
- Include the literal string `"$defaults"` anywhere in an array to splice in the built-in default rules at that position. This keeps the built-in protections while adding your own. A `soft_deny` or `hard_deny` array without `"$defaults"` discards every built-in protection in that tier.
- Each section is evaluated independently, so setting `environment` alone leaves the default `allow`, `soft_deny`, and `hard_deny` lists intact.
- Precedence inside the classifier works in four tiers:
  1. `hard_deny` rules block unconditionally. User intent and `allow` exceptions do not apply.
  2. `soft_deny` rules block next. User intent and `allow` exceptions can override these.
  3. `allow` rules override matching `soft_deny` rules as exceptions.
  4. Explicit user intent overrides remaining soft blocks: if the user's message directly and specifically describes the exact action Claude is about to take, the classifier allows it even when a `soft_deny` rule matches. General requests (like "clean up the repo") do not count as explicit intent.

Use `claude auto-mode defaults` to print the built-in rules, and `claude auto-mode config` to see the effective configuration with your settings applied.

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

For tool-pattern hard blocks that run *before* the classifier and cannot be overridden, use [`permissions.deny`](./permissions.md) in managed settings instead.

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
| **Plans** | All plans (Pro, Max, Team, Enterprise, and the Anthropic API). On Team and Enterprise, an admin must enable it first. |
| **Models** | On the Anthropic API: Claude Opus 4.6 or later, or Sonnet 4.6. On Bedrock, Vertex AI, and Foundry: only Opus 4.7 and Opus 4.8. |
| **Providers** | Available by default on the Anthropic API. On Amazon Bedrock, Google Vertex AI, and Microsoft Foundry, set `CLAUDE_CODE_ENABLE_AUTO_MODE=1` (v2.1.158+) to enable it. |
| **Not available** | Sonnet 4.5, Opus 4.5, Haiku, and Claude 3 models on any provider |
| **Enterprise opt-out** | Admins can disable with `permissions.disableAutoMode` set to `"disable"` in managed settings |

## Caveats

- **Token usage:** Auto mode may slightly increase token consumption, cost, and latency due to classifier calls on shell and network operations.
- **Not a hard sandbox:** The classifier uses in-context reasoning. Anthropic recommends using auto mode in **sandboxed environments** to limit potential damage.
- **Research preview:** Behavior and configuration options may change before general availability.
