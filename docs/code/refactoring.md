---
sidebar_position: 3
sidebar_label: Refactoring with AI
description: Direct AI to perform targeted refactoring tasks by being explicit about goals, such as removing nested conditionals or extracting reusable functions.
keywords: [refactoring with AI, code refactoring, code smells, AI refactoring, clean code, early returns, extract function, structural improvements]
---

# Refactoring with AI

AI can identify code smells, suggest structural improvements, and do the mechanical work of refactoring, but you need to direct it clearly. Vague requests like "make this better" produce vague results.

## Be explicit about the goal

```
Refactor this function to:
- Remove the nested if-else chain (use early returns instead)
- Extract the validation logic into a separate function
- Keep the public interface identical - same parameters, same return type
```

## Common refactoring tasks

### Extract and rename

```
Extract the date formatting logic from this component into a standalone
utility function called formatRelativeDate. Keep the component identical
in behaviour.
```

### Simplify complex logic

```
This function has 6 nested conditions. Simplify it using a lookup table
or switch statement. The output must be identical for all inputs.
```

### Convert to a different pattern

```
Convert this class-based React component to a functional component
with hooks. Do not change any props or observable behaviour.
```

### Remove duplication

```
These three functions are nearly identical. Extract the shared logic
into a generic helper and rewrite them to use it.

[paste the three functions]
```

### Improve type safety

```
This file uses `any` in 4 places. Replace each one with the correct
type. If a type doesn't exist yet, define it.
```

## Reviewing refactored code

Refactoring should preserve behaviour. After applying AI-suggested changes:

1. Run your existing tests (see [Writing Unit Tests with AI](/testing/unit-tests) if you need to add them first). They should all still pass.
2. Check that the public API (exported functions, props, return types) is unchanged
3. Look for subtle differences in error handling or edge cases
4. Review imports: AI sometimes introduces unused ones or misses new ones

## Large-scale refactoring

For refactoring across many files, work incrementally. Give the model one file or one module at a time, and verify each step before moving to the next. Asking it to refactor an entire codebase at once leads to inconsistent results.

For related workflows, see [Code Generation](/code/generation) and [Debugging with AI](/code/debugging). To ensure refactored code maintains coverage, see [Improving Test Coverage with AI](/testing/coverage).
