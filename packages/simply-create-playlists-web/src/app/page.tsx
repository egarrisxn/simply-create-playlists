import { Suspense } from "react";
import { Header } from "../components/header";
import { PlaylistForm } from "../components/playlist-form";

export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 p-6">
      {/* We wrap Header in Suspense so the page loads even if Spotify is slow */}
      <Suspense fallback={<div className="h-20 animate-pulse bg-gray-100 rounded-md" />}>
        <Header />
      </Suspense>
      
      <PlaylistForm />
    </main>
  );
}

//!----------------------------------------------------------

// "use client";

// import { useMemo, useState, useEffect } from "react";
// import { useSearchParams, useRouter } from "next/navigation";

// export default function Home() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
  
//   const [listText, setListText] = useState("");
//   const [playlistName, setPlaylistName] = useState("Simply Created Playlist");
//   const [isPublic, setIsPublic] = useState(false);
//   const [dryRun, setDryRun] = useState(true);
//   const [topTrack, setTopTrack] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // 1. Detect Auth State from URL
//   useEffect(() => {
//     if (searchParams.get("auth") === "ok") {
//       setIsConnected(true);
//       // Clean the URL so the "ok" doesn't stay there on refresh
//       router.replace("/"); 
//     }
//   }, [searchParams, router]);

//   const entryCount = useMemo(() => {
//     return listText
//       .split(/\r?\n/)
//       .map((l) => l.trim())
//       .filter(Boolean)
//       .filter((l) => !l.startsWith("#")).length;
//   }, [listText]);

//   async function run() {
//     setLoading(true);
//     setError(null);
//     setResult(null);

//     try {
//       const res = await fetch("/api/run", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           listText,
//           playlistName,
//           isPublic,
//           dryRun,
//           topTrack,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         setError(data?.error || "Request failed");
//         if (res.status === 401) setIsConnected(false);
//       } else {
//         setResult(data);
//       }
//     } catch (e: any) {
//       setError(e?.message || "Request failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="mx-auto min-h-screen max-w-3xl space-y-6 p-6">
//       <header className="flex items-center justify-between border-b pb-6">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Simply Create Playlists</h1>
//           <p className="text-sm text-gray-500">Transform your album text lists into Spotify playlists.</p>
//         </div>

//         {/* 2. Dynamic Auth Button */}
//         <a
//           href="/api/auth/login"
//           className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
//             isConnected 
//               ? "bg-green-100 text-green-700 border border-green-200" 
//               : "bg-black text-white hover:bg-gray-800"
//           }`}
//         >
//           {isConnected ? "✓ Connected to Spotify" : "Connect Spotify"}
//         </a>
//       </header>

//       <section className="grid gap-6">
//         <div className="space-y-2">
//           <label className="text-sm font-semibold">Playlist Details</label>
//           <input
//             value={playlistName}
//             onChange={(e) => setPlaylistName(e.target.value)}
//             className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//             placeholder="Name your playlist..."
//           />
          
//           <div className="flex gap-6 pt-1">
//             <label className="flex items-center gap-2 text-sm cursor-pointer">
//               <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
//               Public
//             </label>
//             <label className="flex items-center gap-2 text-sm cursor-pointer">
//               <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
//               Dry Run (Simulation)
//             </label>
//             <label className="flex items-center gap-2 text-sm cursor-pointer">
//               <input type="checkbox" checked={topTrack} onChange={(e) => setTopTrack(e.target.checked)} />
//               Top Track Only
//             </label>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <div className="flex justify-between items-end">
//             <label className="text-sm font-semibold">Album List</label>
//             <span className="text-xs text-gray-400 font-mono">{entryCount} entries detected</span>
//           </div>
//           <textarea
//             value={listText}
//             onChange={(e) => setListText(e.target.value)}
//             className="min-h-[300px] w-full rounded-md border border-gray-300 p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//             placeholder="Artist - Album&#10;Artist - Album"
//           />
//         </div>

//         <button
//           onClick={run}
//           disabled={loading || !listText}
//           className="w-full rounded-md bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
//         >
//           {loading ? "Processing Spotify Data..." : "Generate Playlist"}
//         </button>
//       </section>

//       {/* 3. Better Error Display */}
//       {error && (
//         <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
//           <strong>Error:</strong> {error}
//         </div>
//       )}

//       {/* 4. Better Result Display */}
//       {result && (
//         <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
//           <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
//             <h2 className="text-xl font-bold text-green-900 mb-2">Playlist Ready!</h2>
//             {result.playlistUrl && (
//               <a 
//                 href={result.playlistUrl} 
//                 target="_blank" 
//                 className="inline-block rounded-full bg-green-600 px-8 py-2 text-white font-semibold hover:bg-green-700 transition-colors"
//               >
//                 Open in Spotify
//               </a>
//             )}
//           </div>

//           {result.misses?.length > 0 && (
//             <div className="rounded-md border border-amber-200 bg-white p-4">
//               <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
//                 ⚠️ Missing Items ({result.misses.length})
//               </h3>
//               <ul className="grid gap-1 border-t pt-3">
//                 {result.misses.map((m: any, i: number) => (
//                   <li key={i} className="text-sm text-gray-600 flex justify-between italic">
//                     <span>{m.artist}</span>
//                     <span className="text-gray-300">—</span>
//                     <span>{m.album}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </section>
//       )}
//     </main>
//   );
// }

//!----------------------------------------------------------

// "use client";

// import { useMemo, useState } from "react";

// export default function Home() {
//   const [listText, setListText] = useState("");
//   const [playlistName, setPlaylistName] = useState("Simply Created Playlist");
//   const [isPublic, setIsPublic] = useState(false);
//   const [dryRun, setDryRun] = useState(true);
//   const [topTrack, setTopTrack] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   const entryCount = useMemo(() => {
//     return listText
//       .split(/\r?\n/)
//       .map((l) => l.trim())
//       .filter(Boolean)
//       .filter((l) => !l.startsWith("#")).length;
//   }, [listText]);

//   async function run() {
//     setLoading(true);
//     setError(null);
//     setResult(null);

//     try {
//       const res = await fetch("/api/run", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           listText,
//           playlistName,
//           isPublic,
//           dryRun,
//           topTrack,
//         }),
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) {
//         setError(data?.error || "Request failed");
//       } else {
//         setResult(data);
//       }
//     } catch (e: any) {
//       setError(e?.message || "Request failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="mx-auto min-h-screen max-w-3xl space-y-6 p-6">
//       <header className="space-y-2">
//         <h1 className="text-3xl font-semibold">Simply Create Playlists</h1>
//         <p className="text-sm opacity-80">
//           Connect Spotify, paste your Artist – Album list, then create a
//           playlist.
//         </p>

//         <div className="flex gap-3">
//           <a
//             href="/api/auth/login"
//             className="rounded-md bg-black px-4 py-2 text-white"
//           >
//             Connect Spotify
//           </a>
//         </div>
//       </header>

//       <section className="space-y-3">
//         <label className="block text-sm font-medium">Playlist name</label>
//         <input
//           value={playlistName}
//           onChange={(e) => setPlaylistName(e.target.value)}
//           className="w-full rounded-md border px-3 py-2"
//           placeholder="Simply Created Playlist"
//         />

//         <div className="flex flex-wrap gap-4 text-sm">
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={isPublic}
//               onChange={(e) => setIsPublic(e.target.checked)}
//             />
//             Public playlist
//           </label>

//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={dryRun}
//               onChange={(e) => setDryRun(e.target.checked)}
//             />
//             Dry run (don’t modify Spotify)
//           </label>

//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={topTrack}
//               onChange={(e) => setTopTrack(e.target.checked)}
//             />
//             Top track only
//           </label>
//         </div>

//         <label className="block text-sm font-medium">Album list</label>
//         <textarea
//           value={listText}
//           onChange={(e) => setListText(e.target.value)}
//           className="min-h-55 w-full rounded-md border px-3 py-2 font-mono text-sm"
//           placeholder="Artist - Album"
//         />

//         <div className="flex items-center justify-between">
//           <div className="text-sm opacity-80">{entryCount} entries</div>
//           <button
//             onClick={run}
//             disabled={loading}
//             className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
//           >
//             {loading ? "Running..." : "Run"}
//           </button>
//         </div>
//       </section>

//       {error ? (
//         <section className="rounded-md border p-4 text-sm">
//           <div className="mb-1 font-semibold">Error</div>
//           <pre className="whitespace-pre-wrap">{error}</pre>
//           <div className="mt-3 opacity-80">
//             If you see “Not authenticated”, click “Connect Spotify” first.
//           </div>
//         </section>
//       ) : null}

//       {result ? (
//         <section className="space-y-2 rounded-md border p-4 text-sm">
//           <div className="font-semibold">Result</div>
//           <div>playlistId: {result.playlistId ?? "(none)"}</div>
//           <div>playlistUrl: {result.playlistUrl ?? "(none)"}</div>
//           <div>
//             misses: {Array.isArray(result.misses) ? result.misses.length : 0}
//           </div>
//           {Array.isArray(result.misses) && result.misses.length ? (
//             <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs whitespace-pre-wrap">
//               {JSON.stringify(result.misses, null, 2)}
//             </pre>
//           ) : null}
//         </section>
//       ) : null}
//     </main>
//   );
// }
