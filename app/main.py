"""QASSIMZ Music — desktop entry point."""
from __future__ import annotations

import os
import sys
import threading
import time
from pathlib import Path

# Guard stdio under PyInstaller --noconsole so libraries/tracebacks never crash on None streams
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w", encoding="utf-8")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w", encoding="utf-8")

import webview  # pywebview

from server import Api, resource, start_server
from store import Store


def data_dir() -> Path:
    return Path(os.environ.get("APPDATA", Path.home())) / "QASSIMZ Music"


def _focus_win32_webview() -> None:
    if os.name != "nt":
        return
    try:
        import ctypes
        from ctypes import wintypes

        u32 = ctypes.windll.user32
        fg = u32.GetForegroundWindow()
        if not fg:
            return
        found: list[int] = []

        @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
        def _enum_cb(hwnd, _lparam):
            buf = ctypes.create_unicode_buffer(128)
            u32.GetClassNameW(hwnd, buf, 128)
            if "Chrome_WidgetWin" in buf.value or "WebView" in buf.value:
                found.append(hwnd)
                return False
            return True

        u32.EnumChildWindows(fg, _enum_cb, 0)
        if found:
            u32.SetFocus(found[0])
    except Exception:
        pass


def main():
    store = Store(data_dir())
    api = Api(store)
    url = start_server(api)
    win = webview.create_window(
        "QASSIMZ Music",
        url,
        width=1380,
        height=880,
        min_size=(1080, 680),
        background_color="#090B0E",
    )
    api.window = win

    def focus_webview():
        try:
            win.evaluate_js("window.focus(); document.body && document.body.focus();")
        except Exception:
            pass
        _focus_win32_webview()

    try:
        win.events.loaded += focus_webview
        win.events.shown += lambda: threading.Timer(0.25, focus_webview).start()
    except Exception:
        pass

    def boot():
        threading.Thread(target=store.scan, daemon=True).start()
        if store.settings().get("auto_update", True):
            time.sleep(5)
            api.check_update()

    threading.Thread(target=boot, daemon=True).start()
    webview.start(
        gui="edgechromium" if os.name == "nt" else None,
        debug="--debug" in sys.argv,
        icon=str(resource("assets/logo.ico")),
        private_mode=False,
        storage_path=str(data_dir() / "webview"),
    )


if __name__ == "__main__":
    main()
