# 🎧 Playlist Factory – Usage Guide

Welcome to your **playlist-making factory**.  
This monorepo gives you multiple ways to generate Spotify playlists—from power-user CLI commands to a clean web UI—all powered by the same core logic.

---

## 1. CLI Usage (Power User Mode)

The CLI is the fastest and most flexible way to create playlists.  
You can control behavior using flags—no code changes required.

### Basic Usage
pnpm dev playlist.txt

### Useful Flags

Preview without touching Spotify  
pnpm dev playlist.txt --dry-run

Add only the top track from each album  
pnpm dev playlist.txt --top-track

Append to an existing playlist  
pnpm dev playlist.txt --playlist-id YOUR_PLAYLIST_ID --append

Think of the CLI as your automation engine—perfect for large lists and repeatable workflows.

---

## 2. Web App (Visual Mode)

When you want a clean UI instead of a terminal window, the web app has you covered.

Start the Web Server  
pnpm dev:web

Open in Browser  
http://127.0.0.1:3000

What You Can Do:
- Log in with Spotify
- Paste your album list into a text area
- Watch real-time progress as tracks are found
- Create playlists using the same core logic as the CLI

---

## 3. playlist-core (The Brain)

playlist-core is the heart of the entire system.

Because it’s a standalone package:
- The CLI uses it
- The Web app uses it
- Any future app can use it

Example:
You could build a Discord bot by importing runCore from playlist-core without rewriting any Spotify logic.

---

## 4. Handling Misses (Cleanup Workflow)

Spotify isn’t perfect—sometimes album names don’t match exactly.

After running the CLI, check for:
misses.json

This file lists every album that could not be found.

You can fix these by creating an overrides.json file that maps your input to exact Spotify links.

---

## 5. Maintenance Workflow

If you update playlist-core, rebuild everything that depends on it.

Clean old builds  
pnpm clean

Rebuild the factory  
pnpm build

Run again  
pnpm dev playlist.txt

---

## Next Steps

Since your CLI is working, try starting the Web UI with pnpm dev:web and confirm it can connect to your Spotify account.
