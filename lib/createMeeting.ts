import type { ActionItem, Attendee, Meeting, Platform, TemplateId, TranscriptCue } from "./types";
import { getSummary } from "./summarize";

const PALETTE = [
  "#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9",
  "#14b8a6", "#d946ef", "#8b5cf6", "#ef4444", "#84cc16",
];

export interface RecordedLine {
  speaker: string;
  text: string;
  startMs: number;
}

export interface RecordInput {
  title: string;
  platform: Platform;
  templateId: TemplateId;
  participants: string[]; // display names; may include non-speakers
  lines: RecordedLine[];
  durationS: number;
  ownerId: string;
}

const ACTION_RE =
  /\b(i'?ll|we'?ll|let'?s|i will|we will|going to|need to|make sure|follow up|circle back|send|share|draft|schedule|set up|book|put together|take the lead|by (?:monday|tuesday|wednesday|thursday|friday|next week|eod|end of|tomorrow))\b/i;

function firstSentence(text: string): string {
  const m = text.match(/^(.*?[.!?])(\s|$)/);
  return (m ? m[1] : text).trim();
}

export function buildMeetingFromRecording(input: RecordInput): Meeting {
  const id = `m_rec_${Date.now().toString(36)}`;

  const cues: TranscriptCue[] = input.lines.map((l, i) => ({
    id: `c${i + 1}`,
    speaker: l.speaker,
    startMs: l.startMs,
    endMs: input.lines[i + 1]?.startMs ?? input.durationS * 1000,
    text: l.text,
  }));

  // Speakers from the transcript + any listed participants who didn't speak.
  const speakers = Array.from(new Set(cues.map((c) => c.speaker)));
  const allNames = Array.from(new Set([...speakers, ...input.participants]));
  const talk: Record<string, number> = {};
  for (const c of cues) talk[c.speaker] = (talk[c.speaker] ?? 0) + (c.endMs - c.startMs) / 1000;

  const attendees: Attendee[] = allNames.map((name, i) => ({
    name,
    isHost: i === 0,
    speakerLabel: name,
    talkTimeS: Math.round(talk[name] ?? 0),
    color: PALETTE[i % PALETTE.length],
  }));

  // Heuristic action items from action-flavored lines.
  const actionItems: ActionItem[] = [];
  for (const c of cues) {
    if (ACTION_RE.test(c.text)) {
      actionItems.push({
        id: `a${actionItems.length + 1}`,
        text: firstSentence(c.text),
        assignee: c.speaker,
        done: false,
        atMs: c.startMs,
      });
    }
    if (actionItems.length >= 6) break;
  }

  const base: Meeting = {
    id,
    title: input.title.trim() || "Untitled recording",
    platform: input.platform,
    startedAt: new Date().toISOString(),
    durationS: input.durationS,
    ownerId: input.ownerId,
    isTeamShared: false,
    tags: ["Recording"],
    thumbnailHue: Math.floor(Math.random() * 360),
    recap: cues[0] ? firstSentence(cues[0].text) : "New recording.",
    attendees,
    summaries: [],
    actionItems,
    highlights: [],
    comments: [],
    transcript: cues,
  };

  // Generate the summary for the chosen template at record time.
  const { summary } = getSummary(base, input.templateId);
  base.summaries = [summary];
  // A tidier recap from the summary's first bullet, if any.
  const firstBullet = summary.sections[0]?.bullets[0];
  if (firstBullet) base.recap = firstBullet.replace(/^[^:]+:\s*/, "");

  return base;
}

// A realistic 1:1 script used to prefill the recorder (editable).
export const SAMPLE_1ON1 = `Maya: Hey, good to see you. How's the week been?
Devon: Pretty good honestly. We shipped the incident dashboard on Tuesday and the on-call folks already love it.
Maya: That's great to hear. Anything getting in your way right now?
Devon: The context switching. I'm on reliability but I'm also in two feature reviews a week, and it's fragmenting my focus.
Maya: Understood. If we could pull one thing off your plate, what would help most?
Devon: If one of my reports moved to Sam's pod, I could actually go deep on reliability.
Maya: That's reasonable. I'll rebalance the team and move one report over this week.
Devon: That would genuinely help. Longer term, I want to be growing toward a tech-lead role.
Maya: I think the reliability workstream is a perfect proving ground. Let's draft a growth plan with real milestones.
Devon: I'd love that. Can we set up time next week to sketch it out?
Maya: Yes, I'll schedule it and send an agenda beforehand. Anything else on your mind?
Devon: That's it for me. Thanks for listening.
Maya: Always. Let's follow up on the growth plan on Friday.`;
