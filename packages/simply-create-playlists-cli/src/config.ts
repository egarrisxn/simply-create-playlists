import fs from "fs";
import "dotenv/config";

export type LocalConfig = {
  clientId?: string;
  redirectUri?: string;
  port?: number;
};

export const CONFIG_PATH = ".simply-create-playlists.json";

export function readJson<T>(path: string, fallback: T): T {
  try {
    if (!fs.existsSync(path)) return fallback;
    return JSON.parse(fs.readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(path: string, data: unknown) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function loadConfig(): {
  clientId: string;
  redirectUri: string;
  port: number;
} {
  const cfg = readJson<LocalConfig>(CONFIG_PATH, {});
  const clientId = process.env.SPOTIFY_CLIENT_ID || cfg.clientId;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || cfg.redirectUri;
  const port = Number(process.env.SPOTIFY_PORT || cfg.port || 5173);

  if (!clientId || !redirectUri) {
    throw new Error(
      `Missing Spotify config.\n` +
        `Set SPOTIFY_CLIENT_ID + SPOTIFY_REDIRECT_URI in .env, or run:\n` +
        `  simply-create-playlists init`
    );
  }

  return { clientId, redirectUri, port };
}

export function initConfig() {
  const existsCfg = fs.existsSync(CONFIG_PATH);
  const existsEnv = fs.existsSync(".env");

  if (!existsCfg) {
    writeJson(CONFIG_PATH, {
      clientId: "PASTE_YOUR_SPOTIFY_CLIENT_ID_HERE",
      redirectUri: "http://127.0.0.1:5173/callback",
      port: 5173,
    });
    console.log(`Created ${CONFIG_PATH}`);
  } else {
    console.log(`${CONFIG_PATH} already exists (skipping).`);
  }

  if (!existsEnv) {
    fs.writeFileSync(
      ".env",
      [
        "SPOTIFY_CLIENT_ID=",
        "SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback",
        "SPOTIFY_PORT=5173",
        "",
      ].join("\n"),
      "utf8"
    );
    console.log("Created .env template");
  } else {
    console.log(".env already exists (skipping).");
  }

  console.log("\nNext:");
  console.log(
    "1) Put your Client ID into .env or .simply-create-playlists.json"
  );
  console.log("2) Add this Redirect URI in Spotify Dev Dashboard:");
  console.log("   http://127.0.0.1:5173/callback");
}
