---
sidebar_position: 1
sidebar_label: Writing Unit Tests with AI
description: Generate comprehensive unit tests with AI by providing implementations and letting it enumerate edge cases, then verify the tests catch real bugs.
keywords: [unit tests with AI, test generation, AI testing, edge cases, Vitest, Jest, test coverage, TDD, automated testing]
---

# Writing Unit Tests with AI

AI is exceptionally good at generating tests. It can enumerate edge cases faster than most developers and write the boilerplate quickly. Your job is to verify the tests actually catch real bugs.

## Generate tests from an implementation

Paste the function and ask for tests:

```
Write unit tests for this function using Vitest.
Cover: the happy path, empty input, null/undefined input,
boundary values, and any edge cases you can identify.

[paste function]
```

## Generate tests from a specification

If you're doing TDD, describe the expected behaviour before writing code:

```
Write tests for a function called `calculateDiscount(price, coupon)` that:
- Returns the price with 10% off if coupon is "SAVE10"
- Returns the price with 20% off if coupon is "SAVE20"
- Returns the original price if coupon is null or unrecognised
- Throws if price is negative

Use Vitest. Don't implement the function, just the tests.
```

## Identify missing test cases

Paste your existing tests and ask what's missing:

```
Here are my current tests for the auth middleware:

[paste tests]

What cases am I not covering? List them without writing code yet.
```

Then ask it to write the missing ones after you've reviewed the list.

## Generate mock data and fixtures

```
Generate 5 realistic mock User objects for testing. They should cover:
- A regular user
- An admin user
- A user with a very long name (boundary test)
- A user with special characters in their email
- A deactivated user (isActive: false)

Use this TypeScript type: [paste type]
```

## Snapshot and integration tests

AI can also help with more complex test types:

```
Write an integration test for the POST /api/users endpoint using
supertest and Vitest. It should:
1. Create a user with valid data → expect 201 with the created user
2. Submit invalid data → expect 422 with a validation error
3. Submit a duplicate email → expect 409 with a conflict error

The Express app is exported from src/app.ts.
```

## Reviewing generated tests

Before committing AI-generated tests, verify:

- Each test actually fails when the implementation is wrong
- Mocks reflect real behaviour (not just return `undefined` everywhere)
- Test descriptions are accurate and readable
- There are no tests that always pass regardless of implementation

To fill remaining gaps in your test suite, see [Improving Test Coverage with AI](/testing/coverage). For generating the code that needs testing, see [Code Generation](/code/generation).
