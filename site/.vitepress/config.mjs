import { defineConfig } from "vitepress";
import { courseApiPlugin } from "../../server/course-api.mjs";

export default defineConfig({
  title: "Learn Ghostty",
  description: "See the whole terminal. Build every layer.",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: { src: "/ghost-mark.svg", alt: "Learn Ghostty" },
    siteTitle: "Learn Ghostty",
    nav: [
      { text: "Start learning", link: "/lessons/00-ghostty-overview" },
      { text: "Course map", link: "/course-map" }
    ],
    sidebar: {
      "/lessons/": [
        {
          text: "FOUNDATION",
          items: [
            { text: "00 · Ghostty: the whole machine", link: "/lessons/00-ghostty-overview" },
            { text: "01 · From teletype to PTY · NEXT" },
            { text: "02 · Enough Zig for Ghostty · PLANNED" },
            { text: "03 · Bytes become actions · PLANNED" }
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
    socialLinks: [{ icon: "github", link: "https://github.com/b1tank/learn-ghostty" }],
    search: { provider: "local" },
    outline: { level: [2, 3], label: "ON THIS PAGE" },
    docFooter: { prev: "Previous layer", next: "Next layer" },
    footer: { message: "Local-first · source-backed · built while learning", copyright: "Learn Ghostty" }
  },
  vite: {
    plugins: [courseApiPlugin()]
  }
});
