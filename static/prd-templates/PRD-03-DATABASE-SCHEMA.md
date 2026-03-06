# PRD-03: Database Schema

[Back to Index](./PRD-00-INDEX.md) | [Previous: Business Logic](./PRD-02-BUSINESS-LOGIC.md) | [Next: API Endpoints](./PRD-04-API-ENDPOINTS.md)

## 3.1 Schema Context

<!--
Describe which database schema this feature uses and how it relates to other schemas.
In a multi-app system, clarify schema ownership.
-->

This module is part of the **[Platform Name]** platform. Each app owns its own database schema:

| App | Schema | Example Tables |
| --- | --- | --- |
| [App 1] | `[schema_1]` | `[schema_1].[table_a]`, `[schema_1].[table_b]` |
| [App 2] | `[schema_2]` | `[schema_2].[table_c]` |
| **[This App]** | **`[this_schema]`** | **`[this_schema].[main_table]`** |

### Schema Ownership

<!-- Clarify what this app owns vs. what it references from other schemas -->

**[This App] (`[this_schema].*` schema):**

- `[this_schema].[table_1]` - [Description]
- `[this_schema].[table_2]` - [Description]
- `[this_schema].[table_3]` - [Description]

**Cross-Schema References:**

- `[this_schema].[table_1].[foreign_key]` -> `[other_schema].[table].[id]`

---

## 3.2 Entity-Relationship Overview

<!--
Show how tables relate to each other. Use ASCII art for a clear visual representation.
-->

```
+------------------+       +------------------+       +------------------+
| [table_1]        |       | [table_2]        |       | [table_3]        |
+------------------+       +------------------+       +------------------+
| id (PK)          |<------| table_1_id (FK)  |       | id (PK)          |
| name             |       | id (PK)          |------>| table_2_id (FK)  |
| status           |       | value            |       | quantity         |
| created_at       |       | created_at       |       | created_at       |
+------------------+       +------------------+       +------------------+
```

---

## 3.3 Table Definitions

<!--
Define each table using your project's schema definition format.
Include all columns, data types, constraints, defaults, and foreign keys.
Follow the existing project conventions for audit fields and naming.
The examples below use generic SQL — adapt to your database technology.
-->

### 3.3.1 [schema].[table_1]

[Brief description of what this table stores]

```sql
CREATE TABLE [schema].[table_1] (
    id              [UUID type] PRIMARY KEY DEFAULT [uuid function],
    name            [string type](255) NOT NULL,
    code            [string type](50) NOT NULL UNIQUE,
    description     [text type],
    status          [string type](20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'active', 'archived')),
    is_active       [boolean type] NOT NULL DEFAULT true,

    -- Audit fields
    created_at      [timestamp type] NOT NULL DEFAULT [now function],
    created_by      [string type](255) NOT NULL,
    modified_at     [timestamp type] NOT NULL DEFAULT [now function],
    modified_by     [string type](255) NOT NULL
);

-- Add modified_at auto-update mechanism per your database conventions
-- (trigger, ORM hook, application-level update, etc.)

COMMENT ON TABLE [schema].[table_1] IS '[Description of the table purpose]';
```

### 3.3.2 [schema].[table_2]

[Brief description of what this table stores]

```sql
CREATE TABLE [schema].[table_2] (
    id              [UUID type] PRIMARY KEY DEFAULT [uuid function],
    table_1_id      [UUID type] NOT NULL REFERENCES [schema].[table_1](id),
    value           [decimal type](12,2) NOT NULL,
    [field]         [type] NOT NULL DEFAULT '[default]'
                    CHECK ([field] IN ('[option_1]', '[option_2]', '[option_3]')),

    -- Audit fields
    created_at      [timestamp type] NOT NULL DEFAULT [now function],
    created_by      [string type](255) NOT NULL,
    modified_at     [timestamp type] NOT NULL DEFAULT [now function],
    modified_by     [string type](255) NOT NULL
);
```

### 3.3.3 [schema].[junction_table] (if needed)

[Brief description - junction/linking tables for many-to-many relationships]

```sql
CREATE TABLE [schema].[junction_table] (
    table_1_id      [UUID type] NOT NULL REFERENCES [schema].[table_1](id) ON DELETE CASCADE,
    table_3_id      [UUID type] NOT NULL REFERENCES [schema].[table_3](id) ON DELETE CASCADE,
    PRIMARY KEY (table_1_id, table_3_id)
);
```

---

## 3.4 Indexes

<!--
Define all indexes needed for query performance.
Include indexes for foreign keys, search fields, and common query patterns.
-->

```sql
-- Foreign key indexes
CREATE INDEX idx_[table_2]_table_1_id ON [schema].[table_2](table_1_id);

-- Search and filter indexes
CREATE INDEX idx_[table_1]_status ON [schema].[table_1](status) WHERE is_active = true;
CREATE INDEX idx_[table_1]_name ON [schema].[table_1](name);
CREATE INDEX idx_[table_1]_created_at ON [schema].[table_1](created_at DESC);

-- Full-text search (if needed — use your database's full-text index type)
-- CREATE INDEX idx_[table_1]_search ON [schema].[table_1] ...;

-- Composite indexes for common queries
CREATE INDEX idx_[table_2]_[field_a]_[field_b] ON [schema].[table_2](table_1_id, [field]);
```

---

## 3.5 Seed Data

<!--
Define any initial data that must exist in the database.
This includes reference data, default configurations, templates, etc.
-->

```sql
-- [Category 1]: Reference data
INSERT INTO [schema].[table_1] (id, name, code, status, created_by, modified_by) VALUES
    ([uuid], '[Name 1]', '[code-1]', 'active', 'system', 'system'),
    ([uuid], '[Name 2]', '[code-2]', 'active', 'system', 'system');

-- [Category 2]: Default configuration
INSERT INTO [schema].[table_2] (id, table_1_id, value, [field], created_by, modified_by) VALUES
    -- [Description of what these seed values represent]
    ([uuid], '[table_1_id_reference]', [default_value], '[option]', 'system', 'system');
```

---

## 3.6 Data Model Interfaces

<!--
Define the data model interfaces/types that map to the database tables.
Use your project's language and naming conventions.
The pseudocode below illustrates the structure — adapt to your stack.
-->

```
// [Entity1] — maps to [schema].[table_1]

[Entity1]:
  id:          UUID / string
  name:        string
  code:        string
  description: string (optional)
  status:      [Entity1]Status
  isActive:    boolean
  createdAt:   datetime
  createdBy:   string
  modifiedAt:  datetime
  modifiedBy:  string

[Entity1]Status: draft | active | archived

// [Entity2] — maps to [schema].[table_2]

[Entity2]:
  id:          UUID / string
  [entity1]Id: UUID / string
  value:       decimal
  [field]:     [FieldType]
  createdAt:   datetime
  createdBy:   string
  modifiedAt:  datetime
  modifiedBy:  string
```

### Request/Response Models

```
// Create request (what the API receives)
Create[Entity1]Request:
  name:        string  (required)
  code:        string  (required)
  description: string  (optional)

// Update request
Update[Entity1]Request:
  name:        string  (optional)
  description: string  (optional)
  status:      [Entity1]Status  (optional)

// List response with pagination
[Entity1]ListResponse:
  data:     [Entity1][]
  total:    number
  page:     number
  pageSize: number
```

---

## Next Document

Continue to [PRD-04-API-ENDPOINTS.md](./PRD-04-API-ENDPOINTS.md) for REST API endpoint specifications.
