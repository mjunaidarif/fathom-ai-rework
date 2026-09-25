import { NextResponse } from "next/server";
import { addToPlaylist } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  await addToPlaylist(id, b.meetingId, b.highlightId);
  return NextResponse.json({ ok: true }, { status: 201 });
}
