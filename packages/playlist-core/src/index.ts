import { albumIdFromOverride, keyFor, parsePlaylistId } from "./normalize.js";
import type { Entry, MissItem } from "./list.js";
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

export type RunCoreOptions = {
  entries: Entry[];
  overrides?: Record<string, string>;
  playlistName?: string;
  isPublic?: boolean;
  dryRun?: boolean;
  onlyMisses?: boolean;
  topTrack?: boolean;

  playlistId?: string; // optional: raw id or url
  append?: boolean; // default: true if playlistId provided
  replace?: boolean; // clear before adding

  accessToken: string;

  description?: string; // optional override
};

export type RunCoreResult = {
  playlistId: string | null;
  playlistUrl: string | null;
  misses: MissItem[];
};

export async function runCore(options: RunCoreOptions): Promise<RunCoreResult> {
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
    console.log("\nDRY RUN enabled: will not create playlist or add tracks.\n");
  } else if (suppliedPlaylistId) {
    playlistId = suppliedPlaylistId;
    console.log(`Using existing playlist: ${playlistId}`);
    if (replace) {
      console.log("Replacing: clearing existing playlist first...");
      await clearPlaylist(token, playlistId);
    } else if (!append) {
      console.log(
        "append=false detected without --replace; clearing playlist first..."
      );
      await clearPlaylist(token, playlistId);
    }
  } else {
    const me = await getMe(token);
    const created = await createPlaylist(
      token,
      me.id,
      playlistName,
      isPublic,
      options.description || "Built from album list (album list → playlist)"
    );
    playlistId = created.id;
    playlistUrl = created.external_urls.spotify;
    console.log(`\nCreated playlist: ${playlistUrl}\n`);
  }

  const misses: MissItem[] = [];

  for (let i = 0; i < entries.length; i++) {
    const { artist, album } = entries[i];
    const key = keyFor(artist, album);

    process.stdout.write(`[${i + 1}/${entries.length}] ${key} ... `);

    let albumId: string | null = null;

    const override = overrides[key];
    if (override) {
      albumId = albumIdFromOverride(override);
      process.stdout.write("OVERRIDE ");
    } else {
      const found = await searchAlbum(token, artist, album);
      if (!found) {
        console.log("MISS");
        misses.push({ artist, album });
        continue;
      }
      albumId = found.id;
    }

    if (!albumId) {
      console.log("MISS");
      misses.push({ artist, album });
      continue;
    }

    const trackUris = await getAlbumTracks(token, albumId);
    const toAdd = topTrack ? trackUris.slice(0, 1) : trackUris;

    if (!toAdd.length) {
      console.log("MISS (no tracks)");
      misses.push({ artist, album });
      continue;
    }

    if (dryRun) {
      console.log(`WOULD ADD (${toAdd.length} tracks)`);
      continue;
    }

    if (!playlistId) {
      console.log("ERROR (no playlist)");
      misses.push({ artist, album });
      continue;
    }

    await addTracks(token, playlistId, toAdd);
    console.log(`OK (${toAdd.length} tracks)`);
  }

  console.log("\nDone.");
  return { playlistId, playlistUrl, misses };
}
