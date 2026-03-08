# PRD-05: Frontend UI Specification

[Back to Index](./PRD-00-INDEX.md) | [Previous: API Endpoints](./PRD-04-API-ENDPOINTS.md) | [Next: Implementation](./PRD-06-IMPLEMENTATION.md)

<!--
This document provides detailed frontend specifications that AI coding assistants
can use to build the UI. It bridges the gap between the high-level wireframes in PRD-01
and the implementation details in PRD-06.

ASCII wireframes are preferred because they give AI assistants an unambiguous visual spec.
Include enough detail that a developer (or AI) can build each screen without guessing.
-->

## 5.1 Design System Reference

<!--
Reference the design system, component library, or styling framework used in the project.
This ensures consistency and prevents AI assistants from inventing custom components
when existing ones should be used.
-->

### 5.1.1 Component Library

| Category | Library / Source | Notes |
| --- | --- | --- |
| UI Framework | [e.g., Tailwind, Bootstrap, MUI, Shadcn] | [Version / config notes] |
| Data Tables | [e.g., TanStack Table, AG Grid, custom] | [Usage pattern] |
| Forms | [e.g., React Hook Form, Formik, native] | [Validation approach] |
| Modals / Dialogs | [e.g., Radix, Headless UI, custom] | [Open/close pattern] |
| Toast / Notifications | [e.g., Sonner, React Hot Toast, custom] | [When to show] |
| Icons | [e.g., Lucide, Heroicons, custom SVGs] | [Import pattern] |

### 5.1.2 Design Tokens

<!--
List the key design tokens / variables that this feature must use.
Only include tokens relevant to this feature, not the entire design system.
-->

| Token | Value | Usage |
| --- | --- | --- |
| Primary color | [e.g., `--color-primary`] | Buttons, links, active states |
| Background | [e.g., `--color-bg-surface`] | Cards, panels |
| Border radius | [e.g., `--radius-md`] | Cards, inputs, buttons |
| Spacing unit | [e.g., `--space-4` = 16px] | Gaps, padding, margins |
| Font sizes | [e.g., `--text-sm`, `--text-base`] | Body text, labels, headings |

### 5.1.3 Existing Components to Reuse

<!--
List shared/existing components from the codebase that this feature should use
instead of building from scratch. This prevents duplication.
-->

| Component | Path | Usage in This Feature |
| --- | --- | --- |
| [DataTable] | `frontend/src/shared/components/DataTable` | List page table |
| [FormField] | `frontend/src/shared/components/FormField` | All form inputs |
| [PageHeader] | `frontend/src/shared/components/PageHeader` | Page titles + actions |
| [EmptyState] | `frontend/src/shared/components/EmptyState` | No-data views |
| [ConfirmDialog] | `frontend/src/shared/components/ConfirmDialog` | Delete confirmations |

---

## 5.2 Page Wireframes

<!--
Provide detailed ASCII wireframes for every page/screen in this feature.
Each wireframe should show:
- Layout grid / structure
- All visible elements (buttons, inputs, labels, data)
- Responsive breakpoints (if behavior differs)
- Loading and empty states

Use the ASCII box-drawing style consistent with PRD-01.
-->

### 5.2.1 [Resource] List Page

**Route:** `/apps/[app]/[resources]`

**Default state (with data):**

```
+------------------------------------------------------------------------------------------+
|  PageHeader                                                                              |
|  [Feature Name]                                           [+ Create New]                 |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Search & Filters---------------------------------------------------------------------+
|  | [Search icon] [Search by name, description...          ]    [Status: All v] [Type v]  |
|  +---------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Table--------------------------------------------------------------------------------+
|  | [ ] | Name          | Type     | Status   | Created     | Updated     | Actions       |
|  +-----+---------------+----------+----------+-------------+-------------+---------------+
|  | [ ] | Item Alpha    | Type A   | Active   | 2026-01-15  | 2026-02-20  | [...] |
|  | [ ] | Item Beta     | Type B   | Draft    | 2026-01-20  | 2026-02-18  | [...] |
|  | [ ] | Item Gamma    | Type A   | Archived | 2025-12-01  | 2026-01-05  | [...] |
|  +-----+---------------+----------+----------+-------------+-------------+--------------+
|                                                                                          |
|  Showing 1-25 of 42                                         [< Prev] [1] [2] [Next >]    |
|                                                                                          |
|  +--Bulk Actions (shown when rows selected)---+                                          |
|  | 3 selected  [Delete] [Change Status v]      |                                         |
|  +---------------------------------------------+                                         |
+------------------------------------------------------------------------------------------+
```

**Empty state (no data):**

```
+------------------------------------------------------------------------------------------+
|  PageHeader                                                                              |
|  [Feature Name]                                           [+ Create New]                 |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|            +----------------------------------------------+                              |
|            |          [Illustration / Icon]                |                             |
|            |                                               |                             |
|            |    No [resources] yet                         |                             |
|            |    Create your first [resource] to get        |                             |
|            |    started.                                   |                             |
|            |                                               |                             |
|            |           [+ Create New]                      |                             |
|            +----------------------------------------------+                              |
|                                                                                          |
+------------------------------------------------------------------------------------------+
```

**Loading state:**

```
+------------------------------------------------------------------------------------------+
|  PageHeader                                                                              |
|  [Feature Name]                                           [+ Create New (disabled)]      |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Table--------------------------------------------------------------------------------+
|  | [ ] | Name          | Type     | Status   | Created     | Updated     | Actions       |
|  +-----+---------------+----------+----------+-------------+-------------+---------------+
|  | [skeleton row ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~]           |
|  | [skeleton row ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~]           |
|  | [skeleton row ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~]           |
|  +-----+---------------+----------+----------+-------------+-------------+---------------+
|                                                                                          |
+------------------------------------------------------------------------------------------+
```

### 5.2.2 [Resource] Create / Edit Page (or Modal)

**Route:** `/apps/[app]/[resources]/new` (create) or `/apps/[app]/[resources]/:id/edit` (edit)

<!--
Choose between a full page or a modal/drawer based on form complexity.
Simple forms (3-5 fields): modal or slide-over
Complex forms (6+ fields, tabs, nested data): full page
-->

```
+------------------------------------------------------------------------------------------+
|  PageHeader                                                                              |
|  [Create / Edit] [Resource]                               [Cancel]  [Save]               |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Form Section: Basic Info-------------------------------------------------------------+
|  |                                                                                       |
|  |  Name *                                                                               |
|  |  [_______________________________________________]                                    |
|  |  Brief name for this [resource]                                                       |
|  |                                                                                       |
|  |  Description                                                                          |
|  |  [                                               ]                                    |
|  |  [                                               ]                                    |
|  |  [_______________________________________________]                                    |
|  |                                                                                       |
|  |  Type *                           Status                                              |
|  |  [Select type...          v]      [Draft            v]                                |
|  |                                                                                       |
|  +---------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Form Section: [Category 2]-----------------------------------------------------------+
|  |                                                                                       |
|  |  [Field 4] *                      [Field 5]                                           |
|  |  [___________________]            [___________________]                               |
|  |                                                                                       |
|  |  [Field 6]                                                                            |
|  |  [_______________________________________________]                                    |
|  |                                                                                       |
|  +---------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Form Section: [Related Items]--------------------------------------------------------+
|  |                                                                                       |
|  |  +--Item 1------------------+  +--Item 2------------------+  [+ Add Item]             |
|  |  | Name: Alpha              |  | Name: Beta               |                           |
|  |  | Value: 100               |  | Value: 200               |                           |
|  |  | [Edit] [Remove]          |  | [Edit] [Remove]          |                           |
|  |  +--------------------------+  +--------------------------+                           |
|  |                                                                                       |
|  +---------------------------------------------------------------------------------------+
|                                                                                          |
+------------------------------------------------------------------------------------------+
```

### 5.2.3 [Resource] Detail Page

**Route:** `/apps/[app]/[resources]/:id`

```
+------------------------------------------------------------------------------------------+
|  PageHeader                                                                              |
|  [Resource Name]                  [StatusBadge: Active]   [Edit]  [Delete]  [...]        |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Tab Bar------------------------------------------------------------------------------+
|  | [Overview]  [Related Items]  [Activity]  [Settings]                                   |
|  +---------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Overview Tab-------------------------------------------------------------------------+
|  |                                                                                       |
|  |  +--Summary Card----------------------------+  +--Metadata Card--------------------+  |
|  |  | Type:       Type A                       |  | Created:   2026-01-15 by User A   |  |
|  |  | Status:     Active                       |  | Updated:   2026-02-20 by User B   |  |
|  |  | [Field 3]:  Value                        |  | ID:        uuid-1234-5678         |  |
|  |  | [Field 4]:  Value                        |  |                                   |  |
|  |  +------------------------------------------+  +-----------------------------------+  |
|  |                                                                                       |
|  |  +--Description Card-----------------------------------------------------------------+|
|  |  | [Full description text displayed here]    |                                        |
|  |  +-----------------------------------------------------------------------------------+|
|  |                                                                                       |
|  +---------------------------------------------------------------------------------------+
|                                                                                          |
+------------------------------------------------------------------------------------------+
```

### 5.2.4 Settings Page

<!--
Only include if the feature has admin-configurable settings.
-->

**Route:** `/apps/[app]/settings`

```
+------------------------------------------------------------------------------------------+
|  PageHeader                                                                              |
|  [Feature] Settings                                                                      |
+------------------------------------------------------------------------------------------+
|                                                                                          |
|  +--Tabs---------------------------------------------------------------------------------+
|  | [General]  [Permissions]  [Integrations]                                              |
|  +---------------------------------------------------------------------------------------+
|                                                                                          |
|  +--General Tab--------------------------------------------------------------------------+
|  |                                                                                       |
|  |  Default Status for New [Resources]                                                   |
|  |  [Draft                      v]                                                       |
|  |  The status assigned when a new [resource] is created                                 |
|  |                                                                                       |
|  |  Items Per Page                                                                       |
|  |  [25                         v]                                                       |
|  |                                                                                       |
|  |  Enable [Feature Toggle]                                                              |
|  |  [x] Allow users to [describe what toggle enables]                                    |
|  |                                                                                       |
|  |  [Save Changes]                                                                       |
|  |                                                                                       |
|  +---------------------------------------------------------------------------------------+
|                                                                                          |
+------------------------------------------------------------------------------------------+
```

---

## 5.3 Component Specifications

<!--
Define the props, behavior, and variants for each custom component.
This section tells the AI assistant exactly what to build.
-->

### 5.3.1 [Feature]Table

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| data | `[Resource][]` | `[]` | Array of resources to display |
| loading | `boolean` | `false` | Show skeleton loading state |
| onRowClick | `(id: string) => void` | - | Navigate to detail page |
| onDelete | `(ids: string[]) => void` | - | Delete selected rows |
| selectedIds | `string[]` | `[]` | Currently selected row IDs |
| onSelectionChange | `(ids: string[]) => void` | - | Selection change handler |

**Behavior:**
- Clicking a row navigates to the detail page
- Checkbox column enables multi-select for bulk actions
- Sortable columns: Name, Created, Updated
- Status column renders `[Feature]StatusBadge`
- Actions column shows a dropdown menu: View, Edit, Delete
- Delete action shows a confirmation dialog before executing

### 5.3.2 [Feature]Form

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| initialData | `Partial<[Resource]>` | `{}` | Pre-fill form for editing |
| onSubmit | `(data: [Resource]Input) => void` | - | Form submission handler |
| onCancel | `() => void` | - | Cancel / close handler |
| isSubmitting | `boolean` | `false` | Disable form during save |

**Validation Rules:**

| Field | Rule | Error Message |
| --- | --- | --- |
| name | Required, 1-255 chars | "Name is required" / "Name must be under 255 characters" |
| type | Required, must be valid enum | "Please select a type" |
| description | Optional, max 2000 chars | "Description must be under 2000 characters" |
| [field] | [Rule] | [Message] |

**Behavior:**
- Validation runs on blur for individual fields, on submit for all fields
- Submit button is disabled while `isSubmitting` is true
- Unsaved changes trigger a "discard changes?" prompt on navigation

### 5.3.3 [Feature]StatusBadge

| Prop | Type | Description |
| --- | --- | --- |
| status | `[StatusEnum]` | The status to display |

**Variants:**

| Status | Color | Label |
| --- | --- | --- |
| draft | Gray / Neutral | Draft |
| active | Green / Success | Active |
| archived | Yellow / Warning | Archived |
| [status] | [Color token] | [Label] |

### 5.3.4 [Feature]Filters

| Prop | Type | Description |
| --- | --- | --- |
| filters | `FilterState` | Current filter values |
| onChange | `(filters: FilterState) => void` | Filter change handler |

**Filter Controls:**

| Filter | Type | Options | Default |
| --- | --- | --- | --- |
| search | Text input (debounced 300ms) | Free text | "" |
| status | Select dropdown | All, Draft, Active, Archived | All |
| type | Select dropdown | All, [Type A], [Type B] | All |
| dateRange | Date range picker | Custom range | Last 30 days |

---

## 5.4 Interaction Patterns

<!--
Define how the UI responds to user actions.
This section covers transitions, feedback, and edge cases.
-->

### 5.4.1 Create Flow

```
[List Page] --click "+ Create New"--> [Create Page/Modal]
  |                                      |
  |                                      |--fill form--> [Save]
  |                                      |                 |
  |                                      |        success: toast "Created successfully"
  |                                      |                 redirect to detail page
  |                                      |
  |                                      |        error: inline error message on form
  |                                      |               form stays open, data preserved
  |                                      |
  |                                      |--click "Cancel"--> back to list (confirm if dirty)
```

### 5.4.2 Edit Flow

```
[Detail Page] --click "Edit"--> [Edit Page/Modal]
  |                                |
  |                                |--form pre-filled with current data
  |                                |--modify fields--> [Save]
  |                                |                     |
  |                                |            success: toast "Updated successfully"
  |                                |                     redirect to detail page
  |                                |
  |                                |            error: inline error on form, data preserved
  |                                |
  |                                |--click "Cancel"--> back to detail (confirm if dirty)
```

### 5.4.3 Delete Flow

```
[Any Page] --click "Delete"--> [Confirmation Dialog]
  |                               |
  |                               |  "Are you sure you want to delete [Name]?"
  |                               |  "This action cannot be undone."
  |                               |
  |                               |--click "Delete"--> API call
  |                               |                      |
  |                               |             success: toast "Deleted successfully"
  |                               |                      redirect to list page
  |                               |
  |                               |             error: toast "[Error message from API]"
  |                               |                    dialog closes
  |                               |
  |                               |--click "Cancel"--> dialog closes, no action
```

### 5.4.4 Bulk Actions

```
[List Page] --select rows via checkboxes--> [Bulk Action Bar appears]
  |                                            |
  |                                            |--click "Delete"--> [Confirmation Dialog]
  |                                            |  "Delete 3 [resources]? This cannot be undone."
  |                                            |
  |                                            |--click "Change Status"--> [Status Dropdown]
  |                                            |  Select new status --> API call for each
  |                                            |  Success: toast "Updated 3 [resources]"
```

---

## 5.5 Responsive Behavior

<!--
Define how layouts adapt to different screen sizes.
Only include if the feature has specific responsive requirements.
-->

### 5.5.1 Breakpoints

| Breakpoint | Width | Layout Changes |
| --- | --- | --- |
| Desktop | >= 1024px | Full table with all columns, side-by-side cards |
| Tablet | 768-1023px | Table hides low-priority columns, cards stack vertically |
| Mobile | < 768px | Table becomes card list, forms go full-width, modals become full-screen |

### 5.5.2 Table Responsive Strategy

<!--
Choose ONE strategy and delete the others:
- Column hiding: hide low-priority columns on smaller screens
- Horizontal scroll: keep all columns, enable horizontal scrolling
- Card transformation: convert rows into stacked cards on mobile
-->

**Strategy:** [Column hiding / Horizontal scroll / Card transformation]

**Column Priority (for column-hiding strategy):**

| Priority | Columns | Hidden Below |
| --- | --- | --- |
| Always visible | Name, Status, Actions | Never hidden |
| High | Type, Updated | < 768px |
| Medium | Created | < 1024px |
| Low | [Other columns] | < 1280px |

---

## 5.6 Accessibility Requirements

<!--
List specific accessibility requirements for this feature.
These are in addition to any project-wide accessibility standards.
-->

| Requirement | Implementation |
| --- | --- |
| Keyboard navigation | All interactive elements reachable via Tab; Enter/Space to activate |
| Focus management | Focus moves to first field when form opens; returns to trigger on close |
| Screen reader labels | All icon-only buttons have `aria-label`; status badges have `aria-label` with status text |
| Error announcements | Form validation errors announced via `aria-live="polite"` region |
| Color contrast | Status colors meet WCAG AA (4.5:1 for text, 3:1 for UI components) |
| Reduced motion | Skeleton loaders and transitions respect `prefers-reduced-motion` |

---

## 5.7 Error States & Edge Cases

<!--
Define how the UI handles errors and unusual situations.
These are easy to forget but critical for a polished experience.
-->

### 5.7.1 Error States

| Scenario | UI Response |
| --- | --- |
| API returns 500 | Full-page error with retry button: "Something went wrong. [Try Again]" |
| API returns 404 (detail page) | Full-page not-found: "[Resource] not found. [Back to List]" |
| API returns 403 | Inline message: "You don't have permission to [action]" |
| API returns 422 (validation) | Map field errors to form fields; show inline under each field |
| Network offline | Toast: "You're offline. Changes will not be saved." Disable submit buttons |
| API timeout | Toast: "Request timed out. [Retry]" |

### 5.7.2 Edge Cases

| Scenario | UI Response |
| --- | --- |
| Very long name (255 chars) | Truncate with ellipsis in table; show full name on hover/detail |
| Empty description | Show placeholder text: "No description provided" |
| Concurrent edit conflict (409) | Dialog: "[Resource] was modified by another user. [Reload] [Overwrite]" |
| Rapid double-click on submit | Disable button on first click; prevent duplicate submissions |
| Large dataset (1000+ rows) | Server-side pagination; show total count; optional "Load more" |
| Special characters in search | Sanitize input; escape for API query |

---

## Next Document

Continue to [PRD-06-IMPLEMENTATION.md](./PRD-06-IMPLEMENTATION.md) for backend/frontend directory structure and architecture decisions.
