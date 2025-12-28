## Testing

This section demonstrates a successful build and a dry-run execution of the CLI.

---

### Build Workspace

```bash
pnpm build
```

```text
> simply-create-playlists-workspace@1.0.0 build
> pnpm -r build

Scope: 2 of 3 workspace projects

packages/playlist-core build
tsc -p tsconfig.json
✔ Done in 746ms

packages/simply-create-playlists-cli build
tsc -p tsconfig.json && node ../../scripts/add-shebang.mjs dist/cli.js
✔ Done in 799ms
```

---

### CLI Dry Run

```bash
pnpm cli playlist.txt --dry-run
```

```text
> simply-create-playlists-workspace@1.0.0 cli
> node packages/simply-create-playlists-cli/dist/cli.js "playlist.txt" "--dry-run"

Auth server running on http://127.0.0.1:5173
Opening Spotify authorization in your browser...

DRY RUN enabled: will not create playlist or add tracks.

[1/3] The Starting Line - Say It Like You Mean It
      WOULD ADD (13 tracks)

[2/3] New Found Glory - Sticks And Stones
      WOULD ADD (13 tracks)

[3/3] Fall Out Boy - Take This To Your Grave
      WOULD ADD (12 tracks)

Done.
```

---

### Result

- Workspace builds successfully
- CLI executes without errors
- Spotify auth flow initializes correctly
- Albums are resolved and counted
- No playlist or tracks are created in `--dry-run` mode
