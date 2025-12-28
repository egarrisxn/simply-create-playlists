import { NextResponse } from "next/server";
import { randomVerifier, sha256Base64Url } from "../../../../lib/pkce";
import { SPOTIFY_AUTHORIZE_URL } from "../../../../lib/constants";

const SCOPES = ["playlist-modify-private", "playlist-modify-public"] as const;

export async function GET() {
  const clientWebId = process.env.SPOTIFY_WEB_CLIENT_ID;
  const redirectWebUri = process.env.SPOTIFY_WEB_REDIRECT_URI;

if (!redirectWebUri) {
  return NextResponse.json({ error: "Missing SPOTIFY_WEB_REDIRECT_URI" }, { status: 500 });
}

if (redirectWebUri.includes(":5173") || redirectWebUri.endsWith("/callback")) {
  throw new Error("Web app is reading CLI redirect URI. Check env scoping.");
}

  if (!clientWebId || !redirectWebUri) {
    return NextResponse.json(
      { error: "Missing SPOTIFY_WEB_CLIENT_ID or SPOTIFY_WEB_REDIRECT_URI" },
      { status: 500 }
    );
  }

    console.log("[WEB LOGIN] redirectWebUri =", process.env.SPOTIFY_WEB_REDIRECT_URI);

  const verifier = randomVerifier(64);
  const challenge = await sha256Base64Url(verifier);
  const state = randomVerifier(16);

  const authUrl =
    `${SPOTIFY_AUTHORIZE_URL}?` +
    new URLSearchParams({
      response_type: "code",
      client_id: clientWebId,
      redirect_uri: redirectWebUri,
      scope: SCOPES.join(" "),
      state,
      code_challenge_method: "S256",
      code_challenge: challenge,
    }).toString();

  const res = NextResponse.redirect(authUrl);

  // Store verifier + state (HttpOnly) so callback can validate + exchange token
  res.cookies.set("sp_pkce_verifier", verifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 10 * 60,
  });

  res.cookies.set("sp_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 10 * 60,
  });

  return res;
}