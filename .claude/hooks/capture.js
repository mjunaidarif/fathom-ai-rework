#!/usr/bin/env node
/**
 * 8x agent-capture hook for Claude Code.
 *
 * Fires automatically via .claude/settings.json:
 *   - UserPromptSubmit  -> `node capture.js prompt`   (logs the verbatim prompt)
 *   - Stop              -> `node capture.js response` (logs the final text response)
 *
 * Captures ONLY the prompt and the final assistant text response per turn.
 * No thinking, no tool calls, no intermediate steps. One markdown file per
 * session under .agent-logs/, in the 8x internal format.
 *
 * This script never throws and always exits 0 so it can never block or slow
 * down a Claude Code turn. Capture failures are written to .agent-logs/.capture-errors.log.
 */

const fs = require("fs");
const path = require("path");

const MODE = process.argv[2]; // "prompt" | "response"

// Author for the frontmatter. Override with AGENT_LOG_AUTHOR if your GitHub
// handle differs. Change this default once and every session picks it up.
const AUTHOR = process.env.AGENT_LOG_AUTHOR || "junaid01";
const TOOL = "claude-code";
const FALLBACK_MODEL = process.env.AGENT_LOG_MODEL || "claude-opus-4-8";

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function nowIso() {
  return new Date().toISOString();
}

function logError(logsDir, err) {
  try {
    fs.appendFileSync(
      path.join(logsDir, ".capture-errors.log"),
      `${nowIso()} [${MODE}] ${err && err.stack ? err.stack : err}\n`
    );
  } catch {
    /* nothing more we can do */
  }
}

/** Find the existing session log file, or null if this session has none yet. */
function findSessionFile(logsDir, sessionId) {
  try {
    const suffix = `_${sessionId}.md`;
    const match = fs
      .readdirSync(logsDir)
      .find((f) => f.endsWith(suffix));
    return match ? path.join(logsDir, match) : null;
  } catch {
    return null;
  }
}

function newSessionFileName(sessionId, iso) {
  // YYYY-MM-DD_HH-MM-SS_<session-id>.md  (UTC, filesystem-safe)
  const stamp = iso.replace(/\.\d+Z$/, "").replace("T", "_").replace(/:/g, "-");
  return `${stamp}_${sessionId}.md`;
}

/** Parse the JSONL transcript and return { text, model } for the final turn. */
function extractFinalResponse(transcriptPath) {
  const out = { text: "", model: null };
  let raw;
  try {
    raw = fs.readFileSync(transcriptPath, "utf8");
  } catch {
    return out;
  }

  const entries = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    try {
      entries.push(JSON.parse(t));
    } catch {
      /* skip non-JSON lines */
    }
  }

  // Locate the last genuine user prompt (a user message that is NOT a tool_result).
  let lastPromptIdx = -1;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e || e.type !== "user" || !e.message) continue;
    const content = e.message.content;
    const isRealPrompt =
      typeof content === "string" ||
      (Array.isArray(content) && content.some((b) => b && b.type === "text"));
    if (isRealPrompt) lastPromptIdx = i;
  }

  // Collect assistant text blocks that came after that prompt.
  const parts = [];
  for (let i = lastPromptIdx + 1; i < entries.length; i++) {
    const e = entries[i];
    if (!e || e.type !== "assistant" || !e.message) continue;
    if (e.message.model) out.model = e.message.model;
    const content = e.message.content;
    if (typeof content === "string") {
      if (content.trim()) parts.push(content);
    } else if (Array.isArray(content)) {
      for (const b of content) {
        if (b && b.type === "text" && typeof b.text === "string" && b.text.trim()) {
          parts.push(b.text);
        }
      }
    }
  }

  out.text = parts.join("\n\n").trim();
  return out;
}

/** Read the model from the transcript (last assistant message) as a fallback. */
function modelFromTranscript(transcriptPath) {
  try {
    const raw = fs.readFileSync(transcriptPath, "utf8");
    const lines = raw.split(/\r?\n/).filter((l) => l.trim());
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const e = JSON.parse(lines[i]);
        if (e && e.type === "assistant" && e.message && e.message.model) {
          return e.message.model;
        }
      } catch {
        /* skip */
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function buildFrontmatter(meta) {
  return [
    "---",
    `session_id: ${meta.sessionId}`,
    `date: ${meta.date}`,
    `author: ${AUTHOR}`,
    `model: ${meta.model}`,
    `tool: ${TOOL}`,
    `project: ${meta.project}`,
    `total_exchanges: ${meta.total}`,
    `first_prompt_time: ${meta.firstTime}`,
    `last_prompt_time: ${meta.lastTime}`,
    "---",
  ].join("\n");
}

function buildHeader(meta) {
  const shortId = meta.sessionId.slice(0, 8);
  return [
    "",
    `# Session Log - ${meta.date}`,
    "",
    `Session: \`${shortId}\` | Project: \`${meta.project}\` | Author: \`${AUTHOR}\``,
    "",
    "---",
    "",
  ].join("\n");
}

/** Rewrite the frontmatter block of an existing file with updated meta. */
function updateFrontmatter(body, patch) {
  return body.replace(/^---\n[\s\S]*?\n---/, (block) => {
    let b = block;
    for (const [key, val] of Object.entries(patch)) {
      const re = new RegExp(`^(${key}: ).*$`, "m");
      if (re.test(b)) b = b.replace(re, `$1${val}`);
    }
    return b;
  });
}

function countEntries(body, type) {
  const re = new RegExp(`\\[LOG_ENTRY type=${type} `, "g");
  return (body.match(re) || []).length;
}

function main() {
  const logsDir = path.resolve(process.cwd(), ".agent-logs");
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch {
    /* ignore */
  }

  let input = {};
  try {
    const s = readStdin();
    input = s ? JSON.parse(s) : {};
  } catch (e) {
    logError(logsDir, e);
  }

  const sessionId = input.session_id || "unknown-session";
  const shortId = sessionId.slice(0, 8);
  const transcriptPath = input.transcript_path || "";
  const project = path.basename(process.cwd());
  const iso = nowIso();
  const date = iso.slice(0, 10);

  try {
    if (MODE === "prompt") {
      const prompt = typeof input.prompt === "string" ? input.prompt : "";
      const model =
        input.model || modelFromTranscript(transcriptPath) || FALLBACK_MODEL;

      let file = findSessionFile(logsDir, sessionId);
      let body;
      if (!file) {
        file = path.join(logsDir, newSessionFileName(sessionId, iso));
        const meta = {
          sessionId,
          date,
          model,
          project,
          total: 0,
          firstTime: iso,
          lastTime: iso,
        };
        body = buildFrontmatter(meta) + "\n" + buildHeader(meta);
      } else {
        body = fs.readFileSync(file, "utf8");
      }

      const num = countEntries(body, "PROMPT") + 1;
      const entry =
        `[LOG_ENTRY type=PROMPT num=${num} session=${shortId}]\n` +
        `timestamp: ${iso}\n` +
        `model: ${model}\n\n` +
        `${prompt}\n\n\n`;

      body += entry;
      body = updateFrontmatter(body, {
        total_exchanges: num,
        last_prompt_time: iso,
        model,
      });
      fs.writeFileSync(file, body);
    } else if (MODE === "response") {
      const file = findSessionFile(logsDir, sessionId);
      if (!file) {
        // No prompt was logged for this session; nothing to attach to.
        logError(logsDir, `response event with no session file for ${sessionId}`);
        return;
      }
      let body = fs.readFileSync(file, "utf8");

      const { text, model: tModel } = extractFinalResponse(transcriptPath);
      const model = tModel || input.model || FALLBACK_MODEL;
      const num = countEntries(body, "RESPONSE") + 1;
      const entry =
        `[LOG_ENTRY type=RESPONSE num=${num} session=${shortId}]\n` +
        `timestamp: ${iso}\n` +
        `model: ${model}\n\n` +
        `${text || "(no text response captured)"}\n\n\n`;

      body += entry;
      body = updateFrontmatter(body, { last_prompt_time: iso, model });
      fs.writeFileSync(file, body);
    } else {
      logError(logsDir, `unknown mode: ${MODE}`);
    }
  } catch (e) {
    logError(logsDir, e);
  }
}

main();
process.exit(0);
