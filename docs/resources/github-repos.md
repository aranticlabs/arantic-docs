---
sidebar_position: 1
---

# GitHub Repos

A curated list of GitHub repositories with practical resources, configurations, and guides for AI-assisted development with Claude Code.

## Official Resources

### [anthropics/skills](https://github.com/anthropics/skills)

The official Anthropic repository for Agent Skills. Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks.

The repo includes:
- The official skill specification and template
- 16+ ready-to-use skills across categories (creative, development, enterprise, document)
- Reference implementations and best practices for building your own skills
- [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator): a meta-skill with tooling for creating, refining, and evaluating new skills, including agent management and performance benchmarking

Useful if you want to build, share, or understand how Claude Code skills work under the hood.

### [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)

Anthropic's official curated registry of high-quality Claude Code plugins. Centralizes both internally developed plugins and vetted third-party contributions.

The repo includes:
- `/plugins/` with plugins developed by Anthropic
- `/external_plugins/` with approved third-party plugins
- [skill-creator plugin](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/skill-creator): the plugin version of the skill-creator tool, for creating, improving, and benchmarking skills directly from Claude Code

Install any plugin via:
```bash
/plugin install {plugin-name}@claude-plugin-directory
```

## Community Guides

### [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)

A comprehensive practical guide to mastering Claude Code's advanced features. Goes well beyond the basics and covers core concepts in depth: commands, subagents, skills, hooks, MCP servers, settings, and memory.

Notable content:
- The "Command → Agent → Skill" orchestration pattern
- RPI methodology and the Ralph Wiggum Loop for autonomous task handling
- Practical tips for CLAUDE.md sizing, agent teams, and git worktrees

A good read after you are comfortable with the basics and want to move toward more structured, autonomous workflows.

### [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)

A production-ready Claude Code configuration system, developed over 10+ months and winner of an Anthropic Hackathon. Provides a full harness of agents, skills, commands, and rules you can drop into your own projects.

What's included:
- 13 specialized subagents (planning, architecture, code review, security analysis, and more)
- 56+ production-ready skills covering coding standards, backend and frontend patterns, and testing
- 32+ slash commands for TDD, planning, code review, and multi-agent orchestration
- Hooks, rules, and ecosystem tools including AgentShield (security auditing) and a Skill Creator

Useful as a reference implementation or as a starting point for teams that want a battle-tested Claude Code setup without building everything from scratch.
