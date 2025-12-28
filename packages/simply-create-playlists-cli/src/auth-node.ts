import nodeCrypto from "crypto";
import http, { type IncomingMessage, type ServerResponse } from "http";
import open from "open";

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

const SCOPES = ["playlist-modify-private", "playlist-modify-public"];

const BASE_URL = "https://accounts.spotify.com";

function base64Url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sha256(v: string) {
  return nodeCrypto.createHash("sha256").update(v).digest();
}

export async function refreshAccessToken(params: {
  clientCliId: string;
  refreshToken: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: params.clientCliId,
      grant_type: "refresh_token",
      refresh_token: params.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Refresh failed: ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function authorizeWithPkce(params: {
  clientCliId: string;
  redirectCliUri: string;
  port: number;
}): Promise<TokenResponse> {
  const { clientCliId, redirectCliUri, port } = params;

  const verifier = base64Url(nodeCrypto.randomBytes(64));
  const challenge = base64Url(sha256(verifier));
  const state = base64Url(nodeCrypto.randomBytes(16));

  const authUrl =
    `${BASE_URL}/authorize?` +
    new URLSearchParams({
      response_type: "code",
      client_id: clientCliId,
      redirect_uri: redirectCliUri,
      scope: SCOPES.join(" "),
      state,
      code_challenge_method: "S256",
      code_challenge: challenge,
    }).toString();

  return new Promise<TokenResponse>((resolve, reject) => {
    const server = http.createServer(
      async (req: IncomingMessage, res: ServerResponse) => {
        try {
          const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
          if (url.pathname !== "/callback") {
            res.writeHead(404).end("Not found");
            return;
          }

          const code = url.searchParams.get("code") || "";
          const returnedState = url.searchParams.get("state") || "";
          if (!code) throw new Error("Missing code");
          if (returnedState !== state) throw new Error("State mismatch");

          const tokenRes = await fetch(`${BASE_URL}/api/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: clientCliId,
              grant_type: "authorization_code",
              code,
              redirect_uri: redirectCliUri,
              code_verifier: verifier,
            }),
          });

          if (!tokenRes.ok) {
            throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
          }

          const t = (await tokenRes.json()) as TokenResponse;

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("✅ Authorized. You can close this tab.");

          server.close();
          resolve(t);
        } catch (e) {
          res.writeHead(500).end("❌ Error in terminal.");
          server.close();
          reject(e);
        }
      }
    );

    server.listen(port, "127.0.0.1", () => {
      console.log(`Auth server running on http://127.0.0.1:${port}`);
      void open(authUrl);
    });
  });
}
