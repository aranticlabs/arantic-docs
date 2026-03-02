Analyze the test coverage and quality for $ARGUMENTS.

If no path is given, analyze the whole project.

Steps:
1. Find all source files and their corresponding test files.
2. For each source file, identify functions, methods, and branches that have no corresponding test.
3. Look at existing tests and assess their quality.

Report:

**Untested files**
Source files with no test file at all.

**Untested functions and methods**
Functions in tested files that have no test exercising them.

**Missing edge cases**
Tests that exist but only cover the happy path, missing: null or undefined inputs, empty collections, boundary values, error conditions.

**Test quality issues**
Tests that pass for the wrong reason: no assertions, assertions on the wrong value, or mocking so much of the system that nothing real is being tested.

**Recommended tests (top 5 by risk)**
For the most critical gaps, describe the test case that should be added: what function to call, what input to use, and what to assert.

Be specific about file paths and function names. End with a summary count: files with no tests, functions with no tests, and an overall coverage risk rating of High, Medium, or Low.
