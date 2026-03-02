---
sidebar_position: 2
---

# Improving Test Coverage with AI

AI can help you move from low coverage to meaningful coverage quickly. The goal isn't to hit a percentage - it's to cover the scenarios that matter.

## Find uncovered paths

Run your coverage tool and paste the report or the uncovered code:

```
Here is my coverage report. These lines are uncovered:

src/utils/permissions.ts: lines 34-41, 67-72

Here's the file: [paste]

Write tests that cover the uncovered branches.
```

## Identify high-risk untested code

Rather than chasing 100% coverage mechanically, ask the model to prioritise:

```
Here are the files with the lowest test coverage in our codebase:

[list files]

Which of these are highest risk if they contain bugs? Rank them and explain why.
```

## Generate property-based tests

For pure functions, property-based testing finds edge cases no one thought of:

```
Write property-based tests for this sorting function using fast-check.
Define properties that should hold for any valid input array.

[paste function]
```

## Fill coverage gaps systematically

Work file by file. For each uncovered area:

1. Ask the model to explain what the code does
2. Ask it to list all possible paths through the code
3. Ask it to write a test for each path

```
Explain what each branch of this switch statement does,
then write one test per branch.

[paste code]
```

## Coverage anti-patterns to avoid

When using AI for coverage, watch out for:

- **Tests that only assert the call happened** - not that the result is correct
- **Mocking everything** - tests that mock so much they don't test real behaviour
- **Duplicate tests** - AI sometimes generates near-identical tests for the same path
- **Tests with no assertions** - always verify there's at least one `expect()` per test
