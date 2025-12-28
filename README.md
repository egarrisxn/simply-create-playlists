# Simply Create Playlists

A monorepo for creating Spotify playlists from simple **Artist – Album** text lists.
<br>
This workspace includes a reusable core library, a Node.js CLI, and a Next.js 16 Web application.

## ⚙️ Requirements

- Spotify Developer application (Client ID required)
- Node.js 18+ (tested on Node 25)
- pnpm (recommended, not required)

## 🏗 Repository Structure

- **`packages/playlist-core`**: Reusable logic, smart normalization, and Spotify API client.
- **`packages/simply-create-playlists-cli`**: Command-line tool for local automation.
- **`packages/simply-create-playlists-web`**: Next.js 16 UI with secure PKCE Auth.

## 📦 Package Summaries

#### playlist-core

The engine of the project. It handles the runCore logic, onProgress callbacks, and Spotify API communication.

- Build: pnpm --filter playlist-core build

#### simply-create-playlists-cli

A thin wrapper around the core. Handles file I/O for playlist.txt, misses.json, and CLI arguments via Commander.

- Run: pnpm cli <filename>

#### simply-create-playlists-web

A modern Next.js interface. Uses Server Components to fetch profile data and Client Components for real-time playlist generation status.

- Run: pnpm dev:web

---

## 🚨 Critical: Spotify 2025 Security Requirements

Spotify now enforces strict origin matching. To avoid "State Mismatch" errors or authentication loops:

- **Use `127.0.0.1`** instead of `localhost`.
- **Redirect URI:** Set your Spotify Developer Dashboard to `http://127.0.0.1:3000/api/auth/callback`.
- **Dev URL:** Access the web app at `http://127.0.0.1:3000`.

## 🚀 Quick Start (Web App)

1. **Install Dependencies:**

   ```bash
   pnpm install
   ```

2. **Build Shared Logic:**

   ```bash
   pnpm build:core
   ```

3. **Environment Setup: Create packages/simply-create-playlists-web/.env.local:**

   ```bash
   SPOTIFY_WEB_CLIENT_ID=your_id_here
   SPOTIFY_WEB_REDIRECT_URI=[http://127.0.0.1:3000/api/auth/callback](http://127.0.0.1:3000/api/auth/callback)
   ```

4. **Run Web App:**
   ```bash
   pnpm dev:web
   # Open [http://127.0.0.1:3000](http://127.0.0.1:3000)
   ```

## 💻 CLI Usage

1. **Initialize Config:**

   ```bash
   pnpm cli init
   ```

2. **Run Playlist Creation:**
   ```bash
   pnpm cli playlist.txt --dry-run
   ```

## 🧬 Format for playlist.txt

Create a playlist.txt file in the workspace root.

- Each line should be:

  ```
  Artist - Album
  ```

- Example:

  ```
  The Starting Line - Say It Like You Mean It
  New Found Glory - Sticks And Stones
  Fall Out Boy - Take This To Your Grave
  ```

Blank lines and lines starting with # are ignored.

---

## 🛠 Troubleshooting

| Symptom                        | Likely Culprit     | Fix                                                         |
| :----------------------------- | :----------------- | :---------------------------------------------------------- |
| **"Could not find module..."** | Core build missing | Run `pnpm build:core`                                       |
| **"INVALID_CLIENT"**           | Dashboard Mismatch | Check Client ID in `.env` and Spotify Dashboard             |
| **"State Mismatch"**           | Cookie Domain      | Stick strictly to `127.0.0.1:3000` (avoid `localhost`)      |
| **"Syntax Error: ${...}"**     | Template Literal   | Re-check `spotify.ts` for any missing `$` in interpolations |

---

## 📜 License

MIT
