#!/usr/bin/env node
import fs from "fs";
import { Command } from "commander";
import { parseListText, runCore, type MissItem } from "playlist-core";
import { initConfig, loadConfig, readJson, writeJson } from "./config.js";
import { authorizeWithPkce } from "./auth-node.js";

const program = new Command();

program.showHelpAfterError();
program.showSuggestionAfterError();

function readMisses(path: string): MissItem[] {
  if (!fs.existsSync(path)) return [];
  const data = readJson<{ misses?: MissItem[] }>(path, {});
  return Array.isArray(data.misses) ? data.misses : [];
}

program
  .name("simply-create-playlists")
  .description("Create a Spotify playlist from an Artist - Album list")
  .version("1.0.0");

program
  .command("init")
  .description("Create a local config file and .env template")
  .action(() => {
    initConfig();
  });

program
  .argument("[listPath]", "Path to list file", "playlist.txt")
  .option("-n, --name <string>", "Playlist name", "Simply Created Playlist")
  .option("--public", "Create a public playlist (default: private)", false)
  .option("--dry-run", "Do not create playlist or add tracks", false)
  .option(
    "--playlist-id <idOrUrl>",
    "Use an existing playlist id or Spotify URL"
  )
  .option(
    "--append",
    "Append to the playlist (default when using --playlist-id)",
    false
  )
  .option("--replace", "Clear the playlist before adding tracks", false)
  .option("--only-misses", "Only process entries in misses.json", false)
  .option("--top-track", "Add only the first track from each album", false)
  .option("--overrides-path <path>", "Path to overrides.json", "overrides.json")
  .option("--misses-path <path>", "Path to misses.json", "misses.json")
  .action(async (listPath: string, opts) => {
    const cfg = loadConfig();

    const overrides = readJson<Record<string, string>>(opts.overridesPath, {});

    const entries = opts.onlyMisses
      ? readMisses(opts.missesPath)
      : parseListText(fs.readFileSync(listPath, "utf8"));

    if (!entries.length) {
      console.log(
        opts.onlyMisses ? "No misses found to retry." : "No entries found."
      );
      return;
    }

    const tokens = await authorizeWithPkce(cfg);

    const result = await runCore({
      entries,
      overrides,
      playlistName: opts.name,
      isPublic: opts.public,
      dryRun: opts.dryRun,
      playlistId: opts.playlistId,
      append: opts.append || Boolean(opts.playlistId),
      replace: opts.replace,
      onlyMisses: opts.onlyMisses,
      topTrack: opts.topTrack,
      accessToken: tokens.access_token,
      description: opts.onlyMisses
        ? `Retrying misses from ${opts.missesPath}`
        : `Built from ${listPath} (album list → playlist)`,
    });

    writeJson(opts.missesPath, {
      generatedAt: new Date().toISOString(),
      playlistName: opts.name,
      listPath,
      onlyMisses: Boolean(opts.onlyMisses),
      dryRun: Boolean(opts.dryRun),
      topTrack: Boolean(opts.topTrack),
      playlistId: result.playlistId,
      playlistUrl: result.playlistUrl,
      misses: result.misses,
    });
  });

// If invoked with no args, show help instead of trying to run.
if (process.argv.length <= 2) {
  program.help(); // prints help + exits 0
}

await program.parseAsync(process.argv);
