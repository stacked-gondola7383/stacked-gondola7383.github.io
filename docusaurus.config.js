// @ts-check
const { themes } = require("prism-react-renderer");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "E7",
  tagline: "The TypeScript you know, running safely inside your app",
  favicon: "img/logo.svg",
  url: "https://e7lang.github.io",
  baseUrl: "/",
  organizationName: "e7lang",
  projectName: "e7lang.github.io",
  trailingSlash: false,
  onBrokenLinks: "throw",
  markdown: {
    // plain .md files (synced from the e7 repo) are CommonMark, not MDX
    format: "detect",
    hooks: { onBrokenMarkdownLinks: "warn" },
  },
  i18n: { defaultLocale: "en", locales: ["en"] },
  stylesheets: [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
  ],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: ({ docPath }) =>
            docPath.startsWith("reference/")
              ? `https://github.com/e7lang/e7/edit/main/docs/${docPath.slice("reference/".length)}`
              : `https://github.com/e7lang/e7lang.github.io/edit/main/docs/${docPath}`,
        },
        blog: false,
        theme: { customCss: require.resolve("./src/css/custom.css") },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/architecture-light.png",
      colorMode: { respectPrefersColorScheme: true },
      navbar: {
        title: "E7",
        logo: { alt: "E7", src: "img/logo.svg" },
        items: [
          { type: "docSidebar", sidebarId: "docs", position: "left", label: "Docs" },
          { to: "/docs/getting-started", label: "Get started", position: "left" },
          { to: "/playground", label: "Playground", position: "left" },
          { to: "/docs/reference/SPEC", label: "Spec", position: "left" },
          { href: "https://github.com/e7lang/e7/releases", label: "Download", position: "right" },
          { href: "https://github.com/e7lang/e7", label: "GitHub", position: "right" },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Learn",
            items: [
              { label: "Introduction", to: "/docs/intro" },
              { label: "Getting started", to: "/docs/getting-started" },
              { label: "Language tour", to: "/docs/language-tour" },
              { label: "Playground", to: "/playground" },
            ],
          },
          {
            title: "Reference",
            items: [
              { label: "Language spec", to: "/docs/reference/SPEC" },
              { label: "Embedding (C API)", to: "/docs/reference/EMBEDDING" },
              { label: "Bytecode format", to: "/docs/reference/BYTECODE" },
              { label: "Production checklist", to: "/docs/reference/PRODUCTION" },
            ],
          },
          {
            title: "Project",
            items: [
              { label: "GitHub", href: "https://github.com/e7lang/e7" },
              { label: "Releases", href: "https://github.com/e7lang/e7/releases" },
              { label: "Issues", href: "https://github.com/e7lang/e7/issues" },
            ],
          },
        ],
        copyright: `E7 and e7vm are open source under the MIT license.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ["bash", "c", "cpp", "kotlin", "swift", "csharp", "json"],
      },
    }),
};

module.exports = config;
