# playlist-core

Reusable core library for **Simply Create Playlists**.
<br>
turns simple **Artist - Album** lists into Spotify playlists via a smart normalization pipeline and a small Spotify Web API client.

> This package is designed to be consumed by both the CLI and the Next.js web app in this monorepo.

## ⚙️ Requirements

- Spotify Developer application (Client ID required)
- Node.js 18+ (tested on Node 25)
- pnpm (recommended, not required)

## 📦 What’s Inside

- **`runCore`**: The main orchestration function for playlist creation.
- **Normalization utilities**: Cleans up `Artist - Album` input, handles common punctuation/spacing issues.
- **Spotify API client**: Thin wrapper for search, playlist creation, and track adds.
- **`onProgress` callbacks**: Progress events for UIs (CLI output, Web status UI).

## 🧱 Build

From the repo root:

```bash
pnpm --filter playlist-core build
```

If your workspace includes helper scripts (recommended), you can also use:

```bash
pnpm build:core
```

## 🔌 Usage (Consumers)

Most users won’t call this directly—use the CLI or Web app.  
If you do consume it inside another package, keep these patterns in mind:

- Provide an auth token (Spotify OAuth access token)
- Provide an input list of albums parsed from `playlist.txt`
- Provide an `onProgress` handler if you want realtime status updates

## 🛠 Troubleshooting

- **"Could not find module..."**  
  Core build missing — run:

  ```bash
  pnpm --filter playlist-core build
  # or
  pnpm build:core
  ```

---

## 📜 License

MIT
