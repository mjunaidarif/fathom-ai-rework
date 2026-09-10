"use client";

import { useState } from "react";
import type { Highlight, Meeting } from "@/lib/types";
import { fmtClock } from "@/lib/format";
import { IconClose, IconCopy, IconCheck, IconClip, IconShare } from "../icons";

export function ShareModal({
  meeting,
  highlight,
  onClose,
}: {
  meeting: Meeting;
  highlight?: Highlight | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isClip = !!highlight;
  const token = (highlight?.id ?? meeting.id).replace(/[^a-z0-9]/gi, "").slice(0, 10);
  const url = `https://fath.link/${isClip ? "c" : "m"}/${token}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be blocked; the field is selectable regardless */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative card !rounded-2xl w-full max-w-[440px] p-6 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-3)] hover:text-[var(--text)]">
          <IconClose />
        </button>

        <div className="flex items-center gap-2 text-[var(--accent)]">
          {isClip ? <IconClip /> : <IconShare />}
          <h3 className="font-bold text-[17px]">{isClip ? "Share clip" : "Share meeting"}</h3>
        </div>
        <p className="text-[13px] text-[var(--text-2)] mt-1">
          {isClip
            ? `A ${fmtClock(highlight!.startMs)}–${fmtClock(highlight!.endMs)} clip — “${highlight!.label}”.`
            : `Anyone with the link can watch “${meeting.title}” and read the summary.`}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 px-3 py-2.5 rounded-lg bg-[var(--surface-2)] text-[13px] font-mono outline-none"
          />
          <button onClick={copy} className="btn btn-primary !py-2.5">
            {copied ? <IconCheck width={16} height={16} /> : <IconCopy width={16} height={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--text-3)]">
          <span className="w-2 h-2 rounded-full bg-[var(--green)]" />
          Link sharing is on · viewers don&apos;t need a Fathom account
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-3 gap-2">
          {["Slack", "Email", "Notion"].map((d) => (
            <button key={d} className="btn btn-soft justify-center !py-2 text-[12.5px]">
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
