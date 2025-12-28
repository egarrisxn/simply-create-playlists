"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [listText, setListText] = useState("");
  const [playlistName, setPlaylistName] = useState("Simply Created Playlist");
  const [isPublic, setIsPublic] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [topTrack, setTopTrack] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const entryCount = useMemo(() => {
    return listText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !l.startsWith("#")).length;
  }, [listText]);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listText,
          playlistName,
          isPublic,
          dryRun,
          topTrack,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Request failed");
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Simply Create Playlists</h1>
        <p className="text-sm opacity-80">
          Connect Spotify, paste your Artist – Album list, then create a
          playlist.
        </p>

        <div className="flex gap-3">
          <a
            href="/api/auth/login"
            className="rounded-md bg-black px-4 py-2 text-white"
          >
            Connect Spotify
          </a>
        </div>
      </header>

      <section className="space-y-3">
        <label className="block text-sm font-medium">Playlist name</label>
        <input
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Simply Created Playlist"
        />

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public playlist
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
            />
            Dry run (don’t modify Spotify)
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={topTrack}
              onChange={(e) => setTopTrack(e.target.checked)}
            />
            Top track only
          </label>
        </div>

        <label className="block text-sm font-medium">Album list</label>
        <textarea
          value={listText}
          onChange={(e) => setListText(e.target.value)}
          className="min-h-55 w-full rounded-md border px-3 py-2 font-mono text-sm"
          placeholder="Artist - Album"
        />

        <div className="flex items-center justify-between">
          <div className="text-sm opacity-80">{entryCount} entries</div>
          <button
            onClick={run}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Running..." : "Run"}
          </button>
        </div>
      </section>

      {error ? (
        <section className="rounded-md border p-4 text-sm">
          <div className="mb-1 font-semibold">Error</div>
          <pre className="whitespace-pre-wrap">{error}</pre>
          <div className="mt-3 opacity-80">
            If you see “Not authenticated”, click “Connect Spotify” first.
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="space-y-2 rounded-md border p-4 text-sm">
          <div className="font-semibold">Result</div>
          <div>playlistId: {result.playlistId ?? "(none)"}</div>
          <div>playlistUrl: {result.playlistUrl ?? "(none)"}</div>
          <div>
            misses: {Array.isArray(result.misses) ? result.misses.length : 0}
          </div>
          {Array.isArray(result.misses) && result.misses.length ? (
            <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs whitespace-pre-wrap">
              {JSON.stringify(result.misses, null, 2)}
            </pre>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
