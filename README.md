<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="static/img/brand/arantic-logo-dark.svg" />
        <img src="static/img/brand/arantic-logo-light.svg" width="400" alt="Arantic Docs" />
    </picture><br /><br />
    <p>Practical documentation for developers who want to use AI tools effectively in their daily workflow.<br />
    Guides, prompt templates, subagent blueprints, skills, and more — from first steps to advanced agent workflows.</p>
</div>

# Arantic Docs

## What's inside

This site covers AI-assisted development from first steps to advanced automation. Content is organized by experience level and topic.

### Guides (by experience level)

- **Starter** — environment setup, first workflows, getting productive fast
- **Intermediate** — structured workflows, context management, team conventions
- **Pro** — agent orchestration, PRD-driven development, multi-agent systems

### Tools coverage

Honest, side-by-side comparisons of Claude Code, GitHub Copilot, Cursor, Codex CLI, Gemini CLI, Aider, and Mistral. Covers what each tool does well, where it falls short, and when to switch.

### Claude Code deep-dives

The most detailed section. Covers every layer of Claude Code:

| Topic | What you'll find |
|-------|-----------------|
| **Memory** | CLAUDE.md, user/project/local scopes, auto memory, subagent memory |
| **Skills** | Custom slash commands, ready-to-use templates, team skill libraries |
| **Subagents** | Built-in agents, custom agent files, parallel and background execution |
| **Agent Teams** | Peer-to-peer multi-agent collaboration, when to use it vs. subagents |
| **Hooks** | Pre/post tool hooks, automated quality gates, safety guardrails |
| **MCP Servers** | Model Context Protocol setup, available servers, practical use cases |
| **Workflows** | Orchestration patterns, commands, composing agents + skills |
| **Plugins** | Plugin marketplace, installing and managing extensions |
| **Context & Flags** | Context window management, CLI flags, permission modes |
| **Debugging** | Diagnosing common failures, session inspection, troubleshooting |

### Resources

- **Prompt templates** — copy-paste prompts for code review, refactoring, testing, and more
- **Subagent blueprints** — ready-to-use `.md` agent files for universal, web/backend, and firmware/embedded workflows
- **Skill templates** — ready-to-use `SKILL.md` files covering review, commit messages, standup updates, test generation, API review, and more
- **PRD system** — a 7-document PRD template designed for AI-assisted development
- **GitHub repos** — curated list of useful AI dev tooling repositories
- **Troubleshooting** — common AI coding pitfalls and how to work around them

### Prompting and code guides

Foundational guides on prompting basics and advanced techniques, code generation, debugging, refactoring, unit testing, and coverage.

### Setup guides

Stack-specific environment setup for web/backend, .NET, and firmware/embedded projects.

---

## Who this is for

Developers who already know how to code and want to move faster with AI, not replace thinking, but reduce repetitive work and keep context across sessions. Whether you are just starting with AI tools or building custom agent pipelines, there is content here for you.

---

## Running locally

```bash
npm install
npm start
# Opens at http://localhost:3000
```

Build for production:

```bash
npm run build
npm run serve
```

---

## Contributing

Contributions are welcome. If you spot something outdated, want to add a guide, improve an example, or contribute a subagent/skill blueprint, open a PR.

A few conventions to follow:

- All docs live in `docs/` as `.md` or `.mdx` files with YAML frontmatter (`sidebar_position` required)
- Filenames use kebab-case
- Code blocks are always language-tagged
- Run `npm run build` before submitting — broken links will fail the build

See [CLAUDE.md](./CLAUDE.md) for the full contributor and AI assistant guide.

---

Built and maintained by [Arantic Digital](https://arantic.com).
