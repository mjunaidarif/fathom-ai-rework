import { NextResponse } from "next/server";
import { listMeetings } from "@/lib/db";
import { askFathom } from "@/lib/ask";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await req.json();
  const meetings = await listMeetings();
  const result = askFathom(b.question ?? "", meetings);
  return NextResponse.json(result);
}
