---
name: env-check
description: Audit environment variables for missing .env.example entries, committed secrets, and unvalidated config. Use when checking configuration hygiene.
---

Audit the project's environment variable and configuration setup.

Check:
- `.env`, `.env.example`, `.env.local`, and any other environment files present
- All places in code where `process.env`, `os.environ`, `getenv`, or equivalent is accessed
- Configuration files, deployment scripts, and Docker/CI files

Report on:

**Missing .env.example entries**
Variables used in code but not documented in `.env.example` (or equivalent). A developer cloning the repo would not know these are required.

**Secrets at risk**
Any actual secret values in committed files: `.env` committed to git, tokens in CI config, credentials in config files.

**Missing validation**
Environment variables read without a fallback or existence check. If absent at runtime, the app will fail silently or with a cryptic error. Flag these and suggest a startup validation pattern.

**Inconsistent naming**
Variable names that do not follow a consistent convention (e.g. a mix of `APP_DB_HOST` and `database_host`).

**Unused variables**
Variables defined in `.env` files that are never referenced in code.

For each issue: file, variable name, description, and recommended fix. End with a summary of overall configuration hygiene.
