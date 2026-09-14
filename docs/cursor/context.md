---
sidebar_position: 4
sidebar_label: Managing Context
description: How Cursor Agent builds context from search, @-mentions, and rules, how summarization and Max Mode work, and how to keep long sessions productive.
keywords:
  [
    Cursor context,
    context window,
    at-mentions,
    .cursorignore,
    Max Mode,
    summarization,
    side chats,
    checkpoints,
    Instant Grep,
    Explore subagent,
  ]
---

# Managing Context

Every Agent conversation shares one fixed context window with the model. Rules, tool definitions, the files Agent reads, its own replies, and your messages all compete for that space. Output quality drops as the window fills, so knowing what goes in, how to see it, and when to reset is one of the highest-leverage skills in Cursor.

## How Cursor builds context

Agent starts each turn with a system prompt, the applicable [rules](./rules.md), skill descriptions, MCP instructions, and subagent documentation. Everything else it pulls in on demand with tools:

- **Search files and folders**: find files by name, read directory structures, and grep for exact keywords or patterns. Cursor ships **Instant Grep**, a custom search engine with full regex and word-boundary support that it uses automatically when you mention specific symbols (for example `PaymentFailedError` or `import.*PaymentService`).
- **Read files**: read file contents, including images (`.png`, `.jpg`, `.gif`, `.webp`, `.svg`) for vision-capable models.
- **Web**: generate search queries and fetch pages.
- **Fetch Rules**: pull in `description`-based rules when they look relevant.
- **Explore subagent**: for broad questions, Agent can spawn an Explore subagent that runs many parallel searches in its own context window with a faster model and returns only the findings. This keeps raw file dumps out of the main conversation. You can ask for it directly: "use a subagent to find all the places we validate user input."

File paths are encrypted before being sent to Cursor's servers, and code content is never stored in plaintext. To use your own key, create `.cursor/keys` in the workspace root with `{ "path_decryption_key": "..." }`.

There is no limit on the number of tool calls Agent can make during a task, which is exactly why unbounded exploration can crowd out the work itself. Point Agent at the right files when you know them.

:::note
Cursor's current documentation describes search in terms of Instant Grep and the Explore subagent. It no longer documents a separate embeddings-based "codebase indexing" step or an `@Codebase` symbol; the **Indexing** section in Cursor Settings is where ignore-file settings now live.
:::

## `@`-mentions

Type `@` in the chat input to attach context deliberately. Start typing after `@` and Cursor shows matching suggestions. You can attach several items in one message.

| Mention                           | What it attaches                                                          |
| --------------------------------- | ------------------------------------------------------------------------- |
| `@auth.ts`, `@src/components/`    | A file or a folder (type `/` after selecting a folder to navigate deeper) |
| `@Terminals`                      | Output from your terminals                                                |
| `@Chats`                          | Context from a previous conversation, including side chats                |
| `@Commit (Diff of Working State)` | Your uncommitted changes                                                  |
| `@Branch (Diff with Main)`        | The full diff of your branch against main                                 |
| `@Browser`                        | State and screenshots from the built-in browser                           |
| `@rule-name`                      | A manual rule from `.cursor/rules/` (see [Rules](./rules.md))             |

**When to mention.** Use `@` when you know which files matter. "Update `@UserCard.tsx` and `@UserCard.test.tsx` to accept an optional avatar prop" saves a search round-trip and prevents Agent from editing a look-alike file. When you do not know which files matter, skip it; Agent's own search is good and mentioning the wrong file anchors it in the wrong place.

**Weak:**

```text
@src/ fix the login bug
```

Attaching a whole source tree floods the window with irrelevant files.

**Strong:**

```text
Login fails with "invalid token" after a password reset.
Start from @src/auth/session.ts and @src/auth/reset.ts. The failing test is in @tests/auth/reset.test.ts.
```

Other ways to add context without typing `@`:

- Select code and press `Cmd+Shift+L` to add it to the current chat, or `Cmd+L` to start a new chat with it.
- Copy code or a log and press `Cmd+V` in the chat input to attach it as context (`Cmd+Shift+V` pastes it as plain text instead).
- Drag an image into the input or paste a screenshot; useful for mockups and error dialogs.

`.cursorignore` applies to `@`-mentions too: ignored files cannot be attached.

## Seeing what is in the window

The **context ring** next to the prompt input shows how full the window is. Click it to open a breakdown of tokens by category:

| Category                | Contents                                                 |
| ----------------------- | -------------------------------------------------------- |
| System prompt           | Cursor's built-in instructions for the model             |
| Tools                   | Definitions of every tool available to Agent             |
| Rules                   | Project and user rules included in this prompt           |
| Skills                  | Skill descriptions injected into the system context      |
| MCP                     | Instructions and tool catalog from connected MCP servers |
| Subagents               | Documentation for the subagent types Agent can launch    |
| Summarized conversation | Compressed summaries of earlier turns                    |
| Conversation            | Your messages, Agent's replies, and tool results         |

Hover a segment to highlight it. If **Tools** or **MCP** is large before you have typed anything, you have too many MCP servers enabled; disable the ones this project does not need (see [MCP](./mcp.md)).

## Summarization

When the window gets close to full, Cursor compresses older parts of the conversation into a summary to make room. This happens automatically in the IDE. In the CLI you can trigger it yourself with `/summarize` (alias `/compress`).

Summaries lose detail. Decisions, exact error messages, and the reasons a previous approach failed are the first things to blur. Do not rely on a long conversation to carry precise state:

- Put lasting decisions into a rule or `AGENTS.md` (ask Agent: "add this to AGENTS.md").
- Save Plan-mode plans to the workspace so the plan survives the conversation.
- Start a new chat for a new task instead of continuing a full one.

## New chats versus long ones

Start a new chat (`Cmd+N`, or `/clear` in the CLI) when you change tasks. Each mode also uses its own context, so switching between Agent, Ask, Plan, and Debug starts a fresh window; Cursor's own guidance is to start a new chat when changing tasks for the best results.

Keep one chat going when the follow-ups genuinely depend on what Agent just did: a fix, then its tests, then a small refactor of the same code. Split when the next step is a different feature, a different part of the repository, or a question you could ask cold.

To bring old context forward without dragging the whole transcript along, mention the previous chat with `@Chats` or `/fork` from a specific message. Forking from a message copies the conversation through that message and drops everything after it.

## Side chats

Side chats are child conversations attached to a parent chat. The parent's history is copied in as hidden reference context, but the side chat has its own visible transcript, so a tangent does not consume the main window.

| Action                    | How                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Open an empty side chat   | `/side` in the chat input                                                                  |
| Open and send immediately | `/side why does the retry loop in fetchUser never exit?`                                   |
| From a selection          | Select text or a diff in the chat, choose **Ask in Side Chat**                             |
| Shortcut                  | `Shift+Cmd+S` (`Shift+Ctrl+S`) populates a side chat with the current transcript selection |
| Bring findings back       | `@`-mention the side chat in the main thread                                               |
| Close                     | Click the **X**; this archives the side chat, it does not delete it                        |

By default side chats focus on reading, searching, and answering, so the main agent keeps working. They support follow-ups, stay attached to the parent even if you navigate away, cannot be nested, and are local-only (not yet available for Cloud Agents). A side chat is not a fork: forking copies the transcript into a new independent chat, a side chat only seeds the model with the parent history.

## Conversation search

Cursor keeps a local search index over past agent conversations that scales to thousands of chats.

- **Across conversations**: open the Agents Window and press `Cmd+K` to search past transcripts.
- **Within a conversation**: press `Cmd+F` and jump between matches with the counter.
- **By Agent itself**: conversation search is also an agent tool. When Agent needs something you discussed before, it can query your past conversations without you remembering which chat it was in.

This is the closest thing Cursor has to cross-session memory. It is retrieval, not a persistent note store; if you want a decision to apply every time, write it into a rule.

## Ignore files

`.cursorignore` in the project root controls which files Agent, Tab, Inline Edit, and `@`-mentions can access. It uses `.gitignore` syntax:

```text
# .cursorignore
dist/
coverage/
*.min.js
.env*
fixtures/large-dump.json
!fixtures/README.md
```

| Pattern    | Meaning                             |
| ---------- | ----------------------------------- |
| `*`        | Any characters except `/`           |
| `**`       | Any characters including `/`        |
| `?`        | A single character                  |
| `!pattern` | Un-ignore a previously ignored path |
| `# ...`    | Comment                             |

What you need to know:

- Cursor already respects `.gitignore` and a built-in default list (lock files, `.env*`, `.git/`, `node_modules/`, images, archives, and similar). `.cursorignore` is for exclusions beyond those. Override a default with a `!` entry.
- **Terminal commands and MCP tools run outside Cursor's file access controls.** They can still read an ignored file. Treat `.cursorignore` as context hygiene and a first line of defense, not as a security boundary.
- Negation cannot re-include a file whose parent directory is excluded with `*`, because excluded directories are not traversed. Exclude the nested directory explicitly and then negate inside it.
- **Hierarchical ignore**: enable **Cursor Settings > Indexing > Ignore Files > Hierarchical Cursor Ignore** (older versions: **Features > Editor**) to have Cursor look for `.cursorignore` files in parent directories.
- **Global ignore**: add patterns in user settings to exclude sensitive files in every project (for example `**/.env`, `**/credentials.json`, `**/*.pem`, `**/id_rsa`). The global list is empty by default.
- Test a pattern with `git check-ignore -v <file>`.

:::note
Cursor's current documentation describes only `.cursorignore`. A separate `.cursorindexingignore` file is not documented; do not depend on it.
:::

## Context window size, Max Mode, and long context

Each model has its own context window, and the [models page](https://cursor.com/docs/models-and-pricing) is the source of truth for sizes and surcharges. Several current models (Claude Sonnet 5, Opus 5, and Opus 4.8, the GPT-5.6 family) support extended context up to 1M tokens; some charge the same per-token rate throughout, while others charge 2x input pricing on long context or above a threshold such as 272k tokens. On current usage-based plans you pay per token, so a bigger window costs more per turn the fuller it gets.

**Max Mode** exists only on legacy request-based plans. It extends a model's window beyond the default and bills at the model's API rate plus 20%. Toggle it in the model picker (or `/max-mode` in the CLI); models that require it enable it automatically. The default window is enough for most coding tasks. Larger windows do not remove the need to manage context: more room for stale tool output is not the same as more attention on the current task.

## Thinking and effort

Cursor exposes reasoning depth through the model picker rather than a global effort command:

- Several models have a **thinking variant** (for example the Claude Fable 5.1 thinking variant, which Cursor recommends at the high setting for hardest problems, and GPT-5 `-high` variants). Choose the variant in the picker or with `/model` in the CLI.
- Grok 4.6 and Grok 4.5 have selectable **effort levels** on Pro and above. On the Start plan they are fixed at medium and Fast mode is unavailable.
- **Fast mode** trades price for latency on models that offer it (Grok, Composer, several Claude and GPT variants); it does not change context size.
- Show or hide reasoning with `/show-thinking` in the CLI or `display.showThinkingBlocks` in `cli-config.json`. Thinking is never emitted in CLI print mode.

Use a thinking variant for architecture, tricky bugs, and plans. Use a faster, cheaper model for exploration and mechanical edits, then switch mid-conversation with `Cmd+/` when the hard part starts; the change applies from that point on.

## Checkpoints and restoring

Agent saves a checkpoint of all modified files before significant changes. If a turn goes wrong:

1. Click any checkpoint in the chat timeline to preview the files at that point.
2. Click **Restore Checkpoint** (bottom right of a previous request, or the `+` button when hovering a message) to revert all files to that state.

Restoring reverts files only; the conversation keeps its messages. To shorten the conversation as well, fork from an earlier message. Checkpoints are stored locally, separate from Git, and are only for undoing Agent changes; use Git for anything permanent. In the CLI, `/rewind` jumps back to a previous message (enable with `rewind: true` in `cli-config.json` if it is off).

## Practical guidance

**What works well**

- Mention the two or three files that matter; let Agent search for the rest.
- Ask for an Explore subagent when the question is "where in this repo do we..." so the raw search results stay out of your window.
- Watch the context ring. When it is past half, finish the current step, write down what matters (rule, plan, or commit), and start fresh.
- Use side chats for "wait, how does X work?" questions during a long task.
- Keep `.cursorignore` current in monorepos so search does not surface other teams' generated code.

**What to avoid**

- Attaching whole directories "just in case".
- Running a dozen MCP servers in every project; their tool catalogs load on every turn.
- Continuing a summarized conversation for precise follow-ups (exact stack traces, earlier decisions) without re-attaching the source.
- Trusting `.cursorignore` to hide secrets from shell commands or MCP tools.

## Compared with Claude Code

| Topic                             | Cursor                                                | Claude Code                                    |
| --------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| See context usage                 | Context ring and breakdown tray                       | `/context` grid, status line                   |
| Manual compaction                 | `/summarize` (CLI); automatic in the IDE              | `/compact [instructions]`                      |
| Keep noise out of the main window | Explore subagent, side chats                          | Subagents                                      |
| Exclude files                     | `.cursorignore`, global ignore list                   | Permission `deny` rules for `Read`             |
| Extended context                  | Per-model long context; Max Mode on legacy plans only | Model-dependent                                |
| Effort control                    | Thinking variants and per-model effort in the picker  | `/effort`, `--effort`, `Option+T`              |
| Undo                              | Checkpoints (files only), `/rewind` in the CLI        | `/rewind`, `Esc` `Esc` (code and conversation) |

See [Claude Code Managing Context](../claude-code/context.md) for the Claude Code side.
