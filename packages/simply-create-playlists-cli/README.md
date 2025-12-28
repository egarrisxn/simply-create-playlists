# simply-create-playlists-cli

Command-line tool for **Simply Create Playlists**.  
This is a thin wrapper around `playlist-core` that handles:

- File I/O for `playlist.txt`
- Writing `misses.json` (anything Spotify couldn’t match)
- CLI args & flags (Commander)

## ⚙️ Requirements

- Spotify Developer application (Client ID required)
- Node.js 18+ (tested on Node 25)
- pnpm (recommended, not required)

## 🚀 Install & Run (from repo root)

```bash
pnpm install
pnpm build:core
```

### Initialize CLI config

```bash
pnpm cli init
```

This typically stores your Client ID / auth settings in a local config file (implementation-dependent).

### Create a playlist (dry-run)

```bash
pnpm cli playlist.txt --dry-run
```

### Create a real playlist

```bash
pnpm cli playlist.txt
```

## 🧬 Input Format: `playlist.txt`

Create `playlist.txt` in the workspace root (or pass a path to the CLI).

Each line:

```
Artist - Album
```

Example:

```
The Starting Line - Say It Like You Mean It
New Found Glory - Sticks And Stones
Fall Out Boy - Take This To Your Grave
```

Blank lines and lines starting with `#` are ignored.

## 🗂 Output Files

- **`misses.json`**: albums/tracks that could not be matched
- (Optional) any debug logs depending on your flags

## 🛠 Troubleshooting

- **"Could not find module..."**  
  Core build missing — run:

  ```bash
  pnpm build:core
  ```

- **"INVALID_CLIENT"**  
  Client ID mismatch — verify your config and Spotify dashboard.

---

## 📜 License

MIT
