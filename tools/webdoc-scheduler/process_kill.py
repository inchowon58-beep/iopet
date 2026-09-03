# -*- coding: utf-8 -*-
"""발행기 프로세스·해당 크롬 창/탭을 실제로 닫는다."""

from __future__ import annotations

import os
import socket
import subprocess
from typing import Iterable, List, Optional


def taskkill_tree(pid: Optional[int]) -> None:
    if not pid:
        return
    subprocess.run(
        ["taskkill", "/F", "/T", "/PID", str(pid)],
        capture_output=True,
        text=True,
        check=False,
    )


def pids_listening_on_port(port: int) -> List[int]:
    if not port:
        return []
    try:
        out = subprocess.check_output(
            ["netstat", "-ano", "-p", "TCP"],
            text=True,
            errors="replace",
        )
    except (OSError, subprocess.CalledProcessError):
        return []
    found: set[int] = set()
    needle = f":{port}"
    for line in out.splitlines():
        if "LISTENING" not in line.upper():
            continue  # 로컬 발행기 LISTENING 만
        if f"127.0.0.1:{port}" not in line and f"[::1]:{port}" not in line:
            continue
        parts = line.split()
        try:
            found.add(int(parts[-1]))
        except (IndexError, ValueError):
            continue
    return sorted(found)


def kill_port(port: Optional[int]) -> None:
    if not port:
        return
    for pid in pids_listening_on_port(port):
        taskkill_tree(pid)


def chrome_pids_for(job_dir: str, port: Optional[int]) -> List[int]:
    markers = []
    if job_dir:
        markers.append(os.path.abspath(job_dir).lower())
        markers.append(os.path.join(os.path.abspath(job_dir), "chrome-ui-profile").lower())
    if port:
        markers.append(f"127.0.0.1:{port}")
        markers.append(f"localhost:{port}")
    if not markers:
        return []
    try:
        out = subprocess.check_output(
            [
                "wmic",
                "process",
                "where",
                "name='chrome.exe'",
                "get",
                "ProcessId,CommandLine",
                "/FORMAT:LIST",
            ],
            text=True,
            errors="replace",
        )
    except (OSError, subprocess.CalledProcessError):
        return []
    pids: List[int] = []
    current_cmd = ""
    for raw in out.splitlines():
        line = raw.strip()
        if line.lower().startswith("commandline="):
            current_cmd = line.split("=", 1)[-1].lower()
        elif line.lower().startswith("processid="):
            try:
                pid = int(line.split("=", 1)[-1])
            except ValueError:
                current_cmd = ""
                continue
            if current_cmd and any(m in current_cmd for m in markers):
                pids.append(pid)
            current_cmd = ""
    return pids


def kill_job_chrome(job_dir: str, port: Optional[int]) -> int:
    pids = chrome_pids_for(job_dir, port)
    for pid in pids:
        taskkill_tree(pid)
    return len(pids)


def close_chrome_tabs(title_needles: Iterable[str], port: Optional[int]) -> None:
    """같은 Chrome 창의 탭만 닫는다. 전체 Chrome 은 종료하지 않는다."""
    needles = [n for n in title_needles if n]
    if port:
        needles.append(f"127.0.0.1:{port}")
        needles.append(f"localhost:{port}")
    if not needles:
        return
    checks = " -or ".join(
        f"$n -like '*{_ps_escape(n)}*'" for n in needles
    )
    script = f"""
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -AssemblyName UIAutomationClient
$root = [System.Windows.Automation.AutomationElement]::RootElement
$tabType = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
  [System.Windows.Automation.ControlType]::TabItem)
$tabs = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $tabType)
foreach ($tab in $tabs) {{
  $n = $tab.Current.Name
  if (-not $n) {{ continue }}
  if (-not ({checks})) {{ continue }}
  if ($n -like '*전체스케줄*') {{ continue }}
  foreach ($closeName in @('닫기','Close','닫기 탭','Close Tab')) {{
    $c = New-Object System.Windows.Automation.PropertyCondition(
      [System.Windows.Automation.AutomationElement]::NameProperty, $closeName)
    $btn = $tab.FindFirst([System.Windows.Automation.TreeScope]::Children, $c)
    if ($btn) {{
      try {{
        $pat = $btn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
        $pat.Invoke()
      }} catch {{}}
      break
    }}
  }}
}}
"""
    subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
        capture_output=True,
        text=True,
        check=False,
    )


def _ps_escape(text: str) -> str:
    return text.replace("'", "''")


def wait_port_free(port: Optional[int], timeout: float = 20.0) -> bool:
    if not port:
        return True
    import time

    deadline = time.time() + timeout
    while time.time() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.25)
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return True
        time.sleep(0.3)
    return False
