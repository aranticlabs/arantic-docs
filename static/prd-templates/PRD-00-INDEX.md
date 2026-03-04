# [Feature Name] - Documentation Index

This directory contains the complete PRD (Product Requirements Document) for the **[Feature Name]** feature within [App Name], split into focused documents for easier navigation and maintenance.

## Feature Overview

The [Feature Name] provides [brief 1-2 sentence description of the feature], enabling users to:

- **[Capability 1]** - [brief description]
- **[Capability 2]** - [brief description]
- **[Capability 3]** - [brief description]
- **[Capability 4]** - [brief description]

## Document Overview

| Document | Description |
| --- | --- |
| [PRD-01-OVERVIEW.md](./PRD-01-OVERVIEW.md) | Vision, scope, success criteria, permissions, and UI/UX design |
| [PRD-02-BUSINESS-LOGIC.md](./PRD-02-BUSINESS-LOGIC.md) | User stories, acceptance criteria, domain rules, lifecycle, and test cases |
| [PRD-03-DATABASE-SCHEMA.md](./PRD-03-DATABASE-SCHEMA.md) | SQL table definitions, indexes, triggers, seed data, and TypeScript interfaces |
| [PRD-04-API-ENDPOINTS.md](./PRD-04-API-ENDPOINTS.md) | REST API endpoints with request/response specifications |
| [PRD-05-IMPLEMENTATION.md](./PRD-05-IMPLEMENTATION.md) | Backend/frontend directory structure, architecture decisions, integration points |
| [PRD-06-IMPLEMENTATION-STEPS.md](./PRD-06-IMPLEMENTATION-STEPS.md) | Phased implementation plan with task checklists and dependencies |

> **Note:** Not every feature needs all documents. Small features may combine Overview + Business Logic into one file, or skip Permissions. Adapt the structure to fit the feature's complexity.

## Section Index

### PRD-01: Overview

- [1.1 Vision](./PRD-01-OVERVIEW.md#11-vision)
- [1.2 Purpose & Workflow](./PRD-01-OVERVIEW.md#12-purpose--workflow)
- [1.3 Scope](./PRD-01-OVERVIEW.md#13-scope)
- [1.4 Success Criteria](./PRD-01-OVERVIEW.md#14-success-criteria)
- [1.5 UI/UX Design](./PRD-01-OVERVIEW.md#15-uiux-design)
- [1.6 Technical Notes](./PRD-01-OVERVIEW.md#16-technical-notes)

### PRD-02: Business Logic

- [2.1 Glossary of Domain Terms](./PRD-02-BUSINESS-LOGIC.md#21-glossary-of-domain-terms)
- [2.2 User Stories & Acceptance Criteria](./PRD-02-BUSINESS-LOGIC.md#22-user-stories--acceptance-criteria)
- [2.3 Domain Lifecycle](./PRD-02-BUSINESS-LOGIC.md#23-domain-lifecycle)
- [2.4 Business Rules & Calculations](./PRD-02-BUSINESS-LOGIC.md#24-business-rules--calculations)
- [2.5 Settings & Configuration](./PRD-02-BUSINESS-LOGIC.md#25-settings--configuration)
- [2.6 Verification Test Cases](./PRD-02-BUSINESS-LOGIC.md#26-verification-test-cases)

### PRD-03: Database Schema

- [3.1 Schema Context](./PRD-03-DATABASE-SCHEMA.md#31-schema-context)
- [3.2 Entity-Relationship Overview](./PRD-03-DATABASE-SCHEMA.md#32-entity-relationship-overview)
- [3.3 Table Definitions](./PRD-03-DATABASE-SCHEMA.md#33-table-definitions)
- [3.4 Indexes](./PRD-03-DATABASE-SCHEMA.md#34-indexes)
- [3.5 Seed Data](./PRD-03-DATABASE-SCHEMA.md#35-seed-data)
- [3.6 TypeScript Interfaces](./PRD-03-DATABASE-SCHEMA.md#36-typescript-interfaces)

### PRD-04: API Endpoints

- [4.1 [Resource 1] CRUD](./PRD-04-API-ENDPOINTS.md#41-resource-1-crud)
- [4.2 [Resource 2] Operations](./PRD-04-API-ENDPOINTS.md#42-resource-2-operations)
- [4.3 [Additional Endpoints]](./PRD-04-API-ENDPOINTS.md#43-additional-endpoints)

### PRD-05: Implementation

- [5.1 Backend Directory Structure](./PRD-05-IMPLEMENTATION.md#51-backend-directory-structure)
- [5.2 Frontend Directory Structure](./PRD-05-IMPLEMENTATION.md#52-frontend-directory-structure)
- [5.3 Architecture Decisions](./PRD-05-IMPLEMENTATION.md#53-architecture-decisions)
- [5.4 Integration Points](./PRD-05-IMPLEMENTATION.md#54-integration-points)

### PRD-06: Implementation Steps

- [6.1 Overview](./PRD-06-IMPLEMENTATION-STEPS.md#61-overview)
- [6.2 Phase 1: Database & Scaffold](./PRD-06-IMPLEMENTATION-STEPS.md#62-phase-1-database--scaffold)
- [6.3 Phase 2: Backend Domain Layer](./PRD-06-IMPLEMENTATION-STEPS.md#63-phase-2-backend-domain-layer)
- [6.4 Phase 3: Backend Application Layer](./PRD-06-IMPLEMENTATION-STEPS.md#64-phase-3-backend-application-layer)
- [6.5 Phase 4: Backend Infrastructure & API](./PRD-06-IMPLEMENTATION-STEPS.md#65-phase-4-backend-infrastructure--api)
- [6.6 Phase 5: Frontend](./PRD-06-IMPLEMENTATION-STEPS.md#66-phase-5-frontend)
- [6.7 Phase 6: Testing & Documentation](./PRD-06-IMPLEMENTATION-STEPS.md#67-phase-6-testing--documentation)

## Quick Links

### For Developers

- **Starting implementation?** Begin with [PRD-06-IMPLEMENTATION-STEPS.md](./PRD-06-IMPLEMENTATION-STEPS.md) for step-by-step guide
- **Architecture overview?** See [PRD-01-OVERVIEW.md](./PRD-01-OVERVIEW.md)
- **Database work?** See [PRD-03-DATABASE-SCHEMA.md](./PRD-03-DATABASE-SCHEMA.md)
- **Backend development?** See [PRD-05-IMPLEMENTATION.md](./PRD-05-IMPLEMENTATION.md)
- **Frontend development?** See [PRD-05-IMPLEMENTATION.md](./PRD-05-IMPLEMENTATION.md)
- **API integration?** See [PRD-04-API-ENDPOINTS.md](./PRD-04-API-ENDPOINTS.md)
- **Business logic?** See [PRD-02-BUSINESS-LOGIC.md](./PRD-02-BUSINESS-LOGIC.md)

### For Product/Business

- **Understanding the feature?** Start with [PRD-01-OVERVIEW.md](./PRD-01-OVERVIEW.md)
- **Business logic details?** See [PRD-02-BUSINESS-LOGIC.md](./PRD-02-BUSINESS-LOGIC.md)
- **Test cases & verification?** See [PRD-02-BUSINESS-LOGIC.md](./PRD-02-BUSINESS-LOGIC.md#26-verification-test-cases)

## Key Technical Decisions

<!-- List the key architectural and technical decisions made for this feature -->
<!-- Each decision should be numbered and clearly state what was decided -->

1. **[Decision Area]:** [What was decided and why]
2. **[Decision Area]:** [What was decided and why]
3. **[Decision Area]:** [What was decided and why]

## Related Documentation

<!-- Link to your project-level documentation that applies to this feature -->
<!-- Examples of common docs to link: -->

- [Architecture Guide](../../path/to/architecture.md) - Architecture and coding standards
- [File Structure](../../path/to/file-structure.md) - Complete file structure reference
- [API Standards](../../path/to/api-standards.md) - API documentation standards
- [Styling Guide](../../path/to/styling.md) - UI/styling guidelines
- [Testing Guide](../../path/to/testing.md) - Testing strategy and conventions
