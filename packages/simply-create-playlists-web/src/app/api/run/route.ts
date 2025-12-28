import { NextResponse } from "next/server";
import { parseListText, runCore } from "playlist-core";
import { getAccessToken } from "@/src/lib/auth";

type Body = {
  listText: string;
  playlistName?: string;
  isPublic?: boolean;
  dryRun?: boolean;
  topTrack?: boolean;
  playlistId?: string;
  replace?: boolean;
  append?: boolean;
  overrides?: Record<string, string>;
};

export async function POST(req: Request) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as Body;

  const listText = body.listText ?? "";
  const entries = parseListText(listText);

  if (!entries.length) {
    return NextResponse.json({ error: "No entries found" }, { status: 400 });
  }

  const result = await runCore({
    entries,
    overrides: body.overrides ?? {},
    playlistName: body.playlistName,
    isPublic: body.isPublic ?? false,
    dryRun: body.dryRun ?? false,
    topTrack: body.topTrack ?? false,
    playlistId: body.playlistId,
    replace: body.replace ?? false,
    append: body.append,
    accessToken: token,
    description: "Built with simply-create-playlists web",
  });

  return NextResponse.json(result);
}
