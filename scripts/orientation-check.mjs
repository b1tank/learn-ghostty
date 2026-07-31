import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const commit = execFileSync("git", ["-C", "ghostty", "rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const expected = JSON.parse(await readFile("course/manifest.json", "utf8")).course.sourceCommit;

if (commit !== expected) {
  console.error(`✗ Ghostty is at ${commit}, expected ${expected}`);
  process.exit(1);
}

console.log("✓ Pinned Ghostty source is present");
console.log(`  commit  ${commit.slice(0, 12)}`);
console.log("\nA first map of the shared core:");
console.log("  src/main_ghostty.zig  process entry and runtime startup");
console.log("  src/App.zig           application-level shared state");
console.log("  src/Surface.zig       one terminal session and its threads");
console.log("  src/terminal/         bytes become durable terminal state");
console.log("  src/renderer/         terminal state becomes GPU work");
console.log("  src/apprt/            native GTK or embedded runtime boundary");
