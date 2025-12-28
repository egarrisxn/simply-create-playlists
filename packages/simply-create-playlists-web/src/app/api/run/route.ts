import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parseListText, runCore } from "playlist-core";
import { getAccessToken } from "../../../lib/auth";

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
  const c = await cookies();

  console.log("[/api/run] host:", req.headers.get("host"));
  console.log("[/api/run] origin:", req.headers.get("origin"));
  console.log("[/api/run] has token cookie:", Boolean(c.get("sp_access_token")?.value));

  console.log("[/api/run] cookie keys:", c.getAll().map(x => x.name));

  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json()) as Body;
  const entries = parseListText(body.listText ?? "");

  if (!entries.length) {
    return NextResponse.json({ error: "Your list is empty or invalid format." }, { status: 400 });
  }

  const result = await runCore({
    ...body,
    entries,
    accessToken: token,
    onProgress: (status, msg) => {
      // This will show up in your terminal/Vercel logs
      console.log(`[API RUN] ${status.toUpperCase()}: ${msg}`);
    },
  });

  return NextResponse.json(result);
}