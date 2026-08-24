---
sidebar_position: 6
sidebar_label: Auto Mode
description: Use Claude Code auto mode for AI-driven permission decisions that automatically approve safe actions and block risky ones.
keywords: [Claude Code auto mode, enable-auto-mode, permission classifier, auto approve, safe actions, auto mode configuration, permission modes, Claude Code security]
---

# Auto Mode

Auto mode is a permission mode that uses a separate **classifier model** to evaluate each tool call before execution. Safe actions proceed automatically, risky ones get blocked. It sits between Manual mode (asks every time) and `--dangerously-skip-permissions` (no checks at all). Requires Claude Code v2.1.83 or later.

On **Pro, Max, and Team plans**, auto mode is now the built-in **starting permission mode** for new terminal and VS Code sessions, once your account and model support it. This requires v2.1.228 or later on macOS, Linux, and WSL, and v2.1.233 or later on native Windows; on earlier versions, and on Enterprise plans, the Anthropic API, and cloud providers, new sessions still start in Manual mode.

:::warning
Auto mode reduces permission prompts but does not guarantee safety. Use it for tasks where you trust the general direction, not as a replacement for review on sensitive operations. Anthropic recommends running auto mode inside a [sandboxed environment](#caveats) for defense in depth.
:::

## How sessions start in auto mode

On Pro, Max, and Team plans, new terminal and [VS Code](https://code.claude.com/docs/en/vs-code) sessions start in auto mode automatically once your account meets the [availability requirements](#availability). The first time this happens, Claude Code shows a one-time notice linking to the docs. You can switch to another mode at any time with **Shift+Tab**.

On **Enterprise** plans, the **Anthropic API**, and cloud providers (Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry), sessions start in **Manual** mode by default. Auto mode still appears in the Shift+Tab cycle where the plan, provider, and model support it.

**Shift+Tab cycle:** from auto, the first press switches to Manual (`default`); the cycle then runs `default → acceptEdits → plan` and back, with `auto` slotting in after `plan`.

**Persistent default via settings:** set `defaultMode` in your **user** settings (`~/.claude/settings.json`) to pin the starting mode:

```json
{
  "permissions": {
    "defaultMode": "auto"
  }
}
```

As of v2.1.142, Claude Code ignores `defaultMode: "auto"` in project and local settings (`.claude/settings.json`, `.claude/settings.local.json`) so a repository cannot grant itself auto mode. Set it in user settings instead. If you set a `defaultMode` other than `auto` in your user settings on Pro, Max, or Team, your sessions keep starting in that mode, and Claude Code asks once whether to switch the setting to auto mode.

**VS Code / Desktop app:** select auto mode from the permission mode indicator, or leave the extension's `claudeCode.initialPermissionMode` unset so eligible sessions start in Auto.

**Team/Enterprise:** auto mode is available by default. An admin can turn it off for the organization by setting `permissions.disableAutoMode` to `"disable"` in [managed settings](https://code.claude.com/docs/en/managed-settings).

**Bedrock / Google Cloud's Agent Platform / Foundry:** From v2.1.207, auto mode is available by default on these providers, with no opt-in required, but it appears in the Shift+Tab cycle rather than becoming the starting mode. (In v2.1.158 through v2.1.206 it was off until you set `CLAUDE_CODE_ENABLE_AUTO_MODE=1`; that variable is still accepted for compatibility but has no effect from v2.1.207 onward.) See [Availability](#availability).

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
| **default** (Manual) | (none) | Asks for confirmation on every sensitive operation |
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

# Restore the default auto-mode configuration (add --yes to skip the prompt)
claude auto-mode reset
```

## Availability

| Requirement | Detail |
|-------------|--------|
| **Plans** | All plans (Pro, Max, Team, Enterprise, and the Anthropic API). On Team and Enterprise, auto mode is available by default and an admin can turn it off. On **Pro, Max, and Team** it is the built-in starting permission mode; elsewhere sessions start in Manual. |
| **Models** | On the Anthropic API and Claude Platform on AWS: Claude Opus 4.6 or later, Sonnet 4.6 or later, or Fable 5. On Amazon Bedrock, Google Cloud's Agent Platform, and Microsoft Foundry: only Claude Sonnet 5, Opus 4.7 or later, and Fable 5. |
| **Providers** | Available by default on the Anthropic API, Claude Platform on AWS, Amazon Bedrock, Google Cloud's Agent Platform, and Microsoft Foundry. From v2.1.207 no opt-in is required; in v2.1.158 through v2.1.206, Bedrock, Agent Platform, and Foundry needed `CLAUDE_CODE_ENABLE_AUTO_MODE=1`. The variable is still accepted for compatibility but has no effect from v2.1.207 onward. |
| **Not available** | Sonnet 4.5, Opus 4.5, Haiku, and Claude 3 models on any provider |
| **Enterprise opt-out** | Admins can disable with `permissions.disableAutoMode` set to `"disable"` in managed settings |

## Caveats

- **Token usage:** On **Pro, Max, and Team** plans, the classifier calls auto mode makes do **not** count toward your usage limits. On **Enterprise** plans and on accounts that use the Claude API, Claude Platform on AWS, Amazon Bedrock, Google Cloud's Agent Platform, or Microsoft Foundry, classifier calls count toward token usage, adding some cost and latency on shell and network operations. Reads and working-directory edits skip the classifier.
- **Not a hard sandbox:** The classifier uses in-context reasoning. Anthropic recommends using auto mode in **sandboxed environments** to limit potential damage.
- **Not a safety guarantee:** Auto mode reduces prompts but does not replace review on sensitive operations.
