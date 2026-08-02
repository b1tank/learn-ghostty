import { readFileSync } from "node:fs";
import { defineConfig } from "vitepress";
import { courseApiPlugin } from "../../server/course-api.mjs";

const manifest = JSON.parse(readFileSync(new URL("../../course/manifest.json", import.meta.url), "utf8"));
const lessonById = Object.fromEntries(manifest.lessons.map((lesson) => [lesson.id, lesson]));
const sidebar = manifest.modules.map((module) => ({
  text: module.title.toUpperCase(),
  items: module.lessonIds.map((id) => {
    const lesson = lessonById[id];
    return lesson.status === "available"
      ? { text: `${String(lesson.order).padStart(2, "0")} · ${lesson.title}`, link: lesson.path }
      : { text: `${String(lesson.order).padStart(2, "0")} · ${lesson.title} · ${lesson.status === "building" ? "NEXT" : "PLANNED"}` };
  })
}));
sidebar.push({ text: "TOOLS", items: [{ text: "Source viewer", link: "/source" }, { text: "Course map", link: "/course-map" }] });

export default defineConfig({
  base: process.env.LEARN_GHOSTTY_BASE || "/",
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
    sidebar: { "/lessons/": sidebar },
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
