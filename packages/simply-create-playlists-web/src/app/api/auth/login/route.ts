import { NextResponse } from "next/server";
import { randomVerifier, sha256Base64Url } from "@/src/lib/pkce";

const SCOPES = ["playlist-modify-private", "playlist-modify-public"] as const;

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const verifier = randomVerifier(64);
  const challenge = await sha256Base64Url(verifier);
  const state = randomVerifier(16);

  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
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



//! OLD CODE BEFORE FIXES FOR ASYNC COOKIE ACCESS
// import { NextResponse } from "next/server";
// import { randomVerifier, sha256Base64Url } from "@/src/lib/pkce";
// import { setPkceVerifier } from "@/src/lib/auth";

// const SCOPES = ["playlist-modify-private", "playlist-modify-public"] as const;

// export async function GET() {
//   const clientId = process.env.SPOTIFY_CLIENT_ID;
//   const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

//   if (!clientId || !redirectUri) {
//     return NextResponse.json(
//       { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI" },
//       { status: 500 }
//     );
//   }

//   const verifier = randomVerifier(64);
//   const challenge = await sha256Base64Url(verifier);
//   const state = randomVerifier(16);

//   await setPkceVerifier(verifier);

//   const url =
//     "https://accounts.spotify.com/authorize?" +
//     new URLSearchParams({
//       response_type: "code",
//       client_id: clientId,
//       redirect_uri: redirectUri,
//       scope: SCOPES.join(" "),
//       state,
//       code_challenge_method: "S256",
//       code_challenge: challenge,
//     }).toString();

//   return NextResponse.redirect(url);
// }
