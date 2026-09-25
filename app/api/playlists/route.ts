import { NextResponse } from "next/server";
import { createPlaylist, listPlaylists } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const playlists = await listPlaylists();
  return NextResponse.json({ playlists });
}

export async function POST(req: Request) {
  const b = await req.json();
  const playlist = await createPlaylist(b.name ?? "New playlist", b.ownerId);
  return NextResponse.json({ playlist }, { status: 201 });
}
