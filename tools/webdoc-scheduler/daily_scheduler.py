# -*- coding: utf-8 -*-
"""매일 지정 시각에 콜백을 실행하는 스케줄러 (프로그램 실행 중)."""

from __future__ import annotations

import threading
from datetime import datetime, timedelta
from typing import Callable

LogFn = Callable[[str], None] | None


def parse_hhmm(value: str) -> tuple[int, int] | None:
    text = (value or "").strip()
    if not text:
        return None
    try:
        parts = text.replace("：", ":").split(":")
        hour = int(parts[0])
        minute = int(parts[1]) if len(parts) > 1 else 0
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return hour, minute
    except (TypeError, ValueError, IndexError):
        return None
    return None


def format_hhmm(hour: int, minute: int) -> str:
    return f"{hour:02d}:{minute:02d}"


def normalize_hhmm(value: str, fallback: str = "") -> str:
    parsed = parse_hhmm(value)
    if parsed:
        return format_hhmm(*parsed)
    parsed = parse_hhmm(fallback)
    if parsed:
        return format_hhmm(*parsed)
    return ""


def next_run_datetime(
    hour: int,
    minute: int,
    *,
    last_run_date: str = "",
    now: datetime | None = None,
) -> datetime:
    now = now or datetime.now()
    candidate = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if last_run_date == now.date().isoformat() or candidate <= now:
        candidate = candidate + timedelta(days=1)
        if candidate.date().isoformat() == last_run_date:
            candidate = candidate + timedelta(days=1)
    return candidate


class DailyScheduler:
    def __init__(
        self,
        *,
        get_enabled: Callable[[], bool],
        get_hhmm: Callable[[], str],
        get_last_run_date: Callable[[], str],
        set_last_run_date: Callable[[str], None],
        on_fire: Callable[[], bool],
        on_log: LogFn = None,
        on_status: Callable[[str], None] | None = None,
        poll_sec: float = 15.0,
    ) -> None:
        self._get_enabled = get_enabled
        self._get_hhmm = get_hhmm
        self._get_last_run_date = get_last_run_date
        self._set_last_run_date = set_last_run_date
        self._on_fire = on_fire
        self._on_log = on_log
        self._on_status = on_status
        self._poll_sec = max(5.0, float(poll_sec))
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._lock = threading.Lock()
        self._firing = False

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._loop, name="MasterDailyScheduler", daemon=True
        )
        self._thread.start()
        self._emit_status()

    def stop(self) -> None:
        self._stop.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        self._thread = None

    def is_alive(self) -> bool:
        return bool(self._thread and self._thread.is_alive())

    def _log(self, msg: str) -> None:
        if self._on_log:
            self._on_log(msg)

    def _emit_status(self) -> None:
        if not self._on_status:
            return
        if not self._get_enabled():
            self._on_status("매일 자동: 꺼짐")
            return
        parsed = parse_hhmm(self._get_hhmm())
        if not parsed:
            self._on_status("매일 자동: 시각 형식 오류 (예: 09:00)")
            return
        hour, minute = parsed
        last = self._get_last_run_date() or "—"
        nxt = next_run_datetime(hour, minute, last_run_date=self._get_last_run_date() or "")
        alive = "동작중" if self.is_alive() else "중지됨"
        self._on_status(
            f"매일 자동: {format_hhmm(hour, minute)} · 다음 {nxt.strftime('%m-%d %H:%M')} "
            f"· 마지막 {last} · {alive}"
        )

    def _should_fire(self, now: datetime) -> bool:
        if not self._get_enabled():
            return False
        parsed = parse_hhmm(self._get_hhmm())
        if not parsed:
            return False
        hour, minute = parsed
        if (now.hour, now.minute) < (hour, minute):
            return False
        if self._get_last_run_date() == now.date().isoformat():
            return False
        return True

    def _loop(self) -> None:
        self._log("매일 자동 시작 — 이 프로그램이 켜져 있는 동안 지정 시각에 한 바퀴 돕니다.")
        while not self._stop.is_set():
            try:
                self._emit_status()
                now = datetime.now()
                if self._should_fire(now):
                    with self._lock:
                        if not self._firing:
                            self._firing = True
                            self._log(
                                f"지정 시각 도달 ({now.strftime('%Y-%m-%d %H:%M')}) — 오늘 순차 실행"
                            )
                            started = False
                            try:
                                started = bool(self._on_fire())
                            except Exception as exc:
                                self._log(f"매일 자동 실행 오류: {exc}")
                                started = False
                            finally:
                                if started:
                                    today = now.date().isoformat()
                                    self._set_last_run_date(today)
                                    self._log(f"오늘({today}) 순차 실행을 시작했습니다.")
                                else:
                                    self._log("오늘 순차 실행을 시작하지 못했습니다. 잠시 뒤 다시 시도합니다.")
                                self._firing = False
                                self._emit_status()
            except Exception as exc:
                self._log(f"매일 자동 오류: {exc}")
            self._stop.wait(self._poll_sec)
        self._log("매일 자동 중지")
