import { NextResponse } from "next/server";
import { getMeeting } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await getMeeting(id);
  if (!meeting) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ meeting });
}
