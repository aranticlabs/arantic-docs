---
name: write-prd
description: Creates a Product Requirements Document (PRD) using the Arantic 7-document template system. Use this skill whenever a user wants to plan, spec, or document a feature before coding — even if they just say "I want to build X", "help me think through Y", "let's plan a new feature", or "I need a spec for Z". This skill determines the right documentation depth, interviews the user, and creates all the PRD files in the project. Invoke whenever someone is about to start building something and hasn't written requirements yet — planning context for an AI coding session is a perfect trigger.
---

# Write PRD

You are helping the user create a Product Requirements Document for a feature or product using a 7-document template system. These documents give AI coding assistants complete context upfront, eliminating the cycle of vague prompts and back-and-forth corrections.

## Step 1: Understand what they're building

Ask the user to describe what they want to build in plain language. You don't need a perfect picture — you just need enough to assess scope. One or two paragraphs is fine.

If they've already described it in the conversation, use that and confirm rather than asking again.

## Step 2: Determine feature size

Based on their description, classify the feature and tell them which documents they need:

| Size | Signals | Documents to create |
|------|---------|---------------------|
| **Small** | Bug fix, minor UI tweak, copy change | No PRD needed — suggest skipping |
| **Medium** | New CRUD feature, form, simple API | INDEX + OVERVIEW + DATABASE-SCHEMA + IMPLEMENTATION-STEPS |
| **Large** | New module, significant user-facing workflow | All 7 documents |
| **Complex** | Multi-app, financial calculations, integrations, complex domain logic | All 7 + additional domain-specific docs |

Show your reasoning and ask them to confirm the size before proceeding. If they want more or fewer documents, follow their lead.

## Step 3: Establish the directory

Ask where they want the PRD to live. The convention is:

```
docs/prd/<feature-name>/
```

Use the feature name as a short kebab-case slug (e.g., `task-management`, `user-onboarding`, `billing-module`). Create the directory:

```bash
mkdir -p docs/prd/<feature-name>
```

## Step 4: Create the documents

Create each document as a Markdown file using the templates below. Fill in what you already know from the conversation. Use `[placeholder]` brackets for anything the user still needs to fill in. Add HTML comments (`<!-- ... -->`) where guidance would help them fill in a section later.

Work through documents in order. After creating each one, briefly tell the user what you filled in and what needs their input before moving to the next.

---

### PRD-00-INDEX.md

The navigation hub. Every other document links from here.

```markdown
# [Feature Name] — PRD Index

## Feature summary

[2-3 sentence plain-language description of what this feature does and why it exists.]

## Capabilities

- [Capability 1]
- [Capability 2]
- [Capability 3]

## Key decisions

<!-- Record significant architectural or product decisions here as they are made. -->

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Decision] | [Choice] | [Why] |

## Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [PRD-01-OVERVIEW.md](PRD-01-OVERVIEW.md) | Vision, scope, wireframes | Draft |
| [PRD-02-BUSINESS-LOGIC.md](PRD-02-BUSINESS-LOGIC.md) | User stories, rules, test cases | Draft |
| [PRD-03-DATABASE-SCHEMA.md](PRD-03-DATABASE-SCHEMA.md) | Tables, indexes, TypeScript types | Draft |
| [PRD-04-API-ENDPOINTS.md](PRD-04-API-ENDPOINTS.md) | REST API specification | Draft |
| [PRD-05-IMPLEMENTATION.md](PRD-05-IMPLEMENTATION.md) | Architecture, directory structure | Draft |
| [PRD-06-IMPLEMENTATION-STEPS.md](PRD-06-IMPLEMENTATION-STEPS.md) | Phased implementation plan | Draft |
```

---

### PRD-01-OVERVIEW.md

Vision and scope. Written for both product owners and developers.

```markdown
# [Feature Name] — Overview

## Vision

[One sentence: what this feature achieves for the user.]

## Problem statement

[What problem does this solve? Who has this problem? What happens today without this feature?]

## Scope

### In scope
- [What this feature includes]

### Out of scope
- [What this feature explicitly does not include — be specific]

## Success criteria

<!-- How will you know this feature is working? These become acceptance tests. -->

- [Measurable outcome 1]
- [Measurable outcome 2]

## User roles

| Role | Description | Permissions |
|------|-------------|-------------|
| [Role] | [Who they are] | [What they can do] |

## Wireframes / UI flow

<!-- ASCII wireframes are preferred — they give AI assistants a visual spec to implement against. -->

```
[ASCII wireframe here]
```

## Technical notes

<!-- Existing patterns, libraries, or constraints the implementation must follow. -->

- [Note 1]
```

---

### PRD-02-BUSINESS-LOGIC.md

The "what" in detail. Product owners and developers both read this.

```markdown
# [Feature Name] — Business Logic

## Domain glossary

<!-- Define terms specific to this feature's domain. AI assistants will use these definitions. -->

| Term | Definition |
|------|------------|
| [Term] | [Definition] |

## User stories

<!-- Format: As a [role], I want to [action] so that [benefit]. -->

### [Story group name]

**US-01:** As a [role], I want to [action] so that [benefit].

**Acceptance criteria:**
- [Criterion 1]
- [Criterion 2]

## Business rules

<!-- Rules that must always be true. Number them for reference in test cases. -->

**BR-01:** [Rule]
**BR-02:** [Rule]

## Edge cases

- [Edge case and how it should behave]

## Verification test cases

<!-- These map directly to automated tests. Be specific about inputs and expected outputs. -->

| ID | Scenario | Input | Expected result |
|----|----------|-------|----------------|
| TC-01 | [Scenario] | [Input] | [Expected] |
```

---

### PRD-03-DATABASE-SCHEMA.md

SQL definitions and TypeScript interfaces. Written for developers.

```markdown
# [Feature Name] — Database Schema

## Tables

### [table_name]

```sql
CREATE TABLE [table_name] (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- [column]  [type]      [constraints] -- [description]
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Indexes

```sql
-- [Reason for this index]
CREATE INDEX idx_[table]_[column] ON [table_name]([column]);
```

## TypeScript interfaces

```typescript
interface [EntityName] {
  id: string;
  // [field]: [type]; // [description]
  createdAt: Date;
  updatedAt: Date;
}
```

## Relationships

<!-- Describe foreign keys and cardinality. -->

- `[table_a].id` → `[table_b].[table_a_id]` (one-to-many)
```

---

### PRD-04-API-ENDPOINTS.md

REST API specification. Written for developers.

```markdown
# [Feature Name] — API Endpoints

## Base path

`/api/v1/[resource]`

## Authentication

[Describe auth requirements — JWT, session, API key, etc.]

---

## [Resource] endpoints

### GET /[resource]

**Description:** [What this returns]

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| [param] | string | No | [Description] |

**Response 200:**
```json
{
  "[field]": "[value]"
}
```

**Response 404:**
```json
{ "error": "Not found" }
```

---

### POST /[resource]

**Description:** [What this creates]

**Request body:**
```json
{
  "[field]": "[value]"
}
```

**Response 201:**
```json
{
  "id": "[uuid]"
}
```
```

---

### PRD-05-IMPLEMENTATION.md

Code architecture and integration points. Written for developers.

```markdown
# [Feature Name] — Implementation

## Directory structure

```
src/
  [feature]/
    [feature].controller.ts   # Route handlers
    [feature].service.ts      # Business logic
    [feature].schema.ts       # Zod validation schemas
    [feature].types.ts        # TypeScript interfaces
    __tests__/
      [feature].service.test.ts
```

## Architecture decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Area] | [Choice] | [Why] |

## Integration points

<!-- Other parts of the system this feature touches. -->

- **[System/module]:** [How this feature integrates]

## Dependencies

<!-- New packages or services required. -->

- `[package]` — [why needed]
```

---

### PRD-06-IMPLEMENTATION-STEPS.md

Phased task list. AI assistants follow this sequentially.

```markdown
# [Feature Name] — Implementation Steps

<!-- Feed one phase at a time to your AI assistant using /plan mode. -->

## Phase 1: Database & scaffold

- Create migration for [table_name]
- Add TypeScript interfaces to `[path]`
- Scaffold service file at `[path]`
- Scaffold controller file at `[path]`

## Phase 2: Core logic

- Implement [core operation 1]
- Implement [core operation 2]
- Add input validation with Zod schemas

## Phase 3: API endpoints

- Implement GET /[resource]
- Implement POST /[resource]
- Implement PUT /[resource]/:id
- Implement DELETE /[resource]/:id
- Wire routes to [router file]

## Phase 4: Tests

- Unit tests for service layer covering TC-01 through TC-[N]
- Integration tests for API endpoints
- Edge case tests for BR-01 through BR-[N]

## Phase 5: UI

- [UI task 1]
- [UI task 2]

## Dependencies between phases

Phase 1 must complete before Phase 2. Phases 3 and 4 can run in parallel after Phase 2.
```

---

## Step 5: Offer to generate technical docs from business docs

After creating the INDEX, OVERVIEW, and BUSINESS-LOGIC documents, offer to draft the technical documents (DATABASE-SCHEMA, API-ENDPOINTS, IMPLEMENTATION) automatically:

> "I can draft the database schema, API endpoints, and implementation architecture from the overview and business logic you've filled in. Want me to generate those now, or would you prefer to fill them in yourself?"

If yes, read PRD-01 and PRD-02 and generate the technical documents based on the requirements. Tell the user what assumptions you made and flag anything that needs their input.

## Step 6: Finish

Once all planned documents are created:

1. Tell the user which files were created and their paths
2. Tell them what still needs their input (sections with `[placeholders]`)
3. Show them how to start implementation:

```
/plan Read PRD-00-INDEX.md to understand the feature, then read
PRD-06-IMPLEMENTATION-STEPS.md to see the plan. Research the codebase
and plan Phase 1.
```

## Tips for filling in the documents

- Work through documents in order (INDEX → OVERVIEW → BUSINESS-LOGIC → technical docs)
- Don't aim for perfection on the first pass — fill what you know, leave placeholders for the rest
- For PRD-02 acceptance criteria, write them as if they'll become automated test assertions
- For PRD-06, keep phases small enough that each can be implemented and reviewed independently
- The more specific the business logic doc, the less the AI will have to guess during implementation
