import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export async function GET(request: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const returnedState = url.searchParams.get("state");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?auth=error&reason=${encodeURIComponent(error)}`, url.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?auth=missing_code", url.origin));
  }

  const c = await cookies();
  const verifier = c.get("sp_pkce_verifier")?.value ?? null;
  const expectedState = c.get("sp_oauth_state")?.value ?? null;

  if (!verifier) {
    return NextResponse.redirect(
      new URL("/?auth=missing_verifier", url.origin)
    );
  }

  // Recommended: validate state (prevents CSRF)
  if (expectedState && returnedState && expectedState !== returnedState) {
    return NextResponse.redirect(new URL("/?auth=state_mismatch", url.origin));
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

  const res = NextResponse.redirect(new URL("/?auth=ok", url.origin));

  // Clear temporary cookies
  res.cookies.delete("sp_pkce_verifier");
  res.cookies.delete("sp_oauth_state");

  // Store access token (HttpOnly)
  res.cookies.set("sp_access_token", t.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: Math.max(60, Math.min(t.expires_in, 3600)),
  });

  return res;
}


//! OLD CODE BEFORE FIXES FOR ASYNC COOKIE ACCESS
// import { NextResponse } from "next/server";
// import { clearPkceVerifier, getPkceVerifier, setAccessToken } from "@/src/lib/auth";

// type TokenResponse = {
//   access_token: string;
//   token_type: string;
//   expires_in: number;
//   refresh_token?: string;
//   scope: string;
// };

// export async function GET(req: Request) {
//   const clientId = process.env.SPOTIFY_CLIENT_ID;
//   const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

//   if (!clientId || !redirectUri) {
//     return NextResponse.json(
//       { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI" },
//       { status: 500 }
//     );
//   }

//   const url = new URL(req.url);
//   const code = url.searchParams.get("code");
//   const error = url.searchParams.get("error");

//   if (error) {
//     return NextResponse.redirect(
//       new URL(`/?auth=error&reason=${encodeURIComponent(error)}`, url.origin)
//     );
//   }

//   if (!code) {
//     return NextResponse.redirect(new URL("/?auth=missing_code", url.origin));
//   }

//   // ✅ FIX: await cookie access
//   const verifier = await getPkceVerifier();
//   if (!verifier) {
//     return NextResponse.redirect(
//       new URL("/?auth=missing_verifier", url.origin)
//     );
//   }

//   const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       client_id: clientId,
//       grant_type: "authorization_code",
//       code,
//       redirect_uri: redirectUri,
//       code_verifier: verifier,
//     }),
//   });

//   if (!tokenRes.ok) {
//     const txt = await tokenRes.text().catch(() => "");
//     return NextResponse.json(
//       { error: "Token exchange failed", detail: txt },
//       { status: 500 }
//     );
//   }

//   const t = (await tokenRes.json()) as TokenResponse;

//   // ✅ FIX: await cookie writes
//   await clearPkceVerifier();
//   await setAccessToken(t.access_token, t.expires_in);

//   return NextResponse.redirect(new URL("/?auth=ok", url.origin));
// }
