# -*- coding: utf-8 -*-
"""Downloads CSV 3종 -> src/data/local-pet-biz.json (전화·좌표 제외)."""
from __future__ import annotations

import csv
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = Path.home() / "Downloads"
OUT = ROOT / "src" / "data" / "local-pet-biz.json"

SIDO_ALIAS = [
    ("서울특별시", "서울특별시"),
    ("부산광역시", "부산광역시"),
    ("대구광역시", "대구광역시"),
    ("인천광역시", "인천광역시"),
    ("광주광역시", "광주광역시"),
    ("대전광역시", "대전광역시"),
    ("울산광역시", "울산광역시"),
    ("세종특별자치시", "세종특별자치시"),
    ("경기도", "경기도"),
    ("강원특별자치도", "강원특별자치도"),
    ("충청북도", "충청북도"),
    ("충청남도", "충청남도"),
    ("전북특별자치도", "전북특별자치도"),
    ("전라남도", "전라남도"),
    ("경상북도", "경상북도"),
    ("경상남도", "경상남도"),
    ("제주특별자치도", "제주특별자치도"),
    ("전라북도", "전북특별자치도"),
    ("강원도", "강원특별자치도"),
    ("제주도", "제주특별자치도"),
    ("서울시", "서울특별시"),
    ("부산시", "부산광역시"),
    ("대구시", "대구광역시"),
    ("인천시", "인천광역시"),
    ("광주시", "광주광역시"),
    ("대전시", "대전광역시"),
    ("울산시", "울산광역시"),
    ("세종시", "세종특별자치시"),
    ("경기", "경기도"),
    ("강원", "강원특별자치도"),
    ("충북", "충청북도"),
    ("충남", "충청남도"),
    ("전북", "전북특별자치도"),
    ("전남", "전라남도"),
    ("경북", "경상북도"),
    ("경남", "경상남도"),
    ("제주", "제주특별자치도"),
    ("서울", "서울특별시"),
    ("부산", "부산광역시"),
    ("대구", "대구광역시"),
    ("인천", "인천광역시"),
    ("광주", "광주광역시"),
    ("대전", "대전광역시"),
    ("울산", "울산광역시"),
    ("세종", "세종특별자치시"),
]


def load_regions() -> list[tuple[str, str, list[str]]]:
    text = (ROOT / "src" / "lib" / "korea-regions.ts").read_text(encoding="utf-8")
    rows = []
    for m in re.finditer(r'\["([^"]+)", "([^"]+)", \[([^\]]*)\]\]', text):
        sido, sigungu, raw = m.group(1), m.group(2), m.group(3)
        dongs = re.findall(r'"([^"]+)"', raw)
        rows.append((sido, sigungu, dongs))
    if len(rows) < 200:
        raise SystemExit(f"region parse failed: {len(rows)}")
    return rows


REGIONS = load_regions()
BY_SIDO: dict[str, list[tuple[str, str, list[str]]]] = defaultdict(list)
for row in REGIONS:
    BY_SIDO[row[0]].append(row)
for sido in BY_SIDO:
    BY_SIDO[sido].sort(key=lambda r: len(r[1]), reverse=True)


def detect_sido(addr: str) -> str | None:
    compact = addr.replace(" ", "")
    for alias, full in sorted(SIDO_ALIAS, key=lambda x: len(x[0]), reverse=True):
        if addr.startswith(alias) or compact.startswith(alias.replace(" ", "")):
            return full
    return None


def detect_sigungu(sido: str, addr: str) -> tuple[str, str, list[str]] | None:
    for row in BY_SIDO.get(sido, []):
        _, sigungu, dongs = row
        if sigungu in addr:
            return row
        short = sigungu[:-1] if sigungu.endswith(("시", "군", "구")) and len(sigungu) > 2 else sigungu
        if short and short != sigungu and short in addr:
            # avoid 중 matching 중구 blindly — require 시/군/구 boundary
            if sigungu.endswith(("시", "군")) and short + sigungu[-1] in addr.replace(" ", ""):
                return row
    if sido == "세종특별자치시":
        return BY_SIDO[sido][0]
    return None


DONG_RE = re.compile(r"([가-힣]+(?:[0-9]+가)?동|[가-힣]+읍|[가-힣]+면|[가-힣]+리)")


def normalize_dong(token: str) -> str:
    token = token.strip().split()[0]
    token = re.sub(r"[0-9]+가$", "", token)
    token = token.replace("·", "")
    return token


def extract_dong(addr: str, known: list[str]) -> str:
    paren = re.findall(r"\(([^)]+)\)", addr)
    candidates: list[str] = []
    for p in paren:
        first = p.split(",")[0]
        for m in DONG_RE.findall(first):
            candidates.append(m)
    for m in DONG_RE.findall(addr):
        if m not in ("대로",):
            candidates.append(m)

    known_set = set(known)
    for raw in candidates:
        n = normalize_dong(raw)
        if n in known_set:
            return n
        for k in known:
            if n.startswith(k) or k.startswith(n):
                return k
        for prefix in ("상", "하", "동", "서", "남", "북", "내", "외"):
            if n.startswith(prefix) and n[1:] in known_set:
                return n[1:]
    if candidates:
        return normalize_dong(candidates[0])
    return ""


def open_csv(path: Path):
    raw = path.read_bytes()
    for enc in ("utf-8-sig", "utf-8", "cp949"):
        try:
            text = raw.decode(enc)
            return csv.DictReader(text.splitlines())
        except UnicodeDecodeError:
            continue
    raise SystemExit(f"decode fail: {path}")


def parse_address(*parts: str) -> tuple[str, str, str] | None:
    addr = " ".join(p.strip() for p in parts if p and p.strip())
    addr = addr.replace("*", "").replace("  ", " ").strip()
    if not addr:
        return None
    sido = detect_sido(addr)
    if not sido:
        return None
    row = detect_sigungu(sido, addr)
    if not row:
        return None
    dong = extract_dong(addr, row[2])
    return row[0], row[1], dong


def add(bucket: dict, kind: str, name: str, loc: tuple[str, str, str] | None, year: str = ""):
    if not loc or not name:
        return
    sido, sigungu, dong = loc
    key = f"{sido}_{sigungu}"
    rec = bucket[key]
    item = [name.strip()[:40], dong, year[:4] if year else ""]
    rec[kind].append(item)


def unique_rows(rows: list[list[str]]) -> list[list[str]]:
    seen = set()
    out = []
    for row in rows:
        name, dong = row[0], row[1]
        year = row[2] if len(row) > 2 else ""
        k = (name, dong, year)
        if k in seen:
            continue
        seen.add(k)
        out.append([name, dong, year])
    out.sort(key=lambda r: (r[1] or "힣", r[0]))
    return out


OPERATING = {"영업", "영업/정상", "정상"}
EMPTY_REC = lambda: {"s": [], "b": [], "h": [], "p": [], "g": [], "w": []}


def permit_year(row: dict) -> str:
    raw = (row.get("인허가일자") or "").strip().replace("-", "")
    return raw[:4] if len(raw) >= 4 else ""


def ingest_permit(path: Path, bucket: dict, kind: str, kept: dict, unmatched: dict, label: str):
    for row in open_csv(path):
        status = (row.get("영업상태명") or "").strip()
        if status not in OPERATING:
            continue
        name = (row.get("사업장명") or row.get("FRNM_NM") or "").strip()
        loc = parse_address(row.get("도로명주소") or "", row.get("지번주소") or "")
        if not loc:
            unmatched[label] += 1
            continue
        add(bucket, kind, name, loc, permit_year(row))
        kept[label] += 1


def ingest_listing(path: Path, bucket: dict, kind: str, kept: dict, unmatched: dict, label: str):
    for row in open_csv(path):
        name = (row.get("FRNM_NM") or "").strip()
        loc = parse_address(row.get("RN_ADDR") or "")
        if not loc:
            unmatched[label] += 1
            continue
        add(bucket, kind, name, loc, "")
        kept[label] += 1


def map_reg_sido(name: str) -> str | None:
    return detect_sido(name) if name else None


def ingest_dogs(path: Path) -> tuple[dict[str, int], dict[str, int]]:
    dogs: dict[str, int] = {}
    cats: dict[str, int] = {}
    for row in open_csv(path):
        vals = list(row.values())
        if len(vals) < 5:
            continue
        sido_raw, sigungu_raw, dog_s, cat_s, _total = vals[0], vals[1], vals[2], vals[3], vals[4]
        if not (sigungu_raw or "").strip():
            continue
        sido = map_reg_sido(sido_raw)
        if not sido:
            continue
        sigungu = sigungu_raw.strip()
        row_hit = detect_sigungu(sido, f"{sido} {sigungu}")
        if not row_hit and sigungu in (sido, "세종특별자치시"):
            row_hit = BY_SIDO.get(sido, [None])[0]
        if not row_hit:
            # 고양시 덕양구 -> 고양시
            for cand in BY_SIDO.get(sido, []):
                if cand[1] in sigungu or sigungu.startswith(cand[1]):
                    row_hit = cand
                    break
        if not row_hit:
            continue
        key = f"{row_hit[0]}_{row_hit[1]}"
        try:
            dogs[key] = int(str(dog_s).replace(",", "") or 0)
            cats[key] = int(str(cat_s).replace(",", "") or 0)
        except ValueError:
            continue
    return dogs, cats


def main():
    sales_path = DOWNLOADS / "반려동물판매업체현황.csv"
    hospital_path = DOWNLOADS / "동물병원_전국.csv"
    pharmacy_path = DOWNLOADS / "동물약국_전국.csv"
    breed_path = DOWNLOADS / "동물_동물생산업.csv"
    groom_path = DOWNLOADS / "동물_동물미용업.csv"
    board_path = DOWNLOADS / "동물_동물위탁관리업.csv"
    dogs_path = ROOT / "tools" / "local-pet-biz" / "pet-registration-20221231.csv"
    for p in (sales_path, hospital_path, pharmacy_path, breed_path, groom_path, board_path, dogs_path):
        if not p.exists():
            raise SystemExit(f"missing {p}")

    bucket: dict[str, dict[str, list]] = defaultdict(EMPTY_REC)
    unmatched = {k: 0 for k in ("sales", "breeding", "hospital", "pharmacy", "groom", "board")}
    kept = {k: 0 for k in unmatched}

    for row in open_csv(sales_path):
        status = (row.get("영업상태명") or "").strip()
        if status not in OPERATING:
            continue
        name = (row.get("사업장명") or "").strip()
        loc = parse_address(row.get("소재지도로명주소") or "", row.get("소재지지번주소") or "")
        if not loc:
            unmatched["sales"] += 1
            continue
        add(bucket, "s", name, loc, (row.get("인허가일자") or "")[:4])
        kept["sales"] += 1

    ingest_permit(breed_path, bucket, "b", kept, unmatched, "breeding")
    ingest_permit(groom_path, bucket, "g", kept, unmatched, "groom")
    ingest_permit(board_path, bucket, "w", kept, unmatched, "board")
    ingest_listing(hospital_path, bucket, "h", kept, unmatched, "hospital")
    ingest_listing(pharmacy_path, bucket, "p", kept, unmatched, "pharmacy")
    dogs, cats = ingest_dogs(dogs_path)

    regions = {}
    for key, rec in bucket.items():
        regions[key] = {k: unique_rows(rec[k]) for k in ("s", "b", "h", "p", "g", "w")}

    payload = {
        "updated": "2026-09-03",
        "regYear": "2022-12",
        "sources": {
            "s": "반려동물판매업체현황 · 영업 중",
            "b": "동물생산업 인허가 · 영업 중",
            "h": "동물병원 전국 목록",
            "p": "동물약국 전국 목록",
            "g": "동물미용업 인허가 · 영업 중",
            "w": "동물위탁관리업 인허가 · 영업 중",
            "d": "농림축산검역본부 행정구역별 반려동물등록(2022-12, 사망 제외)",
        },
        "kept": kept,
        "unmatched": unmatched,
        "dogs": dogs,
        "cats": cats,
        "regions": regions,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("wrote", OUT, "bytes", OUT.stat().st_size)
    print("kept", kept, "unmatched", unmatched, "keys", len(regions), "dogs", len(dogs))
    ykey = "경기도_연천군"
    r = regions.get(ykey, {})
    print("yeoncheon", {k: len(r.get(k, [])) for k in ("s", "b", "h", "p", "g", "w")}, "dogs", dogs.get(ykey))


if __name__ == "__main__":
    main()
