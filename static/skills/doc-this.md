---
name: doc-this
description: Generate missing inline documentation (JSDoc, docstrings, doc comments) matching the file's existing style. Use when code lacks documentation.
---

Write inline documentation for $ARGUMENTS.

Steps:
1. Read the file.
2. Identify the documentation style already in use (JSDoc, Python docstrings, Go doc comments, Rust doc comments, etc.) and match it exactly.
3. For each exported or public function, method, class, and type that lacks documentation, write:
   - A one-line summary of what it does
   - A description of each parameter (name, type if not already in the signature, what it represents)
   - A description of the return value
   - Any exceptions or errors that can be thrown or returned
   - A short usage example if the function is non-trivial

Rules:
- Do not document trivial getters, setters, or constructors that are self-explanatory from their names
- Do not restate the function signature; describe behavior and intent
- For complex functions, explain why (the design decision), not just what
- If the file already has partial documentation, only add what is missing — do not rewrite existing docs

Output the file with documentation added inline. Show only the added or changed sections unless the file is under 100 lines, in which case output the whole file.
