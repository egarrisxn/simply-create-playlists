# playlist-core

Core library for building Spotify playlists from simple Artist – Album lists.

This package contains all reusable, non-CLI logic used by the Simply Create Playlists project. It is designed to be imported by other tools (such as the CLI) and makes no assumptions about filesystem layout or configuration location.

---

## Responsibilities

playlist-core is responsible for:

- Parsing album lists
- Normalizing and matching artist / album names
- Interacting with the Spotify Web API
- Creating playlists
- Adding, replacing, or clearing playlist tracks
- Handling Spotify OAuth (PKCE)

It does **not**:
- Read environment variables directly
- Parse command-line arguments
- Read or write user files like playlist.txt or misses.json

---

## Public API

The primary export is:

- runCore(options)

Additional utilities (types and helpers) are re-exported from the package index.

All imports should come from the package root:

    import { runCore } from "playlist-core";

---

## Usage

This package is not typically used directly by end users.

It is consumed by:
- simply-create-playlists-cli

---

## Build

From the workspace root:

    pnpm build

Or from this package directory:

    pnpm build

Compiled output is written to the dist/ directory.

---

## Package Structure

    playlist-core/
    ├─ src/
    │  ├─ index.ts
    │  ├─ list.ts
    │  ├─ normalize.ts
    │  └─ spotify.ts
    ├─ dist/          # generated
    ├─ package.json
    └─ tsconfig.json

---

## License

MIT
