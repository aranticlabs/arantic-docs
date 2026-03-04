# PRD Template System

These templates provide a standardized structure for writing Product Requirements Documents (PRDs) that can be used by product owners, developers, and AI coding assistants.

## How to Use These Templates

### 1. Create a New Feature Folder

```bash
cp -r docs/Plans/_Templates docs/Plans/[Your-Feature-Name]
```

### 2. Rename Files with Your Prefix

Replace the `PRD-` prefix with your feature abbreviation:

```
PRD-00-INDEX.md              -> FEAT-00-INDEX.md
PRD-01-OVERVIEW.md           -> FEAT-01-OVERVIEW.md
PRD-02-BUSINESS-LOGIC.md     -> FEAT-02-BUSINESS-LOGIC.md
PRD-03-DATABASE-SCHEMA.md    -> FEAT-03-DATABASE-SCHEMA.md
PRD-04-API-ENDPOINTS.md      -> FEAT-04-API-ENDPOINTS.md
PRD-05-IMPLEMENTATION.md     -> FEAT-05-IMPLEMENTATION.md
PRD-06-IMPLEMENTATION-STEPS.md -> FEAT-06-IMPLEMENTATION-STEPS.md
```

### 3. Fill in the Templates

Work through the documents in order:

1. **INDEX** - Write the feature overview and document links
2. **OVERVIEW** - Define vision, scope, success criteria, and UI wireframes
3. **BUSINESS LOGIC** - Document user stories, domain rules, lifecycle, and test cases
4. **DATABASE SCHEMA** - Define tables, relationships, indexes, and TypeScript interfaces
5. **API ENDPOINTS** - Specify all REST endpoints with request/response types
6. **IMPLEMENTATION** - Plan the directory structure and architecture
7. **IMPLEMENTATION STEPS** - Create the phased task checklist

### 4. Update Internal Links

After renaming, update all cross-document links (e.g., `PRD-01-OVERVIEW.md` -> `FEAT-01-OVERVIEW.md`).

## Template Structure

| File | Purpose | Audience |
| --- | --- | --- |
| `00-INDEX` | Navigation hub, feature summary, key decisions | Everyone |
| `01-OVERVIEW` | Vision, scope, wireframes, technical notes | PO + Developers |
| `02-BUSINESS-LOGIC` | Domain terms, user stories, rules, test cases | PO + Developers |
| `03-DATABASE-SCHEMA` | SQL definitions, TypeScript types | Developers |
| `04-API-ENDPOINTS` | REST API specification | Developers |
| `05-IMPLEMENTATION` | Code architecture, directory structure, DI | Developers |
| `06-IMPLEMENTATION-STEPS` | Phased checklist with dependencies | Developers + AI |

## Working with AI Coding Assistants

These templates are designed to be consumed by AI coding assistants (Claude, Copilot, etc.):

- **HTML comments** (`<!-- ... -->`) contain instructions for the author - they guide what to write in each section
- **Placeholder brackets** (`[Feature Name]`, `[Entity]`) should be replaced with actual values
- **ASCII wireframes** in the Overview document give AI assistants a visual spec to implement
- **Test cases** in the Business Logic document can be directly translated into automated tests
- **Implementation Steps** serve as a task list that AI assistants can follow sequentially

### Recommended AI Workflow

1. **Start with the original idea** - Describe your feature to the AI
2. **Fill OVERVIEW first** - The AI can help expand your idea into vision, scope, and wireframes
3. **Build BUSINESS LOGIC next** - Translate requirements into user stories and rules
4. **Let AI generate DATABASE + API** - Based on the business logic, AI can draft schema and endpoints
5. **Review IMPLEMENTATION** - AI proposes architecture; you validate against project conventions
6. **Use IMPLEMENTATION STEPS for coding** - AI follows the checklist to build the feature

## Scaling the Template

Not every feature needs all 6 documents. Adapt based on complexity:

| Feature Size | Documents to Use |
| --- | --- |
| **Small** (bug fix, minor tweak) | No PRD needed |
| **Medium** (new CRUD feature) | INDEX + OVERVIEW + DATABASE + IMPLEMENTATION-STEPS |
| **Large** (new module/app) | All 6 documents |
| **Complex** (multi-app, calculations) | All 6 + additional domain-specific docs |

## Real Examples

As you build PRDs in your project, reference them here for your team:

- `[Feature A]/` - Large feature (all 6 docs + supplementary files)
- `[Feature B]/` - Medium feature (4 docs, standard CRUD pattern)

> **Tip:** Keep one completed PRD as your team's "gold standard" reference. New team members and AI assistants learn your conventions faster when they can study a real example.
