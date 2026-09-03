# -*- coding: utf-8 -*-
"""폴더 안 웹문서 발행기를 한 대씩 실행·대기·종료."""

from __future__ import annotations

import json
import os
import socket
import subprocess
import threading
import time
import urllib.error
import urllib.request
from datetime import date, datetime
from typing import Any, Dict, List, Optional

from daily_scheduler import DailyScheduler, normalize_hhmm, parse_hhmm
from process_kill import (
    close_chrome_tabs,
    kill_job_chrome,
    kill_port,
    taskkill_tree,
    wait_port_free,
)
from settings_store import load_settings, save_settings

PORT_START = 17865
PORT_END = 17895
SKIP_DIRS = {
    "_internal",
    "build",
    "__pycache__",
    ".git",
    "output",
    "seo-data",
    "naver_vm",
    "templates",
}


def _now() -> str:
    return datetime.now().strftime("%H:%M:%S")


def find_publishers(folder: str) -> List[Dict[str, str]]:
    folder = os.path.abspath(folder or "")
    found: List[Dict[str, str]] = []
    if not folder or not os.path.isdir(folder):
        return found
    for root, dirs, files in os.walk(folder):
        dirs[:] = [
            d
            for d in dirs
            if d.lower() not in SKIP_DIRS and not d.startswith(".")
        ]
        if "_internal" in root.lower().replace("/", "\\").split("\\"):
            continue
        for name in files:
            if not name.lower().endswith(".exe"):
                continue
            stem = name[:-4]
            if "전체스케줄" in stem or "전체스케쥴" in stem:
                continue
            if "웹문서생성기" not in stem and "웹문서발행기" not in stem:
                continue
            exe = os.path.join(root, name)
            found.append({"name": stem, "exe": exe, "dir": root})
    found.sort(key=lambda x: x["name"])
    return found


def pick_folder() -> str:
    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    path = filedialog.askdirectory(title="웹문서 발행기 폴더 선택")
    root.destroy()
    return path or ""


def _http_json(method: str, url: str, timeout: float = 4.0) -> Optional[Dict[str, Any]]:
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if method == "POST":
        req.data = b"{}"
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            data = json.loads(raw) if raw else {}
            return data if isinstance(data, dict) else {}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError):
        return None


def _port_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.25)
        return s.connect_ex(("127.0.0.1", port)) == 0


def occupied_ports() -> set[int]:
    return {p for p in range(PORT_START, PORT_END + 1) if _port_open(p)}


def discover_new_port(
    before: set[int],
    timeout: float = 90.0,
    should_stop=None,
) -> Optional[int]:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if should_stop and should_stop():
            return None
        for port in range(PORT_START, PORT_END + 1):
            if port in before:
                continue
            if not _port_open(port):
                continue
            state = _http_json("GET", f"http://127.0.0.1:{port}/api/state")
            if state is not None and "running" in state:
                return port
        time.sleep(0.6)
    return None


class SequentialRunner:
    def __init__(self) -> None:
        self.settings = load_settings()
        self.logs: List[str] = []
        self.status = "대기 중"
        self.running = False
        self.stop_requested = False
        self.current_name = ""
        self.progress = ""
        self.schedule_status = "매일 자동: 꺼짐"
        self._lock = threading.Lock()
        self._thread: Optional[threading.Thread] = None
        self._scheduler: Optional[DailyScheduler] = None
        self._active_proc: Optional[subprocess.Popen] = None
        self._active_port: Optional[int] = None
        self._active_job: Optional[Dict[str, str]] = None
        if self.settings.get("schedule_enabled"):
            self.restart_scheduler()

    def log(self, msg: str) -> None:
        line = f"[{_now()}] {msg}"
        self.logs.append(line)
        if len(self.logs) > 400:
            self.logs = self.logs[-400:]

    def snapshot(self) -> Dict[str, Any]:
        return {
            "settings": self.settings,
            "status": self.status,
            "running": self.running,
            "current_name": self.current_name,
            "progress": self.progress,
            "logs": self.logs[-160:],
            "schedule_status": self.schedule_status,
            "stopping": bool(self.stop_requested and self.running),
        }

    def update_settings(self, data: Dict[str, Any]) -> None:
        if "folder" in data:
            self.settings["folder"] = str(data.get("folder") or "")
        if "max_wait_min" in data:
            try:
                self.settings["max_wait_min"] = max(10, int(data.get("max_wait_min") or 180))
            except (TypeError, ValueError):
                self.settings["max_wait_min"] = 180
        if "selected" in data and isinstance(data.get("selected"), list):
            self.settings["selected"] = [str(x) for x in data["selected"]]
        if "jobs" in data and isinstance(data.get("jobs"), list):
            self.settings["jobs"] = self._clean_jobs(data["jobs"])
            self.settings["selected"] = [j["exe"] for j in self.settings["jobs"]]
        save_settings(self.settings)

    def _clean_jobs(self, jobs: List[Any]) -> List[Dict[str, str]]:
        clean: List[Dict[str, str]] = []
        for job in jobs:
            if not isinstance(job, dict):
                continue
            exe = str(job.get("exe") or "")
            if not exe:
                continue
            name = str(job.get("name") or os.path.splitext(os.path.basename(exe))[0])
            directory = str(job.get("dir") or os.path.dirname(exe))
            clean.append({"name": name, "exe": exe, "dir": directory})
        return clean

    def resolve_jobs(self, jobs: Optional[List[Any]] = None) -> List[Dict[str, str]]:
        if jobs:
            return self._clean_jobs(jobs)
        saved = self._clean_jobs(self.settings.get("jobs") or [])
        if saved:
            return saved
        selected = [str(x) for x in (self.settings.get("selected") or [])]
        if not selected:
            return []
        by_exe = {item["exe"]: item for item in find_publishers(str(self.settings.get("folder") or ""))}
        resolved: List[Dict[str, str]] = []
        for exe in selected:
            if exe in by_exe:
                resolved.append(by_exe[exe])
            elif os.path.isfile(exe):
                resolved.append(
                    {
                        "name": os.path.splitext(os.path.basename(exe))[0],
                        "exe": exe,
                        "dir": os.path.dirname(exe),
                    }
                )
        return resolved

    def request_stop(self) -> None:
        if not self.running and self._active_proc is None:
            self.log("지금은 실행 중이 아닙니다.")
            return
        self.stop_requested = True
        self.status = "중지 중…"
        self.log("중지 — 지금 발행기를 닫고 다음으로 넘어가지 않습니다.")
        self._abort_active()

    def request_quit(self) -> None:
        self.stop_requested = True
        self.status = "종료 중…"
        self.log("프로그램 종료 — 실행 중인 발행기를 닫습니다.")
        if self._scheduler:
            self._scheduler.stop()
            self._scheduler = None
        self._abort_active()
        close_chrome_tabs(["웹문서 발행기 전체 스케줄러", "전체 스케줄러"], None)

    def _abort_active(self) -> None:
        proc = self._active_proc
        port = self._active_port
        job = self._active_job
        if proc is None and port is None:
            return
        self._stop_process(proc, port, job)
        self._active_proc = None
        self._active_port = None
        self._active_job = None

    def start(self, jobs: Optional[List[Any]] = None, *, from_schedule: bool = False) -> bool:
        jobs = self.resolve_jobs(jobs)
        with self._lock:
            if self.running:
                self.log("이미 순차 실행 중입니다.")
                return from_schedule
            if not jobs:
                self.log("실행할 발행기를 선택하세요. 매일 자동을 쓰려면 목록을 체크한 뒤 스케줄을 저장하세요.")
                return False
            self.running = True
            self.stop_requested = False
            self.status = f"순차 실행 시작 · {len(jobs)}대"
            self.progress = f"0/{len(jobs)}"
            self.log(f"순차 실행 시작 · {len(jobs)}대" + (" (매일 자동)" if from_schedule else ""))
            self.settings["jobs"] = jobs
            self.settings["selected"] = [j["exe"] for j in jobs]
            self.settings["schedule_last_run_date"] = date.today().isoformat()
            save_settings(self.settings)

        def worker() -> None:
            try:
                self._run_jobs(jobs)
            except Exception as e:
                self.log(f"오류: {e}")
            finally:
                self.running = False
                self.current_name = ""
                self.status = "중지됨" if self.stop_requested else "대기 중"
                if not self.stop_requested:
                    self.log("오늘 순차 실행이 끝났습니다.")
                    if self.settings.get("schedule_enabled"):
                        self.log("매일 자동이 켜져 있습니다. 내일 지정 시각에 다시 돌아갑니다.")

        self._thread = threading.Thread(target=worker, daemon=True)
        self._thread.start()
        return True

    def _run_jobs(self, jobs: List[Dict[str, str]]) -> None:
        total = len(jobs)
        for i, job in enumerate(jobs, start=1):
            if self.stop_requested:
                self.log("남은 발행기는 건너뜁니다.")
                break
            self.current_name = job["name"]
            self.progress = f"{i}/{total}"
            self.status = f"{i}/{total} · {job['name']}"
            self.log(f"[{i}/{total}] {job['name']} 실행")
            self._run_one(job)
        self.progress = f"{total}/{total}"

    def _run_one(self, job: Dict[str, str]) -> None:
        exe = job["exe"]
        cwd = job["dir"]
        if not os.path.isfile(exe):
            self.log(f"실행 파일이 없습니다: {exe}")
            return

        before = occupied_ports()
        if before:
            self.log(f"이미 열린 발행기 포트: {sorted(before)}")

        try:
            proc = subprocess.Popen(
                [exe],
                cwd=cwd,
                close_fds=True,
            )
        except OSError as e:
            self.log(f"실행 실패: {e}")
            return

        self._active_proc = proc
        self._active_port = None
        self._active_job = job
        port = discover_new_port(
            before, timeout=90, should_stop=lambda: self.stop_requested
        )
        if self.stop_requested:
            self.log("중지로 실행을 중단합니다.")
            self._stop_process(proc, port, job)
            self._clear_active(proc)
            return
        if port is None:
            self.log("발행기 화면이 뜨지 않았습니다. 이 항목은 건너뜁니다.")
            self._stop_process(proc, None, job)
            self._clear_active(proc)
            return
        self._active_port = port

        self.log(f"연결됨 · 포트 {port}")
        state = _http_json("GET", f"http://127.0.0.1:{port}/api/state") or {}
        remaining = 0
        try:
            remaining = int((state.get("queue") or {}).get("remaining") or 0)
        except (TypeError, ValueError):
            remaining = 0
        if remaining <= 0:
            self.log("발행 큐가 비어 있어 건너뜁니다. (해당 발행기에서 큐를 먼저 만드세요)")
            self._stop_process(proc, port, job)
            self._clear_active(proc)
            return

        if self.stop_requested:
            self._stop_process(proc, port, job)
            self._clear_active(proc)
            return

        started = _http_json("POST", f"http://127.0.0.1:{port}/api/batch/run")
        if started is None:
            self.log("자동 발행 API가 없습니다. 창에서 [오늘 분량 지금 발행]을 눌러 주세요.")
        else:
            self.log("오늘 분량 발행을 시작했습니다.")

        if not self._wait_until_started(port, 25):
            if started is not None:
                self.log("발행이 시작되지 않았습니다. 큐가 비었거나 이미 작업 중일 수 있습니다.")
                self._stop_process(proc, port, job)
                self._clear_active(proc)
                return

        max_wait = max(10, int(self.settings.get("max_wait_min") or 180)) * 60
        self.log(f"작업 완료 대기 중… (최대 {max_wait // 60}분)")
        finished = self._wait_until_idle(port, proc, max_wait)
        if self.stop_requested:
            self.log("중지로 현재 발행기를 닫습니다.")
            if port is not None:
                _http_json("POST", f"http://127.0.0.1:{port}/api/batch/stop")
        elif finished:
            self.log(f"{job['name']} 한 사이클 완료")
        else:
            self.log(f"최대 대기 시간이 지나 {job['name']} 를 강제 종료합니다.")

        if self._active_proc is proc:
            self._stop_process(proc, port, job)
        self._clear_active(proc)

    def _clear_active(self, proc: Optional[subprocess.Popen]) -> None:
        if self._active_proc is proc:
            self._active_proc = None
            self._active_port = None
            self._active_job = None

    def _wait_until_started(self, port: int, timeout: float) -> bool:
        deadline = time.time() + timeout
        while time.time() < deadline and not self.stop_requested:
            state = _http_json("GET", f"http://127.0.0.1:{port}/api/state")
            if state and state.get("running"):
                return True
            time.sleep(0.8)
        return False

    def _wait_until_idle(self, port: int, proc: subprocess.Popen, timeout: float) -> bool:
        deadline = time.time() + timeout
        saw_running = False
        idle_hits = 0
        while time.time() < deadline and not self.stop_requested:
            state = _http_json("GET", f"http://127.0.0.1:{port}/api/state")
            if state is None:
                if proc.poll() is not None and saw_running:
                    return True
                time.sleep(1.2)
                continue
            if state.get("running"):
                saw_running = True
                idle_hits = 0
                self.status = f"{self.progress} · {self.current_name} · 발행 중"
            elif saw_running:
                idle_hits += 1
                if idle_hits >= 2:
                    return True
            time.sleep(2.0)
        return False

    def _stop_process(
        self,
        proc: Optional[subprocess.Popen],
        port: Optional[int],
        job: Optional[Dict[str, str]] = None,
    ) -> None:
        job = job or {}
        if port is not None:
            _http_json("POST", f"http://127.0.0.1:{port}/api/quit")
        time.sleep(0.6)
        if proc is not None and proc.pid:
            taskkill_tree(proc.pid)
        killed_chrome = kill_job_chrome(str(job.get("dir") or ""), port)
        close_chrome_tabs(
            [job.get("name") or "", "웹문서생성기", "웹문서발행기"],
            port,
        )
        kill_port(port)
        if not wait_port_free(port, 20):
            self.log(f"포트 {port} 가 아직 열려 있습니다. 강제 종료를 한 번 더 시도합니다.")
            kill_port(port)
            wait_port_free(port, 8)
        if killed_chrome:
            self.log(f"발행기 크롬 창 {killed_chrome}개를 닫았습니다.")
        if port is None or not _port_open(port):
            self.log("발행기를 닫았습니다.")
        else:
            self.log("발행기 창이 남아 있을 수 있습니다. 다음 실행 전 크롬 탭을 확인해 주세요.")
        time.sleep(1.2)

    def set_schedule(self, enabled: bool, hhmm: str, jobs: Optional[List[Any]] = None) -> None:
        prev_time = str(self.settings.get("schedule_time") or "")
        hhmm = normalize_hhmm(hhmm, prev_time) or "09:00"
        if enabled and not parse_hhmm(hhmm):
            raise ValueError("시각은 HH:MM 형식이어야 합니다. 예: 09:00")
        was = bool(self.settings.get("schedule_enabled"))
        if jobs:
            self.settings["jobs"] = self._clean_jobs(jobs)
            self.settings["selected"] = [j["exe"] for j in self.settings["jobs"]]
        self.settings["schedule_enabled"] = enabled
        self.settings["schedule_time"] = hhmm
        if enabled and not was:
            self._mark_today_done_if_past()
        elif enabled and was and hhmm != prev_time:
            self._maybe_clear_skip_for_new_time(hhmm)
            parsed = parse_hhmm(hhmm)
            if parsed:
                self.log(f"매일 자동 시각 변경 → {parsed[0]:02d}:{parsed[1]:02d}")
        elif not enabled:
            self.log("매일 자동 OFF")
        else:
            parsed = parse_hhmm(hhmm)
            last = str(self.settings.get("schedule_last_run_date") or "")
            if parsed:
                self.log(
                    f"매일 자동 적용 — {parsed[0]:02d}:{parsed[1]:02d} · 마지막 {last or '—'} "
                    f"· 이 프로그램이 켜져 있어야 합니다."
                )
        self.restart_scheduler()
        save_settings(self.settings)

    def _maybe_clear_skip_for_new_time(self, hhmm: str) -> None:
        parsed = parse_hhmm(hhmm)
        if not parsed:
            return
        now = datetime.now()
        today = date.today().isoformat()
        if self.settings.get("schedule_last_run_date") != today:
            return
        hour, minute = parsed
        if (now.hour, now.minute) < (hour, minute):
            self.settings["schedule_last_run_date"] = ""
            self.log(
                f"새 시각 {hour:02d}:{minute:02d}은 아직 남음 → 오늘 자동 실행을 다시 예약합니다."
            )

    def _mark_today_done_if_past(self) -> None:
        parsed = parse_hhmm(str(self.settings.get("schedule_time") or ""))
        if not parsed:
            return
        now = datetime.now()
        today = date.today().isoformat()
        last = str(self.settings.get("schedule_last_run_date") or "")
        if last == today:
            self.log(
                f"매일 자동 ON — 오늘은 이미 처리됨. 다음은 내일 {parsed[0]:02d}:{parsed[1]:02d}."
            )
            return
        hour, minute = parsed
        if (now.hour, now.minute) >= (hour, minute):
            self.settings["schedule_last_run_date"] = today
            self.log(
                f"매일 자동 ON — 지금({now.strftime('%H:%M')})은 이미 "
                f"{hour:02d}:{minute:02d}이 지나 오늘은 건너뜁니다. "
                f"내일 {hour:02d}:{minute:02d}에 자동 실행합니다. "
                f"오늘 분이 필요하면 [선택한 순서대로 실행]을 누르세요."
            )
        else:
            self.log(
                f"매일 자동 ON — 오늘 {hour:02d}:{minute:02d}에 순차 실행합니다. "
                f"(이 프로그램이 그 시각에 켜져 있어야 함)"
            )

    def restart_scheduler(self) -> None:
        if self._scheduler:
            self._scheduler.stop()
            self._scheduler = None
        if not self.settings.get("schedule_enabled"):
            self.schedule_status = "매일 자동: 꺼짐"
            return
        self._scheduler = DailyScheduler(
            get_enabled=lambda: bool(self.settings.get("schedule_enabled")),
            get_hhmm=lambda: str(self.settings.get("schedule_time") or "09:00"),
            get_last_run_date=lambda: str(self.settings.get("schedule_last_run_date") or ""),
            set_last_run_date=self._set_last_run_date,
            on_fire=lambda: self.start(from_schedule=True),
            on_log=self.log,
            on_status=lambda s: setattr(self, "schedule_status", s),
        )
        self._scheduler.start()

    def _set_last_run_date(self, value: str) -> None:
        self.settings["schedule_last_run_date"] = value
        save_settings(self.settings)


RUNNER = SequentialRunner()
