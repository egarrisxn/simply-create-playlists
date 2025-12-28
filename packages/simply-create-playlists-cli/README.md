# simply-create-playlists-cli

Command-line interface for creating Spotify playlists from Artist – Album lists.

This package wraps playlist-core and provides a user-facing CLI for building and managing Spotify playlists.

---

## What This Package Does

- Parses command-line arguments
- Loads local Spotify configuration
- Reads input files (playlist.txt, overrides.json, misses.json)
- Calls into playlist-core to perform all Spotify operations

---

## Command

When installed or run from the workspace, this package exposes the command:

    simply-create-playlists

---

## Usage (Workspace)

From the workspace root:

    pnpm build
    pnpm cli playlist.txt

---

## Init

Before first use, initialize Spotify configuration:

    pnpm cli init

This creates:
- .env
- .simply-create-playlists-cli.json

---

## Common Options

    --name <string>        Playlist name
    --public               Create a public playlist
    --dry-run               Preview without modifying Spotify
    --playlist-id <id|url> Use an existing playlist
    --replace              Clear playlist before adding tracks
    --only-misses          Retry entries from misses.json
    --top-track            Add only the first track per album

---

## Package Structure

    simply-create-playlists-cli/
    ├─ src/
    │  ├─ cli.ts
    │  └─ config.ts
    ├─ dist/          # generated
    ├─ package.json
    └─ tsconfig.json

---

## Notes

- This package expects configuration files to exist in the current working directory
- The CLI is intentionally thin; all core logic lives in playlist-core

---

## License

MIT
