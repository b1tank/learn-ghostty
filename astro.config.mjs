import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import vue from "@astrojs/vue";

const externalLinks = `
(() => {
  const update = (root = document) => {
    for (const link of root.querySelectorAll?.('a[href]') ?? []) {
      let url;
      try { url = new URL(link.href, location.href); } catch { continue; }
      if (!['http:', 'https:'].includes(url.protocol) || url.origin === location.origin) continue;
      link.target = '_blank';
      link.rel = [...new Set([...link.relList, 'noopener', 'noreferrer'])].join(' ');
    }
  };
  const start = () => {
    update();
    new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1) {
        if (node.matches?.('a[href]')) update(node.parentElement);
        else update(node);
      }
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();`;

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
      head: [{ tag: "script", content: externalLinks }],
      sidebar: [
        { label: "Rebuild Ghostty", items: ["chapters/00-process-exists", "chapters/01-app-lifecycle", "chapters/02-entry-routing", "chapters/03-runtime-surface", "chapters/04-child-process-pipes", "chapters/05-pty", "chapters/06-termio", "chapters/07-parser", "chapters/08-terminal-state", "chapters/09-first-window-gpu", "chapters/10-first-rectangle"] },
        { label: "Field guides", items: ["field-guides/run-ls-cat", "field-guides/codex-tui", "field-guides/tmux", "field-guides/ssh-remote"] },
        { label: "Course", items: ["course-map"] },
        { label: "Tools", items: ["history", "source"] }
      ]
    }),
    vue()
  ]
});
