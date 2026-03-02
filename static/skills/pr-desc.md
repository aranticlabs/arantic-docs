Look at the diff between the current branch and the base branch.

Run: `git log main..HEAD --oneline --no-merges` (if that fails, try `git log origin/main..HEAD --oneline --no-merges`)
Run: `git diff main..HEAD --stat`

Read the most relevant changed files if needed to understand intent.

Write a pull request description formatted as Markdown, ready to paste into GitHub or GitLab:

---
**Title:** (one line, under 72 characters, imperative mood — e.g. "Add dark mode toggle to user settings")

**Summary**
2-4 bullet points: what changed and why. Focus on "what" and "why", not "how".

**Changes**
Brief file-by-file or area-by-area breakdown for reviewers who want more detail.

**Test plan**
Bulleted checklist of how a reviewer can verify the changes work correctly.

**Notes** (omit if nothing notable)
Breaking changes, migration steps, known limitations, or follow-up tasks.

---

No filler phrases ("This PR introduces...", "I have implemented..."). Be direct and specific.
