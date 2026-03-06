---
sidebar_position: 4
sidebar_label: PRD-Driven Development
---

# PRD-Driven Development

A Product Requirements Document (PRD) is a structured specification that describes what you're building before you write any code. When working with AI coding assistants, PRDs dramatically improve output quality by giving the AI complete context upfront.

This guide covers a PRD template system with an index file plus 6 specification documents, designed specifically for AI-assisted development workflows.

## Why PRDs matter for AI-assisted development

AI coding assistants produce better results when they have clear, structured context. Without a PRD, you end up in a cycle of vague prompts, incorrect output, corrections, and re-prompts. With a PRD, the AI gets the full picture on the first pass.

**Without a PRD:**

```text
Build me a task management feature.
```

The AI guesses at database schema, invents its own API conventions, and misses your business rules. You spend more time correcting than coding.

**With a PRD:**

```text
/plan Read the PRD documents in docs/prd/task-management/ and plan the
implementation of Phase 1 from PRD-06-IMPLEMENTATION-STEPS.md.
Research the existing codebase and propose an approach before writing any code.
```

The AI reads your requirements, studies the codebase, and proposes an implementation plan you can review. Once you approve, it builds exactly what you specified.

**Key benefits:**

- **Eliminates ambiguity.** Every field, endpoint, and business rule is defined before implementation begins.
- **Reduces wasted iterations.** The AI doesn't have to guess your intent; it reads it.
- **Creates a shared reference.** The PRD serves as documentation for both humans and AI assistants.
- **Enables step-by-step implementation.** Each phase builds on the last, with clear checkpoints.

## The template system

The template system splits a feature specification into an index file plus 6 focused documents. Each has a clear purpose and audience.

| Document | Purpose | Primary audience |
|----------|---------|-----------------|
| **00-INDEX** | Navigation hub, feature summary, key decisions | Everyone |
| **01-OVERVIEW** | Vision, scope, success criteria, wireframes, technical notes | Product owners, developers |
| **02-BUSINESS-LOGIC** | Domain terms, user stories, acceptance criteria, rules, test cases | Product owners, developers |
| **03-DATABASE-SCHEMA** | SQL definitions, indexes, TypeScript interfaces | Developers |
| **04-API-ENDPOINTS** | REST API specification with request/response types | Developers |
| **05-IMPLEMENTATION** | Code architecture, directory structure, integration points | Developers |
| **06-IMPLEMENTATION-STEPS** | Phased checklist with dependencies | Developers, AI assistants |

**Why separate documents?** Splitting the PRD into focused files keeps each document manageable and lets you feed specific sections to an AI assistant without overloading its context window. When Claude Code needs to implement API endpoints, you point it at the API document. When it needs database schema, you point it at the schema document.

**AI-friendly features built into the templates:**

- **HTML comments** (`<!-- ... -->`) contain instructions for the author, guiding what to write in each section
- **Placeholder brackets** (`[Feature Name]`, `[Entity]`) mark values you need to replace
- **ASCII wireframes** in the Overview document give AI assistants a visual spec to implement against
- **Test cases** in the Business Logic document can be directly translated into automated tests
- **Implementation Steps** serve as a task list that AI assistants can follow sequentially

## How to use the templates

### 1. Download the template folder

Download the templates from the docs site into your project:

```bash
mkdir -p docs/prd/my-feature
for f in PRD-00-INDEX PRD-01-OVERVIEW PRD-02-BUSINESS-LOGIC PRD-03-DATABASE-SCHEMA PRD-04-API-ENDPOINTS PRD-05-IMPLEMENTATION PRD-06-IMPLEMENTATION-STEPS; do
  curl -sO "https://docs.arantic.com/prd-templates/${f}.md" -o "docs/prd/my-feature/${f}.md"
done
```

Or download them individually from the [Download the templates](#download-the-templates) section below.

### 2. Rename the prefix (optional)

If you prefer feature-specific names, replace the `PRD-` prefix with your feature abbreviation:

```
PRD-00-INDEX.md              -> FEAT-00-INDEX.md
PRD-01-OVERVIEW.md           -> FEAT-01-OVERVIEW.md
PRD-02-BUSINESS-LOGIC.md     -> FEAT-02-BUSINESS-LOGIC.md
...
```

After renaming, update all cross-document links inside the files (e.g., `PRD-01-OVERVIEW.md` becomes `FEAT-01-OVERVIEW.md`).

### 3. Fill in the documents in order

Work through the documents sequentially. Each builds on the previous:

1. **INDEX** - Write the feature overview and capabilities list
2. **OVERVIEW** - Define vision, scope, and success criteria
3. **BUSINESS-LOGIC** - Write user stories, acceptance criteria, and domain rules
4. **DATABASE-SCHEMA** - Design tables, indexes, and TypeScript interfaces
5. **API-ENDPOINTS** - Specify each endpoint with request/response examples
6. **IMPLEMENTATION** - Map out directory structure and architecture decisions
7. **IMPLEMENTATION-STEPS** - Break the work into phased, ordered tasks

You don't need to fill every section perfectly on the first pass. Start with what you know and refine as you go.

### 4. Use AI to help fill the templates

You can use Claude Code itself to help draft PRD sections:

```text
I'm building a task management feature. Here's what I need:
- Users can create, edit, and delete tasks
- Tasks have a title, description, status (todo/in-progress/done), and assignee
- Tasks belong to projects
- Only project members can view/edit tasks

Help me fill out PRD-01-OVERVIEW.md with this information.
Follow the template structure in docs/prd/task-management/PRD-01-OVERVIEW.md.
```

## Scaling by feature size

Not every feature needs all 6 documents. Match the documentation depth to the feature's complexity.

| Feature size | Example | Documents to use |
|-------------|---------|-----------------|
| **Small** | Bug fix, minor UI tweak | No PRD needed |
| **Medium** | New CRUD feature | INDEX + OVERVIEW + DATABASE + IMPLEMENTATION-STEPS |
| **Large** | New module or app | All 6 documents |
| **Complex** | Multi-app feature with calculations | All 6 documents + additional domain-specific docs |

For anything that touches the database or introduces new API endpoints, the full set pays for itself in reduced back-and-forth.

## Working with AI coding assistants

The recommended workflow when using PRDs with an AI coding assistant:

### Step 1: Start with the idea

Write a plain-language description of what you want to build. This becomes the seed for PRD-01.

### Step 2: Draft the overview and business logic

Fill in PRD-01 (vision, scope) and PRD-02 (user stories, acceptance criteria). These are the "what" documents that any stakeholder can review.

### Step 3: Let AI generate technical specs

Feed the overview and business logic to the AI and ask it to draft the technical documents:

```text
Read PRD-01-OVERVIEW.md and PRD-02-BUSINESS-LOGIC.md in docs/prd/task-management/.
Based on these requirements, draft PRD-03-DATABASE-SCHEMA.md following
the template structure. Use our existing Prisma conventions.
```

### Step 4: Review the architecture

Check the AI-generated schema, API endpoints, and implementation plan. This is your checkpoint: fix any issues in the PRD before code gets written.

### Step 5: Plan and implement step by step

Use PRD-06 as your implementation roadmap. Feed one phase at a time to the AI, using plan mode so you can review the approach before code gets written:

```text
/plan Read PRD-06-IMPLEMENTATION-STEPS.md and plan Phase 1 (Database & Scaffold).
Reference PRD-03-DATABASE-SCHEMA.md for the table definitions.
Research the existing codebase for conventions to follow.
```

Review the plan, approve it, then let the AI implement. Repeat for each phase.

## Example: feeding PRDs to Claude Code

Here's a concrete session showing how to use PRD documents with Claude Code.

**Starting a new feature:**

```text
/plan I have a PRD for a task management feature in docs/prd/task-management/.
Read PRD-00-INDEX.md to understand the feature, then read PRD-06 to see
the implementation plan. Research the codebase and plan Phase 1.
```

**Planning a specific phase:**

```text
/plan Plan Phase 2 from PRD-06-IMPLEMENTATION-STEPS.md.
Use the domain model from PRD-02-BUSINESS-LOGIC.md and the schema
from PRD-03-DATABASE-SCHEMA.md. Research existing patterns in the codebase
and propose an approach.
```

After reviewing and approving the plan, the AI implements. Then move on to the next phase.

**Planning API endpoints from the spec:**

```text
/plan Read PRD-04-API-ENDPOINTS.md and plan the implementation of all
endpoints listed there. Research existing controller patterns and propose
the route handlers, service layer, and input validation approach.
```

**Writing tests from acceptance criteria:**

```text
Read PRD-02-BUSINESS-LOGIC.md section 2.6 (Verification Test Cases).
Write tests that cover each test case listed there.
Follow the test patterns in src/services/__tests__/.
```

**Reviewing implementation against the PRD:**

```text
Compare our current implementation against PRD-02-BUSINESS-LOGIC.md.
List any acceptance criteria that aren't fully implemented yet.
```

## Download the templates

Each template is a Markdown file with section headings, placeholder text, and HTML comments explaining what to write in each section. Download them individually or copy the entire folder.

| Template | Description | Download |
|----------|-------------|----------|
| PRD-00-INDEX | Master index and navigation | [PRD-00-INDEX.md](pathname:///prd-templates/PRD-00-INDEX.md) |
| PRD-01-OVERVIEW | Vision, scope, UI/UX design | [PRD-01-OVERVIEW.md](pathname:///prd-templates/PRD-01-OVERVIEW.md) |
| PRD-02-BUSINESS-LOGIC | User stories, domain rules, test cases | [PRD-02-BUSINESS-LOGIC.md](pathname:///prd-templates/PRD-02-BUSINESS-LOGIC.md) |
| PRD-03-DATABASE-SCHEMA | Table definitions, indexes, TypeScript types | [PRD-03-DATABASE-SCHEMA.md](pathname:///prd-templates/PRD-03-DATABASE-SCHEMA.md) |
| PRD-04-API-ENDPOINTS | REST API specifications | [PRD-04-API-ENDPOINTS.md](pathname:///prd-templates/PRD-04-API-ENDPOINTS.md) |
| PRD-05-IMPLEMENTATION | Architecture, directory structure | [PRD-05-IMPLEMENTATION.md](pathname:///prd-templates/PRD-05-IMPLEMENTATION.md) |
| PRD-06-IMPLEMENTATION-STEPS | Phased implementation plan | [PRD-06-IMPLEMENTATION-STEPS.md](pathname:///prd-templates/PRD-06-IMPLEMENTATION-STEPS.md) |
