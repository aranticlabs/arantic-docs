---
sidebar_position: 1
sidebar_label: Code Generation
description: Learn how to use AI effectively for code generation, including what tasks it handles well, how to prompt for quality output, and what to verify.
keywords: [code generation, AI code generation, boilerplate, Claude Code, GitHub Copilot, code templates, API routes, type definitions]
---

# Code Generation

AI is most effective for code generation when the task is well-defined and bounded. Use it to eliminate repetitive work, not to figure out what you're building.

## What AI generates well

- Boilerplate (API routes, CRUD handlers, form schemas)
- Data transformations and mapping functions
- Regex patterns and parser logic
- Type definitions from JSON or database schemas
- Configuration files (Dockerfile, CI pipelines, linting rules)
- Repetitive UI components with variations

## What to avoid generating blindly

- Authentication and authorisation logic (verify every line)
- Cryptography (never use AI-generated crypto without expert review)
- SQL queries on untrusted input (always check for injection)
- Business logic you don't fully understand yet

## Generating from a schema

Give the model a source of truth and ask it to derive code from it:

```
Here is my Zod schema:

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
  createdAt: z.date(),
});

Generate:
1. The TypeScript type (inferred from the schema)
2. A mock factory function for tests
3. An Express POST /users route that validates the body and returns 201
```

## Generating from examples

If you have existing code you want replicated in a different shape:

```
Here's how I handle a GET endpoint in this codebase:

[paste example]

Now generate a DELETE /users/:id endpoint that follows the same pattern.
```

## Iterating on generated code

Generated code rarely fits perfectly on the first pass. Use follow-up messages to refine:

1. **Fix types:** "The return type should be `Promise<User | null>`, not `Promise<User>`"
2. **Adjust style:** "Use named exports, not default exports"
3. **Add error handling:** "Handle the case where the database returns null"
4. **Optimise:** "This runs N+1 queries - rewrite it using a JOIN"

## Reviewing generated code

Before using any generated code, check:

- Does it compile without errors?
- Does it handle `null`, `undefined`, and empty inputs?
- Are there any hardcoded values that should be configurable?
- Does it import everything it uses?
- Does it introduce any security risks?

If the generated code has issues, see [Debugging with AI](/code/debugging). For cleaning up structure and style, see [Refactoring with AI](/code/refactoring). Once the code works, add tests with [Writing Unit Tests with AI](/testing/unit-tests).
