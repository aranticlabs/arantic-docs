# PRD-07: Implementation Steps

[Back to Index](./PRD-00-INDEX.md) | [Previous: Implementation](./PRD-06-IMPLEMENTATION.md)

## 7.1 Overview

<!--
Summarize the implementation approach.
List key decisions that have been resolved.
Phases should follow dependency order: database first, then backend domain, then application layer, then API, then frontend.
-->

This document outlines the phased implementation plan for [Feature Name]. Steps are organized by phase and dependency order.

### Resolved Decisions

| Decision | Choice |
| --- | --- |
| [Decision area 1] | [What was decided] |
| [Decision area 2] | [What was decided] |
| [Decision area 3] | [What was decided] |
| [Decision area 4] | [What was decided] |

---

## 7.2 Phase 1: Database & Scaffold

<!--
Foundation work: database tables, schema, seeds, and app scaffolding.
Everything else depends on this phase.
-->

### 7.2.1 Database Schema

- Create `[schema]` schema in `schema.sql`
- Create `[schema].[table_1]` table
- Create `[schema].[table_2]` table
- Create `[schema].[table_3]` table (if applicable)
- Create all indexes
- Create all `modified_at` triggers
- Seed reference/configuration data

### 7.2.2 Backend App Scaffold

- Create `backend/src/apps/[app]/` directory structure (domain, application, infrastructure, interfaces)
- Create DI container / module registration for the new app
- Register new module in the root application container
- Create empty `[app].routes.[ext]` with base routing
- Register `/api/v1/[app]` route in the root API router

### 7.2.3 Frontend App Scaffold

- Create `frontend/src/apps/[app]/` directory structure (pages, components, hooks, api, types)
- Create `index.[ext]` app entry with routes
- Create `navigation.[ext]` with sidebar items
- Create placeholder landing page
- Register app route in the root routing configuration (`/apps/[app]/*`)
- Add app to navigation bar
- Add cache keys / query keys for the new feature (if applicable)

### 7.2.4 Package Dependencies (if needed)

- Add `[package]` to the project's package manifest (backend and/or frontend as needed)
- Verify existing dependencies are sufficient

---

## 7.3 Phase 2: Backend Domain Layer

<!--
Domain entities, value objects, repository interfaces, and domain events.
Pure business logic - no external dependencies.
-->

### 7.3.1 Domain Entities

- Create `[Entity].[ext]` domain entity with validation
- Create `[ValueObject].[ext]` value objects (if needed)
- Create `I[Entity]Repository.[ext]` repository interface

### 7.3.2 Domain Events

- Create `[Feature]Created` event
- Create `[Feature]Updated` event
- Create `[Feature]Deleted` event

---

## 7.4 Phase 3: Backend Application Layer

<!--
CQRS commands, queries, and handlers.
Application services that orchestrate domain logic.
-->

### 7.4.1 Commands

- Create `Create[Entity]Command` + handler
- Create `Update[Entity]Command` + handler
- Create `Delete[Entity]Command` + handler

### 7.4.2 Queries

- Create `Get[Entity]Query` + handler
- Create `List[Entities]Query` + handler with filtering/pagination
- Create `Search[Entities]Query` + handler (if applicable)

### 7.4.3 Application Services (if needed)

- Create `[Feature]Service.[ext]` for complex orchestration logic

---

## 7.5 Phase 4: Backend Infrastructure & API

<!--
Repository implementations, controllers, routes, and validation.
Connects the domain layer to the outside world.
-->

### 7.5.1 Infrastructure

- Create `[Database][Entity]Repository.[ext]` implementing `I[Entity]Repository`
- Register repository in DI container
- Create external service adapters (if needed)

### 7.5.2 Controllers & Routes

- Create `[Feature]Controller.[ext]` with all CRUD methods
- Apply project's async error handling pattern on all route handlers
- Create `[feature].routes.[ext]` with route definitions
- Add request validation middleware
- Register routes in app router

### 7.5.3 API Verification

- Test all CRUD endpoints via your API testing tool of choice (API client, curl, etc.)
- Verify error responses (400, 404, 409, 422)
- Verify authentication and authorization

---

## 7.6 Phase 5: Frontend

<!--
API client, data fetching hooks, pages, and components.
Build in order: types -> API client -> hooks -> components -> pages.
-->

### 7.6.1 Types & API Client

- Create `[feature].types.[ext]` with frontend-specific types
- Create `[feature]Api.[ext]` with all API client functions
- Apply field name mapping conventions (if frontend/backend use different casing)

### 7.6.2 Data Fetching Hooks / Services

- Create `use[Feature]List` hook/service with auth guard
- Create `use[Feature]` for single item
- Create `useCreate[Feature]` / create mutation
- Create `useUpdate[Feature]` / update mutation
- Create `useDelete[Feature]` / delete mutation
- Add cache invalidation on mutations (if applicable)

### 7.6.3 Components

- Create `[Feature]Table` component (using project's table library)
- Create `[Feature]Form.[ext]` with validation
- Create `[Feature]StatusBadge.[ext]`
- Create `[Feature]Filters.[ext]`
- Create additional components as needed

### 7.6.4 Pages

- Create `[Feature]ListPage.[ext]` with table, search, filters
- Create `[Feature]DetailPage.[ext]` with form/detail view
- Create `[Feature]SettingsPage.[ext]` (Admin only, if needed)
- Wire up routing in the app entry file

---

## 7.7 Phase 6: Testing & Documentation

<!--
Write tests and documentation after the implementation is functionally complete.
Follow the project's testing strategy.
-->

### 7.7.1 Backend Tests

- Unit tests for domain entities and value objects
- Unit tests for command/query handlers (mocked repositories)
- Integration tests for repository implementations
- Integration tests for API endpoints

### 7.7.2 Frontend Tests

- Unit tests for utility functions and helpers
- Component tests for key components
- Hook tests for data fetching hooks

### 7.7.3 End-to-End Verification

- Verify full CRUD flow in the browser
- Verify all user stories from PRD-02 are satisfied
- Verify all test cases from PRD-02 section 2.6 pass
- Verify permissions (Viewer, Editor, Admin)

### 7.7.4 Documentation

- Add API documentation for all endpoints (using your project's documentation tool)
- Update README or project docs if needed

---

## Phase Dependencies

<!--
Show which phases depend on which.
This helps AI assistants and developers understand the build order.
-->

```
Phase 1: Database & Scaffold
    |
    v
Phase 2: Backend Domain Layer
    |
    v
Phase 3: Backend Application Layer
    |
    v
Phase 4: Backend Infrastructure & API
    |
    v
Phase 5: Frontend
    |
    v
Phase 6: Testing & Documentation
```

> **Note:** Phases 2-4 (backend) can overlap slightly, but each layer depends on the one before it. Phase 5 (frontend) requires the API to be functional. Phase 6 can partially overlap with Phase 5.
