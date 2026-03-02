---
sidebar_position: 3
---

# Go Developer Setup

Covers Go backend services, REST/gRPC APIs, CLI tools, and Go modules. Go's strong typing and `gofmt` conventions make AI output generally reliable — but you still need to verify that generated code compiles and passes `go vet`.

## 1. Install an in-editor tool

### Option A — VS Code with the Go extension (most common)

1. Install [VS Code](https://code.visualstudio.com)
2. Install the [Go extension](https://marketplace.visualstudio.com/items?itemName=golang.Go) — this gives you gopls, gofmt, delve debugger integration
3. Install [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) for inline completions and chat

When you open a Go file for the first time, VS Code will prompt you to install the Go toolchain (`gopls`, `dlv`, etc.) — accept all of them.

### Option B — GoLand with GitHub Copilot

[GoLand](https://www.jetbrains.com/go/) has the best Go-specific refactoring and static analysis of any IDE. Install the [GitHub Copilot plugin](https://plugins.jetbrains.com/plugin/17718-github-copilot) from the JetBrains Marketplace.

### Option C — Cursor

[Cursor](../tools/cursor) works well for Go. Its codebase-wide context is useful for large monorepos. Install the Go extension from the extensions panel after setup.

---

## 2. Install Claude Code

Claude Code handles multi-file refactoring, generating boilerplate (handlers, tests, middleware), and running review passes across your service.

**Requires Node.js 18+** (Claude Code is distributed via npm, even for non-JS projects).

```bash
npm install -g @anthropic-ai/claude-code
```

Run from your module root (where `go.mod` lives):

```bash
cd your-service
claude
```

See the full [Claude Code guide](../tools/claude-code) for capabilities.

---

## 3. Configure project context (CLAUDE.md)

Create a `CLAUDE.md` at your project root. Claude Code reads this on every session start — it is the fastest way to ensure generated code follows your conventions.

**Minimal template for a Go service:**

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
- Never use panic() in application code — return errors
- Table-driven tests only; test files live alongside the code they test
- Exported functions must have godoc comments
- Context is always the first parameter; never store context in a struct

## Commands
- `go build ./...` — build
- `go test ./...` — run all tests
- `go vet ./...` — static analysis
- `make lint` — golangci-lint (config in .golangci.yaml)
- `docker compose up -d` — start local Postgres + dependencies

## Do not modify
- `internal/gen/` — generated from proto files via `make proto`
- `vendor/` — managed by go mod vendor
```

**For a CLI tool (cobra-based):**

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

Download these from the [subagents catalog](../tools/subagents#web--backend) and place them in `.claude/agents/`:

| Subagent | What it does |
|----------|-------------|
| [security-auditor](../tools/subagents#security-auditor) | Scans for injection, auth issues, insecure crypto, and SSRF patterns |
| [api-contract-reviewer](../tools/subagents#api-contract-reviewer) | Reviews REST/gRPC handlers for consistency, validation, and error handling |
| [dependency-auditor](../tools/subagents#dependency-auditor) | Checks `go.mod` and `go.sum` for outdated packages and known CVEs |

```bash
mkdir -p .claude/agents
```

---

## 5. Daily workflow

### Inline completions

Copilot or Cursor will suggest struct fields, function bodies, test cases, and error-handling boilerplate as you type. Accept with `Tab`. The suggestions are usually correct for idiomatic Go — but always check that error values aren't silently discarded.

### Claude Code for multi-file tasks

Run `claude` from your project root and describe the task:

```
Generate a REST handler for POST /users. It should:
- Decode a JSON body into a CreateUserRequest struct
- Validate that email is non-empty and name is at least 2 characters
- Call userService.Create(ctx, req) and handle the error
- Return 201 with the created user as JSON, or 400/500 with a JSON error body

Follow the error handling and response patterns in internal/handler/health.go.
```

```
Write table-driven tests for every exported function in internal/auth/token.go.
Cover happy path, empty input, and malformed input for each function.
```

```
Refactor the database layer in internal/store/ to use pgx/v5 connection pooling.
Right now it creates a new connection per query. Don't change the Store interface.
```

### Pre-commit review

```
Run the security-auditor agent on internal/handler/ and internal/auth/.
```

```
Review my staged changes. Focus on: correct error wrapping, missing test cases,
and anything that doesn't follow the conventions in CLAUDE.md.
```

---

## Tips

- **Always run `go vet ./...` after AI-generated code.** Claude handles idiomatic Go well but occasionally generates code that compiles but fails vet (unused params, shadowed errors, etc.).
- **Specify the interface.** If you have an existing interface, paste it and say "implement this interface". Generated code will match the signature exactly.
- **Generated tests: check table structure.** Claude will generate table-driven tests correctly, but sometimes collapses cases that should be separate or omits boundary values. Review the test table manually.
- **proto files:** Claude Code can generate proto definitions and stub implementations, but always run `make proto` to regenerate — never hand-edit generated files.
- **Goroutine safety:** If a struct will be used concurrently, say so explicitly. "This handler will be called from multiple goroutines simultaneously — make sure the struct is safe for concurrent use."
