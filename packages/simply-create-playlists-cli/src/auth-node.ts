import nodeCrypto from "crypto";
import http, { type IncomingMessage, type ServerResponse } from "http";
import open from "open";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

const SCOPES = ["playlist-modify-private", "playlist-modify-public"] as const;

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

export async function authorizeWithPkce(params: {
  clientId: string;
  redirectUri: string;
  port: number;
}): Promise<TokenResponse> {
  const { clientId, redirectUri, port } = params;

  const verifier = base64Url(nodeCrypto.randomBytes(64));
  const challenge = base64Url(sha256(verifier));
  const state = base64Url(nodeCrypto.randomBytes(16));

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

  const tokens = await new Promise<TokenResponse>((resolve, reject) => {
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

          const tokenRes = await fetch(
            "https://accounts.spotify.com/api/token",
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: clientId,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                code_verifier: verifier,
              }),
            }
          );

          if (!tokenRes.ok) {
            throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
          }

          const t = (await tokenRes.json()) as TokenResponse;

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(
            "✅ Authorized. You can close this tab and return to your terminal."
          );

          server.close();
          resolve(t);
        } catch (e) {
          try {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("❌ Error. Check terminal logs.");
          } catch {}
          server.close();
          reject(e);
        }
      }
    );

    server.listen(port, "127.0.0.1", () => {
      console.log(`Auth server running on http://127.0.0.1:${port}`);
      console.log("Opening Spotify authorization in your browser...");
      void open(authUrl);
    });
  });

  return tokens;
}
