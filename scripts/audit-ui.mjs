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
  const routes = ["/", "/course-map", "/chapters/00-process-exists", "/chapters/01-app-lifecycle", "/chapters/02-entry-routing", "/chapters/03-runtime-surface", "/field-guides/run-ls-cat", "/field-guides/codex-tui", "/field-guides/tmux", "/field-guides/ssh-remote", "/source"];
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
      processSteps: [...document.querySelectorAll(".process-birth__flow li")].map((element) => {
        const rect = element.getBoundingClientRect();
        const title = element.querySelector("strong");
        return { x: rect.x, y: rect.y, width: rect.width, titleLines: Math.round(title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight)) };
      }),
      sourceCards: [...document.querySelectorAll(".source-card")].map((element) => {
        const card = element.getBoundingClientRect();
        const copy = element.querySelector(".source-card__copy").getBoundingClientRect();
        const actions = element.querySelector(".source-card__actions").getBoundingClientRect();
        return { copyRatio: copy.width / card.width, copyBottom: copy.bottom, actionsTop: actions.top };
      }),
      historyMoments: document.querySelectorAll(".evolution-strip li").length,
      next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
      emoji: [...document.querySelectorAll("button,a")].some((element) => /\p{Extended_Pictographic}/u.test(element.textContent)),
    };
  });
  check(chapterState.paragraphSize >= 17 && chapterState.lineHeight >= 29 && chapterState.headingSize >= 48, "Chapter 00 typography is too small or cramped");
  check(chapterState.snapshots === 2 && chapterState.result, "Chapter 00 is missing source snapshots or exact output");
  check(chapterState.labels.includes("temporary") && chapterState.labels.includes("adapted"), "Chapter 00 fidelity labels are incomplete");
  const horizontalProcess = Math.max(...chapterState.processSteps.map((step) => step.y)) - Math.min(...chapterState.processSteps.map((step) => step.y)) < 1;
  const verticalProcess = Math.max(...chapterState.processSteps.map((step) => step.x)) - Math.min(...chapterState.processSteps.map((step) => step.x)) < 1;
  check(chapterState.processSteps.length === 4 && (horizontalProcess || verticalProcess) && chapterState.processSteps.every((step) => step.width >= 120 && step.titleLines <= 2), "process pipeline is cramped or falls out of flow");
  check(chapterState.sourceCards.length === 2 && chapterState.sourceCards.every((card) => card.copyRatio >= .78 && card.actionsTop >= card.copyBottom), "source-card actions crush or overlap source context");
  check(chapterState.historyMoments === 3, "then/reconstruction/now source archaeology is incomplete");
  check(chapterState.next.includes("/chapters/01-app-lifecycle"), "Chapter 00 does not advance to Chapter 01");
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
  check(progress.completedLessons.includes("00-process-exists") && progress.currentLesson === "01-app-lifecycle", "Chapter 00 completion did not advance to Chapter 01");
  await chapter.close();

  const resume = await newPage(browser);
  await resume.goto(base, { waitUntil: "networkidle0" });
  const resumeText = await resume.$eval(".reconstruction-resume", (element) => element.textContent);
  check(resumeText.includes("Continue chapter") && resumeText.includes("App owns the lifetime"), "homepage checkpoint does not resume Chapter 01");
  await resume.close();

  const lifecycle = await newPage(browser, 1280, "dark");
  await lifecycle.goto(base + "/chapters/01-app-lifecycle", { waitUntil: "networkidle0" });
  const lifecycleState = await lifecycle.evaluate(() => ({
    rows: document.querySelectorAll(".lifecycle-diagram li").length,
    commandsFit: [...document.querySelectorAll(".lifecycle-diagram code")].every((element) => element.scrollWidth <= element.clientWidth),
    history: document.querySelectorAll(".evolution-strip li").length,
    output: document.querySelector(".output-preview")?.textContent?.includes("[app] destroyed"),
    sources: [...document.querySelectorAll(".source-card")].map((element) => {
      const copy = element.querySelector(".source-card__copy").getBoundingClientRect();
      const actions = element.querySelector(".source-card__actions").getBoundingClientRect();
      return actions.top >= copy.bottom;
    }),
    next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
  }));
  check(lifecycleState.rows === 7 && lifecycleState.commandsFit && lifecycleState.history === 3 && lifecycleState.output, "Chapter 01 is missing or truncating its ownership trace, historical comparison, or exact output");
  check(lifecycleState.sources.length === 2 && lifecycleState.sources.every(Boolean), "Chapter 01 source actions crush source context");
  check(lifecycleState.next.includes("/chapters/02-entry-routing"), "Chapter 01 does not advance to Chapter 02");
  await lifecycle.close();

  const lifecycleMobile = await newPage(browser, 390, "dark");
  await lifecycleMobile.goto(base + "/chapters/01-app-lifecycle", { waitUntil: "networkidle0" });
  check(await lifecycleMobile.$$eval(".lifecycle-diagram code", (elements) => elements.every((element) => element.scrollWidth <= element.clientWidth)), "Chapter 01 ownership labels truncate on mobile");
  await lifecycleMobile.close();

  const routing = await newPage(browser, 1280, "dark");
  await routing.goto(base + "/chapters/02-entry-routing", { waitUntil: "networkidle0" });
  const routingState = await routing.evaluate(() => ({
    steps: document.querySelectorAll(".routing li").length,
    history: document.querySelectorAll(".evolution-strip li").length,
    output: document.querySelector(".output-preview")?.textContent?.includes("[entry] ghostty"),
    next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
  }));
  check(routingState.steps === 4 && routingState.history === 3 && routingState.output, "Chapter 02 is missing its route, history, or exact output");
  check(routingState.next.includes("/chapters/03-runtime-surface"), "Chapter 02 does not advance to Chapter 03");
  await routing.close();

  const runtime = await newPage(browser, 1280, "dark");
  await runtime.goto(base + "/chapters/03-runtime-surface", { waitUntil: "networkidle0" });
  const runtimeState = await runtime.evaluate(() => ({
    lifetimes: document.querySelectorAll(".runtime-map li").length,
    history: document.querySelectorAll(".evolution-strip li").length,
    output: document.querySelector(".output-preview")?.textContent?.includes("[runtime] terminated"),
    next: Boolean(document.querySelector('a[rel="next"]')),
  }));
  check(runtimeState.lifetimes === 4 && runtimeState.history === 3 && runtimeState.output, "Chapter 03 is missing runtime lifetimes, history, or output");
  check(!runtimeState.next, "Chapter 03 should stop at the current published frontier");
  await runtime.close();

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
  const lifecycleMarkdown = await (await fetch(base + "/ai/lessons/01-app-lifecycle.md")).text();
  check(lifecycleMarkdown.includes("[app] destroyed") && lifecycleMarkdown.includes("src/App.zig") && !/<[A-Z][A-Za-z]+/.test(lifecycleMarkdown), "Chapter 01 AI Markdown is invalid");
  const routingMarkdown = await (await fetch(base + "/ai/lessons/02-entry-routing.md")).text();
  check(routingMarkdown.includes("[entry] ghostty") && routingMarkdown.includes("src/main_ghostty.zig") && !/<[A-Z][A-Za-z]+/.test(routingMarkdown), "Chapter 02 AI Markdown is invalid");
  const runtimeMarkdown = await (await fetch(base + "/ai/lessons/03-runtime-surface.md")).text();
  check(runtimeMarkdown.includes("[runtime] terminated") && runtimeMarkdown.includes("src/Surface.zig") && !/<[A-Z][A-Za-z]+/.test(runtimeMarkdown), "Chapter 03 AI Markdown is invalid");

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
