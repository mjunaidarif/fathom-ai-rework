import type { Meeting, TranscriptCue } from "./types";

export interface Chapter {
  id: string;
  index: number;
  title: string;
  startMs: number;
  endMs: number;
  cueIds: string[];
}

function titleFromCue(text: string): string {
  const words = text.replace(/^[^:]+:\s*/, "").trim().split(/\s+/);
  const slice = words.slice(0, 6).join(" ").replace(/[.,;:!?]+$/, "");
  return slice.charAt(0).toUpperCase() + slice.slice(1) + (words.length > 6 ? "…" : "");
}

/**
 * Segment a meeting's transcript into a handful of contiguous chapters so the
 * meeting page reads like a chaptered document you can jump around. Heuristic
 * (content-agnostic) — chapters are equal-ish contiguous cue groups.
 */
export function deriveChapters(meeting: Meeting): Chapter[] {
  const cues = [...meeting.transcript].sort((a, b) => a.startMs - b.startMs);
  if (cues.length === 0) return [];

  const count = Math.min(6, Math.max(2, Math.round(cues.length / 6)));
  const per = Math.ceil(cues.length / count);

  const chapters: Chapter[] = [];
  for (let i = 0; i < cues.length; i += per) {
    const group = cues.slice(i, i + per);
    if (group.length === 0) continue;
    const first = group[0];
    const idx = chapters.length;
    chapters.push({
      id: `ch${idx + 1}`,
      index: idx,
      title: titleFromCue(first.text),
      startMs: first.startMs,
      endMs: group[group.length - 1].endMs,
      cueIds: group.map((c) => c.id),
    });
  }
  return chapters;
}

export function activeChapterIndex(chapters: Chapter[], currentMs: number): number {
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentMs >= chapters[i].startMs) return i;
  }
  return 0;
}

export function cuesInRange(cues: TranscriptCue[], startMs: number, endMs: number): TranscriptCue[] {
  return cues.filter((c) => c.startMs >= startMs && c.startMs < endMs);
}
