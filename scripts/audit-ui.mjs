import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const root = resolve(import.meta.dirname, "..");
const base = process.env.COURSE_URL || "http://127.0.0.1:4173";
const failures = [];
let checks = 0;
let server;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

async function serverReady() {
  try { return (await fetch(`${base}/api/health`)).ok; } catch { return false; }
}

async function ensureServer() {
  if (await serverReady()) return;
  server = spawn(resolve(root, "node_modules/.bin/vitepress"), ["dev", "site", "--host", "127.0.0.1", "--port", "4173"], {
    cwd: root,
    stdio: "ignore",
    detached: false
  });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((done) => setTimeout(done, 250));
    if (await serverReady()) return;
  }
  throw new Error("course server did not become ready");
}

async function chromePath() {
  const candidates = [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
  for (const candidate of candidates) {
    try { await access(candidate); return candidate; } catch {}
  }
  throw new Error("Chrome or Chromium is required; set CHROME_BIN");
}

function rgb(value) {
  const match = value.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);
  return match ? match.slice(1, 4).map(Number) : null;
}

function luminance(color) {
  const parts = rgb(color);
  if (!parts) return 0;
  const values = parts.map((part) => {
    const value = part / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + .05) / (dark + .05);
}

async function createPage(browser, { width = 1440, theme = "light", system = "light", reducedMotion = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: system },
    { name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }
  ]);
  await page.evaluateOnNewDocument((value) => localStorage.setItem("vitepress-theme-appearance", value === "system" ? "auto" : value), theme);
  return page;
}

async function auditTheme(browser, theme) {
  const page = await createPage(browser, { theme, system: theme === "dark" ? "dark" : "light" });
  await page.goto(base, { waitUntil: "networkidle0" });
  const state = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const probe = document.createElement("i");
    probe.style.display = "none";
    document.body.append(probe);
    const colors = Object.fromEntries(["--vp-c-bg", "--vp-c-text-1", "--vp-c-text-2", "--vp-c-text-3", "--lime", "--cyan", "--accent-fill", "--on-accent"].map((name) => {
      probe.style.color = style.getPropertyValue(name).trim();
      return [name, getComputedStyle(probe).color];
    }));
    probe.remove();
    return {
      dark: document.documentElement.classList.contains("dark"),
      stored: localStorage.getItem("vitepress-theme-appearance"),
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      colors
    };
  });
  check(state.stored === theme, `${theme}: VitePress preference was not applied`);
  check(state.dark === (theme === "dark"), `${theme}: document dark class mismatch`);
  check(contrast(state.colors["--vp-c-text-1"], state.colors["--vp-c-bg"]) >= 7, `${theme}: primary text contrast below 7:1`);
  check(contrast(state.colors["--vp-c-text-2"], state.colors["--vp-c-bg"]) >= 4.5, `${theme}: secondary text contrast below 4.5:1`);
  check(contrast(state.colors["--lime"], state.colors["--vp-c-bg"]) >= 4.5, `${theme}: green accent text contrast below 4.5:1`);
  check(contrast(state.colors["--cyan"], state.colors["--vp-c-bg"]) >= 4.5, `${theme}: cyan accent text contrast below 4.5:1`);
  check(contrast(state.colors["--on-accent"], state.colors["--accent-fill"]) >= 7, `${theme}: filled button contrast below 7:1`);
  await page.close();
}

async function auditSystem(browser) {
  const page = await createPage(browser, { theme: "system", system: "light" });
  await page.goto(base, { waitUntil: "networkidle0" });
  check(await page.evaluate(() => !document.documentElement.classList.contains("dark")), "system: did not start in system light");
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }, { name: "prefers-reduced-motion", value: "no-preference" }]);
  await new Promise((done) => setTimeout(done, 80));
  check(await page.evaluate(() => document.documentElement.classList.contains("dark")), "system: did not react live to system dark");
  check(await page.evaluate(() => localStorage.getItem("vitepress-theme-appearance") === "auto"), "system: live change lost VitePress auto preference");
  await page.goto(`${base}/course-map`, { waitUntil: "networkidle0" });
  check(await page.evaluate(() => document.documentElement.classList.contains("dark")), "system: theme did not persist across routes");
  await page.close();
}

async function auditFrameworkBoundaries(browser) {
  const css = await readFile(resolve(root, "site/.vitepress/theme/style.css"), "utf8");
  const forbidden = [
    [/(^|\n)\.VPNav\b/, "global .VPNav override"],
    [/(^|\n)\.VPSidebar\b/, "global .VPSidebar override"],
    [/(^|\n)\.vp-doc h[1-6]\b/, "global VitePress heading override"],
    [/(^|\n)\.vp-doc code\b/, "global VitePress code override"],
    [/(^|\n)\.button\s*\{/, "generic .button class"],
    [/(^|\n):where\([^\n]*input[^\n]*\):focus-visible/, "global input focus override"]
  ];
  for (const [pattern, label] of forbidden) check(!pattern.test(css), `framework boundary: found ${label}`);

  const page = await createPage(browser, { width: 1280, theme: "light" });
  await page.goto(`${base}/lessons/00-ghostty-overview`, { waitUntil: "networkidle0" });
  const heading = await page.$eval("#four-things-people-call-the-terminal", (element) => {
    const style = getComputedStyle(element);
    return { paddingTop: parseFloat(style.paddingTop) || 0, borderTop: parseFloat(style.borderTopWidth) || 0, marginTop: parseFloat(style.marginTop) || 0 };
  });
  check(heading.paddingTop === 24 && heading.borderTop === 1 && heading.marginTop === 48, "framework boundary: VitePress heading box was globally restyled");

  await page.goto(base, { waitUntil: "networkidle0" });
  await page.click(".DocSearch-Button");
  await page.waitForSelector(".VPLocalSearchBox .search-input");
  const search = await page.$eval(".VPLocalSearchBox .search-input", (element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { left: rect.left, right: rect.right, width: rect.width, height: rect.height, outlineOffset: parseFloat(style.outlineOffset) };
  });
  check(search.left >= 0 && search.right <= 1280 && search.width > 240, "framework boundary: search input escaped its dialog");
  check(search.height >= 32 && search.height <= 48, "framework boundary: search input height was distorted");
  check(search.outlineOffset === 0, "framework boundary: search focus treatment was overridden");
  await page.close();
}

async function auditDefaultAppearance(browser) {
  const desktop = await createPage(browser, { width: 1440, theme: "dark", system: "dark" });
  await desktop.goto(base, { waitUntil: "networkidle0" });
  const desktopSwitch = await desktop.$(".VPNavBarAppearance .VPSwitchAppearance");
  check(Boolean(desktopSwitch), "appearance: default desktop VitePress switch is missing");
  await desktopSwitch?.click();
  check(await desktop.evaluate(() => !document.documentElement.classList.contains("dark")), "appearance: default desktop switch did not toggle");
  await desktop.close();

  const mobile = await createPage(browser, { width: 390, theme: "dark", system: "dark" });
  await mobile.goto(base, { waitUntil: "networkidle0" });
  await mobile.click(".hamburger");
  await new Promise((done) => setTimeout(done, 400));
  const mobileSwitch = await mobile.$(".VPNavScreenAppearance .VPSwitchAppearance");
  check(Boolean(mobileSwitch), "appearance: default mobile VitePress switch is missing");
  await mobileSwitch?.evaluate((element) => element.click());
  check(await mobile.evaluate(() => !document.documentElement.classList.contains("dark")), "appearance: default mobile switch did not toggle");
  await mobile.close();
}

async function auditLayout(browser) {
  const routes = ["/", "/lessons/00-ghostty-overview", "/lessons/01-terminal-relationship", "/course-map", "/source?path=src/App.zig&line=1&end=4", "/missing-audit-page"];
  for (const theme of ["light", "dark"]) {
    for (const width of [390, 420, 768, 1024, 1440]) {
      for (const route of routes) {
        const page = await createPage(browser, { width, theme });
        await page.goto(`${base}${route}`, { waitUntil: "networkidle0" });
        const state = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          main: Boolean(document.querySelector("main, .VPDoc, .NotFound"))
        }));
        check(state.scrollWidth <= state.viewport, `${theme} ${width}px ${route}: horizontal overflow ${state.scrollWidth - state.viewport}px`);
        check(state.main, `${theme} ${width}px ${route}: main content missing`);
        await page.close();
      }
    }
  }
}

async function auditControls(browser) {
  const orientation = await createPage(browser, { width: 1280, theme: "dark" });
  await orientation.goto(`${base}/lessons/00-ghostty-overview`, { waitUntil: "networkidle0" });
  await orientation.evaluate(() => [...document.querySelectorAll(".architecture-node")].find((element) => element.textContent.includes("GPU")).click());
  check(await orientation.$eval(".architecture-detail h3", (element) => element.textContent === "GPU renderer"), "architecture: layer selection failed");
  check(await orientation.$eval('.architecture-node[aria-selected="true"]', (element) => element.textContent.includes("GPU")), "architecture: selected tab semantics failed");
  await orientation.close();

  const page = await createPage(browser, { width: 1280, theme: "dark" });
  await page.goto(`${base}/lessons/01-terminal-relationship`, { waitUntil: "networkidle0" });
  const controls = await page.evaluate(() => {
    const custom = [...document.querySelectorAll(".lesson-progress button, .ai-copy-menu button, .ai-copy-menu summary, .prediction-card button, .lab-runner button, .byte-workbench button, .byte-workbench input, .byte-workbench textarea, .evidence-notebook button, .evidence-notebook textarea")].filter((element) => getComputedStyle(element).display !== "none" && element.getClientRects().length > 0 && !element.closest("details:not([open])") && !element.disabled);
    return custom.map((element) => {
      const rect = element.getBoundingClientRect();
      const name = (element.getAttribute("aria-label") || element.getAttribute("title") || element.closest("label")?.querySelector(":scope > span")?.textContent || element.textContent || "").trim();
      element.focus();
      const style = getComputedStyle(element);
      return { name, width: rect.width, height: rect.height, outlineWidth: parseFloat(style.outlineWidth), outlineStyle: style.outlineStyle };
    });
  });
  check(controls.every((control) => control.name), "controls: one or more custom controls have no accessible name");
  check(controls.filter((control) => control.height > 0).every((control) => control.height >= 40), "controls: one or more mission controls are below 40px high");
  check(controls.every((control) => control.outlineStyle !== "none" && control.outlineWidth >= 2), "controls: custom focus-visible outline is missing");

  await page.click(".prediction-actions .reveal");
  check(await page.$eval(".prediction-actions .reveal", (element) => element.getAttribute("aria-expanded") === "true"), "prediction: reveal state is not announced");
  await page.click(".lab-title button");
  await page.waitForSelector(".lab-runner pre");
  check(await page.$eval(".lab-runner pre", (element) => element.classList.contains("passed") && element.textContent.includes("stdin is a terminal    yes")), "PTY lab: native comparison did not report a terminal");

  await page.$eval(".byte-workbench textarea", (element) => { element.value = "H and i should occupy green cells zero and one."; element.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.click(".byte-workbench .workbench-lock button");
  await page.click(".byte-workbench .workbench-controls button.primary");
  await page.waitForFunction(() => document.querySelector(".machine-action strong")?.textContent.includes("complete"));
  const terminal = await page.evaluate(() => ({
    cells: [...document.querySelectorAll(".terminal-grid > div")].slice(0, 2).map((element) => ({ text: element.querySelector("span").textContent, className: element.className })),
    events: document.querySelector(".action-log pre")?.textContent.split("\n").length,
    notebooks: document.querySelectorAll(".evidence-notebook").length
  }));
  check(terminal.cells[0].text === "H" && terminal.cells[0].className.includes("green") && terminal.cells[1].text === "i", "byte workbench: SGR/print result is incorrect");
  check(terminal.events === 11, "byte workbench: expected eleven byte events");
  check(terminal.notebooks === 2, "evidence: Lesson 01 should expose two mission notebooks");
  await page.close();

  const reduced = await createPage(browser, { width: 1280, theme: "light", reducedMotion: true });
  await reduced.goto(`${base}/lessons/01-terminal-relationship`, { waitUntil: "networkidle0" });
  await reduced.$eval(".byte-workbench textarea", (element) => { element.value = "Green H and i."; element.dispatchEvent(new Event("input", { bubbles: true })); });
  await reduced.click(".byte-workbench .workbench-lock button");
  await reduced.click(".byte-workbench .workbench-controls button.primary");
  await new Promise((done) => setTimeout(done, 30));
  check(await reduced.$eval(".machine-action strong", (element) => element.textContent.includes("complete")), "reduced motion: byte workbench did not complete immediately");
  await reduced.close();
}

async function auditBrowserPersistence(browser) {
  const page = await createPage(browser, { width: 1280, theme: "light" });
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.removeItem("learn-ghostty.evidence.v2"));
  await page.reload({ waitUntil: "networkidle0" });
  check(Boolean(await page.$(".home-intro")) && !(await page.$(".resume-card")), "first visit: simple introduction or Start state missing");
  check((await page.$$(".roadmap-lesson")).length === 11, "homepage: complete eleven-lesson roadmap missing");

  await page.goto(`${base}/lessons/00-ghostty-overview`, { waitUntil: "networkidle0" });
  await page.$eval("#why-software-still-imitates-old-hardware", (element) => element.scrollIntoView());
  await new Promise((done) => setTimeout(done, 180));
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem("learn-ghostty.evidence.v2")));
  check(saved.lastSectionByLesson["00-ghostty-overview"] === "why-software-still-imitates-old-hardware", "resume: scrolling did not save the current section");

  await page.$eval(".evidence-notebook textarea", (element) => {
    element.value = "Audit claim: a program writes bytes; PTY transport, parsing, state, fonts, and GPU each change the representation.";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.click(".evidence-notebook button.primary");
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem("learn-ghostty.evidence.v2")));
  check(saved.evidence["orientation-map"].complete, "browser evidence: orientation was not saved");
  check(!saved.completedLessons.includes("00-ghostty-overview"), "lesson completion: notebook save incorrectly completed the lesson");

  await page.click(".lesson-progress__actions button");
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem("learn-ghostty.evidence.v2")));
  check(saved.completedLessons.includes("00-ghostty-overview") && saved.currentLesson === "01-terminal-relationship", "lesson completion: explicit action did not advance resume lesson");
  await page.goto(base, { waitUntil: "networkidle0" });
  check(await page.$eval(".resume-card h2", (element) => element.textContent.includes("terminal is a relationship")), "return visit: resume card did not show the last lesson");
  check((await page.$eval(".resume-card a", (element) => element.getAttribute("href"))).includes("01-terminal-relationship"), "return visit: resume link targets the wrong lesson");

  await page.click(".home-progress-tools button.danger");
  check(await page.$eval(".reset-dialog", (element) => element.open), "restart: confirmation dialog did not open");
  check(await page.$eval(".reset-dialog", (element) => element.textContent.includes("Export backup")), "restart: export-before-reset action missing");
  await page.click(".reset-dialog > div button.danger");
  check(!(await page.$(".resume-card")), "restart: returning state remained after reset");
  await page.close();
}

async function auditAiCopy(browser) {
  const page = await createPage(browser, { width: 1280, theme: "light" });
  await page.goto(`${base}/lessons/01-terminal-relationship`, { waitUntil: "networkidle0" });
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { window.__copiedText = value; }, readText: async () => window.__copiedText || "" } }));
  await page.$eval('h2[id*="mission-1"]', (element) => element.scrollIntoView());
  await new Promise((done) => setTimeout(done, 180));
  await page.click(".ai-copy-primary");
  let copied = await page.evaluate(() => window.__copiedText || "");
  check(copied.includes("# Current section") && copied.includes("Begin with a prediction") && copied.includes("# My question"), "Copy for AI: current section Markdown missing");
  check(copied.includes("~/learn-ghostty") && copied.includes("~/ghostty"), "Copy for AI: local agent paths missing");
  check(!copied.includes("learner_notes:"), "Copy for AI: private notes included by default");

  await page.click(".ai-copy-menu summary");
  check((await page.$$(".ai-copy-popover > *")).length === 6, "Copy for AI: expected six menu actions");
  check((await page.$eval('.ai-copy-popover a', (element) => element.getAttribute("href"))).endsWith("/ai/lessons/01-terminal-relationship.md"), "Copy for AI: Markdown view link is incorrect");
  await page.evaluate(() => [...document.querySelectorAll(".ai-copy-popover button")].find((element) => element.textContent.includes("section + my notes")).click());
  copied = await page.evaluate(() => window.__copiedText || "");
  check(copied.includes("learner_notes:"), "Copy for AI: explicit notes action omitted notebook metadata");

  const clean = await (await fetch(`${base}/ai/lessons/01-terminal-relationship.md`)).text();
  check(clean.includes("# The terminal is") && !/<[A-Z][A-Za-z]+/.test(clean), "AI Markdown: generated lesson is missing or contains Vue components");

  await page.$eval(".source-card button", (element) => element.click());
  copied = await page.evaluate(() => window.__copiedText || "");
  check(copied.startsWith("~/ghostty/"), "source action: local ~/ghostty path was not copied");
  await page.evaluate(() => [...document.querySelectorAll(".source-card button")].find((element) => element.textContent.includes("Copy for AI")).click());
  copied = await page.evaluate(() => window.__copiedText || "");
  check(copied.includes("Remote:") && copied.includes("Local") && copied.includes("My question:"), "source action: neutral AI context incomplete");
  await page.close();
}

async function auditSelfContained(browser) {
  const page = await createPage(browser, { width: 1280, theme: "dark" });
  await page.setRequestInterception(true);
  page.on("request", (request) => request.url().includes("/api/") ? request.abort() : request.continue());
  await page.goto(base, { waitUntil: "networkidle0" });
  check(Boolean(await page.$(".home-intro")), "self-contained: homepage depended on local API");
  await page.goto(`${base}/lessons/01-terminal-relationship`, { waitUntil: "networkidle0" });
  await page.click(".lab-title button");
  await page.waitForSelector(".lab-runner pre");
  check(await page.$eval(".lab-runner pre", (element) => element.textContent.includes("/dev/pts/7")), "self-contained: PTY reference trace was unavailable without API");
  await page.close();
}

await ensureServer();
const browser = await puppeteer.launch({ executablePath: await chromePath(), headless: true, args: ["--no-sandbox", "--disable-gpu"] });
await browser.defaultBrowserContext().overridePermissions(base, ["clipboard-read", "clipboard-write"]);
try {
  await auditTheme(browser, "light");
  await auditTheme(browser, "dark");
  await auditSystem(browser);
  await auditFrameworkBoundaries(browser);
  await auditDefaultAppearance(browser);
  await auditLayout(browser);
  await auditControls(browser);
  await auditBrowserPersistence(browser);
  await auditAiCopy(browser);
  await auditSelfContained(browser);
} finally {
  await browser.close();
  if (server) server.kill("SIGTERM");
}

if (failures.length) {
  console.error(`\nUI audit failed (${failures.length}/${checks}):`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
console.log(`✓ UI audit passed ${checks} assertions across themes, routes, widths, interactions, and recovery states`);
