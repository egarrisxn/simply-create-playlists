import { albumIdFromOverride, keyFor, parsePlaylistId } from "./normalize.js";
import {
  getAlbumTracks,
  addTracks,
  clearPlaylist,
  createPlaylist,
  getMe,
  searchAlbum,
} from "./spotify.js";

export * from "./list.js";
export * from "./normalize.js";
export * from "./spotify.js";

import { Entry, MissItem } from "./list.js";

export type RunCoreOptions = {
  entries: Entry[];
  overrides?: Record<string, string>;
  playlistName?: string;
  isPublic?: boolean;
  dryRun?: boolean;
  onlyMisses?: boolean;
  topTrack?: boolean;
  playlistId?: string;
  append?: boolean;
  replace?: boolean;
  accessToken: string;
  description?: string;
  onProgress?: (
    status: "loading" | "success" | "miss" | "error",
    message: string
  ) => void;
};

export type RunCoreResult = {
  playlistId: string | null;
  playlistUrl: string | null;
  misses: MissItem[];
};

export async function runCore(options: RunCoreOptions): Promise<RunCoreResult> {
  const log = (
    status: "loading" | "success" | "miss" | "error",
    msg: string
  ) => {
    if (options.onProgress) {
      options.onProgress(status, msg);
    } else {
      if (status === "loading") process.stdout.write(msg);
      else console.log(msg);
    }
  };

  const playlistName = options.playlistName || "Simply Created Playlist";
  const isPublic = options.isPublic ?? false;
  const dryRun = options.dryRun ?? false;
  const topTrack = options.topTrack ?? false;
  const overrides = options.overrides ?? {};
  const entries = options.entries;

  if (!entries.length) {
    return { playlistId: null, playlistUrl: null, misses: [] };
  }

  const token = options.accessToken;
  const suppliedPlaylistId = options.playlistId
    ? parsePlaylistId(options.playlistId)
    : null;
  const append = options.append ?? Boolean(suppliedPlaylistId);
  const replace = options.replace ?? false;

  let playlistId: string | null = null;
  let playlistUrl: string | null = null;

  if (dryRun) {
    log(
      "success",
      "\nDRY RUN enabled: will not create playlist or add tracks.\n"
    );
  } else if (suppliedPlaylistId) {
    playlistId = suppliedPlaylistId;
    log("success", `Using existing playlist: ${playlistId}`);
    if (replace || !append) {
      log("loading", "Clearing existing playlist tracks...");
      await clearPlaylist(token, playlistId);
      log("success", " Done.\n");
    }
  } else {
    const me = await getMe(token);
    const created = await createPlaylist(
      token,
      me.id,
      playlistName,
      isPublic,
      options.description || "Built from album list"
    );
    playlistId = created.id;
    playlistUrl = created.external_urls.spotify;
    log("success", `\nCreated playlist: ${playlistUrl}\n`);
  }

  const misses: MissItem[] = [];

  for (let i = 0; i < entries.length; i++) {
    const { artist, album } = entries[i];
    const key = keyFor(artist, album);

    log("loading", `[${i + 1}/${entries.length}] ${key} ... `);

    let albumId: string | null = null;
    const override = overrides[key];

    if (override) {
      albumId = albumIdFromOverride(override);
      log("loading", "(OVERRIDE) ");
    } else {
      const found = await searchAlbum(token, artist, album);
      if (!found) {
        log("miss", "MISS");
        misses.push({ artist, album });
        continue;
      }
      albumId = found.id;
    }

    if (!albumId) {
      log("miss", "MISS");
      misses.push({ artist, album });
      continue;
    }

    const trackUris = await getAlbumTracks(token, albumId);
    const toAdd = topTrack ? trackUris.slice(0, 1) : trackUris;

    if (!toAdd.length) {
      log("miss", "MISS (no tracks)");
      misses.push({ artist, album });
      continue;
    }

    if (dryRun) {
      log("success", `WOULD ADD (${toAdd.length} tracks)`);
      continue;
    }

    if (!playlistId) {
      log("error", "ERROR (no playlist)");
      misses.push({ artist, album });
      continue;
    }

    await addTracks(token, playlistId, toAdd);
    log("success", `OK (${toAdd.length} tracks)`);
  }

  log("success", "\nDone.");
  return { playlistId, playlistUrl, misses };
}
