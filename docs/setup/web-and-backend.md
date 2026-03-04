---
sidebar_position: 2
---

# Web & Backend Developer Setup

Covers React, TypeScript, JavaScript, Angular (frontend) and Go REST/gRPC services, CLI tools (backend). Both stacks use the same IDE and Claude Code setup. Only the project context templates, subagents, and example prompts differ.

## 1. Install an in-editor tool

These are the most common options, but not the only ones. JetBrains IDEs, Windsurf, and other editors also support AI integrations. Pick one to start with; you can always switch later.

### Option A: Cursor (recommended for the deepest AI integration)

Download from [cursor.com](https://cursor.com). Cursor is a VS Code fork, so your extensions, keybindings, and settings carry over. It replaces VS Code rather than extending it.

After installing, sign in and choose a model. Claude Sonnet is the best default for both frontend and backend work.

See the full [Cursor guide](../tools/cursor) for configuration details.

### Option B: VS Code with the Claude extension

If you want AI assistance in your editor without Cursor or GitHub Copilot, install the [Claude extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) from the VS Code marketplace and sign in with your Anthropic account. This gives you an integrated chat panel and inline suggestions powered by Claude, using your own API key or a Max subscription.

### Option C: GitHub Copilot in VS Code

Install the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) from the VS Code marketplace and sign in with your GitHub account. Also install **GitHub Copilot Chat** for the chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`).

See the full [GitHub Copilot guide](../tools/github-copilot) for tips.

---

## 2. Install Claude Code

Claude Code handles multi-file tasks that go beyond inline completion: refactoring across files, reviewing a PR, generating a feature end-to-end.

**Requires Node.js 18+.** Check with `node --version`. If you need Node, install it via [nvm](https://github.com/nvm-sh/nvm) (recommended) or [nodejs.org](https://nodejs.org).

```bash
npm install -g @anthropic-ai/claude-code
```

Run it from your project root (for Go: the directory with `go.mod`):

```bash
cd your-project
claude
```

See the full [Claude Code guide](../tools/claude-code) for all capabilities.

---

## 3. Configure project context (CLAUDE.md)

Claude Code reads a `CLAUDE.md` file at your project root on every session start. This is the single most effective thing you can do to improve output quality: it tells Claude your stack, conventions, commands, and what not to touch.

```bash
touch CLAUDE.md
```

### Frontend: React / TypeScript

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
- Hooks live in src/hooks/, components in src/components/
- All new components must have a co-located *.test.tsx file

## Commands
- npm run dev - start dev server
- npm run test - run Vitest
- npm run build - production build
- npm run lint - ESLint

## Do not modify
- src/generated/ - auto-generated from OpenAPI spec, never edit by hand
```

### Frontend: Angular

```markdown
# Project context

## Stack
- Angular 18, TypeScript 5, RxJS 7
- Angular Material for UI components
- NgRx for state management

## Conventions
- Follow Angular style guide naming: feature.component.ts, feature.service.ts
- Use standalone components (not NgModules) for all new code
- Observables: always unsubscribe with takeUntilDestroyed() or async pipe

## Commands
- ng serve - start dev server
- ng test - run Karma/Jasmine unit tests
- ng build - production build
- ng lint - ESLint
```

### Backend: Go service

```markdown
# Project context

## Stack
- Go 1.23
- net/http standard library (no framework)
- PostgreSQL via pgx/v5 (no ORM)
- Protocol Buffers + gRPC for internal service calls
- Docker for local development

## Conventions
- Error handling: always wrap errors with fmt.Errorf("context: %w", err)
- Never use panic() in application code - return errors
- Table-driven tests only; test files live alongside the code they test
- Exported functions must have godoc comments
- Context is always the first parameter; never store context in a struct

## Commands
- go build ./... - build
- go test ./... - run all tests
- go vet ./... - static analysis
- make lint - golangci-lint (config in .golangci.yaml)
- docker compose up -d - start local Postgres + dependencies

## Do not modify
- internal/gen/ - generated from proto files via make proto
- vendor/ - managed by go mod vendor
```

### Backend: Go CLI (cobra)

```markdown
## Stack
- Go 1.23, cobra v1, viper for config
- Released as a single static binary

## Conventions
- Commands live in cmd/, business logic in internal/
- All flags have both short and long forms
- cobra commands use RunE (not Run) so errors propagate correctly
```

---

## 4. Add useful custom subagents

Subagents are specialists Claude Code can delegate to automatically. Drop the `.md` files from the [subagents catalog](../tools/subagents) into `.claude/agents/` in your project root.

```bash
mkdir -p .claude/agents
```

### Frontend subagents

| Subagent | What it does |
|----------|-------------|
| [ux-reviewer](../tools/subagents#ux-reviewer) | Audits JSX/TSX for visual hierarchy, spacing, states, and copy quality |
| [accessibility-auditor](../tools/subagents#accessibility-auditor) | Checks HTML/JSX/TSX against WCAG 2.1 |
| [security-auditor](../tools/subagents#security-auditor) | Scans for XSS, CSRF, auth issues, and other web vulnerabilities |
| [api-contract-reviewer](../tools/subagents#api-contract-reviewer) | Reviews REST/GraphQL endpoints for consistency and missing validation |

### Go backend subagents

| Subagent | What it does |
|----------|-------------|
| [security-auditor](../tools/subagents#security-auditor) | Scans for injection, auth issues, insecure crypto, and SSRF patterns |
| [api-contract-reviewer](../tools/subagents#api-contract-reviewer) | Reviews REST/gRPC handlers for consistency, validation, and error handling |
| [dependency-auditor](../tools/subagents#dependency-auditor) | Checks `go.mod` / `go.sum` for outdated packages and known CVEs |

---

## 5. Daily workflow

### Inline completions (Cursor / Copilot / Claude extension)

As you type, completions appear automatically. Accept with `Tab`. For longer generations, open the chat panel and describe what you want in context of the open file.

**Frontend chat examples:**
```
Add a loading skeleton for this component that matches the existing layout.
```
```
Extract the form validation logic into a custom hook called useContactForm.
```

**Go chat examples:**
```
Add godoc comments to every exported function in this file.
```
```
Suggest a table-driven test structure for this function.
```

### Claude Code for multi-file tasks

Open a terminal in your project root and run `claude`:

**Frontend:**
```
Add a dark mode toggle to the app. Store the preference in localStorage.
Use the existing ThemeContext pattern in src/context/ThemeContext.tsx.
```
```
Refactor all fetch calls in src/services/ to use React Query.
Don't change the component interfaces - only the data-fetching layer.
```

**Go backend:**
```
Generate a REST handler for POST /users. It should:
- Decode a JSON body into a CreateUserRequest struct
- Validate that email is non-empty and name is at least 2 characters
- Call userService.Create(ctx, req) and handle the error
- Return 201 with the created user as JSON, or 400/500 with a JSON error body
Follow the error handling patterns in internal/handler/health.go.
```
```
Refactor the database layer in internal/store/ to use pgx/v5 connection pooling.
Right now it creates a new connection per query. Don't change the Store interface.
```

### Pre-commit review

```
Review my staged changes for bugs, security issues, and anything
that violates the conventions in CLAUDE.md.
```

**Frontend: run specialist subagents:**
```
Run the ux-reviewer and accessibility-auditor agents on src/components/CheckoutForm/.
```

**Go backend: run specialist subagents:**
```
Run the security-auditor agent on internal/handler/ and internal/auth/.
```

---

## Tips

**Shared:**
- **Reference files by name.** Claude Code has full access to your repo, so "look at src/hooks/useCart.ts" or "internal/handler/health.go" is unambiguous.
- **Paste error messages directly.** "Fix this error: [paste]" works better than a vague description.
- **Lock down generated directories.** Add `src/generated/`, `internal/gen/`, `dist/`, `vendor/` to `CLAUDE.md` under "Do not modify".

**Frontend specific:**
- **Angular: always specify `standalone: true`** in your prompts or CLAUDE.md if you're on Angular 15+. Older codebases default to NgModules and Claude will follow that pattern if unspecified.
- **Use the Explore subagent for search tasks.** "Use the Explore agent to find all places where we call useEffect without a dependency array" is faster and cheaper than Claude scanning files itself.

**Go specific:**
- **Always run `go vet ./...` after AI-generated code.** Claude handles idiomatic Go well but occasionally generates code that compiles yet fails vet (shadowed errors, unused params).
- **Specify the interface.** Paste an existing interface and say "implement this". Generated code will match the signature exactly.
- **Goroutine safety:** Say explicitly "this struct will be called from multiple goroutines simultaneously" if that's the case. Claude won't assume it.
- **proto files:** Claude Code can generate proto definitions and stub implementations, but always run `make proto` to regenerate. Never hand-edit generated files.
