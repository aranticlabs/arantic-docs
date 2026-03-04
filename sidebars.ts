import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'quickstart',
    {
      type: 'category',
      label: 'Environment Setup',
      items: [
        'setup/web-and-backend',
        'setup/dotnet',
        'setup/firmware',
      ],
    },
    {
      type: 'category',
      label: 'Prompting Techniques',
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
    {
      type: 'category',
      label: 'Tools & Integrations',
      items: [
        'tools/overview',
        'tools/claude-code',
        'tools/skills',
        'tools/workflows',
        'tools/mcp',
        'tools/agent-teams',
        'tools/subagents',
        'tools/memory',
        'tools/github-copilot',
        'tools/cursor',
      ],
    },
  ],
};

export default sidebars;
