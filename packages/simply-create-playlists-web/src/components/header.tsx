import { getServerSpotifyToken } from "../lib/auth";
import { SPOTIFY_BASE_URL } from "../lib/constants";

async function getSpotifyProfile(token: string) {
  try {
    const res = await fetch(`${SPOTIFY_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 } // Cache profile for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function Header() {
  const token = await getServerSpotifyToken();
  const profile = token ? await getSpotifyProfile(token) : null;

  return (
    <header className="flex items-center justify-between border-b pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Simply Create Playlists</h1>
        <p className="text-sm text-gray-500">Transform your album text lists into Spotify playlists.</p>
      </div>

      <div className="flex items-center gap-4">
        {profile ? (
          <div className="flex items-center gap-3 rounded-full bg-gray-100 pl-1 pr-4 py-1 border border-gray-200">
            {profile.images?.[0]?.url ? (
              <img 
                src={profile.images[0].url} 
                alt={profile.display_name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                {profile.display_name?.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {profile.display_name}
            </span>
          </div>
        ) : (
          <a
            href="/api/auth/login"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Connect Spotify
          </a>
        )}
      </div>
    </header>
  );
}