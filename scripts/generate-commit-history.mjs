import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ghosttyRoot = resolve(root, "ghostty");
const output = resolve(root, "public/history/commits.json");
const separator = "\x1f";

let log;
try {
  log = execFileSync("git", [
    "-C", ghosttyRoot,
    "log", "--reverse",
    `--format=%H${separator}%aI${separator}%an${separator}%s`,
  ], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
} catch (error) {
  console.error("Unable to read Ghostty history. Initialize the ghostty submodule and fetch its history first.");
  throw error;
}

const commits = log.trim().split("\n").filter(Boolean).map((line, index) => {
  const [sha, date, author, subject] = line.split(separator);
  return { sha, date, author, subject, number: index + 1 };
});

if (!commits.length) throw new Error("The Ghostty history is empty");
if (commits[0].sha !== "f8b0000444663ade13d75e1e703bbad3cfdd1ce2") {
  throw new Error(`Ghostty history is incomplete: expected the initial commit, found ${commits[0].sha}`);
}

await mkdir(resolve(root, "public/history"), { recursive: true });
await writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), commits })}\n`);
console.log(`✓ wrote ${commits.length.toLocaleString()} Ghostty commits to ${output}`);
