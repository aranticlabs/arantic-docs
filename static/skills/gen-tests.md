---
name: gen-tests
description: Generate a complete test file matching the project's existing test framework and style. Use when you need to write tests for a file or function.
---

Write comprehensive tests for $ARGUMENTS.

Steps:
1. Read the file or function specified.
2. Identify the test framework already in use (check existing test files, package.json, pytest.ini, etc.) and match that style exactly.
3. Write tests that cover:
   - The happy path (normal, expected input and output)
   - Edge cases: empty input, null/undefined/nil, boundary values (zero, max, empty string)
   - Error conditions: invalid input, missing required fields, network or IO failures
   - Each branch of significant conditional logic

Rules:
- Match the existing test file naming convention and directory structure
- Use the same assertion style and test helpers as existing tests
- Do not mock more than necessary; only mock external I/O, databases, and network calls
- Each test should have a single clear assertion focus
- Test names should describe the expected behavior, not the implementation detail

Output the complete test file, ready to save. If adding to an existing test file, output only the new test cases with a comment indicating where to insert them.
