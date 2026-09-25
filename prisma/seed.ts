import { PrismaClient, type Platform, type TemplateId } from "@prisma/client";
import { USERS, MEETINGS, CALENDAR } from "../lib/seed";

const prisma = new PrismaClient();

// Child records get meeting-prefixed ids so the seed's local ids (c1, a1, h1…)
// stay globally unique and cross-references (highlight.cueIds, playlist refs) hold.
const pid = (meetingId: string, localId: string) => `${meetingId}:${localId}`;

async function main() {
  console.log("Resetting tables…");
  await prisma.playlist.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();

  console.log(`Seeding ${USERS.length} users…`);
  for (const u of USERS) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarColor: u.avatarColor,
        initials: u.initials,
      },
    });
  }

  console.log(`Seeding ${MEETINGS.length} meetings…`);
  for (const m of MEETINGS) {
    await prisma.meeting.create({
      data: {
        id: m.id,
        title: m.title,
        platform: m.platform as Platform,
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
          create: m.summaries.map((s) => ({
            templateId: s.templateId as TemplateId,
            sections: s.sections as object,
          })),
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
        highlights: {
          create: m.highlights.map((h) => ({
            id: pid(m.id, h.id),
            startMs: h.startMs,
            endMs: h.endMs,
            label: h.label,
            note: h.note ?? null,
            createdBy: h.createdBy,
            createdAt: new Date(h.createdAt),
            cueIds: h.cueIds.map((cid) => pid(m.id, cid)),
          })),
        },
        comments: {
          create: m.comments.map((c) => ({
            id: pid(m.id, c.id),
            atMs: c.atMs,
            author: c.author,
            body: c.body,
            createdAt: new Date(c.createdAt),
          })),
        },
      },
    });
    console.log(`  ✓ ${m.title}`);
  }

  console.log("Seeding starter playlist…");
  await prisma.playlist.create({
    data: {
      id: "pl_wins",
      name: "Team wins & decisions",
      ownerId: "u_maya",
      items: {
        create: [
          { meetingId: "m_roadmap_q3", highlightId: pid("m_roadmap_q3", "h1"), order: 0 },
          { meetingId: "m_cs_acme", highlightId: pid("m_cs_acme", "h2"), order: 1 },
        ],
      },
    },
  });

  console.log(`Seeding ${CALENDAR.length} calendar events…`);
  for (const e of CALENDAR) {
    await prisma.calendarEvent.create({
      data: {
        id: e.id,
        title: e.title,
        startAt: new Date(e.startAt),
        durationS: e.durationS,
        platform: e.platform as Platform,
        attendees: e.attendees,
        willRecord: e.willRecord,
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
