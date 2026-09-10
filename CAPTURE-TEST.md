# CAPTURE-TEST — 8x Agent Capture

This is the first file to open. It documents the automatic prompt/response
capture wired into this repo and proves it works — with a real captured log, not
just a dry run.

## 1. Tool & model

- **Tool:** Claude Code (running in the Claude desktop app, Code tab)
- **Model:** `claude-opus-4-8` (Opus 4.8) — plans and executes in the same model.
  The model is read per-turn from the transcript, so any mid-build switch would
  show up in each entry's `model:` line and the session frontmatter.

## 2. Mechanism & config

Claude Code fires **hooks** on lifecycle events. Two are wired:

| Event | Fires | Command |
|-------|-------|---------|
| `UserPromptSubmit` | when I submit a prompt | `node .claude/hooks/capture.js prompt` |
| `Stop` | at end of turn (final response ready) | `node .claude/hooks/capture.js response` |

The `Stop` hook receives the path to the session transcript (JSONL) on stdin;
the script parses it and appends **only the final assistant text** — no thinking,
no tool calls, no intermediate steps.

- **Config file changed:** [`.claude/settings.json`](.claude/settings.json)
- **Capture script:** [`.claude/hooks/capture.js`](.claude/hooks/capture.js)
- **Log output directory:** [`.agent-logs/`](.agent-logs/) (committed, **not** gitignored)

One file per session: `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md`, with YAML
frontmatter (`session_id`, `date`, `author`, `model`, `tool`, `project`,
`total_exchanges`, `first_prompt_time`, `last_prompt_time`) followed by paired
`[LOG_ENTRY type=PROMPT …]` / `[LOG_ENTRY type=RESPONSE …]` blocks. UTC timestamps
throughout. `author` is `mjunaidarif` (the `AUTHOR` constant in `capture.js`,
overridable with the `AGENT_LOG_AUTHOR` env var).

## 3. Verification — real captured log

Capture is **live and firing on its own**. The build session's own log is here:

- **Log file:** [`.agent-logs/2026-09-09_19-04-26_092a5921-2ef1-4ae2-8e64-83d6cc87e1da.md`](.agent-logs/2026-09-09_19-04-26_092a5921-2ef1-4ae2-8e64-83d6cc87e1da.md)

The first captured exchange, pasted raw from that file:

```
[LOG_ENTRY type=PROMPT num=1 session=092a5921]
timestamp: 2026-09-09T19:04:26.348Z
model: claude-opus-4-8

my handle is mjunaidarif


[LOG_ENTRY type=RESPONSE num=1 session=092a5921]
timestamp: 2026-09-09T19:05:02.799Z
model: claude-opus-4-8

Done — `author: mjunaidarif` is now baked into the capture script and every
future log will carry it. Commits are also authored as `mjunaidarif`.
...
```

The log grows on every turn (`total_exchanges` and `last_prompt_time` update in
the frontmatter), and it is committed interleaved with the code it produced.

### Dry-run proof (mechanism, before the live log existed)

Before trusting the live hook, the script was exercised with a **simulated**
`UserPromptSubmit` payload and a `Stop` payload pointing at a synthetic transcript
that deliberately contained a `thinking` block and a `tool_use` block. The script
captured the prompt verbatim and the final text response while **excluding the
thinking and the tool call**, and incremented numbering + frontmatter across two
prompts.

### Optional: formal two-session canary

To match the letter of the 8x canary step, in a fresh session send
`CAPTURE TEST — 8x assignment, mjunaidarif`, confirm it lands in `.agent-logs/`,
then repeat in a second session. (Capture is already proven above; this just adds
the specific canary string in a second session.)

## 4. What was tried first that did not work

- **First test harness passed an MSYS-style absolute transcript path**
  (`/tmp/tmp.XXXX/transcript.jsonl`). Native Windows Node cannot resolve MSYS
  mount paths, so the transcript read failed silently and the response logged as
  `(no text response captured)`. Test-harness artifact only — real Claude Code
  passes a native Windows path; re-running with a resolvable path captured the
  response correctly.
- **One benign early error** is recorded in `.agent-logs/.capture-errors.log`:
  a `Stop` event fired the instant after `settings.json` was created, before any
  `UserPromptSubmit` had created a session file (`response event with no session
  file …`). Nothing to attach to yet; harmless. The script swallows all errors
  (always exits 0) so capture can never block or slow a turn, and that error log
  is the one file under `.agent-logs/` that *is* gitignored (it's noise).
