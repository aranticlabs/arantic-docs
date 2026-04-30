---
sidebar_position: 6
sidebar_label: Auto Mode
description: Use Claude Code auto mode for AI-driven permission decisions that automatically approve safe actions and block risky ones.
keywords: [Claude Code auto mode, enable-auto-mode, permission classifier, auto approve, safe actions, auto mode configuration, permission modes, Claude Code security]
---

# Auto Mode

Auto mode is a permission mode that uses a **classifier model** (Claude Sonnet 4.6) to evaluate each tool call before execution. Safe actions proceed automatically, risky ones get blocked. It sits between the default interactive mode (asks every time) and `--dangerously-skip-permissions` (no checks at all).

:::info Research Preview
Auto mode is currently a **research preview** for Team plan users. Enterprise and API support is rolling out. It requires Claude Sonnet 4.6 or Opus 4.6 as the session model.
:::

## How to enable

**CLI:**

```bash
claude --enable-auto-mode
```

This adds `auto` to the permission mode cycle accessible via **Shift+Tab** (`default` → `acceptEdits` → `plan` → `auto`).

**VS Code / Desktop app:** Enable auto mode in Settings → Claude Code, then select it from the permission mode dropdown.

**Team/Enterprise:** An admin must enable auto mode in Claude Code admin settings before individual users can access it.

## How it works

1. Before each tool call, a **classifier** (always Claude Sonnet 4.6, regardless of your session model) reviews the conversation context and proposed action.
2. **Safe actions** (file edits within the working directory, read-only operations) proceed automatically without prompting.
3. **Risky actions** (mass file deletions, data exfiltration attempts, malicious code execution, prompt injection patterns) get **blocked**, and Claude tries a different approach.
4. Read-only actions and file edits in the working directory do **not** trigger a classifier call. Shell commands and network operations do.

### Circuit breaker

If the classifier blocks an action **3 times in a row** or **20 times total** in one session, auto mode pauses and Claude reverts to prompting for each action. These thresholds are not configurable.

## Comparison with other permission modes

| Mode | Flag | Behavior |
|------|------|----------|
| **default** | (none) | Asks for confirmation on every sensitive operation |
| **acceptEdits** | `--permission-mode acceptEdits` | Auto-approves file edits; bash commands still prompt |
| **plan** | `--permission-mode plan` | Read-only; Claude can analyze but not make changes |
| **auto** | `--enable-auto-mode` | Classifier auto-approves safe actions, blocks risky ones |
| **bypassPermissions** | `--dangerously-skip-permissions` | Auto-approves everything; no safety checks (hooks still run) |
| **dontAsk** | `--permission-mode dontAsk` | Converts any permission prompt into a denial; only pre-approved tools run |

## Configuration

Auto mode behavior is customizable via three sections in your settings:

| Section | Purpose |
|---------|---------|
| `environment` | An array of plain-English strings describing your org: company name, source control orgs, cloud providers, trusted buckets, trusted domains, compliance constraints. Write entries as you would describe your infrastructure to a new engineer. |
| `allow` | Actions the classifier should always permit (replaces the entire default list if set) |
| `soft_deny` | Actions the classifier should block unless the user's message specifically and directly describes that exact action (replaces the entire default list if set) |

### Configuration rules

- Setting `allow` or `soft_deny` **replaces the entire default list** for that section unless you include `"$defaults"` in the array.
- Include the literal string `"$defaults"` anywhere in an array to splice in the built-in default rules at that position. This keeps the built-in protections while adding your own.
- Setting `environment` alone (without `allow` or `soft_deny`) leaves defaults for `allow` and `soft_deny` intact.
- Evaluation order: **deny → ask → allow** (first match wins).
- If the user's message directly describes the exact action Claude is about to take, the classifier allows it even if a `soft_deny` rule matches. General requests (like "clean up the repo") do not override `soft_deny`.

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
| **Plans** | Team (now), Enterprise and API rolling out |
| **Models** | Claude Sonnet 4.6 and Opus 4.6 only |
| **Not available** | Haiku, Claude 3 models, third-party providers (Bedrock, Vertex, Foundry) |
| **Enterprise opt-out** | Admins can disable with `"disableAutoMode": "disable"` in managed settings |

## Caveats

- **Token usage:** Auto mode may slightly increase token consumption, cost, and latency due to classifier calls on shell and network operations.
- **Not a hard sandbox:** The classifier uses in-context reasoning. Anthropic recommends using auto mode in **sandboxed environments** to limit potential damage.
- **Research preview:** Behavior and configuration options may change before general availability.
