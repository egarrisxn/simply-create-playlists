import { NextResponse } from "next/server";
import { clearPkceVerifier, getPkceVerifier, setAccessToken } from "@/src/lib/auth";

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export async function GET(req: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?auth=error&reason=${encodeURIComponent(error)}`, url.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?auth=missing_code", url.origin));
  }

  // ✅ FIX: await cookie access
  const verifier = await getPkceVerifier();
  if (!verifier) {
    return NextResponse.redirect(
      new URL("/?auth=missing_verifier", url.origin)
    );
  }

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text().catch(() => "");
    return NextResponse.json(
      { error: "Token exchange failed", detail: txt },
      { status: 500 }
    );
  }

  const t = (await tokenRes.json()) as TokenResponse;

  // ✅ FIX: await cookie writes
  await clearPkceVerifier();
  await setAccessToken(t.access_token, t.expires_in);

  return NextResponse.redirect(new URL("/?auth=ok", url.origin));
}
