import { cookies } from "next/headers";

const VERIFIER_COOKIE = "sp_pkce_verifier";
const ACCESS_COOKIE = "sp_access_token";

export async function setPkceVerifier(verifier: string) {
  const c = await cookies();
  c.set(VERIFIER_COOKIE, verifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true on HTTPS in prod
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });
}

export async function getPkceVerifier() {
  const c = await cookies();
  return c.get(VERIFIER_COOKIE)?.value ?? null;
}

export async function clearPkceVerifier() {
  const c = await cookies();
  c.delete(VERIFIER_COOKIE);
}

export async function setAccessToken(token: string, expiresInSeconds: number) {
  const c = await cookies();
  c.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true on HTTPS in prod
    path: "/",
    maxAge: Math.max(60, Math.min(expiresInSeconds, 3600)),
  });
}

export async function getAccessToken() {
  const c = await cookies();
  return c.get(ACCESS_COOKIE)?.value ?? null;
}

export async function clearAccessToken() {
  const c = await cookies();
  c.delete(ACCESS_COOKIE);
}
