# PRD-01: Overview & Architecture

[Back to Index](./PRD-00-INDEX.md)

## 1.1 Vision

<!--
What is the high-level vision for this feature?
Write 2-3 sentences that capture the essence of what you're building and why.
-->

Create a [what] within [where] to [primary goal]. This enables [target users] to [key benefit].

## 1.2 Purpose & Workflow

<!--
Describe the primary use case and user workflow.
Who uses this feature, and what is the end-to-end flow?
-->

### Primary Use Case

1. **[Actor]** performs [action]
2. **[Actor]** reviews [output]
3. **[Actor]** completes [final step]

### Secondary Use Cases

<!-- List any secondary workflows or edge cases -->

- [Secondary use case 1]
- [Secondary use case 2]

## 1.3 Scope

### In Scope

<!-- List everything this feature includes, grouped by category -->

- **[Category 1]:**
  - [Feature/capability]
  - [Feature/capability]

- **[Category 2]:**
  - [Feature/capability]
  - [Feature/capability]

- **[Category 3]:**
  - [Feature/capability]
  - [Feature/capability]

### Out of Scope

<!-- Explicitly list what this feature does NOT include to prevent scope creep -->

- [Not included 1]
- [Not included 2]
- [Not included 3]

## 1.4 Success Criteria

<!-- Measurable criteria to verify the feature is complete and correct -->

| Criteria | Target |
| --- | --- |
| [Metric 1] | [Target value] |
| [Metric 2] | [Target value] |
| [Metric 3] | [Target value] |
| [Metric 4] | [Target value] |

## 1.5 UI/UX Design

<!--
ASCII wireframes for each major screen/view.
Include navigation structure, page layouts, table columns, form fields, and action buttons.
ASCII art is preferred over descriptions because it gives AI coding assistants a clear visual specification.
-->

### 1.5.1 Navigation

<!-- Show where this feature fits in the application navigation -->

```
+--------------------------------------------------------------+
|  [App Name]                              [User] [Settings]   |
+--------------------------------------------------------------+
|                                                              |
|  [App 1]  [App 2]  [This Feature]                           |
|                     ^^^^^^^^^^^^^^                           |
|                                                              |
|  Sidebar:                                                    |
|  +------------------+                                        |
|  | Section 1        |                                        |
|  | Section 2        |                                        |
|  | Settings         |                                        |
|  +------------------+                                        |
|                                                              |
+--------------------------------------------------------------+
```

**Frontend Routes:**

```
/apps/[app]/                          # Landing page
/apps/[app]/[resource]                # List view
/apps/[app]/[resource]/new            # Create form
/apps/[app]/[resource]/:id            # Detail/edit view
/apps/[app]/settings                  # Admin settings
```

### 1.5.2 List Page

<!-- Primary list/table view for the main resource -->

```
+--------------------------------------------------------------------------------------------+
|  [App] > [Resource]                                                                        |
+--------------------------------------------------------------------------------------------+
|                                                                                            |
|  [Search...              ]                                   [+ Create New]                |
|                                                                                            |
|  Filter: [Filter 1 v] [Filter 2 v]                                                        |
|                                                                                            |
|  +------------------------------------------------------------------------------+          |
|  | Column 1    | Column 2    | Column 3    | Column 4  | Status  | Actions     |          |
|  +------------------------------------------------------------------------------+          |
|  | Value       | Value       | Value       | Value     | Active  | [Edit] [Del]|          |
|  | Value       | Value       | Value       | Value     | Draft   | [Edit] [Del]|          |
|  +------------------------------------------------------------------------------+          |
|                                                                                            |
|  Showing 1-25 of N                                   [< 1 2 >]                            |
|                                                                                            |
+--------------------------------------------------------------------------------------------+
```

### 1.5.3 Table Columns

<!-- Define each column in the list table -->

| Column | Description | Sortable | Width |
| --- | --- | --- | --- |
| [Column 1] | [What it shows] | Yes | [Npx] |
| [Column 2] | [What it shows] | Yes | [Npx] |
| [Column 3] | [What it shows] | No | [Npx] |
| Actions | [Available actions] | No | [Npx] |

**Row Actions:**

- **View** - [Description] ([permission level])
- **Edit** - [Description] ([permission level])
- **Delete** - [Description] ([permission level])

### 1.5.4 Detail / Edit Page

<!-- Main detail/edit view for a single resource -->

```
+-------------------------------------------------------------------+
|  [App] > [Resource] > [Item Name]                    [Actions]    |
+-------------------------------------------------------------------+
|                                                                   |
|  [Form fields / detail panels layout]                             |
|                                                                   |
|  Field 1: [________________]                                      |
|  Field 2: [________________]                                      |
|  Field 3: [Dropdown       v]                                      |
|                                                                   |
|  [Save] [Cancel]                                                  |
|                                                                   |
+-------------------------------------------------------------------+
```

### 1.5.5 Settings Page

<!-- Settings/configuration screens if applicable -->

```
+---------------------------------------------------------------------+
|  [App] > Settings                                                    |
+---------------------------------------------------------------------+
|  [Tab 1] [Tab 2] [Tab 3]                                            |
|   ^^^^^^^                                                            |
|  [Subtab A] [Subtab B]                                               |
|   ^^^^^^^^^                                                          |
+---------------------------------------------------------------------+
|                                                                      |
|  [Settings content for selected tab/subtab]                          |
|                                                                      |
|  +----------------------------------------------------------------+ |
|  | Setting              | Value                                    | |
|  +----------------------------------------------------------------+ |
|  | [Setting 1]          | [Current value / input field]            | |
|  | [Setting 2]          | [Current value / input field]            | |
|  +----------------------------------------------------------------+ |
|                                                                      |
|  [Save Changes]                                                      |
|                                                                      |
+---------------------------------------------------------------------+
```

## 1.6 Technical Notes

<!--
Key technical decisions and constraints.
This is a reference section - list the technology choices, patterns, and rules that developers must follow.
-->

- **Architecture:** [e.g., Clean Architecture, Hexagonal, MVC, CQRS]
- **Database:** [e.g., PostgreSQL, MySQL, MongoDB - version and schema strategy]
- **Backend:** [e.g., Node.js/Express, Django, Spring Boot - language and framework]
- **Frontend:** [e.g., React, Vue, Angular - framework and build tool]
- **State Management:** [e.g., Redux, Zustand, React Query, Pinia]
- **Styling:** [e.g., Tailwind CSS, CSS Modules, Styled Components, component library]
- **Auth Pattern:** [e.g., JWT, OAuth 2.0, session-based - describe mandatory auth rules]
- **API Pattern:** [e.g., REST, GraphQL - describe controller/resolver conventions]
- **Field Name Mapping:** [e.g., describe naming convention rules between frontend and backend]

## Next Document

Continue to [PRD-02-BUSINESS-LOGIC.md](./PRD-02-BUSINESS-LOGIC.md) for user stories, domain rules, and business logic.
