# 아이오펫

Next.js 15 기반 **아이오펫** — 견종·묘종을 품종별로 안내하는 입양 사이트입니다.

**오직 `inchowon58-beep/iopet` 저장소와 `iopet.cattery.co.kr` 로만 배포하세요.**

디어펫(`dearpet`) 및 다른 브랜드와 저장소·Vercel 프로젝트를 절대 섞지 마세요.

| | 아이오펫 | 쓰지 말 것 |
| --- | --- | --- |
| GitHub | `inchowon58-beep/iopet` | `dearpet`, `maincoonmar`, `pupmaincoon` 등 |
| 도메인 | `iopet.cattery.co.kr` | `deatpet.breederclub.co.kr` 및 이전 브랜드 도메인 |
| Vercel | 프로젝트 이름 `iopet` | `dearpet` 등 |

배포 전 `npm run check:deploy-target` 이 origin과 Vercel 이름을 검사합니다.

- `NEXT_PUBLIC_SITE_URL` = `https://iopet.cattery.co.kr`
