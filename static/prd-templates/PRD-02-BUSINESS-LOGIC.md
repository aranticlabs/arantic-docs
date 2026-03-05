# PRD-02: Business Logic

[Back to Index](./PRD-00-INDEX.md) | [Previous: Overview](./PRD-01-OVERVIEW.md) | [Next: Database Schema](./PRD-03-DATABASE-SCHEMA.md)

## 2.1 Glossary of Domain Terms

<!--
Define domain-specific terms used throughout the PRD.
Include translations if the domain uses non-English terminology.
This helps AI assistants and new developers understand the business context.
-->

| Term | Translation (if applicable) | Description |
| --- | --- | --- |
| [Term 1] | [Translation] | [Definition] |
| [Term 2] | [Translation] | [Definition] |
| [Term 3] | [Translation] | [Definition] |

---

## 2.2 User Stories & Acceptance Criteria

<!--
Write user stories in the standard format: "As a [role], I want to [action] so that [benefit]."
Each story should have clear, testable acceptance criteria.
Group related stories together.
-->

### 2.2.1 [Story Group 1: e.g., Resource Management]

**US-01: [Create Resource]**

> As a [role], I want to [action] so that [benefit].

**Acceptance Criteria:**

- [ ] [Criterion 1 - specific, testable]
- [ ] [Criterion 2 - specific, testable]
- [ ] [Criterion 3 - specific, testable]

**US-02: [View/List Resources]**

> As a [role], I want to [action] so that [benefit].

**Acceptance Criteria:**

- [ ] [Criterion 1]
- [ ] [Criterion 2]

**US-03: [Update Resource]**

> As a [role], I want to [action] so that [benefit].

**Acceptance Criteria:**

- [ ] [Criterion 1]
- [ ] [Criterion 2]

**US-04: [Delete Resource]**

> As a [role], I want to [action] so that [benefit].

**Acceptance Criteria:**

- [ ] [Criterion 1]
- [ ] [Criterion 2]

### 2.2.2 [Story Group 2: e.g., Search & Filter]

**US-05: [Search]**

> As a [role], I want to [action] so that [benefit].

**Acceptance Criteria:**

- [ ] [Criterion 1]
- [ ] [Criterion 2]

### 2.2.3 [Story Group 3: e.g., Settings & Configuration]

**US-06: [Configure Settings]**

> As a [role], I want to [action] so that [benefit].

**Acceptance Criteria:**

- [ ] [Criterion 1]
- [ ] [Criterion 2]

---

## 2.3 Domain Lifecycle

<!--
Define the lifecycle states and transitions for the main domain entity.
Include a state diagram (ASCII art) showing valid transitions.
-->

### 2.3.1 Status States

| Status | Description | Editable | Transitions To |
| --- | --- | --- | --- |
| `draft` | [Description] | Yes | `active`, `deleted` |
| `active` | [Description] | Limited | `archived`, `deleted` |
| `archived` | [Description] | No | `active` |

### 2.3.2 State Diagram

```
                    +---------+
         create --> | draft   |
                    +---------+
                        |
                    activate
                        |
                        v
                    +---------+
                    | active  | <--- restore
                    +---------+         |
                        |               |
                    archive         +-----------+
                        |           | archived  |
                        +---------> +-----------+
```

### 2.3.3 Transition Rules

| Transition | Trigger | Conditions | Side Effects |
| --- | --- | --- | --- |
| draft -> active | User action | [Required conditions] | [What happens] |
| active -> archived | User action | [Required conditions] | [What happens] |

---

## 2.4 Business Rules & Calculations

<!--
Document the core business rules and any calculation logic.
Be specific with formulas, rounding rules, and edge cases.
Use tables and examples to make rules unambiguous.
-->

### 2.4.1 [Rule Category 1]

**Rule:** [Clear statement of the business rule]

**Logic:**

```
[Pseudocode or formula]
result = input_a * factor_b + overhead_c
```

**Example:**

| Input | Value | Result |
| --- | --- | --- |
| [Input A] | 100 | |
| [Factor B] | 1.5 | |
| **Result** | | **150** |

### 2.4.2 [Rule Category 2]

**Rule:** [Clear statement of the business rule]

**Conditions:**

- If [condition A], then [action]
- If [condition B], then [different action]
- Default: [fallback action]

### 2.4.3 Permissions Matrix

<!--
Define who can do what. Use roles from your auth system.
-->

| Action | Viewer | Editor | Admin | Super Admin |
| --- | --- | --- | --- | --- |
| View [resource] | yes | yes | yes | yes |
| Create [resource] | no | yes | yes | yes |
| Edit [resource] | no | yes | yes | yes |
| Delete [resource] | no | no | yes | yes |
| Manage settings | no | no | yes | yes |

---

## 2.5 Settings & Configuration

<!--
Document all configurable values that affect business logic.
Every configurable value should be a setting, not hardcoded.
-->

### 2.5.1 [Settings Group 1]

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| [setting_1] | number | 10 | [What it controls] |
| [setting_2] | string | "default" | [What it controls] |
| [setting_3] | boolean | true | [What it controls] |

### 2.5.2 [Settings Group 2]

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| [setting_4] | number | 30 | [What it controls] |
| [setting_5] | enum | "option_a" | [What it controls] |

---

## 2.6 Verification Test Cases

<!--
Concrete test cases with specific input/output values.
These serve as the acceptance criteria for the implementation.
AI coding assistants can use these to write automated tests.
-->

### Test Case 1: [Scenario Name]

**Setup:**

- [Precondition 1]
- [Precondition 2]

**Input:**

| Field | Value |
| --- | --- |
| [field_1] | [value] |
| [field_2] | [value] |

**Expected Output:**

| Field | Expected Value |
| --- | --- |
| [output_1] | [value] |
| [output_2] | [value] |

### Test Case 2: [Scenario Name]

**Setup:**

- [Precondition 1]

**Input:**

| Field | Value |
| --- | --- |
| [field_1] | [value] |
| [field_2] | [value] |

**Expected Output:**

| Field | Expected Value |
| --- | --- |
| [output_1] | [value] |
| [output_2] | [value] |

### Test Case 3: [Edge Case / Error Scenario]

**Setup:**

- [Precondition for edge case]

**Input:**

| Field | Value |
| --- | --- |
| [field_1] | [boundary/invalid value] |

**Expected Behavior:**

- [What should happen - error message, fallback, etc.]

---

## Next Document

Continue to [PRD-03-DATABASE-SCHEMA.md](./PRD-03-DATABASE-SCHEMA.md) for table definitions, indexes, and TypeScript interfaces.
