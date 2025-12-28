## Troubleshooting

| Symptom                        | Likely Culprit     | Fix                                                         |
| :----------------------------- | :----------------- | :---------------------------------------------------------- |
| **"Could not find module..."** | Core build missing | Run `pnpm build:core`                                       |
| **"INVALID_CLIENT"**           | Dashboard Mismatch | Check Client ID in `.env` and Spotify Dashboard             |
| **"State Mismatch"**           | Cookie Domain      | Stick strictly to `127.0.0.1:3000` (avoid `localhost`)      |
| **"Syntax Error: ${...}"**     | Template Literal   | Re-check `spotify.ts` for any missing `$` in interpolations |
