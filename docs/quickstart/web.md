---
sidebar_position: 2
---

# Web Developer Setup

Covers React, TypeScript, JavaScript, and Angular workflows. The setup is the same across frameworks — the differences are in how you configure context and which subagents are most useful.

## 1. Install an in-editor tool

Pick one and install it. You can run both, but one is usually enough.

### Option A — Cursor (recommended if you want the deepest AI integration)

Download from [cursor.com](https://cursor.com). Cursor is a VS Code fork, so your extensions, keybindings, and settings carry over. It replaces VS Code rather than extending it.

After installing, sign in and choose a model. Claude Sonnet is the best default for web development tasks.

See the full [Cursor guide](../tools/cursor) for configuration details.

### Option B — GitHub Copilot in VS Code

Install the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) from the VS Code marketplace. Sign in with your GitHub account.

Also install **GitHub Copilot Chat** for the chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`).

See the full [GitHub Copilot guide](../tools/github-copilot) for tips.

---

## 2. Install Claude Code

Claude Code handles the tasks that go beyond inline completion: refactoring across files, reviewing a PR, generating a feature end-to-end.

**Requires Node.js 18+.** Check with `node --version`. If you need Node, install it via [nvm](https://github.com/nvm-sh/nvm) (recommended) or [nodejs.org](https://nodejs.org).

```bash
npm install -g @anthropic-ai/claude-code
```

Then run it from your project root:

```bash
cd your-project
claude
```

See the full [Claude Code guide](../tools/claude-code) for all capabilities.

---

## 3. Configure project context (CLAUDE.md)

Claude Code reads a `CLAUDE.md` file at your project root for project-specific context. This is the single most effective thing you can do to improve output quality. Create it once and update it as your project evolves.

```bash
touch CLAUDE.md
```

**Minimal starting template for a React/TypeScript project:**

```markdown
# Project context

## Stack
- React 18, TypeScript 5, Vite
- Tailwind CSS v4
- React Query for server state, Zustand for client state
- React Router v6

## Conventions
- Components: functional only, no class components
- File naming: PascalCase for components, camelCase for hooks and utilities
- Hooks live in `src/hooks/`, components in `src/components/`
- All new components must have a co-located `*.test.tsx` file

## Commands
- `npm run dev` — start dev server
- `npm run test` — run Vitest
- `npm run build` — production build
- `npm run lint` — ESLint

## Do not modify
- `src/generated/` — auto-generated from OpenAPI spec, never edit by hand
```

**For Angular projects**, adapt the stack section:

```markdown
## Stack
- Angular 18, TypeScript 5, RxJS 7
- Angular Material for UI components
- NgRx for state management

## Conventions
- Follow Angular style guide naming: `feature.component.ts`, `feature.service.ts`
- Use standalone components (not NgModules) for all new code
- Observables: always unsubscribe with `takeUntilDestroyed()` or `async` pipe

## Commands
- `ng serve` — start dev server
- `ng test` — run Karma/Jasmine unit tests
- `ng build` — production build
- `ng lint` — ESLint
```

---

## 4. Add useful custom subagents

Subagents are specialists Claude Code can delegate to automatically. Drop these files into `.claude/agents/` in your project root, or into `~/.claude/agents/` to make them available in every project.

The following subagents are particularly useful for web development — download them from the [subagents catalog](../tools/subagents#web--backend):

| Subagent | What it does |
|----------|-------------|
| [ux-reviewer](../tools/subagents#ux-reviewer) | Audits JSX/TSX for visual hierarchy, spacing, states, and copy quality |
| [accessibility-auditor](../tools/subagents#accessibility-auditor) | Checks HTML/JSX/TSX against WCAG 2.1 |
| [security-auditor](../tools/subagents#security-auditor) | Scans for XSS, CSRF, auth issues, and other web vulnerabilities |
| [api-contract-reviewer](../tools/subagents#api-contract-reviewer) | Reviews REST/GraphQL endpoints for consistency and missing validation |

```bash
mkdir -p .claude/agents
# Download from the subagents page and save here, e.g.:
# .claude/agents/ux-reviewer.md
# .claude/agents/accessibility-auditor.md
```

---

## 5. Daily workflow

### Inline completions (Cursor / Copilot)

Just type — completions appear automatically. Accept with `Tab`. For longer generations, open the chat panel and describe what you want in context of the open file.

Useful chat prompts while in a component file:
```
Add a loading skeleton for this component that matches the existing layout.
```
```
Extract the form validation logic into a custom hook called useContactForm.
```

### Claude Code for multi-file tasks

Open a terminal in your project root and run `claude`. Describe the task in plain English:

```
Add a dark mode toggle to the app. Store the preference in localStorage.
Use the existing ThemeContext pattern I have in src/context/ThemeContext.tsx.
```

```
Refactor all fetch calls in src/services/ to use React Query.
Don't change the component interfaces — only the data-fetching layer.
```

```
Write unit tests for every exported function in src/utils/formatters.ts.
Use the existing Vitest setup. Aim for full branch coverage.
```

### Code review before committing

```
Review my staged changes for bugs, accessibility issues, and anything
that violates our conventions in CLAUDE.md.
```

Or use the [ux-reviewer](../tools/subagents#ux-reviewer) and [accessibility-auditor](../tools/subagents#accessibility-auditor) subagents:

```
Run the ux-reviewer and accessibility-auditor agents on src/components/CheckoutForm/.
```

---

## Tips

- **Paste error messages directly.** "Fix this TypeScript error: [paste]" works better than a vague description.
- **Reference files by name.** Claude Code has full access to your repo — "look at src/hooks/useCart.ts" is unambiguous.
- **Lock down generated code.** Add generated directories (`src/generated/`, `dist/`) to `CLAUDE.md` under "Do not modify" so Claude Code never touches them.
- **Use Haiku for search/grep tasks.** Ask Claude Code to "use the Explore agent to find all places where we call useEffect without a dependency array" — it's faster and cheaper.
- **Angular: always specify `standalone: true`** in your prompts or CLAUDE.md if you're on Angular 15+. The default in older codebases is module-based and Claude will default to that if unspecified.
