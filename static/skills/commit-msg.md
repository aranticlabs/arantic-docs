Look at the staged git changes: run `git diff --staged` and `git status`.

Write a commit message for these changes following the Conventional Commits spec:
- First line: `<type>(<optional-scope>): <short description>` — under 72 characters, imperative mood, no period at the end
- Valid types: feat, fix, refactor, test, docs, chore, perf, style, ci, build
- Leave one blank line, then write a body paragraph if the change is non-trivial (explain what and why, not how)
- If there are breaking changes, add a `BREAKING CHANGE:` footer line

Output only the commit message — no explanation, no code fences.
