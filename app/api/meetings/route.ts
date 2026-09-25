import { NextResponse } from "next/server";
import { listMeetings, persistMeeting } from "@/lib/db";
import { buildMeetingFromRecording } from "@/lib/createMeeting";
import { CURRENT_USER_ID } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  const meetings = await listMeetings();
  return NextResponse.json({ meetings });
}

export async function POST(req: Request) {
  const body = await req.json();
  const meeting = buildMeetingFromRecording({
    title: body.title ?? "Untitled recording",
    platform: body.platform ?? "meet",
    templateId: body.templateId ?? "general",
    participants: body.participants ?? [],
    lines: body.lines ?? [],
    durationS: body.durationS ?? 0,
    ownerId: body.ownerId ?? CURRENT_USER_ID,
  });
  const saved = await persistMeeting(meeting);
  return NextResponse.json({ meeting: saved }, { status: 201 });
}
