#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { Command } from "commander";
import { parseListText, runCore, type MissItem } from "playlist-core";
import { initConfig, loadConfig, readJson, writeJson } from "./config.js";
import {
  authorizeWithPkce,
  refreshAccessToken,
  type TokenResponse,
} from "./auth-node.js";

const program = new Command();

const TOKEN_CACHE = path.join(process.cwd(), ".tokens.json");

program.showHelpAfterError().showSuggestionAfterError();

function readMisses(path: string): MissItem[] {
  if (!fs.existsSync(path)) return [];
  const data = readJson<{ misses?: MissItem[] }>(path, {});
  return Array.isArray(data.misses) ? data.misses : [];
}

program
  .name("simply-create-playlists")
  .description("Create a Spotify playlist from an Artist - Album list")
  .version("1.0.2");

program
  .command("init")
  .description("Create a local config file and .env template")
  .action(() => initConfig());

program
  .argument("[listPath]", "Path to list file", "playlist.txt")
  .option("-n, --name <string>", "Playlist name", "Simply Created Playlist")
  .option("--public", "Create a public playlist", false)
  .option("--dry-run", "Do not create playlist", false)
  .option("--playlist-id <idOrUrl>", "Existing playlist id")
  .option("--append", "Append tracks", false)
  .option("--replace", "Replace tracks", false)
  .option("--only-misses", "Only retry failures", false)
  .option("--top-track", "Only add one track per album", false)
  .option("--overrides-path <path>", "Path to overrides.json", "overrides.json")
  .option("--misses-path <path>", "Path to misses.json", "misses.json")
  .action(async (listPath: string, opts) => {
    const cfg = loadConfig();
    let tokens = readJson<TokenResponse | null>(TOKEN_CACHE, null);

    // 1. Try Refreshing if possible
    if (tokens?.refresh_token) {
      try {
        const refreshed = await refreshAccessToken({
          clientCliId: cfg.clientCliId,
          refreshToken: tokens.refresh_token,
        });
        // Refresh token might not always be returned in a refresh call,
        // so we merge with existing to keep the original refresh_token
        tokens = { ...tokens, ...refreshed };
        writeJson(TOKEN_CACHE, tokens);
      } catch (e) {
        console.log("Session expired. Re-authorizing...");
        tokens = null;
      }
    }

    // 2. Full Auth if no valid tokens
    if (!tokens) {
      tokens = await authorizeWithPkce(cfg);
      writeJson(TOKEN_CACHE, tokens);
    }

    const overrides = readJson<Record<string, string>>(opts.overridesPath, {});
    const entries = opts.onlyMisses
      ? readMisses(opts.missesPath)
      : parseListText(fs.readFileSync(listPath, "utf8"));

    if (!entries.length) {
      console.log(
        opts.onlyMisses ? "No misses to retry." : "No entries found."
      );
      return;
    }

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
        : `Built from ${listPath}`,
    });

    writeJson(opts.missesPath, {
      generatedAt: new Date().toISOString(),
      playlistId: result.playlistId,
      playlistUrl: result.playlistUrl,
      misses: result.misses,
    });
  });

if (process.argv.length <= 2) {
  program.help();
}

await program.parseAsync(process.argv);
