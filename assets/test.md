$ pnpm build

> simply-create-playlists-workspace@1.0.0 build C:\Users\egarr\Projects\Vanilla\spotify\simply-create-playlists
> pnpm -r build

Scope: 2 of 3 workspace projects
packages/playlist-core build$ tsc -p tsconfig.json
└─ Done in 746ms
packages/simply-create-playlists-cli build$ tsc -p tsconfig.json && node ../../scripts/add-shebang.mjs dist/cli.js
└─ Done in 799ms

THEN

$ pnpm cli playlist.txt --dry-run

> simply-create-playlists-workspace@1.0.0 cli C:\Users\egarr\Projects\Vanilla\spotify\simply-create-playlists
> node packages/simply-create-playlists-cli/dist/cli.js "playlist.txt" "--dry-run"

Auth server running on http://127.0.0.1:5173
Opening Spotify authorization in your browser...

DRY RUN enabled: will not create playlist or add tracks.

[1/3] The Starting Line - Say It Like You Mean It ... WOULD ADD (13 tracks)
[2/3] New Found Glory - Sticks And Stones ... WOULD ADD (13 tracks)
[3/3] Fall Out Boy - Take This To Your Grave ... WOULD ADD (12 tracks)

Done.
