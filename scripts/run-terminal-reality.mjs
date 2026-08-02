import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "labs/c/terminal-reality/main.c");
const buildDir = resolve(root, ".course-build");
const binary = resolve(buildDir, "terminal-reality");
mkdirSync(buildDir, { recursive: true });

const compiler = process.env.CC || "cc";
const compile = spawnSync(compiler, ["-std=c11", "-Wall", "-Wextra", "-Werror", source, "-o", binary], { encoding: "utf8" });
if (compile.status !== 0) {
  process.stderr.write(compile.stderr || `Unable to compile with ${compiler}\n`);
  process.exit(compile.status || 1);
}

function run(label, command, args) {
  console.log(`\n── ${label} ${"─".repeat(Math.max(1, 55 - label.length))}`);
  const result = spawnSync(command, args, { encoding: "utf8", env: { ...process.env, LC_ALL: "C" } });
  process.stdout.write((result.stdout || "").replaceAll("\r", ""));
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `${command} failed\n`);
    process.exit(result.status || 1);
  }
}

console.log("TERMINAL RELATIONSHIP PROBE");
console.log("The same C program runs twice. Only its connection changes.");
run("A · ordinary captured process", binary, []);
run("B · process inside a new PTY", "script", ["-q", "-e", "-c", binary, "/dev/null"]);
console.log("\nQuestion: which fields changed, and which changed together?");
