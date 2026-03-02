import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Quickstart',
      items: [
        'quickstart/overview',
        'quickstart/web',
        'quickstart/go',
        'quickstart/dotnet',
        'quickstart/firmware',
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
        'tools/agent-teams',
        'tools/github-copilot',
        'tools/cursor',
      ],
    },
  ],
};

export default sidebars;
