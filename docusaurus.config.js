// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Etrid Documentation',
  tagline: 'Technical specifications, API references, and guides for the Etrid Network',
  favicon: 'img/favicon.ico',

  url: 'https://docs.etrid.network',
  baseUrl: '/',

  organizationName: 'etaborai',
  projectName: 'etrid-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/etaborai/etrid-docs/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Etrid Docs',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/etaborai/etrid',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Getting Started', to: '/docs/getting-started/overview' },
              { label: 'Developer Guide', to: '/docs/developers/developer-guide' },
              { label: 'Validator Guide', to: '/docs/validators/operator-guide' },
            ],
          },
          {
            title: 'Community',
            items: [
              { label: 'Discord', href: 'https://discord.gg/etrid' },
              { label: 'Twitter', href: 'https://twitter.com/etridnetwork' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'GitHub', href: 'https://github.com/etaborai' },
            ],
          },
        ],
        copyright: `Copyright ${new Date().getFullYear()} Etrid Foundation. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['rust', 'toml', 'bash', 'json'],
      },
    }),
};

module.exports = config;
