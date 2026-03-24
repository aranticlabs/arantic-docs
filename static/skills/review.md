---
name: review
description: Review staged git changes for bugs, security issues, performance regressions, and style problems. Use when you want a pre-commit code review.
---

Look at the staged git changes: run `git diff --staged`. If nothing is staged, check the last commit instead: `git diff HEAD~1 HEAD`.

Review the changes for:
- Logic bugs and off-by-one errors
- Security vulnerabilities: injection, missing input validation, hardcoded secrets, XSS
- Missing error handling or unhandled edge cases
- Performance regressions: N+1 queries, unnecessary allocations, blocking calls
- Style inconsistencies with the surrounding code

Report grouped by severity:
- **Critical**: exploitable issue or data-loss bug; must fix before merging
- **High**: likely bug or serious concern; strongly recommended to fix
- **Medium**: code smell or maintainability concern
- **Low**: style nit; fix if convenient

For each finding: file, line(s), one-sentence description, suggested fix.
End with a short overall summary paragraph.
