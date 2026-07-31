import { defineConfig } from "vitepress";
import { courseApiPlugin } from "../../server/course-api.mjs";

export default defineConfig({
  title: "Learn Ghostty",
  description: "See the whole terminal. Build every layer.",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["meta", { name: "theme-color", content: "#07110f" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    ["link", { href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap", rel: "stylesheet" }]
  ],
  themeConfig: {
    logo: { src: "/ghost-mark.svg", alt: "Learn Ghostty" },
    siteTitle: "LEARN / GHOSTTY",
    nav: [
      { text: "Cockpit", link: "/" },
      { text: "Start learning", link: "/lessons/00-ghostty-overview" },
      { text: "Course map", link: "/course-map" },
      { text: "Design", link: "https://github.com/b1tank/learn-ghostty" }
    ],
    sidebar: {
      "/lessons/": [
        {
          text: "FOUNDATION",
          items: [
            { text: "00 · Ghostty: the whole machine", link: "/lessons/00-ghostty-overview" },
            { text: "01 · From teletype to PTY", link: "/lessons/01-terminal-origins" },
            { text: "02 · Enough Zig for Ghostty", link: "/lessons/02-zig-bridge" },
            { text: "03 · Bytes become actions", link: "/lessons/03-vt-parser" }
          ]
        },
        {
          text: "YOUR TOOLS",
          items: [
            { text: "Source viewer", link: "/source" },
            { text: "Course map", link: "/course-map" }
          ]
        }
      ]
    },
    socialLinks: [{ icon: "github", link: "https://github.com/ghostty-org/ghostty" }],
    search: { provider: "local" },
    outline: { level: [2, 3], label: "ON THIS PAGE" },
    docFooter: { prev: "Previous layer", next: "Next layer" },
    footer: { message: "Local-first · source-backed · built while learning", copyright: "Learn Ghostty" }
  },
  vite: {
    plugins: [courseApiPlugin()]
  }
});
