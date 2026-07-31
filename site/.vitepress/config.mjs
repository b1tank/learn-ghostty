import { defineConfig } from "vitepress";
import { courseApiPlugin } from "../../server/course-api.mjs";

export default defineConfig({
  title: "Learn Ghostty",
  description: "See the whole terminal. Build every layer.",
  cleanUrls: true,
  lastUpdated: true,
  appearance: false,
  head: [
    ["meta", { name: "theme-color", content: "#f6f8f3" }],
    ["script", {}, `(function(){var key="learn-ghostty-theme";var value=localStorage.getItem(key)||"system";if(!/^(system|light|dark)$/.test(value))value="system";var dark=value==="dark"||(value==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);document.documentElement.dataset.themePreference=value;document.documentElement.dataset.effectiveTheme=dark?"dark":"light";document.querySelector('meta[name="theme-color"]')?.setAttribute("content",dark?"#07110f":"#f6f8f3")})()`],
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
