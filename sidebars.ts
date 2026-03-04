import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      link: {
        type: 'generated-index',
        title: 'Guides',
        description: 'Step-by-step guides for using AI in your development workflow.',
        slug: '/guides',
      },
      items: [
        {
          type: 'category',
          label: 'Getting Started',
          items: [
            'quickstart',
            'setup/web-and-backend',
            'setup/dotnet',
            'setup/firmware',
          ],
        },
        {
          type: 'category',
          label: 'Prompting',
          items: [
            'prompting/basics',
            'prompting/advanced',
          ],
        },
        {
          type: 'category',
          label: 'Code Generation & Debugging',
          items: [
            'code/generation',
            'code/debugging',
            'code/refactoring',
          ],
        },
        {
          type: 'category',
          label: 'Testing with AI',
          items: [
            'testing/unit-tests',
            'testing/coverage',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'More Tools',
      link: {
        type: 'generated-index',
        title: 'More Tools',
        description: 'Overview and comparison of AI development tools.',
        slug: '/tools',
      },
      items: [
        'tools/overview',
        'tools/cursor',
        'tools/github-copilot',
        'tools/codex',
        'tools/gemini-cli',
        'tools/aider',
        'tools/mistral',
      ],
    },
    {
      type: 'category',
      label: 'Claude Code',
      link: {
        type: 'generated-index',
        title: 'Claude Code',
        description: 'Deep-dive into Claude Code capabilities and features.',
        slug: '/claude-code',
      },
      items: [
        'claude-code/overview',
        'claude-code/commands',
        'claude-code/claude-md',
        'claude-code/context',
        'claude-code/permissions',
        'claude-code/flags',
        'claude-code/debugging',
        'claude-code/tips',
        'claude-code/workflows',
        'claude-code/skills',
        'claude-code/hooks',
        'claude-code/plugins',
        'claude-code/mcp',
        'claude-code/subagents',
        'claude-code/agent-teams',
        'claude-code/memory',
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      link: {
        type: 'generated-index',
        title: 'Resources',
        description: 'Additional resources and references.',
        slug: '/resources',
      },
      items: [
        'resources/github-repos',
      ],
    },
  ],
};

export default sidebars;
