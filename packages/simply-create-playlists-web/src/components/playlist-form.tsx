"use client";

import { useMemo, useState } from "react";
import { PlaylistResult } from "./playlist-result";

export function PlaylistForm() {
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
        credentials: "include",
        body: JSON.stringify({ listText, playlistName, isPublic, dryRun, topTrack }),
      });

      const data = await res.json();
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
    <section className="grid gap-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Playlist Details</label>
        <input
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Name your playlist..."
        />
        <div className="flex gap-6 pt-1 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} /> Dry Run</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={topTrack} onChange={(e) => setTopTrack(e.target.checked)} /> Top Track Only</label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label className="text-sm font-semibold">Album List</label>
          <span className="text-xs text-gray-400 font-mono">{entryCount} entries detected</span>
        </div>
        <textarea
          value={listText}
          onChange={(e) => setListText(e.target.value)}
          className="min-h-75 w-full rounded-md border border-gray-300 p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
          placeholder="Artist - Album"
        />
      </div>

      <button
        onClick={run}
        disabled={loading || !listText}
        className="w-full rounded-md bg-blue-600 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing Spotify Data..." : "Generate Playlist"}
      </button>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Import the other small component here */}
      <PlaylistResult result={result} />
    </section>
  );
}