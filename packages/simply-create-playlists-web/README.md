# simply-create-playlists-web

Next.js 16 web app for **Simply Create Playlists**.
<br>
Uses secure **PKCE OAuth** for Spotify authentication and a modern UI to track playlist generation in real time.

## ⚙️ Requirements

- Spotify Developer application (Client ID required)
- Node.js 18+ (tested on Node 25)
- pnpm (recommended, not required)

## 🚨 Critical: Spotify 2025 Security Requirements

Spotify enforces strict **origin matching**. To avoid **State Mismatch** errors or auth loops:

- **Use `127.0.0.1`** instead of `localhost`
- **Redirect URI (Spotify Dashboard):**  
  `http://127.0.0.1:3000/api/auth/callback`
- **Dev URL:**  
  `http://127.0.0.1:3000`

## 🚀 Quick Start

From the repo root:

1. Install dependencies:

```bash
pnpm install
```

2. Build shared logic:

```bash
pnpm build:core
```

3. Create `packages/simply-create-playlists-web/.env.local`:

```bash
SPOTIFY_WEB_CLIENT_ID=your_id_here
SPOTIFY_WEB_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
```

4. Run the web app:

```bash
pnpm dev:web
# open http://127.0.0.1:3000
```

## 🧭 How It Works

- **Server Components**: fetch profile / session-backed data safely
- **Client Components**: show realtime playlist creation status and progress updates
- **PKCE Auth**: keeps the Client ID public while securing the OAuth flow
- **Uses `playlist-core`** for the actual playlist generation engine

## 🛠 Troubleshooting

- **"State Mismatch"**  
  Cookie/origin mismatch — use `127.0.0.1` everywhere (dashboard + browser URL).

- **"INVALID_CLIENT"**  
  Dashboard mismatch — check the Client ID in `.env.local` and Spotify Developer settings.

- **"Could not find module..."**  
  Core build missing — run:

  ```bash
  pnpm build:core
  ```

---

## 📜 License

MIT
