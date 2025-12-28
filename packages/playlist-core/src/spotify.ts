import { normalize } from "./normalize.js";

export type AlbumTracksPage = {
  items: Array<{ uri: string }>;
  next: string | null;
};

export type SearchAlbumResult = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  uri: string;
};

export type SpotifySearchAlbumsResponse = {
  albums: {
    items: SearchAlbumResult[];
  };
};

export const SCOPES = [
  "playlist-modify-private",
  "playlist-modify-public",
] as const;

export async function spotifyFetch<T>(
  url: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Spotify API error ${res.status}: ${txt}`);
  }

  return (await res.json()) as T;
}

export async function getMe(token: string) {
  return spotifyFetch<{ id: string }>("https://api.spotify.com/v1/me", token);
}

export async function createPlaylist(
  token: string,
  userId: string,
  name: string,
  isPublic: boolean,
  description: string
) {
  return spotifyFetch<{ id: string; external_urls: { spotify: string } }>(
    `https://api.spotify.com/v1/users/${encodeURIComponent(userId)}/playlists`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ name, public: isPublic, description }),
    }
  );
}

export async function searchAlbum(
  token: string,
  artist: string,
  album: string
) {
  const targetA = normalize(artist);
  const targetB = normalize(album);

  const strictQ = `album:${album} artist:${artist}`;
  const strictUrl =
    `https://api.spotify.com/v1/search?type=album&limit=10&q=` +
    encodeURIComponent(strictQ);

  const strict = await spotifyFetch<SpotifySearchAlbumsResponse>(
    strictUrl,
    token
  );

  const strictBest =
    strict.albums.items.find(
      (it) =>
        normalize(it.name) === targetB &&
        normalize(it.artists[0]?.name || "") === targetA
    ) ||
    strict.albums.items.find((it) => normalize(it.name) === targetB) ||
    null;

  if (strictBest) return strictBest;

  const looseQ = `${artist} ${album}`;
  const looseUrl =
    `https://api.spotify.com/v1/search?type=album&limit=10&q=` +
    encodeURIComponent(looseQ);

  const loose = await spotifyFetch<SpotifySearchAlbumsResponse>(
    looseUrl,
    token
  );

  const sameArtist = loose.albums.items.filter(
    (it) => normalize(it.artists[0]?.name || "") === targetA
  );

  const pool = sameArtist.length ? sameArtist : loose.albums.items;

  const contains =
    pool.find((it) => normalize(it.name).includes(targetB)) ||
    pool.find((it) => targetB.includes(normalize(it.name)));

  return contains || pool[0] || null;
}

export async function getAlbumTracks(token: string, albumId: string) {
  const uris: string[] = [];
  let next: string | null =
    `https://api.spotify.com/v1/albums/${encodeURIComponent(albumId)}` +
    `/tracks?limit=50`;

  while (next) {
    const page: AlbumTracksPage = await spotifyFetch<AlbumTracksPage>(
      next,
      token
    );
    uris.push(...page.items.map((t) => t.uri));
    next = page.next;
  }

  return uris;
}

export async function addTracks(
  token: string,
  playlistId: string,
  uris: string[]
) {
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);
    await spotifyFetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(
        playlistId
      )}/tracks`,
      token,
      { method: "POST", body: JSON.stringify({ uris: chunk }) }
    );
  }
}

export async function clearPlaylist(token: string, playlistId: string) {
  await spotifyFetch(
    `https://api.spotify.com/v1/playlists/${encodeURIComponent(
      playlistId
    )}/tracks`,
    token,
    { method: "PUT", body: JSON.stringify({ uris: [] }) }
  );
}

// import nodeCrypto from "crypto";
// import http, { type IncomingMessage, type ServerResponse } from "http";
// import open from "open";
// import { base64Url, sha256, normalize } from "./normalize.js";

// export type TokenResponse = {
//   access_token: string;
//   expires_in: number;
//   refresh_token?: string;
// };

// export type AlbumTracksPage = {
//   items: Array<{ uri: string }>;
//   next: string | null;
// };

// export type SearchAlbumResult = {
//   id: string;
//   name: string;
//   artists: Array<{ name: string }>;
//   uri: string;
// };

// export type SpotifySearchAlbumsResponse = {
//   albums: {
//     items: SearchAlbumResult[];
//   };
// };

// export const SCOPES = [
//   "playlist-modify-private",
//   "playlist-modify-public",
// ] as const;

// export async function spotifyFetch<T>(
//   url: string,
//   token: string,
//   init?: RequestInit
// ): Promise<T> {
//   const res = await fetch(url, {
//     ...init,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//       ...(init?.headers || {}),
//     },
//   });

//   if (!res.ok) {
//     const txt = await res.text().catch(() => "");
//     throw new Error(`Spotify API error ${res.status}: ${txt}`);
//   }

//   return (await res.json()) as T;
// }

// export async function authorizeWithPkce(params: {
//   clientId: string;
//   redirectUri: string;
//   port: number;
// }): Promise<TokenResponse> {
//   const { clientId, redirectUri, port } = params;

//   const verifier = base64Url(nodeCrypto.randomBytes(64));
//   const challenge = base64Url(sha256(verifier));
//   const state = base64Url(nodeCrypto.randomBytes(16));

//   const authUrl =
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

//   const tokens = await new Promise<TokenResponse>((resolve, reject) => {
//     const server = http.createServer(
//       async (req: IncomingMessage, res: ServerResponse) => {
//         try {
//           const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
//           if (url.pathname !== "/callback") {
//             res.writeHead(404).end("Not found");
//             return;
//           }

//           const code = url.searchParams.get("code") || "";
//           const returnedState = url.searchParams.get("state") || "";
//           if (!code) throw new Error("Missing code");
//           if (returnedState !== state) throw new Error("State mismatch");

//           const tokenRes = await fetch(
//             "https://accounts.spotify.com/api/token",
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/x-www-form-urlencoded" },
//               body: new URLSearchParams({
//                 client_id: clientId,
//                 grant_type: "authorization_code",
//                 code,
//                 redirect_uri: redirectUri,
//                 code_verifier: verifier,
//               }),
//             }
//           );

//           if (!tokenRes.ok) {
//             throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
//           }

//           const t = (await tokenRes.json()) as TokenResponse;

//           res.writeHead(200, { "Content-Type": "text/plain" });
//           res.end(
//             "✅ Authorized. You can close this tab and return to your terminal."
//           );

//           server.close();
//           resolve(t);
//         } catch (e) {
//           try {
//             res.writeHead(500, { "Content-Type": "text/plain" });
//             res.end("❌ Error. Check terminal logs.");
//           } catch {}
//           server.close();
//           reject(e);
//         }
//       }
//     );

//     server.listen(port, "127.0.0.1", () => {
//       console.log(`Auth server running on http://127.0.0.1:${port}`);
//       console.log("Opening Spotify authorization in your browser...");
//       void open(authUrl);
//     });
//   });

//   return tokens;
// }

// export async function getMe(token: string) {
//   return spotifyFetch<{ id: string }>("https://api.spotify.com/v1/me", token);
// }

// export async function createPlaylist(
//   token: string,
//   userId: string,
//   name: string,
//   isPublic: boolean,
//   description: string
// ) {
//   return spotifyFetch<{ id: string; external_urls: { spotify: string } }>(
//     `https://api.spotify.com/v1/users/${encodeURIComponent(userId)}/playlists`,
//     token,
//     {
//       method: "POST",
//       body: JSON.stringify({ name, public: isPublic, description }),
//     }
//   );
// }

// export async function searchAlbum(
//   token: string,
//   artist: string,
//   album: string
// ) {
//   const targetA = normalize(artist);
//   const targetB = normalize(album);

//   const strictQ = `album:${album} artist:${artist}`;
//   const strictUrl =
//     `https://api.spotify.com/v1/search?type=album&limit=10&q=` +
//     encodeURIComponent(strictQ);

//   const strict = await spotifyFetch<SpotifySearchAlbumsResponse>(
//     strictUrl,
//     token
//   );

//   const strictBest =
//     strict.albums.items.find(
//       (it) =>
//         normalize(it.name) === targetB &&
//         normalize(it.artists[0]?.name || "") === targetA
//     ) ||
//     strict.albums.items.find((it) => normalize(it.name) === targetB) ||
//     null;

//   if (strictBest) return strictBest;

//   const looseQ = `${artist} ${album}`;
//   const looseUrl =
//     `https://api.spotify.com/v1/search?type=album&limit=10&q=` +
//     encodeURIComponent(looseQ);

//   const loose = await spotifyFetch<SpotifySearchAlbumsResponse>(
//     looseUrl,
//     token
//   );

//   const sameArtist = loose.albums.items.filter(
//     (it) => normalize(it.artists[0]?.name || "") === targetA
//   );

//   const pool = sameArtist.length ? sameArtist : loose.albums.items;

//   const contains =
//     pool.find((it) => normalize(it.name).includes(targetB)) ||
//     pool.find((it) => targetB.includes(normalize(it.name)));

//   return contains || pool[0] || null;
// }

// export async function getAlbumTracks(token: string, albumId: string) {
//   const uris: string[] = [];
//   let next:
//     | string
//     | null = `https://api.spotify.com/v1/albums/${encodeURIComponent(
//     albumId
//   )}/tracks?limit=50`;

//   while (next) {
//     const page: AlbumTracksPage = await spotifyFetch<AlbumTracksPage>(
//       next,
//       token
//     );
//     uris.push(...page.items.map((t) => t.uri));
//     next = page.next;
//   }

//   return uris;
// }

// export async function addTracks(
//   token: string,
//   playlistId: string,
//   uris: string[]
// ) {
//   for (let i = 0; i < uris.length; i += 100) {
//     const chunk = uris.slice(i, i + 100);
//     await spotifyFetch(
//       `https://api.spotify.com/v1/playlists/${encodeURIComponent(
//         playlistId
//       )}/tracks`,
//       token,
//       { method: "POST", body: JSON.stringify({ uris: chunk }) }
//     );
//   }
// }

// export async function clearPlaylist(token: string, playlistId: string) {
//   await spotifyFetch(
//     `https://api.spotify.com/v1/playlists/${encodeURIComponent(
//       playlistId
//     )}/tracks`,
//     token,
//     { method: "PUT", body: JSON.stringify({ uris: [] }) }
//   );
// }
