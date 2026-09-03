# -*- coding: utf-8 -*-
"""발행기 UI를 일반 브라우저 창으로 연다."""

from __future__ import annotations

import webbrowser


def open_ui(url: str) -> None:
    try:
        webbrowser.open(url, new=1)
    except Exception:
        webbrowser.open(url)


def close_ui() -> None:
    """일반 브라우저 탭은 닫지 않는다. 서버만 종료한다."""
    return
