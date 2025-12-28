export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/’/g, "'")
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function keyFor(artist: string, album: string) {
  return `${artist} - ${album}`.trim();
}

export function albumIdFromOverride(v: string) {
  const m = v.match(/^spotify:album:(.+)$/);
  return m ? m[1] : v;
}

export function parsePlaylistId(input: string): string {
  const urlMatch = input.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  return urlMatch ? urlMatch[1] : input.trim();
}
