import { execFile } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const statePath = resolve(root, "learner/state.json");
const manifestPath = resolve(root, "course/manifest.json");
const validStatuses = new Set(["not_started", "in_progress", "completed"]);
const maxOutput = 32 * 1024;

async function json(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 64 * 1024) throw new Error("request body too large");
  }
  return body ? JSON.parse(body) : {};
}

function send(res, status, value) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(value));
}

async function writeState(next) {
  const temp = `${statePath}.tmp`;
  await writeFile(temp, `${JSON.stringify(next, null, 2)}\n`);
  await rename(temp, statePath);
}

function run(command, args, cwd, timeoutSeconds) {
  return new Promise((resolveRun) => {
    const child = execFile(command, args, {
      cwd,
      timeout: timeoutSeconds * 1000,
      maxBuffer: maxOutput,
      env: { ...process.env, NO_COLOR: "1" },
    }, (error, stdout, stderr) => {
      resolveRun({
        ok: !error,
        code: error?.code ?? 0,
        output: `${stdout}${stderr}`.slice(0, maxOutput),
      });
    });
    child.stdin?.end();
  });
}

function installCourseApi(middlewares) {
  middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        try {
          const url = new URL(req.url, "http://127.0.0.1");
          if (req.method === "GET" && url.pathname === "/api/health") {
            return send(res, 200, { ok: true, service: "learn-ghostty" });
          }
          if (req.method === "GET" && url.pathname === "/api/course") {
            return send(res, 200, { manifest: await json(manifestPath), state: await json(statePath) });
          }
          if (req.method === "POST" && url.pathname === "/api/progress") {
            const input = await readBody(req);
            const state = await json(statePath);
            const manifest = await json(manifestPath);
            const lesson = manifest.lessons.find((item) => item.id === input.lessonId);
            if (!lesson) return send(res, 404, { error: "unknown lesson" });
            if (input.status && !validStatuses.has(input.status)) {
              return send(res, 400, { error: "invalid lesson status" });
            }
            const current = state.lessons[input.lessonId] ?? {
              status: "not_started", completion: 0, mastery: 0, confidence: 0, completedSteps: [],
            };
            const completedSteps = input.step
              ? [...new Set([...current.completedSteps, input.step])]
              : current.completedSteps;
            const nextLesson = {
              ...current,
              status: input.status ?? (current.status === "not_started" ? "in_progress" : current.status),
              completion: Number.isFinite(input.completion) ? Math.max(0, Math.min(100, input.completion)) : current.completion,
              mastery: Number.isFinite(input.mastery) ? Math.max(0, Math.min(100, input.mastery)) : current.mastery,
              confidence: Number.isFinite(input.confidence) ? Math.max(0, Math.min(5, input.confidence)) : current.confidence,
              completedSteps,
            };
            const now = new Date().toISOString();
            state.currentLesson = input.lessonId;
            state.currentStep = input.nextStep ?? input.step ?? state.currentStep;
            state.startedAt ??= now;
            state.updatedAt = now;
            state.lessons[input.lessonId] = nextLesson;
            state.activity = [{ at: now, lessonId: input.lessonId, event: input.event ?? `completed ${input.step ?? "progress"}` }, ...state.activity].slice(0, 20);
            await writeState(state);
            return send(res, 200, { ok: true, state });
          }
          const labMatch = url.pathname.match(/^\/api\/labs\/([a-z0-9-]+)\/run$/);
          if (req.method === "POST" && labMatch) {
            const manifest = await json(manifestPath);
            const lab = manifest.labs[labMatch[1]];
            if (!lab) return send(res, 404, { error: "unknown lab" });
            const [command, ...args] = lab.run;
            const result = await run(command, args, resolve(root, lab.cwd), lab.timeoutSeconds ?? 20);
            return send(res, result.ok ? 200 : 500, result);
          }
          return send(res, 404, { error: "unknown course API route" });
        } catch (error) {
          return send(res, 500, { error: error.message });
        }
  });
}

export function courseApiPlugin() {
  return {
    name: "learn-ghostty-course-api",
    configureServer(server) {
      installCourseApi(server.middlewares);
    },
    configurePreviewServer(server) {
      installCourseApi(server.middlewares);
    },
  };
}
