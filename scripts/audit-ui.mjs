import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const root = resolve(import.meta.dirname, "..");
const base = process.env.COURSE_URL || "http://127.0.0.1:4173";
const failures = [];
let checks = 0;
let server;
function check(ok, message) { checks++; if (!ok) failures.push(message); }
async function ready() { try { return (await fetch(base)).ok; } catch { return false; } }
async function ensureServer() {
  if (await ready()) return;
  server = spawn(resolve(root, "node_modules/.bin/astro"), ["dev", "--host", "127.0.0.1", "--port", "4173"], { cwd: root, stdio: "ignore" });
  for (let i = 0; i < 60; i++) { await new Promise((done) => setTimeout(done, 250)); if (await ready()) return; }
  throw new Error("Astro server did not start");
}
async function chromePath() {
  for (const path of [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean)) {
    try { await access(path); return path; } catch {}
  }
  throw new Error("Chrome required");
}
async function newPage(browser, width = 1280, theme = "light") {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  await page.evaluateOnNewDocument((value) => localStorage.setItem("starlight-theme", value), theme);
  return page;
}

await ensureServer();
const browser = await puppeteer.launch({ executablePath: await chromePath(), headless: true, args: ["--no-sandbox", "--disable-gpu"] });
try {
  const routes = ["/", "/course-map", "/chapters/00-process-exists", "/field-guides/run-ls-cat", "/field-guides/codex-tui", "/field-guides/tmux", "/field-guides/ssh-remote", "/source"];
  for (const theme of ["light", "dark"]) for (const width of [390, 768, 1440]) for (const route of routes) {
    const page = await newPage(browser, width, theme);
    await page.goto(base + route, { waitUntil: "networkidle0" });
    const state = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, main: Boolean(document.querySelector("main")) }));
    check(state.scroll <= state.viewport, `${theme} ${width}px ${route}: horizontal overflow ${state.scroll - state.viewport}px`);
    check(state.main, `${route}: main missing`);
    await page.close();
  }

  const home = await newPage(browser, 1440, "dark");
  await home.goto(base, { waitUntil: "networkidle0" });
  await home.evaluate(() => localStorage.removeItem("learn-ghostty.progress.v5"));
  await home.reload({ waitUntil: "networkidle0" });
  const homeState = await home.evaluate(() => ({
    heading: document.querySelector(".hero h1")?.textContent?.trim(),
    promises: document.querySelectorAll(".reconstruction-promise > div").length,
    frontier: document.querySelectorAll(".frontier-map li").length,
    current: document.querySelectorAll(".frontier-map .is-current").length,
    resume: Boolean(document.querySelector(".reconstruction-resume")),
    oldMap: Boolean(document.querySelector(".system-map")),
  }));
  check(homeState.heading === "Rebuild Ghostty. Understand every piece.", "homepage hero changed unexpectedly");
  check(homeState.promises === 3 && homeState.frontier === 7 && homeState.current === 1, "homepage reconstruction path is incomplete");
  check(!homeState.resume && !homeState.oldMap, "first visit should be simple and should not render the old system map");
  await home.close();

  const chapter = await newPage(browser, 1280, "dark");
  await chapter.goto(base + "/chapters/00-process-exists", { waitUntil: "networkidle0" });
  const chapterState = await chapter.evaluate(() => {
    const paragraph = document.querySelector(".sl-markdown-content > p");
    const h1 = document.querySelector("h1");
    return {
      paragraphSize: parseFloat(getComputedStyle(paragraph).fontSize),
      lineHeight: parseFloat(getComputedStyle(paragraph).lineHeight),
      headingSize: parseFloat(getComputedStyle(h1).fontSize),
      snapshots: document.querySelectorAll(".code-snapshot").length,
      result: document.querySelector(".output-preview")?.textContent?.includes("ghostty-from-scratch: hello"),
      labels: [...document.querySelectorAll(".fidelity-badge")].map((element) => element.textContent.trim()),
      next: Boolean(document.querySelector('a[rel="next"]')),
      emoji: [...document.querySelectorAll("button,a")].some((element) => /\p{Extended_Pictographic}/u.test(element.textContent)),
    };
  });
  check(chapterState.paragraphSize >= 17 && chapterState.lineHeight >= 29 && chapterState.headingSize >= 48, "Chapter 00 typography is too small or cramped");
  check(chapterState.snapshots === 2 && chapterState.result, "Chapter 00 is missing source snapshots or exact output");
  check(chapterState.labels.includes("temporary") && chapterState.labels.includes("adapted"), "Chapter 00 fidelity labels are incomplete");
  check(!chapterState.next, "Chapter 00 must not advance into a field guide before Chapter 01 exists");
  check(!chapterState.emoji, "learner UI contains emoji glyphs");

  await chapter.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { window.__copy = value; } } }));
  await chapter.click(".ai-copy-primary");
  const copied = await chapter.evaluate(() => window.__copy || "");
  check(copied.includes("# Current section") && copied.includes("~/learn-ghostty/src/content/docs/chapters/00-process-exists.mdx") && copied.includes("~/ghostty") && copied.includes("# My question"), "Copy for AI context is incomplete");

  await chapter.evaluate(() => localStorage.removeItem("learn-ghostty.progress.v5"));
  await chapter.$eval("#step-1-read-the-entire-program", (element) => element.scrollIntoView());
  await chapter.waitForFunction(() => JSON.parse(localStorage.getItem("learn-ghostty.progress.v5") || "null")?.lastSections?.["00-process-exists"] === "step-1-read-the-entire-program", { timeout: 5000 });
  await chapter.click(".lesson-progress__actions button");
  const progress = await chapter.evaluate(() => JSON.parse(localStorage.getItem("learn-ghostty.progress.v5")));
  check(progress.completedLessons.includes("00-process-exists") && progress.currentLesson === "00-process-exists", "completion should remain at the current reconstruction frontier");
  await chapter.close();

  const resume = await newPage(browser);
  await resume.goto(base, { waitUntil: "networkidle0" });
  check((await resume.$eval(".reconstruction-resume", (element) => element.textContent)).includes("Revisit chapter"), "homepage checkpoint resume is missing");
  await resume.close();

  const flow = await newPage(browser);
  await flow.goto(base + "/field-guides/tmux", { waitUntil: "networkidle0" });
  await flow.$eval(".flow-walkthrough", (element) => element.scrollIntoView({ block: "center" }));
  await flow.waitForFunction(() => document.querySelector(".flow-walkthrough")?.classList.contains("is-playing"), { timeout: 3000 });
  const before = await flow.$eval('.flow-rail [aria-selected="true"]', (element) => element.getAttribute("data-step"));
  await new Promise((done) => setTimeout(done, 3400));
  const after = await flow.$eval('.flow-rail [aria-selected="true"]', (element) => element.getAttribute("data-step"));
  check(before !== after, "field-guide walkthrough did not advance automatically");
  await flow.close();

  const markdown = await (await fetch(base + "/ai/lessons/00-process-exists.md")).text();
  check(markdown.includes("local_course_path: ~/learn-ghostty/src/content/docs/chapters/00-process-exists.mdx") && !/<[A-Z][A-Za-z]+/.test(markdown), "Chapter 00 AI Markdown is invalid");

  for (const [legacy, expected] of [["/lessons/00-open-ghostty", "/field-guides/run-ls-cat"], ["/lessons/01-codex-tui", "/field-guides/codex-tui"]]) {
    const response = await fetch(base + legacy, { redirect: "follow" });
    check(response.url.endsWith(expected), `${legacy} does not redirect to ${expected}`);
  }

  const search = await newPage(browser);
  await search.goto(base, { waitUntil: "networkidle0" });
  await search.click('button[aria-label="Search"]');
  check(await search.$eval("dialog[open]", (element) => element.open), "Starlight search dialog did not open");
  await search.close();
} finally {
  await browser.close();
  if (server) server.kill("SIGTERM");
}

if (failures.length) {
  console.error(`UI audit failed (${failures.length}/${checks})\n` + failures.map((failure) => `  ✗ ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Astro UI audit passed ${checks} assertions across reconstruction, field guides, themes, widths, progress, copy, and redirects`);
