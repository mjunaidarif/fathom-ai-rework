"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import { buildMeetingFromRecording, SAMPLE_1ON1, type RecordedLine } from "@/lib/createMeeting";
import { fmtClock } from "@/lib/format";
import type { Platform, TemplateId } from "@/lib/types";
import { Avatar } from "@/components/ui";
import { IconChevron, IconSparkle } from "@/components/icons";

type Phase = "setup" | "recording" | "processing";

interface ParsedLine {
  speaker: string;
  text: string;
  scheduledMs: number;
  durMs: number;
}

const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9", "#14b8a6", "#d946ef", "#8b5cf6"];

function parseScript(script: string): ParsedLine[] {
  const out: ParsedLine[] = [];
  let cursor = 0;
  for (const raw of script.split(/\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^([^:]{1,40}):\s*(.+)$/);
    if (!m) continue;
    const words = m[2].split(/\s+/).length;
    const durMs = Math.min(3600, Math.max(1400, 900 + words * 70));
    out.push({ speaker: m[1].trim(), text: m[2].trim(), scheduledMs: cursor, durMs });
    cursor += durMs;
  }
  return out;
}

export default function RecordPage() {
  const router = useRouter();
  const { addMeeting, currentUser } = useStore();

  const [phase, setPhase] = useState<Phase>("setup");
  const [title, setTitle] = useState("Weekly 1:1");
  const [platform, setPlatform] = useState<Platform>("meet");
  const [templateId, setTemplateId] = useState<TemplateId>("one_on_one");
  const [script, setScript] = useState(SAMPLE_1ON1);

  const [revealed, setRevealed] = useState<RecordedLine[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  const linesRef = useRef<ParsedLine[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const revealScrollRef = useRef<HTMLDivElement>(null);

  const speakerColor = useMemo(() => {
    const speakers = Array.from(new Set(parseScript(script).map((l) => l.speaker)));
    return Object.fromEntries(speakers.map((s, i) => [s, PALETTE[i % PALETTE.length]]));
  }, [script]);

  const startRecording = () => {
    const lines = parseScript(script);
    if (lines.length === 0) return;
    linesRef.current = lines;
    setRevealed([]);
    setElapsedMs(0);
    setPhase("recording");
    startRef.current = performance.now();

    const tick = () => {
      const el = performance.now() - startRef.current;
      setElapsedMs(el);
      const due = linesRef.current.filter((l) => l.scheduledMs <= el);
      setRevealed(
        due.map((l) => ({ speaker: l.speaker, text: l.text, startMs: Math.round(l.scheduledMs) })),
      );
      const last = linesRef.current[linesRef.current.length - 1];
      if (last && el > last.scheduledMs + last.durMs + 600) {
        finish(el);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const finish = (elMs?: number) => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const lines =
      revealed.length > 0
        ? revealed
        : linesRef.current.map((l) => ({ speaker: l.speaker, text: l.text, startMs: Math.round(l.scheduledMs) }));
    const durationS = Math.max(1, Math.round((elMs ?? elapsedMs) / 1000));
    setPhase("processing");
    setTimeout(() => {
      const meeting = buildMeetingFromRecording({
        title,
        platform,
        templateId,
        participants: [],
        lines,
        durationS,
        ownerId: currentUser.id,
      });
      addMeeting(meeting);
      router.push(`/meeting/${meeting.id}`);
    }, 1600);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    revealScrollRef.current?.scrollTo({ top: revealScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [revealed.length]);

  // ---- SETUP ----
  if (phase === "setup") {
    return (
      <div className="max-w-[680px] mx-auto px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-[13px] text-[var(--text-2)] hover:text-[var(--text)]">
          <span className="rotate-180"><IconChevron width={16} height={16} /></span> Library
        </Link>
        <h1 className="text-[26px] font-bold tracking-tight mt-3">New recording</h1>
        <p className="text-[14px] text-[var(--text-2)] mt-0.5">
          Start a capture. Paste a transcript or use the sample 1:1 — Fathom will
          transcribe live, then generate the summary and action items.
        </p>

        <div className="card p-5 mt-6 space-y-4">
          <Field label="Meeting title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="inp" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Platform">
              <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="inp">
                <option value="meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
              </select>
            </Field>
            <Field label="Summary template">
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value as TemplateId)} className="inp">
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Transcript  ·  one line per turn as “Speaker: what they said”">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={12}
              className="inp font-mono !text-[12.5px] leading-relaxed resize-y"
            />
          </Field>
          <div className="flex items-center justify-between">
            <button onClick={() => setScript(SAMPLE_1ON1)} className="btn btn-ghost !px-0 text-[13px]">
              Reset to sample 1:1
            </button>
            <button onClick={startRecording} className="btn btn-primary">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Start recording
            </button>
          </div>
        </div>

        <style>{`.inp{width:100%;padding:.55rem .7rem;border-radius:10px;background:var(--surface);border:1px solid var(--border);font-size:14px;outline:none}.inp:focus{border-color:var(--accent)}`}</style>
      </div>
    );
  }

  // ---- PROCESSING ----
  if (phase === "processing") {
    return (
      <div className="h-screen grid place-items-center">
        <div className="text-center animate-in">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] grid place-items-center mx-auto animate-pulse">
            <IconSparkle width={28} height={28} />
          </div>
          <h2 className="text-[18px] font-semibold mt-4">Generating summary & action items…</h2>
          <p className="text-[13px] text-[var(--text-3)] mt-1">Transcribing {revealed.length} turns and extracting the highlights.</p>
        </div>
      </div>
    );
  }

  // ---- RECORDING ----
  return (
    <div className="h-screen flex flex-col">
      <header className="px-6 py-3.5 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--surface)]">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--red)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--red)] animate-pulse" /> RECORDING
        </span>
        <span className="text-[15px] font-semibold truncate">{title}</span>
        <span className="ml-auto text-[15px] tabular-nums font-semibold">{fmtClock(elapsedMs)}</span>
        <button onClick={() => finish()} className="btn btn-primary">Stop &amp; summarize</button>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-[1fr_420px]">
        {/* Live stage */}
        <div className="grid place-items-center" style={{ background: "radial-gradient(120% 120% at 50% 0%, #1e2030, #0c0d15)" }}>
          <div className="text-center">
            <div className="flex items-end justify-center gap-1.5 h-16">
              {Array.from({ length: 40 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-[var(--accent-2)]"
                  style={{ height: `${15 + Math.abs(Math.sin(i * 1.3 + revealed.length)) * 85}%`, animation: `wf2 .8s ease-in-out ${i * 0.03}s infinite alternate` }}
                />
              ))}
            </div>
            <p className="text-white/70 text-[13px] mt-6">Fathom is listening — capturing every word.</p>
            <style>{`@keyframes wf2{from{transform:scaleY(.4)}to{transform:scaleY(1)}}`}</style>
          </div>
        </div>

        {/* Live transcript */}
        <div className="border-l border-[var(--border)] flex flex-col min-h-0 bg-[var(--surface)]">
          <div className="px-4 py-3 border-b border-[var(--border)] text-[12px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Live transcript
          </div>
          <div ref={revealScrollRef} className="flex-1 overflow-y-auto scroll-thin p-3 space-y-3">
            {revealed.map((l, i) => (
              <div key={i} className="animate-in">
                <div className="flex items-center gap-2">
                  <Avatar name={l.speaker} color={speakerColor[l.speaker] ?? "#888"} size={20} />
                  <span className="text-[12.5px] font-semibold" style={{ color: speakerColor[l.speaker] }}>{l.speaker}</span>
                  <span className="text-[11px] tabular-nums text-[var(--text-3)]">{fmtClock(l.startMs)}</span>
                </div>
                <p className="text-[13.5px] leading-relaxed mt-1 ml-7">{l.text}</p>
              </div>
            ))}
            {revealed.length === 0 && (
              <p className="text-[13px] text-[var(--text-3)] p-4">Listening…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-[var(--text-2)] mb-1.5">{label}</span>
      {children}
    </label>
  );
}
