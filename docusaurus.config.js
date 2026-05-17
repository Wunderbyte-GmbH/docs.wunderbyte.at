import {themes as prismThemes} from 'prism-react-renderer';

const config = {
  title: 'Wunderbyte Docs',
  url: 'https://docs.wunderbyte.at',
  tagline: 'Documentation for Wunderbyte Moodle plugins and projects',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  baseUrl: '/',
  organizationName: 'Wunderbyte-GmbH',
  projectName: 'docs.wunderbyte.at',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/Wunderbyte-GmbH/docs.wunderbyte.at/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Wunderbyte Docs',
      logo: {
        alt: 'Wunderbyte Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/Wunderbyte-GmbH/docs.wunderbyte.at',
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
            {
              label: 'Overview',
              to: '/docs/',
            },
            {
              label: 'Booking',
              to: '/docs/mod_booking',
            },
            {
              label: 'Datalynx',
              to: '/docs/mod_datalynx',
            },
          ],
        },
        {
          title: 'Projects',
          items: [
            {
              label: 'moodle-mod_booking',
              href: 'https://github.com/Wunderbyte-GmbH/moodle-mod_booking',
            },
            {
              label: 'moodle-mod_datalynx',
              href: 'https://github.com/Wunderbyte-GmbH/moodle-mod_datalynx',
            },
          ],
        },
        {
          title: 'Wunderbyte',
          items: [
            {
              label: 'Website',
              href: 'https://wunderbyte.at',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Wunderbyte-GmbH',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Wunderbyte GmbH. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
