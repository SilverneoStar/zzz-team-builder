"""Lists each song of the whole YouTube playlists in public/music/playlist.txt.

Run during the site's build (GitHub Actions), where YouTube can be reached. For
each line that links a whole playlist ("Name | https://youtube.com/playlist?list=..."),
it asks yt-dlp for the playlist's videos (titles and ids only; nothing is
downloaded) and writes them in its place as ordinary "Title | link" lines, so the
room lists every song. The file in the repository isn't changed; only the copy
the build publishes. If a playlist can't be read, its line stays as it was and
the room plays it as one row instead.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "public" / "music" / "playlist.txt"
LIST = re.compile(r"[?&]list=([\w-]{12,})")
# "1% Battery Girl - Phoenix EP | Zenless Zone Zero 3.3 OST" -> "1% Battery Girl - Phoenix EP"
TAIL = re.compile(r"\s*[|｜]\s*Zenless Zone Zero\b.*$", re.I)


def songs_of(list_id):
    out = subprocess.run(
        ["yt-dlp", "--flat-playlist", "--dump-single-json", "--no-warnings",
         f"https://www.youtube.com/playlist?list={list_id}"],
        capture_output=True, text=True, timeout=180,
    )
    if out.returncode:
        raise RuntimeError(out.stderr.strip()[-300:])
    entries = json.loads(out.stdout).get("entries") or []
    songs = []
    for e in entries:
        vid, title = e.get("id"), (e.get("title") or "").strip()
        # Skip videos YouTube marks private or deleted.
        if not vid or len(vid) != 11 or title in ("[Private video]", "[Deleted video]"):
            continue
        title = TAIL.sub("", title).replace("|", "/").strip() or title
        songs.append(f"{title} | https://youtu.be/{vid}")
    return songs


def main():
    lines = FILE.read_text(encoding="utf-8").splitlines()
    out, changed = [], 0
    for line in lines:
        t = line.strip()
        m = LIST.search(t)
        is_video = re.search(r"[?&]v=|youtu\.be/", t)
        if not t or t.startswith("#") or t.startswith("[") or not m or is_video:
            out.append(line)
            continue
        try:
            songs = songs_of(m.group(1))
        except Exception as e:  # noqa: BLE001 - keep the build going
            print(f"Couldn't read playlist {m.group(1)}: {e}", file=sys.stderr)
            out.append(line)
            continue
        if not songs:
            out.append(line)
            continue
        print(f"Playlist {m.group(1)}: {len(songs)} songs")
        out.append(f"# From the YouTube playlist {m.group(1)}:")
        out.extend(songs)
        changed += 1
    FILE.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"Listed the songs of {changed} playlist(s).")


if __name__ == "__main__":
    main()
