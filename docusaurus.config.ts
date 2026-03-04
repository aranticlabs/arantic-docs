import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Arantic Documentation',
  tagline: 'How to use AI effectively in your programming workflow',
  favicon: 'img/brand/favicon.ico',

  headTags: [
    { tagName: 'link', attributes: { rel: 'icon', type: 'image/svg+xml', href: '/img/brand/favicon.svg' } },
    { tagName: 'link', attributes: { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/img/brand/favicon-96x96.png' } },
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true,
  },

  url: 'https://docs.arantic.com',
  baseUrl: '/',
  trailingSlash: false,

  organizationName: 'aranticlabs',
  projectName: 'arantic-docs',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    localeConfigs: {
      en: { label: 'English' },
      de: { label: 'Deutsch' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/aranticlabs/arantic-docs/tree/main/',
          routeBasePath: '/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 85,
        max: 1920,
        min: 640,
        steps: 2,
        disableInDev: false,
      },
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'de'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: '/',
      },
    ],
  ],

  themeConfig: {
    image: 'img/brand/og-image.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    metadata: [
      {name: 'keywords', content: 'ai programming, claude code, github copilot, cursor, prompting, code generation, ai debugging, ai testing'},
      {name: 'description', content: 'Practical guides on using AI tools for programming — prompting, code generation, debugging, testing, and tool integrations.'},
      {name: 'author', content: 'Arantic Digital'},
      {property: 'og:type', content: 'website'},
      {property: 'og:site_name', content: 'Arantic Documentation'},
      {name: 'og:image:width', content: '1200'},
      {name: 'og:image:height', content: '630'},
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
    navbar: {
      logo: {
        alt: 'Arantic Digital Logo',
        src: 'img/brand/arantic-logo-light.svg',
        srcDark: 'img/brand/arantic-logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          label: 'Guides',
          position: 'left',
        },
        {
          to: '/tools',
          label: 'Tools',
          position: 'left',
        },
        {
          to: '/claude-code',
          label: 'Claude Code',
          position: 'left',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/aranticlabs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Guides',
          items: [
            {
              label: 'Introduction',
              to: '/',
            },
            {
              label: 'Quickstart',
              to: '/quickstart',
            },
            {
              label: 'Prompting Basics',
              to: '/prompting/basics',
            },
          ],
        },
        {
          title: 'Reference',
          items: [
            {
              label: 'Tools Overview',
              to: '/tools/overview',
            },
            {
              label: 'Claude Code',
              to: '/claude-code/overview',
            },
            {
              label: 'GitHub Repos',
              to: '/resources/github-repos',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/aranticlabs',
            },
            {
              label: 'Website',
              href: 'https://arantic.com',
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Privacy Policy',
              href: 'https://arantic.com/privacy',
            },
            {
              label: 'Imprint',
              href: 'https://arantic.com/imprint',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://arantic.com" target="_blank" rel="noopener noreferrer">Arantic Digital</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
