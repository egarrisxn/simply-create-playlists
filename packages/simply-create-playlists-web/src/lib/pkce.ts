function base64UrlFromBytes(bytes: Uint8Array) {
  const bin = String.fromCharCode(...bytes);
  const b64 = Buffer.from(bin, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomVerifier(length = 64) {
  // PKCE verifier: 43-128 chars. We'll use 64 bytes -> base64url
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return base64UrlFromBytes(bytes);
}

export async function sha256Base64Url(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlFromBytes(new Uint8Array(digest));
}
