import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const chaptersRoot = resolve(root, "src/content/docs/chapters");
const ghosttyRoot = resolve(root, "ghostty");

async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (entry.name.endsWith(".mdx")) result.push(path);
  }
  return result;
}

const commits = new Set();
for (const path of await files(chaptersRoot)) {
  const source = await readFile(path, "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  for (const match of frontmatter.matchAll(/^\s+- commit:\s+([0-9a-f]{40})\s*$/gm)) commits.add(match[1]);
}

const missing = [...commits].filter((commit) => {
  try {
    execFileSync("git", ["-C", ghosttyRoot, "cat-file", "-e", `${commit}^{commit}`], { stdio: "ignore" });
    return false;
  } catch {
    return true;
  }
});

if (missing.length) {
  execFileSync("git", ["-C", ghosttyRoot, "fetch", "--no-tags", "--depth=1", "origin", ...missing], { stdio: "inherit" });
}

console.log(`✓ ${commits.size} historical Ghostty commit${commits.size === 1 ? "" : "s"} available (${missing.length} fetched)`);
