import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const expectedBase = process.env.LEARN_GHOSTTY_BASE || "/";
const errors = [];

async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (entry.name.endsWith(".html")) result.push(path);
  }
  return result;
}

for (const file of await walk(dist)) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (!value.startsWith("/") || value.startsWith("//")) continue;
    if (expectedBase !== "/" && !value.startsWith(expectedBase)) {
      errors.push(`${file.slice(dist.length + 1)}: ${value} escapes public base ${expectedBase}`);
    }
  }
}

if (errors.length) {
  console.error("Built-link validation failed:\n" + errors.map((error) => `  ✗ ${error}`).join("\n"));
  process.exit(1);
}
console.log(`✓ built internal links stay under ${expectedBase}`);
