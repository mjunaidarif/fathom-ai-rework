import { NextResponse } from "next/server";
import { addHighlight } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await req.json();
  const highlight = await addHighlight(b.meetingId, {
    startMs: b.startMs,
    endMs: b.endMs,
    label: b.label,
    note: b.note,
    cueIds: b.cueIds ?? [],
    createdBy: b.createdBy ?? "You",
  });
  return NextResponse.json({ highlight }, { status: 201 });
}
