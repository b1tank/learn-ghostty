import { createServer } from "node:http";
import { access, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import puppeteer from "puppeteer-core";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const mode = process.env.AUDIT_MODE === "quick" ? "quick" : "full";
const failures = [];
let checks = 0;
let server;
let base = process.env.COURSE_URL;

function check(ok, message) {
  checks++;
  if (!ok) failures.push(message);
}

async function chromePath() {
  for (const path of [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean)) {
    try { await access(path); return path; } catch {}
  }
  throw new Error("Chrome required");
}

async function startStaticServer() {
  if (base) return;
  try { await access(resolve(dist, "index.html")); }
  catch { throw new Error("Built course not found. Run `npm run build` before `npm run audit:ui`."); }

  const mime = { ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".md": "text/markdown" };
  server = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url, "http://local").pathname);
      pathname = pathname.replace(/^\/learn-ghostty(?=\/|$)/, "") || "/";
      if (pathname.includes("..")) throw new Error("invalid path");
      let file = resolve(dist, `.${pathname}`);
      if (!extname(file)) file = resolve(file, "index.html");
      const body = await readFile(file);
      response.writeHead(200, { "content-type": mime[extname(file)] || "text/html" });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${server.address().port}`;
}

async function visit(page, route, selector = "main") {
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForSelector(selector);
}

async function waitForHydration(page, selector) {
  await page.waitForFunction((target) => {
    const element = document.querySelector(target);
    return element && !element.closest("astro-island")?.hasAttribute("ssr");
  }, {}, selector);
}

await startStaticServer();
const browser = await puppeteer.launch({ executablePath: await chromePath(), headless: true, args: ["--no-sandbox", "--disable-gpu"] });
try {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => localStorage.setItem("starlight-theme", "dark"));
  await page.setViewport({ width: 390, height: 844 });
  await visit(page, "/chapters/06-termio", ".syntax-bridge");
  await waitForHydration(page, ".syntax-bridge");

  const mobile = await page.evaluate(() => ({
    fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    bridgeFits: document.querySelector(".syntax-bridge").scrollWidth <= document.querySelector(".syntax-bridge").clientWidth,
    cSelected: document.querySelector('.syntax-bridge__languages [role="tab"]')?.getAttribute("aria-selected") === "true",
    hasMemory: Boolean(document.querySelector(".syntax-bridge__memory")),
    hasTextEquivalent: document.body.textContent.includes("Text version"),
  }));
  check(mobile.fits && mobile.bridgeFits, "mobile SyntaxBridge overflows the page");
  check(mobile.cSelected && mobile.hasMemory && mobile.hasTextEquivalent, "mobile SyntaxBridge is missing its C-first, memory, or text contract");

  const pointBefore = await page.$eval('.syntax-bridge__points [aria-selected="true"]', (element) => element.textContent.trim());
  await page.focus('.syntax-bridge__points [aria-selected="true"]');
  await page.keyboard.press("ArrowRight");
  check(await page.$eval('.syntax-bridge__points [aria-selected="true"]', (element) => element.textContent.trim()) !== pointBefore, "line explanations are not keyboard operable");
  await page.focus('.syntax-bridge__languages [aria-selected="true"]');
  await page.keyboard.press("ArrowRight");
  check(await page.$eval('.syntax-bridge__languages [aria-selected="true"]', (element) => element.textContent.trim()) === "TypeScript", "optional language tabs are not keyboard operable");

  if (mode === "full") {
    await page.setViewport({ width: 1280, height: 900 });
    await visit(page, "/chapters/00-process-exists", ".ai-copy-primary");
    await waitForHydration(page, ".syntax-bridge");
    await waitForHydration(page, ".lesson-progress");
    const chapter = await page.evaluate(() => {
      const menu = document.querySelector(".ai-copy-menu");
      const primary = menu.querySelector(".ai-copy-primary").getBoundingClientRect();
      const trigger = menu.querySelector(".ai-copy-trigger").getBoundingClientRect();
      const cards = [...document.querySelectorAll(".local-setup__modes > section")].map((element) => element.getBoundingClientRect());
      return {
        output: document.querySelector(".output-preview")?.textContent.includes("ghostty-from-scratch: hello"),
        snapshots: document.querySelectorAll(".code-snapshot").length,
        copyJoined: Math.abs(primary.right - trigger.left) <= 1,
        cardsAligned: cards.length === 2 && Math.abs(cards[0].height - cards[1].height) <= 1,
      };
    });
    check(chapter.output && chapter.snapshots === 2, "Chapter 00 lost its exact output or source snapshots");
    check(chapter.copyJoined && chapter.cardsAligned, "primary lesson controls regressed");

    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { window.__copy = value; } } }));
    await page.click(".ai-copy-primary");
    await page.waitForFunction(() => Boolean(window.__copy));
    check(await page.evaluate(() => window.__copy.includes("# Current section") && window.__copy.includes("# My question")), "Copy for AI context is incomplete");

    await page.evaluate(() => localStorage.removeItem("learn-ghostty.progress.v5"));
    await page.click(".lesson-progress__actions button");
    check(await page.evaluate(() => JSON.parse(localStorage.getItem("learn-ghostty.progress.v5"))?.currentLesson === "01-app-lifecycle"), "lesson completion did not advance progress");

    await visit(page, "/", "main");
    await page.waitForSelector(".reconstruction-resume");
    check((await page.$eval(".reconstruction-resume", (element) => element.textContent)).includes("App owns the lifetime"), "homepage did not resume the next chapter");
    await page.click('button[aria-label="Search"]');
    check(await page.$eval("dialog[open]", (element) => element.open), "search dialog did not open");

    const markdown = await Promise.all(Array.from({ length: 11 }, (_, index) => fetch(`${base}/ai/lessons/${String(index).padStart(2, "0")}-${[
      "process-exists", "app-lifecycle", "entry-routing", "runtime-surface", "child-process-pipes", "pty", "termio", "parser", "terminal-state", "first-window-gpu", "first-rectangle",
    ][index]}.md`).then((response) => response.text())));
    check(markdown.every((text) => text.includes("**Text version:**") && !/<[A-Z][A-Za-z]+/.test(text)), "AI Markdown lost a syntax text equivalent or contains component markup");
  }

  await page.close();
} finally {
  await browser.close();
  if (server) await new Promise((done) => server.close(done));
}

if (failures.length) {
  console.error(`UI audit failed (${failures.length}/${checks})\n` + failures.map((failure) => `  ✗ ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Astro UI ${mode} audit passed ${checks} critical assertions`);
