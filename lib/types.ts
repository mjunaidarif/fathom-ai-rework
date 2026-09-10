// Core data model for the Fathom rebuild.
// The capture layer (bot joining a live call) is stubbed; everything downstream
// of a finished recording is real: transcript, summary, action items, highlights,
// search, sharing.

export type Platform = "zoom" | "meet" | "teams";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string; // used for generated avatar chips
  initials: string;
}

export interface Attendee {
  name: string;
  email?: string;
  isHost: boolean;
  speakerLabel: string; // matches TranscriptCue.speaker
  talkTimeS: number; // seconds spoken — drives the talk-time bar
  color: string;
}

export interface TranscriptCue {
  id: string;
  speaker: string; // speaker label, matches Attendee.speakerLabel
  startMs: number;
  endMs: number;
  text: string;
}

export interface SummarySection {
  heading: string;
  bullets: string[];
}

export interface Summary {
  templateId: TemplateId;
  sections: SummarySection[];
}

export type TemplateId =
  | "general"
  | "sales"
  | "standup"
  | "one_on_one"
  | "interview"
  | "customer_success";

export interface SummaryTemplate {
  id: TemplateId;
  name: string;
  description: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assignee?: string; // attendee name
  done: boolean;
  atMs?: number; // moment in the call it came from
}

export interface Highlight {
  id: string;
  startMs: number;
  endMs: number;
  label: string;
  note?: string;
  createdBy: string;
  createdAt: string; // ISO
  cueIds: string[]; // transcript cues covered
}

export interface Comment {
  id: string;
  atMs: number;
  author: string;
  body: string;
  createdAt: string; // ISO
}

export interface Meeting {
  id: string;
  title: string;
  platform: Platform;
  startedAt: string; // ISO
  durationS: number;
  ownerId: string;
  isTeamShared: boolean;
  tags: string[];
  attendees: Attendee[];
  // A short recap line shown in the library list.
  recap: string;
  // Which summary templates have been generated for this meeting.
  summaries: Summary[];
  actionItems: ActionItem[];
  highlights: Highlight[];
  comments: Comment[];
  transcript: TranscriptCue[];
  // Stubbed media. In a real build these point at the recording; here we drive
  // a synthetic player off durationS and the transcript timeline.
  recordingUrl?: string;
  thumbnailHue: number; // 0-360, for the generated gradient thumbnail
}

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string; // ISO
  durationS: number;
  platform: Platform;
  attendees: string[];
  willRecord: boolean;
}
