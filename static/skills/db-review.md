---
name: db-review
description: Review database queries and schema for SQL injection, N+1 problems, missing indexes, and migration safety. Use when auditing database code.
---

Review the database query and schema code in $ARGUMENTS.

If no path is given, find all files containing database queries, ORM calls, migrations, or schema definitions.

Check for:

**Query safety**
- Raw SQL built with string concatenation or interpolation (SQL injection risk)
- Missing parameterized queries or prepared statements
- ORM raw query escape hatches used without sanitization

**Performance**
- Queries executed inside loops (N+1 pattern)
- Missing indexes on columns used in WHERE, JOIN, or ORDER BY clauses
- SELECT * where only specific columns are needed
- Large result sets fetched without pagination or limits

**Schema design**
- Missing NOT NULL constraints on columns that should never be null
- Missing foreign key constraints where referential integrity is expected
- VARCHAR columns without length limits where they could cause silent truncation
- Storing denormalized data that will drift out of sync

**Migration safety**
- Migrations that lock tables in production (e.g. adding a NOT NULL column without a default on a large table)
- Irreversible migrations with no rollback plan
- Migrations that delete or rename columns without a deprecation step

**Transactions**
- Operations that must be atomic but are not wrapped in a transaction
- Long-running transactions that hold locks unnecessarily

For each issue: file, line, query or table name, description, and recommended fix. Severity: Critical / High / Medium / Low. End with a summary paragraph.
