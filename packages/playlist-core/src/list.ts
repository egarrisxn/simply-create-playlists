export type MissItem = { artist: string; album: string };
export type Entry = { artist: string; album: string };

export function parseListText(text: string): Entry[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"))
    .map((l) => {
      const [artist, ...rest] = l.split(" - ");
      return { artist: artist?.trim() ?? "", album: rest.join(" - ").trim() };
    })
    .filter((e) => e.artist && e.album);
}
