# PRD-05: Technical Implementation

[Back to Index](./PRD-00-INDEX.md) | [Previous: API Endpoints](./PRD-04-API-ENDPOINTS.md) | [Next: Implementation Steps](./PRD-06-IMPLEMENTATION-STEPS.md)

## Architecture Note

<!--
Reference the database schema document for ownership details.
Clarify which app owns which parts of the implementation.
-->

> See [PRD-03 section 3.1](./PRD-03-DATABASE-SCHEMA.md#31-schema-context) for full schema ownership details.

---

## 5.1 Backend Directory Structure

<!--
Show the complete file tree for backend code.
Adapt the directory structure to match your project's architecture
(e.g., Clean Architecture, MVC, Hexagonal, etc.).
-->

### 5.1.1 Reusable Shared Components (NO NEW FILES NEEDED)

<!--
List existing shared components that this feature reuses.
This prevents unnecessary duplication and keeps developers aware of what already exists.
Replace the examples below with your project's actual shared components.
-->

| Component | Existing File | Usage |
| --- | --- | --- |
| [Base class/interface] | `[path/to/file]` | [How new code extends/uses it] |
| [Error handling] | `[path/to/file]` | [e.g., Result pattern, exceptions] |
| [Auth middleware] | `[path/to/file]` | [e.g., Role-based access control] |
| [Shared utilities] | `[path/to/file]` | [e.g., Validation, formatting] |

### 5.1.2 New Files to Create

<!--
Show the directory tree of all new files needed.
Below is an example using a layered architecture. Adapt to your project's structure.
-->

```
backend/src/[module-or-app]/
|-- domain/                                     # Business logic (no external dependencies)
|   |-- entities/
|   |   +-- [Entity].ts                         # Domain entity
|   |-- value-objects/
|   |   +-- [ValueObject].ts                    # Value objects (if needed)
|   +-- repositories/
|       +-- I[Entity]Repository.ts              # Repository interface (contract)
|
|-- application/                                # Use cases / orchestration
|   |-- commands/
|   |   |-- Create[Entity]Command.ts            # Write operations
|   |   |-- Update[Entity]Command.ts
|   |   +-- Delete[Entity]Command.ts
|   |-- queries/
|   |   |-- Get[Entity]Query.ts                 # Read operations
|   |   +-- List[Entities]Query.ts
|   +-- services/
|       +-- [Feature]Service.ts                 # Application services (if needed)
|
|-- infrastructure/                             # External adapters (DB, APIs, etc.)
|   +-- repositories/
|       +-- [Database][Entity]Repository.ts      # Database implementation of interface
|
+-- interfaces/                                 # Entry points (HTTP, CLI, etc.)
    |-- controllers/
    |   +-- [Feature]Controller.ts              # Route handlers
    |-- routes/
    |   +-- [feature].routes.ts                 # Route definitions
    +-- validators/
        +-- [feature].validators.ts             # Request validation
```

### 5.1.3 Dependency Registration

<!--
Show what needs to be registered in your DI container, service provider, or module system.
Adapt the syntax to your framework (e.g., InversifyJS, NestJS modules, Spring beans, Django apps).
-->

```
// Pseudocode - adapt to your DI framework

Register repositories:
  I[Entity]Repository  ->  [Database][Entity]Repository

Register command handlers:
  Create[Entity]Handler
  Update[Entity]Handler
  Delete[Entity]Handler

Register query handlers:
  Get[Entity]Handler
  List[Entities]Handler
```
```

---

## 5.2 Frontend Directory Structure

<!--
Show the complete file tree for frontend code.
Adapt the structure to match your project's conventions.
-->

```
frontend/src/[module-or-app]/
|-- index.[ext]                                 # Entry point with routes
|-- navigation.[ext]                            # Navigation / sidebar items
|
|-- pages/
|   |-- [Feature]ListPage.[ext]                 # List page with table
|   |-- [Feature]DetailPage.[ext]               # Detail/edit page
|   |-- [Feature]CreatePage.[ext]               # Create form (or modal)
|   +-- [Feature]SettingsPage.[ext]             # Settings page (Admin)
|
|-- components/
|   |-- [Feature]Table.[ext]                    # Data table component
|   |-- [Feature]Form.[ext]                     # Create/edit form
|   |-- [Feature]Card.[ext]                     # Summary card component
|   |-- [Feature]StatusBadge.[ext]              # Status indicator
|   +-- [Feature]Filters.[ext]                  # Search and filter bar
|
|-- hooks/                                      # Data fetching / state hooks
|   |-- use[Feature]List.[ext]                  # List/search data
|   |-- use[Feature].[ext]                      # Single item data
|   |-- useCreate[Feature].[ext]                # Create mutation
|   |-- useUpdate[Feature].[ext]                # Update mutation
|   +-- useDelete[Feature].[ext]                # Delete mutation
|
|-- api/
|   +-- [feature]Api.[ext]                      # API client functions
|
+-- types/
    +-- [feature].types.[ext]                   # Frontend-specific types
```

### 5.2.1 Data Fetching Pattern

<!--
Show the standard data fetching hook/composable pattern that all hooks must follow.
Include any mandatory auth guards, caching rules, or error handling patterns.
Adapt to your framework (React Query, SWR, Pinia, Vuex, etc.).
-->

```
// Pseudocode - adapt to your data fetching library

function use[Feature]List(params) {
  // 1. Check authentication state
  // 2. Build cache key from params
  // 3. Call API client
  // 4. Return { data, loading, error }
}
```

### 5.2.2 Cache Key Strategy

<!--
Define how cache keys are structured for this feature's data.
This ensures consistent cache invalidation across create/update/delete operations.
-->

```
[feature]                          # Root key for all feature data
[feature] / list / {params}        # List queries (invalidated on create/delete)
[feature] / detail / {id}          # Single item (invalidated on update/delete)
[feature] / settings               # Settings data
```

---

## 5.3 Architecture Decisions

<!--
Document key architectural decisions specific to this feature.
Include the decision, alternatives considered, and rationale.
-->

### 5.3.1 [Decision 1: e.g., Data Storage Strategy]

**Decision:** [What was decided]

**Alternatives Considered:**

1. [Alternative A] - [Pros/Cons]
2. [Alternative B] - [Pros/Cons]

**Rationale:** [Why this approach was chosen]

### 5.3.2 [Decision 2: e.g., Plugin/Extension Architecture]

**Decision:** [What was decided]

**Rationale:** [Why this approach was chosen]

---

## 5.4 Integration Points

<!--
Document how this feature integrates with other parts of the system.
Include cross-app data flows, shared components, external services.
-->

### 5.4.1 Cross-App Data Flow

```
[App A]                    [This Feature]                    [App B]
+-----------+              +----------------+                +-----------+
| [Table X] |<--- reads ---| [Main Table]   |--- events --->| [Audit]   |
+-----------+              +----------------+                +-----------+
```

### 5.4.2 Shared Components Used

| Component | Source | Usage |
| --- | --- | --- |
| [Component 1] | `frontend/src/shared/` | [How it's used] |
| [Component 2] | `frontend/src/apps/[other-app]/` | [How it's used] |

### 5.4.3 External Services

| Service | Purpose | Configuration |
| --- | --- | --- |
| [Service 1] | [What it's used for] | [How to configure] |
| [Service 2] | [What it's used for] | [How to configure] |

---

## Next Document

Continue to [PRD-06-IMPLEMENTATION-STEPS.md](./PRD-06-IMPLEMENTATION-STEPS.md) for the phased implementation plan with task checklists.
