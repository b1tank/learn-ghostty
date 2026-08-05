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
        { label: "Rebuild Ghostty", items: ["chapters/00-process-exists", "chapters/01-app-lifecycle", "chapters/02-entry-routing", "chapters/03-runtime-surface", "chapters/04-child-process-pipes", "chapters/05-pty", "chapters/06-termio"] },
        { label: "Field guides", items: ["field-guides/run-ls-cat", "field-guides/codex-tui", "field-guides/tmux", "field-guides/ssh-remote"] },
        { label: "Course", items: ["course-map"] },
        { label: "Tools", items: ["history", "source"] }
      ]
    }),
    vue()
  ]
});
