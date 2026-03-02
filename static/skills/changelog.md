Write a new CHANGELOG entry based on recent git history.

Steps:
1. Find the latest tag: `git describe --tags --abbrev=0`
2. List commits since that tag: `git log <tag>..HEAD --oneline --no-merges`
3. If there are no tags, use the last 20 commits: `git log -20 --oneline --no-merges`
4. Read any existing CHANGELOG.md to match its established format and style.

Categorize commits under these standard headings (omit any section with no entries):
- **Added**: new features
- **Changed**: changes to existing functionality
- **Deprecated**: features that will be removed in a future release
- **Removed**: features that were removed
- **Fixed**: bug fixes
- **Security**: security fixes

Rules:
- Write in plain English, not git commit syntax. "Fix crash when user list is empty" not "fix(users): NPE on empty list".
- Each entry starts with a capital letter, no period at the end.
- Skip merge commits, version bump commits, and CI or tooling-only commits.
- Use today's date and "Unreleased" as the version header unless told otherwise.

Output only the new CHANGELOG section, formatted as Markdown, ready to paste at the top of CHANGELOG.md.
