import { NextResponse } from "next/server";
import { addComment } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await req.json();
  const comment = await addComment(b.meetingId, b.atMs, b.author ?? "You", b.body);
  return NextResponse.json({ comment }, { status: 201 });
}
