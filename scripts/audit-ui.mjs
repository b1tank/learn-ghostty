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
  const routes = ["/", "/course-map", "/chapters/00-process-exists", "/chapters/01-app-lifecycle", "/chapters/02-entry-routing", "/chapters/03-runtime-surface", "/chapters/04-child-process-pipes", "/chapters/05-pty", "/chapters/06-termio", "/chapters/07-parser", "/chapters/08-terminal-state", "/chapters/09-first-window-gpu", "/chapters/10-first-rectangle", "/field-guides/run-ls-cat", "/field-guides/codex-tui", "/field-guides/tmux", "/field-guides/ssh-remote", "/zig-for-c", "/history", "/source"];
  for (const theme of ["light", "dark"]) for (const width of [390, 768, 1440]) for (const route of routes) {
    const page = await newPage(browser, width, theme);
    await page.goto(base + route, { waitUntil: "networkidle0" });
    const state = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      main: Boolean(document.querySelector("main")),
      localSetup: Boolean(document.querySelector(".local-setup")),
      externalLinksSafe: [...document.querySelectorAll("a[href]")].filter((link) => {
        const url = new URL(link.href, location.href);
        return ["http:", "https:"].includes(url.protocol) && url.origin !== location.origin;
      }).every((link) => link.target === "_blank" && link.relList.contains("noopener") && link.relList.contains("noreferrer")),
      copyControlJoined: [...document.querySelectorAll(".ai-copy-menu")].every((menu) => {
        const primary = menu.querySelector(".ai-copy-primary");
        const trigger = menu.querySelector(".ai-copy-trigger");
        if (!primary || !trigger) return false;
        const primaryRect = primary.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const primaryStyle = getComputedStyle(primary);
        const triggerStyle = getComputedStyle(trigger);
        return Math.abs(primaryRect.right - triggerRect.left) <= 1
          && parseFloat(primaryStyle.borderTopRightRadius) === 0
          && parseFloat(primaryStyle.borderBottomRightRadius) === 0
          && parseFloat(triggerStyle.borderTopLeftRadius) === 0
          && parseFloat(triggerStyle.borderBottomLeftRadius) === 0
          && parseFloat(triggerStyle.borderLeftWidth) === 0;
      }),
      actionRowsAligned: [
        ".lesson-progress__actions", ".source-card__actions", ".source-actions", ".reconstruction-next__actions",
        ".flow-footer", ".commit-nav", ".commit-actions", ".commit-error > div",
      ].flatMap((selector) => [...document.querySelectorAll(selector)]).every((group) => {
        const controls = [...group.children].filter((element) => element.matches("a, button, .ai-copy-menu") && element.getClientRects().length).map((element) => element.getBoundingClientRect());
        if (controls.length < 2) return true;
        const sameHeight = Math.max(...controls.map((rect) => rect.height)) - Math.min(...controls.map((rect) => rect.height)) <= 1;
        const rowTops = controls.reduce((rows, rect) => {
          const row = rows.find((candidate) => Math.abs(candidate[0].top - rect.top) <= 1);
          (row || rows[rows.push([]) - 1]).push(rect);
          return rows;
        }, []);
        return sameHeight && rowTops.every((row) => Math.max(...row.map((rect) => rect.top)) - Math.min(...row.map((rect) => rect.top)) <= 1);
      }),
      repeatedCardsAligned: [".reconstruction-promise", ".local-setup__modes", ".platform-branch", ".process-birth__flow", ".evolution-strip ol"].flatMap((selector) => [...document.querySelectorAll(selector)]).every((grid) => {
        const cards = [...grid.children].filter((element) => element.getClientRects().length).map((element) => element.getBoundingClientRect());
        const rows = cards.reduce((groups, rect) => {
          const row = groups.find((candidate) => Math.abs(candidate[0].top - rect.top) <= 1);
          (row || groups[groups.push([]) - 1]).push(rect);
          return groups;
        }, []);
        return rows.every((row) => row.length < 2 || (Math.max(...row.map((rect) => rect.top)) - Math.min(...row.map((rect) => rect.top)) <= 1 && Math.max(...row.map((rect) => rect.height)) - Math.min(...row.map((rect) => rect.height)) <= 1));
      }),
      repeatedCardsHaveIcons: [".reconstruction-promise > div", ".local-setup__modes > section"].flatMap((selector) => [...document.querySelectorAll(selector)]).filter((element) => element.getClientRects().length).every((element) => Boolean(element.querySelector("svg"))),
      repeatedActionsHaveIcons: [
        ".lesson-progress__actions > a", ".lesson-progress__actions > button", ".ai-copy-menu > button",
        ".source-card__actions > a", ".source-card__actions > button", ".source-actions > a", ".source-actions > button",
        ".reconstruction-next__actions > a", ".field-guides-preview__link", ".flow-header__controls > button",
        ".flow-footer > button", ".commit-nav > button", ".commit-actions > a", ".commit-actions > button",
        ".evolution-strip li a", ".roadmap-lesson > b",
      ].flatMap((selector) => [...document.querySelectorAll(selector)]).filter((element) => element.getClientRects().length).every((element) => Boolean(element.querySelector("svg, .ai-copy-icon"))),
      syntaxBridges: [...document.querySelectorAll(".syntax-bridge")].map((element) => ({
        fits: element.scrollWidth <= element.clientWidth,
        cSelected: element.querySelector('.syntax-bridge__languages [role="tab"]')?.getAttribute("aria-selected") === "true",
        points: element.querySelectorAll('.syntax-bridge__points [role="tab"]').length,
        focusedLines: element.querySelectorAll('.syntax-bridge__code button[aria-pressed="true"]').length,
        hasTextEquivalent: (element.closest("astro-island")?.nextElementSibling ?? element.nextElementSibling)?.textContent?.includes("Text version") ?? false,
        reference: element.querySelector(".syntax-bridge__reference")?.getAttribute("href") ?? "",
      })),
    }));
    check(state.scroll <= state.viewport, `${theme} ${width}px ${route}: horizontal overflow ${state.scroll - state.viewport}px`);
    check(state.main, `${route}: main missing`);
    if (route.startsWith("/chapters/")) check(state.localSetup, `${route}: local lesson setup missing`);
    check(state.externalLinksSafe, `${route}: external links must open safely in a new tab`);
    check(state.copyControlJoined, `${theme} ${width}px ${route}: Copy for AI split button has a rounded or doubled middle seam`);
    check(state.actionRowsAligned, `${theme} ${width}px ${route}: consecutive controls are vertically misaligned`);
    check(state.repeatedCardsAligned, `${theme} ${width}px ${route}: repeated cards do not share row geometry`);
    check(state.repeatedCardsHaveIcons, `${theme} ${width}px ${route}: a repeated card is missing its functional icon`);
    check(state.repeatedActionsHaveIcons, `${theme} ${width}px ${route}: a repeated action is missing its functional icon`);
    if (/^\/chapters\/(?:0\d|10)-/.test(route)) {
      check(state.syntaxBridges.length === 1, `${theme} ${width}px ${route}: expected one syntax bridge`);
      check(state.syntaxBridges.every((bridge) => bridge.fits && bridge.cSelected && bridge.points >= 3 && bridge.focusedLines >= 1 && bridge.hasTextEquivalent), `${theme} ${width}px ${route}: syntax bridge is incomplete or overflows`);
      check(state.syntaxBridges.every((bridge) => /\/zig-for-c\/#[-a-z]+$/.test(bridge.reference)), `${theme} ${width}px ${route}: syntax bridge lacks a scoped cumulative-reference link`);
    }
    await page.close();
  }

  const syntaxRoutes = routes.filter((route) => /^\/chapters\/(?:0\d|10)-/.test(route));
  for (const route of syntaxRoutes) {
    const page = await newPage(browser, 1280, "dark");
    await page.goto(base + route, { waitUntil: "networkidle0" });
    const before = await page.$eval('.syntax-bridge__points [role="tab"][aria-selected="true"]', (element) => element.textContent.trim());
    await page.focus('.syntax-bridge__points [role="tab"][aria-selected="true"]');
    await page.keyboard.press("ArrowRight");
    const after = await page.$eval('.syntax-bridge__points [role="tab"][aria-selected="true"]', (element) => element.textContent.trim());
    check(before !== after, `${route}: ArrowRight did not change the line-focused explanation`);
    const languageCount = await page.$$eval('.syntax-bridge__languages [role="tab"]', (elements) => elements.length);
    if (languageCount > 1) {
      await page.focus('.syntax-bridge__languages [role="tab"][aria-selected="true"]');
      await page.keyboard.press("ArrowRight");
      check(await page.$eval('.syntax-bridge__languages [role="tab"][aria-selected="true"]', (element) => element.textContent.trim()) !== "C", `${route}: language tabs are not keyboard operable`);
    } else {
      check(Boolean(await page.$(".syntax-bridge__omission")), `${route}: omitted language tabs need a reason`);
    }
    await page.close();
  }

  const syntaxReference = await newPage(browser, 1280, "dark");
  await syntaxReference.goto(base + "/zig-for-c", { waitUntil: "networkidle0" });
  const syntaxReferenceState = await syntaxReference.evaluate(() => ({
    heading: document.querySelector("h1")?.textContent?.trim(),
    version: document.querySelector("main")?.textContent?.includes("Zig 0.16.0"),
    quickRows: document.querySelectorAll(".sl-markdown-content table:first-of-type tbody tr").length,
    trapRows: document.querySelectorAll(".sl-markdown-content table:last-of-type tbody tr").length,
    sections: ["declarations-and-inference", "allocation-and-explicit-lifetime", "compile-time-selection", "pointers-addresses-and-optionals", "arrays-slices-and-ownership", "control-flow-and-payload-capture", "literals-structs-and-enums", "c-abi-boundaries"].every((id) => Boolean(document.getElementById(id))),
    chapters: new Set([...document.querySelectorAll('a[href*="/chapters/"]')].map((link) => new URL(link.href).pathname.match(/\/chapters\/([^/]+)/)?.[1]).filter(Boolean)).size,
    inTools: [...document.querySelectorAll("nav a, .sidebar-content a")].some((link) => new URL(link.href, location.href).pathname.endsWith("/zig-for-c/")),
  }));
  check(syntaxReferenceState.heading === "Zig for C programmers", "Zig/C reference heading changed unexpectedly");
  check(syntaxReferenceState.version && syntaxReferenceState.quickRows === 24 && syntaxReferenceState.trapRows === 9, "Zig/C reference is missing its versioned lookup or C-trap coverage");
  check(syntaxReferenceState.sections && syntaxReferenceState.chapters === 11 && syntaxReferenceState.inTools, "Zig/C reference is missing section anchors, chapter provenance, or Tools navigation");
  await syntaxReference.close();

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
    promiseIcons: document.querySelectorAll(".reconstruction-promise .sequence-card__icon svg").length,
  }));
  check(homeState.heading === "Rebuild Ghostty. Understand every piece.", "homepage hero changed unexpectedly");
  check(homeState.promises === 3 && homeState.frontier === 7 && homeState.current === 1, "homepage reconstruction path is incomplete");
  check(homeState.promiseIcons === 3, "homepage sequence cards are missing functional icons");
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
  const copyNoticeLayout = await chapter.evaluate(() => {
    const notice = document.querySelector(".ai-copy-notice:not(:empty)")?.getBoundingClientRect();
    const menu = document.querySelector(".ai-copy-menu")?.getBoundingClientRect();
    const progress = document.querySelector(".lesson-progress")?.getBoundingClientRect();
    return Boolean(notice && menu && progress && notice.top >= menu.bottom && notice.bottom <= progress.bottom);
  });
  check(copyNoticeLayout, "Copy for AI confirmation overlaps adjacent lesson UI");

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
    next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
  }));
  check(runtimeState.lifetimes === 4 && runtimeState.history === 3 && runtimeState.output, "Chapter 03 is missing runtime lifetimes, history, or output");
  check(runtimeState.next.includes("/chapters/04-child-process-pipes"), "Chapter 03 does not advance to Chapter 04");
  await runtime.close();

  const pipes = await newPage(browser, 1280, "dark");
  await pipes.goto(base + "/chapters/04-child-process-pipes", { waitUntil: "networkidle0" });
  const pipesState = await pipes.evaluate(() => ({
    streams: document.querySelectorAll(".pipe-test dl > div").length,
    history: document.querySelectorAll(".evolution-strip li").length,
    output: document.querySelector(".output-preview")?.textContent?.includes("stdout_tty=no"),
    next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
  }));
  check(pipesState.streams === 3 && pipesState.history === 3 && pipesState.output, "Chapter 04 is missing the pipe experiment, history, or output");
  check(pipesState.next.includes("/chapters/05-pty"), "Chapter 04 does not advance to Chapter 05");
  await pipes.close();

  const pty = await newPage(browser, 1280, "dark");
  await pty.goto(base + "/chapters/05-pty", { waitUntil: "networkidle0" });
  const ptyState = await pty.evaluate(() => ({
    actors: document.querySelectorAll(".pty-map__flow > div").length,
    facts: document.querySelectorAll(".pty-map dl > div").length,
    history: document.querySelectorAll(".evolution-strip li").length,
    output: document.querySelector(".output-preview")?.textContent?.includes("pgrp_equals_foreground=yes"),
    next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
  }));
  check(ptyState.actors === 4 && ptyState.facts === 4 && ptyState.history === 3 && ptyState.output, "Chapter 05 is missing PTY relationships, history, or output");
  check(ptyState.next.includes("/chapters/06-termio"), "Chapter 05 does not advance to Chapter 06");
  await pty.close();

  const termio = await newPage(browser, 1280, "dark");
  await termio.goto(base + "/chapters/06-termio", { waitUntil: "networkidle0" });
  const termioState = await termio.evaluate(() => ({
    stages: document.querySelectorAll(".termio-map li").length,
    history: document.querySelectorAll(".evolution-strip li").length,
    output: document.querySelector(".output-preview")?.textContent?.includes("[termio read reply]"),
    next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
  }));
  check(termioState.stages === 6 && termioState.history === 3 && termioState.output, "Chapter 06 is missing Termio ownership, history, or output");
  check(termioState.next.includes("/chapters/07-parser"), "Chapter 06 does not advance to Chapter 07");
  await termio.close();

  const parser = await newPage(browser, 1280, "dark");
  await parser.goto(base + "/chapters/07-parser", { waitUntil: "networkidle0" });
  const parserState = await parser.evaluate(() => ({
    states: document.querySelectorAll(".parser-map__states > div").length,
    history: document.querySelectorAll(".evolution-strip li").length,
    output: document.querySelector(".output-preview")?.textContent?.includes("[parser sgr] 32"),
    next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
  }));
  check(parserState.states === 4 && parserState.history === 3 && parserState.output, "Chapter 07 is missing parser states, history, or output");
  check(parserState.next.includes("/chapters/08-terminal-state"), "Chapter 07 does not advance to Chapter 08");
  await parser.close();

  const terminal = await newPage(browser, 1280, "dark");
  await terminal.goto(base + "/chapters/08-terminal-state", { waitUntil: "networkidle0" });
  const terminalState = await terminal.evaluate(() => ({
    rows: document.querySelectorAll(".terminal-grid .row").length,
    cells: document.querySelectorAll(".terminal-grid .row i").length,
    green: document.querySelectorAll(".terminal-grid .row i.green").length,
    history: document.querySelectorAll(".evolution-strip li").length,
    output: document.querySelector(".output-preview")?.textContent?.includes("[terminal cursor] row=2 col=0"),
    next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
  }));
  check(terminalState.rows === 3 && terminalState.cells === 72 && terminalState.green === 11 && terminalState.history === 3 && terminalState.output, "Chapter 08 is missing terminal cells, styles, history, or output");
  check(terminalState.next.includes("/chapters/09-first-window-gpu"), "Chapter 08 does not advance to Chapter 09");
  await terminal.close();

  const nativeWindow = await newPage(browser, 1280, "dark");
  await nativeWindow.goto(base + "/chapters/09-first-window-gpu", { waitUntil: "networkidle0" });
  const nativeState = await nativeWindow.evaluate(() => {
    const image = document.querySelector(".native-artifact img");
    return {
      image: image?.complete && image.naturalWidth === 1280 && image.naturalHeight === 800,
      metadata: document.querySelectorAll(".native-artifact dl > div").length,
      history: document.querySelectorAll(".evolution-strip li").length,
      output: document.querySelector(".output-preview")?.textContent?.includes("[gtk] window presented 900x600"),
      next: document.querySelector('a[rel="next"]')?.getAttribute("href") ?? "",
    };
  });
  check(nativeState.image && nativeState.metadata === 4 && nativeState.history === 3 && nativeState.output, "Chapter 09 is missing its real screenshot, metadata, history, or output");
  check(nativeState.next.includes("/chapters/10-first-rectangle"), "Chapter 09 does not advance to Chapter 10");
  await nativeWindow.close();

  const rectangle = await newPage(browser, 1280, "dark");
  await rectangle.goto(base + "/chapters/10-first-rectangle", { waitUntil: "networkidle0" });
  const rectangleState = await rectangle.evaluate(() => {
    const image = document.querySelector(".rect-art img");
    return {
      image: image?.complete && image.naturalWidth === 1280 && image.naturalHeight === 800,
      metadata: document.querySelectorAll(".rect-art dl > div").length,
      history: document.querySelectorAll(".evolution-strip li").length,
      output: document.querySelector(".output-preview")?.textContent?.includes("[gl] rectangle x=225"),
      next: Boolean(document.querySelector('a[rel="next"]')),
    };
  });
  check(rectangleState.image && rectangleState.metadata === 3 && rectangleState.history === 3 && rectangleState.output, "Chapter 10 is missing rectangle evidence, metadata, history, or output");
  check(!rectangleState.next, "Chapter 10 should stop at the current published frontier");
  await rectangle.close();

  const history = await newPage(browser, 1280, "dark");
  await history.goto(base + "/history", { waitUntil: "networkidle0" });
  await history.waitForSelector(".diff-files details");
  const historyState = await history.evaluate(() => ({
    count: document.querySelectorAll(".commit-list li").length,
    firstSha: document.querySelector(".commit-heading code")?.textContent?.trim(),
    firstSubject: document.querySelector(".commit-heading h2")?.textContent?.trim(),
    files: document.querySelectorAll(".diff-files details").length,
    additions: document.querySelectorAll(".diff-line.is-add").length,
    layoutFits: document.querySelector(".commit-explorer").getBoundingClientRect().right <= document.documentElement.clientWidth,
    panelTopDelta: Math.abs(document.querySelector(".commit-browser").getBoundingClientRect().top - document.querySelector(".commit-detail").getBoundingClientRect().top),
    controlHeights: [...document.querySelectorAll(".commit-actions :is(button, a), .commit-nav button")].map((element) => element.getBoundingClientRect().height),
  }));
  check(historyState.count === 80 && historyState.firstSha === "f8b0000444663ade13d75e1e703bbad3cfdd1ce2" && historyState.firstSubject === "Initial", "history viewer does not begin at Ghostty's first commit");
  check(historyState.files === 9 && historyState.additions === 196 && historyState.layoutFits, "history viewer did not render the complete initial diff or fit its container");
  check(historyState.panelTopDelta < 1 && Math.max(...historyState.controlHeights) - Math.min(...historyState.controlHeights) < 1, "history panels or controls are visibly misaligned");
  await history.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { window.__historyCopy = value; } } }));
  await history.click(".commit-copy-ai");
  const historyCopy = await history.evaluate(() => window.__historyCopy || "");
  check(historyCopy.includes("Every hunk") && historyCopy.includes("Complete diff:") && historyCopy.includes("diff --git a/.envrc b/.envrc") && historyCopy.includes("My question:"), "history Copy for ChatGPT context is incomplete");
  await history.click(".commit-copy-diff");
  const rawDiffCopy = await history.evaluate(() => window.__historyCopy || "");
  check(rawDiffCopy.startsWith("diff --git a/.envrc b/.envrc") && rawDiffCopy.includes("@@ -0,0 +1,5 @@") && !rawDiffCopy.includes("Complete diff:") && !rawDiffCopy.includes("My question:"), "history raw copy is not an unmodified git diff");
  check(!await history.$(".commit-actions a[href='https://chatgpt.com/']"), "history viewer includes an unnecessary Open ChatGPT action");
  check((await history.$eval(".commit-copy-ai", (element) => element.textContent.trim())) === "Copy for AI", "history AI copy action has a provider-specific label");
  check(await history.$eval(".commit-actions a[href$='.diff']", (element) => element.target === "_blank" && element.textContent.includes("Raw .diff")), "history raw diff is not an external new-tab link");
  check(await history.$eval(".commit-badge.is-api", (element) => /^API \d+\/\d+$/.test(element.textContent.trim()) && element.title.includes("latest network load")), "history API limit is not shown as a concise, current status badge");
  check(Boolean(await history.$(".commit-badge.is-cached")), "history diff was not reused from the persistent browser cache");
  await history.type(".commit-search input", "remove mach-glfw");
  await history.waitForFunction(() => document.querySelectorAll(".commit-list li").length === 1);
  check((await history.$eval(".commit-list strong", (element) => element.textContent.trim())) === "remove mach-glfw", "history search did not filter commit subjects");
  await history.close();

  const historyLight = await newPage(browser, 1280, "light");
  await historyLight.goto(base + "/history?commit=ca11c63c", { waitUntil: "networkidle0" });
  await historyLight.waitForSelector(".diff-line.is-remove");
  const lightDiff = await historyLight.evaluate(() => {
    const rgb = (value) => value.match(/[\d.]+/g).slice(0, 4).map(Number);
    const luminance = (value) => {
      const channels = rgb(value).slice(0, 3).map((channel) => channel / 255).map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
      return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
    };
    const background = (element) => {
      for (let current = element; current; current = current.parentElement) {
        const value = getComputedStyle(current).backgroundColor;
        const channels = rgb(value);
        if (channels.length < 4 || channels[3] !== 0) return value;
      }
      return "rgb(255, 255, 255)";
    };
    const contrast = (selector) => {
      const element = document.querySelector(selector);
      const foreground = luminance(getComputedStyle(element).color);
      const behind = luminance(background(element));
      return (Math.max(foreground, behind) + .05) / (Math.min(foreground, behind) + .05);
    };
    return {
      surfaceLuminance: luminance(getComputedStyle(document.querySelector(".diff-files")).backgroundColor),
      contrasts: [".diff-line.is-context", ".diff-line.is-add", ".diff-line.is-remove", ".diff-line.is-hunk", ".diff-line.is-meta"].map(contrast),
    };
  });
  check(lightDiff.surfaceLuminance >= .85 && lightDiff.contrasts.every((ratio) => ratio >= 4.5), "light theme diff colors do not meet readable contrast");
  await historyLight.close();

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
  const pipesMarkdown = await (await fetch(base + "/ai/lessons/04-child-process-pipes.md")).text();
  check(pipesMarkdown.includes("stdout_tty=no") && pipesMarkdown.includes("src/Command.zig") && !/<[A-Z][A-Za-z]+/.test(pipesMarkdown), "Chapter 04 AI Markdown is invalid");
  const ptyMarkdown = await (await fetch(base + "/ai/lessons/05-pty.md")).text();
  check(ptyMarkdown.includes("stdin_tty=yes") && ptyMarkdown.includes("src/pty.zig") && !/<[A-Z][A-Za-z]+/.test(ptyMarkdown), "Chapter 05 AI Markdown is invalid");
  const termioMarkdown = await (await fetch(base + "/ai/lessons/06-termio.md")).text();
  check(termioMarkdown.includes("[termio read reply]") && termioMarkdown.includes("src/termio/Termio.zig") && !/<[A-Z][A-Za-z]+/.test(termioMarkdown), "Chapter 06 AI Markdown is invalid");
  const parserMarkdown = await (await fetch(base + "/ai/lessons/07-parser.md")).text();
  check(parserMarkdown.includes("[parser sgr] 32") && parserMarkdown.includes("src/terminal/Parser.zig") && !/<[A-Z][A-Za-z]+/.test(parserMarkdown), "Chapter 07 AI Markdown is invalid");
  const terminalMarkdown = await (await fetch(base + "/ai/lessons/08-terminal-state.md")).text();
  check(terminalMarkdown.includes("[terminal cursor] row=2 col=0") && terminalMarkdown.includes("src/terminal/Terminal.zig") && !/<[A-Z][A-Za-z]+/.test(terminalMarkdown), "Chapter 08 AI Markdown is invalid");
  const nativeMarkdown = await (await fetch(base + "/ai/lessons/09-first-window-gpu.md")).text();
  check(nativeMarkdown.includes("[gtk] window presented 900x600") && nativeMarkdown.includes("src/apprt/gtk.zig") && !/<[A-Z][A-Za-z]+/.test(nativeMarkdown), "Chapter 09 AI Markdown is invalid");
  const rectangleMarkdown = await (await fetch(base + "/ai/lessons/10-first-rectangle.md")).text();
  check(rectangleMarkdown.includes("[gl] rectangle x=225") && rectangleMarkdown.includes("src/apprt/gtk_shim.c") && !/<[A-Z][A-Za-z]+/.test(rectangleMarkdown), "Chapter 10 AI Markdown is invalid");
  for (const [index, lessonMarkdown] of [markdown, lifecycleMarkdown, routingMarkdown, runtimeMarkdown, pipesMarkdown, ptyMarkdown, termioMarkdown, parserMarkdown, terminalMarkdown, nativeMarkdown, rectangleMarkdown].entries()) {
    check(lessonMarkdown.includes("**Text version:**") && lessonMarkdown.includes("C"), `Chapter ${String(index).padStart(2, "0")} AI Markdown is missing the syntax bridge text equivalent`);
  }

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
