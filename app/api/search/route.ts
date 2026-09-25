import { NextResponse } from "next/server";
import { searchMeetings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const meetings = await searchMeetings(q);
  return NextResponse.json({ meetings });
}
