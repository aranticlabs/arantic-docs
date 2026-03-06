---
sidebar_position: 4
sidebar_label: PRD-Driven Development
---

# PRD-Driven Development

A Product Requirements Document (PRD) is a structured specification that describes what you're building before you write any code. When working with AI coding assistants, PRDs dramatically improve output quality by giving the AI complete context upfront.

This guide covers a PRD template system with an index file plus 7 specification documents, designed specifically for AI-assisted development workflows.

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
implementation of Phase 1 from PRD-07-IMPLEMENTATION-STEPS.md.
Research the existing codebase and propose an approach before writing any code.
```

The AI reads your requirements, studies the codebase, and proposes an implementation plan you can review. Once you approve, it builds exactly what you specified.

**Key benefits:**

- **Eliminates ambiguity.** Every field, endpoint, and business rule is defined before implementation begins.
- **Reduces wasted iterations.** The AI doesn't have to guess your intent; it reads it.
- **Creates a shared reference.** The PRD serves as documentation for both humans and AI assistants.
- **Enables step-by-step implementation.** Each phase builds on the last, with clear checkpoints.

## The template system

The template system splits a feature specification into an index file plus 7 focused documents. Each has a clear purpose and audience.

| Document | Purpose | Primary audience |
|----------|---------|-----------------|
| **00-INDEX** | Navigation hub, feature summary, key decisions | Everyone |
| **01-OVERVIEW** | Vision, scope, success criteria, high-level wireframes, technical notes | Product owners, developers |
| **02-BUSINESS-LOGIC** | Domain terms, user stories, acceptance criteria, rules, test cases | Product owners, developers |
| **03-DATABASE-SCHEMA** | SQL definitions, indexes, TypeScript interfaces | Developers |
| **04-API-ENDPOINTS** | REST API specification with request/response types | Developers |
| **05-FRONTEND-UI** | Detailed wireframes, component specs, interaction patterns, responsive behavior | Developers, designers |
| **06-IMPLEMENTATION** | Code architecture, directory structure, integration points | Developers |
| **07-IMPLEMENTATION-STEPS** | Phased task list with dependencies | Developers, AI assistants |

**Why separate documents?** Splitting the PRD into focused files keeps each document manageable and lets you feed specific sections to an AI assistant without overloading its context window. When Claude Code needs to implement API endpoints, you point it at the API document. When it needs database schema, you point it at the schema document.

**AI-friendly features built into the templates:**

- **HTML comments** (`<!-- ... -->`) contain instructions for the author, guiding what to write in each section
- **Placeholder brackets** (`[Feature Name]`, `[Entity]`) mark values you need to replace
- **ASCII wireframes** in Overview (high-level) and Frontend UI (detailed) give AI assistants a visual spec to implement against
- **Component specifications** in the Frontend UI document define props, variants, and behavior for each UI component
- **Test cases** in the Business Logic document can be directly translated into automated tests
- **Implementation Steps** serve as a task list that AI assistants can follow sequentially

## How to use the templates

### 1. Download the template folder

Download the templates from the docs site into your project:

```bash
mkdir -p docs/prd/my-feature
for f in PRD-00-INDEX PRD-01-OVERVIEW PRD-02-BUSINESS-LOGIC PRD-03-DATABASE-SCHEMA PRD-04-API-ENDPOINTS PRD-05-FRONTEND-UI PRD-06-IMPLEMENTATION PRD-07-IMPLEMENTATION-STEPS; do
  curl -s "https://docs.arantic.com/prd-templates/${f}.md" -o "docs/prd/my-feature/${f}.md"
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
2. **OVERVIEW** - Define vision, scope, and success criteria with high-level wireframes
3. **BUSINESS-LOGIC** - Write user stories, acceptance criteria, and domain rules
4. **DATABASE-SCHEMA** - Design tables, indexes, and TypeScript interfaces
5. **API-ENDPOINTS** - Specify each endpoint with request/response examples
6. **FRONTEND-UI** - Detail page wireframes, component specs, interaction flows, and responsive behavior
7. **IMPLEMENTATION** - Map out directory structure and architecture decisions
8. **IMPLEMENTATION-STEPS** - Break the work into phased, ordered tasks

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

Not every feature needs all 7 documents. Match the documentation depth to the feature's complexity.

| Feature size | Example | Documents to use |
|-------------|---------|-----------------|
| **Small** | Bug fix, minor UI tweak | No PRD needed |
| **Medium** | New CRUD feature | INDEX + OVERVIEW + DATABASE + IMPLEMENTATION-STEPS |
| **Medium with UI** | New CRUD feature with custom UI | INDEX + OVERVIEW + FRONTEND-UI + DATABASE + IMPLEMENTATION-STEPS |
| **Large** | New module or app | All 7 documents |
| **Complex** | Multi-app feature with calculations | All 7 documents + additional domain-specific docs |

For anything that touches the database or introduces new API endpoints, the full set pays for itself in reduced back-and-forth.

## Working with AI coding assistants

The recommended workflow when using PRDs with an AI coding assistant:

### Step 1: Start with the idea

Download the `requirements.md` template, place it at the root of your project, and fill in what you know. You do not need to answer every question — leave sections blank if they do not apply. The more detail you provide, the less the AI will need to assume when generating the PRDs.

<a href="/prd-templates/requirements.md" download="requirements.md"><strong>-> Download requirements.md template</strong></a>

### Step 2: Generate all PRDs with one prompt

Point your AI assistant at `requirements.md` and the PRD templates. Choose the prompt that matches the scale of what you are building.

**Small feature** (UI change, single endpoint, no schema changes):

```text
Read requirements.md and the templates in static/prd-templates/.
This is a small feature. Only generate the documents that are relevant:
PRD-01-OVERVIEW.md, PRD-02-BUSINESS-LOGIC.md, and PRD-07-IMPLEMENTATION-STEPS.md.
Skip documents that do not apply. Follow the template structure.
```

**Medium feature** (new module, database changes, multiple endpoints):

```text
Read requirements.md and all templates in static/prd-templates/.
Generate the full PRD set based on the requirements:
- PRD-01-OVERVIEW.md (vision, goals, scope)
- PRD-02-BUSINESS-LOGIC.md (user stories, acceptance criteria)
- PRD-03-DATABASE-SCHEMA.md (data model and relationships)
- PRD-04-API-ENDPOINTS.md (routes, request/response shapes)
- PRD-05-FRONTEND-UI.md (page wireframes, component specs, interaction flows)
- PRD-06-IMPLEMENTATION.md (architecture decisions and constraints)
- PRD-07-IMPLEMENTATION-STEPS.md (phased build plan)
Follow the template structure for each file. Flag anything unclear.
```

**Large feature** (cross-cutting, multiple systems, significant complexity):

```text
Read requirements.md and all templates in static/prd-templates/.
This is a large, complex feature. Generate the full PRD set with extra depth:
expand edge cases in PRD-02, detail all data relationships in PRD-03,
specify every endpoint variant in PRD-04, and break PRD-07 into fine-grained
phases with clear dependencies between them.
Flag any architectural decisions that need a human decision before proceeding.
```

### Step 3: Review and refine until complete

Read through all generated PRD files and check for gaps, incorrect assumptions, or missing details. Then prompt the AI to refine:

```text
Read all PRD files in docs/prd/<feature-name>/.
Review them for consistency, gaps, and missing details.
List everything that is unclear, contradictory, or incomplete.
```

Address the issues — either by updating `requirements.md` with more detail and re-running Step 2, or by giving the AI direct corrections:

```text
Update PRD-02-BUSINESS-LOGIC.md: the approval flow requires two approvers, not one.
Also add an edge case for expired sessions to PRD-04-API-ENDPOINTS.md.
```

Repeat this review cycle until every section is accurate and complete. The PRDs are the contract between you and the AI coder — vague documents produce vague code.

:::tip Large features benefit from Agent Teams
When the scope is large, consider running multiple specialized AI agents in parallel rather than a single agent working sequentially. Each agent can own one part of the PRD and work simultaneously, which significantly reduces the time to a complete, consistent document set. See [Agent Teams](/claude-code/agent-teams) for how to set this up.
:::

## Download the templates

Each template is a Markdown file with section headings, placeholder text, and HTML comments explaining what to write in each section. Download them individually or grab them all at once.

<a href="/prd-templates/prd-templates.zip" download="prd-templates.zip"><strong>Download all templates (ZIP)</strong></a>

| Template | Description | Download |
|----------|-------------|----------|
| PRD-00-INDEX | Master index and navigation | <a href="/prd-templates/PRD-00-INDEX.md" download="PRD-00-INDEX.md">PRD-00-INDEX.md</a> |
| PRD-01-OVERVIEW | Vision, scope, high-level wireframes | <a href="/prd-templates/PRD-01-OVERVIEW.md" download="PRD-01-OVERVIEW.md">PRD-01-OVERVIEW.md</a> |
| PRD-02-BUSINESS-LOGIC | User stories, domain rules, test cases | <a href="/prd-templates/PRD-02-BUSINESS-LOGIC.md" download="PRD-02-BUSINESS-LOGIC.md">PRD-02-BUSINESS-LOGIC.md</a> |
| PRD-03-DATABASE-SCHEMA | Table definitions, indexes, TypeScript types | <a href="/prd-templates/PRD-03-DATABASE-SCHEMA.md" download="PRD-03-DATABASE-SCHEMA.md">PRD-03-DATABASE-SCHEMA.md</a> |
| PRD-04-API-ENDPOINTS | REST API specifications | <a href="/prd-templates/PRD-04-API-ENDPOINTS.md" download="PRD-04-API-ENDPOINTS.md">PRD-04-API-ENDPOINTS.md</a> |
| PRD-05-FRONTEND-UI | Detailed wireframes, component specs, interactions | <a href="/prd-templates/PRD-05-FRONTEND-UI.md" download="PRD-05-FRONTEND-UI.md">PRD-05-FRONTEND-UI.md</a> |
| PRD-06-IMPLEMENTATION | Architecture, directory structure | <a href="/prd-templates/PRD-06-IMPLEMENTATION.md" download="PRD-06-IMPLEMENTATION.md">PRD-06-IMPLEMENTATION.md</a> |
| PRD-07-IMPLEMENTATION-STEPS | Phased implementation plan | <a href="/prd-templates/PRD-07-IMPLEMENTATION-STEPS.md" download="PRD-07-IMPLEMENTATION-STEPS.md">PRD-07-IMPLEMENTATION-STEPS.md</a> |
