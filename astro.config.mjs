import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import vue from "@astrojs/vue";

const base = process.env.LEARN_GHOSTTY_BASE || "/";

export default defineConfig({
  site: "https://b1tank.github.io",
  base,
  output: "static",
  integrations: [mdx(), vue()],
  markdown: { shikiConfig: { theme: "github-dark" } },
  vite: { server: { host: "127.0.0.1", port: 4173 } }
});
