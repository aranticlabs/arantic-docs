# PRD-03: Database Schema

[Back to Index](./PRD-00-INDEX.md) | [Previous: Business Logic](./PRD-02-BUSINESS-LOGIC.md) | [Next: API Endpoints](./PRD-04-API-ENDPOINTS.md)

## 3.1 Schema Context

<!--
Describe which database schema this feature uses and how it relates to other schemas.
In a multi-app system, clarify schema ownership.
-->

This module is part of the **[Platform Name]** platform. Each app owns its own PostgreSQL schema:

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
| status           |       | value            |       | quantity          |
| created_at       |       | created_at       |       | created_at       |
+------------------+       +------------------+       +------------------+
```

---

## 3.3 Table Definitions

<!--
Define each table with full SQL CREATE statements.
Include all columns, data types, constraints, defaults, and foreign keys.
Follow the existing project conventions for audit fields and naming.
-->

### 3.3.1 [schema].[table_1]

[Brief description of what this table stores]

```sql
CREATE TABLE [schema].[table_1] (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'active', 'archived')),
    is_active       BOOLEAN NOT NULL DEFAULT true,

    -- Audit fields
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255) NOT NULL,
    modified_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified_by     VARCHAR(255) NOT NULL
);

-- Modified at trigger
CREATE TRIGGER update_[table_1]_modified_at
    BEFORE UPDATE ON [schema].[table_1]
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at();

COMMENT ON TABLE [schema].[table_1] IS '[Description of the table purpose]';
```

### 3.3.2 [schema].[table_2]

[Brief description of what this table stores]

```sql
CREATE TABLE [schema].[table_2] (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_1_id      UUID NOT NULL REFERENCES [schema].[table_1](id),
    value           NUMERIC(12,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'EUR'
                    CHECK (currency IN ('EUR', 'USD', 'PLN', 'CNY')),
    -- OR for multi-currency JSONB:
    -- prices       JSONB NOT NULL DEFAULT '{"EUR": 0, "USD": 0, "PLN": 0, "CNY": 0}',

    -- Audit fields
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255) NOT NULL,
    modified_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified_by     VARCHAR(255) NOT NULL
);

CREATE TRIGGER update_[table_2]_modified_at
    BEFORE UPDATE ON [schema].[table_2]
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at();
```

### 3.3.3 [schema].[junction_table] (if needed)

[Brief description - junction/linking tables for many-to-many relationships]

```sql
CREATE TABLE [schema].[junction_table] (
    table_1_id      UUID NOT NULL REFERENCES [schema].[table_1](id) ON DELETE CASCADE,
    table_3_id      UUID NOT NULL REFERENCES [schema].[table_3](id) ON DELETE CASCADE,
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

-- Full-text search (if needed)
-- CREATE INDEX idx_[table_1]_search ON [schema].[table_1] USING GIN(search_vector);

-- Composite indexes for common queries
CREATE INDEX idx_[table_2]_table_1_currency ON [schema].[table_2](table_1_id, currency);
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
    (gen_random_uuid(), '[Name 1]', '[code-1]', 'active', 'system', 'system'),
    (gen_random_uuid(), '[Name 2]', '[code-2]', 'active', 'system', 'system');

-- [Category 2]: Default configuration
INSERT INTO [schema].[table_2] (id, table_1_id, value, currency, created_by, modified_by) VALUES
    -- [Description of what these seed values represent]
    (gen_random_uuid(), '[table_1_id_reference]', 100.00, 'EUR', 'system', 'system');
```

---

## 3.6 TypeScript Interfaces

<!--
Define the TypeScript interfaces that map to the database tables.
These should be placed in the shared types directory.
Use your project's naming convention for TypeScript properties (e.g., camelCase) and handle
any mapping to the database naming convention (e.g., snake_case) in your data access layer.
-->

```typescript
// shared/types/[feature]/[Feature].ts

export interface [Entity1] {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: '[Entity1]Status';
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
}

export type [Entity1]Status = 'draft' | 'active' | 'archived';

export interface [Entity2] {
  id: string;
  [entity1]Id: string;
  value: number;
  currency: Currency;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
}

// If using multi-currency JSONB pattern:
export interface MultiCurrencyPrices {
  EUR: number;
  USD: number;
  PLN: number;
  CNY: number;
}

export type Currency = 'EUR' | 'USD' | 'PLN' | 'CNY';
```

### Request/Response DTOs

```typescript
// Create DTO (what the API receives)
export interface Create[Entity1]Request {
  name: string;
  code: string;
  description?: string;
}

// Update DTO
export interface Update[Entity1]Request {
  name?: string;
  description?: string;
  status?: [Entity1]Status;
}

// List response with pagination
export interface [Entity1]ListResponse {
  data: [Entity1][];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## Next Document

Continue to [PRD-04-API-ENDPOINTS.md](./PRD-04-API-ENDPOINTS.md) for REST API endpoint specifications.
