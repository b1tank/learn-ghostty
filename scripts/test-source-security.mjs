import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const api = await readFile(new URL("../server/course-api.mjs", import.meta.url), "utf8");
assert.match(api, /relative\(ghosttyRoot, absolute\)/, "source paths must be checked relative to Ghostty");
assert.match(api, /rel\.startsWith\("\.\."\)/, "parent traversal must be rejected");
assert.doesNotMatch(api, /exec\(/, "course service must not invoke a shell");
console.log("✓ source path and process safety guards are present");
