# PRD-06: Implementation Steps

[Back to Index](./PRD-00-INDEX.md) | [Previous: Implementation](./PRD-05-IMPLEMENTATION.md)

## 6.1 Overview

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

## 6.2 Phase 1: Database & Scaffold

<!--
Foundation work: database tables, schema, seeds, and app scaffolding.
Everything else depends on this phase.
-->

### 6.2.1 Database Schema

- [ ] Create `[schema]` schema in `schema.sql`
- [ ] Create `[schema].[table_1]` table
- [ ] Create `[schema].[table_2]` table
- [ ] Create `[schema].[table_3]` table (if applicable)
- [ ] Create all indexes
- [ ] Create all `modified_at` triggers
- [ ] Seed reference/configuration data

### 6.2.2 Backend App Scaffold

- [ ] Create `backend/src/apps/[app]/` directory structure (domain, application, infrastructure, interfaces)
- [ ] Create DI container / module registration for the new app
- [ ] Register new module in the root application container
- [ ] Create empty `[app].routes.ts` with base routing
- [ ] Register `/api/v1/[app]` route in `app-router.ts`

### 6.2.3 Frontend App Scaffold

- [ ] Create `frontend/src/apps/[app]/` directory structure (pages, components, hooks, api, types)
- [ ] Create `index.tsx` app entry with routes
- [ ] Create `navigation.tsx` with sidebar items
- [ ] Create placeholder landing page
- [ ] Register app route in `AppRouting.tsx` (`/apps/[app]/*`)
- [ ] Add app to navigation bar
- [ ] Add cache keys / query keys for the new feature

### 6.2.4 Package Dependencies (if needed)

- [ ] Add `[package]` to `backend/package.json` (or `frontend/package.json`)
- [ ] Verify existing dependencies are sufficient

---

## 6.3 Phase 2: Backend Domain Layer

<!--
Domain entities, value objects, repository interfaces, and domain events.
Pure TypeScript - no external dependencies.
-->

### 6.3.1 Domain Entities

- [ ] Create `[Entity].ts` domain entity with validation
- [ ] Create `[ValueObject].ts` value objects (if needed)
- [ ] Create `I[Entity]Repository.ts` repository interface

### 6.3.2 Domain Events

- [ ] Create `[Feature]Created` event
- [ ] Create `[Feature]Updated` event
- [ ] Create `[Feature]Deleted` event

---

## 6.4 Phase 3: Backend Application Layer

<!--
CQRS commands, queries, and handlers.
Application services that orchestrate domain logic.
-->

### 6.4.1 Commands

- [ ] Create `Create[Entity]Command` + handler
- [ ] Create `Update[Entity]Command` + handler
- [ ] Create `Delete[Entity]Command` + handler

### 6.4.2 Queries

- [ ] Create `Get[Entity]Query` + handler
- [ ] Create `List[Entities]Query` + handler with filtering/pagination
- [ ] Create `Search[Entities]Query` + handler (if applicable)

### 6.4.3 Application Services (if needed)

- [ ] Create `[Feature]Service.ts` for complex orchestration logic

---

## 6.5 Phase 4: Backend Infrastructure & API

<!--
Repository implementations, controllers, routes, and validation.
Connects the domain layer to the outside world.
-->

### 6.5.1 Infrastructure

- [ ] Create `Postgres[Entity]Repository.ts` implementing `I[Entity]Repository`
- [ ] Register repository in DI container
- [ ] Create external service adapters (if needed)

### 6.5.2 Controllers & Routes

- [ ] Create `[Feature]Controller.ts` with all CRUD methods
- [ ] Apply project's async error handling pattern on all route handlers
- [ ] Create `[feature].routes.ts` with route definitions
- [ ] Add request validation middleware
- [ ] Register routes in app router

### 6.5.3 API Verification

- [ ] Test all CRUD endpoints via Swagger or curl
- [ ] Verify error responses (400, 404, 409, 422)
- [ ] Verify authentication and authorization

---

## 6.6 Phase 5: Frontend

<!--
API client, React Query hooks, pages, and components.
Build in order: types -> API client -> hooks -> components -> pages.
-->

### 6.6.1 Types & API Client

- [ ] Create `[feature].types.ts` with frontend-specific types
- [ ] Create `[feature]Api.ts` with all API client functions
- [ ] Apply field name mapping conventions (if frontend/backend use different casing)

### 6.6.2 React Query Hooks

- [ ] Create `use[Feature]List` hook with auth guard
- [ ] Create `use[Feature].ts` for single item
- [ ] Create `useCreate[Feature].ts` mutation hook
- [ ] Create `useUpdate[Feature].ts` mutation hook
- [ ] Create `useDelete[Feature].ts` mutation hook
- [ ] Add cache invalidation on mutations

### 6.6.3 Components

- [ ] Create `[Feature]Table` component (using project's table library)
- [ ] Create `[Feature]Form.tsx` with validation
- [ ] Create `[Feature]StatusBadge.tsx`
- [ ] Create `[Feature]Filters.tsx`
- [ ] Create additional components as needed

### 6.6.4 Pages

- [ ] Create `[Feature]ListPage.tsx` with table, search, filters
- [ ] Create `[Feature]DetailPage.tsx` with form/detail view
- [ ] Create `[Feature]SettingsPage.tsx` (Admin only, if needed)
- [ ] Wire up routing in `index.tsx`

---

## 6.7 Phase 6: Testing & Documentation

<!--
Write tests and documentation after the implementation is functionally complete.
Follow the project's testing strategy.
-->

### 6.7.1 Backend Tests

- [ ] Unit tests for domain entities and value objects
- [ ] Unit tests for command/query handlers (mocked repositories)
- [ ] Integration tests for repository implementations
- [ ] Integration tests for API endpoints

### 6.7.2 Frontend Tests

- [ ] Unit tests for utility functions and helpers
- [ ] Component tests for key components
- [ ] Hook tests for React Query hooks

### 6.7.3 End-to-End Verification

- [ ] Verify full CRUD flow in the browser
- [ ] Verify all user stories from PRD-02 are satisfied
- [ ] Verify all test cases from PRD-02 section 2.6 pass
- [ ] Verify permissions (Viewer, Editor, Admin)

### 6.7.4 Documentation

- [ ] Add Swagger/OpenAPI documentation for all endpoints
- [ ] Update README or project docs if needed

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
