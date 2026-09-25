import { NextResponse } from "next/server";
import { removeHighlight } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await removeHighlight(id);
  return NextResponse.json({ ok: true });
}
