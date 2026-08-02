import { execFile } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ghosttyRoot = resolve(root, "ghostty");
const statePath = resolve(root, "learner/state.json");
const manifestPath = resolve(root, "course/manifest.json");
const evidenceRoot = resolve(root, "learner/evidence");
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

async function writeJsonAtomic(path, next) {
  const temp = `${path}.tmp`;
  await writeFile(temp, `${JSON.stringify(next, null, 2)}\n`);
  await rename(temp, path);
}

async function writeState(next) {
  await writeJsonAtomic(statePath, next);
}

function safeSourcePath(requested) {
  if (typeof requested !== "string" || requested.includes("\0")) throw new Error("invalid source path");
  const absolute = resolve(ghosttyRoot, requested);
  const rel = relative(ghosttyRoot, absolute);
  if (rel.startsWith("..") || rel.includes("/../") || rel === "") throw new Error("source path is outside Ghostty");
  return { absolute, relative: rel };
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
          if (req.method === "GET" && url.pathname === "/api/source") {
            const source = safeSourcePath(url.searchParams.get("path"));
            const content = await readFile(source.absolute, "utf8");
            if (content.length > 512 * 1024) return send(res, 413, { error: "source file is too large for the lesson viewer" });
            const lines = content.split("\n");
            const requestedLine = Number.parseInt(url.searchParams.get("line") ?? "1", 10);
            const line = Number.isFinite(requestedLine) ? Math.max(1, Math.min(lines.length, requestedLine)) : 1;
            const requestedEnd = Number.parseInt(url.searchParams.get("end") ?? `${line}`, 10);
            const end = Number.isFinite(requestedEnd) ? Math.max(line, Math.min(lines.length, requestedEnd)) : line;
            const from = Math.max(1, line - 24);
            const to = Math.min(lines.length, end + 36);
            return send(res, 200, {
              path: source.relative,
              line,
              end,
              from,
              to,
              totalLines: lines.length,
              lines: lines.slice(from - 1, to),
            });
          }
          if (req.method === "POST" && url.pathname === "/api/source/open") {
            const input = await readBody(req);
            const source = safeSourcePath(input.path);
            const line = Number.isInteger(input.line) ? Math.max(1, input.line) : 1;
            const editor = process.env.EDITOR_COMMAND ?? "code";
            const result = await run(editor, ["--goto", `${source.absolute}:${line}`], root, 5);
            return send(res, result.ok ? 200 : 500, result.ok ? { ok: true } : { error: result.output || `unable to launch ${editor}` });
          }
          if (req.method === "GET" && url.pathname === "/api/evidence") {
            const manifest = await json(manifestPath);
            const missionId = url.searchParams.get("missionId");
            if (!manifest.missions.some((mission) => mission.id === missionId)) return send(res, 404, { error: "unknown mission" });
            const path = resolve(evidenceRoot, `${missionId}.json`);
            const evidence = await json(path).catch(() => null);
            return send(res, 200, { missionId, evidence });
          }
          if (req.method === "POST" && url.pathname === "/api/evidence") {
            const input = await readBody(req);
            const manifest = await json(manifestPath);
            const mission = manifest.missions.find((item) => item.id === input.missionId);
            if (!mission) return send(res, 404, { error: "unknown mission" });
            const clean = {};
            for (const field of ["prediction", "observation", "explanation", "sourceInvariant"]) {
              if (input[field] !== undefined) {
                if (typeof input[field] !== "string" || input[field].length > 8000) return send(res, 400, { error: `invalid ${field}` });
                clean[field] = input[field].trim();
              }
            }
            await mkdir(evidenceRoot, { recursive: true });
            const path = resolve(evidenceRoot, `${mission.id}.json`);
            const previous = await json(path).catch(() => ({}));
            const now = new Date().toISOString();
            const evidence = { ...previous, ...clean, missionId: mission.id, updatedAt: now, createdAt: previous.createdAt ?? now };
            const stage = evidence.sourceInvariant ? "traced" : evidence.explanation ? "explained" : evidence.observation ? "observed" : evidence.prediction ? "predicted" : "not_started";
            const complete = mission.evidenceFields.every((field) => Boolean(evidence[field]));
            evidence.stage = stage;
            evidence.complete = complete;
            await writeJsonAtomic(path, evidence);

            const state = await json(statePath);
            const priorStage = state.evidence?.[mission.id]?.stage;
            state.schemaVersion = 2;
            state.currentLesson = mission.lessonId;
            state.currentMission = mission.id;
            state.updatedAt = now;
            state.startedAt ??= now;
            state.evidence ??= {};
            state.evidence[mission.id] = { stage, complete, updatedAt: now };
            const lessonState = state.lessons[mission.lessonId] ?? { status: "in_progress", completedMissions: [] };
            lessonState.status = "in_progress";
            lessonState.completedMissions ??= [];
            if (complete && !lessonState.completedMissions.includes(mission.id)) lessonState.completedMissions.push(mission.id);
            const lesson = manifest.lessons.find((item) => item.id === mission.lessonId);
            if (lesson.missionIds.every((id) => lessonState.completedMissions.includes(id))) lessonState.status = "completed";
            state.lessons[mission.lessonId] = lessonState;
            if (complete) {
              const missionIndex = lesson.missionIds.indexOf(mission.id);
              const nextMissionId = lesson.missionIds[missionIndex + 1];
              if (nextMissionId) {
                state.currentMission = nextMissionId;
                state.currentStep = nextMissionId;
              }
            }
            if (lessonState.status === "completed") {
              const next = manifest.lessons.find((item) => item.order === lesson.order + 1 && item.status === "available");
              if (next) {
                state.lessons[next.id] ??= { status: "not_started", completedMissions: [] };
                if (state.lessons[next.id].status === "locked") state.lessons[next.id].status = "not_started";
                state.currentLesson = next.id;
                state.currentMission = next.missionIds[0];
                state.currentStep = "welcome";
              }
            }
            if (stage !== priorStage) state.activity = [{ at: now, missionId: mission.id, event: `${mission.title}: ${stage}` }, ...(state.activity ?? [])].slice(0, 20);
            await writeState(state);
            return send(res, 200, { ok: true, evidence, state });
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
              status: "not_started", completion: 0, mastery: 0, confidence: 0, completedSteps: [], completedMissions: [],
            };
            current.completedSteps ??= [];
            const stepAlreadyComplete = input.step ? current.completedSteps.includes(input.step) : false;
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
            if (!stepAlreadyComplete) {
              state.activity = [{ at: now, lessonId: input.lessonId, event: input.event ?? `completed ${input.step ?? "progress"}` }, ...state.activity].slice(0, 20);
            }
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
