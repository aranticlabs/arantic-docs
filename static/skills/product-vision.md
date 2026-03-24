---
name: product-vision
description: Creates structured product vision documents that feed into the write-prd skill for detailed PRD generation, and produces Jira-ready epic descriptions for easy copy-paste. Use this skill whenever a user has a product idea, wants to articulate a vision before jumping into PRDs, says things like "I have an idea for...", "let's define the vision for...", "I want to build a product that...", or "help me shape this idea". Also use when the user wants to prepare Jira epics from a product vision. This skill is the strategic layer ABOVE write-prd — invoke it when the user needs to think through the big picture before diving into feature-level specs.
---

# Product Vision

You are helping the user transform a product idea into structured vision documents. These documents serve two purposes:
1. **Feed into write-prd** — each capability becomes a separate PRD via the write-prd skill
2. **Jira epics** — a second file reformats capabilities into copy-paste-ready epic descriptions

The vision layer sits above PRDs. A single product vision produces multiple PRDs, one per capability/epic.

## Output

The skill produces exactly two files in `docs/vision/<product-name>/`:

- **PRODUCT-VISION.md** — the complete vision (problem, strategy, capabilities, metrics, roadmap)
- **JIRA-EPICS.md** — copy-paste-ready epic descriptions for Jira

## Interactive interview process

This skill is a guided conversation. Do NOT write any files until you have gathered enough information from the user. The interview has 5 rounds. After each round, show the user what you've captured so far and what's still missing before moving on.

If the user has already provided information in the conversation (e.g., they said "I want to build X for Y"), extract what you can, confirm it back, and skip to the first round that still has gaps.

### Round 1: The idea

Ask these — skip any the user already answered:

1. **Elevator pitch:** "In one sentence, what does this product do and for whom?"
2. **Target users:** "Who specifically will use this? Be as concrete as you can — job titles, team sizes, industries."
3. **Core problem:** "What's painful or broken for them today?"

After they answer, summarize back: *"So the idea is: [summary]. The main users are [users], and the pain is [pain]. Correct?"*

Wait for confirmation before continuing.

### Round 2: Strategy & positioning

1. **Value prop:** "What's your one-line value proposition? Format: We help [who] do [what] by [how]."
2. **Differentiation:** "What existing solutions are out there, and what's missing from them?"
3. **Business model:** "How will this make money? (SaaS, marketplace, usage-based, freemium, etc.)"

Summarize and confirm before continuing.

### Round 3: Capabilities

This is the most important round — capabilities become epics and PRDs.

1. **Capability list:** "What are the 3-7 major things this product needs to do? Think in terms of user-facing capability areas, not technical tasks."
2. For each capability they mention, ask: "What would a user be able to do with [capability]? Give me 2-3 key features."
3. **Phasing:** "Which of these are must-haves for launch, and which can come later?"

Present the capabilities back as a numbered list with phase assignments. Ask: *"Does this capture the right capabilities? Anything to add, remove, or re-prioritize?"*

Wait for confirmation.

### Round 4: Success & metrics

1. **North star:** "If you could only track one metric to know this product is working, what would it be?"
2. **Short-term targets:** "What does success look like 3 months after launch?"
3. **Risks:** "What are the biggest unknowns or risks that could derail this?"

Summarize and confirm.

### Round 5: Review & generate

Before writing any files, present a complete summary of everything gathered across all rounds:

```
Here's what I have for your product vision:

**Product:** [name]
**Elevator pitch:** [pitch]
**Target users:** [users]
**Problem:** [problem]
**Value prop:** [value prop]
**Business model:** [model]
**Capabilities:**
  1. CAP-01: [name] — [summary] (Launch)
  2. CAP-02: [name] — [summary] (Launch)
  3. CAP-03: [name] — [summary] (Post-launch)
**North star metric:** [metric]
**Key risks:** [risks]

Anything you want to change or add before I generate the documents?
```

Only proceed to file creation after the user confirms. If they flag gaps or corrections, address those first.

### Where to save

Ask where the vision documents should live. Convention:

```
docs/vision/<product-name>/
```

Use a short kebab-case slug (e.g., `invoice-automation`, `team-pulse`, `marketplace-v2`).

## File creation

Once the user confirms the summary, create both files using the templates below. Fill in everything from the interview. Use `[placeholder]` only for information the user explicitly said they don't know yet.

---

### PRODUCT-VISION.md

The single source of truth for the product vision.

```markdown
# [Product Name] — Product Vision

## Elevator pitch

[One sentence describing what this product does and for whom.]

## Vision statement

[One sentence: the aspirational end-state. Example: "Every small business can accept payments as easily as sending a text."]

## Value proposition

We help **[target user]** do **[core action]** by **[key differentiator]**, so that **[outcome they care about]**.

---

## Problem Space

### Target users

#### Persona: [Persona name]

- **Role:** [Job title / role description]
- **Context:** [Team size, industry, daily work]
- **Pain points:**
  - [Pain 1]
  - [Pain 2]
- **Current workaround:** [What they do today]

<!-- Add more personas as needed. -->

### Problem statement

[2-3 paragraphs describing the core problem. Be specific about who has it, when it occurs, and what impact it has. Quantify where possible.]

### Existing solutions

| Solution | Strengths | Gaps |
|----------|-----------|------|
| [Competitor/workaround] | [What it does well] | [Where it falls short] |

### Why now?

[What has changed — technology, market, regulation, user behavior — that makes this the right time?]

---

## Strategy

### Differentiators

- [What makes this uniquely valuable — not just "better UI" but specific, defensible advantages]

### What we are NOT

- [Explicit anti-goals to prevent scope creep. Example: "We are not a general-purpose project management tool."]

### Business model

- **Model:** [SaaS / marketplace / usage-based / freemium / etc.]
- **Pricing signals:** [How pricing might work — tiers, per-seat, per-usage]
- **Revenue drivers:** [What actions drive revenue]

### Assumptions and risks

| Assumption | How to validate | Risk if wrong |
|------------|-----------------|---------------|
| [Key assumption] | [Experiment or metric] | [Impact] |

---

## Capabilities

<!-- Each capability below becomes a Jira epic and a separate PRD via /write-prd. -->

### CAP-01: [Capability name]

- **Epic summary:** [One sentence: what this enables]
- **User value:** [Why users care about this capability]
- **Key features:**
  - [Feature 1]
  - [Feature 2]
  - [Feature 3]
- **Phase:** [Launch / Post-launch / Future]
- **Dependencies:** [Other capabilities this depends on, or "None"]
- **Estimated size:** [S / M / L / XL]

### CAP-02: [Capability name]

- **Epic summary:** [One sentence]
- **User value:** [Why users care]
- **Key features:**
  - [Feature 1]
  - [Feature 2]
- **Phase:** [Launch / Post-launch / Future]
- **Dependencies:** [Dependencies or "None"]
- **Estimated size:** [S / M / L / XL]

<!-- Continue for each capability (typically 3-7 total). -->

---

## Success Metrics

### North star metric

**[Metric name]:** [Definition and why this is the single most important measure]

### Key results

| Timeframe | Metric | Target | How to measure |
|-----------|--------|--------|----------------|
| 3 months  | [Metric] | [Target value] | [Data source / tool] |
| 12 months | [Metric] | [Target value] | [Data source / tool] |

### Health metrics

<!-- Metrics that should NOT degrade as you grow. -->

- **[Metric]:** [Acceptable range] — [Why this matters]

---

## Roadmap

### Phase 1: MVP / Launch

**Goal:** [What must be true for launch]
**Timeframe:** [Target]

| Capability | Scope for this phase |
|------------|---------------------|
| CAP-01: [Name] | [What's included in MVP vs. full capability] |
| CAP-02: [Name] | [MVP scope] |

**Launch criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Phase 2: [Phase name]

**Goal:** [What this phase achieves]
**Timeframe:** [Target]

| Capability | Scope for this phase |
|------------|---------------------|
| CAP-03: [Name] | [Scope] |

### Phase 3: [Phase name]

**Goal:** [What this phase achieves]
**Timeframe:** [Target]

| Capability | Scope |
|------------|-------|
| [Capabilities] | [Scope] |

### Risks to roadmap

| Risk | Mitigation | Impact on roadmap |
|------|------------|-------------------|
| [Risk] | [How to mitigate] | [Which phase/capability affected] |

---

## Downstream PRDs

<!-- As PRDs are created from capabilities, link them here. -->

| Capability | PRD | Status |
|------------|-----|--------|
| [Capability 1] | [Not yet created] | Pending |
```

---

### JIRA-EPICS.md

A flat, copy-paste-friendly file — one block per epic for Jira.

```markdown
# [Product Name] — Jira Epic Descriptions

<!-- Copy-paste each block below into a Jira epic. One epic per capability. -->

---

## Epic: CAP-01 — [Capability name]

**Summary:** [One-sentence epic summary]

**Description:**

[Epic summary from capabilities section]

### User Value
[User value]

### Key Features
- [Feature 1]
- [Feature 2]
- [Feature 3]

### Context
- **Product:** [Product name]
- **Phase:** [Launch / Post-launch / Future]
- **Estimated size:** [S / M / L / XL]
- **Dependencies:** [Other capabilities or "None"]
- **Labels:** product-vision, [product-slug]

---

## Epic: CAP-02 — [Capability name]

<!-- Same structure, repeat for each capability. -->
```

---

## Step 5: Bridge to PRDs

After completing the vision documents, show the user how to generate PRDs from capabilities:

> "Your vision is ready. Each capability in the Capabilities section is designed to become its own PRD. To create one, run `/write-prd` and describe the capability — the vision doc gives it all the context it needs."

Update the "Downstream PRDs" table in PRODUCT-VISION.md as PRDs are created.

## Tips

- Vision documents are intentionally higher-level than PRDs — resist the urge to go into implementation details
- Capabilities should be user-facing and outcome-oriented, not technical tasks
- A good capability can be explained to a non-technical stakeholder in one sentence
- When in doubt about scope, err on the side of fewer, larger capabilities — they can be split later
- The interview is the most important part. Spend time understanding the problem before jumping to solutions
