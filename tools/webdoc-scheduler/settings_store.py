# -*- coding: utf-8 -*-
"""전체 스케줄러 설정 저장."""

from __future__ import annotations

import json
import os
import sys
from typing import Any, Dict


DEFAULT_FOLDER = r"C:\Users\USER\Desktop\준모웹이미지\웹문서생성기"


def app_dir() -> str:
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


def settings_path() -> str:
    return os.path.join(app_dir(), "scheduler_settings.json")


def load_settings() -> Dict[str, Any]:
    path = settings_path()
    data: Dict[str, Any] = {
        "folder": DEFAULT_FOLDER,
        "max_wait_min": 180,
        "selected": [],
        "jobs": [],
        "schedule_enabled": False,
        "schedule_time": "09:00",
        "schedule_last_run_date": "",
    }
    if not os.path.isfile(path):
        return data
    try:
        raw = json.loads(open(path, encoding="utf-8").read())
        if isinstance(raw, dict):
            data.update(raw)
    except (OSError, json.JSONDecodeError):
        pass
    return data


def save_settings(data: Dict[str, Any]) -> None:
    path = settings_path()
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except OSError:
        pass
