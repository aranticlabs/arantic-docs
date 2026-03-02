# CLAUDE.md — AI Assistant Guide for arantic-docs

This file provides context, conventions, and workflows for AI assistants (Claude, Copilot, etc.) working in this repository.

---

## Project Overview

**arantic-docs** is the official documentation site for [Arantic Digital](https://docs.arantic.com), covering how to use AI effectively in software development workflows. It is built with **Docusaurus 3.9** (React 19, TypeScript) and deployed as a static site.

The site covers four main topic areas:
- Prompting techniques (basics and advanced)
- Code generation, debugging, and refactoring with AI
- Testing with AI assistance
- AI tools and integrations (Claude Code, GitHub Copilot, Cursor)

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
│   ├── code/                    # Code generation, debugging, refactoring guides
│   │   ├── generation.md
│   │   ├── debugging.md
│   │   └── refactoring.md
│   ├── prompting/               # Prompting technique guides
│   │   ├── basics.md
│   │   └── advanced.md
│   ├── testing/                 # Testing-with-AI guides
│   │   ├── unit-tests.md
│   │   └── coverage.md
│   └── tools/                   # AI tools & integrations
│       ├── overview.md
│       ├── claude-code.md
│       ├── github-copilot.md
│       └── cursor.md
├── src/
│   └── css/
│       └── custom.css           # Site branding and theme overrides
├── static/
│   ├── img/                     # Logos, favicon, OG image (gitkeep only now)
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
---
```

`intro.md` uses `slug: /` to serve as the site root.

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

Example pattern (from `prompting/basics.md`):
```markdown
---
sidebar_position: 1
---

# Prompting Basics

Brief explanation of the topic.

## Be Specific

...explanation...

**Weak prompt:**
```
...
```

**Strong prompt:**
```
...
```
```

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
   - Prompting Techniques → `docs/prompting/`
   - Code Generation & Debugging → `docs/code/`
   - Testing with AI → `docs/testing/`
   - Tools & Integrations → `docs/tools/`

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

---

## Static Assets

Expected image assets (add before deploying new branding):
- `static/img/arantic-logo-light.svg`
- `static/img/arantic-logo-dark.svg`
- `static/img/favicon.ico`
- `static/img/og-image.png`

The `static/img/` directory currently only has a `.gitkeep` — these files must be added before the site fully renders logos.

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

- Feature branches follow the pattern: `claude/<description>-<session-id>`
- The default base branch is `main` (remote) / `master` (local)
- Commits should be clear and descriptive (imperative mood: "Add X", "Fix Y")
- No CI/CD pipelines are configured; deployment is manual via `npm run deploy`

---

## Common Pitfalls

| Problem | Solution |
|---------|----------|
| Build fails with broken link error | Check all internal links; Docusaurus throws on broken links |
| Sidebar not updating | Verify `sidebar_position` frontmatter and `sidebars.ts` category entries |
| Stale content in dev server | Run `npm run clear` then `npm start` |
| Logo/favicon not appearing | Add missing image files to `static/img/` |
| Type errors in config files | Run `npm run typecheck` for details; config files use `satisfies` for strict typing |
| i18n content missing | Run `npm run write-translations` to generate scaffolding |

---

## Adding New Documentation

1. Create a `.md` file in the appropriate `docs/` subdirectory
2. Add YAML frontmatter with `sidebar_position`
3. Follow the document structure pattern (intro → sections → examples → caveats)
4. Use language-tagged code blocks and consistent terminology
5. If it's a new category, add an entry to `sidebars.ts`
6. Run `npm run build` to verify no broken links or MDX errors
7. Commit and push to your feature branch
