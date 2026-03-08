# CLAUDE.md — AI Assistant Guide for arantic-docs

This file provides context, conventions, and workflows for AI assistants (Claude, Copilot, etc.) working in this repository.

---

## Project Overview

**arantic-docs** is the official documentation site for [Arantic Digital](https://docs.arantic.com), covering how to use AI effectively in software development workflows. It is built with **Docusaurus 3.9** (React 19, TypeScript) and deployed as a static site.

The site covers:
- Experience-level guides (starter, intermediate, pro) including PRD-driven development
- Prompting techniques (basics and advanced)
- Code generation, debugging, and refactoring with AI
- Testing with AI assistance
- AI tools and integrations (Claude Code, GitHub Copilot, Cursor, Codex, Gemini CLI, Aider, Mistral)
- Claude Code deep-dives: memory, skills, subagents, agent teams, hooks, MCP, workflows, plugins
- Stack-specific setup guides (web/backend, .NET, firmware/embedded)
- Resources: prompt templates, subagent blueprints, skill templates, GitHub repos, troubleshooting

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Site framework | Docusaurus | 3.9.2 |
| UI library | React / React DOM | 19.0.0 |
| Language | TypeScript | ~5.6.2 |
| Search | @easyops-cn/docusaurus-search-local | 0.52.2 |
| Syntax highlighting | prism-react-renderer | 2.3.0 |
| Runtime | Node.js | ≥20.0 |

---

## Repository Structure

```
arantic-docs/
├── docs/                        # All documentation content (Markdown/MDX)
│   ├── intro.md                 # Landing page (slug: /)
│   ├── quickstart.md
│   ├── guides/                  # Experience-level guides (starter, intermediate, pro)
│   │   ├── prd.md
│   │   ├── starter/             # setup.md, workflow.md
│   │   ├── intermediate/        # setup.md, workflow.md
│   │   └── pro/                 # setup.md, workflow.md
│   ├── claude-code/             # Deep-dives: memory, skills, subagents, hooks, mcp, etc.
│   ├── prompting/               # basics.md, advanced.md
│   ├── code/                    # generation.md, debugging.md, refactoring.md
│   ├── testing/                 # unit-tests.md, coverage.md
│   ├── tools/                   # overview.md + one file per tool
│   ├── setup/                   # Stack-specific setup (web-and-backend, dotnet, firmware)
│   └── resources/               # prompt-templates.md, github-repos.md, troubleshooting.md
├── src/
│   ├── components/
│   │   ├── StructuredData.tsx   # JSON-LD schemas (Organization, WebSite, BreadcrumbList)
│   │   └── HowToSchema.tsx      # Reusable HowTo schema for tutorial pages
│   ├── theme/
│   │   ├── Root.tsx             # Global wrapper — injects StructuredData on every page
│   │   └── DocCard/             # Custom DocCard component
│   └── css/
│       └── custom.css           # Site branding and theme overrides
├── static/
│   ├── img/
│   │   ├── brand/               # Logos, favicons, OG image
│   │   └── docs/                # Screenshots and images used in docs
│   └── robots.txt               # Crawler permissions incl. AI bots
├── docusaurus.config.ts         # Main site configuration
├── sidebars.ts                  # Sidebar/navigation structure
├── tsconfig.json                # TypeScript config (extends @docusaurus/tsconfig)
└── package.json                 # Scripts and dependencies
```

---

## Development Workflows

### Start Local Dev Server
```bash
npm start
# Serves at http://localhost:3000 (browser does NOT auto-open due to --no-open)
```

### Build for Production
```bash
npm run build       # Outputs to /build
npm run serve       # Preview the production build locally
```

### Type Checking
```bash
npm run typecheck   # Runs tsc — no Jest/Vitest, this is the only validation
```

### Cache Management
```bash
npm run clear       # Clears Docusaurus cache (use when experiencing stale build issues)
```

### Translations & Heading IDs
```bash
npm run write-translations   # Generate/update i18n translation files
npm run write-heading-ids    # Auto-generate stable heading anchor IDs
```

---

## Content Conventions

### Frontmatter

Every `.md` / `.mdx` file must include YAML frontmatter:

```yaml
---
sidebar_position: 1       # Controls order within its category (required)
slug: /optional-override  # Only needed to override the default URL path
description: One sentence describing the page, under 160 characters (required for SEO/GEO)
keywords: [keyword one, keyword two, keyword three]   # 6-10 terms, inline bracket format (required for SEO/GEO)
---
```

`intro.md` uses `slug: /` to serve as the site root.

**SEO/GEO rules for `description` and `keywords`:**
- `description`: one sentence, max 160 characters, accurate to the page content
- `keywords`: inline YAML array (`[term1, term2]`), 6-10 terms relevant to the page topic — do NOT use a comma-separated string or block list format, as Docusaurus requires an array and will throw a build error otherwise

### File Naming

- **Kebab-case** for all filenames: `unit-tests.md`, `github-copilot.md`
- Files are placed in the subdirectory matching their sidebar category
- Sidebar category order follows the numbering in `sidebars.ts`

### Document Structure Pattern

Documentation pages follow a consistent structure:

1. **H1 title** — matches the sidebar label
2. **Intro paragraph** — explains the topic and why it matters
3. **H2 sections** — topic breakdown using "What works well" / "What to avoid" framing
4. **Code examples** — always language-tagged, often contrasting weak vs. strong examples
5. **Caveats / Warnings** — inline notes about AI limitations specific to the topic

### Code Blocks

- Always tag with the language: ` ```python `, ` ```typescript `, ` ```bash `
- Use ` ```text ` for plain text / AI prompt examples
- Contrast examples are labeled **Weak:** and **Strong:** or **Before:** and **After:**

### Writing Style

- **Do not use em dashes** (`—`) in text. Use alternative punctuation instead, such as commas, parentheses, colons, or separate sentences.

### Sidebar Navigation

The `sidebars.ts` file defines navigation manually. When adding a new document:

1. Create the `.md` file in the correct `docs/` subdirectory with proper frontmatter `sidebar_position`
2. If creating a new category, add a `category` entry to `sidebars.ts`
3. Sidebar categories currently defined:
   - Guides → `docs/guides/`
   - Claude Code → `docs/claude-code/`
   - Prompting Techniques → `docs/prompting/`
   - Code Generation & Debugging → `docs/code/`
   - Testing with AI → `docs/testing/`
   - Tools & Integrations → `docs/tools/`
   - Setup → `docs/setup/`
   - Resources → `docs/resources/`

---

## Configuration Files

### `docusaurus.config.ts`

Key settings to be aware of:
- `url`: `https://docs.arantic.com` — do not change without a redirect plan
- `onBrokenLinks: 'throw'` — broken internal links will **fail the build**
- i18n: English (`en`) default, German (`de`) supported
- Edit URLs point to the GitHub repo; they are auto-generated
- Search plugin configured for both `en` and `de`

### `src/css/custom.css`

Brand colors (do not arbitrarily change these):

| Token | Color | Hex |
|-------|-------|-----|
| Primary | Plum | `#963484` |
| Secondary | Lapis | `#00648c` |
| Accent | Cyan | `#009a9a` |
| Tertiary | Violet | `#4b2364` |
| Background | Oxford | `#00002d` |

Both light and dark variants are defined. Code block highlighting uses the plum palette.

### `static/robots.txt`

Explicitly permits major AI web crawlers including `Claude-Web`, `anthropic-ai`, `GPTBot`, `PerplexityBot`, and others. Do not remove these entries.

### SEO/GEO Components (`src/`)

- `src/components/StructuredData.tsx` — injects JSON-LD schemas (Organization, WebSite, BreadcrumbList) on every page via `Root.tsx`
- `src/components/HowToSchema.tsx` — reusable component for HowTo structured data on tutorial/setup pages; import and use it in MDX files
- `src/theme/Root.tsx` — Docusaurus root wrapper that renders `StructuredData` globally

---

## Static Assets

All brand assets are in `static/img/brand/`:
- `arantic-logo-light.svg` / `arantic-logo-dark.svg` — navbar and README logo
- `favicon.svg`, `favicon.ico`, `favicon-96x96.png` — favicons
- `og-image.png` — social sharing image (1200×630px)

Screenshots and images used inside docs go in `static/img/docs/`.

---

## Testing & Validation

There is **no automated test suite**. Validation is done via:

1. `npm run typecheck` — TypeScript compilation check
2. `npm run build` — Full Docusaurus build (catches broken links, MDX errors, etc.)
3. `npm start` — Visual inspection in the browser

**When making changes, always run `npm run build` to verify nothing is broken** — broken links will throw an error and fail the build.

---

## Internationalization (i18n)

The site supports **English (en)** and **German (de)**. English is the default/primary language. German translations are supported but may not be fully populated yet. Run `npm run write-translations` to scaffold translation files when adding new content.

---

## Git Workflow

- Two branches: `main` (protected, production) and `dev` (active development)
- All work happens on `dev` — never commit or push directly to `main`
- **Do not commit code.** Claude Code should make file changes only; the user handles all commits and merges
- `main` is protected by a GitHub branch rule; direct pushes will be rejected

---

## Common Pitfalls

| Problem | Solution |
|---------|----------|
| Build fails with broken link error | Check all internal links; Docusaurus throws on broken links |
| Sidebar not updating | Verify `sidebar_position` frontmatter and `sidebars.ts` category entries |
| Stale content in dev server | Run `npm run clear` then `npm start` |
| Type errors in config files | Run `npm run typecheck` for details; config files use `satisfies` for strict typing |
| i18n content missing | Run `npm run write-translations` to generate scaffolding |
| Build fails with `"keywords" must be an array` | `keywords` frontmatter must use inline bracket format: `[term1, term2]` — not a string |
| Logo/favicon not appearing | Assets are in `static/img/brand/`, not `static/img/` |

---

## Adding New Documentation

1. Create a `.md` file in the appropriate `docs/` subdirectory
2. Add YAML frontmatter with `sidebar_position`
3. Follow the document structure pattern (intro → sections → examples → caveats)
4. Use language-tagged code blocks and consistent terminology
5. If it's a new category, add an entry to `sidebars.ts`
6. Run `npm run build` to verify no broken links or MDX errors
