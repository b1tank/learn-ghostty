import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import vue from "@astrojs/vue";

export default defineConfig({
  site: "https://b1tank.github.io",
  base: process.env.LEARN_GHOSTTY_BASE || "/",
  output: "static",
  integrations: [
    starlight({
      title: "Learn Ghostty",
      description: "Scenario-driven learning from PTY bytes to GPU pixels",
      favicon: "/ghost-mark.svg",
      social: [{ icon: "github", label: "Learn Ghostty on GitHub", href: "https://github.com/b1tank/learn-ghostty" }],
      customCss: ["./src/styles/custom.css", "./src/styles/scenarios.css"],
      pagefind: true,
      lastUpdated: true,
      credits: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      editLink: { baseUrl: "https://github.com/b1tank/learn-ghostty/edit/main/src/content/docs/" },
      sidebar: [
        { label: "Scenarios", items: ["lessons/00-open-ghostty", "lessons/01-codex-tui", "lessons/02-tmux", "lessons/03-ssh-remote"] },
        { label: "Course", items: ["course-map"] },
        { label: "Tools", items: ["source"] }
      ]
    }),
    vue()
  ]
});
