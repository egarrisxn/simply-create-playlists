# simply-create-playlists-web

This package contains the **Next.js web application** for the Simply Create Playlists project.

It provides a browser-based UI on top of `playlist-core`, allowing users to authenticate with Spotify, paste an Artist – Album list, preview results, and create playlists.

---

## ⚠️ Important: Use 127.0.0.1 (NOT localhost)

Due to **Spotify redirect URI security requirements (2025)** and upcoming **Next.js dev-origin enforcement**, developers **must use `127.0.0.1` instead of `localhost`** when running the web app locally.

### ✅ Correct

http://127.0.0.1:3000  
http://127.0.0.1:3000/api/auth/callback

### ❌ Incorrect

http://localhost:3000

Spotify **does not allow `localhost`** as a redirect URI.  
Next.js will also warn (and eventually block) cross-origin dev requests if you mix these.

---

## Spotify App Setup

1. Go to the **Spotify Developer Dashboard**
2. Open your Spotify app
3. Add this redirect URI exactly:

http://127.0.0.1:3000/api/auth/callback

4. Save changes

---

## Environment Variables

Create a file at:

packages/simply-create-playlists-web/.env.local

With the following contents:

SPOTIFY_CLIENT_ID=your_spotify_client_id  
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback

---

## Running the Web App

From the workspace root:

pnpm install  
pnpm -C packages/simply-create-playlists-web dev

Then open:

http://127.0.0.1:3000

---

## Dev Script Recommendation

To avoid cross-origin warnings, the dev server should bind to `127.0.0.1`.

In packages/simply-create-playlists-web/package.json:

"dev": "next dev --hostname 127.0.0.1 --port 3000"

---

## Features (Current)

- Spotify OAuth (Authorization Code + PKCE)
- Paste Artist – Album list
- Dry run mode
- Public / private playlist toggle
- Top-track-only option
- Miss detection
- Shared core logic via `playlist-core`

---

## Architecture

- Next.js App Router
- Server-side Spotify API calls
- HttpOnly cookies for auth
- Shared logic from `playlist-core`
- CLI and Web share the same engine

---

## Related Packages

- playlist-core — core playlist creation logic
- simply-create-playlists-cli — command-line interface

---

## Notes

- This app is intended for development and personal use.
- For production deployment, HTTPS is required and the redirect URI must be updated accordingly.
- When deploying (e.g. Vercel), update the redirect URI to your HTTPS domain.

---

## License

MIT
