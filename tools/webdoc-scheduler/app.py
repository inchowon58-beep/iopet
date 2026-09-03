# -*- coding: utf-8 -*-
"""웹문서 발행기 전체 스케줄러 — 폴더의 발행기를 한 대씩 실행."""

from __future__ import annotations

import os
import socket
import sys
import threading
import time
import webbrowser
from pathlib import Path

from flask import Flask, jsonify, render_template, request

from orchestrator import RUNNER, find_publishers, pick_folder


def _ensure_stdio() -> None:
    if sys.stdout is None:
        sys.stdout = open(os.devnull, "w", encoding="utf-8")
    if sys.stderr is None:
        sys.stderr = open(os.devnull, "w", encoding="utf-8")


def _resource_dir() -> Path:
    if getattr(sys, "frozen", False):
        meipass = Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent))
        if (meipass / "templates").is_dir():
            return meipass
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


ROOT = _resource_dir()
app = Flask(
    __name__,
    template_folder=str(ROOT / "templates"),
    static_folder=None,
)
quit_requested = False


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/state")
def api_state():
    snap = RUNNER.snapshot()
    folder = str(snap["settings"].get("folder") or "")
    items = find_publishers(folder)
    snap["items"] = items
    return jsonify(snap)


@app.post("/api/folder")
def api_folder():
    data = request.get_json(force=True, silent=True) or {}
    folder = str(data.get("folder") or "").strip()
    if not folder:
        folder = pick_folder()
    if folder:
        RUNNER.update_settings({"folder": folder})
    snap = RUNNER.snapshot()
    snap["items"] = find_publishers(str(RUNNER.settings.get("folder") or ""))
    return jsonify(snap)


@app.post("/api/settings")
def api_settings():
    data = request.get_json(force=True, silent=True) or {}
    RUNNER.update_settings(data)
    return jsonify(RUNNER.snapshot())


@app.post("/api/start")
def api_start():
    data = request.get_json(force=True, silent=True) or {}
    jobs = data.get("jobs") or []
    if not isinstance(jobs, list):
        jobs = []
    clean = []
    for job in jobs:
        if not isinstance(job, dict):
            continue
        exe = str(job.get("exe") or "")
        name = str(job.get("name") or os.path.splitext(os.path.basename(exe))[0])
        directory = str(job.get("dir") or os.path.dirname(exe))
        if exe:
            clean.append({"name": name, "exe": exe, "dir": directory})
    if "max_wait_min" in data:
        RUNNER.update_settings({"max_wait_min": data.get("max_wait_min")})
    ok = RUNNER.start(clean)
    snap = RUNNER.snapshot()
    if not ok:
        return jsonify(snap), 400
    return jsonify(snap)


@app.post("/api/schedule")
def api_schedule():
    data = request.get_json(force=True, silent=True) or {}
    jobs = data.get("jobs") or []
    if "max_wait_min" in data:
        RUNNER.update_settings({"max_wait_min": data.get("max_wait_min")})
    try:
        RUNNER.set_schedule(
            bool(data.get("enabled")),
            str(data.get("time") or ""),
            jobs if isinstance(jobs, list) else None,
        )
        return jsonify(RUNNER.snapshot())
    except ValueError as e:
        snap = RUNNER.snapshot()
        snap["error"] = str(e)
        return jsonify(snap), 400


@app.post("/api/stop")
def api_stop():
    RUNNER.request_stop()
    return jsonify(RUNNER.snapshot())


@app.post("/api/quit")
def api_quit():
    def _die() -> None:
        global quit_requested
        try:
            RUNNER.request_quit()
        finally:
            quit_requested = True
            time.sleep(0.3)
            os._exit(0)

    threading.Thread(target=_die, daemon=True).start()
    return jsonify({"ok": True})


def find_free_port(prefer: int = 17990) -> int:
    for port in [prefer, *range(prefer + 1, prefer + 20)]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return prefer


def run_browser_ui(port: int) -> None:
    url = f"http://127.0.0.1:{port}/"

    def serve() -> None:
        app.run(host="127.0.0.1", port=port, threaded=True, use_reloader=False)

    threading.Thread(target=serve, daemon=True).start()
    for _ in range(50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) == 0:
                break
        time.sleep(0.1)
    try:
        webbrowser.open(url, new=1)
    except Exception:
        webbrowser.open(url)
    while not quit_requested:
        time.sleep(0.4)
    os._exit(0)


def main() -> None:
    _ensure_stdio()
    port = find_free_port()
    run_browser_ui(port)


if __name__ == "__main__":
    main()
