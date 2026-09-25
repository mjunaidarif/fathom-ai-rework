"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { AskResult } from "@/lib/ask";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const api = (p: string) => `${BASE}${p}`;
import { fmtClock } from "@/lib/format";
import { IconSparkle, IconSend, IconPlay, IconLightning } from "@/components/icons";

interface Msg {
  role: "user" | "assistant";
  text: string;
  result?: AskResult;
}

const SUGGESTED = [
  "What did we decide about pricing?",
  "What are the open action items?",
  "What security concerns came up?",
  "Which customers mentioned expansion?",
];

export default function AskPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const ask = async (question: string) => {
    if (!question.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch(api("/api/ask"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const result = (await res.json()) as AskResult;
      setMsgs((m) => [...m, { role: "assistant", text: result.answer, result }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Sorry — I couldn't reach the server." }]);
    } finally {
      setThinking(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <div className="max-w-[760px] mx-auto px-8 py-8 flex flex-col min-h-screen">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] grid place-items-center">
          <IconSparkle width={20} height={20} />
        </span>
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Ask Fathom</h1>
          <p className="text-[13px] text-[var(--text-3)]">Answers pulled from across all your calls.</p>
        </div>
      </div>

      <div className="flex-1 mt-6 space-y-5">
        {msgs.length === 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 text-[13px] text-[var(--text-2)]">
              <IconLightning width={15} height={15} className="text-[var(--accent)]" />
              On-device retrieval over your transcripts — no meeting data leaves the page.
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => ask(s)} className="text-left card !shadow-none p-3 text-[13.5px] hover:border-[var(--accent)] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="bg-[var(--accent)] text-white rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] max-w-[80%]">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3 animate-in">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] grid place-items-center shrink-0">
                <IconSparkle width={16} height={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-relaxed">{m.text}</p>
                {m.result && m.result.sources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {m.result.sources.map((s, j) => (
                      <Link key={j} href={`/meeting/${s.meetingId}`} className="block card !shadow-none p-3 hover:border-[var(--accent)] transition-colors">
                        <div className="flex items-center gap-2 text-[11.5px] text-[var(--text-3)]">
                          <span className="font-semibold text-[var(--text-2)]">{s.meetingTitle}</span>
                          <span className="inline-flex items-center gap-1 text-[var(--accent)]">
                            <IconPlay width={10} height={10} /> {fmtClock(s.startMs)}
                          </span>
                        </div>
                        <p className="text-[13px] mt-1 text-[var(--text)]">
                          <span className="font-medium">{s.speaker}: </span>
                          {s.text}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ),
        )}

        {thinking && (
          <div className="flex gap-3">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] grid place-items-center shrink-0">
              <IconSparkle width={16} height={16} />
            </span>
            <div className="flex items-center gap-1 h-8">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[var(--text-3)]" style={{ animation: `bounce 1s ${i * 0.15}s infinite` }} />
              ))}
              <style>{`@keyframes bounce{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}`}</style>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="sticky bottom-4 mt-6 flex gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1.5 shadow-[var(--shadow-md)]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your meetings…"
          className="flex-1 px-3 py-2.5 bg-transparent text-[14px] outline-none"
        />
        <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
          <IconSend width={16} height={16} /> Ask
        </button>
      </form>
    </div>
  );
}
