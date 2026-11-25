"""QASSIMZ Music — local data: favorites, history, playlists, settings, local music library."""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import sqlite3
import threading
from pathlib import Path

try:
    import mutagen  # type: ignore
except Exception:  # pragma: no cover
    mutagen = None

AUDIO_EXT = {".mp3", ".m4a", ".aac", ".flac", ".ogg", ".opus", ".wav", ".wma", ".aiff"}

SCHEMA = """
CREATE TABLE IF NOT EXISTS favorites(key TEXT PRIMARY KEY, item TEXT, added TEXT);
CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY, key TEXT, item TEXT, played TEXT);
CREATE TABLE IF NOT EXISTS playlists(id INTEGER PRIMARY KEY, name TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS playlist_items(id INTEGER PRIMARY KEY, playlist_id INTEGER, pos REAL, item TEXT);
CREATE TABLE IF NOT EXISTS local(id INTEGER PRIMARY KEY, path TEXT UNIQUE, title TEXT, artist TEXT, album TEXT,
  duration REAL, art TEXT, mtime REAL, added TEXT);
CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY, v TEXT);
"""


def now():
    return dt.datetime.now().isoformat(timespec="seconds")


def item_key(it: dict) -> str:
    return f"{it.get('source')}:{it.get('id')}"


class Store:
    def __init__(self, data_dir: Path):
        self.dir = Path(data_dir)
        self.dir.mkdir(parents=True, exist_ok=True)
        self.art = self.dir / "art"
        self.art.mkdir(exist_ok=True)
        self.lock = threading.RLock()
        self.db = sqlite3.connect(self.dir / "music.db", check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)
        self.db.commit()
        self.scanning = False

    def q(self, sql, a=()):
        with self.lock:
            return [dict(r) for r in self.db.execute(sql, a).fetchall()]

    def x(self, sql, a=()):
        with self.lock:
            c = self.db.execute(sql, a)
            self.db.commit()
            return c.lastrowid

    # ------------------------------------------------------------ settings
    def settings(self):
        out = {r["k"]: json.loads(r["v"]) for r in self.q("SELECT k,v FROM settings")}
        out.setdefault("music_dirs", [str(Path.home() / "Music")])
        out.setdefault("volume", 0.8)
        out.setdefault("eq", "flat")
        out.setdefault("eq_custom", [0] * 10)
        out.setdefault("country", "EG")
        out.setdefault("auto_update", True)
        out.setdefault("visualizer", True)
        return out

    def set(self, k, v):
        self.x("INSERT INTO settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v", (k, json.dumps(v, ensure_ascii=False)))

    # ------------------------------------------------------------ favorites / history
    def favorites(self):
        return [json.loads(r["item"]) for r in self.q("SELECT item FROM favorites ORDER BY added DESC")]

    def fav_keys(self):
        return [r["key"] for r in self.q("SELECT key FROM favorites")]

    def toggle_fav(self, item):
        k = item_key(item)
        if self.q("SELECT 1 FROM favorites WHERE key=?", (k,)):
            self.x("DELETE FROM favorites WHERE key=?", (k,))
            return False
        self.x("INSERT INTO favorites(key,item,added) VALUES(?,?,?)", (k, json.dumps(item, ensure_ascii=False), now()))
        return True

    def add_history(self, item):
        k = item_key(item)
        self.x("DELETE FROM history WHERE key=?", (k,))
        self.x("INSERT INTO history(key,item,played) VALUES(?,?,?)", (k, json.dumps(item, ensure_ascii=False), now()))
        self.x("DELETE FROM history WHERE id NOT IN (SELECT id FROM history ORDER BY id DESC LIMIT 200)")

    def history(self, limit=40):
        return [json.loads(r["item"]) for r in self.q("SELECT item FROM history ORDER BY id DESC LIMIT ?", (limit,))]

    def clear_history(self):
        self.x("DELETE FROM history")

    # ------------------------------------------------------------ playlists
    def playlists(self):
        rows = self.q("SELECT * FROM playlists ORDER BY id")
        for p in rows:
            p["count"] = self.q("SELECT COUNT(*) c FROM playlist_items WHERE playlist_id=?", (p["id"],))[0]["c"]
            first = self.q("SELECT item FROM playlist_items WHERE playlist_id=? ORDER BY pos LIMIT 4", (p["id"],))
            p["arts"] = [json.loads(r["item"]).get("art", "") for r in first]
        return rows

    def playlist(self, pid):
        p = self.q("SELECT * FROM playlists WHERE id=?", (pid,))
        if not p:
            return None
        p = p[0]
        p["items"] = []
        for r in self.q("SELECT id, item FROM playlist_items WHERE playlist_id=? ORDER BY pos, id", (pid,)):
            it = json.loads(r["item"])
            it["_pid"] = r["id"]
            p["items"].append(it)
        return p

    def playlist_create(self, name):
        return self.x("INSERT INTO playlists(name,created) VALUES(?,?)", (name or "قايمة جديدة", now()))

    def playlist_rename(self, pid, name):
        self.x("UPDATE playlists SET name=? WHERE id=?", (name, pid))

    def playlist_delete(self, pid):
        self.x("DELETE FROM playlist_items WHERE playlist_id=?", (pid,))
        self.x("DELETE FROM playlists WHERE id=?", (pid,))

    def playlist_add(self, pid, item):
        pos = (self.q("SELECT MAX(pos) m FROM playlist_items WHERE playlist_id=?", (pid,))[0]["m"] or 0) + 1
        item = {k: v for k, v in item.items() if not k.startswith("_")}
        return self.x("INSERT INTO playlist_items(playlist_id,pos,item) VALUES(?,?,?)", (pid, pos, json.dumps(item, ensure_ascii=False)))

    def playlist_remove(self, item_row_id):
        self.x("DELETE FROM playlist_items WHERE id=?", (item_row_id,))

    def playlist_reorder(self, pid, row_ids):
        for i, r in enumerate(row_ids):
            self.x("UPDATE playlist_items SET pos=? WHERE id=? AND playlist_id=?", (i, r, pid))

    # ------------------------------------------------------------ local library
    def local(self, q=None):
        if q:
            rows = self.q("SELECT * FROM local WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? ORDER BY artist, album, title",
                          (f"%{q}%",) * 3)
        else:
            rows = self.q("SELECT * FROM local ORDER BY artist, album, title")
        return [self._local_item(r) for r in rows]

    @staticmethod
    def _local_item(r):
        return {"source": "local", "id": r["id"], "title": r["title"], "subtitle": " · ".join(x for x in [r["artist"], r["album"]] if x),
                "artist": r["artist"], "album": r["album"], "duration": r["duration"] or 0,
                "art": f"localart/{r['id']}" if r["art"] else "", "path": r["path"], "live": False}

    def local_path(self, lid):
        r = self.q("SELECT path, art FROM local WHERE id=?", (lid,))
        return r[0] if r else None

    def scan(self, dirs=None):
        if self.scanning:
            return {"busy": True}
        self.scanning = True
        added = 0
        try:
            dirs = dirs or self.settings()["music_dirs"]
            seen = set()
            for d in dirs:
                for root, _, files in os.walk(d):
                    for fn in files:
                        p = os.path.join(root, fn)
                        if os.path.splitext(fn)[1].lower() not in AUDIO_EXT:
                            continue
                        seen.add(p)
                        mt = os.path.getmtime(p)
                        ex = self.q("SELECT mtime FROM local WHERE path=?", (p,))
                        if ex and abs(ex[0]["mtime"] - mt) < 1:
                            continue
                        meta = self._tags(p)
                        self.x("INSERT INTO local(path,title,artist,album,duration,art,mtime,added) VALUES(?,?,?,?,?,?,?,?) "
                               "ON CONFLICT(path) DO UPDATE SET title=excluded.title, artist=excluded.artist, album=excluded.album, "
                               "duration=excluded.duration, art=excluded.art, mtime=excluded.mtime",
                               (p, meta["title"], meta["artist"], meta["album"], meta["duration"], meta["art"], mt, now()))
                        added += 1
            for r in self.q("SELECT id, path FROM local"):
                if r["path"] not in seen and not os.path.exists(r["path"]):
                    self.x("DELETE FROM local WHERE id=?", (r["id"],))
        finally:
            self.scanning = False
        return {"added": added, "total": self.q("SELECT COUNT(*) c FROM local")[0]["c"]}

    def _tags(self, p):
        name = os.path.splitext(os.path.basename(p))[0]
        artist, title = "", name
        if " - " in name:
            artist, title = [x.strip() for x in name.split(" - ", 1)]
        meta = {"title": title, "artist": artist, "album": os.path.basename(os.path.dirname(p)), "duration": 0, "art": ""}
        if mutagen is None:
            return meta
        try:
            f = mutagen.File(p, easy=True)
            if f is not None:
                meta["duration"] = float(getattr(f.info, "length", 0) or 0)
                g = lambda k: (f.get(k) or [""])[0] if hasattr(f, "get") else ""
                meta["title"] = g("title") or meta["title"]
                meta["artist"] = g("artist") or meta["artist"]
                meta["album"] = g("album") or meta["album"]
            raw = mutagen.File(p)
            data = None
            if raw is not None:
                tags = getattr(raw, "tags", None)
                if tags is not None:
                    for k in list(tags.keys()):
                        if str(k).startswith("APIC"):
                            data = tags[k].data
                            break
                    if data is None and "covr" in tags:
                        data = bytes(tags["covr"][0])
                if data is None and hasattr(raw, "pictures") and raw.pictures:
                    data = raw.pictures[0].data
            if data:
                h = hashlib.sha1(data).hexdigest()
                out = self.art / f"{h}.jpg"
                if not out.exists():
                    out.write_bytes(data)
                meta["art"] = str(out)
        except Exception:
            pass
        return meta
