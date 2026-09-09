# CAPTURE-TEST — 8x Agent Capture

This is the first file to open. It documents the automatic prompt/response
capture wired into this repo and proves it works.

## 1. Tool & model

- **Tool:** Claude Code (running in the Claude desktop app, Code tab)
- **Model:** `claude-opus-4-8` (Opus 4.8) — plans and executes in the same model.
  A mid-build model switch would show up in each log entry's `model:` line and
  the session frontmatter, because the model is read per-turn from the transcript.

## 2. Mechanism & config

Claude Code fires **hooks** on lifecycle events. Two are wired:

| Event | Fires | Command |
|-------|-------|---------|
| `UserPromptSubmit` | when I submit a prompt | `node .claude/hooks/capture.js prompt` |
| `Stop` | at end of turn (final response ready) | `node .claude/hooks/capture.js response` |

The `Stop` hook receives the path to the session transcript (JSONL) on stdin;
the script parses it and appends **only the final assistant text** — no
thinking, no tool calls, no intermediate steps.

- **Config file changed:** [`.claude/settings.json`](.claude/settings.json)
- **Capture script:** [`.claude/hooks/capture.js`](.claude/hooks/capture.js)
- **Log output directory:** [`.agent-logs/`](.agent-logs/) (committed, **not** gitignored)

The hook runs on its own on every prompt and every response, in every session,
because `.claude/settings.json` is project-scoped and loaded at each session
start. Nothing needs to be remembered or run by hand.

### Log format

One file per session: `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md`, with
YAML frontmatter (`session_id`, `date`, `author`, `model`, `tool`, `project`,
`total_exchanges`, `first_prompt_time`, `last_prompt_time`) followed by paired
`[LOG_ENTRY type=PROMPT ...]` / `[LOG_ENTRY type=RESPONSE ...]` blocks. UTC
timestamps throughout.

> `author` in the frontmatter is `mjunaidarif` (set via the `AUTHOR` constant at
> the top of `.claude/hooks/capture.js`; override per-session with the
> `AGENT_LOG_AUTHOR` env var if needed).

## 3. Verification

### Dry-run proof (mechanism validated)

Before trusting the live hook, the script was exercised with a **simulated**
`UserPromptSubmit` payload and a `Stop` payload pointing at a synthetic
transcript that deliberately contained a `thinking` block and a `tool_use`
block. The script correctly captured the prompt verbatim and the final text
response, while **excluding the thinking and the tool call** — and it correctly
incremented the entry numbering and updated the frontmatter across two prompts.

### Live canaries (across two sessions)

> ⚠️ **Action required — see the note at the bottom.** Hooks load at session
> start, so the two live canaries must be produced from a fresh Claude Code
> session (this repo had no `.claude/` when the current session began). Once you
> run them, the two entries land in `.agent-logs/` automatically; paste them raw
> below.

**Canary session 1 — log file:** `_________________________`

```
<paste the PROMPT + RESPONSE entries for "CAPTURE TEST — 8x assignment, <your name>" here>
```

**Canary session 2 — log file:** `_________________________`

```
<paste the PROMPT + RESPONSE entries from the second, separate session here>
```

## 4. What was tried first that did not work

- **First test harness passed an MSYS-style absolute transcript path**
  (`/tmp/tmp.XXXX/transcript.jsonl`). Native Windows Node cannot resolve MSYS
  mount paths, so the transcript read failed silently and the response logged as
  `(no text response captured)`. This was a **test-harness artifact only** —
  real Claude Code passes a native Windows path. Re-running with a Node-
  resolvable path captured the response correctly. The script swallows all
  errors (always exits 0) so a capture failure can never block or slow a turn;
  any such failure is recorded in `.agent-logs/.capture-errors.log` (the one
  file under `.agent-logs/` that *is* gitignored, since it is noise).

---

### How to produce the two live canaries

1. Start a **fresh** Claude Code session on this repo (reopen the project / new
   session, so `.claude/settings.json` is loaded and the hooks are active).
   Approve the hooks if Claude Code prompts to review them.
2. Send exactly: `CAPTURE TEST — 8x assignment, <your name>`
3. Confirm a new file appeared in `.agent-logs/` containing both the PROMPT and
   the RESPONSE for that canary.
4. Start a **second, separate** session and send another canary the same way.
   Confirm it also lands (a hook that only works in the session that created it
   is not installed).
5. Paste both raw entries into section 3 above and fill in the log filenames.
