# Simply Create Playlists

A pnpm workspace for creating Spotify playlists from simple **Artist – Album** lists.

This repository is structured as a small monorepo with a reusable core library and a CLI wrapper. The recommended workflow is to build once, then run the CLI from the workspace root.

---

## Repository Structure

    simply-create-playlists/
    ├─ packages/
    │  ├─ playlist-core/                # Core playlist + Spotify logic
    │  └─ simply-create-playlists-cli/  # CLI wrapper
    ├─ playlist.txt                     # Your album list (Artist - Album)
    ├─ .env                             # Spotify credentials (not committed)
    ├─ .simply-create-playlists-cli.json# Optional local config (not committed)
    ├─ misses.json                      # Generated output (not committed)
    ├─ pnpm-workspace.yaml
    └─ package.json                    # Workspace root

---

## Requirements

- Node.js 18 or newer (tested on Node 25)
- pnpm
- A Spotify Developer application (Client ID required)

---

## Installation

From the workspace root:

    pnpm install

---

## Initial Setup (Spotify)

Run the CLI init command once to generate config templates:

    pnpm cli init

This creates:

- .env
- .simply-create-playlists-cli.json

Fill in your Spotify Client ID in one of them.

Example .env:

    SPOTIFY_CLIENT_ID=your_client_id_here
    SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
    SPOTIFY_PORT=5173

Then add the redirect URI to your Spotify Developer Dashboard:

    http://127.0.0.1:5173/callback

---

## playlist.txt Format

Create a playlist.txt file in the workspace root.

Each line should be:

    Artist - Album

Example:

    The Starting Line - Say It Like You Mean It
    New Found Glory - Sticks And Stones
    Fall Out Boy - Take This To Your Grave

Blank lines and lines starting with # are ignored.

---

## Build

Build all packages in dependency order:

    pnpm build

This compiles:

- playlist-core → dist/
- simply-create-playlists-cli → dist/

---

## Usage

Run the CLI from the workspace root:

    pnpm cli playlist.txt

This will:

- Open Spotify authorization in your browser
- Create a private playlist
- Add all album tracks
- Write misses.json with any failures

---

## Dry Run

To preview what would be added without modifying Spotify:

    pnpm cli playlist.txt --dry-run

---

## Common Options

    --name <string>        Playlist name
    --public               Create a public playlist
    --playlist-id <id|url> Use an existing playlist
    --replace              Clear playlist before adding tracks
    --append               Append to existing playlist
    --only-misses          Retry entries from misses.json
    --top-track            Add only the first track per album

---

## Generated Files

These files are created at runtime and should not be committed:

- .env
- .simply-create-playlists-cli.json
- misses.json

Recommended .gitignore entries:

    .env
    .simply-create-playlists-cli.json
    misses.json
    node_modules
    dist

---

## Packages

### playlist-core

Reusable core logic:

- list parsing
- album matching
- Spotify API client
- playlist add / replace behavior

No CLI, no config, no filesystem assumptions.

### simply-create-playlists-cli

Command-line interface:

- argument parsing
- config loading
- filesystem I/O
- calls into playlist-core

---

## Development Notes

- Build once with pnpm build
- Run via pnpm cli from the workspace root
- The CLI intentionally reads config from the current working directory

---

## License

MIT

x
