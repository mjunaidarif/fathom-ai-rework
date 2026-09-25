import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import type {
  ActionItem,
  Comment,
  Highlight,
  Meeting,
  Platform,
  Summary,
  TemplateId,
  TranscriptCue,
} from "./types";

// Consistent include for a full meeting payload.
const meetingInclude = {
  attendees: true,
  transcript: { orderBy: { order: "asc" } },
  summaries: true,
  actionItems: { orderBy: { order: "asc" } },
  highlights: { orderBy: { startMs: "asc" } },
  comments: { orderBy: { atMs: "asc" } },
} satisfies Prisma.MeetingInclude;

type MeetingRow = Prisma.MeetingGetPayload<{ include: typeof meetingInclude }>;

const pid = (meetingId: string, localId: string) => `${meetingId}:${localId}`;

export function mapMeeting(m: MeetingRow): Meeting {
  return {
    id: m.id,
    title: m.title,
    platform: m.platform as Platform,
    startedAt: m.startedAt.toISOString(),
    durationS: m.durationS,
    ownerId: m.ownerId,
    isTeamShared: m.isTeamShared,
    tags: m.tags,
    recap: m.recap,
    recordingUrl: m.recordingUrl ?? undefined,
    thumbnailHue: m.thumbnailHue,
    attendees: m.attendees.map((a) => ({
      name: a.name,
      email: a.email ?? undefined,
      isHost: a.isHost,
      speakerLabel: a.speakerLabel,
      talkTimeS: a.talkTimeS,
      color: a.color,
    })),
    transcript: m.transcript.map<TranscriptCue>((c) => ({
      id: c.id,
      speaker: c.speaker,
      startMs: c.startMs,
      endMs: c.endMs,
      text: c.text,
    })),
    summaries: m.summaries.map<Summary>((s) => ({
      templateId: s.templateId as TemplateId,
      sections: s.sections as unknown as Summary["sections"],
    })),
    actionItems: m.actionItems.map<ActionItem>((a) => ({
      id: a.id,
      text: a.text,
      assignee: a.assignee ?? undefined,
      done: a.done,
      atMs: a.atMs ?? undefined,
    })),
    highlights: m.highlights.map<Highlight>((h) => ({
      id: h.id,
      startMs: h.startMs,
      endMs: h.endMs,
      label: h.label,
      note: h.note ?? undefined,
      createdBy: h.createdBy,
      createdAt: h.createdAt.toISOString(),
      cueIds: h.cueIds,
    })),
    comments: m.comments.map<Comment>((c) => ({
      id: c.id,
      atMs: c.atMs,
      author: c.author,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export async function listMeetings(): Promise<Meeting[]> {
  const rows = await prisma.meeting.findMany({
    include: meetingInclude,
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapMeeting);
}

export async function getMeeting(id: string): Promise<Meeting | null> {
  const row = await prisma.meeting.findUnique({ where: { id }, include: meetingInclude });
  return row ? mapMeeting(row) : null;
}

/** Persist a fully-formed Meeting object (from buildMeetingFromRecording). */
export async function persistMeeting(m: Meeting): Promise<Meeting> {
  const row = await prisma.meeting.create({
    data: {
      id: m.id,
      title: m.title,
      platform: m.platform,
      startedAt: new Date(m.startedAt),
      durationS: m.durationS,
      ownerId: m.ownerId,
      isTeamShared: m.isTeamShared,
      tags: m.tags,
      recap: m.recap,
      recordingUrl: m.recordingUrl ?? null,
      thumbnailHue: m.thumbnailHue,
      attendees: {
        create: m.attendees.map((a) => ({
          name: a.name,
          email: a.email ?? null,
          isHost: a.isHost,
          speakerLabel: a.speakerLabel,
          talkTimeS: a.talkTimeS,
          color: a.color,
        })),
      },
      transcript: {
        create: m.transcript.map((c, i) => ({
          id: pid(m.id, c.id),
          speaker: c.speaker,
          startMs: c.startMs,
          endMs: c.endMs,
          text: c.text,
          order: i,
        })),
      },
      summaries: {
        create: m.summaries.map((s) => ({ templateId: s.templateId, sections: s.sections as object })),
      },
      actionItems: {
        create: m.actionItems.map((a, i) => ({
          id: pid(m.id, a.id),
          text: a.text,
          assignee: a.assignee ?? null,
          done: a.done,
          atMs: a.atMs ?? null,
          order: i,
        })),
      },
    },
    include: meetingInclude,
  });
  return mapMeeting(row);
}

export async function deleteMeeting(id: string): Promise<void> {
  await prisma.meeting.delete({ where: { id } }).catch(() => {});
}

export async function toggleActionItem(id: string): Promise<void> {
  const item = await prisma.actionItem.findUnique({ where: { id } });
  if (!item) return;
  await prisma.actionItem.update({ where: { id }, data: { done: !item.done } });
}

export async function addHighlight(
  meetingId: string,
  h: { startMs: number; endMs: number; label: string; note?: string; cueIds: string[]; createdBy: string },
): Promise<Highlight> {
  const row = await prisma.highlight.create({
    data: {
      meetingId,
      startMs: h.startMs,
      endMs: h.endMs,
      label: h.label,
      note: h.note ?? null,
      cueIds: h.cueIds,
      createdBy: h.createdBy,
    },
  });
  return {
    id: row.id,
    startMs: row.startMs,
    endMs: row.endMs,
    label: row.label,
    note: row.note ?? undefined,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    cueIds: row.cueIds,
  };
}

export async function removeHighlight(id: string): Promise<void> {
  await prisma.highlight.delete({ where: { id } }).catch(() => {});
}

export async function addComment(
  meetingId: string,
  atMs: number,
  author: string,
  body: string,
): Promise<Comment> {
  const row = await prisma.comment.create({ data: { meetingId, atMs, author, body } });
  return {
    id: row.id,
    atMs: row.atMs,
    author: row.author,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

export interface PlaylistDTO {
  id: string;
  name: string;
  highlightRefs: { meetingId: string; highlightId: string }[];
}

export async function listPlaylists(): Promise<PlaylistDTO[]> {
  const rows = await prisma.playlist.findMany({
    include: { items: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    highlightRefs: p.items.map((i) => ({ meetingId: i.meetingId, highlightId: i.highlightId })),
  }));
}

export async function createPlaylist(name: string, ownerId?: string): Promise<PlaylistDTO> {
  const p = await prisma.playlist.create({ data: { name, ownerId: ownerId ?? null } });
  return { id: p.id, name: p.name, highlightRefs: [] };
}

export async function addToPlaylist(playlistId: string, meetingId: string, highlightId: string): Promise<void> {
  const count = await prisma.playlistItem.count({ where: { playlistId } });
  await prisma.playlistItem
    .create({ data: { playlistId, meetingId, highlightId, order: count } })
    .catch(() => {}); // ignore duplicates (unique constraint)
}

export async function searchMeetings(q: string): Promise<Meeting[]> {
  const needle = q.trim();
  if (!needle) return [];
  const rows = await prisma.meeting.findMany({
    where: {
      OR: [
        { title: { contains: needle, mode: "insensitive" } },
        { recap: { contains: needle, mode: "insensitive" } },
        { tags: { has: needle } },
        { transcript: { some: { text: { contains: needle, mode: "insensitive" } } } },
        { attendees: { some: { name: { contains: needle, mode: "insensitive" } } } },
      ],
    },
    include: meetingInclude,
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapMeeting);
}
