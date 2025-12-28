export function PlaylistResult({ result }: { result: any }) {
  if (!result) return null;
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-xl font-bold text-green-900 mb-2">Playlist Ready!</h2>
        <a href={result.playlistUrl} target="_blank" className="inline-block rounded-full bg-green-600 px-8 py-2 text-white font-semibold hover:bg-green-700">
          Open in Spotify
        </a>
      </div>
      {result.misses?.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-white p-4">
          <h3 className="font-semibold text-amber-800 mb-3 italic">Missing Items ({result.misses.length})</h3>
          <ul className="grid gap-1 border-t pt-3">
            {result.misses.map((m: any, i: number) => (
              <li key={i} className="text-sm text-gray-600 flex justify-between">
                <span>{m.artist}</span> <span className="text-gray-300">—</span> <span>{m.album}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}