---
sidebar_position: 2
---

# Prompt Templates

Copy-paste prompt templates for common AI-assisted development tasks. Each template is designed to give AI tools enough context to produce useful output on the first try. Adapt them to your language, framework, and codebase.

:::tip How to use these
Copy a template, replace the placeholders in `[brackets]`, and paste it into Claude Code, Copilot Chat, Cursor, or any AI coding tool. For best results, see [Prompting Basics](/prompting/basics) and [Advanced Prompting](/prompting/advanced).
:::

## Code generation

### Generate a function from a specification

```text
Write a [language] function called [name] that:
- Takes: [describe inputs with types]
- Returns: [describe output with type]
- Handles these edge cases: [list edge cases]
- Follows this pattern from the codebase: [reference existing similar function]

Do not use any external libraries. Include JSDoc/docstring comments.
```

### Generate a REST API endpoint

```text
Create a [framework] API endpoint:
- Method: [GET/POST/PUT/DELETE]
- Path: [/api/resource]
- Request body: [describe schema or paste example JSON]
- Response: [describe expected response shape]
- Validation: [list validation rules]
- Error handling: return appropriate HTTP status codes with error messages

Follow the existing patterns in [reference file or directory].
```

### Generate a React component

```text
Create a React component called [ComponentName] that:
- Props: [list props with types]
- Renders: [describe UI]
- State: [describe any local state]
- Behavior: [describe interactions/events]

Use [TypeScript/JavaScript]. Use [CSS modules/Tailwind/styled-components] for styling.
Match the patterns in [reference component file].
```

### Generate a database migration

```text
Write a [ORM/migration tool] migration that:
- Creates/modifies table: [table name]
- Columns: [list columns with types and constraints]
- Indexes: [list indexes]
- Foreign keys: [list relationships]
- Include the rollback/down migration

Follow the naming convention in the existing migrations directory.
```

## Debugging

### Diagnose an error

```text
I'm getting this error:

[paste the full error message and stack trace]

Relevant code:

[paste the code around the error]

What I've already tried:
- [list what you've tried]

What's causing this error and how do I fix it?
```

### Debug unexpected behavior

```text
Expected behavior: [describe what should happen]
Actual behavior: [describe what actually happens]

Steps to reproduce:
1. [step 1]
2. [step 2]

Relevant code:
[paste the relevant code]

What are the most likely causes? Walk through the logic step by step.
```

### Diagnose a performance issue

```text
This [function/query/component] is slow:

[paste the code]

Context:
- Input size: [describe typical data volume]
- Current execution time: [if known]
- Acceptable target: [desired performance]

Identify the bottlenecks and suggest specific optimizations. Explain the tradeoffs of each suggestion.
```

## Testing

### Generate unit tests

```text
Write unit tests for this [language] function:

[paste the function]

Cover:
- Happy path with typical inputs
- Edge cases: [list specific edge cases]
- Error cases: [list expected error conditions]

Use [test framework]. Follow the test patterns in [reference test file].
Each test should have a descriptive name that explains what it verifies.
```

### Generate integration tests

```text
Write integration tests for this API endpoint:

[paste the endpoint handler or describe it]

Test scenarios:
- Valid request returns expected response
- Missing required fields return 400
- Unauthorized request returns 401
- [list additional scenarios]

Use [test framework]. Mock [list what should be mocked] but use real [list what should be real].
```

### Find missing test coverage

```text
Here's my implementation:

[paste the code]

Here are the existing tests:

[paste existing tests]

What important test cases are missing? Focus on:
- Edge cases that could cause bugs in production
- Error handling paths
- Boundary conditions
- Concurrency/race conditions (if applicable)
```

## Refactoring

### Extract and simplify

```text
Refactor this code to be more readable and maintainable:

[paste the code]

Specific goals:
- [e.g., extract the validation logic into a separate function]
- [e.g., replace the nested conditionals with early returns]
- [e.g., reduce duplication between these two methods]

Keep the public API the same. Do not change behavior.
Show the before and after for each change.
```

### Modernize code patterns

```text
Update this code to use modern [language] patterns:

[paste the code]

Specifically:
- [e.g., replace callbacks with async/await]
- [e.g., use pattern matching instead of if-else chains]
- [e.g., replace class component with functional component + hooks]

Preserve all existing behavior. Highlight any places where the modernization changes semantics.
```

## Code review

### Review for bugs and issues

```text
Review this code for potential bugs, security issues, and problems:

[paste the code]

Focus on:
- Logic errors and off-by-one mistakes
- Null/undefined handling
- SQL injection, XSS, or other security issues
- Race conditions or concurrency problems
- Resource leaks (unclosed connections, file handles)

For each issue found, explain why it's a problem and show the fix.
```

### Review for production readiness

```text
Review this code for production readiness:

[paste the code]

Check for:
- Error handling (are failures handled gracefully?)
- Logging (is there enough to debug production issues?)
- Input validation (is user input sanitized?)
- Configuration (are there hardcoded values that should be configurable?)
- Scalability (will this work under load?)

Rate each area as good/needs work/missing and explain why.
```

## Documentation

### Generate API documentation

```text
Write API documentation for this endpoint:

[paste the endpoint code]

Include:
- Description of what the endpoint does
- Request method and URL
- Request parameters/body with types
- Response format with example JSON
- Error responses with status codes
- Usage example with curl

Format as Markdown.
```

### Explain complex code

```text
Explain this code to a developer who is new to the codebase:

[paste the code]

Cover:
- What it does at a high level (2-3 sentences)
- How it works step by step
- Why it's designed this way (architectural decisions)
- Gotchas or non-obvious behavior to watch out for
```

## Claude Code specific

### Plan mode for complex tasks

```text
/plan

I need to [describe the feature/change]. Before writing code:

1. Identify all files that need to change
2. Describe the changes needed in each file
3. Note any potential breaking changes or risks
4. Suggest the order of implementation
5. List what tests should be written or updated
```

### Multi-file refactoring with subagents

```text
I need to rename [old pattern] to [new pattern] across the codebase.

1. First, search for all occurrences (file names, imports, references, tests, docs)
2. Show me the full list before making changes
3. Make all changes in a single coordinated pass
4. Run the existing tests to verify nothing broke
```

### CLAUDE.md project context

```text
Create a CLAUDE.md file for this project. Analyze:

1. The tech stack (languages, frameworks, build tools)
2. How to build, test, and run the project
3. The directory structure and where key files live
4. Code conventions (naming, formatting, patterns)
5. Common gotchas or things a new developer should know

Keep it concise. Focus on facts, not aspirations.
```

## Tips for better results

- **Be specific about format**: "Return a JSON object" beats "give me the data"
- **Show examples**: one good input/output example is worth a paragraph of explanation
- **State constraints**: "Do not use external libraries" or "Must work with Node 18+"
- **Reference existing code**: "Follow the pattern in `src/services/auth.ts`" gives the AI a concrete model
- **Ask for explanations**: "Explain each change" forces the AI to reason through its output
- **Iterate**: if the first result isn't right, tell the AI specifically what to fix rather than re-prompting from scratch

For more on writing effective prompts, see [Prompting Basics](/prompting/basics) and [Advanced Prompting](/prompting/advanced).
