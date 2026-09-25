import { NextResponse } from "next/server";
import { listCalendar } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await listCalendar();
  return NextResponse.json({ events });
}
