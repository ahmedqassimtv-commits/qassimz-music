"""QASSIMZ Music — local server (127.0.0.1 + random token).

/api/<method>   JSON API for the UI
/stream?u=..    same-origin audio relay (enables the equalizer + visualizer, strips Shoutcast/Icecast
                metadata and remembers the "now playing" title)
/local/<id>     local music files (Range)      /localart/<id>  embedded cover art
"""
from __future__ import annotations

import json
import mimetypes
import os
import secrets
import subprocess
import sys
import threading
import traceback
import urllib.parse
import urllib.request
import webbrowser
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import sources as SRC
from rooms import EQ_BANDS, EQ_PRESETS, ROOM_BY_ID, ROOMS
from store import Store

VERSION = "1.0.0"
REPO = "ahmedqassimtv-commits/qassimz-music"
NOW_PLAYING: dict = {}


def resource(rel: str) -> Path:
    base = getattr(sys, "_MEIPASS", Path(__file__).resolve().parent.parent)
    return Path(base) / rel


class Api:
    def __init__(self, store: Store):
        self.s = store
        self.window = None
        self.radio = SRC.Radio()
        self.archive = SRC.Archive()
        self.update_info = None
        self.pool = ThreadPoolExecutor(8)

    @property
    def audius(self):
        return SRC.Audius(self.s.settings().get("audius_key", ""))

    @property
    def youtube(self):
        return SRC.YouTube(self.s.settings().get("youtube_key", ""))

    # ------------------------------------------------------------ app
    def info(self):
        st = self.s.settings()
        safe = {k: v for k, v in st.items() if not k.endswith("_key")}
        safe["has_youtube"] = bool(st.get("youtube_key"))
        safe["has_audius_key"] = bool(st.get("audius_key"))
        return {"version": VERSION, "github": f"https://github.com/{REPO}", "support": f"https://github.com/{REPO}/issues",
                "site": "https://qassimz.com", "rooms": [{k: r[k] for k in ("id", "name", "en", "grad")} for r in ROOMS],
                "eq_presets": EQ_PRESETS, "eq_bands": EQ_BANDS, "settings": safe, "favs": self.s.fav_keys(),
                "update": self.update_info, "native": self.window is not None}

    def save_settings(self, values: dict):
        for k, v in (values or {}).items():
            if k.endswith("_key") and v == "__keep__":
                continue
            self.s.set(k, v)
        return self.info()["settings"]

    # ------------------------------------------------------------ discovery
    def home(self):
        st = self.s.settings()
        jobs = {
            "local_radio": lambda: self.radio.search(country=st.get("country") or "EG", limit=24),
            "world_radio": lambda: self.radio.search(limit=24),
            "trending": lambda: self.audius.trending(limit=24),
        }
        out = {k: [] for k in jobs}
        errors = {}
        futs = {k: self.pool.submit(f) for k, f in jobs.items()}
        for k, f in futs.items():
            try:
                out[k] = f.result(timeout=20)
            except Exception as e:
                errors[k] = str(e)
        out["history"] = self.s.history(16)
        out["favorites"] = self.s.favorites()[:16]
        out["errors"] = errors
        return out

    def room(self, id):
        r = ROOM_BY_ID[id]
        jobs = {"stations": lambda: self.radio.room(r["tags"], r["country"])}
        if r.get("audius"):
            a = r["audius"]
            jobs["tracks"] = (lambda: self.audius.trending(genre=a["genre"])) if a.get("genre") else (lambda: self.audius.search(a["query"]))
        if r.get("archive"):
            jobs["albums"] = lambda: self.archive.search(r["archive"], rows=24)
        if r.get("youtube") and self.s.settings().get("youtube_key"):
            jobs["videos"] = lambda: self.youtube.search(r["youtube"], 24)
        out = {"room": {k: r[k] for k in ("id", "name", "en", "grad")}, "stations": [], "tracks": [], "albums": [], "videos": [], "errors": {}}
        futs = {k: self.pool.submit(f) for k, f in jobs.items()}
        for k, f in futs.items():
            try:
                out[k] = f.result(timeout=25)
            except Exception as e:
                out["errors"][k] = str(e)
        return out

    def search(self, q):
        jobs = {"stations": lambda: self.radio.search(name=q, limit=30),
                "tracks": lambda: self.audius.search(q, 30),
                "albums": lambda: self.archive.search(f'"{q}" AND mediatype:audio', rows=16),
                "local": lambda: self.s.local(q)}
        if self.s.settings().get("youtube_key"):
            jobs["videos"] = lambda: self.youtube.search(q, 20)
        out = {"q": q, "errors": {}}
        futs = {k: self.pool.submit(f) for k, f in jobs.items()}
        for k, f in futs.items():
            try:
                out[k] = f.result(timeout=25)
            except Exception as e:
                out[k] = []
                out["errors"][k] = str(e)
        return out

    def radio_browse(self, tag=None, country=None, name=None, order="clickcount", offset=0):
        return self.radio.search(name=name, tag=tag, country=country, order=order, limit=60, offset=offset)

    def radio_countries(self): return self.radio.countries()
    def radio_tags(self): return self.radio.top_tags()
    def archive_album(self, id): return self.archive.tracks(id)

    def played(self, item: dict):
        self.s.add_history(item)
        if item.get("source") == "radio":
            threading.Thread(target=self.radio.click, args=(item["id"],), daemon=True).start()
        return True

    def now_playing(self, sid):
        return NOW_PLAYING.get(sid, "")

    # ------------------------------------------------------------ favorites / playlists / library
    def toggle_fav(self, item: dict): return self.s.toggle_fav(item)
    def favorites(self): return self.s.favorites()
    def history(self): return self.s.history(100)
    def clear_history(self): return self.s.clear_history()
    def playlists(self): return self.s.playlists()
    def playlist(self, id): return self.s.playlist(id)
    def playlist_create(self, name, item=None):
        pid = self.s.playlist_create(name)
        if item:
            self.s.playlist_add(pid, item)
        return pid
    def playlist_rename(self, id, name): return self.s.playlist_rename(id, name)
    def playlist_delete(self, id): return self.s.playlist_delete(id)
    def playlist_add(self, id, item: dict): return self.s.playlist_add(id, item)
    def playlist_remove(self, row): return self.s.playlist_remove(row)
    def playlist_reorder(self, id, rows: list): return self.s.playlist_reorder(id, rows)
    def local(self, q=None): return self.s.local(q)
    def scan(self): return self.s.scan()

    def add_music_dir(self):
        d = self._pick_folder()
        if d:
            dirs = self.s.settings()["music_dirs"]
            if d not in dirs:
                dirs.append(d)
                self.s.set("music_dirs", dirs)
            threading.Thread(target=self.s.scan, daemon=True).start()
        return self.s.settings()["music_dirs"]

    def remove_music_dir(self, path):
        self.s.set("music_dirs", [d for d in self.s.settings()["music_dirs"] if d != path])
        return self.s.settings()["music_dirs"]

    def _pick_folder(self):
        if not self.window:
            return None
        import webview  # type: ignore
        r = self.window.create_file_dialog(webview.FOLDER_DIALOG)
        return r[0] if r else None

    def open_url(self, url):
        if str(url).startswith(("http://", "https://")):
            webbrowser.open(url)
        return True

    def reveal(self, path):
        if os.name == "nt":
            subprocess.Popen(["explorer", "/select,", path])
        return True

    # ------------------------------------------------------------ update
    def check_update(self):
        try:
            rel = SRC.get_json(f"https://api.github.com/repos/{REPO}/releases/latest", ttl=0)
            tag = rel.get("tag_name", "").lstrip("vV")
            asset = next((a for a in rel.get("assets", []) if "setup" in a["name"].lower() and a["name"].endswith(".exe")), None)
            if asset and _ver(tag) > _ver(VERSION):
                self.update_info = {"version": tag, "url": asset["browser_download_url"]}
                return self.update_info
            return {"latest": True}
        except Exception as e:
            return {"error": str(e)}

    def install_update(self):
        import tempfile
        if not self.update_info:
            return False
        dst = Path(tempfile.gettempdir()) / f"QASSIMZ-Music-Setup-{self.update_info['version']}.exe"
        req = urllib.request.Request(self.update_info["url"], headers={"User-Agent": SRC.UA})
        with urllib.request.urlopen(req, timeout=180, context=SRC.ssl_ctx()) as r, open(dst, "wb") as f:
            f.write(r.read())
        subprocess.Popen([str(dst), "/SILENT", "/SUPPRESSMSGBOXES", "/NORESTART", "/CLOSEAPPLICATIONS"])
        threading.Timer(1.0, lambda: os._exit(0)).start()
        return True


def _ver(t):
    try:
        return tuple(int(x) for x in t.split(".")[:3])
    except Exception:
        return (0,)


# ====================================================================== HTTP
def make_handler(api: Api, token: str, ui: Path):
    class H(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *a):
            pass

        def _send(self, code, body: bytes, ctype="application/json; charset=utf-8", extra=None):
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store" if "json" in ctype else "max-age=3600")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        def _path(self):
            if not self.path.startswith(f"/{token}/"):
                return None
            return self.path[len(token) + 1:]

        def do_GET(self):
            p = self._path()
            if p is None:
                return self._send(403, b"forbidden", "text/plain")
            route, _, qs = p.partition("?")
            route = urllib.parse.unquote(route)
            q = urllib.parse.parse_qs(qs)
            try:
                if route == "/stream":
                    return self._relay(q.get("u", [""])[0], q.get("sid", [""])[0])
                if route.startswith("/local/"):
                    r = api.s.local_path(int(route.split("/")[2]))
                    return self._file(Path(r["path"])) if r and os.path.exists(r["path"]) else self._send(404, b"", "text/plain")
                if route.startswith("/localart/"):
                    r = api.s.local_path(int(route.split("/")[2]))
                    return self._file(Path(r["art"])) if r and r["art"] and os.path.exists(r["art"]) else self._send(404, b"", "text/plain")
                if route in ("/", ""):
                    route = "/index.html"
                f = (ui / route.lstrip("/")).resolve()
                if ui.resolve() not in f.parents or not f.is_file():
                    return self._send(404, b"not found", "text/plain")
                return self._file(f)
            except (BrokenPipeError, ConnectionResetError):
                pass

        do_HEAD = do_GET

        def _file(self, p: Path):
            size = p.stat().st_size
            ctype = mimetypes.guess_type(str(p))[0] or "application/octet-stream"
            if p.suffix == ".js":
                ctype = "text/javascript; charset=utf-8"
            rng = self.headers.get("Range")
            start, end, code = 0, size - 1, 200
            if rng and rng.startswith("bytes="):
                a, _, b = rng[6:].partition("-")
                start = int(a or 0)
                end = min(int(b) if b else size - 1, size - 1)
                code = 206
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(end - start + 1))
            if code == 206:
                self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            self.end_headers()
            if self.command == "HEAD":
                return
            with open(p, "rb") as fh:
                fh.seek(start)
                left = end - start + 1
                while left > 0:
                    chunk = fh.read(min(65536, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)

        def _relay(self, url, sid):
            if not url.startswith(("http://", "https://")):
                return self._send(400, b"bad url", "text/plain")
            headers = {"User-Agent": SRC.UA, "Icy-MetaData": "1", "Accept": "*/*"}
            if self.headers.get("Range"):
                headers["Range"] = self.headers["Range"]
            req = urllib.request.Request(url, headers=headers)
            try:
                up = urllib.request.urlopen(req, timeout=15, context=SRC.ssl_ctx() if url.startswith("https") else None)
            except Exception as e:
                return self._send(502, str(e).encode(), "text/plain")
            with up:
                metaint = int(up.headers.get("icy-metaint") or 0)
                ctype = up.headers.get("Content-Type") or "audio/mpeg"
                if ctype.startswith(("text/", "application/octet")) and metaint:
                    ctype = "audio/mpeg"
                self.send_response(up.status if up.status in (200, 206) else 200)
                self.send_header("Content-Type", ctype)
                self.send_header("Cache-Control", "no-store")
                if not metaint:
                    for h in ("Content-Length", "Content-Range", "Accept-Ranges"):
                        if up.headers.get(h):
                            self.send_header(h, up.headers[h])
                if metaint or not up.headers.get("Content-Length"):
                    self.send_header("Connection", "close")
                    self.close_connection = True
                name = up.headers.get("icy-name")
                if name and sid and sid not in NOW_PLAYING:
                    NOW_PLAYING[sid] = ""
                self.end_headers()
                if self.command == "HEAD":
                    return
                try:
                    if not metaint:
                        while True:
                            chunk = up.read(32768)
                            if not chunk:
                                break
                            self.wfile.write(chunk)
                        return
                    while True:
                        audio = up.read(metaint)
                        if not audio:
                            break
                        self.wfile.write(audio)
                        ln = up.read(1)
                        if not ln:
                            break
                        n = ln[0] * 16
                        if n:
                            meta = up.read(n).rstrip(b"\x00").decode("utf-8", "replace")
                            if "StreamTitle='" in meta:
                                title = meta.split("StreamTitle='", 1)[1].split("';", 1)[0].strip()
                                if sid:
                                    NOW_PLAYING[sid] = title
                except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                    pass
                except Exception:
                    pass
            self.close_connection = True

        def do_POST(self):
            p = self._path()
            if p is None:
                return self._send(403, b"forbidden", "text/plain")
            name = p.split("?")[0].removeprefix("/api/")
            fn = getattr(api, name, None)
            if name.startswith("_") or not callable(fn):
                return self._send(404, b'{"ok":false,"error":"unknown"}')
            try:
                n = int(self.headers.get("Content-Length") or 0)
                args = json.loads(self.rfile.read(n) or b"{}") if n else {}
                body = json.dumps({"ok": True, "data": fn(**args)}, ensure_ascii=False, default=str)
            except Exception as e:
                traceback.print_exc()
                body = json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False)
            self._send(200, body.encode("utf-8"))

    return H


def start_server(api: Api, port=0):
    token = secrets.token_urlsafe(16)
    httpd = ThreadingHTTPServer(("127.0.0.1", port), make_handler(api, token, resource("app/ui")))
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{httpd.server_address[1]}/{token}/"
