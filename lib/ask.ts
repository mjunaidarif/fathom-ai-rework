import type { Meeting } from "./types";

export interface AskSource {
  meetingId: string;
  meetingTitle: string;
  speaker: string;
  startMs: number;
  text: string;
}

export interface AskResult {
  answer: string;
  sources: AskSource[];
}

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are", "was",
  "were", "what", "which", "who", "when", "did", "do", "does", "how", "we", "our",
  "about", "with", "that", "this", "any", "all", "me", "i", "my", "across", "calls",
  "meeting", "meetings", "said", "say", "tell", "show", "find",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

export function askFathom(question: string, meetings: Meeting[]): AskResult {
  const qTokens = tokens(question);
  if (qTokens.length === 0) {
    return { answer: "Ask me something about your meetings — decisions, action items, who said what.", sources: [] };
  }

  type Scored = AskSource & { score: number };
  const scored: Scored[] = [];
  for (const m of meetings) {
    const titleTokens = new Set(tokens(m.title + " " + m.recap + " " + m.tags.join(" ")));
    const titleBoost = qTokens.filter((t) => titleTokens.has(t)).length;
    for (const c of m.transcript) {
      const low = c.text.toLowerCase();
      let score = 0;
      for (const t of qTokens) if (low.includes(t)) score += 1;
      if (score === 0) continue;
      scored.push({
        score: score + titleBoost * 0.5,
        meetingId: m.id,
        meetingTitle: m.title,
        speaker: c.speaker,
        startMs: c.startMs,
        text: c.text,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.startMs - b.startMs);

  // keep at most 2 per meeting, 5 total
  const perMeeting: Record<string, number> = {};
  const top: Scored[] = [];
  for (const s of scored) {
    perMeeting[s.meetingId] = (perMeeting[s.meetingId] ?? 0) + 1;
    if (perMeeting[s.meetingId] <= 2) top.push(s);
    if (top.length >= 5) break;
  }

  if (top.length === 0) {
    return {
      answer: `I couldn't find anything about that across your ${meetings.length} calls. Try different words, or check the transcript directly.`,
      sources: [],
    };
  }

  const meetingCount = new Set(top.map((t) => t.meetingId)).size;
  const answer =
    `Here's what came up across ${meetingCount} call${meetingCount !== 1 ? "s" : ""}. ` +
    `The most relevant moment: ${top[0].speaker} in “${top[0].meetingTitle}” — “${firstSentence(top[0].text)}” ` +
    `See the sourced moments below to jump straight to each one.`;

  return {
    answer,
    sources: top.map(({ score, ...s }) => s),
  };
}

function firstSentence(text: string): string {
  const m = text.match(/^(.*?[.!?])(\s|$)/);
  return (m ? m[1] : text).trim();
}
