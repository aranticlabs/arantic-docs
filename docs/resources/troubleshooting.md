---
sidebar_position: 3
sidebar_label: Troubleshooting & Limitations
---

# Troubleshooting & Limitations

Common problems when working with AI coding tools, why they happen, and how to handle them. This page covers general AI limitations that apply across all tools, plus specific fixes for common issues.

## When AI gets it wrong

### Hallucinated APIs and methods

**Problem**: AI generates code that calls functions, methods, or API endpoints that don't exist. This is especially common with newer libraries, less popular frameworks, or recent API changes.

**Why it happens**: Language models generate plausible-looking code based on patterns. If an API "should" have a method called `.fetchAll()`, the model might generate it even if the actual method is `.getAll()` or doesn't exist.

**How to handle it**:
- Always check generated API calls against the official documentation
- For critical code, ask the AI: "Verify that these method names and signatures are correct for [library] version [X]"
- Pin your library versions in prompts: "Use axios 1.6, not fetch"
- When using Claude Code, provide relevant docs in your project context (CLAUDE.md or `/add-dir`)

### Outdated patterns and deprecated code

**Problem**: AI suggests patterns that were best practice two years ago but are now deprecated or replaced.

**Examples**:
- React class components instead of hooks
- `componentWillMount` instead of `useEffect`
- Old `request` library instead of `fetch` or `axios`
- Deprecated Node.js APIs (`url.parse` instead of `new URL()`)

**How to handle it**:
- Specify the version in your prompt: "Use React 19 with hooks" or "Use Next.js 15 App Router, not Pages Router"
- Include a `.cursorrules`, `CLAUDE.md`, or similar context file that states your stack versions
- If the AI generates old patterns, point it out: "This uses the old API. Rewrite using [current approach]"

### Confidently wrong explanations

**Problem**: AI explains code or concepts with complete confidence but the explanation is incorrect. This is harder to catch than wrong code because it sounds authoritative.

**How to handle it**:
- Be skeptical of explanations for edge cases, performance characteristics, and security claims
- Cross-reference with official documentation for anything critical
- Ask the AI to show its reasoning: "Walk through this step by step" often exposes flawed logic
- If something sounds surprising, verify it: "Are you sure that [X] behaves this way? Show me a reference."

### Incomplete context understanding

**Problem**: AI makes changes that are locally correct but break something elsewhere in the codebase. For example, renaming a function in one file without updating all call sites.

**How to handle it**:
- Use agentic tools (Claude Code, Codex) for multi-file changes, as they can search the full codebase
- For IDE tools (Copilot, Cursor), explicitly mention related files: "This function is also called in `router.ts` and `tests/auth.test.ts`"
- Always run your test suite after AI-generated changes
- Use TypeScript or other static analysis tools to catch broken references

## Common task-specific issues

### Code generation issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Generated code doesn't match project style | AI doesn't know your conventions | Add style guide to CLAUDE.md or project rules file |
| AI adds unnecessary dependencies | Trying to be helpful | Explicitly state "Do not add new dependencies" |
| Generated code is over-engineered | AI defaults to "enterprise" patterns | Ask for "the simplest implementation that works" |
| AI ignores your framework's conventions | Insufficient context | Reference a specific file: "Follow the pattern in `src/services/auth.ts`" |
| Code works but is inefficient | AI optimizes for readability by default | Specify performance requirements: "This runs in a hot loop, optimize for speed" |

### Testing issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Tests pass but don't test anything meaningful | AI writes tests that mirror implementation | Ask for "behavior-based tests that verify outcomes, not implementation details" |
| AI mocks everything | Default to isolation | Specify what should be real: "Use a real database connection, only mock the email service" |
| Generated tests are brittle | Testing implementation details | Ask for tests that "survive a refactoring of the internals" |
| Missing edge case coverage | AI follows the happy path | Explicitly list edge cases or ask: "What edge cases am I missing?" |

### Refactoring issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Refactoring changes behavior | AI doesn't fully understand side effects | Ask for "behavior-preserving refactoring" and run tests before and after |
| AI refactors too aggressively | Trying to be thorough | Scope it: "Only extract the validation logic, don't touch anything else" |
| Incomplete rename across codebase | Limited context window | Use Claude Code or an IDE's native rename feature for cross-file renames |

## Tool-specific troubleshooting

### Claude Code

See the dedicated [Claude Code Debugging](/claude-code/debugging) page for tool-specific issues like `/doctor` diagnostics, permission problems, and environment setup.

Common Claude Code issues:

| Problem | Fix |
|---------|-----|
| Claude doesn't know about your project | Create a `CLAUDE.md` with build commands, tech stack, and conventions |
| Context window fills up quickly | Use `/compact` to summarize conversation, or start fresh with `/clear` |
| Claude makes changes to wrong files | Be specific about file paths, or use `/add-dir` to narrow scope |
| Slow responses | Try `/fast` mode or reduce context with `/compact` |
| Permission denied errors | Check `/permissions` and adjust allowed tools |

### GitHub Copilot

| Problem | Fix |
|---------|-----|
| Completions are irrelevant | Open related files in tabs so Copilot has more context |
| Copilot suggests insecure code | Review all suggestions; enable Copilot's security filter in settings |
| Completions stop appearing | Check your subscription status and network connection |
| Copilot Chat gives generic answers | Include specific file references and code snippets in your question |

### Cursor

| Problem | Fix |
|---------|-----|
| Codebase indexing is slow | Wait for initial index to complete; check status in the bottom bar |
| Composer changes are wrong | Use `@file` references to point Cursor at the right files |
| Rules not being applied | Verify `.cursorrules` file is in the project root and properly formatted |

## General best practices for avoiding issues

1. **Treat AI output as a first draft**. Always review before committing. The faster you can review, the more productive AI tools make you.

2. **Run tests after every AI change**. If you don't have tests, add them before asking AI to modify complex logic.

3. **Commit frequently**. Make small, reviewable commits. If an AI change breaks something, you can easily revert to the last good state.

4. **Provide context upfront**. The more the AI knows about your project (stack, conventions, constraints), the better its output. Invest time in CLAUDE.md, `.cursorrules`, or equivalent files.

5. **Be specific about what you want**. Vague prompts produce vague results. "Fix the bug" is worse than "The `calculateTotal` function returns NaN when the items array is empty. Fix it to return 0."

6. **Verify security-sensitive code extra carefully**. AI tools can introduce SQL injection, XSS, insecure defaults, and other vulnerabilities. Review authentication, authorization, input validation, and data handling code with extra scrutiny.

7. **Don't fight the tool**. If an AI tool consistently struggles with a specific task, it might not be the right tool for that job. Use AI where it excels (boilerplate, tests, refactoring, exploration) and do the hard design thinking yourself.
