import { NextResponse } from "next/server";
import { toggleActionItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await toggleActionItem(id);
  return NextResponse.json({ ok: true });
}
