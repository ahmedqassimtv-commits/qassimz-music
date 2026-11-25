"""QASSIMZ Music — music sources.

  radio    Radio Browser  (free, no key)        https://api.radio-browser.info
  audius   Audius         (free; optional key)  https://api.audius.co/v1
  archive  Internet Archive (public domain / CC) https://archive.org
  youtube  YouTube Data API (optional key) → played with the official embedded player
"""
from __future__ import annotations

import html
import json
import os
import random
import socket
import ssl
import threading
import time
import urllib.parse
import urllib.request

UA = "QASSIMZ-Music/1.0 (+https://github.com/ahmedqassimtv-commits/qassimz-music)"
_cache: dict = {}
_lock = threading.Lock()


def ssl_ctx():
    try:
        import certifi  # type: ignore
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def get_json(url, headers=None, ttl=600, timeout=12):
    key = url + json.dumps(headers or {}, sort_keys=True)
    with _lock:
        hit = _cache.get(key)
        if hit and time.time() - hit[0] < ttl:
            return hit[1]
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx() if url.startswith("https") else None) as r:
        data = json.loads(r.read().decode("utf-8", "replace"))
    with _lock:
        _cache[key] = (time.time(), data)
        if len(_cache) > 400:
            for k in sorted(_cache, key=lambda k: _cache[k][0])[:100]:
                _cache.pop(k, None)
    return data


# ===================================================================== Radio Browser
class Radio:
    FALLBACK = ["https://de1.api.radio-browser.info", "https://nl1.api.radio-browser.info",
                "https://at1.api.radio-browser.info", "https://de2.api.radio-browser.info"]

    def __init__(self):
        self.servers = None
        override = os.environ.get("QM_RADIO_BASE")
        if override:
            self.servers = [override]

    def _servers(self):
        if self.servers:
            return self.servers
        found = []
        try:  # documented discovery: DNS lookup of all.api.radio-browser.info
            for info in socket.getaddrinfo("all.api.radio-browser.info", 443, proto=socket.IPPROTO_TCP):
                ip = info[4][0]
                try:
                    host = socket.gethostbyaddr(ip)[0]
                    if host.endswith("radio-browser.info"):
                        found.append("https://" + host)
                except Exception:
                    pass
        except Exception:
            pass
        found = list(dict.fromkeys(found)) or list(self.FALLBACK)
        random.shuffle(found)
        self.servers = found
        return found

    def _get(self, path, params=None, ttl=900):
        q = ("?" + urllib.parse.urlencode(params, doseq=True)) if params else ""
        err = None
        for base in self._servers()[:4]:
            try:
                return get_json(base + path + q, ttl=ttl)
            except Exception as e:
                err = e
                continue
        raise RuntimeError(f"Radio Browser مش متاح دلوقتي: {err}")

    @staticmethod
    def _norm(s):
        url = s.get("url_resolved") or s.get("url") or ""
        return {"source": "radio", "id": s.get("stationuuid"), "title": (s.get("name") or "").strip(),
                "subtitle": ", ".join(x for x in [s.get("country") or s.get("countrycode"), (s.get("tags") or "").split(",")[0]] if x),
                "art": s.get("favicon") or "", "url": url, "tags": s.get("tags") or "", "country": s.get("countrycode") or "",
                "codec": s.get("codec") or "", "bitrate": s.get("bitrate") or 0, "votes": s.get("votes") or 0,
                "clicks": s.get("clickcount") or 0, "homepage": s.get("homepage") or "", "hls": bool(s.get("hls")), "live": True}

    def search(self, name=None, tag=None, country=None, language=None, order="clickcount", limit=60, offset=0):
        params = {"hidebroken": "true", "order": order, "reverse": "true", "limit": limit, "offset": offset}
        if name:
            params["name"] = name
        if tag:
            params["tag"] = tag
        if country:
            params["countrycode"] = country
        if language:
            params["language"] = language
        rows = self._get("/json/stations/search", params)
        out, seen = [], set()
        for s in rows:
            st = self._norm(s)
            key = st["title"].lower()
            if not st["url"] or st["hls"] or key in seen:   # HLS needs a different player — skip
                continue
            seen.add(key)
            out.append(st)
        return out

    def room(self, tags, country, limit=48):
        out, seen = [], set()
        for t in tags[:4]:
            try:
                for st in self.search(tag=t, limit=30):
                    if st["id"] not in seen:
                        seen.add(st["id"]); out.append(st)
            except Exception:
                pass
        if country and len(out) < limit:
            try:
                for st in self.search(country=country, tag=tags[0] if tags else None, limit=40) + (self.search(country=country, limit=40) if not tags else []):
                    if st["id"] not in seen:
                        seen.add(st["id"]); out.append(st)
            except Exception:
                pass
        out.sort(key=lambda s: -(s["clicks"] + s["votes"]))
        return out[:limit]

    def countries(self):
        rows = self._get("/json/countries", {"hidebroken": "true", "order": "stationcount", "reverse": "true"}, ttl=86400)
        return [{"code": r.get("iso_3166_1") or r.get("name"), "name": r.get("name"), "count": r.get("stationcount")}
                for r in rows if (r.get("stationcount") or 0) >= 5][:120]

    def top_tags(self):
        rows = self._get("/json/tags", {"hidebroken": "true", "order": "stationcount", "reverse": "true", "limit": 80}, ttl=86400)
        return [{"name": r["name"], "count": r["stationcount"]} for r in rows if len(r["name"]) > 1]

    def click(self, uuid):
        try:
            self._get(f"/json/url/{uuid}", ttl=0)
        except Exception:
            pass


# ===================================================================== Audius
class Audius:
    BASE = os.environ.get("QM_AUDIUS_BASE", "https://api.audius.co/v1")
    APP = "QASSIMZ-Music"

    def __init__(self, key=""):
        self.key = key or ""

    def _get(self, path, params=None, ttl=600):
        p = {"app_name": self.APP, **(params or {})}
        h = {"x-api-key": self.key} if self.key else {}
        return get_json(f"{self.BASE}{path}?{urllib.parse.urlencode(p)}", headers=h, ttl=ttl).get("data") or []

    def _norm(self, t):
        art = t.get("artwork") or {}
        return {"source": "audius", "id": t.get("id"), "title": t.get("title") or "", "subtitle": (t.get("user") or {}).get("name", ""),
                "art": art.get("480x480") or art.get("150x150") or "", "duration": t.get("duration") or 0,
                "url": f"{self.BASE}/tracks/{t.get('id')}/stream?app_name={self.APP}", "genre": t.get("genre") or "",
                "plays": t.get("play_count") or 0, "permalink": "https://audius.co" + (t.get("permalink") or ""), "live": False}

    def trending(self, genre=None, limit=40):
        p = {"limit": limit}
        if genre:
            p["genre"] = genre
        return [self._norm(t) for t in self._get("/tracks/trending", p)[:limit] if t.get("is_streamable", True)]

    def search(self, query, limit=40):
        return [self._norm(t) for t in self._get("/tracks/search", {"query": query, "limit": limit})[:limit] if t.get("is_streamable", True)]


# ===================================================================== Internet Archive
class Archive:
    BASE = os.environ.get("QM_ARCHIVE_BASE", "https://archive.org")
    AUDIO = (".mp3", ".ogg", ".m4a", ".flac")

    def search(self, q, rows=40):
        params = {"q": f"({q})", "fl[]": ["identifier", "title", "creator", "year", "downloads"], "rows": rows,
                  "sort[]": "downloads desc", "output": "json"}
        d = get_json(f"{self.BASE}/advancedsearch.php?{urllib.parse.urlencode(params, doseq=True)}", ttl=3600)
        out = []
        for doc in d.get("response", {}).get("docs", []):
            ident = doc.get("identifier")
            creator = doc.get("creator")
            if isinstance(creator, list):
                creator = "، ".join(creator[:2])
            out.append({"source": "archive", "id": ident, "title": doc.get("title") or ident,
                        "subtitle": " · ".join(x for x in [creator or "", str(doc.get("year") or "")] if x),
                        "art": f"{self.BASE}/services/img/{ident}", "is_album": True, "live": False,
                        "permalink": f"{self.BASE}/details/{ident}"})
        return out

    def tracks(self, ident):
        d = get_json(f"{self.BASE}/metadata/{urllib.parse.quote(ident)}", ttl=3600)
        meta = d.get("metadata", {})
        files = [f for f in d.get("files", []) if f.get("name", "").lower().endswith(self.AUDIO)]
        # prefer one derivative per track (mp3 > ogg)
        best = {}
        for f in files:
            stem = f["name"].rsplit(".", 1)[0]
            stem = stem.replace("_vbr", "").replace("_64kb", "")
            rank = 0 if f["name"].lower().endswith(".mp3") else 1
            if stem not in best or rank < best[stem][0]:
                best[stem] = (rank, f)
        out = []
        creator = meta.get("creator")
        if isinstance(creator, list):
            creator = "، ".join(creator[:2])
        for _, f in sorted(best.values(), key=lambda x: (str(x[1].get("track") or ""), x[1]["name"])):
            try:
                dur = float(str(f.get("length") or "0").split(":")[-1]) if ":" not in str(f.get("length") or "") else \
                    sum(float(x) * 60 ** i for i, x in enumerate(reversed(str(f["length"]).split(":"))))
            except Exception:
                dur = 0
            out.append({"source": "archive", "id": f"{ident}/{f['name']}", "title": f.get("title") or f["name"].rsplit(".", 1)[0],
                        "subtitle": creator or meta.get("title") or "", "art": f"{self.BASE}/services/img/{ident}",
                        "duration": dur, "url": f"{self.BASE}/download/{urllib.parse.quote(ident)}/{urllib.parse.quote(f['name'])}",
                        "permalink": f"{self.BASE}/details/{ident}", "live": False})
        return {"title": meta.get("title") or ident, "creator": creator or "", "tracks": out[:200]}


# ===================================================================== YouTube (optional)
class YouTube:
    BASE = "https://www.googleapis.com/youtube/v3"

    def __init__(self, key=""):
        self.key = key or ""

    def search(self, query, limit=25):
        if not self.key:
            return []
        p = {"part": "snippet", "q": query, "type": "video", "videoCategoryId": "10", "maxResults": limit,
             "videoEmbeddable": "true", "key": self.key}
        d = get_json(f"{self.BASE}/search?{urllib.parse.urlencode(p)}", ttl=3600)
        out = []
        for it in d.get("items", []):
            sn = it.get("snippet", {})
            vid = it.get("id", {}).get("videoId")
            if not vid:
                continue
            th = sn.get("thumbnails", {})
            out.append({"source": "youtube", "id": vid, "title": html.unescape(sn.get("title", "")), "subtitle": html.unescape(sn.get("channelTitle", "")),
                        "art": (th.get("high") or th.get("medium") or th.get("default") or {}).get("url", ""),
                        "permalink": f"https://www.youtube.com/watch?v={vid}", "live": False})
        return out
