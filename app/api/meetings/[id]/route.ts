import { NextResponse } from "next/server";
import { deleteMeeting, getMeeting } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await getMeeting(id);
  if (!meeting) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ meeting });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteMeeting(id);
  return NextResponse.json({ ok: true });
}
